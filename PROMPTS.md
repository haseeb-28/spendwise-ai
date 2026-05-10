# Prompts

All LLM prompts used in SpendWise, with design rationale.

---

## 1. Audit Summary Prompt

**Location:** `src/app/api/generate-summary/route.ts` → `buildAuditPrompt()`

**Model:** claude-sonnet-4 (Anthropic)

**Full prompt (dynamically populated):**

```
You are a pragmatic CFO advisor writing a 90–120 word audit summary for a startup team.

The team:
- Size: {teamSize} people
- Primary AI use case: {useCase}
- Total current AI spend: ${totalMonthlySpend}/month

Their AI tools and recommendations:
{toolSummary}

Total identified savings: ${totalMonthlySavings}/month (${totalMonthlySavings * 12}/year)

Write a concise, specific, non-generic summary paragraph.
- Open with the key finding (savings amount or "well-optimized")
- Call out the 1–2 biggest opportunities by tool name
- Close with one actionable next step
- Tone: direct, confident, slightly informal — like a trusted advisor, not a report
- Do NOT use bullet points. Pure prose only.
- Do NOT start with "I" or "Your team"
- Do NOT make up numbers not in the data above
```

**Why this prompt works:**

1. **Role assignment ("pragmatic CFO advisor")** — Sets tone without being verbose. "Pragmatic" prevents flowery language. "CFO" anchors the voice in financial credibility.

2. **Explicit constraints on format** — "Do NOT use bullet points" and "Pure prose only" prevent the model from defaulting to its habit of bullet-listing. Without this, 80% of outputs were bulleted lists that looked nothing like a human advisor.

3. **Data-grounded constraint** — "Do NOT make up numbers not in the data above" prevents hallucinated savings figures. Early versions would confidently state "$2,400/year" when the actual number was different. This constraint, combined with passing in the actual numbers, solved it.

4. **Negative examples in the opening constraint** — "non-generic" and calling out specific anti-patterns ("not a report") guides the model away from template-sounding output.

5. **Word count range (90–120)** — A range is more effective than an exact count. "Under 150 words" produced outputs of exactly 148 words every time. A tight range produces more natural writing.

---

## What I tried that didn't work

**Attempt 1 — Simple prompt:**
> "Write a summary of this AI spend audit: {data}"

Result: Generic, bulleted, repeated the numbers back without adding insight. Sounded like a robot reading a spreadsheet.

**Attempt 2 — Persona-first:**
> "You are a friendly financial advisor. Here is an audit. Write a summary."

Result: Too warm and hedging. Used phrases like "It seems like you might want to consider possibly..." — not confident enough for a founder audience.

**Attempt 3 — Output format specification:**
> "Write exactly 3 sentences: 1) key finding, 2) biggest opportunity, 3) next step."

Result: Mechanical and robotic. The "exactly 3 sentences" constraint made every output feel like a fill-in-the-blank form.

**Final approach** — Persona + negative constraints + data-grounding. The combination of "what to do" and explicit "do NOT do" rules produced the most natural, advisor-sounding output consistently.

---

## 2. Fallback Summary (No API)

When the Anthropic API fails (timeout, 429, or missing key), we fall back to a templated string generated in `buildFallbackSummary()`. This is pure TypeScript — no LLM.

The fallback is designed to be genuinely useful, not a placeholder. It uses the actual numbers from the audit and pulls the top savings opportunity by name. A user who receives the fallback gets a complete, accurate summary — they just don't get the more natural prose style of the LLM version.

**Fallback logic:**
1. If no savings → honest "well-optimized" message with actual spend number
2. If savings exist → names the top saving tool, quotes its savings amount, gives one next step

The fallback is always logged with `fallback: true` in the API response so it can be monitored separately from LLM-generated summaries.
