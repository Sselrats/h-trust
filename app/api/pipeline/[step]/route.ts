import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { scenarioMap } from "../../../components/steps/data";
import type { ScenarioKey } from "../../../components/steps/types";
import type { Step4Result } from "../../../lib/types";
import { buildStep4Prompt, parseStep4Response } from "../../../lib/prompts/step4";

const VALID_STEPS = ["3", "4", "5", "6"] as const;
type ValidStep = (typeof VALID_STEPS)[number];

export async function POST(
  req: NextRequest,
  { params }: { params: { step: string } },
) {
  const { step } = params;

  if (!VALID_STEPS.includes(step as ValidStep)) {
    return NextResponse.json({ error: "Invalid step" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const scenarioKey = body?.scenarioKey as ScenarioKey | undefined;

  if (!scenarioKey || !(scenarioKey in scenarioMap)) {
    return NextResponse.json({ error: "Invalid scenarioKey" }, { status: 400 });
  }

  const s = scenarioMap[scenarioKey];

  switch (step as ValidStep) {
    case "3":
      return NextResponse.json({ findings: s.domainFindings, snapshot: s.domainSnapshot });

    case "4": {
      const staticFallback: Step4Result = {
        draft: s.trustDraft,
        citation: s.citation,
        source: "fallback",
        fallbackReason: "api_error",
      };

      try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
          return NextResponse.json({ ...staticFallback });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = buildStep4Prompt(s);
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return NextResponse.json(parseStep4Response(text, staticFallback));
      } catch {
        return NextResponse.json(staticFallback);
      }
    }

    case "5":
      return NextResponse.json({ risks: s.redTeamRisks, scores: s.riskScores });

    case "6":
      return NextResponse.json({ outcome: s.humanOutcome });
  }
}
