# H-TRUST Demo

![H-TRUST Demo](output/h-trust-demo.gif)

Financial AI Trust Infrastructure를 한 화면에서 보여주는 인터랙티브 데모.

`Domain AI → TRUST Layer → Human Step → Final Message`

모델 성능 자랑이 아니라, **의사결정이 고객 전달 문구로 변환되는 과정**을 시각화하는 프로젝트입니다.

## Why This Exists
- 금융 AI 결과는 강력하지만 그대로 전달하면 분쟁이 생깁니다.
- TRUST Layer는 내부 판단을 설명 가능한 문안으로 바꾸고,
- Human Step은 정책/법적 리스크를 최종 통제합니다.

---

## Stack

| 항목 | 내용 |
|---|---|
| Framework | Next.js 14 (App Router) |
| UI | React 18, Tailwind CSS, Framer Motion |
| AI | Google Gemini 2.5 Flash (`@google/generative-ai`) |
| Test | Vitest |
| Recording | Playwright + Python imageio/imageio-ffmpeg |

---

## Quick Start

```bash
npm install
cp .env.local.example .env.local   # GEMINI_API_KEY 입력
npm run dev
```

브라우저: `http://localhost:3000`

### 환경 변수

```
GEMINI_API_KEY=<Google AI Studio에서 발급>
```

키 발급: [https://aistudio.google.com](https://aistudio.google.com)

> API 키가 없어도 앱은 동작합니다. AI 모드로 설정된 단계는 자동으로 정적 데이터로 fallback되며 **Static Mode** 배지가 표시됩니다.

---

## How to Use

### 1. Pipeline Configuration (앱 시작 시)

앱을 열면 **Pipeline Configuration** 모달이 표시됩니다. 각 단계별로 AI 호출 여부를 선택합니다.

| 설정 | 설명 |
|---|---|
| **AI** | 해당 필드를 Gemini 2.5 Flash로 실시간 생성 |
| **Static** | 시나리오에 사전 정의된 데이터를 즉시 표시 |

설정 항목:

```
Step 2  Input Mode       Interactive / Static
Step 3  Snapshot         AI / Static
        Findings         AI / Static
        Summary          AI / Static
Step 4  Draft & Citation AI / Static
Step 5  Risks            AI / Static
        Scores           AI / Static
```

설정 후 **데모 시작** 버튼을 누르면 파이프라인이 시작됩니다. 시나리오를 바꿔도 설정은 유지됩니다.

---

### 2. Step 1 — Scenario 선택

보험금 청구 / 주택담보대출 / 투자 상품 중 하나를 선택합니다.

| 시나리오 | 사례 | 최종 결과 |
|---|---|---|
| `insurance` | 교통사고 치료비 350만원 청구 | ESCALATE |
| `loan` | 강남구 아파트 담보 2억 대출 | PASS |
| `investment` | 은퇴자 하이일드 채권펀드 가입 | REVIEW |

---

### 3. Step 2 — Customer Submission

**Interactive Mode** (기본 권장):
- 텍스트 영역에 고객 문의를 직접 입력합니다.
- 하단 예시 문구 칩을 클릭하면 시나리오의 기본 문구가 채워집니다.
- 첨부파일 옵션을 클릭해 선택/해제합니다. 선택하지 않으면 첨부 없음으로 처리됩니다.
- 문의 내용이 있으면 **자료 제출 버튼**이 활성화됩니다.

**Static Mode**:
- 시나리오에 정의된 문구가 자동 타이핑됩니다.
- 첨부파일이 순서대로 READY 상태가 되면 제출 버튼이 활성화됩니다.

> Step 2에서 입력한 내용(문의 텍스트 + 첨부파일 선택)이 Step 3 Gemini 프롬프트의 직접 입력으로 사용됩니다.

---

### 4. Step 3 — Domain AI 분석

AI Mode일 때 Gemini가 생성하는 항목:

- **Snapshot** — Fraud Score, Confidence, Attached Type (0~1 수치 + 레벨), Timestamp(서버 주입)
- **Findings** — 심사 발견사항 3~5개 (각 1문장, 한국어)
- **Summary** — 전체 요약 1문장

Static Mode일 때는 `data.ts`의 사전 정의 값을 즉시 표시합니다.

---

### 5. Step 4 — Trust Layer (Draft & Citation)

Gemini가 Step 3 findings를 입력으로 받아 고객 전달 초안과 법령 인용을 생성합니다.

- 단정적 표현 금지, 고객 친화적 문체
- 관련 법령 조항 1개 인용
- Static Mode: `data.ts`의 사전 작성 초안 즉시 표시

---

### 6. Step 5 — Trust Layer (Red Team)

Gemini가 Step 4 초안을 적대적으로 검토합니다.

- **Risks** — 법적/정책 리스크 항목 (CRITICAL / HIGH / MINOR)
- **Scores** — Temporal Accuracy, Evidence Quality, Policy Compliance, Risk Context (0~100)
- Static Mode: `data.ts`의 사전 정의 리스크/점수 즉시 표시

---

### 7. Step 6 — Human Review

심사자가 최종 판단을 내립니다. 시나리오별 결과:
- `ESCALATE` — 사기 의심, 상위 심사로 이관
- `PASS` — 조건 충족, 승인
- `REVIEW` — 추가 검토 필요

---

### 8. Step 7 — Final Message

고객에게 전달할 최종 메시지와 follow-up 정보가 표시됩니다.

---

## Demo Mode

URL 파라미터로 자동 시연 모드를 실행할 수 있습니다.

```
/?demo=1           # 기본 간격(1초)
/?demo=1&ms=1200   # 1.2초 간격
```

Demo Mode 특징:
- Pipeline Configuration 모달 건너뜀 (기본 설정: 전체 AI)
- 모든 Step 동시에 표시
- 지정 간격으로 carousel 자동 순환
- AI 호출 없이 정적 데이터로 즉시 표시

---

## AI Integration

Steps 3, 4, 5 모두 Gemini 2.5 Flash를 사용합니다.

### 데이터 흐름

```
page.tsx
  └─ Pipeline Config에 따라 runStep(3 | 4 | 5) 호출
       └─ app/lib/pipeline.ts
            └─ POST /api/pipeline/[step]
                 └─ buildStep{N}Prompt(...)   ← app/lib/prompts/step{N}.ts
                 └─ Gemini 2.5 Flash 호출 (retry w/ backoff on 503)
                 └─ parseStep{N}Response(text)
                 └─ StepNResult 반환
  └─ Config에 따라 AI 결과 / 정적 데이터 선택적 병합
  └─ Step 컴포넌트 렌더링
```

### Step별 프롬프트 입력/출력

| Step | 입력 | 출력 |
|---|---|---|
| 3 | 시나리오 제목, 사용자 문의 텍스트, 첨부파일 목록 | `snapshot[]`, `findings[]`, `summary` |
| 4 | 시나리오 제목, 사용자 문의 텍스트, Step 3 findings | `draft`, `citation` |
| 5 | 시나리오 제목, Step 4 draft, Step 4 citation | `risks[]`, `scores[]` |

### Fallback & 안정성

- API 키 없음 또는 오류 → 정적 데이터 자동 사용, **Static Mode** 배지 표시
- 503 오류 → 최대 2회 재시도 (1s, 2s 지수 백오프)
- JSON 파싱 실패 / 필드 누락 → 각 파서가 `fallbackReason`과 함께 정적 데이터로 전환

---

## Project Layout

```
app/
  page.tsx                          # 클라이언트 상태 머신, Pipeline Config 라우팅
  components/
    PipelineConfigModal.tsx         # 시작 시 설정 모달
    steps/
      types.ts                      # ScenarioKey, UserInput, PipelineModeConfig 등
      data.ts                       # 시나리오 정적 데이터 (single source of truth)
      Step1Scenario.tsx ~ Step7Delivery.tsx
  api/pipeline/[step]/route.ts      # Gemini 호출 API Routes (Steps 3/4/5/6)
  lib/
    pipeline.ts                     # 클라이언트 측 runStep() 실행 로직
    types.ts                        # Step3/4/5Result, FallbackReason
    prompts/
      step3.ts                      # buildStep3Prompt / parseStep3Response
      step4.ts                      # buildStep4Prompt / parseStep4Response
      step5.ts                      # buildStep5Prompt / parseStep5Response
    __tests__/                      # Vitest 단위 테스트 (48 tests)
docs/                               # 기획/시나리오 원본
output/                             # 최종 영상 산출물
scripts/                            # 녹화/인코딩 스크립트
```

---

## Scenarios

`app/components/steps/data.ts`가 단일 소스입니다.

| Key | 사례 | 시나리오 |
|---|---|---|
| `insurance` | 보험금 지급 심사 | 교통사고 치료비 350만원 청구, 사기 패턴 감지 → ESCALATE |
| `loan` | 주택담보대출 심사 | 강남구 아파트 담보 2억, LTV/DTI 기준 충족 → PASS |
| `investment` | 투자 상품 가입 심사 | 은퇴자 고위험 상품 가입, 적합성 불일치 → REVIEW |

### 새 시나리오 추가

1. `types.ts` — `ScenarioKey`에 키 추가
2. `data.ts` — `scenarioMap`에 `ScenarioData` 항목 추가
3. `Step1Scenario.tsx` — 선택 카드 추가

---

## Recording

dev server가 먼저 실행 중이어야 합니다 (`npm run dev`).

```bash
# Demo Carousel 캡처
node scripts/record-demo.mjs \
  --url 'http://127.0.0.1:3000/?demo=1&ms=1200' \
  --framesDir output/frames-1200 \
  --frames 180

python3 scripts/encode-demo.py \
  --frames 'output/frames-1200/frame-*.png' \
  --out-prefix output/h-trust-demo \
  --fps 10

# 일반 플로우 캡처
node scripts/record-flow.mjs
python3 scripts/encode-demo.py \
  --frames 'output/frames-flow/frame-*.png' \
  --out-prefix output/h-trust-flow-864-1x \
  --fps 10
```

---

## Commands

```bash
npm run dev      # 개발 서버 (http://localhost:3000)
npm run build    # 프로덕션 빌드
npm run lint     # ESLint
npx vitest run   # 단위 테스트 실행 (48 tests)
```
