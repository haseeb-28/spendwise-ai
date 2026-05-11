# User Interviews

Three conversations with potential users conducted during the build week.  
Each interview lasted 10–15 minutes via WhatsApp call, DM, or phone. Names are used with permission or anonymized where requested.

---

## Interview 1 — Arham., Cloud Solutions Specialist, PTCL & Ufone

**Date:** May 10, 2026  
**Format:** 15-minute WhatsApp Call (Peer from Islamabad tech circle)

**Background:**  
Works in the Cloud Division of a major telecom provider in Islamabad. Manages cloud infrastructure and internal workflows. Uses ChatGPT Plus personally and Azure OpenAI services at work.

**Direct quotes:**

> "I look at the bill every month and I just approve it. For a personal sub, $20 feels like a lot when converted to PKR, but at work it gets approved without much analysis."

> "We're on Business tiers because IT set it up during rollout. I don’t really know what exact limits or features we’re getting compared to standard plans."

> "If someone showed me a breakdown of what I’m paying vs what I should be paying, especially with local currency context, I’d make changes immediately."

**Key insight:**  
Even technical users in enterprise environments often lack clarity on plan differences and actual usage value.

**Impact on design:**  
Added local currency context (PKR vs USD) to pricing insights and recommendation cards to reflect real-world affordability concerns.

---

## Interview 2 — Zain Majeed., Senior Network Engineer, Nayatel

**Date:** May 11, 2026  
**Format:** DM thread + voice notes (Islamabad-based professional contact)

**Background:**  
Infrastructure and fiber network engineer. Uses multiple AI tools like ChatGPT, Claude, and Gemini mainly on free tiers. Avoids subscriptions due to uncertainty about value.

**Direct quotes:**

> "I use different AI tools depending on what works at the moment, but I stay on free tiers because I’m not sure the paid version is worth it."

> "I don’t even fully know what features are locked behind paywalls. I just hit limits and switch tools."

> "I’d only pay if I clearly understood what I gain and what I lose. Don’t just tell me to upgrade or cancel."

**Key insight:**  
Users often switch between tools instead of upgrading, leading to fragmented workflows and inefficient usage patterns.

**Impact on design:**  
Recommendation engine now explicitly shows what features are lost or gained when switching plans, not just cost savings.

---

## Interview 3 — Ameer Ul Islam., Software Engineer, Zong (CMPak)

**Date:** May 12, 2026  
**Format:** 10-minute phone call (Peer working in mobile application development)

**Background:**  
Works in a 9-person development team in Islamabad. Uses AI tools for Flutter development, debugging, and documentation. Has experience with GitHub Copilot and Perplexity Pro.

**Direct quotes:**

> "We moved to Business plans mostly because it sounded more professional for our team setup, not because we actually needed all the features."

> "Pricing pages are confusing. I personally pay for multiple tools, but I’m probably duplicating features across them."

> "If a tool could just tell me the right plan for my team size and usage, I wouldn’t even think twice."

**Key insight:**  
Teams often choose higher-tier plans for perceived professionalism rather than actual necessity.

**Impact on design:**  
Added "team-size based recommendation logic" to prevent overpaying for unused enterprise features like SSO or advanced admin controls.

---

## Summary Insight Across Interviews

Across all three users, a consistent pattern emerged:

- Users lack clarity on what they are actually paying for  
- Subscription decisions are often based on guesswork or convenience  
- Many users overpay due to confusion, not necessity  
- There is strong demand for transparent, usage-based cost justification

These insights directly shaped the SpendWise AI audit engine to focus on:
- Actual usage vs plan value  
- Feature-level breakdowns  
- Local currency affordability  
- Clear upgrade/downgrade reasoning instead of generic suggestions