import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { scenarioMap } from "../../../components/steps/data";
import type { ScenarioKey } from "../../../components/steps/types";
import type { Step3Result, Step4Result, Step5Result } from "../../../lib/types";
import { buildStep3Prompt, parseStep3Response } from "../../../lib/prompts/step3";
import { buildStep4Prompt, parseStep4Response } from "../../../lib/prompts/step4";
import { buildStep5Prompt, parseStep5Response } from "../../../lib/prompts/step5";

const VALID_STEPS = ["3", "4", "5", "6"] as const;
type ValidStep = (typeof VALID_STEPS)[number];

function getModel(apiKey: string) {
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
}

function is503(err: unknown): boolean {
  if (typeof (err as { status?: unknown }).status === "number") {
    return (err as { status: number }).status === 503;
  }
  return err instanceof Error && err.message.includes("503");
}

async function generateWithRetry(
  model: ReturnType<typeof getModel>,
  prompt: string,
  retries = 2,
): Promise<string> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      if (is503(err) && attempt < retries) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }
      throw err;
    }
  }
  throw new Error("unreachable");
}

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
  const apiKey = process.env.GEMINI_API_KEY;

  switch (step as ValidStep) {
    case "3": {
      const userText = typeof body?.userText === "string" ? body.userText : s.userText;
      const attachments = Array.isArray(body?.attachments)
        ? (body.attachments as string[])
        : s.submissions;
      const staticFallback: Step3Result = {
        findings: s.domainFindings,
        summary: "",
        source: "fallback",
        fallbackReason: "api_error",
      };
      if (!apiKey) return NextResponse.json(staticFallback);
      try {
        const model = getModel(apiKey);
        const prompt = buildStep3Prompt(s, userText, attachments);
        const text = await generateWithRetry(model, prompt);
        const parsed = parseStep3Response(text, staticFallback);
        if (parsed.source === "ai" && parsed.domainSnapshot) {
          const ts = parsed.domainSnapshot.find((i) => i.label === "Timestamp");
          if (ts) {
            ts.value = new Date().toISOString();
          } else {
            parsed.domainSnapshot.push({ label: "Timestamp", value: new Date().toISOString() });
          }
        }
        return NextResponse.json(parsed);
      } catch (err) {
        console.error("[Step3] Gemini error:", err);
        return NextResponse.json(staticFallback);
      }
    }

    case "4": {
      const step3Findings = Array.isArray(body?.step3Findings)
        ? (body.step3Findings as string[])
        : [];
      const staticFallback: Step4Result = {
        draft: s.trustDraft,
        citation: s.citation,
        source: "fallback",
        fallbackReason: "api_error",
      };
      if (!apiKey) return NextResponse.json(staticFallback);
      try {
        const model = getModel(apiKey);
        const prompt = buildStep4Prompt(s, step3Findings);
        const text = await generateWithRetry(model, prompt);
        return NextResponse.json(parseStep4Response(text, staticFallback));
      } catch (err) {
        console.error("[Step4] Gemini error:", err);
        return NextResponse.json(staticFallback);
      }
    }

    case "5": {
      const step4Draft = typeof body?.step4Draft === "string" ? body.step4Draft : undefined;
      const step4Citation = typeof body?.step4Citation === "string" ? body.step4Citation : undefined;
      const staticFallback: Step5Result = {
        risks: s.redTeamRisks,
        scores: s.riskScores,
        source: "fallback",
        fallbackReason: "api_error",
      };
      if (!apiKey) return NextResponse.json(staticFallback);
      try {
        const model = getModel(apiKey);
        const prompt = buildStep5Prompt(s, step4Draft, step4Citation);
        const text = await generateWithRetry(model, prompt);
        return NextResponse.json(parseStep5Response(text, staticFallback));
      } catch (err) {
        console.error("[Step5] Gemini error:", err);
        return NextResponse.json(staticFallback);
      }
    }

    case "6":
      return NextResponse.json({ outcome: s.humanOutcome });
  }
}
