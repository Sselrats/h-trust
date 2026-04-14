import { describe, it, expect } from "vitest";
import { buildStep3Prompt, parseStep3Response } from "../prompts/step3";
import type { ScenarioData } from "../../components/steps/types";
import type { Step3Result } from "../types";

const mockScenario: Pick<ScenarioData, "title" | "userText" | "submissions"> = {
  title: "보험금 지급 심사",
  userText: "보험금을 청구했는데 왜 이렇게 오래 걸리나요?",
  submissions: ["진단서", "영수증"],
};

const fallback: Step3Result = {
  findings: ["FALLBACK_FINDING"],
  summary: "정적 요약",
  source: "fallback",
  fallbackReason: "api_error",
};

describe("buildStep3Prompt", () => {
  it("includes the scenario title", () => {
    const prompt = buildStep3Prompt(mockScenario);
    expect(prompt).toContain("보험금 지급 심사");
  });

  it("includes the user text", () => {
    const prompt = buildStep3Prompt(mockScenario);
    expect(prompt).toContain("보험금을 청구했는데 왜 이렇게 오래 걸리나요?");
  });

  it("includes submissions when present", () => {
    const prompt = buildStep3Prompt(mockScenario);
    expect(prompt).toContain("진단서");
    expect(prompt).toContain("영수증");
  });

  it("renders '없음' when submissions is empty array", () => {
    const prompt = buildStep3Prompt({ ...mockScenario, submissions: [] });
    expect(prompt).toContain("없음");
  });

  it("renders '없음' when submissions is undefined", () => {
    const prompt = buildStep3Prompt({ ...mockScenario, submissions: undefined as unknown as string[] });
    expect(prompt).toContain("없음");
  });

  it("requests JSON output with findings and summary keys", () => {
    const prompt = buildStep3Prompt(mockScenario);
    expect(prompt).toContain('"findings"');
    expect(prompt).toContain('"summary"');
  });
});

describe("parseStep3Response", () => {
  it("returns ai source on valid JSON with findings and summary", () => {
    const text = JSON.stringify({ findings: ["발견1", "발견2", "발견3"], summary: "요약입니다." });
    const result = parseStep3Response(text, fallback);
    expect(result.source).toBe("ai");
    expect(result.findings).toEqual(["발견1", "발견2", "발견3"]);
    expect(result.summary).toBe("요약입니다.");
    expect(result.fallbackReason).toBeUndefined();
  });

  it("returns fallback with empty_response on empty string", () => {
    const result = parseStep3Response("", fallback);
    expect(result.source).toBe("fallback");
    expect(result.fallbackReason).toBe("empty_response");
  });

  it("returns fallback with json_parse_error on invalid JSON", () => {
    const result = parseStep3Response("not json", fallback);
    expect(result.source).toBe("fallback");
    expect(result.fallbackReason).toBe("json_parse_error");
  });

  it("returns fallback with missing_fields when findings is missing", () => {
    const text = JSON.stringify({ summary: "요약" });
    const result = parseStep3Response(text, fallback);
    expect(result.source).toBe("fallback");
    expect(result.fallbackReason).toBe("missing_fields");
  });

  it("returns fallback with missing_fields when findings is empty array", () => {
    const text = JSON.stringify({ findings: [], summary: "요약" });
    const result = parseStep3Response(text, fallback);
    expect(result.source).toBe("fallback");
    expect(result.fallbackReason).toBe("missing_fields");
  });

  it("returns fallback with missing_fields when summary is missing", () => {
    const text = JSON.stringify({ findings: ["발견1", "발견2", "발견3"] });
    const result = parseStep3Response(text, fallback);
    expect(result.source).toBe("fallback");
    expect(result.fallbackReason).toBe("missing_fields");
  });

  it("strips markdown code fences before parsing", () => {
    const text = "```json\n{\"findings\":[\"발견1\",\"발견2\",\"발견3\"],\"summary\":\"요약\"}\n```";
    const result = parseStep3Response(text, fallback);
    expect(result.source).toBe("ai");
    expect(result.findings).toEqual(["발견1", "발견2", "발견3"]);
  });

  it("returns fallback with missing_fields when findings contains non-strings", () => {
    const text = JSON.stringify({ findings: [1, 2, 3], summary: "요약" });
    const result = parseStep3Response(text, fallback);
    expect(result.source).toBe("fallback");
    expect(result.fallbackReason).toBe("missing_fields");
  });
});
