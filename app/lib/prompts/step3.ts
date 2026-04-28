import type { ScenarioData } from "../../components/steps/types";
import type { Step3Result } from "../types";

export function buildStep3Prompt(
  scenario: Pick<ScenarioData, "title">,
  userText: string,
  attachments: string[],
): string {
  const attachmentsText =
    attachments && attachments.length > 0 ? attachments.join(", ") : "없음";

  return `당신은 금융 심사 AI입니다. 아래 고객 문의를 분석하여 도메인 심사 결과를 반환하세요.

시나리오: ${scenario.title}
고객 문의: ${userText}
제출 서류: ${attachmentsText}

지침:
- snapshot[0] label "Fraud Score": 0.00~1.00 숫자와 괄호 안에 낮음/중간/높음, 예) "0.73 (중간)"
- snapshot[1] label "Confidence": 0.00~1.00 숫자만, 예) "0.85"
- snapshot[2] label "Attached Type": 제출 서류 기반으로 "text only", "text + document", "text + document + image" 중 선택
- findings: 최소 3개, 최대 5개 항목, 각 항목은 정확히 1문장, 한국어
- summary: 전체 요약 정확히 1문장, 한국어
- 반드시 JSON만 반환. 설명, 마크다운, 코드 블록 절대 금지.

{"snapshot":[{"label":"Fraud Score","value":"..."},{"label":"Confidence","value":"..."},{"label":"Attached Type","value":"..."}],"findings":["..."],"summary":"..."}`;
}

type SnapshotItem = { label: string; value: string };

function isSnapshotItem(item: unknown): item is SnapshotItem {
  if (typeof item !== "object" || item === null) return false;
  const i = item as Record<string, unknown>;
  return typeof i.label === "string" && typeof i.value === "string";
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
    !(p.findings as unknown[]).every((f) => typeof f === "string") ||
    typeof p.summary !== "string" ||
    p.summary === ""
  ) {
    return { ...fallback, source: "fallback", fallbackReason: "missing_fields" };
  }

  const snapshotValid =
    Array.isArray(p.snapshot) &&
    (p.snapshot as unknown[]).length > 0 &&
    (p.snapshot as unknown[]).every(isSnapshotItem);

  return {
    findings: p.findings as string[],
    summary: p.summary as string,
    domainSnapshot: snapshotValid ? (p.snapshot as SnapshotItem[]) : undefined,
    source: "ai",
  };
}
