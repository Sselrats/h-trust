# LLM Pipeline Steps 3, 4, 5 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace static data returns in Steps 3 and 5 with real Gemini LLM calls, and wire the live output of each step as input to the next.

**Architecture:** Each step calls `POST /api/pipeline/[step]` which runs a Gemini `gemini-2.5-flash` prompt and returns structured JSON. Steps 3→4 and 4→5 pass results forward via the request body. All steps have robust fallbacks to static scenario data.

**Tech Stack:** Next.js 14 App Router, `@google/generative-ai`, TypeScript, Vitest

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `app/lib/types.ts` | Add `Step3Result`, `Step5Result` types |
| Create | `app/lib/prompts/step3.ts` | `buildStep3Prompt`, `parseStep3Response` |
| Modify | `app/lib/prompts/step4.ts` | Change signature: accept `findings: string[]` param; update prompt text |
| Create | `app/lib/prompts/step5.ts` | `buildStep5Prompt`, `parseStep5Response` |
| Create | `app/lib/__tests__/step3-prompts.test.ts` | Tests for step3 prompt module |
| Modify | `app/lib/__tests__/step4-prompts.test.ts` | Update for new `buildStep4Prompt` signature |
| Create | `app/lib/__tests__/step5-prompts.test.ts` | Tests for step5 prompt module |
| Modify | `app/api/pipeline/[step]/route.ts` | Cases 3, 4, 5 call Gemini; case 4 reads `step3Findings`; case 5 reads `step4Draft`/`step4Citation` |
| Modify | `app/lib/pipeline.ts` | New `runStep` signature with `opts`; cases 3 and 5 call API; update `StepResult` union |
| Modify | `app/components/steps/Step3DomainAI.tsx` | Accept optional `findings?`/`summary?` props; render LLM output when available |
| Modify | `app/components/steps/Step5TrustAgent2.tsx` | Accept optional `risks?`/`scores?` props; render LLM output when available |
| Modify | `app/page.tsx` | Add `step3Result`/`step5Result` state; thread results into downstream calls; pass props |

---

### Task 1: Add Step3Result and Step5Result types

**Files:**
- Modify: `app/lib/types.ts`

- [ ] **Step 1: Update types.ts**

Replace the full file with:

```ts
export type FallbackReason =
  | "api_error"
  | "json_parse_error"
  | "empty_response"
  | "missing_fields";

export type Step3Result = {
  findings: string[];
  summary: string;
  source: "ai" | "fallback";
  fallbackReason?: FallbackReason;
};

export type Step4Result = {
  draft: string;
  citation: string;
  source: "ai" | "fallback";
  fallbackReason?: FallbackReason;
};

export type Step5Result = {
  risks: Array<{ severity: "CRITICAL" | "HIGH" | "MINOR"; title: string; detail: string }>;
  scores: Array<{ label: string; score: number; note: string }>;
  source: "ai" | "fallback";
  fallbackReason?: FallbackReason;
};
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd h-trust && npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add app/lib/types.ts
git commit -m "feat: add Step3Result and Step5Result types"
```

---

### Task 2: Create step3 prompt module (TDD)

**Files:**
- Create: `app/lib/prompts/step3.ts`
- Create: `app/lib/__tests__/step3-prompts.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `app/lib/__tests__/step3-prompts.test.ts`:

```ts
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
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd h-trust && npm test -- step3-prompts
```
Expected: FAIL — `Cannot find module '../prompts/step3'`

- [ ] **Step 3: Create step3.ts**

Create `app/lib/prompts/step3.ts`:

```ts
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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd h-trust && npm test -- step3-prompts
```
Expected: all 13 tests PASS

- [ ] **Step 5: Commit**

```bash
git add app/lib/prompts/step3.ts app/lib/__tests__/step3-prompts.test.ts
git commit -m "feat: add step3 prompt module with tests"
```

---

### Task 3: Update step4 prompt module

**Files:**
- Modify: `app/lib/prompts/step4.ts`
- Modify: `app/lib/__tests__/step4-prompts.test.ts`

- [ ] **Step 1: Update the test first**

Replace `app/lib/__tests__/step4-prompts.test.ts` with:

```ts
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd h-trust && npm test -- step4-prompts
```
Expected: FAIL — `buildStep4Prompt` called with wrong arity

- [ ] **Step 3: Update step4.ts**

Replace `app/lib/prompts/step4.ts` with:

```ts
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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd h-trust && npm test -- step4-prompts
```
Expected: all 11 tests PASS

- [ ] **Step 5: Commit**

```bash
git add app/lib/prompts/step4.ts app/lib/__tests__/step4-prompts.test.ts
git commit -m "feat: update step4 prompt to accept findings param"
```

---

### Task 4: Create step5 prompt module (TDD)

**Files:**
- Create: `app/lib/prompts/step5.ts`
- Create: `app/lib/__tests__/step5-prompts.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `app/lib/__tests__/step5-prompts.test.ts`:

```ts
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
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd h-trust && npm test -- step5-prompts
```
Expected: FAIL — `Cannot find module '../prompts/step5'`

- [ ] **Step 3: Create step5.ts**

Create `app/lib/prompts/step5.ts`:

```ts
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
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !Array.isArray(p.risks) ||
    (p.risks as unknown[]).length === 0 ||
    !Array.isArray(p.scores) ||
    (p.scores as unknown[]).length === 0
  ) {
    return { ...fallback, source: "fallback", fallbackReason: "missing_fields" };
  }

  return {
    risks: p.risks as Step5Result["risks"],
    scores: p.scores as Step5Result["scores"],
    source: "ai",
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd h-trust && npm test -- step5-prompts
```
Expected: all 16 tests PASS

- [ ] **Step 5: Run all tests to confirm no regressions**

```bash
cd h-trust && npm test
```
Expected: all tests PASS

- [ ] **Step 6: Commit**

```bash
git add app/lib/prompts/step5.ts app/lib/__tests__/step5-prompts.test.ts
git commit -m "feat: add step5 prompt module with tests"
```

---

### Task 5: Update API route — cases 3, 4, 5

**Files:**
- Modify: `app/api/pipeline/[step]/route.ts`

- [ ] **Step 1: Replace route.ts**

Replace the full file content of `app/api/pipeline/[step]/route.ts` with:

```ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { scenarioMap } from "../../../components/steps/data";
import type { ScenarioKey } from "../../../components/steps/types";
import type { Step3Result, Step4Result, Step5Result } from "../../../lib/types";
import { buildStep3Prompt, parseStep3Response } from "../../../lib/prompts/step3";
import { buildStep4Prompt, parseStep4Response } from "../../../lib/prompts/step4";
import { buildStep5Prompt, parseStep5Response } from "../../../lib/prompts/step5";

const VALID_STEPS = ["3", "4", "5", "6"] as const;
type ValidStep = (typeof VALID_STEPS)[number];

function getModel(apiKey: string) {
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { step: string } },
) {
  const { step } = params;

  if (!VALID_STEPS.includes(step as ValidStep)) {
    return NextResponse.json({ error: "Invalid step" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const scenarioKey = body?.scenarioKey as ScenarioKey | undefined;

  if (!scenarioKey || !(scenarioKey in scenarioMap)) {
    return NextResponse.json({ error: "Invalid scenarioKey" }, { status: 400 });
  }

  const s = scenarioMap[scenarioKey];
  const apiKey = process.env.GEMINI_API_KEY;

  switch (step as ValidStep) {
    case "3": {
      const staticFallback: Step3Result = {
        findings: s.domainFindings,
        summary: "",
        source: "fallback",
        fallbackReason: "api_error",
      };
      if (!apiKey) return NextResponse.json(staticFallback);
      try {
        const model = getModel(apiKey);
        const prompt = buildStep3Prompt(s);
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return NextResponse.json(parseStep3Response(text, staticFallback));
      } catch (err) {
        console.error("[Step3] Gemini error:", err);
        return NextResponse.json(staticFallback);
      }
    }

    case "4": {
      const step3Findings = Array.isArray(body?.step3Findings)
        ? (body.step3Findings as string[])
        : [];
      const staticFallback: Step4Result = {
        draft: s.trustDraft,
        citation: s.citation,
        source: "fallback",
        fallbackReason: "api_error",
      };
      if (!apiKey) return NextResponse.json(staticFallback);
      try {
        const model = getModel(apiKey);
        const prompt = buildStep4Prompt(s, step3Findings);
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return NextResponse.json(parseStep4Response(text, staticFallback));
      } catch (err) {
        console.error("[Step4] Gemini error:", err);
        return NextResponse.json(staticFallback);
      }
    }

    case "5": {
      const step4Draft = typeof body?.step4Draft === "string" ? body.step4Draft : undefined;
      const step4Citation = typeof body?.step4Citation === "string" ? body.step4Citation : undefined;
      const staticFallback: Step5Result = {
        risks: s.redTeamRisks,
        scores: s.riskScores,
        source: "fallback",
        fallbackReason: "api_error",
      };
      if (!apiKey) return NextResponse.json(staticFallback);
      try {
        const model = getModel(apiKey);
        const prompt = buildStep5Prompt(s, step4Draft, step4Citation);
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return NextResponse.json(parseStep5Response(text, staticFallback));
      } catch (err) {
        console.error("[Step5] Gemini error:", err);
        return NextResponse.json(staticFallback);
      }
    }

    case "6":
      return NextResponse.json({ outcome: s.humanOutcome });
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd h-trust && npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add app/api/pipeline/\[step\]/route.ts
git commit -m "feat: wire Gemini LLM into pipeline API cases 3 and 5"
```

---

### Task 6: Update pipeline.ts

**Files:**
- Modify: `app/lib/pipeline.ts`

- [ ] **Step 1: Replace pipeline.ts**

Replace the full file content of `app/lib/pipeline.ts` with:

```ts
import { scenarioMap } from "../components/steps/data";
import type { ScenarioData, ScenarioKey } from "../components/steps/types";
import type { Step3Result, Step4Result, Step5Result } from "./types";

export type StepResult =
  | ({ step: 3 } & Step3Result)
  | ({ step: 4 } & Step4Result)
  | ({ step: 5 } & Step5Result)
  | { step: 6; outcome: ScenarioData["humanOutcome"] };

export async function runStep(
  step: 3 | 4 | 5 | 6,
  scenarioKey: ScenarioKey,
  opts?: { step3Findings?: string[]; step4Draft?: string; step4Citation?: string }
): Promise<StepResult> {
  const s = scenarioMap[scenarioKey];

  if (step === 3) {
    const fallback: Step3Result = {
      findings: s.domainFindings,
      summary: "",
      source: "fallback",
      fallbackReason: "api_error",
    };
    try {
      const res = await fetch("/api/pipeline/3", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioKey }),
      });
      if (!res.ok) return { step: 3, ...fallback };
      const data = await res.json();
      return { step: 3, ...data };
    } catch {
      return { step: 3, ...fallback };
    }
  }

  if (step === 4) {
    const fallback: Step4Result = {
      draft: s.trustDraft,
      citation: s.citation,
      source: "fallback",
      fallbackReason: "api_error",
    };
    try {
      const res = await fetch("/api/pipeline/4", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioKey, step3Findings: opts?.step3Findings ?? [] }),
      });
      if (!res.ok) return { step: 4, ...fallback };
      const data = await res.json();
      return { step: 4, ...data };
    } catch {
      return { step: 4, ...fallback };
    }
  }

  if (step === 5) {
    const fallback: Step5Result = {
      risks: s.redTeamRisks,
      scores: s.riskScores,
      source: "fallback",
      fallbackReason: "api_error",
    };
    try {
      const res = await fetch("/api/pipeline/5", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioKey,
          step4Draft: opts?.step4Draft,
          step4Citation: opts?.step4Citation,
        }),
      });
      if (!res.ok) return { step: 5, ...fallback };
      const data = await res.json();
      return { step: 5, ...data };
    } catch {
      return { step: 5, ...fallback };
    }
  }

  // step === 6
  await new Promise((resolve) => setTimeout(resolve, 1600));
  return { step: 6, outcome: s.humanOutcome };
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd h-trust && npx tsc --noEmit
```
Expected: no errors (there will be errors from page.tsx until Task 9 — that's okay, fix in Task 9)

- [ ] **Step 3: Commit**

```bash
git add app/lib/pipeline.ts
git commit -m "feat: update pipeline runStep to thread step3/4 results forward"
```

---

### Task 7: Update Step3DomainAI component

**Files:**
- Modify: `app/components/steps/Step3DomainAI.tsx`

- [ ] **Step 1: Replace Step3DomainAI.tsx**

Replace the full file content of `app/components/steps/Step3DomainAI.tsx` with:

```tsx
import type { ScenarioData } from "./types";

type Props = {
  scenario: ScenarioData;
  ready: boolean;
  showNext: boolean;
  nextDisabled: boolean;
  onNext: () => void;
  findings?: string[];
  summary?: string;
};

export default function Step3DomainAI({ scenario, ready, showNext, nextDisabled, onNext, findings, summary }: Props) {
  const displayFindings = findings ?? scenario.domainFindings;

  return (
    <article className="rounded-2xl border border-slate-300 bg-slate-950 p-5 text-white shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Step 3</p>
          <h3 className="mt-1 font-[var(--font-manrope)] text-xl font-semibold">Domain AI 분석</h3>
        </div>
        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-200">M-GNN + Rules</span>
      </div>

      {!ready ? (
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-3 text-sm text-slate-200">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-transparent" />
            분석 및 심사 중...
          </div>
          <div className="rounded-lg border border-slate-700 bg-slate-900 p-3">
            <p className="text-xs font-semibold text-slate-300">Thinking</p>
            <ul className="mt-2 space-y-1.5 text-xs text-slate-300/90">
              <li className="animate-pulse">- case_id 및 입력 채널 메타데이터 정규화</li>
              <li className="animate-pulse [animation-delay:220ms]">- 그래프 기반 이상 패턴 탐지</li>
              <li className="animate-pulse [animation-delay:420ms]">- 리스크 스코어 및 사유 코드 생성</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-slate-700 bg-black p-3">
          <p className="mb-2 text-xs font-semibold text-slate-400">Domain Findings (JSON)</p>
          <pre className="overflow-x-auto text-xs leading-relaxed text-slate-200">{`{
  "case_id": "${scenario.caseId}",
  "snapshot": {
${scenario.domainSnapshot
  .map((item) => `    "${item.label}": "${item.value}"`)
  .join(",\n")}
  },
  "domain_findings": [
${displayFindings.map((f) => `    "${f}"`).join(",\n")}
  ]${summary ? `,\n  "summary": "${summary}"` : ""}
}`}</pre>
        </div>
      )}

      {showNext ? (
        <div className="mt-4">
          <button
            type="button"
            onClick={onNext}
            disabled={nextDisabled}
            className="rounded-lg bg-[#3b82f6] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-500"
          >
            Next Step
          </button>
        </div>
      ) : null}
    </article>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/components/steps/Step3DomainAI.tsx
git commit -m "feat: Step3DomainAI accepts optional LLM findings/summary props"
```

---

### Task 8: Update Step5TrustAgent2 component

**Files:**
- Modify: `app/components/steps/Step5TrustAgent2.tsx`

- [ ] **Step 1: Replace Step5TrustAgent2.tsx**

Replace the full file content of `app/components/steps/Step5TrustAgent2.tsx` with:

```tsx
import type { ScenarioData } from "./types";
import type { Step5Result } from "../../lib/types";

type Props = {
  scenario: ScenarioData;
  ready: boolean;
  showNext: boolean;
  nextDisabled: boolean;
  onNext: () => void;
  risks?: Step5Result["risks"];
  scores?: Step5Result["scores"];
};

const severityClass = {
  CRITICAL: "bg-red-100 text-red-700",
  HIGH: "bg-amber-100 text-amber-700",
  MINOR: "bg-slate-100 text-slate-700"
} as const;

export default function Step5TrustAgent2({ scenario, ready, showNext, nextDisabled, onNext, risks, scores }: Props) {
  const displayRisks = risks ?? scenario.redTeamRisks;
  const displayScores = scores ?? scenario.riskScores;

  return (
    <article className="rounded-2xl border border-red-300/60 bg-gradient-to-b from-red-50 to-white p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-700">Step 5</p>
          <h3 className="mt-1 font-[var(--font-manrope)] text-xl font-semibold text-navy-900">Trust Layer - Red Team LLM</h3>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-red-700">Adversarial Review</span>
      </div>

      {!ready ? (
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-3 text-sm text-navy-700">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
            Draft 리스크 점검 중...
          </div>
          <div className="rounded-lg border border-red-200 bg-white p-3">
            <p className="text-xs font-semibold text-red-700">Thinking</p>
            <ul className="mt-2 space-y-1.5 text-xs text-slate-700">
              <li className="animate-pulse">- 법적 분쟁 유발 표현 탐지</li>
              <li className="animate-pulse [animation-delay:220ms]">- 소비자 오인/협박 해석 가능성 점검</li>
              <li className="animate-pulse [animation-delay:420ms]">- 내부 자료 근거의 대외 설명 가능성 검토</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-red-200 bg-white p-4">
            <p className="text-sm font-semibold text-red-700">Red-Team Report</p>
            <ul className="mt-2 space-y-2 text-sm text-navy-800">
              {displayRisks.map((risk) => (
                <li key={risk.title} className="rounded-md bg-slate-50 p-2">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <p className="font-semibold">{risk.title}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${severityClass[risk.severity]}`}>
                      {risk.severity}
                    </span>
                  </div>
                  <p className="text-xs text-navy-700">{risk.detail}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-red-200 bg-white p-4">
            <p className="text-sm font-semibold text-navy-800">Risk Score List</p>
            <ul className="mt-2 space-y-2 text-sm text-navy-700">
              {displayScores.map((item) => (
                <li key={item.label}>
                  <div className="mb-1 flex items-center justify-between">
                    <span>{item.label}</span>
                    <span className="font-semibold text-navy-900">{item.score}</span>
                  </div>
                  <div className="h-1.5 rounded bg-slate-100">
                    <div className="h-1.5 rounded bg-red-500" style={{ width: `${item.score}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-slate-600">{item.note}</p>
                </li>
              ))}
            </ul>
          </div>
          <p className="md:col-span-2 text-xs font-semibold text-slate-600">요약: 전달 문구의 법적/정책 리스크를 내부 자료 기준으로 정리했고, 고위험 표현은 수정 권고됩니다.</p>
        </div>
      )}

      {showNext ? (
        <div className="mt-4">
          <button
            type="button"
            onClick={onNext}
            disabled={nextDisabled}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            Next Step
          </button>
        </div>
      ) : null}
    </article>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/components/steps/Step5TrustAgent2.tsx
git commit -m "feat: Step5TrustAgent2 accepts optional LLM risks/scores props"
```

---

### Task 9: Update page.tsx — state, threading, props

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Update imports**

At the top of `app/page.tsx`, change:

```ts
import type { Step4Result } from "./lib/types";
```

to:

```ts
import type { Step3Result, Step4Result, Step5Result } from "./lib/types";
```

- [ ] **Step 2: Add step3Result and step5Result state**

After the existing `const [step4Result, setStep4Result] = useState<Step4Result | null>(null);` line (line 47), add:

```ts
const [step3Result, setStep3Result] = useState<Step3Result | null>(null);
const [step5Result, setStep5Result] = useState<Step5Result | null>(null);
```

- [ ] **Step 3: Update the step runner useEffect**

Replace the `useEffect` block that handles `currentStep === 3`, `4`, `5`, `6` (currently lines 102–129) with:

```ts
useEffect(() => {
  if (demoMode || !selectedScenario) return;
  let cancelled = false;

  if (currentStep === 3) {
    setDomainReady(false);
    runStep(3, selectedScenario).then((result) => {
      if (!cancelled) {
        const r = result as { step: 3 } & Step3Result;
        setStep3Result({ findings: r.findings, summary: r.summary, source: r.source, fallbackReason: r.fallbackReason });
        setDomainReady(true);
      }
    });
  }
  if (currentStep === 4) {
    setAgent1Ready(false);
    runStep(4, selectedScenario, { step3Findings: step3Result?.findings ?? [] }).then((result) => {
      if (!cancelled) {
        setStep4Result(result as Step4Result & { step: 4 });
        setAgent1Ready(true);
      }
    });
  }
  if (currentStep === 5) {
    setAgent2Ready(false);
    runStep(5, selectedScenario, {
      step4Draft: step4Result?.draft,
      step4Citation: step4Result?.citation,
    }).then((result) => {
      if (!cancelled) {
        const r = result as { step: 5 } & Step5Result;
        setStep5Result({ risks: r.risks, scores: r.scores, source: r.source, fallbackReason: r.fallbackReason });
        setAgent2Ready(true);
      }
    });
  }
  if (currentStep === 6) {
    setHumanReady(false);
    runStep(6, selectedScenario).then(() => { if (!cancelled) setHumanReady(true); });
  }

  return () => { cancelled = true; };
  // step3Result and step4Result are intentionally omitted from deps:
  // they are always set before currentStep advances, so the closure
  // captures fresh values when currentStep changes to 4 or 5.
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [currentStep, demoMode, selectedScenario]);
```

- [ ] **Step 4: Reset new state in resetFlow and restartFromBeginning**

In `resetFlow`, add after `setStep4Result(null)`:
```ts
setStep3Result(null);
setStep5Result(null);
```

In `restartFromBeginning`, add after `setStep4Result(null)`:
```ts
setStep3Result(null);
setStep5Result(null);
```

- [ ] **Step 5: Pass findings/summary to Step3DomainAI**

In the `renderStepCard` function, find the `step === 3` block (currently renders `<Step3DomainAI ... />`) and update to:

```tsx
if (step === 3) {
  return (
    <Step3DomainAI
      scenario={scenario}
      ready={domainReady}
      showNext={showStepButton}
      nextDisabled={nextDisabled}
      onNext={goToNextStep}
      findings={step3Result?.findings}
      summary={step3Result?.summary}
    />
  );
}
```

- [ ] **Step 6: Pass risks/scores to Step5TrustAgent2**

In the `renderStepCard` function, find the `step === 5` block and update to:

```tsx
if (step === 5) {
  return (
    <Step5TrustAgent2
      scenario={scenario}
      ready={agent2Ready}
      showNext={showStepButton}
      nextDisabled={nextDisabled}
      onNext={goToNextStep}
      risks={step5Result?.risks}
      scores={step5Result?.scores}
    />
  );
}
```

- [ ] **Step 7: Verify TypeScript compiles**

```bash
cd h-trust && npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 8: Run all tests**

```bash
cd h-trust && npm test
```
Expected: all tests PASS

- [ ] **Step 9: Commit**

```bash
git add app/page.tsx
git commit -m "feat: thread step3/step5 LLM results through page state"
```

---

### Task 10: End-to-end smoke test

- [ ] **Step 1: Start the dev server**

```bash
cd h-trust && npm run dev
```

- [ ] **Step 2: Run through the full flow**

Open `http://localhost:3000` and:
1. Select the **insurance** scenario → click Next Step
2. Step 2: click Submit → step advances to Step 3
3. Step 3: wait for spinner to stop → verify the JSON block shows LLM-generated `domain_findings` (they should differ from the static `["HIGH_FRAUD_SIMILARITY", "CLINIC_PATTERN_MATCH", "ADDITIONAL_EVIDENCE_REQUIRED"]`) and includes a `"summary"` field → click Next Step
4. Step 4: wait for spinner → verify draft is present → click Next Step
5. Step 5: wait for spinner → verify Red-Team Report lists 3–5 risks including a scenario-specific one → click Next Step
6. Steps 6 and 7 complete normally

- [ ] **Step 3: Test fallback (no API key)**

Temporarily rename `.env.local` to `.env.local.bak` (or remove `GEMINI_API_KEY`), reload the page, and run through steps 3–5. Verify that static scenario data appears (no spinner hangs, no errors).

Restore `.env.local` after testing.

- [ ] **Step 4: Final commit**

```bash
git add -p   # stage only if any last-minute fixes were made
git commit -m "feat: LLM pipeline steps 3-4-5 complete — gemini-2.5-flash end-to-end"
```
