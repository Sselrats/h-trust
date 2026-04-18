"use client";

import { useState } from "react";
import type { PipelineModeConfig } from "./steps/types";

type Props = {
  onConfirm: (config: PipelineModeConfig) => void;
};

export const DEFAULT_PIPELINE_CONFIG: PipelineModeConfig = {
  step2: { inputMode: "interactive" },
  step3: { snapshotMode: "ai", findingsMode: "ai", summaryMode: "ai" },
  step4: { draftMode: "ai" },
  step5: { risksMode: "ai", scoresMode: "ai" },
};

function Toggle({
  value,
  options,
  labels,
  onChange,
}: {
  value: string;
  options: [string, string];
  labels: [string, string];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
      {options.map((opt, i) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
            value === opt
              ? "bg-brand-500 text-white shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          {labels[i]}
        </button>
      ))}
    </div>
  );
}

function ConfigRow({
  label,
  value,
  options,
  labels,
  onChange,
}: {
  label: string;
  value: string;
  options: [string, string];
  labels: [string, string];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-navy-700">{label}</span>
      <Toggle value={value} options={options} labels={labels} onChange={onChange} />
    </div>
  );
}

function SectionHead({ title }: { title: string }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
      {title}
    </p>
  );
}

export default function PipelineConfigModal({ onConfirm }: Props) {
  const [config, setConfig] = useState<PipelineModeConfig>(DEFAULT_PIPELINE_CONFIG);

  function set2<K extends keyof PipelineModeConfig["step2"]>(
    k: K,
    v: PipelineModeConfig["step2"][K],
  ) {
    setConfig((c) => ({ ...c, step2: { ...c.step2, [k]: v } }));
  }
  function set3<K extends keyof PipelineModeConfig["step3"]>(
    k: K,
    v: PipelineModeConfig["step3"][K],
  ) {
    setConfig((c) => ({ ...c, step3: { ...c.step3, [k]: v } }));
  }
  function set4<K extends keyof PipelineModeConfig["step4"]>(
    k: K,
    v: PipelineModeConfig["step4"][K],
  ) {
    setConfig((c) => ({ ...c, step4: { ...c.step4, [k]: v } }));
  }
  function set5<K extends keyof PipelineModeConfig["step5"]>(
    k: K,
    v: PipelineModeConfig["step5"][K],
  ) {
    setConfig((c) => ({ ...c, step5: { ...c.step5, [k]: v } }));
  }

  const aiStatic: [string, string] = ["ai", "static"];
  const aiStaticLabels: [string, string] = ["AI", "Static"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">
            Financial AI Trust Infrastructure
          </p>
          <h2 className="mt-1 font-[var(--font-manrope)] text-xl font-semibold text-navy-900">
            Pipeline Configuration
          </h2>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
            각 단계의 처리 방식을 선택하세요.{" "}
            <span className="font-semibold text-brand-600">AI</span>는 Gemini를 호출하고,{" "}
            <span className="font-semibold text-slate-600">Static</span>은 사전 정의 시나리오 데이터를 사용합니다.
          </p>
        </div>

        <div className="mt-5 space-y-4 divide-y divide-slate-100">
          <div className="space-y-2.5 pt-4 first:pt-0">
            <SectionHead title="Step 2 — Customer Submission" />
            <ConfigRow
              label="Input Mode"
              value={config.step2.inputMode}
              options={["interactive", "static"]}
              labels={["Interactive", "Static"]}
              onChange={(v) => set2("inputMode", v as "interactive" | "static")}
            />
          </div>

          <div className="space-y-2.5 pt-4">
            <SectionHead title="Step 3 — Domain AI" />
            <ConfigRow
              label="Snapshot"
              value={config.step3.snapshotMode}
              options={aiStatic}
              labels={aiStaticLabels}
              onChange={(v) => set3("snapshotMode", v as "ai" | "static")}
            />
            <ConfigRow
              label="Findings"
              value={config.step3.findingsMode}
              options={aiStatic}
              labels={aiStaticLabels}
              onChange={(v) => set3("findingsMode", v as "ai" | "static")}
            />
            <ConfigRow
              label="Summary"
              value={config.step3.summaryMode}
              options={aiStatic}
              labels={aiStaticLabels}
              onChange={(v) => set3("summaryMode", v as "ai" | "static")}
            />
          </div>

          <div className="space-y-2.5 pt-4">
            <SectionHead title="Step 4 — Trust Layer Draft" />
            <ConfigRow
              label="Draft & Citation"
              value={config.step4.draftMode}
              options={aiStatic}
              labels={aiStaticLabels}
              onChange={(v) => set4("draftMode", v as "ai" | "static")}
            />
          </div>

          <div className="space-y-2.5 pt-4">
            <SectionHead title="Step 5 — Red Team Analysis" />
            <ConfigRow
              label="Risks"
              value={config.step5.risksMode}
              options={aiStatic}
              labels={aiStaticLabels}
              onChange={(v) => set5("risksMode", v as "ai" | "static")}
            />
            <ConfigRow
              label="Scores"
              value={config.step5.scoresMode}
              options={aiStatic}
              labels={aiStaticLabels}
              onChange={(v) => set5("scoresMode", v as "ai" | "static")}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => onConfirm(config)}
          className="mt-6 w-full rounded-xl bg-brand-500 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
        >
          데모 시작
        </button>
      </div>
    </div>
  );
}
