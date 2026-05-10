import type {
  AuditFormData,
  AuditResult,
  ToolInput,
  ToolRecommendation,
  ToolName,
  UseCase,
} from "@/types";
import { TOOL_MAP } from "./pricing-data";
import { nanoid } from "nanoid";

// ─── Individual tool evaluators ───────────────────────────────────────────────

function evaluateCursor(input: ToolInput, teamSize: number): ToolRecommendation {
  const base: Partial<ToolRecommendation> = {
    tool: "cursor",
    toolLabel: "Cursor",
    currentPlan: input.plan,
    currentSpend: input.monthlySpend,
  };

  const seats = input.seats || 1;
  const impliedPPU = input.monthlySpend / seats;

  // Business plan at < 5 users: admin features rarely justified
  if (input.plan === "business" && seats < 5) {
    const projectedSpend = 20 * seats;
    const savings = input.monthlySpend - projectedSpend;
    return {
      ...base,
      recommendedAction: "downgrade",
      recommendedPlan: "Pro",
      projectedSpend,
      monthlySavings: savings,
      annualSavings: savings * 12,
      savingsPercent: Math.round((savings / input.monthlySpend) * 100),
      reasoning: `Cursor Business ($40/seat) adds SSO, admin dashboard, and enforced privacy mode. For ${seats} users, these are enterprise controls rarely needed under 5 seats. Pro ($20/seat) delivers identical AI capability — the only loss is the admin panel.`,
      credexOpportunity: savings > 50,
    } as ToolRecommendation;
  }

  // Pro at large team (20+): may benefit from negotiated enterprise
  if (input.plan === "pro" && seats >= 20) {
    return {
      ...base,
      recommendedAction: "upgrade",
      recommendedPlan: "Enterprise (negotiate)",
      projectedSpend: input.monthlySpend * 0.8,
      monthlySavings: input.monthlySpend * 0.2,
      annualSavings: input.monthlySpend * 0.2 * 12,
      savingsPercent: 20,
      reasoning: `At ${seats} seats, Cursor Enterprise pricing is negotiable and typically yields 15–25% off list. At $20/seat × ${seats} = $${input.monthlySpend}/mo, a 20% discount saves $${Math.round(input.monthlySpend * 0.2)}/mo. Worth a conversation with their sales team.`,
      credexOpportunity: true,
    } as ToolRecommendation;
  }

  // Hobby plan with claimed spend: flag inconsistency
  if (input.plan === "hobby" && input.monthlySpend > 0) {
    return {
      ...base,
      recommendedAction: "optimal",
      projectedSpend: 0,
      monthlySavings: input.monthlySpend,
      annualSavings: input.monthlySpend * 12,
      savingsPercent: 100,
      reasoning: "Cursor Hobby is free. If you're being charged, verify your billing — you may have been auto-upgraded or have an old subscription.",
      credexOpportunity: false,
    } as ToolRecommendation;
  }

  // Pro plan: optimal
  if (input.plan === "pro" && Math.abs(impliedPPU - 20) < 3) {
    return {
      ...base,
      recommendedAction: "optimal",
      projectedSpend: input.monthlySpend,
      monthlySavings: 0,
      annualSavings: 0,
      savingsPercent: 0,
      reasoning: `Cursor Pro at $20/seat is the right tier for active developers. You're paying roughly $${Math.round(impliedPPU)}/seat — aligned with list price.`,
      credexOpportunity: false,
    } as ToolRecommendation;
  }

  return {
    ...base,
    recommendedAction: "optimal",
    projectedSpend: input.monthlySpend,
    monthlySavings: 0,
    annualSavings: 0,
    savingsPercent: 0,
    reasoning: "Current Cursor spend looks appropriately sized for your team.",
    credexOpportunity: false,
  } as ToolRecommendation;
}

function evaluateGitHubCopilot(
  input: ToolInput,
  teamSize: number,
  useCase: UseCase
): ToolRecommendation {
  const base: Partial<ToolRecommendation> = {
    tool: "github_copilot",
    toolLabel: "GitHub Copilot",
    currentPlan: input.plan,
    currentSpend: input.monthlySpend,
  };

  const seats = input.seats || 1;

  // Business for small teams (< 5): Individual plan is sufficient
  if (input.plan === "business" && seats < 5) {
    const projectedSpend = 10 * seats;
    const savings = input.monthlySpend - projectedSpend;
    return {
      ...base,
      recommendedAction: "downgrade",
      recommendedPlan: "Individual",
      projectedSpend,
      monthlySavings: savings,
      annualSavings: savings * 12,
      savingsPercent: Math.round((savings / input.monthlySpend) * 100),
      reasoning: `Copilot Business ($19/seat) adds org-level policy management, audit logs, and SSO — valuable at 10+ person orgs but rarely used by teams under 5. Individual ($10/seat) provides identical code completion quality. Switching saves $${savings}/mo with zero capability loss for small teams.`,
      credexOpportunity: savings > 30,
    } as ToolRecommendation;
  }

  // Enterprise (39/seat) for < 20 seats: Business is almost always sufficient
  if (input.plan === "enterprise" && seats < 20) {
    const projectedSpend = 19 * seats;
    const savings = input.monthlySpend - projectedSpend;
    return {
      ...base,
      recommendedAction: "downgrade",
      recommendedPlan: "Business",
      projectedSpend,
      monthlySavings: savings,
      annualSavings: savings * 12,
      savingsPercent: Math.round((savings / input.monthlySpend) * 100),
      reasoning: `Copilot Enterprise ($39/seat) primarily adds fine-tuned models on your codebase and Copilot on GitHub.com. For a ${seats}-person team, Business ($19/seat) covers all code completion and chat needs. Fine-tuning only pays off at significant scale (50+ devs with a large private codebase).`,
      credexOpportunity: savings > 100,
    } as ToolRecommendation;
  }

  // Non-coding use case: Copilot is the wrong tool
  if (useCase !== "coding" && useCase !== "mixed") {
    const savings = input.monthlySpend;
    return {
      ...base,
      recommendedAction: "cancel",
      recommendedTool: "Claude Pro or ChatGPT Plus",
      projectedSpend: 20 * seats,
      monthlySavings: Math.max(0, savings - 20 * seats),
      annualSavings: Math.max(0, savings - 20 * seats) * 12,
      savingsPercent: Math.round((Math.max(0, savings - 20 * seats) / input.monthlySpend) * 100),
      reasoning: `GitHub Copilot is purpose-built for code generation inside IDEs. For a primarily ${useCase} use case, you're paying for IDE integration that goes largely unused. Claude or ChatGPT would better match your workflow at similar or lower cost.`,
      credexOpportunity: false,
    } as ToolRecommendation;
  }

  return {
    ...base,
    recommendedAction: "optimal",
    projectedSpend: input.monthlySpend,
    monthlySavings: 0,
    annualSavings: 0,
    savingsPercent: 0,
    reasoning: "GitHub Copilot plan appears well-matched to your team size and use case.",
    credexOpportunity: false,
  } as ToolRecommendation;
}

function evaluateClaude(input: ToolInput, teamSize: number): ToolRecommendation {
  const base: Partial<ToolRecommendation> = {
    tool: "claude",
    toolLabel: "Claude",
    currentPlan: input.plan,
    currentSpend: input.monthlySpend,
  };

  const seats = input.seats || 1;

  // Team plan for 1 user: Pro is cheaper ($20 vs $25)
  if (input.plan === "team" && seats < 2) {
    const projectedSpend = 20;
    const savings = input.monthlySpend - projectedSpend;
    return {
      ...base,
      recommendedAction: "downgrade",
      recommendedPlan: "Pro",
      projectedSpend,
      monthlySavings: savings,
      annualSavings: savings * 12,
      savingsPercent: Math.round((savings / input.monthlySpend) * 100),
      reasoning: `Claude Team ($25/seat, minimum 2 seats) is priced for collaboration features and higher usage limits per seat. For a solo user, Pro ($20/mo) delivers equivalent AI access — you're paying a $5/mo premium for admin controls you can't use alone.`,
      credexOpportunity: false,
    } as ToolRecommendation;
  }

  // Max plan ($100/mo): only justified for very heavy daily users
  if (input.plan === "max" && seats === 1) {
    return {
      ...base,
      recommendedAction: "downgrade",
      recommendedPlan: "Pro (unless hitting limits daily)",
      projectedSpend: 20,
      monthlySavings: 80,
      annualSavings: 960,
      savingsPercent: 80,
      reasoning: `Claude Max ($100/mo) provides 20× the usage of Free — worth it only if you consistently hit Pro limits. Most professional users find Pro ($20/mo) sufficient. If you're not regularly seeing "limit reached" messages, you're likely overpaying $80/mo.`,
      credexOpportunity: false,
    } as ToolRecommendation;
  }

  // Pro: optimal for single power users
  if (input.plan === "pro" && seats === 1 && Math.abs(input.monthlySpend - 20) < 3) {
    return {
      ...base,
      recommendedAction: "optimal",
      projectedSpend: 20,
      monthlySavings: 0,
      annualSavings: 0,
      savingsPercent: 0,
      reasoning: "Claude Pro at $20/mo is the right tier for a single power user. Good value for the capability.",
      credexOpportunity: false,
    } as ToolRecommendation;
  }

  return {
    ...base,
    recommendedAction: "optimal",
    projectedSpend: input.monthlySpend,
    monthlySavings: 0,
    annualSavings: 0,
    savingsPercent: 0,
    reasoning: "Claude spend appears appropriately matched to your usage pattern.",
    credexOpportunity: false,
  } as ToolRecommendation;
}

function evaluateChatGPT(
  input: ToolInput,
  teamSize: number,
  hasClaude: boolean
): ToolRecommendation {
  const base: Partial<ToolRecommendation> = {
    tool: "chatgpt",
    toolLabel: "ChatGPT",
    currentPlan: input.plan,
    currentSpend: input.monthlySpend,
  };

  const seats = input.seats || 1;

  // Both ChatGPT Plus and Claude Pro: redundant for most use cases
  if (hasClaude && input.plan === "plus") {
    const savings = input.monthlySpend;
    return {
      ...base,
      recommendedAction: "cancel",
      recommendedTool: "Keep Claude Pro only",
      projectedSpend: 0,
      monthlySavings: savings,
      annualSavings: savings * 12,
      savingsPercent: 100,
      reasoning: `You're paying for both Claude Pro and ChatGPT Plus — two frontier models with heavily overlapping capabilities. For most writing, research, and coding tasks, one is sufficient. Claude Pro tends to outperform on long-form writing and analysis; ChatGPT on data analysis with Code Interpreter. Pick one primary, use free tiers as fallback. Saving: $${savings}/mo.`,
      credexOpportunity: false,
    } as ToolRecommendation;
  }

  // Team plan for 2 users: barely hits the minimum, check if worth it
  if (input.plan === "team" && seats <= 2) {
    const projectedSpend = 20 * seats;
    const savings = input.monthlySpend - projectedSpend;
    if (savings > 0) {
      return {
        ...base,
        recommendedAction: "downgrade",
        recommendedPlan: "Plus (individual accounts)",
        projectedSpend,
        monthlySavings: savings,
        annualSavings: savings * 12,
        savingsPercent: Math.round((savings / input.monthlySpend) * 100),
        reasoning: `ChatGPT Team ($30/seat) adds workspace features and data-training opt-out. For ${seats} users, individual Plus accounts ($20/seat) cost $${savings}/mo less. The main Team benefit — data excluded from training — is also achievable in Plus by toggling off "improve the model" in settings.`,
        credexOpportunity: false,
      } as ToolRecommendation;
    }
  }

  return {
    ...base,
    recommendedAction: "optimal",
    projectedSpend: input.monthlySpend,
    monthlySavings: 0,
    annualSavings: 0,
    savingsPercent: 0,
    reasoning: "ChatGPT plan looks well-sized for your team.",
    credexOpportunity: false,
  } as ToolRecommendation;
}

function evaluateAnthropicApi(input: ToolInput, teamSize: number): ToolRecommendation {
  const base: Partial<ToolRecommendation> = {
    tool: "anthropic_api",
    toolLabel: "Anthropic API",
    currentPlan: "API Direct",
    currentSpend: input.monthlySpend,
  };

  // High API spend: Credex credits opportunity
  if (input.monthlySpend > 200) {
    const credexSavings = Math.round(input.monthlySpend * 0.25);
    return {
      ...base,
      recommendedAction: "switch",
      recommendedTool: "Anthropic API via Credex credits",
      projectedSpend: input.monthlySpend - credexSavings,
      monthlySavings: credexSavings,
      annualSavings: credexSavings * 12,
      savingsPercent: 25,
      reasoning: `At $${input.monthlySpend}/mo on Anthropic API, you're a strong candidate for discounted credits. Credex sources overallocated API credits from companies that over-forecast usage — typically at 20–30% below retail. On $${input.monthlySpend}/mo spend, that's ~$${credexSavings}/mo saved with zero capability change.`,
      credexOpportunity: true,
    } as ToolRecommendation;
  }

  // Suggest caching for mid-range spend
  if (input.monthlySpend > 50) {
    const savings = Math.round(input.monthlySpend * 0.15);
    return {
      ...base,
      recommendedAction: "switch",
      recommendedTool: "Anthropic API with prompt caching",
      projectedSpend: input.monthlySpend - savings,
      monthlySavings: savings,
      annualSavings: savings * 12,
      savingsPercent: 15,
      reasoning: `Anthropic's prompt caching feature reduces costs by ~90% on repeated context (system prompts, RAG chunks). At $${input.monthlySpend}/mo, enabling caching typically saves 15–40% depending on how much of your prompt is repeated. Requires a small implementation change in your API calls.`,
      credexOpportunity: false,
    } as ToolRecommendation;
  }

  return {
    ...base,
    recommendedAction: "optimal",
    projectedSpend: input.monthlySpend,
    monthlySavings: 0,
    annualSavings: 0,
    savingsPercent: 0,
    reasoning: "API spend is modest and within a reasonable range for early-stage usage.",
    credexOpportunity: false,
  } as ToolRecommendation;
}

function evaluateOpenAIApi(input: ToolInput): ToolRecommendation {
  const base: Partial<ToolRecommendation> = {
    tool: "openai_api",
    toolLabel: "OpenAI API",
    currentPlan: "API Direct",
    currentSpend: input.monthlySpend,
  };

  if (input.monthlySpend > 200) {
    const credexSavings = Math.round(input.monthlySpend * 0.2);
    return {
      ...base,
      recommendedAction: "switch",
      recommendedTool: "OpenAI API via Credex credits",
      projectedSpend: input.monthlySpend - credexSavings,
      monthlySavings: credexSavings,
      annualSavings: credexSavings * 12,
      savingsPercent: 20,
      reasoning: `$${input.monthlySpend}/mo on OpenAI API qualifies for discounted credits through Credex. Additionally, consider model routing: GPT-4o mini at $0.15/MTok handles ~60–70% of tasks that GPT-4o handles at $2.50/MTok. Routing simpler queries to the cheaper model alone could reduce costs by 30–50%.`,
      credexOpportunity: true,
    } as ToolRecommendation;
  }

  if (input.monthlySpend > 30) {
    const savings = Math.round(input.monthlySpend * 0.35);
    return {
      ...base,
      recommendedAction: "switch",
      recommendedTool: "GPT-4o mini for routine tasks",
      projectedSpend: input.monthlySpend - savings,
      monthlySavings: savings,
      annualSavings: savings * 12,
      savingsPercent: 35,
      reasoning: `GPT-4o mini ($0.15/MTok input) is 16× cheaper than GPT-4o ($2.50/MTok) and handles classification, summarization, simple Q&A, and data extraction comparably. Routing 50–60% of requests to the mini model typically saves 30–40% on total API spend without meaningful quality degradation.`,
      credexOpportunity: false,
    } as ToolRecommendation;
  }

  return {
    ...base,
    recommendedAction: "optimal",
    projectedSpend: input.monthlySpend,
    monthlySavings: 0,
    annualSavings: 0,
    savingsPercent: 0,
    reasoning: "OpenAI API spend is modest. At this scale, optimization effort likely exceeds savings.",
    credexOpportunity: false,
  } as ToolRecommendation;
}

function evaluateGemini(
  input: ToolInput,
  hasChatGPT: boolean,
  hasClaude: boolean
): ToolRecommendation {
  const base: Partial<ToolRecommendation> = {
    tool: "gemini",
    toolLabel: "Gemini",
    currentPlan: input.plan,
    currentSpend: input.monthlySpend,
  };

  const seats = input.seats || 1;
  const redundantWith = hasChatGPT ? "ChatGPT" : hasClaude ? "Claude" : null;

  if (redundantWith && input.plan === "advanced") {
    return {
      ...base,
      recommendedAction: "cancel",
      recommendedTool: `Keep ${redundantWith}`,
      projectedSpend: 0,
      monthlySavings: input.monthlySpend,
      annualSavings: input.monthlySpend * 12,
      savingsPercent: 100,
      reasoning: `You have both Gemini Advanced and ${redundantWith}. For general AI assistant tasks, these overlap heavily. Gemini's standout feature is deep Google Workspace integration (Gmail, Docs, Sheets). If you're not using that integration daily, ${redundantWith} covers your needs. The 2TB Google One storage may be independently worth it — if so, the Google One Basic plan ($3/mo) covers storage without the AI premium.`,
      credexOpportunity: false,
    } as ToolRecommendation;
  }

  return {
    ...base,
    recommendedAction: "optimal",
    projectedSpend: input.monthlySpend,
    monthlySavings: 0,
    annualSavings: 0,
    savingsPercent: 0,
    reasoning: "Gemini spend looks appropriate, especially if you use Google Workspace integration.",
    credexOpportunity: false,
  } as ToolRecommendation;
}

function evaluateWindsurf(
  input: ToolInput,
  hasCursor: boolean,
  useCase: UseCase
): ToolRecommendation {
  const base: Partial<ToolRecommendation> = {
    tool: "windsurf",
    toolLabel: "Windsurf",
    currentPlan: input.plan,
    currentSpend: input.monthlySpend,
  };

  if (hasCursor && input.plan !== "free") {
    return {
      ...base,
      recommendedAction: "cancel",
      recommendedTool: "Keep Cursor only",
      projectedSpend: 0,
      monthlySavings: input.monthlySpend,
      annualSavings: input.monthlySpend * 12,
      savingsPercent: 100,
      reasoning: `Cursor and Windsurf are both AI-first IDEs with overlapping feature sets. Running both paid plans is redundant unless you're actively A/B testing them. Cursor has broader model support and a larger community; Windsurf excels at agentic multi-file edits. Pick one and standardize — the switching cost of maintaining two workflows exceeds the marginal benefit.`,
      credexOpportunity: false,
    } as ToolRecommendation;
  }

  return {
    ...base,
    recommendedAction: "optimal",
    projectedSpend: input.monthlySpend,
    monthlySavings: 0,
    annualSavings: 0,
    savingsPercent: 0,
    reasoning: "Windsurf spend looks reasonable for your coding workflow.",
    credexOpportunity: false,
  } as ToolRecommendation;
}

// ─── Master audit function ─────────────────────────────────────────────────────

export function runAudit(formData: AuditFormData): AuditResult {
  const enabled = formData.tools.filter((t) => t.enabled);

  const hasToolEnabled = (name: ToolName) =>
    enabled.some((t) => t.tool === name);

  const recommendations: ToolRecommendation[] = enabled.map((input) => {
    switch (input.tool) {
      case "cursor":
        return evaluateCursor(input, formData.teamSize);
      case "github_copilot":
        return evaluateGitHubCopilot(input, formData.teamSize, formData.useCase);
      case "claude":
        return evaluateClaude(input, formData.teamSize);
      case "chatgpt":
        return evaluateChatGPT(
          input,
          formData.teamSize,
          hasToolEnabled("claude")
        );
      case "anthropic_api":
        return evaluateAnthropicApi(input, formData.teamSize);
      case "openai_api":
        return evaluateOpenAIApi(input);
      case "gemini":
        return evaluateGemini(
          input,
          hasToolEnabled("chatgpt"),
          hasToolEnabled("claude")
        );
      case "windsurf":
        return evaluateWindsurf(
          input,
          hasToolEnabled("cursor"),
          formData.useCase
        );
      default:
        return {
          tool: input.tool,
          toolLabel: input.tool,
          currentPlan: input.plan,
          currentSpend: input.monthlySpend,
          recommendedAction: "optimal" as const,
          projectedSpend: input.monthlySpend,
          monthlySavings: 0,
          annualSavings: 0,
          savingsPercent: 0,
          reasoning: "No specific recommendation available.",
          credexOpportunity: false,
        };
    }
  });

  const totalMonthlySpend = enabled.reduce((s, t) => s + t.monthlySpend, 0);
  const totalProjectedSpend = recommendations.reduce((s, r) => s + r.projectedSpend, 0);
  const totalMonthlySavings = totalMonthlySpend - totalProjectedSpend;
  const totalAnnualSavings = totalMonthlySavings * 12;

  const savingsRate = totalMonthlySpend > 0 ? totalMonthlySavings / totalMonthlySpend : 0;

  let overallAssessment: AuditResult["overallAssessment"];
  if (savingsRate <= 0.05) {
    overallAssessment = "optimal";
  } else if (savingsRate <= 0.15) {
    overallAssessment = "minor_savings";
  } else if (savingsRate <= 0.35) {
    overallAssessment = "significant_savings";
  } else {
    overallAssessment = "major_savings";
  }

  return {
    id: nanoid(12),
    createdAt: new Date().toISOString(),
    formData,
    recommendations,
    totalMonthlySpend,
    totalProjectedSpend,
    totalMonthlySavings,
    totalAnnualSavings,
    overallAssessment,
  };
}
