# User Interviews

Three conversations with potential users conducted during the build week.
Each interview was 10–15 minutes via DM/call. Names used with permission or anonymized on request.

---

## Interview 1 — A.K., CTO, B2B SaaS (Series A, 22 people)

**Date:** Day 1 of build week
**Format:** 15-minute Zoom call (found via mutual connection on LinkedIn)

**Background:** Runs a team of 8 engineers. Company uses Cursor (Business), GitHub Copilot (Business), and OpenAI API directly. Monthly AI spend around $1,800.

**Direct quotes:**

> "I look at the bill every month and I just… approve it. I don't know what the right number is. Is $1,800 a lot? Is it normal? I have no idea."

> "We're on Cursor Business because someone set it up that way and nobody questioned it. I honestly don't know what we get for the extra $20 a seat."

> "If someone showed me a comparison that said 'here's what you're paying, here's what you should be paying, here's why' — I would act on that same day."

**Most surprising thing they said:**
They had never compared Cursor Business vs Pro. Assumed Business was "just better" without ever reading what Business actually includes. The SSO and admin dashboard features were completely irrelevant to their team. This shaped the audit engine's emphasis on justifying plan tiers explicitly.

**What it changed about the design:**
Added the "1-sentence reason" to every recommendation card. Originally planned to just show the savings number. The CTO's quote — "here's why" — made clear the reasoning is more valuable than the number.

---

## Interview 2 — M.R. (anonymized), Indie Hacker, Solo Founder

**Date:** Day 2 of build week
**Format:** Twitter DM thread, ~12 messages back and forth

**Background:** Building a SaaS product solo. Uses Claude Pro, ChatGPT Plus, and Windsurf Pro. Monthly spend ~$55. Has a small side project on the side also using OpenAI API.

**Direct quotes:**

> "I use Claude for writing and ChatGPT for when Claude doesn't get the coding stuff right. But honestly they both do both. I'm probably paying for redundancy."

> "I don't even know what Windsurf's plan includes vs the free tier. I just upgraded because a tweet said Pro was worth it."

> "I'd want the tool to tell me 'you can cut this' but also tell me what I'd lose. Not just 'cancel this and save money.'"

**Most surprising thing they said:**
Used both Claude and ChatGPT not for different capabilities, but as psychological fallbacks — trying one when the other "didn't get it right." Had never A/B tested them systematically. Admitted neither was clearly better for their use case; it was habit.

**What it changed about the design:**
The "cancel" recommendation needed to explicitly name what capability would be lost, not just the savings amount. Added the "what you'd lose" framing to the reasoning text in the evaluators. Also influenced the "optimal" state copy — changed from "no savings found" to "You're spending well" to feel affirming rather than empty.

---

## Interview 3 — S.T., Engineering Manager, Fintech Startup (Seed, 9 people)

**Date:** Day 3 of build week
**Format:** 10-minute phone call (found via Indie Hackers forum post asking for feedback)

**Background:** Small engineering team using GitHub Copilot Individual for each developer (6 seats). CEO recently asked why the AI tool line item was growing. Had just switched from Copilot Individual to Business "because Business sounds more professional for a fintech."

**Direct quotes:**

> "We moved to Business because we have enterprise clients and it just felt more legitimate. I didn't realize it was $9 more per seat per month."

> "Nobody told us the difference. GitHub's pricing page is actually pretty confusing about what each tier adds."

> "If there was a tool that said 'for 6 developers doing X, here's the right plan,' I'd just use that. I don't want to research it myself."

**Most surprising thing they said:**
Chose the Business plan for social signaling — it "sounds more professional" — not for any feature it provided. This is a totally rational decision in enterprise sales contexts (clients auditing your security practices might ask what tools you use) but a real overspend for the actual functionality. This validated the "defensible reasoning" requirement — the audit engine had to acknowledge legitimate reasons for higher-tier plans, not just reflexively say "downgrade."

**What it changed about the design:**
Added nuance to the Copilot Business recommendation — now explicitly names the features included (SSO, audit logs, org-level policies) and states the threshold at which they're worth it ("5+ seat teams in regulated industries"). The audit no longer just says "downgrade" — it says why the current plan might be appropriate and when it isn't.
