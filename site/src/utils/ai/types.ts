export type SkillImportance = "high" | "medium" | "low";

export type MatchedSkill = {
  /** A requirement / skill the candidate already demonstrates */
  skill: string;
  /** Where in the CV this is evidenced */
  evidence: string;
};

export type MissingSkill = {
  /** A requirement / skill the candidate is missing or under-selling */
  skill: string;
  importance: SkillImportance;
  /** Concrete, actionable advice on how to address the gap */
  how_to_address: string;
};

export type AnalysisResult = {
  /** Overall fit, 0–100 */
  score: number;
  /** Honest one/two sentence summary of the fit */
  verdict: string;
  /** The core things this role is really about / what the employer most wants */
  core_points: string[];
  /** Strengths the candidate already has for this role */
  matched: MatchedSkill[];
  /** Gaps, sorted by importance */
  missing: MissingSkill[];
  /** Important keywords from the job description (useful for ATS) */
  keywords: string[];
  /** Actionable recommendations to improve the match */
  recommendations: string[];
};

export type TailorResult = {
  /** The tailored CV as Markdown, in the app's resume format */
  markdown: string;
};

export type CompletionRequest = {
  system: string;
  user: string;
  /** Ask the provider for a strict JSON object response */
  json: boolean;
  maxTokens: number;
};
