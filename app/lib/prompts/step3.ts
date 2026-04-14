import type { ScenarioData } from "../../components/steps/types";
import type { Step3Result } from "../types";

export function buildStep3Prompt(
  scenario: Pick<ScenarioData, "title" | "userText" | "submissions">
): string {
  const submissionsText =
    scenario.submissions && scenario.submissions.length > 0
      ? scenario.submissions.join(", ")
      : "없음";

  return `당신은 금융 심사 전문가입니다. 아래 고객 문의를 분석하여 심사 발견사항을 도출하세요.

시나리오: ${scenario.title}
고객 문의: ${scenario.userText}
제출 서류: ${submissionsText}

지침:
- findings: 최소 3개, 최대 5개 항목, 각 항목은 정확히 1문장
- summary: 전체 요약 정확히 1문장
- 한국어 작성
- 반드시 JSON만 반환. 설명, 마크다운, 코드 블록 절대 금지.

{"findings": ["..."], "summary": "..."}`;
}

export function parseStep3Response(text: string, fallback: Step3Result): Step3Result {
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

  const p = parsed as Record<string, unknown>;
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !Array.isArray(p.findings) ||
    (p.findings as unknown[]).length === 0 ||
    typeof p.summary !== "string" ||
    p.summary === ""
  ) {
    return { ...fallback, source: "fallback", fallbackReason: "missing_fields" };
  }

  return {
    findings: p.findings as string[],
    summary: p.summary as string,
    source: "ai",
  };
}
