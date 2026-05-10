# Pricing Data

All prices used in the audit engine. Every number traces to an official vendor pricing page.

---

## Cursor

- Hobby: $0/month — https://cursor.com/pricing — verified 2025-05-10
- Pro: $20/user/month — https://cursor.com/pricing — verified 2025-05-10
- Business: $40/user/month — https://cursor.com/pricing — verified 2025-05-10
- Enterprise: Custom pricing (contact sales) — https://cursor.com/pricing — verified 2025-05-10

**Notes:** Pro includes 500 fast premium requests/month + unlimited slow. Business adds SSO, admin dashboard, enforced privacy mode. Cursor Credits available separately.

---

## GitHub Copilot

- Individual: $10/user/month (or $100/year) — https://github.com/features/copilot#pricing — verified 2025-05-10
- Business: $19/user/month — https://github.com/features/copilot#pricing — verified 2025-05-10
- Enterprise: $39/user/month — https://github.com/features/copilot#pricing — verified 2025-05-10

**Notes:** Individual includes code completion + chat. Business adds org-level policy management, audit logs, IP indemnity. Enterprise adds fine-tuned models on private codebase, Copilot on GitHub.com.

---

## Claude (Anthropic)

- Free: $0/month — https://www.anthropic.com/pricing — verified 2025-05-10
- Pro: $20/user/month — https://www.anthropic.com/pricing — verified 2025-05-10
- Max (5x): $100/user/month — https://www.anthropic.com/pricing — verified 2025-05-10
- Max (20x): $200/user/month — https://www.anthropic.com/pricing — verified 2025-05-10
- Team: $25/user/month (min 2 seats) — https://www.anthropic.com/pricing — verified 2025-05-10
- Enterprise: Custom pricing — https://www.anthropic.com/pricing — verified 2025-05-10

**Notes:** Max plan provides 5× or 20× usage compared to Free tier. Team requires minimum 2 seats.

---

## ChatGPT (OpenAI)

- Free: $0/month — https://openai.com/chatgpt/pricing — verified 2025-05-10
- Plus: $20/user/month — https://openai.com/chatgpt/pricing — verified 2025-05-10
- Team: $30/user/month (min 2 seats) — https://openai.com/chatgpt/pricing — verified 2025-05-10
- Enterprise: Custom pricing — https://openai.com/chatgpt/pricing — verified 2025-05-10

**Notes:** Plus includes GPT-4o, DALL-E 3, Advanced Data Analysis, custom GPTs. Team adds workspace, higher rate limits, data excluded from training.

---

## Anthropic API (Direct)

- claude-haiku-3-5: $0.80/MTok input, $4.00/MTok output — https://www.anthropic.com/pricing#anthropic-api — verified 2025-05-10
- claude-sonnet-4: $3.00/MTok input, $15.00/MTok output — https://www.anthropic.com/pricing#anthropic-api — verified 2025-05-10
- claude-opus-4: $15.00/MTok input, $75.00/MTok output — https://www.anthropic.com/pricing#anthropic-api — verified 2025-05-10

**Notes:** Prompt caching available — reduces input cost by ~90% for repeated context. Batch API available at 50% discount for non-real-time workloads.

---

## OpenAI API (Direct)

- gpt-4o: $2.50/MTok input, $10.00/MTok output — https://openai.com/api/pricing — verified 2025-05-10
- gpt-4o-mini: $0.15/MTok input, $0.60/MTok output — https://openai.com/api/pricing — verified 2025-05-10
- o1: $15.00/MTok input, $60.00/MTok output — https://openai.com/api/pricing — verified 2025-05-10
- o3-mini: $1.10/MTok input, $4.40/MTok output — https://openai.com/api/pricing — verified 2025-05-10

**Notes:** gpt-4o-mini is 16× cheaper than gpt-4o and handles most classification, summarization, and extraction tasks comparably.

---

## Gemini (Google)

- Free: $0/month — https://one.google.com/about/ai-premium — verified 2025-05-10
- Google One AI Premium (Gemini Advanced): $19.99/user/month — https://one.google.com/about/ai-premium — verified 2025-05-10
- Google Workspace with Gemini Business: $30/user/month (add-on) — https://workspace.google.com/intl/en/pricing — verified 2025-05-10

**Notes:** AI Premium includes 2TB Google One storage + Gemini Advanced (Ultra model). Workspace add-on required for Gemini in Gmail, Docs, Sheets, Slides.

---

## Windsurf (Codeium)

- Free: $0/month — https://windsurf.com/pricing — verified 2025-05-10
- Pro: $15/user/month — https://windsurf.com/pricing — verified 2025-05-10
- Teams: $35/user/month (min 2 seats) — https://windsurf.com/pricing — verified 2025-05-10
- Enterprise: Custom pricing — https://windsurf.com/pricing — verified 2025-05-10

**Notes:** Free includes unlimited tab completions + 5 Flow Action credits/day. Pro adds unlimited Flow Actions, priority model access.

---

## Audit Engine Savings Estimates

The following estimated savings rates are used where exact pricing isn't calculable from inputs alone:

| Scenario | Savings Rate | Basis |
|----------|-------------|-------|
| Credex credits (Anthropic API) | 25% | Credex stated discount range 20–30%; used midpoint |
| Credex credits (OpenAI API) | 20% | Conservative end of 20–30% range |
| Prompt caching (Anthropic) | 15% | Conservative estimate; actual depends on prompt repeat rate (up to 90%) |
| Model routing to mini (OpenAI) | 35% | Assumes 50% of requests route to gpt-4o-mini at 16× lower cost |
| Enterprise negotiation (Cursor 20+ seats) | 20% | Industry standard enterprise discount for seat volume |
