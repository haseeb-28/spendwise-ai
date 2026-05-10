# Tests

All automated tests for SpendWise. Run with `npm test`.

---

## Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm test -- --watch
```

---

## Test Files

### `src/__tests__/audit-engine.test.ts`

**How to run:** `npm test`

**What it covers:**

| Test | Description |
|------|-------------|
| Cursor Business → Pro downgrade (< 5 seats) | Verifies Business plan is flagged for small teams, projected spend = seats × $20 |
| Cursor Pro optimal | Verifies correctly-priced Pro plan returns no savings |
| Copilot Business → Individual (< 5 seats) | Verifies downgrade recommendation with correct savings math |
| Copilot cancel for non-coding use case | Verifies writing/research teams get cancellation recommendation |
| Claude Team → Pro for single user | Verifies $5/mo savings identified, projected spend = $20 |
| Claude Max → Pro (likely overkill) | Verifies $80/mo savings, $960/yr annual savings calculated correctly |
| ChatGPT Plus cancel when Claude Pro active | Verifies redundant subscription detection, reasoning mentions overlap |
| Anthropic API high spend → Credex flag | Verifies credexOpportunity = true for spend > $200 |
| Anthropic API low spend → optimal | Verifies no Credex flag for spend < $50 |
| Windsurf cancel when Cursor active | Verifies redundant IDE detection |
| Overall assessment major_savings threshold | Verifies assessment label set correctly for high savings rate |
| Overall assessment optimal | Verifies well-sized stack returns optimal |
| Annual savings = monthly × 12 | Verifies math consistency across all recommendations |

---

## Test Philosophy

**Why test the audit engine specifically?**

The audit engine is the core of the product — it produces financial recommendations that users act on. A bug here means wrong savings numbers, wrong tool recommendations, or missed savings opportunities. Every evaluator function has at least one positive test (savings found) and one negative test (optimal — no change).

**Why no UI tests?**

With a 7-day timeline, the test budget was spent on the highest-risk code: the audit math. The UI is visually verified. Integration tests for the API routes would require a running PocketBase instance, which adds CI complexity without catching bugs the unit tests don't already catch.

**What would be added in week 2:**

1. Integration tests for `/api/audit` route (mocked PocketBase)
2. Integration tests for `/api/submit-lead` route (mocked Resend)
3. Snapshot tests for the audit engine output format
4. E2E tests with Playwright for the full form → result flow
