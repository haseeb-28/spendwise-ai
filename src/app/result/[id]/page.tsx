import { Metadata } from "next";
import { getAuditById } from "@/lib/pocketbase";
import AuditResultClient from "@/components/AuditResultClient";
import type { AuditResult } from "@/types";
import { buildOGTitle, buildOGDescription } from "@/lib/utils";

interface Props { params: { id: string } }

async function getAuditResult(id: string): Promise<AuditResult | null> {
  try {
    const data = await getAuditById(id);
    if (!data) return null;
    return {
      id: data.audit_id,
      createdAt: data.created,
      formData: data.form_data,
      recommendations: data.recommendations,
      totalMonthlySpend: data.total_monthly_spend,
      totalProjectedSpend: data.total_projected_spend,
      totalMonthlySavings: data.total_monthly_savings,
      totalAnnualSavings: data.total_annual_savings,
      overallAssessment: data.overall_assessment,
      aiSummary: data.ai_summary,
    };
  } catch { return null; }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const result = await getAuditResult(params.id);
  if (!result) return { title: "Audit not found — SpendWise" };
  const title = buildOGTitle(result.totalMonthlySavings);
  const description = buildOGDescription(result);
  return {
    title, description,
    openGraph: { title, description, url: `${process.env.NEXT_PUBLIC_APP_URL}/result/${params.id}`, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ResultPage({ params }: Props) {
  const dbResult = await getAuditResult(params.id).catch(() => null);
  return <AuditResultClient auditId={params.id} initialResult={dbResult} />;
}
