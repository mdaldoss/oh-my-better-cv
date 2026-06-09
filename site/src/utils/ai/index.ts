import { useAiSettingsStore } from "~/composables/stores/aiSettings";
import {
  ANALYZE_SYSTEM,
  buildAnalyzeUser,
  TAILOR_SYSTEM,
  buildTailorUser
} from "./prompts";
import type {
  AnalysisResult,
  CompletionRequest,
  MatchedSkill,
  MissingSkill,
  SkillImportance,
  TailorResult
} from "./types";

export type { AnalysisResult, MatchedSkill, MissingSkill, TailorResult } from "./types";

const ANTHROPIC_ENDPOINT = "https://api.anthropic.com/v1/messages";
const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

type JsonObject = Record<string, unknown>;

/** A user-friendly error thrown by the AI service. */
export class AiError extends Error {}

const isObject = (value: unknown): value is JsonObject =>
  typeof value === "object" && value !== null;

const asRecord = (value: unknown): JsonObject => (isObject(value) ? value : {});

const asString = (value: unknown): string =>
  typeof value === "string" ? value : value == null ? "" : String(value);

const asArray = <T>(value: unknown, map: (item: unknown) => T): T[] =>
  Array.isArray(value) ? value.map(map).filter(Boolean) : [];

const asImportance = (value: unknown): SkillImportance =>
  value === "high" || value === "medium" || value === "low" ? value : "medium";

/** Pull the first balanced JSON object out of a string, tolerating stray prose. */
const extractJson = (text: string): unknown => {
  const trimmed = text.trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    // fall through to brace extraction
  }

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");

  if (start !== -1 && end > start) {
    try {
      return JSON.parse(trimmed.slice(start, end + 1));
    } catch {
      // fall through
    }
  }

  throw new AiError("The AI response was not valid JSON. Please try again.");
};

/** Remove surrounding ```markdown / ``` fences a model sometimes adds. */
const stripCodeFence = (text: string): string => {
  const trimmed = text.trim();
  const match = trimmed.match(/^```(?:markdown|md)?\s*\n([\s\S]*?)\n```$/);
  return (match ? match[1] : trimmed).trim();
};

/** Coerce a raw parsed value into a well-formed AnalysisResult. */
const normalizeAnalysis = (raw: unknown): AnalysisResult => {
  const obj = asRecord(raw);
  const score = Math.max(0, Math.min(100, Math.round(Number(obj.score) || 0)));

  return {
    score,
    verdict: asString(obj.verdict),
    core_points: asArray<string>(obj.core_points, asString),
    matched: asArray<MatchedSkill>(obj.matched, (item) => {
      const m = asRecord(item);
      return { skill: asString(m.skill), evidence: asString(m.evidence) };
    }).filter((m) => m.skill),
    missing: asArray<MissingSkill>(obj.missing, (item) => {
      const m = asRecord(item);
      return {
        skill: asString(m.skill),
        importance: asImportance(m.importance),
        how_to_address: asString(m.how_to_address)
      };
    }).filter((m) => m.skill),
    keywords: asArray<string>(obj.keywords, asString).filter(Boolean),
    recommendations: asArray<string>(obj.recommendations, asString).filter(Boolean)
  };
};

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

class AiService {
  private get settings() {
    return useAiSettingsStore().settings;
  }

  /** Honest, structured assessment of the CV against a job description. */
  public async analyze(
    masterCv: string,
    jobDescription: string
  ): Promise<AnalysisResult> {
    const text = await this._complete({
      system: ANALYZE_SYSTEM,
      user: buildAnalyzeUser(masterCv, jobDescription),
      json: true,
      maxTokens: 2000
    });

    return normalizeAnalysis(extractJson(text));
  }

  /** Produce a tailored CV (Markdown) highlighting the most relevant experience. */
  public async tailor(
    masterCv: string,
    jobDescription: string,
    analysis: AnalysisResult | null = null
  ): Promise<TailorResult> {
    const text = await this._complete({
      system: TAILOR_SYSTEM,
      user: buildTailorUser(masterCv, jobDescription, analysis),
      json: false,
      maxTokens: 4000
    });

    const markdown = stripCodeFence(text);

    if (!markdown) throw new AiError("The AI returned an empty CV. Please try again.");

    return { markdown };
  }

  private async _complete(req: CompletionRequest): Promise<string> {
    const { mode, provider } = this.settings;

    if (mode === "supabase") return this._supabase(req);
    if (provider === "anthropic") return this._anthropic(req);
    return this._openrouter(req);
  }

  private async _anthropic(req: CompletionRequest): Promise<string> {
    const s = this.settings;

    if (!s.anthropicKey)
      throw new AiError("Add your Anthropic API key in AI Settings first.");

    const messages: ChatMessage[] = [{ role: "user", content: req.user }];
    // Prefill an opening brace so the model is forced to emit a JSON object.
    if (req.json) messages.push({ role: "assistant", content: "{" });

    const res = await fetch(ANTHROPIC_ENDPOINT, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": s.anthropicKey,
        "anthropic-version": "2023-06-01",
        // Required to call the API directly from a browser.
        "anthropic-dangerous-direct-browser-access": "true"
      },
      body: JSON.stringify({
        model: s.anthropicModel || "claude-sonnet-4-6",
        max_tokens: req.maxTokens,
        system: req.system,
        messages
      })
    });

    if (!res.ok) throw await this._httpError(res, "Anthropic");

    const data = await res.json();
    const blocks: Array<{ text?: string }> = Array.isArray(data?.content)
      ? data.content
      : [];
    const out = blocks.map((block) => block?.text ?? "").join("");

    // Re-attach the prefilled brace that the assistant continued from.
    return req.json ? `{${out}` : out;
  }

  private async _openrouter(req: CompletionRequest): Promise<string> {
    const s = this.settings;

    if (!s.openrouterKey)
      throw new AiError("Add your OpenRouter API key in AI Settings first.");

    const body: JsonObject = {
      model: s.openrouterModel || "openai/gpt-4o-mini",
      max_tokens: req.maxTokens,
      messages: [
        { role: "system", content: req.system },
        { role: "user", content: req.user }
      ]
    };

    if (req.json) body.response_format = { type: "json_object" };

    const headers: Record<string, string> = {
      "content-type": "application/json",
      authorization: `Bearer ${s.openrouterKey}`,
      "X-Title": "Oh My CV"
    };
    if (typeof location !== "undefined") headers["HTTP-Referer"] = location.origin;

    const res = await fetch(OPENROUTER_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });

    if (!res.ok) throw await this._httpError(res, "OpenRouter");

    const data = await res.json();
    return asString(data?.choices?.[0]?.message?.content);
  }

  /**
   * Call a Supabase Edge Function proxy that holds the provider key server-side.
   * The function isn't deployed in the local-only build — this is the seam we
   * flip on later.
   */
  private async _supabase(req: CompletionRequest): Promise<string> {
    const s = this.settings;

    if (!s.supabaseUrl || !s.supabaseAnonKey)
      throw new AiError("Add your Supabase project URL and anon key in AI Settings.");

    const url = `${s.supabaseUrl.replace(/\/+$/, "")}/functions/v1/cv-ai`;

    const headers: Record<string, string> = {
      "content-type": "application/json",
      authorization: `Bearer ${s.supabaseAnonKey}`,
      apikey: s.supabaseAnonKey
    };
    if (s.accessCode) headers["x-access-code"] = s.accessCode;

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        action: "complete",
        provider: s.provider,
        system: req.system,
        user: req.user,
        json: req.json,
        maxTokens: req.maxTokens
      })
    });

    if (!res.ok) throw await this._httpError(res, "Supabase");

    const data = await res.json();
    return asString(data?.text);
  }

  private async _httpError(res: Response, label: string): Promise<AiError> {
    let detail = "";

    try {
      const json = await res.json();
      detail = asString(json?.error?.message) || JSON.stringify(json?.error ?? json);
    } catch {
      try {
        detail = await res.text();
      } catch {
        detail = "";
      }
    }

    if (res.status === 401 || res.status === 403)
      return new AiError(`${label}: authentication failed. Check your API key.`);

    return new AiError(`${label} request failed (${res.status}). ${detail}`.trim());
  }
}

export const aiService = new AiService();
