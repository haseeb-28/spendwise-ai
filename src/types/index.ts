export type ToolName =
  | "cursor"
  | "github_copilot"
  | "claude"
  | "chatgpt"
  | "anthropic_api"
  | "openai_api"
  | "gemini"
  | "windsurf";

export type UseCase = "coding" | "writing" | "data" | "research" | "mixed";

export interface ToolInput {
  tool: ToolName;
  plan: string;
  monthlySpend: number;
  seats: number;
  enabled: boolean;
}

export interface AuditFormData {
  tools: ToolInput[];
  teamSize: number;
  useCase: UseCase;
}

export interface ToolRecommendation {
  tool: ToolName;
  toolLabel: string;
  currentPlan: string;
  currentSpend: number;
  recommendedAction: "downgrade" | "switch" | "cancel" | "optimal" | "upgrade";
  recommendedPlan?: string;
  recommendedTool?: string;
  projectedSpend: number;
  monthlySavings: number;
  annualSavings: number;
  reasoning: string;
  credexOpportunity: boolean;
  savingsPercent: number;
}

export interface AuditResult {
  id: string;
  createdAt: string;
  formData: AuditFormData;
  recommendations: ToolRecommendation[];
  totalMonthlySpend: number;
  totalProjectedSpend: number;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  overallAssessment: "optimal" | "minor_savings" | "significant_savings" | "major_savings";
  aiSummary?: string;
}

export interface LeadCapture {
  email: string;
  companyName?: string;
  role?: string;
  teamSize?: number;
  auditId: string;
}

export interface PricingPlan {
  planId: string;
  label: string;
  pricePerSeat: number;
  minSeats?: number;
  maxSeats?: number;
  features: string[];
  bestFor: UseCase[];
}

export interface ToolDefinition {
  id: ToolName;
  label: string;
  vendor: string;
  plans: PricingPlan[];
  logoColor: string;
  category: "ide" | "chat" | "api";
}
