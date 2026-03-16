import type { ScenarioData } from "./types";

type Props = {
  scenario: ScenarioData;
  submitted: boolean;
  onSubmit: () => void;
};

export default function Step2Submission({ scenario, submitted, onSubmit }: Props) {
  return (
    <article className="rounded-2xl border border-brand-200 bg-white p-5 shadow-card">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-500">Step 2</p>
      <h3 className="mt-1 font-[var(--font-manrope)] text-xl font-semibold text-navy-900">Customer Submission</h3>
      <div className="mt-3 rounded-lg border border-dashed border-brand-500/40 bg-brand-100/40 p-4">
        <p className="text-sm font-medium text-navy-700">첨부파일 목록</p>
        <ul className="mt-2 space-y-2 text-sm text-navy-800">
          {scenario.submissions.map((file) => (
            <li key={file} className="rounded-md bg-white px-3 py-2">
              {file}
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={onSubmit}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          자료 제출 버튼
        </button>
        {submitted ? <span className="text-xs font-semibold text-brand-700">제출 완료</span> : null}
      </div>
    </article>
  );
}
