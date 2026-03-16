import type { ScenarioData } from "./types";

type Props = {
  scenario: ScenarioData;
};

export default function Step7Delivery({ scenario }: Props) {
  return (
    <article className="rounded-2xl border border-brand-200 bg-brand-100/35 p-5 shadow-card">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-500">Step 7</p>
      <h3 className="mt-1 font-[var(--font-manrope)] text-xl font-semibold text-navy-900">Customer Delivery</h3>
      <p className="mt-4 rounded-lg bg-white p-4 text-sm leading-relaxed text-navy-800">{scenario.deliveryMessage}</p>
    </article>
  );
}
