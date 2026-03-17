import { scenarioEntries } from "./data";
import type { ScenarioKey } from "./types";

type Props = {
  selectedScenario: ScenarioKey | null;
  onSelectScenario: (scenario: ScenarioKey) => void;
  showNext: boolean;
  nextDisabled: boolean;
  onNext: () => void;
};

export default function Step1Scenario({ selectedScenario, onSelectScenario, showNext, nextDisabled, onNext }: Props) {
  return (
    <article className="rounded-2xl border border-brand-200 bg-white p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-500">Step 1</p>
          <h3 className="mt-1 font-[var(--font-manrope)] text-xl font-semibold text-navy-900">Scenario 선택</h3>
          <p className="mt-1 text-sm text-navy-700">파이프라인 시작 전 심사 시나리오를 선택합니다.</p>
        </div>
        <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">Scenario Setup</span>
      </div>

      <div className="mt-4 space-y-2.5">
        {scenarioEntries.map(([key, value]) => {
          const active = selectedScenario === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectScenario(key)}
              className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                active
                  ? "border-brand-500 bg-brand-100 ring-2 ring-brand-200"
                  : "border-slate-200 bg-white hover:border-brand-400 hover:bg-brand-50"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-navy-900">{value.title}</p>
                <span className={`h-2.5 w-2.5 rounded-full ${active ? "bg-brand-500" : "bg-slate-300"}`} />
              </div>
              <p className="mt-1 truncate text-sm text-slate-600">{value.subtitle}</p>
            </button>
          );
        })}
      </div>

      {showNext ? (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-brand-200 bg-brand-100/50 p-3">
          <p className="text-sm text-navy-700">선택이 완료되면 Step 2에서 고객 제출 자료를 확인합니다.</p>
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
