import type { ScenarioData } from "./types";
import type { Step5Result } from "../../lib/types";

type Props = {
  scenario: ScenarioData;
  ready: boolean;
  showNext: boolean;
  nextDisabled: boolean;
  onNext: () => void;
  risks?: Step5Result["risks"];
  scores?: Step5Result["scores"];
  source?: "ai" | "fallback";
};

const severityClass = {
  CRITICAL: "bg-red-100 text-red-700",
  HIGH: "bg-amber-100 text-amber-700",
  MINOR: "bg-slate-100 text-slate-700"
} as const;

export default function Step5TrustAgent2({ scenario, ready, showNext, nextDisabled, onNext, risks, scores, source }: Props) {
  const displayRisks = risks ?? scenario.redTeamRisks;
  const displayScores = scores ?? scenario.riskScores;

  return (
    <article className="rounded-2xl border border-red-300/60 bg-gradient-to-b from-red-50 to-white p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-700">Step 5</p>
          <h3 className="mt-1 font-[var(--font-manrope)] text-xl font-semibold text-navy-900">Trust Layer - Red Team LLM</h3>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-red-700">Adversarial Review</span>
      </div>

      {!ready ? (
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-3 text-sm text-navy-700">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
            Draft 리스크 점검 중...
          </div>
          <div className="rounded-lg border border-red-200 bg-white p-3">
            <p className="text-xs font-semibold text-red-700">Thinking</p>
            <ul className="mt-2 space-y-1.5 text-xs text-slate-700">
              <li className="animate-pulse">- 법적 분쟁 유발 표현 탐지</li>
              <li className="animate-pulse [animation-delay:220ms]">- 소비자 오인/협박 해석 가능성 점검</li>
              <li className="animate-pulse [animation-delay:420ms]">- 내부 자료 근거의 대외 설명 가능성 검토</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {source === "fallback" && (
            <p className="md:col-span-2 inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
              Static Mode
            </p>
          )}
          <div className="rounded-xl border border-red-200 bg-white p-4">
            <p className="text-sm font-semibold text-red-700">Red-Team Report</p>
            <ul className="mt-2 space-y-2 text-sm text-navy-800">
              {displayRisks.map((risk) => (
                <li key={risk.title} className="rounded-md bg-slate-50 p-2">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <p className="font-semibold">{risk.title}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${severityClass[risk.severity]}`}>
                      {risk.severity}
                    </span>
                  </div>
                  <p className="text-xs text-navy-700">{risk.detail}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-red-200 bg-white p-4">
            <p className="text-sm font-semibold text-navy-800">Risk Score List</p>
            <ul className="mt-2 space-y-2 text-sm text-navy-700">
              {displayScores.map((item) => (
                <li key={item.label}>
                  <div className="mb-1 flex items-center justify-between">
                    <span>{item.label}</span>
                    <span className="font-semibold text-navy-900">{item.score}</span>
                  </div>
                  <div className="h-1.5 rounded bg-slate-100">
                    <div className="h-1.5 rounded bg-red-500" style={{ width: `${item.score}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-slate-600">{item.note}</p>
                </li>
              ))}
            </ul>
          </div>
          <p className="md:col-span-2 text-xs font-semibold text-slate-600">요약: 전달 문구의 법적/정책 리스크를 내부 자료 기준으로 정리했고, 고위험 표현은 수정 권고됩니다.</p>
        </div>
      )}

      {showNext ? (
        <div className="mt-4">
          <button
            type="button"
            onClick={onNext}
            disabled={nextDisabled}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            Next Step
          </button>
        </div>
      ) : null}
    </article>
  );
}
