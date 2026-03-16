export type ScenarioKey = "insurance" | "loan" | "investment";
export type StepNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type ScenarioData = {
  title: string;
  subtitle: string;
  submissions: string[];
  domainFindings: string[];
  trustDraft: string;
  citation: string;
  redTeamRisks: string[];
  riskScores: Array<{ label: string; score: number }>;
  humanOutcome: "REVIEW" | "ESCALATE" | "PASS";
  deliveryMessage: string;
};
