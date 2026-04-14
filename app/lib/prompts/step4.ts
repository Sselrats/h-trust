import type { ScenarioData } from "../../components/steps/types";
import type { Step4Result } from "../types";

export function buildStep4Prompt(scenario: Pick<ScenarioData, "title" | "userText" | "domainFindings">): string {
  return `당신은 금융 고객 서비스 전문가입니다. 아래 정보를 바탕으로 고객 안내 초안을 작성하세요.

## 시나리오 유형
${scenario.title}

## 고객 문의 내용
${scenario.userText}

## Domain AI 분석 결과
${scenario.domainFindings.join(", ")}

## 작성 지침
- 단정적 표현 금지 (예: "거절됩니다" → "검토가 필요할 수 있습니다")
- 고객 친화적 문체 사용
- 관련 법령 또는 약관 조항 1개 인용 필수
- 한국어로 작성

## 응답 형식 (JSON만 반환, 다른 텍스트 금지)
{"draft": "고객 안내 문구", "citation": "인용 조항"}`;
}

export function parseStep4Response(text: string, fallback: Step4Result): Step4Result {
  if (!text || text.trim() === "") {
    return { ...fallback, source: "fallback", fallbackReason: "empty_response" };
  }

  // Strip markdown code fences if present
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
