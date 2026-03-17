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
    <article className="rounded-2xl border border-[#3b82f6]/40 bg-gradient-to-b from-[#eff6ff] to-[#dbeafe] p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1d4ed8]">Step 4</p>
          <h3 className="mt-1 font-[var(--font-manrope)] text-xl font-semibold text-navy-900">Trust Layer - Draft&Citation LLM</h3>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#1d4ed8]">Draft Generation</span>
      </div>

      {!ready ? (
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-3 text-sm text-navy-700">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#3b82f6] border-t-transparent" />
            Draft 및 Citation 생성 중...
          </div>
          <div className="rounded-lg border border-[#3b82f6]/35 bg-white/80 p-3">
            <p className="text-xs font-semibold text-[#1e40af]">Thinking</p>
            <ul className="mt-2 space-y-1.5 text-xs text-slate-700">
              <li className="animate-pulse">- 내부 자료(DB) 근거 조항 우선 매핑</li>
              <li className="animate-pulse [animation-delay:220ms]">- 고객 친화 문장으로 변환</li>
              <li className="animate-pulse [animation-delay:420ms]">- 단정적 표현 완화 및 citation 정렬</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <div className="rounded-xl border border-[#3b82f6]/35 bg-white/90 p-4">
            <p className="whitespace-pre-line text-sm leading-relaxed text-navy-800">{scenario.trustDraft}</p>
            <p className="mt-2 inline-flex rounded-full bg-[#dbeafe] px-2.5 py-1 text-xs font-semibold text-[#1d4ed8]">
              Citation: {scenario.citation}
            </p>
          </div>
          <p className="text-xs font-semibold text-slate-600">* 내부 자료 기반 초안입니다. 최종 고객 전달 전 Red Team 점검이 필요합니다.</p>
        </div>
      )}

      {showNext ? (
        <div className="mt-4">
          <button
            type="button"
            onClick={onNext}
            disabled={nextDisabled}
            className="rounded-lg bg-[#3b82f6] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            Next Step
          </button>
        </div>
      ) : null}
    </article>
  );
}
