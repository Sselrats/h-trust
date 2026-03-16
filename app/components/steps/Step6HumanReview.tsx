import type { ScenarioData } from "./types";

type Props = {
  scenario: ScenarioData;
  ready: boolean;
  showNext: boolean;
  nextDisabled: boolean;
  onNext: () => void;
};

export default function Step6HumanReview({ scenario, ready, showNext, nextDisabled, onNext }: Props) {
  const outcome = scenario.humanOutcome;

  return (
    <article className="rounded-2xl border border-brand-200 bg-white p-5 shadow-card">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-500">Step 6</p>
      <h3 className="mt-1 font-[var(--font-manrope)] text-xl font-semibold text-navy-900">Human Review</h3>
      {!ready ? (
        <p className="mt-4 text-sm text-navy-700">인간 검토 중...</p>
      ) : (
        <div className="mt-4 space-y-3 text-sm text-navy-800">
          <p>
            Result: <span className="font-semibold">{outcome}</span>
          </p>
          {outcome === "PASS" ? <p>Pass → Step 7</p> : null}
          {outcome === "REVIEW" ? <p>Review → Human 수정 후 Step 7</p> : null}
          {outcome === "ESCALATE" ? (
            <>
              <p>Escalate → 전문가 검토 → Draft 재생성 → Step 7</p>
              <p className="rounded-md bg-brand-100 px-3 py-2 text-brand-700">Case stored in escalation DB</p>
            </>
          ) : null}
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
