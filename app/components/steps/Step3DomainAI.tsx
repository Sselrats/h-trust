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
    <article className="rounded-2xl border border-[#3b82f6]/45 bg-gradient-to-b from-[#1e3a8a] to-[#3b82f6] p-5 text-white shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#bfdbfe]">Step 3</p>
          <h3 className="mt-1 font-[var(--font-manrope)] text-xl font-semibold">Domain AI 분석</h3>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-[#dbeafe]">Inference Engine</span>
      </div>

      {!ready ? (
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-3 text-sm text-[#dbeafe]">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#93c5fd] border-t-transparent" />
            분석 및 심사 중...
          </div>
          <div className="rounded-lg border border-white/20 bg-white/10 p-3">
            <p className="text-xs font-semibold text-[#dbeafe]">Thinking</p>
            <ul className="mt-2 space-y-1.5 text-xs text-[#dbeafe]/90">
              <li className="animate-pulse">- case_id와 제출 채널 메타데이터 매핑</li>
              <li className="animate-pulse [animation-delay:220ms]">- 리스크 피처 스코어링 계산</li>
              <li className="animate-pulse [animation-delay:420ms]">- 사유 코드 우선순위 정렬</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <div className="rounded-lg border border-white/20 bg-white/10 p-3">
            <p className="text-xs font-semibold text-[#dbeafe]">Case Snapshot</p>
            <p className="mt-1 text-xs text-white/90">{scenario.caseId}</p>
            <ul className="mt-2 grid gap-1.5 text-xs text-white/90 md:grid-cols-2">
              {scenario.domainSnapshot.map((item) => (
                <li key={item.label} className="rounded bg-white/10 px-2 py-1">
                  <span className="text-[#dbeafe]">{item.label}:</span> {item.value}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-white/20 bg-white/10 p-3">
            <p className="text-xs font-semibold text-[#dbeafe]">Domain Finding</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {scenario.domainFindings.map((finding) => (
                <span key={finding} className="rounded-md border border-white/25 bg-white/10 px-2.5 py-1 text-xs font-semibold">
                  {finding}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {showNext ? (
        <div className="mt-4">
          <button
            type="button"
            onClick={onNext}
            disabled={nextDisabled}
            className="rounded-lg bg-[#3b82f6] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-500"
          >
            Next Step
          </button>
        </div>
      ) : null}
    </article>
  );
}
