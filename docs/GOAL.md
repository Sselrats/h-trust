# Codex 구현 프롬프트 (업그레이드 버전)

발표용 **단일 페이지 인터랙티브 데모 웹사이트**를 구현해줘.

이 데모는 **H-TRUST 금융 AI 의사결정 파이프라인**을 시각적으로 보여주는 것이 목적이다.

핵심 메시지:

> Domain AI는 판단을 만들고
> TRUST Layer는 그 판단을 설명 가능하고 관리 가능한 결정으로 바꾼다.

기술 스택:

- Next.js
- React
- Tailwind CSS
- Framer Motion (단계 애니메이션)

이 데모는 **모델 성능 데모가 아니라 파이프라인 시각화 데모**다.

---

# 전체 UI 레이아웃

```text
Header

Scenario Selector

Pipeline Timeline (가로)

Step Content Area (세로)

Insight / Feedback Loop
```

핵심 특징:

- **단계 진행 방향은 가로**
- **각 단계 내용은 세로**
- **모바일 최적화**

---

# Pipeline 단계 구조

총 **7단계 파이프라인**

```text
1 Scenario 선택
2 고객 자료 제출
3 Domain AI 분석
4 TRUST Layer Agent #1
5 TRUST Layer Agent #2
6 Human Step
7 고객 전달
```

각 단계는 **가로 Timeline**으로 표시.

도착하지 않은 단계는

```text
Shadow Placeholder
```

형태로 표시.

---

# 단계 진행 방식

각 단계에는

- **Next Step 버튼**
- **3초 카운트다운 자동 진행**

이 두 가지가 모두 있어야 한다.

```text
Next Step
(3초 후 자동 진행)
```

---

# Step 1 — Scenario 선택

3개의 카드 선택

### 시나리오

1 보험금 지급 심사
2 주택담보대출 심사
3 투자 상품 가입 심사

카드 선택 시

```text
selectedScenario state 업데이트
```

---

# Step 2 — 고객 자료 제출

제목:

```text
Customer Submission
```

내용:

고객 제출 자료 리스트

예:

보험 시나리오

- 진단서
- 영수증
- 치료 내역
- 병원 확인서

UI:

```text
첨부파일 목록
[자료 제출 버튼]
```

버튼 클릭 시 Step 3 진행

---

# Step 3 — Domain AI Step

제목:

```text
Domain AI 분석
```

상태 표시:

```text
분석 및 심사 중...
```

로딩 애니메이션 후 결과 표시.

### Output

```text
Domain Finding
```

예:

보험

- OUT_OF_COVERAGE
- FRAUD_PATTERN_DETECTED
- ADDITIONAL_DOCUMENT_REQUIRED

대출

- BUSINESS_VERIFICATION_REQUIRED
- REFINANCING_ELIGIBILITY_CHECK

투자

- RISK_PROFILE_MISMATCH
- HIGH_VOLATILITY_PRODUCT

---

# Step 4 — TRUST Layer Agent Step #1

제목:

```text
Trust Layer Agent #1
```

상태

```text
Domain Finding 분석 중...
```

### Output

Draft 초안 생성

Citation 포함

예

```text
현재 제출된 자료 기준으로는 보험금 지급 여부를 바로 확정하기 어렵습니다.
(보험 약관 제12조)
```

---

# Step 5 — TRUST Layer Agent Step #2

제목

```text
Trust Layer Agent #2
```

상태

```text
Draft 분석 중...
```

### Output

Red-Team Report

예

```text
Potential Risk:
- Fraud suspicion wording risk
- Coverage ambiguity
```

Risk Score List

예

```text
Temporal Accuracy: 91
Evidence Quality: 93
Policy Compliance: 88
Risk Context: 86
```

---

# Step 6 — Human Step

제목

```text
Human Review
```

상태

```text
인간 검토 중...
```

결과는 **시나리오별로 고정**

### 보험

```text
Result: Review
```

### 대출

```text
Result: Escalate
```

### 투자

```text
Result: Pass
```

---

# Step 6 분기 로직

```text
Pass → Step 7
Review → Human 수정 후 Step 7
Escalate → 전문가 검토 → Draft 재생성 → Step 7
```

Escalate의 경우

```text
Case stored in escalation DB
```

표시.

---

# Step 7 — 고객 전달

제목

```text
Customer Delivery
```

고객 메시지 표시.

보험 예

```text
현재 제출된 자료 기준으로는 보험금 지급이 어렵습니다.
다만 추가 서류를 제출하시면 재검토가 가능합니다.
```

대출 예

```text
대출 심사 결과 추가 확인이 필요합니다.
사업자 진위 여부 확인 후 재검토가 진행됩니다.
```

투자 예

```text
현재 투자 성향 기준으로 해당 상품 가입이 제한됩니다.
```

---

# Bottom Insight 영역

두 가지 카드 표시

### Why This Matters

```text
금융 AI는 false positive를 줄이기 위해 보수적으로 설계된다.
그 결과 고객이 이해하기 어려운 “No”가 증가한다.
H-TRUST는 이 “No”를 납득 가능한 결정으로 바꾼다.
```

---

### Feedback Loop

```text
AI Decision
→ Customer Reaction
→ Review / Complaint
→ Data Collection
→ Domain AI Improvement
```

---

# 시나리오별 Human Step 결과

```javascript
const scenarioHumanOutcome = {
  insurance: "REVIEW",
  loan: "ESCALATE",
  investment: "PASS",
};
```

---

# 디자인 가이드

스타일:

- 금융 대시보드
- 밝은 배경
- 네이비 포인트
- 카드 UI
- 큰 글씨

중요:

```text
모바일 최적화
```

가로 timeline
세로 카드 콘텐츠.

---

# 핵심 목적

이 데모는 다음 메시지를 전달해야 한다.

```text
Domain AI는 판단을 만든다
TRUST Layer는 그 판단을 관리한다
Human Step은 책임을 담당한다
```

즉

```text
Financial AI Trust Infrastructure
```

를 보여주는 데모다.
