import type { ScenarioData } from "./types";

type Props = {
  scenario: ScenarioData;
  ready: boolean;
  showNext: boolean;
  nextDisabled: boolean;
  onNext: () => void;
};

export default function Step5TrustAgent2({ scenario, ready, showNext, nextDisabled, onNext }: Props) {
  return (
    <article className="rounded-2xl border border-[#22c55e]/45 bg-[#22c55e]/10 p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#15803d]">Step 5</p>
          <h3 className="mt-1 font-[var(--font-manrope)] text-xl font-semibold text-navy-900">Trust Layer - Red Team LLM</h3>
        </div>
        <span className="rounded-full bg-[#dcfce7] px-3 py-1 text-xs font-semibold text-[#15803d]">Adversarial Review</span>
      </div>

      {!ready ? (
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-3 text-sm text-navy-700">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#22c55e] border-t-transparent" />
            Draft 리스크 점검 중...
          </div>
          <div className="rounded-lg border border-[#22c55e]/40 bg-[#dcfce7] p-3">
            <p className="text-xs font-semibold text-[#166534]">Thinking</p>
            <ul className="mt-2 space-y-1.5 text-xs text-[#14532d]">
              <li className="animate-pulse">- 과도한 단정/오해 가능 표현 탐지</li>
              <li className="animate-pulse [animation-delay:220ms]">- 증거 부족 구간 및 누락 맥락 확인</li>
              <li className="animate-pulse [animation-delay:420ms]">- 소비자 보호 정책 위반 리스크 점검</li>
            </ul>
          </div>
          <div className="grid gap-2">
            <div className="h-2 w-full animate-pulse rounded bg-[#86efac]" />
            <div className="h-2 w-11/12 animate-pulse rounded bg-[#86efac]" />
            <div className="h-2 w-3/4 animate-pulse rounded bg-[#86efac]" />
            <div className="h-2 w-2/3 animate-pulse rounded bg-[#86efac]" />
          </div>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-[#22c55e]/45 bg-[#dcfce7]/85 p-4">
            <p className="text-sm font-semibold text-[#15803d]">Red-Team Report</p>
            <ul className="mt-2 space-y-1.5 text-sm text-navy-800">
              {scenario.redTeamRisks.map((risk) => (
                <li key={risk} className="rounded-md bg-white/90 px-2 py-1">
                  Potential Risk: {risk}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-[#22c55e]/45 bg-[#dcfce7]/65 p-4">
            <p className="text-sm font-semibold text-navy-800">Risk Score List</p>
            <ul className="mt-2 space-y-2 text-sm text-navy-700">
              {scenario.riskScores.map((item) => (
                <li key={item.label}>
                  <div className="mb-1 flex items-center justify-between">
                    <span>{item.label}</span>
                    <span className="font-semibold text-navy-900">{item.score}</span>
                  </div>
                  <div className="h-1.5 rounded bg-white">
                    <div className="h-1.5 rounded bg-[#22c55e]" style={{ width: `${item.score}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {showNext ? (
        <div className="mt-4">
          <button
            type="button"
            onClick={onNext}
            disabled={nextDisabled}
            className="rounded-lg bg-[#22c55e] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            Next Step
          </button>
        </div>
      ) : null}
    </article>
  );
}
