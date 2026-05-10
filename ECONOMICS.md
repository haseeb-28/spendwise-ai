# Economics

Unit economics model for SpendWise as a Credex lead-gen asset.

---

## What a Converted Lead Is Worth to Credex

Credex sells discounted AI credits at 20–30% below retail. The business model is a spread between acquisition cost and retail value.

**Assumptions (conservative):**
- Average credit purchase per customer: $2,000/month in AI spend redirected through Credex
- Credex margin on credits: 8% net (after sourcing cost)
- Average customer retention: 8 months
- LTV per customer: $2,000 × 8% × 8 months = **$1,280 LTV**

This is conservative. A company spending $5,000/month on Anthropic API that converts to Credex credits represents $400/month margin × 8 months = $3,200 LTV.

---

## CAC by Channel

| Channel | Cost | Converted Leads | CAC |
|---------|------|----------------|-----|
| HN / organic traffic | $0 | ~5/month | $0 |
| Twitter content | ~4 hrs/week × $50/hr equiv | ~8/month | ~$100 |
| Indie Hackers outreach | ~2 hrs/week × $50/hr equiv | ~3/month | ~$133 |
| Existing Credex email list | $0 (existing relationship) | ~10/month | $0 |
| **Blended** | ~$600/mo in time cost | ~26/month | **~$23/lead** |

At $23 CAC and $1,280 LTV, **LTV:CAC = 55:1**. Even at 10× worse conversion, the unit economics work.

---

## Conversion Funnel

```
Landing page visit          100%
↓
Audit form started           45%   (strong CTA, no login friction)
↓
Audit completed              70%   (form is fast, 8 tools max)
↓
Email captured               28%   (value shown first, email after)
↓
High-savings lead (>$500/mo)  15%  (of email captures)
↓
Credex consultation booked   20%   (of high-savings leads)
↓
Credit purchase              40%   (of consultations)
```

**Per 1,000 visitors:**
- 315 audits completed
- 88 emails captured
- 13 high-savings leads
- 2–3 consultations booked
- ~1 credit purchase

At $1,280 LTV per purchase and ~$23 CAC per captured lead (blended):

- Revenue per 1,000 visitors: ~$1,280–$3,840 (1–3 purchases)
- Lead gen cost per 1,000 visitors: ~$2,024 (88 leads × $23)

**Break-even: 2 purchases per 1,000 visitors.** Achievable.

---

## What Makes This Profitable

The audit-to-Credex conversion rate doesn't need to be high because:

1. **The tool is free to operate** — Vercel free tier + PocketBase free + Resend 3k/month free. Only Anthropic API costs money (~$0.01 per summary). At 100 audits/day, API cost is ~$30/month.

2. **The funnel qualifies itself** — Only users with >$500/month in identified savings see the Credex CTA prominently. These are exactly the customers Credex wants.

3. **Low-savings users still have value** — Even the "you're spending well" result builds brand trust. These users remember Credex when their spend grows.

---

## $1M ARR in 18 Months — What Must Be True

$1M ARR = ~$83,000/month in credit margins = ~65 active credit-buying customers at $1,280 LTV/year ($107/month).

To acquire 65 customers in 18 months (≈4/month):

- **Traffic needed:** ~4,000 unique visitors/month (at 1 purchase per 1,000 visitors)
- **Audit completions:** ~1,260/month
- **Email captures:** ~353/month
- **High-savings leads:** ~53/month
- **Consultations:** ~11/month
- **Purchases:** ~4/month ✓

4,000 visitors/month is achievable with:
- 1 HN post/month (500–2,000 visitors each)
- Consistent Twitter content (500–1,000 visitors/month)
- SEO from audit result pages being shared publicly (compounds over time)
- Credex existing customer base (300+ companies, some % check the tool)

**The critical assumption:** A 40% consultation-to-purchase rate. This requires the Credex sales process to be fast and trust-based — the audit pre-qualifies the lead, so the consultation should be a short call confirming fit, not a cold sale. If this drops to 20%, the model needs 2× the lead volume.

---

## Sensitivity Analysis

| Variable | Base | Optimistic | Pessimistic |
|----------|------|-----------|-------------|
| Email capture rate | 28% | 40% | 15% |
| High-savings % | 15% | 25% | 8% |
| Consultation rate | 20% | 35% | 10% |
| Purchase rate | 40% | 55% | 25% |
| **Purchases per 1k visitors** | **0.34** | **1.93** | **0.03** |

Pessimistic case (0.03 purchases/1k visitors) requires ~133k visitors/month for $1M ARR — not achievable organically. Optimistic case (1.93/1k) requires only ~650 visitors/month — easily achievable in 3 months.

The middle path (base case) requires sustained content distribution and a working Credex sales motion. Both are controllable.
