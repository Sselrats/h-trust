import type { ScenarioData } from "./types";

type Props = {
  scenario: ScenarioData;
  onRestart: () => void;
};

export default function Step7Delivery({ scenario, onRestart }: Props) {
  return (
    <article className="rounded-2xl border border-[#22c55e]/45 bg-[#22c55e]/10 p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#15803d]">Step 7</p>
          <h3 className="mt-1 font-[var(--font-manrope)] text-xl font-semibold text-navy-900">Final Message</h3>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#15803d]">Customer Delivery</span>
      </div>

      <div className="mt-3 rounded-lg border border-[#22c55e]/35 bg-white p-3">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#15803d]">Customer Question Recap</p>
        <p className="mt-1 text-sm text-navy-800">{scenario.userText}</p>
      </div>

      <p className="mt-3 whitespace-pre-line rounded-lg bg-white p-4 text-sm leading-relaxed text-navy-800">{scenario.deliveryMessage}</p>
      <ul className="mt-3 space-y-1 text-xs text-navy-700">
        {scenario.followUps.map((item) => (
          <li key={item} className="rounded bg-white/80 px-2 py-1">
            {item}
          </li>
        ))}
      </ul>
      <p className="mt-3 rounded-md bg-[#dcfce7] px-3 py-2 text-xs font-semibold text-[#15803d]">
        Safety / Policy / Evidence 항목 검토를 통과한 고객 전달 문구입니다.
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onRestart}
          className="rounded-lg bg-[#22c55e] px-4 py-2 text-sm font-semibold text-white"
        >
          처음으로 돌아가기
        </button>
      </div>
    </article>
  );
}
