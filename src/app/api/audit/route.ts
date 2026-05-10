import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { runAudit } from "@/lib/audit-engine";
import { createAudit, checkRateLimit } from "@/lib/pocketbase";
import { nanoid } from "nanoid";

const toolInputSchema = z.object({
  tool: z.string(),
  plan: z.string(),
  monthlySpend: z.number().min(0).max(100000),
  seats: z.number().min(1).max(10000),
  enabled: z.boolean(),
});

const formSchema = z.object({
  tools: z.array(toolInputSchema).min(1).max(20),
  teamSize: z.number().min(1).max(100000),
  useCase: z.enum(["coding", "writing", "data", "research", "mixed"]),
});

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0] ??
    req.headers.get("x-real-ip") ??
    "unknown";

  // Honeypot check
  const body = await req.json();
  if (body._hp && body._hp !== "") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Rate limit
  const allowed = await checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  // Validate
  const parsed = formSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid form data", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const formData = parsed.data as Parameters<typeof runAudit>[0];
  const result = runAudit(formData);

  // Persist to PocketBase
  try {
    const shareToken = nanoid(16);

    await createAudit({
      audit_id: result.id,
      form_data: result.formData,
      recommendations: result.recommendations,
      total_monthly_spend: result.totalMonthlySpend,
      total_projected_spend: result.totalProjectedSpend,
      total_monthly_savings: result.totalMonthlySavings,
      total_annual_savings: result.totalAnnualSavings,
      overall_assessment: result.overallAssessment,
      share_token: shareToken,
    });

    return NextResponse.json({ ...result, shareToken });
  } catch (err) {
    console.error("PocketBase error:", err);
    // Graceful degradation — return result without persistence
    return NextResponse.json({ ...result, shareToken: result.id });
  }
}
