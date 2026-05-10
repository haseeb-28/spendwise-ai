import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { AuditResult } from "@/types";

function buildAuditPrompt(result: AuditResult): string {
  const { recommendations, totalMonthlySpend, totalMonthlySavings, formData } = result;

  const toolSummary = recommendations
    .map(
      (r) =>
        `- ${r.toolLabel} (${r.currentPlan}): $${r.currentSpend}/mo → Action: ${r.recommendedAction}${
          r.monthlySavings > 0 ? `, saves $${r.monthlySavings}/mo` : " (optimal)"
        }`
    )
    .join("\n");

  return `You are a pragmatic CFO advisor writing a 90–120 word audit summary for a startup team.

The team:
- Size: ${formData.teamSize} people
- Primary AI use case: ${formData.useCase}
- Total current AI spend: $${totalMonthlySpend}/month

Their AI tools and recommendations:
${toolSummary}

Total identified savings: $${totalMonthlySavings}/month ($${totalMonthlySavings * 12}/year)

Write a concise, specific, non-generic summary paragraph. 
- Open with the key finding (savings amount or "well-optimized")
- Call out the 1–2 biggest opportunities by tool name
- Close with one actionable next step
- Tone: direct, confident, slightly informal — like a trusted advisor, not a report
- Do NOT use bullet points. Pure prose only.
- Do NOT start with "I" or "Your team"
- Do NOT make up numbers not in the data above`;
}

function buildFallbackSummary(result: AuditResult): string {
  const { totalMonthlySavings, totalMonthlySpend, recommendations, formData } = result;

  if (totalMonthlySavings <= 0) {
    return `Good news — the current AI stack for this ${formData.teamSize}-person team is well-optimized. At $${totalMonthlySpend}/month across ${recommendations.length} tools, the spend aligns with actual usage patterns and team size. No major plan mismatches or redundant subscriptions were detected. The main next step is setting a quarterly review to reassess as the team scales or tool pricing changes.`;
  }

  const topSaving = recommendations
    .filter((r) => r.monthlySavings > 0)
    .sort((a, b) => b.monthlySavings - a.monthlySavings)[0];

  return `This ${formData.teamSize}-person team is spending $${totalMonthlySpend}/month on AI tools and could trim that to $${
    totalMonthlySpend - totalMonthlySavings
  }/month — a $${totalMonthlySavings}/month ($${totalMonthlySavings * 12}/year) reduction. The biggest opportunity is ${topSaving?.toolLabel ?? "plan optimization"}: ${
    topSaving?.reasoning?.split(".")[0] ?? "switching plans would eliminate redundant spend"
  }. The immediate next step is reviewing the flagged subscriptions and either downgrading or consolidating before the next billing cycle.`;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = body as AuditResult;

  if (!result || !result.recommendations) {
    return NextResponse.json({ error: "Invalid audit data" }, { status: 400 });
  }

  try {
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: buildAuditPrompt(result),
        },
      ],
    });

    const summary =
      message.content[0].type === "text" ? message.content[0].text : buildFallbackSummary(result);

    return NextResponse.json({ summary });
  } catch (err) {
    console.error("Anthropic API error:", err);
    // Graceful fallback — never fail silently with empty string
    const fallback = buildFallbackSummary(result);
    return NextResponse.json({ summary: fallback, fallback: true });
  }
}
