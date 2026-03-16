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
    <article className="rounded-2xl border border-[#22c55e]/45 bg-[#22c55e]/10 p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#15803d]">Step 4</p>
          <h3 className="mt-1 font-[var(--font-manrope)] text-xl font-semibold text-navy-900">Trust Layer - Draft&Citation LLM</h3>
        </div>
        <span className="rounded-full bg-[#dcfce7] px-3 py-1 text-xs font-semibold text-[#15803d]">Draft Generation</span>
      </div>

      {!ready ? (
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-3 text-sm text-navy-700">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#22c55e] border-t-transparent" />
            Draft 및 Citation 생성 중...
          </div>
          <div className="rounded-lg border border-[#22c55e]/40 bg-[#dcfce7] p-3">
            <p className="text-xs font-semibold text-[#166534]">Thinking</p>
            <ul className="mt-2 space-y-1.5 text-xs text-[#14532d]">
              <li className="animate-pulse">- 내부 코드와 약관 조항 매핑</li>
              <li className="animate-pulse [animation-delay:220ms]">- 고객 친화 문장으로 변환</li>
              <li className="animate-pulse [animation-delay:420ms]">- Citation 삽입 및 문맥 점검</li>
            </ul>
          </div>
          <div className="rounded-lg border border-[#22c55e]/40 bg-[#dcfce7]/70 p-3">
            <div className="h-2 w-full animate-pulse rounded bg-[#86efac]" />
            <div className="mt-2 h-2 w-5/6 animate-pulse rounded bg-[#86efac]" />
            <div className="mt-2 h-2 w-3/4 animate-pulse rounded bg-[#86efac]" />
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <div className="rounded-xl border border-[#22c55e]/45 bg-[#dcfce7]/85 p-4">
            <p className="text-sm leading-relaxed text-navy-800">{scenario.trustDraft}</p>
            <p className="mt-2 inline-flex rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-[#15803d]">
              Citation: {scenario.citation}
            </p>
          </div>
          <div className="grid gap-2 text-xs text-navy-700 md:grid-cols-3">
            <div className="rounded-md border border-[#22c55e]/45 bg-white p-2">용어 단순화 적용</div>
            <div className="rounded-md border border-[#22c55e]/45 bg-white p-2">정책 문구 정합성 확인</div>
            <div className="rounded-md border border-[#22c55e]/45 bg-white p-2">고객 전달 톤 보정</div>
          </div>
        </div>
      )}

      {showNext ? (
        <div className="mt-4">
          <button
            type="button"
            onClick={onNext}
            disabled={nextDisabled}
            className="rounded-lg bg-[#22c55e] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            Next Step
          </button>
        </div>
      ) : null}
    </article>
  );
}
