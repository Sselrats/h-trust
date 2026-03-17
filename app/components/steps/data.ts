import type { ScenarioData, ScenarioKey } from "./types";

export const scenarioMap: Record<ScenarioKey, ScenarioData> = {
  insurance: {
    title: "보험금 지급 심사",
    subtitle: "교통사고 치료비 350만원 청구 건",
    userText:
      "교통사고로 A정형외과에서 치료받았습니다. MRI랑 물리치료를 많이 받았는데 치료비가 350만원 나와서 이를 보험금으로 청구합니다.",
    submissions: ["진단서", "영수증", "병원 확인서", "CT 영상"],
    caseId: "case_260327",
    domainSnapshot: [
      { label: "Fraud Score", value: "0.95 (높음)" },
      { label: "Confidence", value: "0.92" },
      { label: "Attached Type", value: "text + image + video" },
      { label: "Timestamp", value: "2026-03-27T05:00:00Z" }
    ],
    domainFindings: [
      "HIGH_FRAUD_SIMILARITY",
      "CLINIC_PATTERN_MATCH",
      "ADDITIONAL_EVIDENCE_REQUIRED"
    ],
    trustDraft:
      "고객님, 청구하신 치료비 건에 대해 안내드립니다.\n\n청구 내역을 분석한 결과, 과거 보험 사기 사례와 유사한 패턴이 감지되어 현재 지급이 어렵습니다.\n\n고객님께서 방문하신 A 정형외과는 최근 6개월간 동일한 유형의 청구가 다수 접수된 이력이 있어 추가 확인이 필요합니다.\n\n따라서 본 건은 정밀 심사 대상으로 분류되며, 필요 시 관련 자료가 수사기관 또는 유관기관 검토에 활용될 수 있습니다.",
    citation: "내부 사기 탐지 데이터베이스",
    redTeamRisks: [
      {
        severity: "CRITICAL",
        title: "명예훼손성 표현",
        detail: "'보험 사기', '조직적 사기 패턴' 등 단정 표현은 미확정 사안에서 법적 분쟁 리스크가 큼"
      },
      {
        severity: "HIGH",
        title: "협박성 해석 가능",
        detail: "'수사기관 제출' 문구가 고객 위협으로 읽힐 수 있어 청구권 행사 방해 논란 가능"
      },
      {
        severity: "HIGH",
        title: "확정적 거절 표현",
        detail: "'지급이 불가능' 단정은 약관상 소명 기회 부여 의무와 충돌 가능"
      },
      {
        severity: "MINOR",
        title: "근거 설명 부족",
        detail: "내부 DB 근거만으로 단정 시 외부 검증 가능성이 낮아 수용성 저하"
      }
    ],
    riskScores: [
      { label: "Temporal Accuracy", score: 94, note: "시점 정확" },
      { label: "Evidence Quality", score: 72, note: "AI 판단 단독으로는 부족" },
      { label: "Policy Compliance", score: 48, note: "명예훼손 리스크 높음" },
      { label: "Risk Context", score: 35, note: "법적 분쟁 가능성 높음" }
    ],
    humanOutcome: "ESCALATE",
    deliveryMessage:
      "고객님, 청구하신 치료비 건은 추가 확인이 필요한 상태입니다.\n\n아래 보완 자료를 제출해 주시면 재심사를 진행하겠습니다.\n- 치료 경위 상세 설명서\n- 교통사고 사실 확인서\n- 진료 기록 사본(의사 소견서 포함)\n- 영수증 원본\n\n소명 기간은 접수일로부터 14일이며, 기한 내 제출이 어려우시면 연장 신청이 가능합니다.",
    followUps: [
      "Citation: 보험업법 시행령 제42조의2(소명 기회)",
      "이의제기: 금융감독원 1332",
      "고객센터: 1588-XXXX"
    ]
  },
  loan: {
    title: "주택담보대출 심사",
    subtitle: "강남구 아파트 담보 2억원 신청 건",
    userText: "강남구 아파트 담보로 2억 대출 신청합니다. 직장인이고 연소득 8천만원입니다.",
    submissions: ["재직증명서", "급여명세서(6개월)", "건강보험자격득실확인서", "등기부등본", "감정평가서"],
    caseId: "case_260327_loan",
    domainSnapshot: [
      { label: "Fraud Score", value: "0.12 (낮음)" },
      { label: "Income Verification", value: "stable" },
      { label: "LTV / DTI", value: "0.65 / 0.28" },
      { label: "Confidence", value: "0.94" }
    ],
    domainFindings: ["ELIGIBLE_COLLATERAL", "STABLE_INCOME", "REGULATION_COMPLIANT"],
    trustDraft:
      "고객님, 신청하신 주택담보대출 2억원 건에 대해 안내드립니다.\n\n제출하신 서류 검토 결과, 담보 평가액 3억1천만원(LTV 65%), 연소득 8천만원(재직 확인), DTI 28%로 모든 심사 기준을 충족했습니다.\n\n적용 금리는 연 3.8%이며, 대출 기간은 30년입니다. 실행을 원하시면 영업점 방문 예약 부탁드립니다.",
    citation: "주택담보대출 운용지침 제5조",
    redTeamRisks: [
      {
        severity: "MINOR",
        title: "승인 단계 모호성",
        detail: "'승인이 가능합니다'가 가승인/최종승인을 구분하지 않아 오해 소지"
      },
      {
        severity: "MINOR",
        title: "금리 조건 불완전",
        detail: "변동금리 조정 가능성, 기준금리 연동 구조 고지 보완 필요"
      },
      {
        severity: "MINOR",
        title: "필수 고지 일부 누락",
        detail: "중도상환 수수료 등 약관 주요 항목 선고지 권장"
      }
    ],
    riskScores: [
      { label: "Temporal Accuracy", score: 98, note: "최신 금리 정책 반영" },
      { label: "Evidence Quality", score: 96, note: "서류 검증 완료" },
      { label: "Policy Compliance", score: 86, note: "경미한 문구 보완 필요" },
      { label: "Risk Context", score: 92, note: "저위험군" }
    ],
    humanOutcome: "PASS",
    deliveryMessage:
      "고객님, 신청하신 주택담보대출 2억원 건이 최종 승인되었습니다.\n\n- 대출 금액: 2억원 (LTV 65%)\n- 적용 금리: 연 3.8% (변동금리, 3개월 CD 연동)\n- 대출 기간: 30년\n- 상환 방식: 원리금균등분할상환",
    followUps: [
      "Citation: 주택담보대출 약정서 제3조",
      "중도상환 수수료: 3년 이내 잔액의 1.2%",
      "방문 일정: 2026.03.29 14:00 강남지점"
    ]
  },
  investment: {
    title: "투자 상품 가입 심사",
    subtitle: "은퇴자 하이일드 채권펀드 가입 요청",
    userText:
      "은퇴 후 여유자금 3천만원으로 안정적인 투자 하고 싶어요. 글로벌 하이일드 채권펀드 추천받았는데 가입하고 싶습니다.",
    submissions: ["투자자정보확인서", "소득증빙서류", "신분증"],
    caseId: "case_260327_invest",
    domainSnapshot: [
      { label: "Suitability Score", value: "0.42 (중간-낮음)" },
      { label: "Investor Type", value: "conservative(안정형)" },
      { label: "Product Risk", value: "aggressive(4등급 고위험)" },
      { label: "Confidence", value: "0.88" }
    ],
    domainFindings: ["RISK_PROFILE_MISMATCH", "HIGH_VOLATILITY_PRODUCT", "ELDERLY_PROTECTION_REQUIRED"],
    trustDraft:
      "고객님, 신청하신 글로벌 하이일드 채권 펀드 가입에 대해 안내드립니다.\n\n본 상품은 높은 수익을 추구하는 상품으로 과거 3년 평균 수익률은 9.5%입니다. 전문 운용사가 관리하여 안정적인 수익 창출이 가능하며 고객님의 은퇴 자금 운용에 적합합니다.\n\n가입 절차를 진행하시려면 신청서에 서명 부탁드립니다.",
    citation: "투자설명서 제1조",
    redTeamRisks: [
      {
        severity: "CRITICAL",
        title: "불완전판매 위험",
        detail: "안정형 투자성향과 4등급 고위험 상품 불일치로 적합성 원칙 위반 가능"
      },
      {
        severity: "HIGH",
        title: "수익률 오인 유도",
        detail: "과거 수익률 강조와 '안정적' 표현이 미래 수익 보장으로 오해될 수 있음"
      },
      {
        severity: "CRITICAL",
        title: "원금 손실 위험 미고지",
        detail: "고위험 채권 상품의 필수 위험 고지 누락 시 법적 제재 가능"
      },
      {
        severity: "HIGH",
        title: "고령 투자자 보호 미흡",
        detail: "62세 저경험 투자자 대상 추가 보호 절차 필요"
      }
    ],
    riskScores: [
      { label: "Temporal Accuracy", score: 96, note: "최신 상품 정보" },
      { label: "Evidence Quality", score: 78, note: "위험 고지 누락" },
      { label: "Policy Compliance", score: 38, note: "불완전판매 위험 높음" },
      { label: "Risk Context", score: 32, note: "법적 제재 위험 높음" }
    ],
    humanOutcome: "REVIEW",
    deliveryMessage:
      "고객님, 신청하신 글로벌 하이일드 채권 펀드는 투자 성향(안정형)과 상품 위험등급(4등급)이 일치하지 않아 추가 확인이 필요합니다.\n\n본 상품은 원금 손실 가능성이 있으며, 과거 수익률은 미래 수익을 보장하지 않습니다.\n\n가입을 원하실 경우 투자 성향 재측정 또는 고위험 상품 투자 확인서 서명이 필요합니다.",
    followUps: [
      "Citation: 투자자정보확인서(2025.11.20), 투자설명서 제2조",
      "대안상품: 국내 채권형(2등급), 배당주 혼합형(3등급)",
      "문의: 담당 PB 김OO / 금융감독원 1332"
    ]
  }
};

export const scenarioEntries = Object.entries(scenarioMap) as [ScenarioKey, ScenarioData][];
