// Oh My CV — AI proxy Edge Function (optional, "later" Supabase setup).
//
// Holds the AI provider key server-side so it never ships to the browser.
// The app talks to this function when AI Settings is in "Supabase proxy" mode;
// the request/response shape matches the browser-direct client in
// site/src/utils/ai/index.ts.
//
// Deploy:
//   supabase functions deploy cv-ai --no-verify-jwt
// Secrets (set in the dashboard or CLI):
//   supabase secrets set ANTHROPIC_API_KEY=...   # for provider "anthropic"
//   supabase secrets set OPENROUTER_API_KEY=...  # for provider "openrouter"
//   supabase secrets set APP_ACCESS_CODE=...     # optional shared gate

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

type Provider = "anthropic" | "openrouter";

type CompleteBody = {
  action: "complete";
  provider: Provider;
  system: string;
  user: string;
  json?: boolean;
  maxTokens?: number;
  // model is optional; falls back to a sensible default per provider
  model?: string;
};

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-access-code",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "content-type": "application/json" }
  });

const callAnthropic = async (b: CompleteBody): Promise<string> => {
  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) throw new Error("ANTHROPIC_API_KEY is not configured on the server.");

  const messages: Array<{ role: string; content: string }> = [
    { role: "user", content: b.user }
  ];
  if (b.json) messages.push({ role: "assistant", content: "{" });

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: b.model || "claude-sonnet-4-6",
      max_tokens: b.maxTokens ?? 2000,
      system: b.system,
      messages
    })
  });

  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${await res.text()}`);

  const data = await res.json();
  const out = (data?.content ?? []).map((c: { text?: string }) => c?.text ?? "").join("");

  return b.json ? `{${out}` : out;
};

const callOpenRouter = async (b: CompleteBody): Promise<string> => {
  const key = Deno.env.get("OPENROUTER_API_KEY");
  if (!key) throw new Error("OPENROUTER_API_KEY is not configured on the server.");

  const body: Record<string, unknown> = {
    model: b.model || "openai/gpt-4o-mini",
    max_tokens: b.maxTokens ?? 2000,
    messages: [
      { role: "system", content: b.system },
      { role: "user", content: b.user }
    ]
  };
  if (b.json) body.response_format = { type: "json_object" };

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${key}`,
      "X-Title": "Oh My CV"
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) throw new Error(`OpenRouter ${res.status}: ${await res.text()}`);

  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? "";
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST")
    return json({ error: { message: "Method not allowed" } }, 405);

  // Optional shared-secret gate
  const expected = Deno.env.get("APP_ACCESS_CODE");
  if (expected && req.headers.get("x-access-code") !== expected)
    return json({ error: { message: "Invalid access code" } }, 403);

  let body: CompleteBody;
  try {
    body = await req.json();
  } catch {
    return json({ error: { message: "Invalid JSON body" } }, 400);
  }

  if (body.action !== "complete")
    return json({ error: { message: `Unknown action: ${body.action}` } }, 400);

  try {
    const text =
      body.provider === "openrouter"
        ? await callOpenRouter(body)
        : await callAnthropic(body);

    return json({ text });
  } catch (e) {
    return json({ error: { message: e instanceof Error ? e.message : String(e) } }, 502);
  }
});
