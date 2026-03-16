import type { ScenarioData } from "./types";

type Props = {
  scenario: ScenarioData;
  ready: boolean;
  showNext: boolean;
  nextDisabled: boolean;
  onNext: () => void;
};

export default function Step3DomainAI({ scenario, ready, showNext, nextDisabled, onNext }: Props) {
  return (
    <article className="rounded-2xl border border-brand-500/40 bg-gradient-to-b from-navy-900 to-navy-700 p-5 text-white shadow-card">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-200">Step 3</p>
      <h3 className="mt-1 font-[var(--font-manrope)] text-xl font-semibold">Domain AI 분석</h3>
      {!ready ? (
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-3 text-sm text-brand-100">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-200 border-t-transparent" />
            분석 및 심사 중...
          </div>
          <div className="rounded-lg border border-white/20 bg-white/10 p-3">
            <div className="h-2 w-full animate-pulse rounded bg-white/25" />
            <div className="mt-2 h-2 w-4/5 animate-pulse rounded bg-white/20" />
            <div className="mt-2 h-2 w-2/3 animate-pulse rounded bg-white/20" />
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <p className="text-sm font-medium text-brand-100">Domain Finding</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {scenario.domainFindings.map((finding) => (
              <span key={finding} className="rounded-md border border-white/25 bg-white/10 px-2.5 py-1 text-xs font-semibold">
                {finding}
              </span>
            ))}
          </div>
        </div>
      )}
      {showNext ? (
        <div className="mt-4">
          <button
            type="button"
            onClick={onNext}
            disabled={nextDisabled}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-500"
          >
            Next Step
          </button>
        </div>
      ) : null}
    </article>
  );
}
