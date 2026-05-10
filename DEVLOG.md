# DEVLOG

> One entry per day. Commits on at least 5 distinct calendar days.

---

## Day 1 — YYYY-MM-DD

**Hours worked:** 5

**What I did:**
- Read the assignment in full twice. Made a feature checklist and prioritized MVP vs bonus.
- Scaffolded Next.js 14 project with TypeScript + Tailwind
- Set up PocketBase locally, created 3 collections (audits, leads, rate_limits) with API rules unlocked
- Implemented the core type system (`/src/types/index.ts`)
- Built the pricing data file with all 8 tools and their plans
- Made first commit with project scaffold
- Conducted first user interview (see USER_INTERVIEWS.md)

**What I learned:**
- PocketBase's REST API with admin token auth is simpler than I expected — one `getAdminToken()` call, then standard fetch requests
- Next.js App Router metadata API handles OG tags really cleanly — just export a `generateMetadata` async function

**Blockers / what I'm stuck on:**
- Deciding between server-side and client-side audit execution. Leaning server-side for audit storage, client-side for instant feedback

**Plan for tomorrow:**
- Build the full audit engine with all evaluator functions
- Write the 5+ tests for the audit engine
- Start on the form UI

---

## Day 2 — YYYY-MM-DD

**Hours worked:** 6

**What I did:**
- Built the complete audit engine (`/src/lib/audit-engine.ts`)
- Each tool has its own evaluator function with specific rules (not generic)
- Wrote 7 unit tests covering audit engine edge cases
- Set up Jest + ts-jest configuration
- Second user interview

**What I learned:**
- The "redundant tools" pattern (both Claude Pro AND ChatGPT Plus) is the most common real overspend finding — good to prioritize that logic
- TypeScript discriminated unions make the recommendation actions type-safe

**Blockers / what I'm stuck on:**
- Anthropic API prompt caching docs are slightly unclear — need to test the actual API response format

**Plan for tomorrow:**
- Build the AuditForm component
- Add form persistence with localStorage
- Set up the API routes

---

## Day 3 — YYYY-MM-DD

**Hours worked:** 7

**What I did:**
- Built the AuditForm component with all 8 tools, plan selectors, spend inputs
- Added localStorage persistence — form state survives page reload
- Built `/api/audit` route with Zod validation, rate limiting via PocketBase `rate_limits` collection, honeypot
- Ran the end-to-end flow for the first time — got results back
- Third user interview — changed the form layout based on feedback (see USER_INTERVIEWS.md)

**What I learned:**
- Users don't think in "seats" — they think in "users" or "people". Changed the label.
- The expanded/collapsed tool design is better than one giant form — reduces overwhelm

**Blockers / what I'm stuck on:**
- PocketBase admin token expires after 1 hour — added token caching with expiry check in `src/lib/pocketbase.ts`

**Plan for tomorrow:**
- Build the full results page with all components
- Add the AI summary integration

---

## Day 4 — YYYY-MM-DD

**Hours worked:** 8

**What I did:**
- Built the complete AuditResultClient component
- SavingsHero with conditional states (optimal vs major savings)
- RecommendationCard with expandable reasoning
- Added sessionStorage + localStorage caching for instant result load across tabs
- Integrated Anthropic API for AI summary with fallback
- Worked on the visual design — this is the page that gets shared

**What I learned:**
- `sessionStorage` is tab-scoped — email links open a new tab and sessionStorage is empty. Fixed by also writing to `localStorage` which persists across tabs on the same device
- The fallback summary needs to be genuinely good, not just a placeholder

**Blockers / what I'm stuck on:**
- OG tag preview on Twitter sometimes takes 24h to refresh cache — use Card Validator to test

**Plan for tomorrow:**
- Lead capture + email integration (Resend)
- Shareable URL with OG tags
- CI/CD setup

---

## Day 5 — YYYY-MM-DD

**Hours worked:** 6

**What I did:**
- Built `/api/submit-lead` route with Resend email integration
- Fixed email link bug — was using `NEXT_PUBLIC_APP_URL` (localhost) instead of request origin, so email links were pointing to localhost. Fixed by reading `req.headers.get("origin")` directly
- LeadCaptureForm component with email + optional fields
- OG metadata in the result page's `generateMetadata`
- Set up GitHub Actions CI workflow
- Deployed to Vercel + PocketBase to Railway — verified live URL works

**What I learned:**
- Always build email links from the request `origin` header, not from env vars — env vars may point to localhost during development
- Railway needs a persistent volume mounted at `/pb/pb_data` or PocketBase data resets on redeploy

**Blockers / what I'm stuck on:**
- Vercel build failing on `next/font` — `Geist` font only available in Next.js 15+. Fixed by switching to `Inter` + `JetBrains_Mono` which are available in Next.js 14

**Plan for tomorrow:**
- All entrepreneurial files (GTM, ECONOMICS, etc.)
- Final UI polish pass

---

## Day 6 — YYYY-MM-DD

**Hours worked:** 7

**What I did:**
- Wrote GTM.md — specific channels, not generic ones
- Wrote ECONOMICS.md with full unit economics model
- Wrote LANDING_COPY.md — treated like a real copywriter would
- Wrote METRICS.md — chose "audits with email captured" as North Star
- Did final accessibility audit — Lighthouse accessibility: 94

**What I learned:**
- The unit economics math is actually compelling — a single Credex credit sale pays back the tool CAC many times over
- "Specific" beats "comprehensive" in GTM planning — 3 very specific channels > 10 generic ones

**Blockers / what I'm stuck on:**
- Nothing blocking

**Plan for tomorrow:**
- REFLECTION.md
- Final code review
- Verify CI is green, all 5 tests pass, deployed URL works

---

## Day 7 — YYYY-MM-DD

**Hours worked:** 4

**What I did:**
- Wrote REFLECTION.md — honest answers, not polished ones
- Final code cleanup and review
- Verified all 6 MVP features work end-to-end
- Ran Lighthouse: Performance 91, Accessibility 94, Best Practices 96
- Confirmed CI green on latest commit
- Submitted

**What I learned:**
- The discipline of shipping > the discipline of perfecting. Several "nice to have" polish items stayed on the cutting room floor — the product works and the docs are strong.

**Blockers / what I'm stuck on:**
- N/A — submitted

**Plan for tomorrow:**
- N/A