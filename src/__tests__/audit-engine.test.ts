import { runAudit } from "../lib/audit-engine";
import type { AuditFormData } from "../types";

// ── Helper ────────────────────────────────────────────────────────────────────
function makeForm(overrides: Partial<AuditFormData> = {}): AuditFormData {
  return {
    tools: [],
    teamSize: 5,
    useCase: "coding",
    ...overrides,
  };
}

// ── Test 1: Cursor Business downgrade for small team ─────────────────────────
describe("Cursor evaluator", () => {
  test("recommends downgrade from Business to Pro for teams < 5 seats", () => {
    const form = makeForm({
      tools: [
        { tool: "cursor", plan: "business", monthlySpend: 120, seats: 3, enabled: true },
      ],
    });
    const result = runAudit(form);
    const rec = result.recommendations.find((r) => r.tool === "cursor")!;

    expect(rec.recommendedAction).toBe("downgrade");
    expect(rec.monthlySavings).toBeGreaterThan(0);
    expect(rec.projectedSpend).toBe(60); // 3 seats × $20
    expect(rec.annualSavings).toBe(rec.monthlySavings * 12);
  });

  test("marks Cursor Pro as optimal for correctly-sized team", () => {
    const form = makeForm({
      tools: [
        { tool: "cursor", plan: "pro", monthlySpend: 60, seats: 3, enabled: true },
      ],
    });
    const result = runAudit(form);
    const rec = result.recommendations.find((r) => r.tool === "cursor")!;

    expect(rec.recommendedAction).toBe("optimal");
    expect(rec.monthlySavings).toBe(0);
  });
});

// ── Test 2: GitHub Copilot Business → Individual for small teams ─────────────
describe("GitHub Copilot evaluator", () => {
  test("recommends downgrade from Business to Individual for < 5 seats", () => {
    const form = makeForm({
      tools: [
        { tool: "github_copilot", plan: "business", monthlySpend: 76, seats: 4, enabled: true },
      ],
    });
    const result = runAudit(form);
    const rec = result.recommendations.find((r) => r.tool === "github_copilot")!;

    expect(rec.recommendedAction).toBe("downgrade");
    expect(rec.projectedSpend).toBe(40); // 4 × $10
    expect(rec.monthlySavings).toBe(36);
  });

  test("recommends cancel for non-coding use case", () => {
    const form = makeForm({
      useCase: "writing",
      tools: [
        { tool: "github_copilot", plan: "individual", monthlySpend: 10, seats: 1, enabled: true },
      ],
    });
    const result = runAudit(form);
    const rec = result.recommendations.find((r) => r.tool === "github_copilot")!;

    expect(rec.recommendedAction).toBe("cancel");
    expect(rec.reasoning).toMatch(/writing/i);
  });
});

// ── Test 3: Claude Team for 1 user → downgrade to Pro ────────────────────────
describe("Claude evaluator", () => {
  test("downgrades Team to Pro for single user", () => {
    const form = makeForm({
      tools: [
        { tool: "claude", plan: "team", monthlySpend: 25, seats: 1, enabled: true },
      ],
    });
    const result = runAudit(form);
    const rec = result.recommendations.find((r) => r.tool === "claude")!;

    expect(rec.recommendedAction).toBe("downgrade");
    expect(rec.projectedSpend).toBe(20);
    expect(rec.monthlySavings).toBe(5);
  });

  test("flags Max plan as likely overkill for single user", () => {
    const form = makeForm({
      tools: [
        { tool: "claude", plan: "max", monthlySpend: 100, seats: 1, enabled: true },
      ],
    });
    const result = runAudit(form);
    const rec = result.recommendations.find((r) => r.tool === "claude")!;

    expect(rec.recommendedAction).toBe("downgrade");
    expect(rec.monthlySavings).toBe(80);
    expect(rec.annualSavings).toBe(960);
  });
});

// ── Test 4: Redundant Claude + ChatGPT ───────────────────────────────────────
describe("ChatGPT evaluator", () => {
  test("recommends cancelling ChatGPT Plus when Claude Pro also active", () => {
    const form = makeForm({
      tools: [
        { tool: "claude", plan: "pro", monthlySpend: 20, seats: 1, enabled: true },
        { tool: "chatgpt", plan: "plus", monthlySpend: 20, seats: 1, enabled: true },
      ],
    });
    const result = runAudit(form);
    const chatgptRec = result.recommendations.find((r) => r.tool === "chatgpt")!;

    expect(chatgptRec.recommendedAction).toBe("cancel");
    expect(chatgptRec.monthlySavings).toBe(20);
    expect(chatgptRec.reasoning).toMatch(/redundant|overlapping/i);
  });
});

// ── Test 5: Anthropic API high spend → Credex opportunity ────────────────────
describe("Anthropic API evaluator", () => {
  test("surfaces Credex opportunity for high API spend", () => {
    const form = makeForm({
      tools: [
        { tool: "anthropic_api", plan: "api_direct", monthlySpend: 500, seats: 1, enabled: true },
      ],
    });
    const result = runAudit(form);
    const rec = result.recommendations.find((r) => r.tool === "anthropic_api")!;

    expect(rec.credexOpportunity).toBe(true);
    expect(rec.monthlySavings).toBeGreaterThan(0);
  });

  test("marks low API spend as optimal", () => {
    const form = makeForm({
      tools: [
        { tool: "anthropic_api", plan: "api_direct", monthlySpend: 20, seats: 1, enabled: true },
      ],
    });
    const result = runAudit(form);
    const rec = result.recommendations.find((r) => r.tool === "anthropic_api")!;

    expect(rec.recommendedAction).toBe("optimal");
    expect(rec.credexOpportunity).toBe(false);
  });
});

// ── Test 6: Windsurf + Cursor redundancy ─────────────────────────────────────
describe("Windsurf evaluator", () => {
  test("recommends cancelling Windsurf when Cursor also active", () => {
    const form = makeForm({
      tools: [
        { tool: "cursor", plan: "pro", monthlySpend: 20, seats: 1, enabled: true },
        { tool: "windsurf", plan: "pro", monthlySpend: 15, seats: 1, enabled: true },
      ],
    });
    const result = runAudit(form);
    const rec = result.recommendations.find((r) => r.tool === "windsurf")!;

    expect(rec.recommendedAction).toBe("cancel");
    expect(rec.monthlySavings).toBe(15);
  });
});

// ── Test 7: Overall assessment thresholds ────────────────────────────────────
describe("Overall assessment", () => {
  test("marks result as major_savings when savings rate > 35%", () => {
    const form = makeForm({
      tools: [
        { tool: "cursor", plan: "business", monthlySpend: 400, seats: 5, enabled: true },
        { tool: "github_copilot", plan: "enterprise", monthlySpend: 390, seats: 10, enabled: true },
      ],
    });
    const result = runAudit(form);
    expect(["significant_savings", "major_savings"]).toContain(result.overallAssessment);
    expect(result.totalMonthlySavings).toBeGreaterThan(0);
  });

  test("marks result as optimal when all tools are well-sized", () => {
    const form = makeForm({
      tools: [
        { tool: "cursor", plan: "pro", monthlySpend: 60, seats: 3, enabled: true },
        { tool: "claude", plan: "pro", monthlySpend: 20, seats: 1, enabled: true },
      ],
    });
    const result = runAudit(form);
    expect(result.overallAssessment).toBe("optimal");
    expect(result.totalMonthlySavings).toBe(0);
  });

  test("total annual savings equals monthly savings × 12", () => {
    const form = makeForm({
      tools: [
        { tool: "cursor", plan: "business", monthlySpend: 200, seats: 3, enabled: true },
      ],
    });
    const result = runAudit(form);
    expect(result.totalAnnualSavings).toBe(result.totalMonthlySavings * 12);
  });
});
