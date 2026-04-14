export type FallbackReason =
  | "api_error"
  | "json_parse_error"
  | "empty_response"
  | "missing_fields";

export type Step4Result = {
  draft: string;
  citation: string;
  source: "ai" | "fallback";
  fallbackReason?: FallbackReason;
};
