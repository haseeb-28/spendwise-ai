import type { ToolDefinition } from "@/types";

export const TOOLS: ToolDefinition[] = [
  {
    id: "cursor",
    label: "Cursor",
    vendor: "Anysphere",
    logoColor: "#000000",
    category: "ide",
    plans: [
      {
        planId: "hobby",
        label: "Hobby",
        pricePerSeat: 0,
        features: ["2000 completions/month", "50 slow premium requests"],
        bestFor: ["coding"],
      },
      {
        planId: "pro",
        label: "Pro",
        pricePerSeat: 20,
        features: ["Unlimited completions", "500 fast premium requests/month", "Unlimited slow premium"],
        bestFor: ["coding"],
      },
      {
        planId: "business",
        label: "Business",
        pricePerSeat: 40,
        minSeats: 1,
        features: ["All Pro features", "Admin dashboard", "SSO", "Usage analytics", "Privacy mode forced"],
        bestFor: ["coding"],
      },
      {
        planId: "enterprise",
        label: "Enterprise",
        pricePerSeat: 0,
        features: ["Custom pricing", "Dedicated support", "Custom models"],
        bestFor: ["coding"],
      },
    ],
  },
  {
    id: "github_copilot",
    label: "GitHub Copilot",
    vendor: "GitHub / Microsoft",
    logoColor: "#24292f",
    category: "ide",
    plans: [
      {
        planId: "individual",
        label: "Individual",
        pricePerSeat: 10,
        maxSeats: 1,
        features: ["Code completions", "Chat in IDE", "CLI support"],
        bestFor: ["coding"],
      },
      {
        planId: "business",
        label: "Business",
        pricePerSeat: 19,
        minSeats: 1,
        features: ["All Individual features", "Organization policies", "Audit logs", "SSO"],
        bestFor: ["coding"],
      },
      {
        planId: "enterprise",
        label: "Enterprise",
        pricePerSeat: 39,
        minSeats: 1,
        features: ["All Business features", "Fine-tuned models", "Copilot in GitHub.com", "Docsets"],
        bestFor: ["coding"],
      },
    ],
  },
  {
    id: "claude",
    label: "Claude",
    vendor: "Anthropic",
    logoColor: "#d97706",
    category: "chat",
    plans: [
      {
        planId: "free",
        label: "Free",
        pricePerSeat: 0,
        features: ["Limited Claude access", "Basic features"],
        bestFor: ["writing", "research", "mixed"],
      },
      {
        planId: "pro",
        label: "Pro",
        pricePerSeat: 20,
        maxSeats: 1,
        features: ["5x more usage than Free", "Priority access", "Early features", "Projects"],
        bestFor: ["writing", "research", "mixed", "coding"],
      },
      {
        planId: "max",
        label: "Max",
        pricePerSeat: 100,
        maxSeats: 1,
        features: ["20x usage vs Free (Max 5x)", "Highest limits", "Priority access"],
        bestFor: ["writing", "research", "mixed", "coding"],
      },
      {
        planId: "team",
        label: "Team",
        pricePerSeat: 25,
        minSeats: 2,
        features: ["Higher limits than Pro", "Collaboration features", "Admin controls", "Projects"],
        bestFor: ["writing", "research", "mixed", "coding"],
      },
      {
        planId: "enterprise",
        label: "Enterprise",
        pricePerSeat: 0,
        features: ["Custom pricing", "SSO/SAML", "Admin console", "Custom data retention"],
        bestFor: ["writing", "research", "mixed", "coding"],
      },
    ],
  },
  {
    id: "chatgpt",
    label: "ChatGPT",
    vendor: "OpenAI",
    logoColor: "#10a37f",
    category: "chat",
    plans: [
      {
        planId: "plus",
        label: "Plus",
        pricePerSeat: 20,
        maxSeats: 1,
        features: ["GPT-4o access", "Advanced data analysis", "DALL-E 3", "Custom GPTs"],
        bestFor: ["writing", "research", "mixed", "data"],
      },
      {
        planId: "team",
        label: "Team",
        pricePerSeat: 30,
        minSeats: 2,
        features: ["Higher limits than Plus", "Admin workspace", "Data excluded from training"],
        bestFor: ["writing", "research", "mixed", "data"],
      },
      {
        planId: "enterprise",
        label: "Enterprise",
        pricePerSeat: 0,
        features: ["Custom pricing", "SSO", "Unlimited GPT-4", "Advanced security"],
        bestFor: ["writing", "research", "mixed", "data"],
      },
    ],
  },
  {
    id: "anthropic_api",
    label: "Anthropic API",
    vendor: "Anthropic",
    logoColor: "#d97706",
    category: "api",
    plans: [
      {
        planId: "api_direct",
        label: "API (Pay-as-you-go)",
        pricePerSeat: 0,
        features: ["Claude Haiku: $0.25/MTok in, $1.25/MTok out", "Claude Sonnet: $3/MTok in, $15/MTok out", "Claude Opus: $15/MTok in, $75/MTok out"],
        bestFor: ["coding", "writing", "data", "research", "mixed"],
      },
    ],
  },
  {
    id: "openai_api",
    label: "OpenAI API",
    vendor: "OpenAI",
    logoColor: "#10a37f",
    category: "api",
    plans: [
      {
        planId: "api_direct",
        label: "API (Pay-as-you-go)",
        pricePerSeat: 0,
        features: ["GPT-4o: $2.50/MTok in, $10/MTok out", "GPT-4o mini: $0.15/MTok in, $0.60/MTok out", "o1: $15/MTok in, $60/MTok out"],
        bestFor: ["coding", "writing", "data", "research", "mixed"],
      },
    ],
  },
  {
    id: "gemini",
    label: "Gemini",
    vendor: "Google",
    logoColor: "#4285f4",
    category: "chat",
    plans: [
      {
        planId: "free",
        label: "Free",
        pricePerSeat: 0,
        features: ["Gemini 1.5 Flash", "Basic limits"],
        bestFor: ["writing", "research", "mixed"],
      },
      {
        planId: "advanced",
        label: "Advanced (Google One AI Premium)",
        pricePerSeat: 20,
        maxSeats: 1,
        features: ["Gemini Ultra", "2TB Google One storage", "Gemini in Gmail/Docs/Sheets"],
        bestFor: ["writing", "research", "mixed", "data"],
      },
      {
        planId: "business",
        label: "Business (Workspace)",
        pricePerSeat: 30,
        minSeats: 1,
        features: ["Gemini in all Workspace apps", "Enterprise security", "Admin controls"],
        bestFor: ["writing", "research", "mixed", "data"],
      },
    ],
  },
  {
    id: "windsurf",
    label: "Windsurf",
    vendor: "Codeium",
    logoColor: "#6366f1",
    category: "ide",
    plans: [
      {
        planId: "free",
        label: "Free",
        pricePerSeat: 0,
        features: ["5 Flow Action credits/day", "Unlimited tab completions"],
        bestFor: ["coding"],
      },
      {
        planId: "pro",
        label: "Pro",
        pricePerSeat: 15,
        features: ["Unlimited Flow Actions", "Priority access", "Advanced models"],
        bestFor: ["coding"],
      },
      {
        planId: "teams",
        label: "Teams",
        pricePerSeat: 35,
        minSeats: 2,
        features: ["All Pro features", "Admin dashboard", "SSO", "Team analytics"],
        bestFor: ["coding"],
      },
    ],
  },
];

export const TOOL_MAP = Object.fromEntries(TOOLS.map((t) => [t.id, t]));

export function getPlan(toolId: string, planId: string) {
  const tool = TOOL_MAP[toolId];
  if (!tool) return null;
  return tool.plans.find((p) => p.planId === planId) ?? null;
}
