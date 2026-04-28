# Step 4 AI Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Step 4's hardcoded `trustDraft`/`citation` with a live Google Gemini 1.5 Flash call that generates Korean financial customer guidance, with a visible fallback badge on API failure.

**Architecture:** `page.tsx` calls `runStep(4)` → `pipeline.ts` POSTs to `/api/pipeline/4` → `route.ts` calls Gemini via `@google/generative-ai`, parses JSON, and returns a `Step4Result`. If anything fails the route returns `source: "fallback"` instead of throwing. `Step4TrustAgent1` renders the AI draft or static data + amber badge.

**Tech Stack:** Next.js 14 App Router, `@google/generative-ai` (Gemini 1.5 Flash), vitest for unit tests, TypeScript.

---

### Task 1: Install dependencies and scaffold test infrastructure

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `.env.local`

- [ ] **Step 1: Install runtime and test dependencies**

```bash
cd /Users/khjmove/H-Trust/h-trust
npm install @google/generative-ai
npm install --save-dev vitest
```

Expected: `package.json` now lists `@google/generative-ai` under `dependencies` and `vitest` under `devDependencies`.

- [ ] **Step 2: Add test script to package.json**

Open `package.json` and add `"test": "vitest run"` to the `scripts` block:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run"
  }
}
```

- [ ] **Step 3: Create vitest.config.ts**

Create `vitest.config.ts` at the project root:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
  },
});
```

- [ ] **Step 4: Create .env.local with placeholder**

Create `.env.local` at the project root (it is already git-ignored by Next.js defaults):

```
GEMINI_API_KEY=your_key_here
```

Replace `your_key_here` with a real Gemini API key from [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) before running Step 4 end-to-end.

- [ ] **Step 5: Verify vitest is wired up**

```bash
npm test
```

Expected output: `No test files found` (or similar — no failures). This confirms vitest runs without errors before any tests exist.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vitest.config.ts .env.local
git commit -m "chore: add @google/generative-ai and vitest"
```

---

### Task 2: Create shared types

**Files:**
- Create: `app/lib/types.ts`

- [ ] **Step 1: Write the failing test**

Create `app/lib/__tests__/types.test.ts`:

```ts
import { describe, it, expectTypeOf } from "vitest";
import type { Step4Result, FallbackReason } from "../types";

describe("Step4Result type", () => {
  it("accepts source: ai with no fallbackReason", () => {
    const r: Step4Result = { draft: "d", citation: "c", source: "ai" };
    expectTypeOf(r.source).toEqualTypeOf<"ai" | "fallback">();
  });

  it("accepts source: fallback with fallbackReason", () => {
    const r: Step4Result = {
      draft: "d",
      citation: "c",
      source: "fallback",
      fallbackReason: "api_error",
    };
    expectTypeOf(r.fallbackReason).toEqualTypeOf<FallbackReason | undefined>();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test
```

Expected: error — `Cannot find module '../types'`

- [ ] **Step 3: Create app/lib/types.ts**

```ts
export type FallbackReason =
  | "api_error"
  | "json_parse_error"
  | "empty_response"
  | "missing_fields";

export type Step4Result = {
  draft: string;
  citation: string;
  source: "ai" | "fallback";
  fallbackReason?: FallbackReason;
};
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test
```

Expected: `1 test file | 2 tests passed`

- [ ] **Step 5: Commit**

```bash
git add app/lib/types.ts app/lib/__tests__/types.test.ts
git commit -m "feat: add Step4Result and FallbackReason types"
```

---

### Task 3: Create prompt helper and parser

**Files:**
- Create: `app/lib/prompts/step4.ts`
- Create: `app/lib/__tests__/step4-prompts.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `app/lib/__tests__/step4-prompts.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { buildStep4Prompt, parseStep4Response } from "../prompts/step4";
import type { ScenarioData } from "../../components/steps/types";
import type { Step4Result } from "../types";

const mockScenario: Pick<ScenarioData, "title" | "userText" | "domainFindings"> = {
  title: "보험금 지급 심사",
  userText: "보험금을 청구했는데 왜 이렇게 오래 걸리나요?",
  domainFindings: ["FRAUD_SCORE_HIGH", "CLAIM_DUPLICATE"],
};

const fallback: Step4Result = {
  draft: "정적 초안입니다.",
  citation: "보험업법 제00조",
  source: "fallback",
  fallbackReason: "api_error",
};

describe("buildStep4Prompt", () => {
  it("includes the scenario title", () => {
    const prompt = buildStep4Prompt(mockScenario as ScenarioData);
    expect(prompt).toContain("보험금 지급 심사");
  });

  it("includes the user text", () => {
    const prompt = buildStep4Prompt(mockScenario as ScenarioData);
    expect(prompt).toContain("보험금을 청구했는데 왜 이렇게 오래 걸리나요?");
  });

  it("includes domain findings", () => {
    const prompt = buildStep4Prompt(mockScenario as ScenarioData);
    expect(prompt).toContain("FRAUD_SCORE_HIGH");
    expect(prompt).toContain("CLAIM_DUPLICATE");
  });

  it("requests JSON output", () => {
    const prompt = buildStep4Prompt(mockScenario as ScenarioData);
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
npm test
```

Expected: error — `Cannot find module '../prompts/step4'`

- [ ] **Step 3: Create app/lib/prompts/step4.ts**

```ts
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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test
```

Expected: `2 test files | 8 tests passed` (2 from types, 6 new)

- [ ] **Step 5: Commit**

```bash
git add app/lib/prompts/step4.ts app/lib/__tests__/step4-prompts.test.ts
git commit -m "feat: add buildStep4Prompt and parseStep4Response with tests"
```

---

### Task 4: Update API route — wire Gemini

**Files:**
- Modify: `app/api/pipeline/[step]/route.ts`

- [ ] **Step 1: Replace case "4" with Gemini call**

The current `route.ts` at `app/api/pipeline/[step]/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { scenarioMap } from "../../../components/steps/data";
import type { ScenarioKey } from "../../../components/steps/types";

const VALID_STEPS = ["3", "4", "5", "6"] as const;
type ValidStep = (typeof VALID_STEPS)[number];

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

  switch (step as ValidStep) {
    case "3":
      return NextResponse.json({ findings: s.domainFindings, snapshot: s.domainSnapshot });
    case "4":
      return NextResponse.json({ draft: s.trustDraft, citation: s.citation });
    case "5":
      return NextResponse.json({ risks: s.redTeamRisks, scores: s.riskScores });
    case "6":
      return NextResponse.json({ outcome: s.humanOutcome });
  }
}
```

Replace the entire file with:

```ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { scenarioMap } from "../../../components/steps/data";
import type { ScenarioKey } from "../../../components/steps/types";
import type { Step4Result } from "../../../lib/types";
import { buildStep4Prompt, parseStep4Response } from "../../../lib/prompts/step4";

const VALID_STEPS = ["3", "4", "5", "6"] as const;
type ValidStep = (typeof VALID_STEPS)[number];

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

  switch (step as ValidStep) {
    case "3":
      return NextResponse.json({ findings: s.domainFindings, snapshot: s.domainSnapshot });

    case "4": {
      const staticFallback: Step4Result = {
        draft: s.trustDraft,
        citation: s.citation,
        source: "fallback",
        fallbackReason: "api_error",
      };

      try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
          return NextResponse.json({ ...staticFallback });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = buildStep4Prompt(s);
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return NextResponse.json(parseStep4Response(text, staticFallback));
      } catch {
        return NextResponse.json(staticFallback);
      }
    }

    case "5":
      return NextResponse.json({ risks: s.redTeamRisks, scores: s.riskScores });

    case "6":
      return NextResponse.json({ outcome: s.humanOutcome });
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npm run build
```

Expected: build succeeds with no TypeScript errors. If you see `Module not found: @google/generative-ai`, run `npm install @google/generative-ai` again.

- [ ] **Step 3: Commit**

```bash
git add app/api/pipeline/[step]/route.ts
git commit -m "feat: wire Step 4 route to Gemini 1.5 Flash with fallback"
```

---

### Task 5: Update pipeline.ts — real fetch for step 4

**Files:**
- Modify: `app/lib/pipeline.ts`

- [ ] **Step 1: Replace runStep(4) with a real fetch**

Current `app/lib/pipeline.ts`:

```ts
import { scenarioMap } from "../components/steps/data";
import type { ScenarioData, ScenarioKey } from "../components/steps/types";

export type StepResult =
  | { step: 3; findings: ScenarioData["domainFindings"]; snapshot: ScenarioData["domainSnapshot"] }
  | { step: 4; draft: string; citation: string }
  | { step: 5; risks: ScenarioData["redTeamRisks"]; scores: ScenarioData["riskScores"] }
  | { step: 6; outcome: ScenarioData["humanOutcome"] };

export async function runStep(step: 3 | 4 | 5 | 6, scenarioKey: ScenarioKey): Promise<StepResult> {
  const delay = step === 6 ? 1600 : 5000;
  await new Promise((resolve) => setTimeout(resolve, delay));

  const s = scenarioMap[scenarioKey];

  if (step === 3) return { step: 3, findings: s.domainFindings, snapshot: s.domainSnapshot };
  if (step === 4) return { step: 4, draft: s.trustDraft, citation: s.citation };
  if (step === 5) return { step: 5, risks: s.redTeamRisks, scores: s.riskScores };
  return { step: 6, outcome: s.humanOutcome };
}
```

Replace with:

```ts
import { scenarioMap } from "../components/steps/data";
import type { ScenarioData, ScenarioKey } from "../components/steps/types";
import type { Step4Result } from "./types";

export type StepResult =
  | { step: 3; findings: ScenarioData["domainFindings"]; snapshot: ScenarioData["domainSnapshot"] }
  | ({ step: 4 } & Step4Result)
  | { step: 5; risks: ScenarioData["redTeamRisks"]; scores: ScenarioData["riskScores"] }
  | { step: 6; outcome: ScenarioData["humanOutcome"] };

export async function runStep(step: 3 | 4 | 5 | 6, scenarioKey: ScenarioKey): Promise<StepResult> {
  if (step === 4) {
    const res = await fetch("/api/pipeline/4", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenarioKey }),
    });
    const data = await res.json();
    return { step: 4, ...data };
  }

  const delay = step === 6 ? 1600 : 5000;
  await new Promise((resolve) => setTimeout(resolve, delay));

  const s = scenarioMap[scenarioKey];

  if (step === 3) return { step: 3, findings: s.domainFindings, snapshot: s.domainSnapshot };
  if (step === 5) return { step: 5, risks: s.redTeamRisks, scores: s.riskScores };
  return { step: 6, outcome: s.humanOutcome };
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add app/lib/pipeline.ts
git commit -m "feat: runStep(4) now calls /api/pipeline/4 instead of static data"
```

---

### Task 6: Update page.tsx — step4Result state

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Add Step4Result import and state variable**

At the top of `app/page.tsx`, add the import after the existing imports:

```ts
import type { Step4Result } from "./lib/types";
```

Then inside the `Home` component body, after the existing `useState` declarations (around line 46), add:

```ts
const [step4Result, setStep4Result] = useState<Step4Result | null>(null);
```

- [ ] **Step 2: Store result in the runStep(4) callback**

Find the `currentStep === 4` block (around line 109):

```ts
if (currentStep === 4) {
  setAgent1Ready(false);
  runStep(4, selectedScenario).then(() => { if (!cancelled) setAgent1Ready(true); });
}
```

Replace with:

```ts
if (currentStep === 4) {
  setAgent1Ready(false);
  runStep(4, selectedScenario).then((result) => {
    if (!cancelled) {
      setStep4Result(result as Step4Result & { step: 4 });
      setAgent1Ready(true);
    }
  });
}
```

- [ ] **Step 3: Reset step4Result in resetFlow and restartFromBeginning**

Find `resetFlow` (around line 178):

```ts
const resetFlow = (nextScenario: ScenarioKey) => {
  clearTimers();
  setSelectedScenario(nextScenario);
  setCurrentStep(1);
  setSubmitted(false);
  setDomainReady(false);
  setAgent1Ready(false);
  setAgent2Ready(false);
  setHumanReady(false);
};
```

Add `setStep4Result(null);` before `setHumanReady(false)`:

```ts
const resetFlow = (nextScenario: ScenarioKey) => {
  clearTimers();
  setSelectedScenario(nextScenario);
  setCurrentStep(1);
  setSubmitted(false);
  setDomainReady(false);
  setAgent1Ready(false);
  setAgent2Ready(false);
  setHumanReady(false);
  setStep4Result(null);
};
```

Find `restartFromBeginning` (around line 189):

```ts
const restartFromBeginning = () => {
  clearTimers();
  setSelectedScenario(null);
  setCurrentStep(1);
  setSubmitted(false);
  setDomainReady(false);
  setAgent1Ready(false);
  setAgent2Ready(false);
  setHumanReady(false);
};
```

Add `setStep4Result(null);`:

```ts
const restartFromBeginning = () => {
  clearTimers();
  setSelectedScenario(null);
  setCurrentStep(1);
  setSubmitted(false);
  setDomainReady(false);
  setAgent1Ready(false);
  setAgent2Ready(false);
  setHumanReady(false);
  setStep4Result(null);
};
```

- [ ] **Step 4: Pass step4Result props to Step4TrustAgent1**

Find the step 4 render block (around line 260):

```tsx
if (step === 4) {
  return (
    <Step4TrustAgent1
      scenario={scenario}
      ready={agent1Ready}
      showNext={showStepButton}
      nextDisabled={nextDisabled}
      onNext={goToNextStep}
    />
  );
}
```

Replace with:

```tsx
if (step === 4) {
  return (
    <Step4TrustAgent1
      scenario={scenario}
      ready={agent1Ready}
      showNext={showStepButton}
      nextDisabled={nextDisabled}
      onNext={goToNextStep}
      draft={step4Result?.draft}
      citation={step4Result?.citation}
      source={step4Result?.source}
    />
  );
}
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
npm run build
```

Expected: build succeeds. If you see a type error on `step4Result`, check that the import and useState generic are correct.

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx
git commit -m "feat: add step4Result state and pass AI draft to Step4TrustAgent1"
```

---

### Task 7: Update Step4TrustAgent1 — optional props and fallback badge

**Files:**
- Modify: `app/components/steps/Step4TrustAgent1.tsx`

- [ ] **Step 1: Add optional props and fallback badge**

Current `app/components/steps/Step4TrustAgent1.tsx`:

```tsx
import type { ScenarioData } from "./types";

type Props = {
  scenario: ScenarioData;
  ready: boolean;
  showNext: boolean;
  nextDisabled: boolean;
  onNext: () => void;
};

export default function Step4TrustAgent1({ scenario, ready, showNext, nextDisabled, onNext }: Props) {
  return (
    <article className="rounded-2xl border border-[#3b82f6]/40 bg-gradient-to-b from-[#eff6ff] to-[#dbeafe] p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1d4ed8]">Step 4</p>
          <h3 className="mt-1 font-[var(--font-manrope)] text-xl font-semibold text-navy-900">Trust Layer - Draft&Citation LLM</h3>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#1d4ed8]">Draft Generation</span>
      </div>

      {!ready ? (
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-3 text-sm text-navy-700">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#3b82f6] border-t-transparent" />
            Draft 및 Citation 생성 중...
          </div>
          <div className="rounded-lg border border-[#3b82f6]/35 bg-white/80 p-3">
            <p className="text-xs font-semibold text-[#1e40af]">Thinking</p>
            <ul className="mt-2 space-y-1.5 text-xs text-slate-700">
              <li className="animate-pulse">- 내부 자료(DB) 근거 조항 우선 매핑</li>
              <li className="animate-pulse [animation-delay:220ms]">- 고객 친화 문장으로 변환</li>
              <li className="animate-pulse [animation-delay:420ms]">- 단정적 표현 완화 및 citation 정렬</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <div className="rounded-xl border border-[#3b82f6]/35 bg-white/90 p-4">
            <p className="whitespace-pre-line text-sm leading-relaxed text-navy-800">{scenario.trustDraft}</p>
            <p className="mt-2 inline-flex rounded-full bg-[#dbeafe] px-2.5 py-1 text-xs font-semibold text-[#1d4ed8]">
              Citation: {scenario.citation}
            </p>
          </div>
          <p className="text-xs font-semibold text-slate-600">* 내부 자료 기반 초안입니다. 최종 고객 전달 전 Red Team 점검이 필요합니다.</p>
        </div>
      )}

      {showNext ? (
        <div className="mt-4">
          <button
            type="button"
            onClick={onNext}
            disabled={nextDisabled}
            className="rounded-lg bg-[#3b82f6] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            Next Step
          </button>
        </div>
      ) : null}
    </article>
  );
}
```

Replace with:

```tsx
import type { ScenarioData } from "./types";

type Props = {
  scenario: ScenarioData;
  ready: boolean;
  showNext: boolean;
  nextDisabled: boolean;
  onNext: () => void;
  draft?: string;
  citation?: string;
  source?: "ai" | "fallback";
};

export default function Step4TrustAgent1({
  scenario,
  ready,
  showNext,
  nextDisabled,
  onNext,
  draft,
  citation,
  source,
}: Props) {
  const displayDraft = draft ?? scenario.trustDraft;
  const displayCitation = citation ?? scenario.citation;

  return (
    <article className="rounded-2xl border border-[#3b82f6]/40 bg-gradient-to-b from-[#eff6ff] to-[#dbeafe] p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1d4ed8]">Step 4</p>
          <h3 className="mt-1 font-[var(--font-manrope)] text-xl font-semibold text-navy-900">Trust Layer - Draft&Citation LLM</h3>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#1d4ed8]">Draft Generation</span>
      </div>

      {!ready ? (
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-3 text-sm text-navy-700">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#3b82f6] border-t-transparent" />
            Draft 및 Citation 생성 중...
          </div>
          <div className="rounded-lg border border-[#3b82f6]/35 bg-white/80 p-3">
            <p className="text-xs font-semibold text-[#1e40af]">Thinking</p>
            <ul className="mt-2 space-y-1.5 text-xs text-slate-700">
              <li className="animate-pulse">- 내부 자료(DB) 근거 조항 우선 매핑</li>
              <li className="animate-pulse [animation-delay:220ms]">- 고객 친화 문장으로 변환</li>
              <li className="animate-pulse [animation-delay:420ms]">- 단정적 표현 완화 및 citation 정렬</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <div className="rounded-xl border border-[#3b82f6]/35 bg-white/90 p-4">
            {source === "fallback" && (
              <p className="mb-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-600">
                ⚠ 정적 데이터 (API 오류)
              </p>
            )}
            <p className="whitespace-pre-line text-sm leading-relaxed text-navy-800">{displayDraft}</p>
            <p className="mt-2 inline-flex rounded-full bg-[#dbeafe] px-2.5 py-1 text-xs font-semibold text-[#1d4ed8]">
              Citation: {displayCitation}
            </p>
          </div>
          <p className="text-xs font-semibold text-slate-600">* 내부 자료 기반 초안입니다. 최종 고객 전달 전 Red Team 점검이 필요합니다.</p>
        </div>
      )}

      {showNext ? (
        <div className="mt-4">
          <button
            type="button"
            onClick={onNext}
            disabled={nextDisabled}
            className="rounded-lg bg-[#3b82f6] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            Next Step
          </button>
        </div>
      ) : null}
    </article>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npm run build
```

Expected: build succeeds with no errors.

- [ ] **Step 3: Commit**

```bash
git add app/components/steps/Step4TrustAgent1.tsx
git commit -m "feat: Step4TrustAgent1 accepts AI draft props and shows fallback badge"
```

---

### Task 8: End-to-end verification

**Files:** None modified — manual testing only.

- [ ] **Step 1: Set your real Gemini API key**

Open `.env.local` and replace `your_key_here` with a real key from Google AI Studio.

- [ ] **Step 2: Start the dev server**

```bash
npm run dev
```

Expected: server starts at `http://localhost:3000`.

- [ ] **Step 3: Run the full Step 4 flow**

1. Open `http://localhost:3000` in a browser
2. Select any scenario (e.g., "보험금 지급")
3. Click "Next Step" through Steps 1–3
4. On Step 4: observe the spinner and "Draft 및 Citation 생성 중..." text
5. After the API call completes: verify a Korean draft and citation appear (not the static English-style placeholder)
6. Source badge: if API succeeds, **no badge** is shown. If you set an invalid key, the amber "⚠ 정적 데이터 (API 오류)" badge appears.

- [ ] **Step 4: Verify fallback path**

1. Temporarily set `GEMINI_API_KEY=invalid_key` in `.env.local`
2. Restart the dev server
3. Run through Step 4 again
4. Verify the amber fallback badge appears and static data is displayed
5. Restore the real key when done

- [ ] **Step 5: Run all tests one final time**

```bash
npm test
```

Expected: all tests pass (types + prompt helper).

- [ ] **Step 6: Final commit**

```bash
git add .env.local
git commit -m "chore: add .env.local placeholder for GEMINI_API_KEY"
```

Note: `.env.local` is git-ignored by Next.js. Verify with `git status` — if it does NOT appear as untracked, skip this step.

---

## Self-Review Checklist

**Spec coverage:**
- `FallbackReason` + `Step4Result` types → Task 2 ✓
- `buildStep4Prompt` → Task 3 ✓
- `parseStep4Response` with all 5 failure modes → Task 3 tests ✓
- Route case "4" → Gemini call → Task 4 ✓
- `runStep(4)` → real fetch → Task 5 ✓
- `step4Result` state + reset in `resetFlow` and `restartFromBeginning` → Task 6 ✓
- 3 optional props + fallback badge in `Step4TrustAgent1` → Task 7 ✓
- `@google/generative-ai` install + `.env.local` + vitest → Task 1 ✓

**No placeholders:** All code blocks are complete and self-contained.

**Type consistency:**
- `Step4Result` defined in Task 2, imported in Tasks 3, 4, 5, 6 — all reference `app/lib/types`
- `buildStep4Prompt` / `parseStep4Response` defined in Task 3, imported in Task 4
- `displayDraft` / `displayCitation` variables in Task 7 match prop names `draft` / `citation` passed from Task 6
