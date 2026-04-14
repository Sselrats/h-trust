import { scenarioMap } from "../components/steps/data";
import type { ScenarioData, ScenarioKey } from "../components/steps/types";
import type { Step4Result } from "./types";

export type StepResult =
  | { step: 3; findings: ScenarioData["domainFindings"]; snapshot: ScenarioData["domainSnapshot"] }
  | ({ step: 4 } & Step4Result)
  | { step: 5; risks: ScenarioData["redTeamRisks"]; scores: ScenarioData["riskScores"] }
  | { step: 6; outcome: ScenarioData["humanOutcome"] };

export async function runStep(step: 3 | 4 | 5 | 6, scenarioKey: ScenarioKey): Promise<StepResult> {
  if (step === 4) {
    const s = scenarioMap[scenarioKey];
    const scenarioFallback: Step4Result = {
      draft: s.trustDraft,
      citation: s.citation,
      source: "fallback",
      fallbackReason: "api_error",
    };
    try {
      const res = await fetch("/api/pipeline/4", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioKey }),
      });
      if (!res.ok) {
        return { step: 4, ...scenarioFallback };
      }
      const data = await res.json();
      return { step: 4, ...data };
    } catch {
      return { step: 4, ...scenarioFallback };
    }
  }

  const delay = step === 6 ? 1600 : 5000;
  await new Promise((resolve) => setTimeout(resolve, delay));

  const s = scenarioMap[scenarioKey];

  if (step === 3) return { step: 3, findings: s.domainFindings, snapshot: s.domainSnapshot };
  if (step === 5) return { step: 5, risks: s.redTeamRisks, scores: s.riskScores };
  return { step: 6, outcome: s.humanOutcome };
}
