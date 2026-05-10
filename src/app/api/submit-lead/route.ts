/*import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { upsertLead, markEmailSent, getAuditById } from "@/lib/pocketbase";

const leadSchema = z.object({
  email: z.string().email(),
  companyName: z.string().max(200).optional(),
  role: z.string().max(100).optional(),
  teamSize: z.number().min(1).max(1000000).optional(),
  auditId: z.string().min(1),
  totalMonthlySavings: z.number(),
  _hp: z.string().optional(),
});

function buildEmailHtml(
  monthlySavings: number,
  annualSavings: number,
  shareUrl: string,
  highSavings: boolean
): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
    <div style="background:#0f766e;padding:32px;text-align:center;">
      <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;">SpendWise AI Audit</h1>
      <p style="margin:8px 0 0;color:#99f6e0;font-size:14px;">Your AI spend analysis is ready</p>
    </div>
    <div style="padding:32px;">
      ${monthlySavings > 0
        ? `<div style="background:#f0fdf9;border:1px solid #99f6e0;border-radius:8px;padding:20px;margin-bottom:24px;text-align:center;">
            <p style="margin:0;color:#0f766e;font-size:13px;font-weight:500;text-transform:uppercase;letter-spacing:0.05em;">Potential Monthly Savings</p>
            <p style="margin:8px 0 0;color:#134e4a;font-size:36px;font-weight:700;">$${Math.round(monthlySavings)}</p>
            <p style="margin:4px 0 0;color:#0f766e;font-size:14px;">$${Math.round(annualSavings)}/year</p>
          </div>`
        : `<div style="background:#f0fdf9;border:1px solid #99f6e0;border-radius:8px;padding:20px;margin-bottom:24px;text-align:center;">
            <p style="margin:0;color:#0f766e;font-size:18px;font-weight:600;">✓ Your AI spend is well-optimized</p>
          </div>`
      }
      <p style="color:#374151;font-size:15px;line-height:1.6;">View your complete audit report with per-tool breakdowns and actionable recommendations:</p>
      <div style="text-align:center;margin:24px 0;">
        <a href="${shareUrl}" style="background:#0f766e;color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:600;font-size:15px;display:inline-block;">View Full Report →</a>
      </div>
      ${highSavings
        ? `<div style="border-top:1px solid #e5e7eb;padding-top:24px;margin-top:24px;">
            <h3 style="margin:0 0 8px;color:#111827;font-size:16px;font-weight:600;">Capture more with Credex</h3>
            <p style="margin:0;color:#374151;font-size:14px;line-height:1.6;">Based on your audit, you qualify for discounted AI credits through Credex. A specialist will reach out shortly.</p>
          </div>`
        : `<div style="border-top:1px solid #e5e7eb;padding-top:24px;margin-top:24px;">
            <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.6;">We'll notify you when new optimizations apply to your stack.</p>
          </div>`
      }
    </div>
    <div style="background:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;">
      <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">SpendWise by <a href="https://credex.rocks" style="color:#0f766e;">Credex</a> · <a href="${shareUrl}" style="color:#0f766e;">Share your report</a></p>
    </div>
  </div>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Honeypot
  if (body._hp && body._hp !== "") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Validate
  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid data", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { email, companyName, role, teamSize, auditId, totalMonthlySavings } = parsed.data;
  const highSavings = totalMonthlySavings >= 500;
  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/result/${auditId}`;

  // ── Step 1: Save lead to PocketBase (non-blocking — don't fail if DB is down) ──
  try {
    const audit = await getAuditById(auditId);
    const shareToken = audit?.share_token;
    if (shareToken) {
      // Use share token in URL if available
    }

    await upsertLead({
      email,
      company_name: companyName,
      role,
      team_size: teamSize,
      audit_id: auditId,
      total_monthly_savings: totalMonthlySavings,
      high_savings: highSavings,
    });
  } catch (dbErr) {
    // Log but don't fail — email is more important than DB storage
    console.warn("PocketBase save failed (non-fatal):", dbErr);
  }

  // ── Step 2: Check Resend API key ──
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.error("RESEND_API_KEY is not set in environment variables");
    return NextResponse.json(
      { error: "Email service not configured. Add RESEND_API_KEY to your .env.local file." },
      { status: 500 }
    );
  }

  // ── Step 3: Send email ──
  try {
    const resend = new Resend(resendKey);
    const annualSavings = totalMonthlySavings * 12;

    const { error: resendError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev",
      to: email,
      subject:
        totalMonthlySavings > 0
          ? `Your AI Audit: $${Math.round(totalMonthlySavings)}/mo in savings found`
          : "Your AI Spend Audit is ready — SpendWise",
      html: buildEmailHtml(totalMonthlySavings, annualSavings, shareUrl, highSavings),
    });

    if (resendError) {
      console.error("Resend API error:", resendError);
      return NextResponse.json(
        { error: `Email failed: ${resendError.message}` },
        { status: 500 }
      );
    }

    // Mark email sent in DB (non-blocking)
    try {
      await markEmailSent(email);
    } catch {
      // ignore
    }

    return NextResponse.json({ success: true, highSavings, shareUrl });
  } catch (emailErr) {
    const message = emailErr instanceof Error ? emailErr.message : String(emailErr);
    console.error("Email send error:", message);
    return NextResponse.json(
      { error: `Email failed: ${message}` },
      { status: 500 }
    );
  }
}
  */



import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { upsertLead, markEmailSent, getAuditById } from "@/lib/pocketbase";

const leadSchema = z.object({
  email: z.string().email(),
  companyName: z.string().max(200).optional(),
  role: z.string().max(100).optional(),
  teamSize: z.number().min(1).max(1000000).optional(),
  auditId: z.string().min(1),
  totalMonthlySavings: z.number(),
  _hp: z.string().optional(),
});

function buildEmailHtml(
  monthlySavings: number,
  annualSavings: number,
  shareUrl: string,
  highSavings: boolean
): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
    <div style="background:#0f766e;padding:32px;text-align:center;">
      <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;">SpendWise AI Audit</h1>
      <p style="margin:8px 0 0;color:#99f6e0;font-size:14px;">Your AI spend analysis is ready</p>
    </div>
    <div style="padding:32px;">
      ${monthlySavings > 0
        ? `<div style="background:#f0fdf9;border:1px solid #99f6e0;border-radius:8px;padding:20px;margin-bottom:24px;text-align:center;">
            <p style="margin:0;color:#0f766e;font-size:13px;font-weight:500;text-transform:uppercase;letter-spacing:0.05em;">Potential Monthly Savings</p>
            <p style="margin:8px 0 0;color:#134e4a;font-size:36px;font-weight:700;">$${Math.round(monthlySavings)}</p>
            <p style="margin:4px 0 0;color:#0f766e;font-size:14px;">$${Math.round(annualSavings)}/year</p>
          </div>`
        : `<div style="background:#f0fdf9;border:1px solid #99f6e0;border-radius:8px;padding:20px;margin-bottom:24px;text-align:center;">
            <p style="margin:0;color:#0f766e;font-size:18px;font-weight:600;">✓ Your AI spend is well-optimized</p>
          </div>`
      }
      <p style="color:#374151;font-size:15px;line-height:1.6;">View your complete audit report with per-tool breakdowns and actionable recommendations:</p>
      <div style="text-align:center;margin:24px 0;">
        <a href="${shareUrl}" style="background:#0f766e;color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:600;font-size:15px;display:inline-block;">View Full Report →</a>
      </div>
      ${highSavings
        ? `<div style="border-top:1px solid #e5e7eb;padding-top:24px;margin-top:24px;">
            <h3 style="margin:0 0 8px;color:#111827;font-size:16px;font-weight:600;">Capture more with Credex</h3>
            <p style="margin:0;color:#374151;font-size:14px;line-height:1.6;">Based on your audit, you qualify for discounted AI credits through Credex. A specialist will reach out shortly.</p>
          </div>`
        : `<div style="border-top:1px solid #e5e7eb;padding-top:24px;margin-top:24px;">
            <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.6;">We'll notify you when new optimizations apply to your stack.</p>
          </div>`
      }
    </div>
    <div style="background:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;">
      <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">SpendWise by <a href="https://credex.rocks" style="color:#0f766e;">Credex</a> · <a href="${shareUrl}" style="color:#0f766e;">Share your report</a></p>
    </div>
  </div>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Honeypot
  if (body._hp && body._hp !== "") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Validate
  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid data", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { email, companyName, role, teamSize, auditId, totalMonthlySavings } = parsed.data;
  const highSavings = totalMonthlySavings >= 500;

  // Use actual request origin so the link works in any environment (local or deployed)
  const origin =
    req.headers.get("origin") ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000";
  const shareUrl = `${origin}/result/${auditId}`;

  // ── Step 1: Save lead to PocketBase (non-blocking — don't fail if DB is down) ──
  try {
    const audit = await getAuditById(auditId);
    const shareToken = audit?.share_token;
    if (shareToken) {
      // Use share token in URL if available
    }

    await upsertLead({
      email,
      company_name: companyName,
      role,
      team_size: teamSize,
      audit_id: auditId,
      total_monthly_savings: totalMonthlySavings,
      high_savings: highSavings,
    });
  } catch (dbErr) {
    // Log but don't fail — email is more important than DB storage
    console.warn("PocketBase save failed (non-fatal):", dbErr);
  }

  // ── Step 2: Check Resend API key ──
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.error("RESEND_API_KEY is not set in environment variables");
    return NextResponse.json(
      { error: "Email service not configured. Add RESEND_API_KEY to your .env.local file." },
      { status: 500 }
    );
  }

  // ── Step 3: Send email ──
  try {
    const resend = new Resend(resendKey);
    const annualSavings = totalMonthlySavings * 12;

    const { error: resendError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev",
      to: email,
      subject:
        totalMonthlySavings > 0
          ? `Your AI Audit: $${Math.round(totalMonthlySavings)}/mo in savings found`
          : "Your AI Spend Audit is ready — SpendWise",
      html: buildEmailHtml(totalMonthlySavings, annualSavings, shareUrl, highSavings),
    });

    if (resendError) {
      console.error("Resend API error:", resendError);
      return NextResponse.json(
        { error: `Email failed: ${resendError.message}` },
        { status: 500 }
      );
    }

    // Mark email sent in DB (non-blocking)
    try {
      await markEmailSent(email);
    } catch {
      // ignore
    }

    return NextResponse.json({ success: true, highSavings, shareUrl });
  } catch (emailErr) {
    const message = emailErr instanceof Error ? emailErr.message : String(emailErr);
    console.error("Email send error:", message);
    return NextResponse.json(
      { error: `Email failed: ${message}` },
      { status: 500 }
    );
  }
}
