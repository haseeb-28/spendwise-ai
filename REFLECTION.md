# Reflection

## 1. The hardest bug I hit this week

The toughest bug was the result page showing a blank screen when opened from the email link. After submitting the audit and entering my email, I clicked "View Full Report" in the inbox — the page just spun forever and never loaded.

My first hypothesis was a timing issue with the useEffect — maybe the component was checking storage before it was ready. I added a `console.log` inside the effect and confirmed it was running, but `sessionStorage.getItem()` was returning `null`. That's when I realized the problem: `sessionStorage` is scoped to a single browser tab. The email link opens a new tab — completely empty sessionStorage.

Second hypothesis: the PocketBase fetch would save it. I checked the PocketBase admin dashboard on Railway and the audit record was there. But the server-side fetch in `result/[id]/page.tsx` was also failing — PocketBase admin token authentication was throwing an error because the env vars weren't being picked up correctly on Vercel.

So two separate failures compounded into one blank page. I fixed both: (1) switched from `sessionStorage` only to writing to both `sessionStorage` AND `localStorage` in `AuditForm.tsx` — `localStorage` persists across tabs on the same device, so email links work instantly. (2) fixed the PocketBase token caching logic to handle auth failures gracefully. Lesson: always test the email link flow from a fresh incognito window before calling a feature done.

---

## 2. A decision I reversed mid-week

Initially planned to run the audit engine entirely client-side in the browser — no API call, instant results, no backend needed for the core feature. This seemed elegant: pure TypeScript, runs locally, no latency.

Reversed this on Day 3 after the first user interview, where the person asked "can I share this with my co-founder?" That question made the shareable URL requirement real. Client-side-only execution can't generate a stable shareable URL — each result only exists in that user's browser memory.

The reversal added ~4 hours of work: building the `/api/audit` route, PocketBase persistence, and the `share_token` generation. But it unlocked the viral loop that's the whole point of the product. A tool that shows you $400/month in savings that you can't forward to your CFO is half a product. Worth the trade-off.

---

## 3. What I would build in week 2

**1. Benchmark mode** (2 days): "Your AI spend per developer is $X — companies your size average $Y." The data is already in PocketBase from every audit — just needs aggregation and a comparison UI. This is the feature most likely to drive sharing: nobody can resist seeing how they compare to peers.

**2. Embeddable widget** (1 day): A `<script>` tag that opens the audit flow in a modal. Any blog post about AI costs could embed it. Distribution multiplier that compounds over time without ongoing effort.

**3. PDF export** (0.5 days): One-page branded PDF of the audit. Useful for sharing with CFOs or including in board decks. Puppeteer on Vercel serverless functions handles this well.

**4. Recurring alerts** (2 days): "Check back in 30 days" opt-in. Send an email when AI tool pricing changes that affects the user's stack. Turns a one-shot tool into an ongoing relationship with the lead.

---

## 4. How I used AI tools

Used Claude (Sonnet via claude.ai) and Cursor throughout the week.

**Where I used AI heavily:**
- Generating boilerplate: PocketBase client setup, Resend email HTML template, Jest config, GitHub Actions workflow
- Writing the email HTML — tedious, highly templated, AI handles it perfectly
- First drafts of audit reasoning text — then edited each one to be more specific and financially defensible
- Debugging TypeScript type errors in complex discriminated union types
- Writing the entrepreneurial files (GTM, ECONOMICS) as first drafts, then heavily revised with real numbers

**Where I didn't trust AI:**
- The audit engine evaluator logic. Every savings calculation had to be verifiable by hand. LLMs are confidently wrong about specific pricing numbers — I wrote all evaluators manually and verified each number against vendor pricing pages.
- The ECONOMICS.md conversion rate math. AI suggested plausible-sounding but ungrounded numbers. I built the spreadsheet logic from first principles.

**One specific time AI was wrong:**
Asked Claude to fill in GitHub Copilot Enterprise features. It said Enterprise included "unlimited GPT-4 access via GitHub.com" — that's a ChatGPT Enterprise feature, not Copilot Enterprise. The actual Enterprise Copilot feature is fine-tuned models on your private codebase. Caught it by checking GitHub's official pricing page directly. Rule: never trust AI for specific product feature claims without cross-referencing the vendor's own documentation.

---

## 5. Self-ratings

| Dimension | Rating | Reason |
|-----------|--------|--------|
| Discipline | 8/10 | Worked all 7 days; Day 5 was shorter due to debugging the email link bug, but still shipped the fix |
| Code quality | 7/10 | TypeScript strict mode throughout, clean abstractions in `pocketbase.ts`; result page component is too large and would be split into smaller files with more time |
| Design sense | 7/10 | Results page is genuinely polished and screenshot-worthy; audit form is functional but dense |
| Problem-solving | 8/10 | The localStorage + sessionStorage dual-write pattern for cross-tab result loading was a non-obvious solution that actually works cleanly |
| Entrepreneurial thinking | 8/10 | GTM has specific weird channels with real reasoning; unit economics math is honest including the pessimistic scenario |