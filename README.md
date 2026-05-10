# SpendWise — AI Spend Audit for Startups

SpendWise is a free web app that audits your AI tool spend (Cursor, GitHub Copilot, Claude, ChatGPT, and more) and tells you exactly where you're overpaying, what to switch, and how much you'll save. Built for startup founders and engineering managers who pay AI bills without a second opinion.

**Live URL:** https://your-deployment-url.vercel.app

---

## Screenshots

> _Add 3+ screenshots or a Loom link here before submission_

---

## Quick Start

### Prerequisites
- Node.js 18+
- A PocketBase instance (self-hosted or deployed on Railway — free)
- A Resend account (free tier works)
- An Anthropic API key

### Install & Run Locally

```bash
git clone https://github.com/yourusername/spendwise-ai
cd spendwise-ai
npm install
cp .env.local.example .env.local
# Fill in your env vars (see below)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

```
POCKETBASE_URL=             # http://127.0.0.1:8090 locally, Railway URL in production
POCKETBASE_ADMIN_EMAIL=     # Your PocketBase admin email
POCKETBASE_ADMIN_PASSWORD=  # Your PocketBase admin password
ANTHROPIC_API_KEY=          # From console.anthropic.com
RESEND_API_KEY=             # From resend.com
RESEND_FROM_EMAIL=          # onboarding@resend.dev (testing) or your verified domain
NEXT_PUBLIC_APP_URL=        # Your deployed Vercel URL
```

### Database Setup

1. Download PocketBase from **pocketbase.io** and run it:
   ```bash
   ./pocketbase serve
   ```
2. Open **http://127.0.0.1:8090/_/** and create your admin account
3. Create these 3 collections manually in the PocketBase UI:

**`audits` collection** (Base type):

| Field | Type | Required |
|---|---|---|
| audit_id | Text | Yes |
| form_data | JSON | Yes |
| recommendations | JSON | Yes |
| total_monthly_spend | Number | Yes |
| total_projected_spend | Number | Yes |
| total_monthly_savings | Number | Yes |
| total_annual_savings | Number | Yes |
| overall_assessment | Text | Yes |
| ai_summary | Text | No |
| share_token | Text | Yes (Unique) |

**`leads` collection** (Base type):

| Field | Type | Required |
|---|---|---|
| email | Email | Yes |
| company_name | Text | No |
| role | Text | No |
| team_size | Number | No |
| audit_id | Text | No |
| total_monthly_savings | Number | No |
| high_savings | Bool | No |
| email_sent | Bool | No |

**`rate_limits` collection** (Base type):

| Field | Type | Required |
|---|---|---|
| ip | Text | Yes |
| count | Number | Yes |
| window_start | Date | Yes |

4. For each collection go to **API Rules → unlock all rules** (set to empty/unlocked)

### Deploy PocketBase to Railway

Create a separate GitHub repo with this `Dockerfile`:

```dockerfile
FROM alpine:latest
ARG PB_VERSION=0.22.20
RUN apk add --no-cache unzip ca-certificates wget
RUN wget https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip \
    -O /tmp/pb.zip && unzip /tmp/pb.zip -d /pb/ && rm /tmp/pb.zip
RUN chmod +x /pb/pocketbase
EXPOSE 8090
VOLUME /pb/pb_data
CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8090", "--dir=/pb/pb_data"]
```

Push to GitHub → deploy on **railway.app** → generate a domain → recreate collections there.

### Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
# Add all 7 env vars in Vercel dashboard → Redeploy
```

### Run Tests

```bash
npm test
npm run test:coverage
```

---

## Decisions (5 trade-offs)

**1. Next.js App Router over plain React SPA**
Chose Next.js for SSR on result pages — critical for Open Graph tags, which require server-rendered metadata so share links render previews on Twitter/Slack. The audit form is purely client-side; only the result page needs SSR. Trade-off: more complex deploy, but Vercel removes all friction with zero-config Next.js support.

**2. Hardcoded audit engine over AI-generated recommendations**
The audit logic is deterministic rule-based TypeScript, not a prompt. This was intentional: a finance person needs to audit the reasoning, and LLM outputs aren't consistent enough for defensible financial recommendations. AI is only used for the 90–120 word summary paragraph — a well-scoped use of non-determinism where consistency matters less than quality of prose.

**3. PocketBase over Supabase or Neon**
PocketBase is a single binary with a built-in admin UI, REST API, and zero vendor lock-in. Supabase and Neon are excellent but add third-party dependencies and account requirements. PocketBase runs locally with one command and deploys on Railway with a Dockerfile — no signup, no dashboard, full control. Trade-off: requires managing a separate server process rather than a managed service.

**4. Resend over SendGrid/SES**
Resend has a developer-first API that takes under 10 minutes to set up with a generous free tier (3,000 emails/month). SES has better long-term cost efficiency but requires domain verification, IAM roles, and sandbox approval — too much friction for a 7-day build. Trade-off: slightly higher cost at scale, but dramatically faster to ship.

**5. localStorage + sessionStorage for result hydration**
Audit results are saved to both `sessionStorage` and `localStorage` after running. `sessionStorage` gives instant same-tab loads; `localStorage` means the result page loads even when opened in a new tab (e.g. from an email link) on the same device. The database is only hit for shared URLs opened on a different device. Trade-off: stale data if the audit engine logic changes, but irrelevant at this scale.