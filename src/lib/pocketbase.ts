// PocketBase client for server-side API routes
// Uses the PocketBase REST API directly (no SDK needed server-side)

const PB_URL = process.env.POCKETBASE_URL ?? "http://127.0.0.1:8090";
const PB_EMAIL = process.env.POCKETBASE_ADMIN_EMAIL ?? "";
const PB_PASSWORD = process.env.POCKETBASE_ADMIN_PASSWORD ?? "";

let adminToken: string | null = null;
let tokenExpiry: number = 0;

// Authenticate as admin and cache the token
async function getAdminToken(): Promise<string> {
  if (adminToken && Date.now() < tokenExpiry) return adminToken;

  const res = await fetch(`${PB_URL}/api/admins/auth-with-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identity: PB_EMAIL, password: PB_PASSWORD }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`PocketBase auth failed: ${err}`);
  }

  const data = await res.json();
  adminToken = data.token;
  tokenExpiry = Date.now() + 60 * 60 * 1000; // 1 hour
  return adminToken!;
}

async function pbFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getAdminToken();
  return fetch(`${PB_URL}/api/collections${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
      ...(options.headers ?? {}),
    },
  });
}

// ─── Audits ────────────────────────────────────────────────────────────────

export async function createAudit(data: {
  audit_id: string;
  form_data: object;
  recommendations: object;
  total_monthly_spend: number;
  total_projected_spend: number;
  total_monthly_savings: number;
  total_annual_savings: number;
  overall_assessment: string;
  ai_summary?: string;
  share_token: string;
}) {
  const res = await pbFetch("/audits/records", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to create audit: ${await res.text()}`);
  return res.json();
}

export async function getAuditById(id: string) {
  // Search by audit_id or share_token
  const res = await pbFetch(
    `/audits/records?filter=(audit_id="${id}"||share_token="${id}")&perPage=1`
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.items?.[0] ?? null;
}

export async function updateAuditSummary(recordId: string, aiSummary: string) {
  const res = await pbFetch(`/audits/records/${recordId}`, {
    method: "PATCH",
    body: JSON.stringify({ ai_summary: aiSummary }),
  });
  if (!res.ok) throw new Error(`Failed to update audit summary`);
  return res.json();
}

// ─── Leads ────────────────────────────────────────────────────────────────

export async function upsertLead(data: {
  email: string;
  company_name?: string;
  role?: string;
  team_size?: number;
  audit_id: string;
  total_monthly_savings: number;
  high_savings: boolean;
}) {
  // Check if lead already exists
  const checkRes = await pbFetch(
    `/leads/records?filter=(email="${data.email}")&perPage=1`
  );
  const existing = checkRes.ok ? await checkRes.json() : null;

  if (existing?.items?.[0]) {
    // Update existing
    const res = await pbFetch(`/leads/records/${existing.items[0].id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update lead");
    return res.json();
  }

  // Create new
  const res = await pbFetch("/leads/records", {
    method: "POST",
    body: JSON.stringify({ ...data, email_sent: false }),
  });
  if (!res.ok) throw new Error(`Failed to create lead: ${await res.text()}`);
  return res.json();
}

export async function markEmailSent(email: string) {
  const checkRes = await pbFetch(
    `/leads/records?filter=(email="${email}")&perPage=1`
  );
  if (!checkRes.ok) return;
  const data = await checkRes.json();
  const record = data.items?.[0];
  if (!record) return;

  await pbFetch(`/leads/records/${record.id}`, {
    method: "PATCH",
    body: JSON.stringify({ email_sent: true }),
  });
}

// ─── Rate limiting ─────────────────────────────────────────────────────────

export async function checkRateLimit(ip: string): Promise<boolean> {
  try {
    const windowStart = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const res = await pbFetch(
      `/rate_limits/records?filter=(ip="${ip}")&perPage=1`
    );
    if (!res.ok) return true; // fail open

    const data = await res.json();
    const record = data.items?.[0];

    if (!record || record.window_start < windowStart) {
      // No record or stale window — create/reset
      if (record) {
        await pbFetch(`/rate_limits/records/${record.id}`, {
          method: "PATCH",
          body: JSON.stringify({ count: 1, window_start: new Date().toISOString() }),
        });
      } else {
        await pbFetch("/rate_limits/records", {
          method: "POST",
          body: JSON.stringify({ ip, count: 1, window_start: new Date().toISOString() }),
        });
      }
      return true;
    }

    if (record.count >= 10) return false;

    await pbFetch(`/rate_limits/records/${record.id}`, {
      method: "PATCH",
      body: JSON.stringify({ count: record.count + 1 }),
    });

    return true;
  } catch {
    return true; // fail open
  }
}
