import { useEffect, useState } from "react";
import type { ScenarioData, UserInput } from "./types";

type Props = {
  scenario: ScenarioData;
  submitted: boolean;
  inputMode: "interactive" | "static";
  onSubmit: (input: UserInput) => void;
};

export default function Step2Submission({ scenario, submitted, inputMode, onSubmit }: Props) {
  // Interactive mode state
  const [text, setText] = useState("");
  const [selectedAttachments, setSelectedAttachments] = useState<string[]>([]);

  // Static mode state
  const [readyCount, setReadyCount] = useState(0);
  const [typedClaim, setTypedClaim] = useState("");
  const allReady = readyCount >= scenario.submissions.length;

  // Tracks what was submitted, for the confirmation card
  const [submittedInput, setSubmittedInput] = useState<UserInput | null>(null);

  // Reset all local state when scenario changes
  useEffect(() => {
    setText("");
    setSelectedAttachments([]);
    setSubmittedInput(null);
    setReadyCount(0);
    setTypedClaim("");
  }, [scenario]);

  // Static mode — typing animation
  useEffect(() => {
    if (inputMode !== "static" || submitted) return;
    setTypedClaim("");
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setTypedClaim(scenario.userText.slice(0, index));
      if (index >= scenario.userText.length) window.clearInterval(timer);
    }, 18);
    return () => window.clearInterval(timer);
  }, [inputMode, scenario.userText, submitted]);

  // Static mode — file READY animation
  useEffect(() => {
    if (inputMode !== "static" || submitted) return;
    setReadyCount(0);
    let next = 0;
    const timer = window.setInterval(() => {
      next += 1;
      setReadyCount(next);
      if (next >= scenario.submissions.length) window.clearInterval(timer);
    }, 450);
    return () => window.clearInterval(timer);
  }, [inputMode, scenario.submissions.length, submitted]);

  const handleSubmit = (input: UserInput) => {
    setSubmittedInput(input);
    onSubmit(input);
  };

  const toggleAttachment = (item: string) => {
    setSelectedAttachments((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item],
    );
  };

  // Shared submitted confirmation card
  if (submitted) {
    const display = submittedInput ?? {
      text: scenario.userText,
      attachments: scenario.submissions,
    };
    return (
      <article className="rounded-2xl border border-brand-200 bg-white p-5 shadow-card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-500">Step 2</p>
            <h3 className="mt-1 font-[var(--font-manrope)] text-xl font-semibold text-navy-900">Customer Submission</h3>
          </div>
          <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">Document Intake</span>
        </div>
        <div className="mt-3 rounded-lg border border-brand-200 bg-brand-50 p-3">
          <p className="mb-1 text-xs font-semibold text-brand-700">✓ 제출 완료</p>
          <p className="line-clamp-3 text-sm text-navy-800">{display.text}</p>
          {display.attachments.length > 0 ? (
            <p className="mt-1.5 text-xs text-slate-500">첨부: {display.attachments.join(", ")}</p>
          ) : (
            <p className="mt-1.5 text-xs text-slate-400">첨부파일 없음</p>
          )}
        </div>
        <div className="mt-3 rounded-lg border border-brand-200 bg-white p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-500">Pre-check</p>
          <p className="mt-1 text-sm text-navy-700">형식 검증, 개인정보 마스킹, 누락 문서 확인을 완료하면 Domain AI 분석이 시작됩니다.</p>
        </div>
      </article>
    );
  }

  // Interactive mode
  if (inputMode === "interactive") {
    return (
      <article className="rounded-2xl border border-brand-200 bg-white p-5 shadow-card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-500">Step 2</p>
            <h3 className="mt-1 font-[var(--font-manrope)] text-xl font-semibold text-navy-900">Customer Submission</h3>
          </div>
          <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">Document Intake</span>
        </div>

        <div className="mt-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Claim Text</p>
          <textarea
            className="mt-1.5 w-full resize-none rounded-lg border border-slate-300 bg-slate-50 p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            rows={4}
            placeholder="고객 문의를 직접 입력하세요..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400">예시 문구:</span>
            <button
              type="button"
              onClick={() => setText(scenario.userText)}
              className="max-w-[280px] truncate rounded-full border border-brand-300 bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-100"
            >
              {scenario.userText.length > 42
                ? scenario.userText.slice(0, 42) + "…"
                : scenario.userText}
            </button>
          </div>
        </div>

        <div className="mt-3 rounded-lg border border-dashed border-brand-500/40 bg-brand-100/40 p-4">
          <p className="text-sm font-medium text-navy-700">첨부파일 선택</p>
          <p className="mt-0.5 text-xs text-slate-500">선택하지 않으면 첨부 없음으로 처리됩니다.</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {scenario.submissions.map((item) => {
              const selected = selectedAttachments.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleAttachment(item)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    selected
                      ? "border-brand-500 bg-brand-500 text-white"
                      : "border-slate-300 bg-white text-slate-600 hover:border-brand-400 hover:text-brand-600"
                  }`}
                >
                  {selected ? "✓ " : ""}{item}
                </button>
              );
            })}
          </div>
          {selectedAttachments.length > 0 && (
            <p className="mt-2 text-xs font-medium text-brand-600">
              {selectedAttachments.length}개 첨부 선택됨
            </p>
          )}
        </div>

        <div className="mt-3 rounded-lg border border-brand-200 bg-white p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-500">Pre-check</p>
          <p className="mt-1 text-sm text-navy-700">형식 검증, 개인정보 마스킹, 누락 문서 확인을 완료하면 Domain AI 분석이 시작됩니다.</p>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleSubmit({ text: text.trim(), attachments: selectedAttachments })}
            disabled={text.trim().length === 0}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            자료 제출 버튼
          </button>
          {text.trim().length === 0 && (
            <span className="text-xs text-slate-400">문의 내용을 입력해주세요.</span>
          )}
        </div>
      </article>
    );
  }

  // Static mode — original animated behavior
  return (
    <article className="rounded-2xl border border-brand-200 bg-white p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-500">Step 2</p>
          <h3 className="mt-1 font-[var(--font-manrope)] text-xl font-semibold text-navy-900">Customer Submission</h3>
        </div>
        <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">Document Intake</span>
      </div>

      <div className="mt-3 rounded-lg border border-slate-300 bg-slate-50 p-3">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Claim Text</p>
        <p className="mt-1 min-h-[60px] text-sm text-slate-800">
          {typedClaim}
          <span className="ml-0.5 inline-block h-4 w-[1px] animate-pulse bg-slate-500 align-middle" />
        </p>
      </div>

      <div className="mt-3 rounded-lg border border-dashed border-brand-500/40 bg-brand-100/40 p-4">
        <p className="text-sm font-medium text-navy-700">첨부파일 목록</p>
        <ul className="mt-2 space-y-2 text-sm text-navy-800">
          {scenario.submissions.map((file, index) => {
            const isReady = index < readyCount;
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
          onClick={() => handleSubmit({ text: scenario.userText, attachments: scenario.submissions })}
          disabled={!allReady}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          자료 제출 버튼
        </button>
        {!allReady && <span className="text-xs font-semibold text-slate-500">검증 진행중...</span>}
      </div>
    </article>
  );
}
