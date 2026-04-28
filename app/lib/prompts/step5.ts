import type { ScenarioData } from "../../components/steps/types";
import type { Step5Result } from "../types";

export function buildStep5Prompt(
  scenario: Pick<ScenarioData, "title" | "userText">,
  draft: string | undefined,
  citation: string | undefined
): string {
  const draftText =
    draft && draft.trim().length > 20
      ? draft
      : "없음 — 원본 고객 문의 기준으로 리스크 추론";
  const citationText = citation || "없음";

  return `당신은 금융 컴플라이언스 전문가입니다. 고객 안내 문구의 법적 리스크를 검토하세요.

시나리오: ${scenario.title}
원본 고객 문의: ${scenario.userText}
검토 초안: ${draftText}
인용 조항: ${citationText}

지침:
- risks: 최소 3개, 최대 5개 (severity: CRITICAL/HIGH/MINOR), 시나리오 고유 리스크 정확히 1개 포함
- scores: 최소 3개, 최대 5개 (label, score 0~100 정수, note)
- 초안이 없으면 원본 문의 맥락에서 예상 리스크 도출
- 한국어 작성
- 반드시 JSON만 반환. 설명, 마크다운, 코드 블록 절대 금지.

{"risks": [{"severity": "HIGH", "title": "...", "detail": "..."}], "scores": [{"label": "...", "score": 75, "note": "..."}]}`;
}

export function parseStep5Response(text: string, fallback: Step5Result): Step5Result {
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
  const risksValid =
    Array.isArray(p.risks) &&
    (p.risks as unknown[]).length > 0 &&
    (p.risks as unknown[]).every(
      (r) =>
        typeof r === "object" &&
        r !== null &&
        typeof (r as Record<string, unknown>).severity === "string" &&
        typeof (r as Record<string, unknown>).title === "string" &&
        typeof (r as Record<string, unknown>).detail === "string"
    );
  const scoresValid =
    Array.isArray(p.scores) &&
    (p.scores as unknown[]).length > 0 &&
    (p.scores as unknown[]).every(
      (s) =>
        typeof s === "object" &&
        s !== null &&
        typeof (s as Record<string, unknown>).label === "string" &&
        typeof (s as Record<string, unknown>).score === "number" &&
        typeof (s as Record<string, unknown>).note === "string"
    );
  if (typeof parsed !== "object" || parsed === null || !risksValid || !scoresValid) {
    return { ...fallback, source: "fallback", fallbackReason: "missing_fields" };
  }

  return {
    risks: p.risks as Step5Result["risks"],
    scores: p.scores as Step5Result["scores"],
    source: "ai",
  };
}
