import { scenarioMap } from "../components/steps/data";
import type { ScenarioData, ScenarioKey } from "../components/steps/types";
import type { Step3Result, Step4Result, Step5Result } from "./types";

export type StepResult =
  | ({ step: 3 } & Step3Result)
  | ({ step: 4 } & Step4Result)
  | ({ step: 5 } & Step5Result)
  | { step: 6; outcome: ScenarioData["humanOutcome"] };

export async function runStep(
  step: 3 | 4 | 5 | 6,
  scenarioKey: ScenarioKey,
  opts?: { step3Findings?: string[]; step4Draft?: string; step4Citation?: string }
): Promise<StepResult> {
  const s = scenarioMap[scenarioKey];

  if (step === 3) {
    const fallback: Step3Result = {
      findings: s.domainFindings,
      summary: "",
      source: "fallback",
      fallbackReason: "api_error",
    };
    try {
      const res = await fetch("/api/pipeline/3", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioKey }),
      });
      if (!res.ok) return { step: 3, ...fallback };
      const data = await res.json();
      return { step: 3, ...data };
    } catch {
      return { step: 3, ...fallback };
    }
  }

  if (step === 4) {
    const fallback: Step4Result = {
      draft: s.trustDraft,
      citation: s.citation,
      source: "fallback",
      fallbackReason: "api_error",
    };
    try {
      const res = await fetch("/api/pipeline/4", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioKey, step3Findings: opts?.step3Findings ?? [] }),
      });
      if (!res.ok) return { step: 4, ...fallback };
      const data = await res.json();
      return { step: 4, ...data };
    } catch {
      return { step: 4, ...fallback };
    }
  }

  if (step === 5) {
    const fallback: Step5Result = {
      risks: s.redTeamRisks,
      scores: s.riskScores,
      source: "fallback",
      fallbackReason: "api_error",
    };
    try {
      const res = await fetch("/api/pipeline/5", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioKey,
          step4Draft: opts?.step4Draft,
          step4Citation: opts?.step4Citation,
        }),
      });
      if (!res.ok) return { step: 5, ...fallback };
      const data = await res.json();
      return { step: 5, ...data };
    } catch {
      return { step: 5, ...fallback };
    }
  }

  // step === 6
  await new Promise((resolve) => setTimeout(resolve, 1600));
  return { step: 6, outcome: s.humanOutcome };
}
