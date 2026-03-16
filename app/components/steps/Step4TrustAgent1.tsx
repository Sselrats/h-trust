import type { ScenarioData } from "./types";

type Props = {
  scenario: ScenarioData;
  ready: boolean;
  showNext: boolean;
  nextDisabled: boolean;
  onNext: () => void;
};

export default function Step4TrustAgent1({ scenario, ready, showNext, nextDisabled, onNext }: Props) {
  return (
    <article className="rounded-2xl border border-brand-200 bg-white p-5 shadow-card">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-500">Step 4</p>
      <h3 className="mt-1 font-[var(--font-manrope)] text-xl font-semibold text-navy-900">Trust Layer Agent #1</h3>
      {!ready ? (
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-3 text-sm text-navy-700">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
            Domain Finding 분석 중...
          </div>
          <div className="rounded-lg border border-brand-200 bg-brand-100/30 p-3">
            <div className="h-2 w-full animate-pulse rounded bg-brand-200" />
            <div className="mt-2 h-2 w-5/6 animate-pulse rounded bg-brand-200" />
            <div className="mt-2 h-2 w-3/4 animate-pulse rounded bg-brand-200" />
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-brand-200 bg-brand-100/50 p-4">
          <p className="text-sm leading-relaxed text-navy-800">{scenario.trustDraft}</p>
          <p className="mt-2 text-xs font-semibold text-brand-700">Citation: {scenario.citation}</p>
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
