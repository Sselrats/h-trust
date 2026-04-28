import type { ScenarioData } from "../../components/steps/types";
import type { Step4Result } from "../types";

export function buildStep4Prompt(
  scenario: Pick<ScenarioData, "title" | "userText">,
  findings: string[]
): string {
  const findingsText = findings.length > 0 ? findings.join(", ") : "없음";

  return `당신은 금융 고객 서비스 전문가입니다. 고객 안내 초안을 작성하세요.

시나리오: ${scenario.title}
고객 문의: ${scenario.userText}
Domain AI 분석 결과: ${findingsText}

지침:
- 분석 결과가 없거나 불충분하면 고객 문의를 직접 분석하여 작성
- 단정적 표현 금지 ("거절됩니다" → "검토가 필요합니다")
- 관련 법령 또는 약관 조항 1개 인용 필수
- 한국어 작성
- 반드시 JSON만 반환. 설명, 마크다운, 코드 블록 절대 금지.

{"draft": "...", "citation": "..."}`;
}

export function parseStep4Response(text: string, fallback: Step4Result): Step4Result {
  if (!text || text.trim() === "") {
    return { ...fallback, source: "fallback", fallbackReason: "empty_response" };
  }

  const cleaned = text.trim().replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    return { ...fallback, source: "fallback", fallbackReason: "json_parse_error" };
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    typeof (parsed as Record<string, unknown>).draft !== "string" ||
    typeof (parsed as Record<string, unknown>).citation !== "string"
  ) {
    return { ...fallback, source: "fallback", fallbackReason: "missing_fields" };
  }

  const { draft, citation } = parsed as { draft: string; citation: string };
  return { draft, citation, source: "ai" };
}
