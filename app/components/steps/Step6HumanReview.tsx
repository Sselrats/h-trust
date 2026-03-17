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
  const reviewItems = [
    { label: "문구 명확성", detail: "고객이 결과와 이유를 오해 없이 이해하는지" },
    { label: "근거 연결성", detail: "내부 자료(DB/약관) 근거와 문구가 정확히 연결되는지" },
    { label: "정책 준수", detail: "소비자 보호/적합성/소명 기회 규정을 충족하는지" },
    { label: "공정성/톤", detail: "단정·위협·낙인 표현 없이 중립적으로 전달되는지" },
    { label: "행동 가능성", detail: "고객이 다음 액션(서류/상담/이의제기)을 바로 알 수 있는지" }
  ];

  return (
    <article className="rounded-2xl border border-slate-700 bg-[#1f2937] p-5 text-white shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">Step 6</p>
          <h3 className="mt-1 font-[var(--font-manrope)] text-xl font-semibold">Human Step</h3>
        </div>
        <span className="rounded-full bg-slate-700 px-3 py-1 text-xs font-semibold text-slate-100">Reviewer Gate</span>
      </div>

      {!ready ? (
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-3 text-sm text-slate-200">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-transparent" />
            인간 검토 중...
          </div>
          <div className="h-2 w-full animate-pulse rounded bg-slate-600" />
        </div>
      ) : (
        <div className="mt-4 space-y-3 text-sm text-slate-100">
          <p className="rounded-md bg-slate-700 px-3 py-2 font-semibold">Result: {outcome}</p>
          <div className="rounded-xl border border-slate-600 bg-slate-800 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">Reviewer Checklist (DB Interaction)</p>
            <ul className="mt-2 space-y-2">
              {reviewItems.map((item) => (
                <li key={item.label} className="rounded-md bg-slate-700 px-2.5 py-2">
                  <p className="text-xs font-semibold text-white">{item.label}</p>
                  <p className="mt-0.5 text-xs text-slate-200">{item.detail}</p>
                </li>
              ))}
            </ul>
          </div>
          {outcome === "PASS" ? <p>Pass → Step 7</p> : null}
          {outcome === "REVIEW" ? <p>Review → Human 수정 후 Step 7</p> : null}
          {outcome === "ESCALATE" ? (
            <>
              <p>Escalate → 전문가 검토 → Draft 재생성 → Step 7</p>
              <p className="rounded-md bg-amber-100 px-3 py-2 text-amber-800">Case stored in escalation DB</p>
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
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-500"
          >
            Next Step
          </button>
        </div>
      ) : null}
    </article>
  );
}
