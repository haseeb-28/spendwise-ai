# Metrics

---

## North Star Metric

**Audits with email captured per week**

This is the single metric that matters at this stage. It represents:

1. A user completed the audit (got value)
2. Trusted us enough to share their email (qualified lead)
3. Created a record Credex can follow up on (business outcome)

"Audits completed" without email capture is vanity — we have no way to convert them. "Emails collected" without a completed audit means we're capturing leads before delivering value (wrong order). The combination is the right unit.

Why not DAU or retention? This tool is used once per quarter per company. DAU is the wrong metric for a tool people use seasonally. The North Star should reflect the B2B lead-gen reality.

---

## 3 Input Metrics That Drive the North Star

### 1. Audit Completion Rate
`Audits completed / Landing page visits`

Target: ≥ 40%

This measures how well the landing page converts visitors to form-starters, and how well the form converts starters to completers. A drop here means the form is too long, too confusing, or the landing page isn't qualifying intent correctly.

### 2. Email Capture Rate
`Email captures / Audits completed`

Target: ≥ 25%

This measures the results page's ability to convert value into a lead. If this drops, the results page isn't showing enough value (savings numbers are too low), the email gate copy isn't compelling, or we're asking too early.

### 3. High-Savings Lead Rate
`High-savings leads (>$500/mo) / Email captures`

Target: ≥ 12%

This is the Credex-relevant segment. If this drops, either the audit engine is underidentifying savings (audit logic issue) or we're attracting the wrong users (GTM issue — too many solo devs with $50/month spend).

---

## What We'd Instrument First

**Day 1 instrumentation (before any marketing):**

1. `audit_started` — user clicks any tool checkbox
2. `audit_completed` — `/api/audit` returns 200
3. `email_captured` — `/api/submit-lead` returns 200
4. `share_link_copied` — user clicks the share button
5. `result_page_loaded` — from a share link (not originating session)

Tool: Posthog (free tier, self-hostable, privacy-friendly). One `posthog.capture()` call per event.

**Week 2 instrumentation:**

6. `tool_added` — which tools users add (shows which tools are most common)
7. `recommendation_expanded` — which recommendations users read in full (shows what they care about)
8. `credex_cta_clicked` — Credex link clicks from high-savings results
9. `audit_form_abandoned` — form started but not completed (where they dropped off)

---

## Pivot Trigger

**If email capture rate drops below 15% for 2 consecutive weeks:**

This signals a fundamental mismatch between the value we're showing and what users expected. Possible causes:
- Savings numbers are too low (audit engine too conservative)
- Results page not clear enough
- Wrong traffic source (users who aren't actually paying for AI tools)

Response: Run 5 user interviews immediately. Don't optimize UI without understanding why.

**If high-savings lead rate drops below 5%:**

We're attracting the wrong users. The GTM is sending solo devs with $20/month in tools, not engineering managers with $2,000/month. Pivot the content distribution toward enterprise-adjacent channels (Lenny's community, SaaStr, engineering leadership Slacks).

**If share link usage is < 2% of completions after 4 weeks:**

The viral loop isn't working. The result page isn't generating enough "I need to show this to someone" moments. Options: increase savings numbers shown (make the hero number bigger), add a "challenge" mechanic ("your spend per developer is $X — 73% of companies your size spend less"), or add social proof to the share preview.
