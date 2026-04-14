# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Constraint

- DO NOT rewrite the entire project structure
- Keep UI components intact
- Prefer minimal incremental changes
- Refactor only when necessary for backend integration

## Commands

```bash
# Dev server
npm run dev          # http://localhost:3000

# Build
npm run build

# Lint
npm run lint
```

### Recording output videos

Requires the dev server to be running first.

```bash
# Demo carousel (all steps, carousel mode)
node scripts/record-demo.mjs \
  --url 'http://127.0.0.1:3000/?demo=1&ms=1200' \
  --framesDir output/frames-1200 \
  --frames 180

python3 scripts/encode-demo.py \
  --frames 'output/frames-1200/frame-*.png' \
  --out-prefix output/h-trust-demo \
  --fps 10

# Normal flow capture
node scripts/record-flow.mjs
python3 scripts/encode-demo.py \
  --frames 'output/frames-flow/frame-*.png' \
  --out-prefix output/h-trust-flow-864-1x \
  --fps 10
```

## Architecture

This is a single-page Next.js 14 (App Router) demo with no backend. All data is static.

### Data flow

`app/components/steps/data.ts` is the single source of truth. It exports `scenarioMap: Record<ScenarioKey, ScenarioData>` with three scenarios (`insurance`, `loan`, `investment`). Every Step component receives a `scenario: ScenarioData` prop and renders the relevant slice.

### Page state machine (`app/page.tsx`)

`page.tsx` is a client component that owns all state. The 7-step pipeline progresses linearly via `currentStep: StepNumber`. Key state flags:

- `selectedScenario` — which scenario is active
- `submitted`, `domainReady`, `agent1Ready`, `agent2Ready`, `humanReady` — gate each step's "ready" state; Steps 3–5 simulate a 5-second AI processing delay, Step 6 uses 1.6s

**Demo mode** (`?demo=1&ms=N`): all steps are shown simultaneously, all ready-flags are set to `true`, and a carousel auto-scrolls through 70 repeated step cards at the given interval. `demoIndex` and `focusStep` track the carousel position.

### Step components (`app/components/steps/Step*.tsx`)

Each step is a self-contained `article` card receiving:

- `scenario: ScenarioData` — data to render
- `ready: boolean` — shows a loading/thinking spinner when `false`
- `showNext / nextDisabled / onNext` — controls the "Next Step" button (hidden in demo mode)

Steps 3–5 show an animated "Thinking" state while `ready` is false.

### Scenarios

| Key | Case |
|-----|------|
| `insurance` | 보험금 지급 심사 — high fraud score, `humanOutcome: "ESCALATE"` |
| `loan` | 주택담보대출 심사 — clean approval, `humanOutcome: "PASS"` |
| `investment` | 투자 상품 가입 심사 — suitability mismatch, `humanOutcome: "REVIEW"` |

### Styling

Tailwind with custom tokens defined in `tailwind.config.ts`:
- `brand-*` — orange accent (`#F37321`)
- `navy-*` — dark blue text (`#0A1C3A`, `#17386B`)
- `sky-*` — blue highlight
- `shadow-card` — standard card shadow

Fonts: `--font-manrope` (headings), `--font-noto-kr` (body, Korean).

### Adding a new scenario

1. Add a new key to `ScenarioKey` in `types.ts`
2. Add the full `ScenarioData` entry to `scenarioMap` in `data.ts`
3. Add a selection card in `Step1Scenario.tsx`

