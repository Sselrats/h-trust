import { describe, it, expect } from "vitest";
import { buildStep4Prompt, parseStep4Response } from "../prompts/step4";
import type { ScenarioData } from "../../components/steps/types";
import type { Step4Result } from "../types";

const mockScenario: Pick<ScenarioData, "title" | "userText"> = {
  title: "보험금 지급 심사",
  userText: "보험금을 청구했는데 왜 이렇게 오래 걸리나요?",
};

const mockFindings = ["FRAUD_SCORE_HIGH", "CLAIM_DUPLICATE"];

const fallback: Step4Result = {
  draft: "정적 초안입니다.",
  citation: "보험업법 제00조",
  source: "fallback",
  fallbackReason: "api_error",
};

describe("buildStep4Prompt", () => {
  it("includes the scenario title", () => {
    const prompt = buildStep4Prompt(mockScenario, mockFindings);
    expect(prompt).toContain("보험금 지급 심사");
  });

  it("includes the user text", () => {
    const prompt = buildStep4Prompt(mockScenario, mockFindings);
    expect(prompt).toContain("보험금을 청구했는데 왜 이렇게 오래 걸리나요?");
  });

  it("includes domain findings", () => {
    const prompt = buildStep4Prompt(mockScenario, mockFindings);
    expect(prompt).toContain("FRAUD_SCORE_HIGH");
    expect(prompt).toContain("CLAIM_DUPLICATE");
  });

  it("shows '없음' when findings is empty", () => {
    const prompt = buildStep4Prompt(mockScenario, []);
    expect(prompt).toContain("없음");
  });

  it("requests JSON output", () => {
    const prompt = buildStep4Prompt(mockScenario, mockFindings);
    expect(prompt).toContain('"draft"');
    expect(prompt).toContain('"citation"');
  });
});

describe("parseStep4Response", () => {
  it("returns ai source on valid JSON with draft and citation", () => {
    const text = JSON.stringify({ draft: "안내드립니다.", citation: "제10조" });
    const result = parseStep4Response(text, fallback);
    expect(result.source).toBe("ai");
    expect(result.draft).toBe("안내드립니다.");
    expect(result.citation).toBe("제10조");
    expect(result.fallbackReason).toBeUndefined();
  });

  it("returns fallback with empty_response on empty string", () => {
    const result = parseStep4Response("", fallback);
    expect(result.source).toBe("fallback");
    expect(result.fallbackReason).toBe("empty_response");
  });

  it("returns fallback with json_parse_error on invalid JSON", () => {
    const result = parseStep4Response("not json", fallback);
    expect(result.source).toBe("fallback");
    expect(result.fallbackReason).toBe("json_parse_error");
  });

  it("returns fallback with missing_fields when draft is missing", () => {
    const text = JSON.stringify({ citation: "제10조" });
    const result = parseStep4Response(text, fallback);
    expect(result.source).toBe("fallback");
    expect(result.fallbackReason).toBe("missing_fields");
  });

  it("returns fallback with missing_fields when citation is missing", () => {
    const text = JSON.stringify({ draft: "안내드립니다." });
    const result = parseStep4Response(text, fallback);
    expect(result.source).toBe("fallback");
    expect(result.fallbackReason).toBe("missing_fields");
  });

  it("strips markdown code fences before parsing", () => {
    const text = "```json\n{\"draft\":\"안내\",\"citation\":\"제1조\"}\n```";
    const result = parseStep4Response(text, fallback);
    expect(result.source).toBe("ai");
    expect(result.draft).toBe("안내");
  });
});
