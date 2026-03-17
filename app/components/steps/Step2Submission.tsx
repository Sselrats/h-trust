import { useEffect, useState } from "react";
import type { ScenarioData } from "./types";

type Props = {
  scenario: ScenarioData;
  submitted: boolean;
  onSubmit: () => void;
};

export default function Step2Submission({ scenario, submitted, onSubmit }: Props) {
  const [readyCount, setReadyCount] = useState(0);
  const allReady = readyCount >= scenario.submissions.length;

  useEffect(() => {
    setReadyCount(0);
    let next = 0;
    const timer = window.setInterval(() => {
      next += 1;
      setReadyCount(next);
      if (next >= scenario.submissions.length) {
        window.clearInterval(timer);
      }
    }, 450);

    return () => window.clearInterval(timer);
  }, [scenario.submissions.length]);

  return (
    <article className="rounded-2xl border border-brand-200 bg-white p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-500">Step 2</p>
          <h3 className="mt-1 font-[var(--font-manrope)] text-xl font-semibold text-navy-900">Customer Submission</h3>
        </div>
        <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">Document Intake</span>
      </div>

      <div className="mt-3 rounded-lg border border-brand-200 bg-brand-100/30 p-3">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-500">Customer Request</p>
        <p className="mt-1 text-sm text-navy-800">{scenario.userText}</p>
      </div>

      <div className="mt-3 rounded-lg border border-dashed border-brand-500/40 bg-brand-100/40 p-4">
        <p className="text-sm font-medium text-navy-700">첨부파일 목록</p>
        <ul className="mt-2 space-y-2 text-sm text-navy-800">
          {scenario.submissions.map((file, index) => {
            const isReady = submitted || index < readyCount;
            return (
              <li key={file} className="flex items-center justify-between rounded-md bg-white px-3 py-2">
                <span>{file}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    isReady ? "bg-brand-100 text-brand-700" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {isReady ? "READY" : "PENDING"}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-3 rounded-lg border border-brand-200 bg-white p-3">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-500">Pre-check</p>
        <p className="mt-1 text-sm text-navy-700">형식 검증, 개인정보 마스킹, 누락 문서 확인을 완료하면 Domain AI 분석이 시작됩니다.</p>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={onSubmit}
          disabled={!allReady}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400 hover:bg-brand-700"
        >
          자료 제출 버튼
        </button>
        {submitted ? <span className="text-xs font-semibold text-brand-700">제출 완료</span> : null}
        {!submitted && !allReady ? <span className="text-xs font-semibold text-slate-500">검증 진행중...</span> : null}
      </div>
    </article>
  );
}
