"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { runStep } from "./lib/pipeline";
import { scenarioMap } from "./components/steps/data";
import Step1Scenario from "./components/steps/Step1Scenario";
import Step2Submission from "./components/steps/Step2Submission";
import Step3DomainAI from "./components/steps/Step3DomainAI";
import Step4TrustAgent1 from "./components/steps/Step4TrustAgent1";
import Step5TrustAgent2 from "./components/steps/Step5TrustAgent2";
import Step6HumanReview from "./components/steps/Step6HumanReview";
import Step7Delivery from "./components/steps/Step7Delivery";
import type { ScenarioKey, StepNumber, UserInput } from "./components/steps/types";
import type { Step3Result, Step4Result, Step5Result } from "./lib/types";

const cardMotion = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: "easeOut" },
};

const stepTitles: Record<StepNumber, string> = {
  1: "Scenario 선택",
  2: "Customer Submission",
  3: "Domain AI 분석",
  4: "Trust Layer - Draft&Citation LLM",
  5: "Trust Layer - Red Team LLM",
  6: "Human Step",
  7: "Final Message",
};

export default function Home() {
  const [demoMode, setDemoMode] = useState(false);
  const [demoIntervalMs, setDemoIntervalMs] = useState(1000);
  const [selectedScenario, setSelectedScenario] = useState<ScenarioKey | null>(
    null,
  );
  const [currentStep, setCurrentStep] = useState<StepNumber>(1);
  const [focusStep, setFocusStep] = useState<StepNumber>(1);
  const [demoIndex, setDemoIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [domainReady, setDomainReady] = useState(false);
  const [agent1Ready, setAgent1Ready] = useState(false);
  const [agent2Ready, setAgent2Ready] = useState(false);
  const [humanReady, setHumanReady] = useState(false);
  const [step4Result, setStep4Result] = useState<Step4Result | null>(null);
  const [step3Result, setStep3Result] = useState<Step3Result | null>(null);
  const [step5Result, setStep5Result] = useState<Step5Result | null>(null);
  const [userInput, setUserInput] = useState<UserInput | null>(null);

  const timersRef = useRef<number[]>([]);
  const stepScrollRef = useRef<HTMLDivElement | null>(null);

  const scenario = useMemo(
    () => (selectedScenario ? scenarioMap[selectedScenario] : null),
    [selectedScenario],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    setDemoMode(params.get("demo") === "1");
    const parsedMs = Number(params.get("ms"));
    if (Number.isFinite(parsedMs) && parsedMs >= 300) {
      setDemoIntervalMs(parsedMs);
    } else {
      setDemoIntervalMs(1000);
    }
  }, []);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  }, []);

  const goToNextStep = useCallback(() => {
    setCurrentStep((prev) => {
      if (demoMode) return prev;
      if (prev >= 7) return prev;
      if (prev === 1 && !selectedScenario) return prev;
      if (prev === 2) setSubmitted(true);
      return (prev + 1) as StepNumber;
    });
  }, [demoMode, selectedScenario]);

  useEffect(() => {
    if (!demoMode) return;
    clearTimers();
    setSelectedScenario("insurance");
    setCurrentStep(7);
    setFocusStep(1);
    setDemoIndex(0);
    setSubmitted(true);
    setDomainReady(true);
    setAgent1Ready(true);
    setAgent2Ready(true);
    setHumanReady(true);
  }, [clearTimers, demoMode]);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  useEffect(() => {
    if (demoMode || !selectedScenario) return;
    let cancelled = false;

    if (currentStep === 3) {
      setDomainReady(false);
      runStep(3, selectedScenario, {
        userText: userInput?.text,
        attachments: userInput?.attachments,
      }).then((result) => {
        if (!cancelled) {
          const r = result as { step: 3 } & Step3Result;
          setStep3Result({ findings: r.findings, summary: r.summary, source: r.source, fallbackReason: r.fallbackReason });
          setDomainReady(true);
        }
      });
    }
    if (currentStep === 4) {
      setAgent1Ready(false);
      runStep(4, selectedScenario, { step3Findings: step3Result?.findings ?? [] }).then((result) => {
        if (!cancelled) {
          setStep4Result(result as Step4Result & { step: 4 });
          setAgent1Ready(true);
        }
      });
    }
    if (currentStep === 5) {
      setAgent2Ready(false);
      runStep(5, selectedScenario, {
        step4Draft: step4Result?.draft,
        step4Citation: step4Result?.citation,
      }).then((result) => {
        if (!cancelled) {
          const r = result as { step: 5 } & Step5Result;
          setStep5Result({ risks: r.risks, scores: r.scores, source: r.source, fallbackReason: r.fallbackReason });
          setAgent2Ready(true);
        }
      });
    }
    if (currentStep === 6) {
      setHumanReady(false);
      runStep(6, selectedScenario).then(() => { if (!cancelled) setHumanReady(true); });
    }

    return () => { cancelled = true; };
    // step3Result and step4Result are intentionally omitted from deps:
    // they are always set before currentStep advances, so the closure
    // captures fresh values when currentStep changes to 4 or 5.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, demoMode, selectedScenario]);

  const isStepReady =
    demoMode ||
    ((currentStep === 1 && !!selectedScenario) ||
      (currentStep === 2 && submitted) ||
      (currentStep === 3 && domainReady) ||
      (currentStep === 4 && agent1Ready) ||
      (currentStep === 5 && agent2Ready) ||
      (currentStep === 6 && humanReady) ||
      currentStep === 7);

  useEffect(() => {
    if (!demoMode) return;
    // Keep Step 1 visible briefly before auto-rotating in demo mode.
    const startTimer = window.setTimeout(() => {
      const interval = window.setInterval(() => {
        setDemoIndex((prev) => prev + 1);
        setFocusStep((prev) => (prev === 7 ? 1 : ((prev + 1) as StepNumber)));
      }, demoIntervalMs);
      timersRef.current.push(interval);
    }, 1000);

    return () => {
      window.clearTimeout(startTimer);
      timersRef.current.forEach((timer) => window.clearInterval(timer));
      timersRef.current = [];
    };
  }, [demoMode, demoIntervalMs]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (stepScrollRef.current) {
        const targetStep = demoMode ? focusStep : currentStep;
        const target = demoMode
          ? stepScrollRef.current.querySelector<HTMLElement>(
              `[data-index=\"${demoIndex}\"]`,
            )
          : stepScrollRef.current.querySelector<HTMLElement>(
              `[data-step=\"${targetStep}\"]`,
            );
        if (target) {
          const container = stepScrollRef.current;
          const targetCenter = target.offsetLeft + target.offsetWidth / 2;
          const containerCenter = container.clientWidth / 2;
          stepScrollRef.current.scrollTo({
            left: Math.max(0, targetCenter - containerCenter),
            behavior: "smooth",
          });
        }
      }
    }, 80);

    return () => window.clearTimeout(timer);
  }, [currentStep, demoMode, focusStep, demoIndex]);

  const resetFlow = (nextScenario: ScenarioKey) => {
    clearTimers();
    setSelectedScenario(nextScenario);
    setCurrentStep(1);
    setSubmitted(false);
    setDomainReady(false);
    setAgent1Ready(false);
    setAgent2Ready(false);
    setHumanReady(false);
    setStep4Result(null);
    setStep3Result(null);
    setStep5Result(null);
    setUserInput(null);
  };

  const restartFromBeginning = () => {
    clearTimers();
    setSelectedScenario(null);
    setCurrentStep(1);
    setSubmitted(false);
    setDomainReady(false);
    setAgent1Ready(false);
    setAgent2Ready(false);
    setHumanReady(false);
    setStep4Result(null);
    setStep3Result(null);
    setStep5Result(null);
    setUserInput(null);
  };

  const nextDisabled = !isStepReady || currentStep >= 7;

  const renderStepCard = (step: StepNumber) => {
    if (!demoMode && step > currentStep) {
      return (
        <article className="rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Step {step}
          </p>
          <h3 className="mt-1 font-[var(--font-manrope)] text-xl font-semibold text-slate-500">
            {stepTitles[step]}
          </h3>
          <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-400">
            .
          </div>
        </article>
      );
    }

    const isActiveStep = step === (demoMode ? focusStep : currentStep);
    const showStepButton = !demoMode && isActiveStep;

    if (step === 1) {
      return (
        <Step1Scenario
          selectedScenario={selectedScenario}
          onSelectScenario={resetFlow}
          showNext={showStepButton}
          nextDisabled={nextDisabled}
          onNext={goToNextStep}
        />
      );
    }

    if (!scenario) return null;

    if (step === 2) {
      return (
        <Step2Submission
          scenario={scenario}
          submitted={submitted}
          onSubmit={(input) => {
            setUserInput(input);
            setSubmitted(true);
            setCurrentStep(3);
          }}
        />
      );
    }

    if (step === 3) {
      return (
        <Step3DomainAI
          scenario={scenario}
          ready={domainReady}
          showNext={showStepButton}
          nextDisabled={nextDisabled}
          onNext={goToNextStep}
          findings={step3Result?.findings}
          summary={step3Result?.summary}
          source={step3Result?.source}
        />
      );
    }
    if (step === 4) {
      return (
        <Step4TrustAgent1
          scenario={scenario}
          ready={agent1Ready}
          showNext={showStepButton}
          nextDisabled={nextDisabled}
          onNext={goToNextStep}
          draft={step4Result?.draft}
          citation={step4Result?.citation}
          source={step4Result?.source}
        />
      );
    }
    if (step === 5) {
      return (
        <Step5TrustAgent2
          scenario={scenario}
          ready={agent2Ready}
          showNext={showStepButton}
          nextDisabled={nextDisabled}
          onNext={goToNextStep}
          risks={step5Result?.risks}
          scores={step5Result?.scores}
          source={step5Result?.source}
        />
      );
    }
    if (step === 6) {
      return (
        <Step6HumanReview
          scenario={scenario}
          ready={humanReady}
          showNext={showStepButton}
          nextDisabled={nextDisabled}
          onNext={goToNextStep}
        />
      );
    }

    return (
      <Step7Delivery scenario={scenario} onRestart={restartFromBeginning} />
    );
  };

  const allSteps = [1, 2, 3, 4, 5, 6, 7] as StepNumber[];
  const demoSteps = Array.from(
    { length: 70 },
    (_, i) => allSteps[i % allSteps.length],
  ) as StepNumber[];
  const renderSteps = demoMode ? demoSteps : allSteps;

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1320px] px-4 py-5 md:px-8 md:py-7">
      <header className="rounded-2xl border border-brand-200 bg-white/95 px-5 py-5 text-center shadow-card">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">
          Financial AI Trust Infrastructure
        </p>
        <h1 className="mt-1 font-[var(--font-manrope)] text-2xl font-semibold text-navy-900 md:text-3xl">
          H-TRUST Demo
        </h1>
        <p className="mt-2 text-sm text-navy-700 md:text-base">
          Domain AI는 판단을 만들고, TRUST Layer는 그 판단을 설명 가능하고 관리
          가능한 결정으로 바꿉니다.
        </p>
      </header>

      <section className="mt-4 -mx-4 md:-mx-8">
        <p className="mb-2 px-4 text-xs text-slate-500 md:px-8">
          좌우로 스크롤해 다음 Step을 확인해보세요.
        </p>
        <div
          ref={stepScrollRef}
          className="hide-scrollbar overflow-x-auto pb-2"
        >
          <AnimatePresence mode="popLayout">
            <div className="flex w-max gap-3 px-4 md:px-8">
              {renderSteps.map((step, idx) => (
                <motion.div
                  key={`${step}-${idx}`}
                  {...cardMotion}
                  data-step={step}
                  data-index={idx}
                  className="w-[90vw] max-w-[720px] shrink-0 md:w-[640px]"
                >
                  {renderStepCard(step)}
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        </div>
      </section>
    </main>
  );
}
