import type { ScenarioData } from "./types";

type Props = {
  scenario: ScenarioData;
  ready: boolean;
  showNext: boolean;
  nextDisabled: boolean;
  onNext: () => void;
  findings?: string[];
  summary?: string;
  source?: "ai" | "fallback";
};

export default function Step3DomainAI({ scenario, ready, showNext, nextDisabled, onNext, findings, summary, source }: Props) {
  const displayFindings = findings ?? scenario.domainFindings;

  return (
    <article className="rounded-2xl border border-slate-300 bg-slate-950 p-5 text-white shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Step 3</p>
          <h3 className="mt-1 font-[var(--font-manrope)] text-xl font-semibold">Domain AI 분석</h3>
        </div>
        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-200">M-GNN + Rules</span>
      </div>

      {!ready ? (
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-3 text-sm text-slate-200">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-transparent" />
            분석 및 심사 중...
          </div>
          <div className="rounded-lg border border-slate-700 bg-slate-900 p-3">
            <p className="text-xs font-semibold text-slate-300">Thinking</p>
            <ul className="mt-2 space-y-1.5 text-xs text-slate-300/90">
              <li className="animate-pulse">- case_id 및 입력 채널 메타데이터 정규화</li>
              <li className="animate-pulse [animation-delay:220ms]">- 그래프 기반 이상 패턴 탐지</li>
              <li className="animate-pulse [animation-delay:420ms]">- 리스크 스코어 및 사유 코드 생성</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-slate-700 bg-black p-3">
          {source === "fallback" && (
            <p className="mb-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-600">
              ⚠ 정적 데이터 (API 오류)
            </p>
          )}
          <p className="mb-2 text-xs font-semibold text-slate-400">Domain Findings (JSON)</p>
          <pre className="overflow-x-auto text-xs leading-relaxed text-slate-200">{`{
  "case_id": "${scenario.caseId}",
  "snapshot": {
${scenario.domainSnapshot
  .map((item) => `    "${item.label}": "${item.value}"`)
  .join(",\n")}
  },
  "domain_findings": [
${displayFindings.map((f) => `    "${f}"`).join(",\n")}
  ]${summary ? `,\n  "summary": "${summary}"` : ""}
}`}</pre>
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
