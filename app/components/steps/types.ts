export type ScenarioKey = "insurance" | "loan" | "investment";
export type StepNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type UserInput = {
  text: string;
  attachments: string[];
};

export type RiskSeverity = "CRITICAL" | "HIGH" | "MINOR";

export type ScenarioData = {
  title: string;
  subtitle: string;
  userText: string;
  submissions: string[];
  caseId: string;
  domainSnapshot: Array<{ label: string; value: string }>;
  domainFindings: string[];
  trustDraft: string;
  citation: string;
  redTeamRisks: Array<{ severity: RiskSeverity; title: string; detail: string }>;
  riskScores: Array<{ label: string; score: number; note: string }>;
  humanOutcome: "REVIEW" | "ESCALATE" | "PASS";
  deliveryMessage: string;
  followUps: string[];
};
