import { describe, it, expect } from "vitest";
import { buildStep3Prompt, parseStep3Response } from "../prompts/step3";
import type { ScenarioData } from "../../components/steps/types";
import type { Step3Result } from "../types";

const mockScenario: Pick<ScenarioData, "title"> = {
  title: "보험금 지급 심사",
};

const mockUserText = "보험금을 청구했는데 왜 이렇게 오래 걸리나요?";
const mockAttachments = ["진단서", "영수증"];

const fallback: Step3Result = {
  findings: ["FALLBACK_FINDING"],
  summary: "정적 요약",
  source: "fallback",
  fallbackReason: "api_error",
};

describe("buildStep3Prompt", () => {
  it("includes the scenario title", () => {
    const prompt = buildStep3Prompt(mockScenario, mockUserText, mockAttachments);
    expect(prompt).toContain("보험금 지급 심사");
  });

  it("includes the user text", () => {
    const prompt = buildStep3Prompt(mockScenario, mockUserText, mockAttachments);
    expect(prompt).toContain("보험금을 청구했는데 왜 이렇게 오래 걸리나요?");
  });

  it("includes attachments when present", () => {
    const prompt = buildStep3Prompt(mockScenario, mockUserText, mockAttachments);
    expect(prompt).toContain("진단서");
    expect(prompt).toContain("영수증");
  });

  it("renders '없음' when attachments is empty array", () => {
    const prompt = buildStep3Prompt(mockScenario, mockUserText, []);
    expect(prompt).toContain("없음");
  });

  it("renders '없음' when attachments is undefined-like (empty)", () => {
    const prompt = buildStep3Prompt(mockScenario, mockUserText, undefined as unknown as string[]);
    expect(prompt).toContain("없음");
  });

  it("requests JSON output with snapshot, findings and summary keys", () => {
    const prompt = buildStep3Prompt(mockScenario, mockUserText, mockAttachments);
    expect(prompt).toContain('"snapshot"');
    expect(prompt).toContain('"findings"');
    expect(prompt).toContain('"summary"');
  });

  it("instructs Fraud Score, Confidence, Attached Type labels", () => {
    const prompt = buildStep3Prompt(mockScenario, mockUserText, mockAttachments);
    expect(prompt).toContain("Fraud Score");
    expect(prompt).toContain("Confidence");
    expect(prompt).toContain("Attached Type");
  });
});

describe("parseStep3Response", () => {
  const validSnapshot = [
    { label: "Fraud Score", value: "0.73 (중간)" },
    { label: "Confidence", value: "0.85" },
    { label: "Attached Type", value: "text + document" },
  ];

  it("returns ai source with snapshot on fully valid JSON", () => {
    const text = JSON.stringify({
      snapshot: validSnapshot,
      findings: ["발견1", "발견2", "발견3"],
      summary: "요약입니다.",
    });
    const result = parseStep3Response(text, fallback);
    expect(result.source).toBe("ai");
    expect(result.findings).toEqual(["발견1", "발견2", "발견3"]);
    expect(result.summary).toBe("요약입니다.");
    expect(result.domainSnapshot).toEqual(validSnapshot);
    expect(result.fallbackReason).toBeUndefined();
  });

  it("returns ai source without domainSnapshot when snapshot is missing", () => {
    const text = JSON.stringify({ findings: ["발견1", "발견2", "발견3"], summary: "요약입니다." });
    const result = parseStep3Response(text, fallback);
    expect(result.source).toBe("ai");
    expect(result.domainSnapshot).toBeUndefined();
  });

  it("returns ai source without domainSnapshot when snapshot items have wrong shape", () => {
    const text = JSON.stringify({
      snapshot: [{ foo: "bar" }, { label: "Confidence" }],
      findings: ["발견1", "발견2", "발견3"],
      summary: "요약",
    });
    const result = parseStep3Response(text, fallback);
    expect(result.source).toBe("ai");
    expect(result.domainSnapshot).toBeUndefined();
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
    const text = JSON.stringify({ snapshot: validSnapshot, summary: "요약" });
    const result = parseStep3Response(text, fallback);
    expect(result.source).toBe("fallback");
    expect(result.fallbackReason).toBe("missing_fields");
  });

  it("returns fallback with missing_fields when findings is empty array", () => {
    const text = JSON.stringify({ snapshot: validSnapshot, findings: [], summary: "요약" });
    const result = parseStep3Response(text, fallback);
    expect(result.source).toBe("fallback");
    expect(result.fallbackReason).toBe("missing_fields");
  });

  it("returns fallback with missing_fields when summary is missing", () => {
    const text = JSON.stringify({ snapshot: validSnapshot, findings: ["발견1", "발견2", "발견3"] });
    const result = parseStep3Response(text, fallback);
    expect(result.source).toBe("fallback");
    expect(result.fallbackReason).toBe("missing_fields");
  });

  it("strips markdown code fences before parsing", () => {
    const text = "```json\n" + JSON.stringify({ snapshot: validSnapshot, findings: ["발견1", "발견2", "발견3"], summary: "요약" }) + "\n```";
    const result = parseStep3Response(text, fallback);
    expect(result.source).toBe("ai");
    expect(result.findings).toEqual(["발견1", "발견2", "발견3"]);
    expect(result.domainSnapshot).toEqual(validSnapshot);
  });

  it("returns fallback with missing_fields when findings contains non-strings", () => {
    const text = JSON.stringify({ snapshot: validSnapshot, findings: [1, 2, 3], summary: "요약" });
    const result = parseStep3Response(text, fallback);
    expect(result.source).toBe("fallback");
    expect(result.fallbackReason).toBe("missing_fields");
  });
});
