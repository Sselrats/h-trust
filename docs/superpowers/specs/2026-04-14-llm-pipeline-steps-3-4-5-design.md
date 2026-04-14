# LLM Pipeline: Steps 3, 4, 5 — Design Spec

**Date:** 2026-04-14
**Scope:** Replace static data returns in Steps 3 and 5 with real Gemini LLM calls; wire Step 3 output into Step 4, and Step 4 output into Step 5.

---

## Goals

- Step 3 (Domain AI): call `gemini-2.5-flash` to dynamically generate `findings` + `summary` from the customer submission
- Step 4 (Trust Draft LLM): already calls Gemini; update to consume Step 3's live findings instead of static data; fall back to `userText` if findings are empty
- Step 5 (Red Team LLM): call `gemini-2.5-flash` to generate `risks` + `scores` from Step 4's draft; fall back to `userText` if draft is absent

## Non-Goals

- No architecture changes (no new API routes, no session store)
- No changes to JSON output shapes or parser logic
- No changes to UI layout or step card components beyond accepting new props

---

## Data Flow

```
Step 3 LLM
  input:  scenario.title + userText + submissions
  output: { findings: string[], summary: string }
       ↓  (passed in request body)
Step 4 LLM
  input:  scenario.title + userText + step3.findings  ← was static domainFindings
  output: { draft: string, citation: string }
       ↓  (passed in request body)
Step 5 LLM
  input:  scenario.title + userText + step4.draft + step4.citation
  output: { risks: RiskItem[], scores: ScoreItem[] }
```

---

## Types

### `Step3Result` (new, in `app/lib/types.ts`)
```ts
type Step3Result = {
  findings: string[];
  summary: string;
  source: "ai" | "fallback";
  fallbackReason?: FallbackReason;
};
```

### `Step5Result` (new, in `app/lib/types.ts`)
```ts
type Step5Result = {
  risks: Array<{ severity: "CRITICAL" | "HIGH" | "MINOR"; title: string; detail: string }>;
  scores: Array<{ label: string; score: number; note: string }>;
  source: "ai" | "fallback";
  fallbackReason?: FallbackReason;
};
```

---

## New Files

### `app/lib/prompts/step3.ts`
- `buildStep3Prompt(scenario)` — takes `title`, `userText`, `submissions?`; renders `"없음"` if submissions is undefined or empty
- `parseStep3Response(text, fallback)` — strips markdown fences, parses JSON, validates `findings[]` (non-empty array) + `summary` (non-empty string); returns fallback on any error

### `app/lib/prompts/step5.ts`
- `buildStep5Prompt(scenario, draft, citation)` — takes `title`, `userText`, `draft`, `citation`
- `parseStep5Response(text, fallback)` — parses JSON, validates `risks[]` + `scores[]`; returns fallback on any error

---

## Modified Files

### `app/lib/types.ts`
Add `Step3Result` and `Step5Result`.

### `app/lib/prompts/step4.ts`
`buildStep4Prompt` signature changes to accept `findings: string[]` as a parameter (instead of reading from `scenario.domainFindings`). Prompt text updated with fallback instruction.

### `app/api/pipeline/[step]/route.ts`
- **Case `"3"`**: call Gemini, build prompt from `scenarioKey`, return `Step3Result`; fallback to `scenario.domainFindings`
- **Case `"4"`**: accept `step3Findings?: string[]` from request body; pass to `buildStep4Prompt`
- **Case `"5"`**: accept `step4Draft?: string`, `step4Citation?: string` from request body; call Gemini, return `Step5Result`; fallback to `scenario.redTeamRisks` + `scenario.riskScores`

### `app/lib/pipeline.ts`
- `runStep(3, scenarioKey)` → calls `/api/pipeline/3`, returns `Step3Result`
- `runStep(4, scenarioKey, step3Findings?)` → passes findings in body
- `runStep(5, scenarioKey, step4Draft?, step4Citation?)` → passes draft+citation in body
- `StepResult` union updated to include `Step3Result` and `Step5Result`

### `app/page.tsx`
- Add `step3Result` state (`Step3Result | null`)
- Add `step5Result` state (`Step5Result | null`)
- Thread `step3Result.findings` into the Step 4 `runStep` call
- Thread `step4Result.draft` + `step4Result.citation` into the Step 5 `runStep` call
- Pass `step5Result.risks` + `step5Result.scores` to `Step5TrustAgent2`

### `app/components/steps/Step5TrustAgent2.tsx`
Accept `risks` and `scores` as optional props (same pattern as Step 4 receiving `draft`/`citation`). Render them when present; fall back to `scenario.redTeamRisks` / `scenario.riskScores` when null.

---

## Prompts

### Step 3
```
당신은 금융 심사 전문가입니다. 아래 고객 문의를 분석하여 심사 발견사항을 도출하세요.

시나리오: ${title}
고객 문의: ${userText}
제출 서류: ${submissions && submissions.length > 0 ? submissions.join(", ") : "없음"}

지침:
- findings: 최소 3개, 최대 5개 항목, 각 항목은 정확히 1문장
- summary: 전체 요약 정확히 1문장
- 한국어 작성
- 반드시 JSON만 반환. 설명, 마크다운, 코드 블록 절대 금지.

{"findings": ["..."], "summary": "..."}
```

### Step 4 (updated)
```
당신은 금융 고객 서비스 전문가입니다. 고객 안내 초안을 작성하세요.

시나리오: ${title}
고객 문의: ${userText}
Domain AI 분석 결과: ${findings.length > 0 ? findings.join(", ") : "없음"}

지침:
- 분석 결과가 없거나 불충분하면 고객 문의를 직접 분석하여 작성
- 단정적 표현 금지 ("거절됩니다" → "검토가 필요합니다")
- 관련 법령 또는 약관 조항 1개 인용 필수
- 한국어 작성
- 반드시 JSON만 반환. 설명, 마크다운, 코드 블록 절대 금지.

{"draft": "...", "citation": "..."}
```

### Step 5
```
당신은 금융 컴플라이언스 전문가입니다. 고객 안내 문구의 법적 리스크를 검토하세요.

시나리오: ${title}
원본 고객 문의: ${userText}
검토 초안: ${draft && draft.length > 20 ? draft : "없음 — 원본 고객 문의 기준으로 리스크 추론"}
인용 조항: ${citation || "없음"}

지침:
- risks: 최소 3개, 최대 5개 (severity: CRITICAL/HIGH/MINOR), 시나리오 고유 리스크 정확히 1개 포함
- scores: 최소 3개, 최대 5개 (label, score 0~100 정수, note)
- 초안이 없으면 원본 문의 맥락에서 예상 리스크 도출
- 한국어 작성
- 반드시 JSON만 반환. 설명, 마크다운, 코드 블록 절대 금지.

{"risks": [{"severity": "HIGH", "title": "...", "detail": "..."}], "scores": [{"label": "...", "score": 75, "note": "..."}]}
```

---

## Fallback Behavior

| Step | AI fails → fallback to |
|------|------------------------|
| 3 | `scenario.domainFindings` + empty `summary` |
| 4 | `scenario.trustDraft` + `scenario.citation` (unchanged from today) |
| 5 | `scenario.redTeamRisks` + `scenario.riskScores` |

---

## Robustness Rules

| Step | Primary input | Fallback condition |
|------|-------------|-------------------|
| 4 | `step3.findings` | findings array is empty → analyze `userText` directly |
| 5 | `step4.draft` | draft is missing or `length < 20` → infer from `userText` |
