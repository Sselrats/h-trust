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
    { label: "문구 명확성", detail: "고객이 거절/보류 이유를 한 번에 이해할 수 있는가" },
    { label: "근거 연결성", detail: "안내 문구가 Domain Finding/약관 근거와 일치하는가" },
    { label: "정책 준수", detail: "내부 심사 정책 및 소비자 보호 문구를 충족하는가" },
    { label: "공정성/톤", detail: "단정적 표현, 낙인 표현 없이 중립적으로 전달되는가" },
    { label: "행동 가능성", detail: "고객이 다음에 무엇을 해야 하는지 명확한가" }
  ];

  return (
    <article className="rounded-2xl border border-brand-200 bg-white p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-500">Step 6</p>
          <h3 className="mt-1 font-[var(--font-manrope)] text-xl font-semibold text-navy-900">Human Review</h3>
        </div>
        <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">Decision Gate</span>
      </div>

      {!ready ? (
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-3 text-sm text-navy-700">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
            인간 검토 중...
          </div>
          <div className="h-2 w-full animate-pulse rounded bg-brand-200" />
        </div>
      ) : (
        <div className="mt-4 space-y-3 text-sm text-navy-800">
          <p className="rounded-md bg-brand-100 px-3 py-2 font-semibold text-brand-700">Result: {outcome}</p>
          <div className="rounded-xl border border-brand-200 bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-500">Reviewer Checklist</p>
            <ul className="mt-2 space-y-2">
              {reviewItems.map((item) => (
                <li key={item.label} className="rounded-md bg-brand-100/35 px-2.5 py-2">
                  <p className="text-xs font-semibold text-navy-900">{item.label}</p>
                  <p className="mt-0.5 text-xs text-navy-700">{item.detail}</p>
                </li>
              ))}
            </ul>
          </div>
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
