import { describe, it, expect } from "vitest";
import { buildStep5Prompt, parseStep5Response } from "../prompts/step5";
import type { ScenarioData } from "../../components/steps/types";
import type { Step5Result } from "../types";

const mockScenario: Pick<ScenarioData, "title" | "userText"> = {
  title: "보험금 지급 심사",
  userText: "보험금을 청구했는데 왜 이렇게 오래 걸리나요?",
};

const mockDraft = "고객님, 청구하신 건에 대해 추가 심사가 필요하며 검토가 필요합니다.";
const mockCitation = "보험업법 제10조";

const fallback: Step5Result = {
  risks: [{ severity: "HIGH", title: "정적 리스크", detail: "정적 상세" }],
  scores: [{ label: "법적 리스크", score: 50, note: "정적 노트" }],
  source: "fallback",
  fallbackReason: "api_error",
};

describe("buildStep5Prompt", () => {
  it("includes the scenario title", () => {
    const prompt = buildStep5Prompt(mockScenario, mockDraft, mockCitation);
    expect(prompt).toContain("보험금 지급 심사");
  });

  it("includes the user text", () => {
    const prompt = buildStep5Prompt(mockScenario, mockDraft, mockCitation);
    expect(prompt).toContain("보험금을 청구했는데 왜 이렇게 오래 걸리나요?");
  });

  it("includes draft when longer than 20 chars", () => {
    const prompt = buildStep5Prompt(mockScenario, mockDraft, mockCitation);
    expect(prompt).toContain(mockDraft);
  });

  it("shows fallback text when draft is undefined", () => {
    const prompt = buildStep5Prompt(mockScenario, undefined, mockCitation);
    expect(prompt).toContain("없음");
  });

  it("shows fallback text when draft is shorter than 20 chars", () => {
    const prompt = buildStep5Prompt(mockScenario, "짧은", mockCitation);
    expect(prompt).toContain("없음");
  });

  it("includes citation when present", () => {
    const prompt = buildStep5Prompt(mockScenario, mockDraft, mockCitation);
    expect(prompt).toContain("보험업법 제10조");
  });

  it("shows '없음' when citation is undefined", () => {
    const prompt = buildStep5Prompt(mockScenario, mockDraft, undefined);
    expect(prompt).toContain("없음");
  });

  it("requests JSON output with risks and scores keys", () => {
    const prompt = buildStep5Prompt(mockScenario, mockDraft, mockCitation);
    expect(prompt).toContain('"risks"');
    expect(prompt).toContain('"scores"');
  });
});

describe("parseStep5Response", () => {
  const validResponse = JSON.stringify({
    risks: [
      { severity: "HIGH", title: "법적 리스크", detail: "상세 설명" },
      { severity: "MINOR", title: "표현 리스크", detail: "상세 설명" },
      { severity: "CRITICAL", title: "고유 리스크", detail: "상세 설명" },
    ],
    scores: [
      { label: "법적 리스크", score: 80, note: "높음" },
      { label: "표현 리스크", score: 40, note: "낮음" },
      { label: "기타", score: 60, note: "중간" },
    ],
  });

  it("returns ai source on valid JSON with risks and scores", () => {
    const result = parseStep5Response(validResponse, fallback);
    expect(result.source).toBe("ai");
    expect(result.risks).toHaveLength(3);
    expect(result.scores).toHaveLength(3);
    expect(result.fallbackReason).toBeUndefined();
  });

  it("returns fallback with empty_response on empty string", () => {
    const result = parseStep5Response("", fallback);
    expect(result.source).toBe("fallback");
    expect(result.fallbackReason).toBe("empty_response");
  });

  it("returns fallback with json_parse_error on invalid JSON", () => {
    const result = parseStep5Response("not json", fallback);
    expect(result.source).toBe("fallback");
    expect(result.fallbackReason).toBe("json_parse_error");
  });

  it("returns fallback with missing_fields when risks is missing", () => {
    const text = JSON.stringify({ scores: [{ label: "a", score: 50, note: "b" }] });
    const result = parseStep5Response(text, fallback);
    expect(result.source).toBe("fallback");
    expect(result.fallbackReason).toBe("missing_fields");
  });

  it("returns fallback with missing_fields when risks is empty array", () => {
    const text = JSON.stringify({ risks: [], scores: [{ label: "a", score: 50, note: "b" }] });
    const result = parseStep5Response(text, fallback);
    expect(result.source).toBe("fallback");
    expect(result.fallbackReason).toBe("missing_fields");
  });

  it("returns fallback with missing_fields when scores is missing", () => {
    const text = JSON.stringify({ risks: [{ severity: "HIGH", title: "a", detail: "b" }] });
    const result = parseStep5Response(text, fallback);
    expect(result.source).toBe("fallback");
    expect(result.fallbackReason).toBe("missing_fields");
  });

  it("returns fallback with missing_fields when scores is empty array", () => {
    const text = JSON.stringify({ risks: [{ severity: "HIGH", title: "a", detail: "b" }], scores: [] });
    const result = parseStep5Response(text, fallback);
    expect(result.source).toBe("fallback");
    expect(result.fallbackReason).toBe("missing_fields");
  });

  it("strips markdown code fences before parsing", () => {
    const text = "```json\n" + validResponse + "\n```";
    const result = parseStep5Response(text, fallback);
    expect(result.source).toBe("ai");
    expect(result.risks).toHaveLength(3);
  });

  it("returns fallback with missing_fields when risks contains non-objects", () => {
    const text = JSON.stringify({ risks: [null, 123, "bad"], scores: [{ label: "a", score: 50, note: "b" }] });
    const result = parseStep5Response(text, fallback);
    expect(result.source).toBe("fallback");
    expect(result.fallbackReason).toBe("missing_fields");
  });

  it("returns fallback with missing_fields when scores contains invalid items", () => {
    const text = JSON.stringify({
      risks: [{ severity: "HIGH", title: "a", detail: "b" }],
      scores: [{ label: "a", score: "not-a-number", note: "b" }],
    });
    const result = parseStep5Response(text, fallback);
    expect(result.source).toBe("fallback");
    expect(result.fallbackReason).toBe("missing_fields");
  });
});
