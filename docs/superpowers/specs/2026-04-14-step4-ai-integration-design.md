# Step 4 AI Integration — Design Spec

**Date:** 2026-04-14
**Scope:** Connect Step 4 (Trust Layer - Draft & Citation LLM) to Google Gemini 1.5 Flash. Steps 3, 5, 6 remain static for now.

---

## Goal

Replace the hardcoded `trustDraft` and `citation` fields in Step 4 with a real Gemini API call. When the API is unavailable or returns malformed output, fall back to static data with a visible notice badge.

---

## Architecture & Data Flow

```
page.tsx
  └─ runStep(4, selectedScenario)        ← no change to call site
       └─ pipeline.ts
            └─ POST /api/pipeline/4      ← fetch replaces setTimeout
                 └─ route.ts
                      ├─ buildStep4Prompt(scenario)
                      ├─ call Gemini 1.5 Flash
                      ├─ parseStep4Response(text, fallback)
                      └─ return Step4Result
       └─ StepResult returned to page.tsx
            └─ page.tsx stores step4Result in state
                 └─ Step4TrustAgent1
                      ├─ source: "ai"       → renders AI draft normally
                      └─ source: "fallback" → renders static draft + badge
```

---

## Types — `app/lib/types.ts` (new)

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

Used consistently across `route.ts`, `pipeline.ts`, and `Step4TrustAgent1.tsx`.

---

## Prompt Helper & Parser — `app/lib/prompts/step4.ts` (new)

### `buildStep4Prompt(scenario: ScenarioData): string`

Constructs the Gemini prompt using:
- `scenario.title` — scenario type label
- `scenario.userText` — the customer's original message
- `scenario.domainFindings` — array of domain AI result codes

Output instruction: respond in Korean, return JSON only:
```json
{ "draft": "고객 안내 문구", "citation": "인용 조항" }
```

Prompt constraints baked in:
- 단정적 표현 금지 (no definitive judgments)
- 고객 친화적 문체 (customer-friendly tone)
- 관련 법령 또는 약관 조항 1개 인용 (one legal/policy citation required)

### `parseStep4Response(text: string, fallback: Step4Result): Step4Result`

Failure handling:

| Condition | `source` | `fallbackReason` |
|-----------|----------|-----------------|
| API threw / network error | `"fallback"` | `"api_error"` |
| Response text empty or null | `"fallback"` | `"empty_response"` |
| `JSON.parse` throws | `"fallback"` | `"json_parse_error"` |
| `draft` or `citation` missing | `"fallback"` | `"missing_fields"` |
| All fields present | `"ai"` | `undefined` |

---

## API Route — `app/api/pipeline/[step]/route.ts`

Case `"4"` replaces the current static return with:

1. Retrieve `scenarioMap[scenarioKey]`
2. Call `buildStep4Prompt(scenario)`
3. Call Gemini 1.5 Flash (`gemini-1.5-flash`) via `@google/generative-ai`
4. Pass raw text to `parseStep4Response(text, staticFallback)`
5. Return `Step4Result` as JSON

All errors are caught — the route always returns HTTP 200 with a valid `Step4Result` (either `source: "ai"` or `source: "fallback"`). This keeps the UI demo-safe.

---

## Pipeline — `app/lib/pipeline.ts`

`runStep(4, scenarioKey)` changes from:
```ts
await new Promise(resolve => setTimeout(resolve, 5000));
return { step: 4, draft: s.trustDraft, citation: s.citation };
```
to:
```ts
const res = await fetch('/api/pipeline/4', { method: 'POST', body: JSON.stringify({ scenarioKey }) });
return { step: 4, ...(await res.json()) };
```

The `StepResult` union type for step 4 is updated to spread `Step4Result`.

---

## Page State — `app/page.tsx`

Add one new state variable:
```ts
const [step4Result, setStep4Result] = useState<Step4Result | null>(null);
```

In the `runStep(4)` `.then()` callback, store the result:
```ts
runStep(4, selectedScenario).then((result) => {
  if (!cancelled) {
    setStep4Result(result);
    setAgent1Ready(true);
  }
});
```

Reset `step4Result` to `null` inside `resetFlow()` and `restartFromBeginning()`.

Pass to the Step 4 card via optional props.

---

## UI — `app/components/steps/Step4TrustAgent1.tsx`

Add three optional props:
```ts
draft?: string;
citation?: string;
source?: "ai" | "fallback";
```

Rendering logic:
- If `draft` prop present, use it; otherwise use `scenario.trustDraft`
- If `citation` prop present, use it; otherwise use `scenario.citation`
- If `source === "fallback"`, render a small badge:
  ```
  ⚠ 정적 데이터 (API 오류)
  ```
  Badge style: inline, muted amber — consistent with existing Tailwind tokens (`ambersoft-*`).

No other UI changes.

---

## New Dependencies

```bash
npm install @google/generative-ai
```

```
# .env.local
GEMINI_API_KEY=your_key_here
```

---

## Files Changed

| File | Type | Change |
|------|------|--------|
| `app/lib/types.ts` | new | `Step4Result`, `FallbackReason` |
| `app/lib/prompts/step4.ts` | new | `buildStep4Prompt`, `parseStep4Response` |
| `app/api/pipeline/[step]/route.ts` | edit | case `"4"` → Gemini call |
| `app/lib/pipeline.ts` | edit | `runStep(4)` → real fetch |
| `app/page.tsx` | edit | `step4Result` state + reset |
| `app/components/steps/Step4TrustAgent1.tsx` | edit | 3 optional props + fallback badge |
| `.env.local` | new | `GEMINI_API_KEY` |
| `package.json` | edit | add `@google/generative-ai` |

**Untouched:** Step1–3, Step5–7 components, `data.ts`, `types.ts` (existing), all styling.

---

## Out of Scope (this iteration)

- Steps 3 and 5 AI integration (next iteration)
- Streaming responses
- Prompt versioning or A/B testing
- Any database or persistence layer
