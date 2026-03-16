import type { ScenarioData, ScenarioKey } from "./types";

export const scenarioMap: Record<ScenarioKey, ScenarioData> = {
  insurance: {
    title: "보험금 지급 심사",
    subtitle: "청구 자료 기반 지급 가능 여부 판단",
    submissions: ["진단서", "영수증", "치료 내역", "병원 확인서"],
    domainFindings: ["OUT_OF_COVERAGE", "FRAUD_PATTERN_DETECTED", "ADDITIONAL_DOCUMENT_REQUIRED"],
    trustDraft:
      "현재 제출된 자료 기준으로는 보험금 지급 여부를 바로 확정하기 어렵습니다. 추가 확인 후 최종 안내해 드리겠습니다.",
    citation: "보험 약관 제12조",
    redTeamRisks: ["Fraud suspicion wording risk", "Coverage ambiguity"],
    riskScores: [
      { label: "Temporal Accuracy", score: 91 },
      { label: "Evidence Quality", score: 93 },
      { label: "Policy Compliance", score: 88 },
      { label: "Risk Context", score: 86 }
    ],
    humanOutcome: "REVIEW",
    deliveryMessage:
      "현재 제출된 자료 기준으로는 보험금 지급이 어렵습니다. 다만 추가 서류를 제출하시면 재검토가 가능합니다."
  },
  loan: {
    title: "주택담보대출 심사",
    subtitle: "상환 능력과 사업자 진위 기반 승인 판단",
    submissions: ["소득 증빙", "사업자 등록 정보", "담보 서류", "기존 대출 현황"],
    domainFindings: ["BUSINESS_VERIFICATION_REQUIRED", "REFINANCING_ELIGIBILITY_CHECK"],
    trustDraft:
      "대출 심사 결과 일부 핵심 정보의 추가 검증이 필요합니다. 검증 완료 후 재심사를 진행합니다.",
    citation: "여신심사 운영지침 4.3",
    redTeamRisks: ["Eligibility phrasing risk", "Insufficient evidence disclosure"],
    riskScores: [
      { label: "Temporal Accuracy", score: 89 },
      { label: "Evidence Quality", score: 90 },
      { label: "Policy Compliance", score: 92 },
      { label: "Risk Context", score: 87 }
    ],
    humanOutcome: "ESCALATE",
    deliveryMessage:
      "대출 심사 결과 추가 확인이 필요합니다. 사업자 진위 여부 확인 후 재검토가 진행됩니다."
  },
  investment: {
    title: "투자 상품 가입 심사",
    subtitle: "투자 성향과 상품 위험도 적합성 판단",
    submissions: ["투자 성향 설문", "최근 거래 내역", "상품 가입 신청서", "위험 고지 확인"],
    domainFindings: ["RISK_PROFILE_MISMATCH", "HIGH_VOLATILITY_PRODUCT"],
    trustDraft:
      "현재 투자 성향과 상품 위험도 간 불일치가 확인되어 가입 제한 안내가 필요합니다.",
    citation: "투자자보호 기준 7.2",
    redTeamRisks: ["Over-restriction wording risk", "Context omission risk"],
    riskScores: [
      { label: "Temporal Accuracy", score: 92 },
      { label: "Evidence Quality", score: 90 },
      { label: "Policy Compliance", score: 94 },
      { label: "Risk Context", score: 89 }
    ],
    humanOutcome: "PASS",
    deliveryMessage: "현재 투자 성향 기준으로 해당 상품 가입이 제한됩니다."
  }
};

export const scenarioEntries = Object.entries(scenarioMap) as [ScenarioKey, ScenarioData][];
