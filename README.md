# H-TRUST Demo

Financial AI Trust Infrastructure를 한 화면에서 보여주는 인터랙티브 데모.

`Domain AI -> TRUST Layer -> Human Step -> Final Message`

모델 성능 자랑이 아니라, **의사결정이 고객 전달 문구로 변환되는 과정**을 시각화하는 프로젝트입니다.

## Why This Exists
- 금융 AI 결과는 강력하지만 그대로 전달하면 분쟁이 생깁니다.
- TRUST Layer는 내부 판단을 설명 가능한 문안으로 바꾸고,
- Human Step은 정책/법적 리스크를 최종 통제합니다.

## Stack
- Next.js 14 (App Router)
- React 18
- Tailwind CSS
- Framer Motion
- Playwright (녹화 자동화)
- Python imageio/imageio-ffmpeg (gif/mp4 인코딩)

## Project Layout
- `app/`: 데모 UI
- `app/components/steps/`: Step 1~7 컴포넌트
- `docs/`: 기획/피드백/시나리오 원본
- `output/`: 최종 영상 산출물
- `scripts/`: 녹화/인코딩 스크립트

## Run
```bash
npm install
npm run dev
```

브라우저: `http://localhost:3000`

## Demo Modes
- 기본 데모: `/?demo=1`
- 회전 간격(ms) 지정: `/?demo=1&ms=1200`

`demo=1` 모드 특징:
- 모든 Step 펼침
- carousel-like 순환
- 지정 간격으로 자동 포커스 이동

## Recording
### 1) Demo Carousel 캡처
```bash
node scripts/record-demo.mjs \
  --url 'http://127.0.0.1:3000/?demo=1&ms=1200' \
  --framesDir output/frames-1200 \
  --frames 180

python3 scripts/encode-demo.py \
  --frames 'output/frames-1200/frame-*.png' \
  --out-prefix output/h-trust-demo \
  --fps 10
```

### 2) 일반 플로우 캡처
```bash
node scripts/record-flow.mjs
python3 scripts/encode-demo.py \
  --frames 'output/frames-flow/frame-*.png' \
  --out-prefix output/h-trust-flow-864-1x \
  --fps 10
```

## Final Outputs
Git tracked 최종본:
- `output/h-trust-demo.gif`
- `output/h-trust-demo.mp4`

`output/*`는 기본 ignore이며, 위 2개만 예외 추적됩니다.

## Scenario Source
- `docs/scenarios/case1.txt` 보험
- `docs/scenarios/case2.txt` 주택담보대출
- `docs/scenarios/case3.txt` 투자상품

앱 데이터 매핑 파일:
- `app/components/steps/data.ts`

## Notes
- Step 3/4/5는 AI thinking 상태를 명시적으로 보여줍니다.
- Step 4/5는 초안 생성과 Red Team 검토를 분리해 리스크 통제를 시각화합니다.
- Step 7은 고객 질문 재명시 + 최종 전달 문구를 제공합니다.
