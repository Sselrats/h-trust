export type FallbackReason =
  | "api_error"
  | "json_parse_error"
  | "empty_response"
  | "missing_fields";

export type Step3Result = {
  findings: string[];
  summary: string;
  domainSnapshot?: Array<{ label: string; value: string }>;
  source: "ai" | "fallback";
  fallbackReason?: FallbackReason;
};

export type Step4Result = {
  draft: string;
  citation: string;
  source: "ai" | "fallback";
  fallbackReason?: FallbackReason;
};

export type Step5Result = {
  risks: Array<{ severity: "CRITICAL" | "HIGH" | "MINOR"; title: string; detail: string }>;
  scores: Array<{ label: string; score: number; note: string }>;
  source: "ai" | "fallback";
  fallbackReason?: FallbackReason;
};
