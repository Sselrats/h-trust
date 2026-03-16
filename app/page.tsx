"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { scenarioMap } from "./components/steps/data";
import Step1Scenario from "./components/steps/Step1Scenario";
import Step2Submission from "./components/steps/Step2Submission";
import Step3DomainAI from "./components/steps/Step3DomainAI";
import Step4TrustAgent1 from "./components/steps/Step4TrustAgent1";
import Step5TrustAgent2 from "./components/steps/Step5TrustAgent2";
import Step6HumanReview from "./components/steps/Step6HumanReview";
import Step7Delivery from "./components/steps/Step7Delivery";
import type { ScenarioKey, StepNumber } from "./components/steps/types";

const cardMotion = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: "easeOut" }
};

export default function Home() {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioKey | null>(null);
  const [currentStep, setCurrentStep] = useState<StepNumber>(1);
  const [submitted, setSubmitted] = useState(false);
  const [domainReady, setDomainReady] = useState(false);
  const [agent1Ready, setAgent1Ready] = useState(false);
  const [agent2Ready, setAgent2Ready] = useState(false);
  const [humanReady, setHumanReady] = useState(false);

  const timersRef = useRef<number[]>([]);
  const stepScrollRef = useRef<HTMLDivElement | null>(null);
  const lastStepRef = useRef<HTMLDivElement | null>(null);

  const scenario = useMemo(
    () => (selectedScenario ? scenarioMap[selectedScenario] : null),
    [selectedScenario]
  );

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  }, []);

  const goToNextStep = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev >= 7) return prev;
      if (prev === 1 && !selectedScenario) return prev;
      if (prev === 2) setSubmitted(true);
      return (prev + 1) as StepNumber;
    });
  }, [selectedScenario]);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  useEffect(() => {
    if (currentStep === 3) {
      setDomainReady(false);
      const timer = window.setTimeout(() => setDomainReady(true), 1200);
      timersRef.current.push(timer);
    }

    if (currentStep === 4) {
      setAgent1Ready(false);
      const timer = window.setTimeout(() => setAgent1Ready(true), 1200);
      timersRef.current.push(timer);
    }

    if (currentStep === 5) {
      setAgent2Ready(false);
      const timer = window.setTimeout(() => setAgent2Ready(true), 1200);
      timersRef.current.push(timer);
    }

    if (currentStep === 6) {
      setHumanReady(false);
      const timer = window.setTimeout(() => setHumanReady(true), 1200);
      timersRef.current.push(timer);
    }
  }, [currentStep]);

  const isStepReady =
    (currentStep === 1 && !!selectedScenario) ||
    (currentStep === 2 && submitted) ||
    (currentStep === 3 && domainReady) ||
    (currentStep === 4 && agent1Ready) ||
    (currentStep === 5 && agent2Ready) ||
    (currentStep === 6 && humanReady) ||
    currentStep === 7;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (lastStepRef.current) {
        lastStepRef.current.scrollIntoView({ behavior: "smooth", inline: "end", block: "nearest" });
      } else if (stepScrollRef.current) {
        stepScrollRef.current.scrollTo({ left: stepScrollRef.current.scrollWidth, behavior: "smooth" });
      }
    }, 80);

    return () => window.clearTimeout(timer);
  }, [currentStep]);

  const resetFlow = (nextScenario: ScenarioKey) => {
    clearTimers();
    setSelectedScenario(nextScenario);
    setCurrentStep(1);
    setSubmitted(false);
    setDomainReady(false);
    setAgent1Ready(false);
    setAgent2Ready(false);
    setHumanReady(false);
  };

  const nextDisabled = !isStepReady || currentStep >= 7;

  const renderStepCard = (step: StepNumber) => {
    if (!scenario && step > 1) return null;
    const isActiveStep = step === currentStep;

    if (step === 1) {
      return (
        <Step1Scenario
          selectedScenario={selectedScenario}
          onSelectScenario={resetFlow}
          showNext={isActiveStep}
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
          onSubmit={() => {
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
          showNext={isActiveStep}
          nextDisabled={nextDisabled}
          onNext={goToNextStep}
        />
      );
    }
    if (step === 4) {
      return (
        <Step4TrustAgent1
          scenario={scenario}
          ready={agent1Ready}
          showNext={isActiveStep}
          nextDisabled={nextDisabled}
          onNext={goToNextStep}
        />
      );
    }
    if (step === 5) {
      return (
        <Step5TrustAgent2
          scenario={scenario}
          ready={agent2Ready}
          showNext={isActiveStep}
          nextDisabled={nextDisabled}
          onNext={goToNextStep}
        />
      );
    }
    if (step === 6) {
      return (
        <Step6HumanReview
          scenario={scenario}
          ready={humanReady}
          showNext={isActiveStep}
          nextDisabled={nextDisabled}
          onNext={goToNextStep}
        />
      );
    }

    return <Step7Delivery scenario={scenario} />;
  };

  const reachedSteps = Array.from({ length: currentStep }, (_, index) => (index + 1) as StepNumber);

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1320px] px-4 py-5 md:px-8 md:py-7">
      <header className="rounded-2xl border border-brand-200 bg-white/95 px-5 py-5 text-center shadow-card">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">Financial AI Trust Infrastructure</p>
        <h1 className="mt-1 font-[var(--font-manrope)] text-2xl font-semibold text-navy-900 md:text-3xl">
          H-TRUST Decision Flow Demo
        </h1>
        <p className="mt-2 text-sm text-navy-700 md:text-base">
          Domain AI는 판단을 만들고, TRUST Layer는 그 판단을 설명 가능하고 관리 가능한 결정으로 바꿉니다.
        </p>
      </header>

      <section className="mt-4">
        <h2 className="mb-3 font-[var(--font-manrope)] text-lg font-semibold text-navy-900">Step Content Area</h2>
        <div ref={stepScrollRef} className="overflow-x-auto pb-2">
          <AnimatePresence mode="popLayout">
            <div className="flex w-max gap-3">
              {reachedSteps.map((step, index) => (
                <motion.div
                  key={step}
                  {...cardMotion}
                  ref={index === reachedSteps.length - 1 ? lastStepRef : null}
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
