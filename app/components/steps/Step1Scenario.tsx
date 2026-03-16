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
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-500">Step 1</p>
      <h3 className="mt-1 font-[var(--font-manrope)] text-xl font-semibold text-navy-900">Scenario 선택</h3>
      <p className="mt-1 text-sm text-navy-700">파이프라인 시작 전 심사 시나리오를 선택합니다.</p>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {scenarioEntries.map(([key, value]) => {
          const active = selectedScenario === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectScenario(key)}
              className={`rounded-xl border px-4 py-4 text-left transition ${
                active
                  ? "border-brand-500 bg-brand-100 ring-2 ring-brand-200"
                  : "border-brand-200 bg-white hover:border-brand-500 hover:bg-brand-100/60"
              }`}
            >
              <p className="font-semibold text-navy-900">{value.title}</p>
              <p className="mt-1 text-sm text-navy-700">{value.subtitle}</p>
            </button>
          );
        })}
      </div>
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
