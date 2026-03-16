import type { ScenarioData } from "./types";

type Props = {
  scenario: ScenarioData;
  onRestart: () => void;
};

export default function Step7Delivery({ scenario, onRestart }: Props) {
  return (
    <article className="rounded-2xl border border-brand-200 bg-brand-100/35 p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-500">Step 7</p>
          <h3 className="mt-1 font-[var(--font-manrope)] text-xl font-semibold text-navy-900">Customer Delivery</h3>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-700">Final Message</span>
      </div>

      <p className="mt-4 rounded-lg bg-white p-4 text-sm leading-relaxed text-navy-800">{scenario.deliveryMessage}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button className="rounded-md border border-brand-200 bg-white px-3 py-1.5 text-xs font-semibold text-brand-700">
          재검토 요청
        </button>
        <button className="rounded-md border border-brand-200 bg-white px-3 py-1.5 text-xs font-semibold text-brand-700">
          상담 연결
        </button>
        <button
          type="button"
          onClick={onRestart}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
        >
          처음으로 돌아가기
        </button>
      </div>
    </article>
  );
}
