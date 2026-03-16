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
    <article className="rounded-2xl border border-brand-200 bg-white p-5 shadow-card">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-500">Step 5</p>
      <h3 className="mt-1 font-[var(--font-manrope)] text-xl font-semibold text-navy-900">Trust Layer Agent #2</h3>
      {!ready ? (
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-3 text-sm text-navy-700">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
            Draft 분석 중...
          </div>
          <div className="grid gap-2">
            <div className="h-2 w-full animate-pulse rounded bg-brand-200" />
            <div className="h-2 w-11/12 animate-pulse rounded bg-brand-200" />
            <div className="h-2 w-3/4 animate-pulse rounded bg-brand-200" />
            <div className="h-2 w-2/3 animate-pulse rounded bg-brand-200" />
          </div>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-brand-200 bg-brand-100/55 p-4">
            <p className="text-sm font-semibold text-brand-700">Red-Team Report</p>
            <ul className="mt-2 space-y-1.5 text-sm text-navy-800">
              {scenario.redTeamRisks.map((risk) => (
                <li key={risk}>Potential Risk: {risk}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-brand-200 bg-brand-100/35 p-4">
            <p className="text-sm font-semibold text-navy-800">Risk Score List</p>
            <ul className="mt-2 space-y-1.5 text-sm text-navy-700">
              {scenario.riskScores.map((item) => (
                <li key={item.label} className="flex items-center justify-between">
                  <span>{item.label}</span>
                  <span className="font-semibold text-navy-900">{item.score}</span>
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
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            Next Step
          </button>
        </div>
      ) : null}
    </article>
  );
}
