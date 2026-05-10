import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { AuditResult } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export function getAssessmentLabel(assessment: AuditResult["overallAssessment"]): string {
  switch (assessment) {
    case "optimal":
      return "You're spending well";
    case "minor_savings":
      return "Small optimizations available";
    case "significant_savings":
      return "Significant savings found";
    case "major_savings":
      return "Major overspend detected";
  }
}

export function getAssessmentColor(assessment: AuditResult["overallAssessment"]): string {
  switch (assessment) {
    case "optimal":
      return "text-emerald-600";
    case "minor_savings":
      return "text-yellow-600";
    case "significant_savings":
      return "text-orange-600";
    case "major_savings":
      return "text-red-600";
  }
}

export function getActionLabel(action: string): string {
  switch (action) {
    case "downgrade":
      return "Downgrade plan";
    case "switch":
      return "Switch tool/approach";
    case "cancel":
      return "Cancel subscription";
    case "optimal":
      return "No change needed";
    case "upgrade":
      return "Upgrade for savings";
    default:
      return action;
  }
}

export function getActionColor(action: string): string {
  switch (action) {
    case "downgrade":
    case "cancel":
      return "bg-red-50 text-red-700 border-red-200";
    case "switch":
      return "bg-orange-50 text-orange-700 border-orange-200";
    case "optimal":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "upgrade":
      return "bg-blue-50 text-blue-700 border-blue-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
}

export function buildShareableUrl(auditId: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://spendwise.ai";
  return `${base}/result/${auditId}`;
}

export function buildOGTitle(monthlySavings: number): string {
  if (monthlySavings <= 0) return "My AI Spend Audit — SpendWise";
  return `I found ${formatCurrency(monthlySavings)}/mo in AI savings — SpendWise`;
}

export function buildOGDescription(result: AuditResult): string {
  const { totalMonthlySpend, totalMonthlySavings, recommendations } = result;
  const toolCount = recommendations.length;
  if (totalMonthlySavings <= 0) {
    return `Audited ${toolCount} AI tools totaling ${formatCurrency(totalMonthlySpend)}/mo. Spending is well-optimized.`;
  }
  return `Audited ${toolCount} AI tools. Found ${formatCurrency(totalMonthlySavings)}/mo (${formatCurrency(totalMonthlySavings * 12)}/yr) in potential savings.`;
}
