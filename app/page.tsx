"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ScenarioKey = "insurance" | "loan" | "investment";

type Scenario = {
  key: ScenarioKey;
  title: string;
  summary: string;
  inputSummary: string;
  inputFields: Array<{ label: string; value: string }>;
  domainAI: {
    model: string;
    reasonCodes: string[];
    riskScore: string;
    decision: string;
  };
  trust: {
    reasonSummary: string;
    explanationDraft: string;
    hitlRouting: string;
    nextActions: string[];
  };
  delivery: {
    status: string;
    message: string;
    actions: string[];
  };
};

const scenarios: Scenario[] = [
  {
    key: "insurance",
    title: "보험금 지급",
    summary: "보험금 청구가 보류 또는 거절될 수 있는 상황",
    inputSummary: "고객이 수술비 보험금을 청구했지만 기존 병력 정보와 문진 이력이 충돌합니다.",
    inputFields: [
      { label: "청구 유형", value: "입원/수술비" },
      { label: "청구 금액", value: "3,250,000원" },
      { label: "최근 청구 이력", value: "90일 내 2회" },
      { label: "추가 확인", value: "진단서 원본 필요" }
    ],
    domainAI: {
      model: "Claim Risk Model v4.2",
      reasonCodes: ["OUT_OF_COVERAGE", "FRAUD_RISK_PATTERN"],
      riskScore: "82 / 100",
      decision: "HOLD"
    },
    trust: {
      reasonSummary: "보장 범위 해석과 이상 패턴 탐지가 동시에 감지되어 자동 지급을 보류했습니다.",
      explanationDraft: "청구 정보 일부가 약관상 보장 조건과 일치하지 않아 추가 확인이 필요합니다.",
      hitlRouting: "고액/반복 청구 조건 충족으로 보험 심사자 검토 라우팅",
      nextActions: ["추가 서류 제출", "재검토 요청", "상담 연결"]
    },
    delivery: {
      status: "지급 보류",
      message: "청구 내역 확인을 위해 추가 자료가 필요합니다. 자료 제출 후 우선 심사로 재안내 드립니다.",
      actions: ["추가 서류 제출", "재검토 요청", "상담사 연결"]
    }
  },
  {
    key: "loan",
    title: "대출 심사",
    summary: "대출 신청이 심사 모델에 의해 부결될 수 있는 상황",
    inputSummary: "신규 신용대출 신청 고객의 최근 소득 변동성과 부채비율이 높은 상태입니다.",
    inputFields: [
      { label: "신청 상품", value: "신용대출" },
      { label: "신청 한도", value: "40,000,000원" },
      { label: "부채비율(DTI)", value: "48%" },
      { label: "최근 연체", value: "12개월 내 1회" }
    ],
    domainAI: {
      model: "Credit Underwriting Model v6.1",
      reasonCodes: ["HIGH_DTI", "INCOME_VOLATILITY", "RECENT_DELINQUENCY"],
      riskScore: "77 / 100",
      decision: "DECLINE"
    },
    trust: {
      reasonSummary: "상환 여력 지표와 소득 안정성 기준을 동시에 충족하지 못해 승인 임계치를 넘지 못했습니다.",
      explanationDraft: "현재 제출된 정보 기준으로는 상환 부담이 높아 대출 승인이 어렵습니다.",
      hitlRouting: "신규 고객 + 경계 점수 구간으로 여신심사자 2차 확인",
      nextActions: ["소득 증빙 보완", "한도 조정 후 재신청", "상담 연결"]
    },
    delivery: {
      status: "심사 부결",
      message: "현재 조건에서는 대출 승인이 어렵습니다. 소득 증빙 보완 또는 한도 조정 후 재신청 가능합니다.",
      actions: ["재신청 가이드", "소득 증빙 제출", "상담사 연결"]
    }
  },
  {
    key: "investment",
    title: "투자 제한",
    summary: "고객 투자 성향상 고위험 상품 가입이 제한되는 상황",
    inputSummary: "안정형 투자 성향으로 분류된 고객이 고위험 파생형 상품 가입을 요청했습니다.",
    inputFields: [
      { label: "요청 상품", value: "고위험 파생형 ETF" },
      { label: "투자 성향", value: "안정형" },
      { label: "적합성 점수", value: "38 / 100" },
      { label: "최근 투자 경험", value: "원금 비보장 상품 없음" }
    ],
    domainAI: {
      model: "Suitability Guard Model v3.5",
      reasonCodes: ["RISK_PROFILE_MISMATCH", "EXPERIENCE_GAP"],
      riskScore: "74 / 100",
      decision: "RESTRICT"
    },
    trust: {
      reasonSummary: "고객의 등록 성향과 경험 정보가 상품 위험도와 맞지 않아 자동 제한되었습니다.",
      explanationDraft: "투자자 보호 기준상 현재 성향에서는 해당 상품 가입이 제한됩니다.",
      hitlRouting: "고객 이의제기 시 투자성향 재진단 상담으로 라우팅",
      nextActions: ["투자성향 재진단", "대안 상품 확인", "전문 상담 연결"]
    },
    delivery: {
      status: "투자 제한",
      message: "현재 투자 성향 기준으로는 해당 상품 가입이 제한됩니다. 성향 재진단 또는 대안 상품을 확인해 주세요.",
      actions: ["성향 재진단", "대안 상품 보기", "상담사 연결"]
    }
  }
];

const stepTitles = ["입력 상황", "Domain AI 판단", "TRUST Layer", "고객 전달 메시지"];

function SectionCard({
  title,
  children,
  tone = "default"
}: {
  title: string;
  children: React.ReactNode;
  tone?: "default" | "technical" | "friendly";
}) {
  const toneClass = {
    default: "border-sky-200 bg-white",
    technical: "border-navy-700/40 bg-gradient-to-b from-navy-900 to-navy-700 text-white",
    friendly: "border-sky-200 bg-sky-100/55"
  }[tone];

  return (
    <article className={`h-full min-h-[300px] rounded-2xl border p-5 shadow-card ${toneClass}`}>
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] opacity-90">{title}</h3>
      {children}
    </article>
  );
}

export default function Home() {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioKey>("insurance");
  const [visibleSteps, setVisibleSteps] = useState(0);
  const timeoutRef = useRef<number[]>([]);

  const scenario = useMemo(
    () => scenarios.find((entry) => entry.key === selectedScenario) ?? scenarios[0],
    [selectedScenario]
  );

  useEffect(
    () => () => {
      timeoutRef.current.forEach((id) => window.clearTimeout(id));
    },
    []
  );

  const runPipeline = () => {
    timeoutRef.current.forEach((id) => window.clearTimeout(id));
    setVisibleSteps(0);

    const first = window.setTimeout(() => setVisibleSteps(1), 120);
    const second = window.setTimeout(() => setVisibleSteps(2), 820);
    const third = window.setTimeout(() => setVisibleSteps(3), 1520);
    const fourth = window.setTimeout(() => setVisibleSteps(4), 2220);

    timeoutRef.current = [first, second, third, fourth];
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1400px] flex-col px-4 py-4 md:px-8 md:py-6">
      <header className="mb-4 rounded-2xl border border-sky-200 bg-white/90 px-6 py-5 text-center shadow-card backdrop-blur-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-500">H-TRUST</p>
        <h1 className="mt-1 font-[var(--font-manrope)] text-2xl font-semibold text-navy-900 md:text-3xl">
          H-TRUST Decision Flow Demo
        </h1>
        <p className="mt-1 text-sm font-medium text-navy-700 md:text-base">금융 AI는 어떻게 “No”를 전달하는가</p>
        <p className="mx-auto mt-2 max-w-3xl text-sm text-navy-700/90">
          Domain AI가 판단하고, TRUST Layer가 그 판단을 설명 가능하고 관리 가능한 결과로 바꿉니다.
        </p>
      </header>

      <section className="mb-4 rounded-2xl border border-sky-200 bg-white/90 p-4 shadow-card backdrop-blur-sm md:p-5">
        <div className="grid gap-3 md:grid-cols-3">
          {scenarios.map((item) => {
            const active = item.key === selectedScenario;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  setSelectedScenario(item.key);
                  setVisibleSteps(0);
                }}
                className={`rounded-xl border px-4 py-4 text-left transition-all ${
                  active
                    ? "border-sky-500 bg-sky-100 ring-2 ring-sky-200"
                    : "border-sky-200 bg-white hover:border-sky-400 hover:bg-sky-100/50"
                }`}
              >
                <p className="font-[var(--font-manrope)] text-lg font-semibold text-navy-900">{item.title}</p>
                <p className="mt-1 text-sm text-navy-700">{item.summary}</p>
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={runPipeline}
            className="rounded-lg bg-navy-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-700"
          >
            파이프라인 실행
          </button>
        </div>
      </section>

      <section className="mb-4">
        <div className="grid gap-3 md:grid-cols-4">
          <div
            className={`transition-all duration-500 ${
              visibleSteps >= 1 ? "translate-y-0 opacity-100" : "translate-y-3 opacity-30"
            }`}
          >
            <SectionCard title={stepTitles[0]}>
              <p className="mb-4 rounded-lg bg-sky-100/70 p-3 text-sm text-navy-700">{scenario.inputSummary}</p>
              <dl className="space-y-2.5">
                {scenario.inputFields.map((field) => (
                  <div key={field.label} className="flex justify-between gap-4 border-b border-sky-200/80 pb-2 text-sm">
                    <dt className="font-medium text-navy-700">{field.label}</dt>
                    <dd className="text-right font-semibold text-navy-900">{field.value}</dd>
                  </div>
                ))}
              </dl>
            </SectionCard>
          </div>

          <div
            className={`transition-all duration-500 ${
              visibleSteps >= 2 ? "translate-y-0 opacity-100" : "translate-y-3 opacity-30"
            }`}
          >
            <SectionCard title={stepTitles[1]} tone="technical">
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="font-medium text-sky-200/90">모델명</dt>
                  <dd className="mt-1 font-semibold">{scenario.domainAI.model}</dd>
                </div>
                <div>
                  <dt className="font-medium text-sky-200/90">내부 사유 코드</dt>
                  <dd className="mt-1">
                    <div className="flex flex-wrap gap-1.5">
                      {scenario.domainAI.reasonCodes.map((code) => (
                        <span key={code} className="rounded-md border border-white/30 bg-white/10 px-2 py-1 text-xs font-medium">
                          {code}
                        </span>
                      ))}
                    </div>
                  </dd>
                </div>
                <div className="flex items-center justify-between border-t border-white/20 pt-2">
                  <dt className="font-medium text-sky-200/90">리스크 점수</dt>
                  <dd className="font-semibold">{scenario.domainAI.riskScore}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="font-medium text-sky-200/90">판단 결과</dt>
                  <dd className="rounded-md bg-ambersoft-100 px-2.5 py-1 text-xs font-bold text-ambersoft-600">
                    {scenario.domainAI.decision}
                  </dd>
                </div>
              </dl>
            </SectionCard>
          </div>

          <div
            className={`transition-all duration-500 ${
              visibleSteps >= 3 ? "translate-y-0 opacity-100" : "translate-y-3 opacity-30"
            }`}
          >
            <SectionCard title={stepTitles[2]}>
              <div className="space-y-3 text-sm">
                <div className="rounded-lg border border-sky-200 bg-sky-100/50 p-2.5">
                  <p className="font-semibold text-navy-900">1) 사유 정리</p>
                  <p className="mt-1 text-navy-700">{scenario.trust.reasonSummary}</p>
                </div>
                <div className="rounded-lg border border-sky-200 bg-sky-100/50 p-2.5">
                  <p className="font-semibold text-navy-900">2) 설명 생성</p>
                  <p className="mt-1 text-navy-700">{scenario.trust.explanationDraft}</p>
                </div>
                <div className="rounded-lg border border-sky-200 bg-sky-100/50 p-2.5">
                  <p className="font-semibold text-navy-900">3) HITL 라우팅</p>
                  <p className="mt-1 text-navy-700">{scenario.trust.hitlRouting}</p>
                </div>
                <div className="rounded-lg border border-sky-200 bg-sky-100/50 p-2.5">
                  <p className="font-semibold text-navy-900">4) 후속 액션</p>
                  <p className="mt-1 text-navy-700">{scenario.trust.nextActions.join(" · ")}</p>
                </div>
              </div>
            </SectionCard>
          </div>

          <div
            className={`transition-all duration-500 ${
              visibleSteps >= 4 ? "translate-y-0 opacity-100" : "translate-y-3 opacity-30"
            }`}
          >
            <SectionCard title={stepTitles[3]} tone="friendly">
              <span className="inline-flex rounded-full bg-ambersoft-100 px-3 py-1 text-xs font-semibold text-ambersoft-600">
                {scenario.delivery.status}
              </span>
              <p className="mt-3 rounded-lg bg-white/90 p-3 text-sm leading-relaxed text-navy-800">{scenario.delivery.message}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {scenario.delivery.actions.map((action) => (
                  <button
                    key={action}
                    type="button"
                    className="rounded-md border border-sky-300 bg-white px-3 py-1.5 text-xs font-semibold text-navy-700"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>
      </section>

      <section className="grid flex-1 gap-3 pb-2 md:grid-cols-2">
        <article className="rounded-2xl border border-sky-200 bg-white/90 p-4 shadow-card backdrop-blur-sm">
          <h2 className="font-[var(--font-manrope)] text-lg font-semibold text-navy-900">왜 중요한가</h2>
          <ul className="mt-2 space-y-2 text-sm text-navy-700">
            <li>금융 AI는 false positive를 줄이기 위해 보수적으로 설계된다.</li>
            <li>그 결과 고객 입장에서는 이해하기 어려운 “No”가 늘어난다.</li>
            <li>H-TRUST는 이 결정을 설명 가능하고 관리 가능한 형태로 바꾼다.</li>
          </ul>
        </article>

        <article className="rounded-2xl border border-sky-200 bg-white/90 p-4 shadow-card backdrop-blur-sm">
          <h2 className="font-[var(--font-manrope)] text-lg font-semibold text-navy-900">Feedback Loop</h2>
          <p className="mt-2 rounded-lg bg-sky-100/60 p-3 text-sm font-medium text-navy-700">
            고객 요청 → Domain AI 판단 → TRUST 설명/전달 → 재검토·민원 발생 → 데이터 축적 → Domain AI 및 정책 개선
          </p>
          <p className="mt-2 text-sm text-navy-700">
            H-TRUST는 어려운 의사결정 사례를 구조화된 학습 데이터로 전환합니다.
          </p>
        </article>
      </section>
    </main>
  );
}
