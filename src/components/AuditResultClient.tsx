"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  TrendingDown,
  ArrowRight,
  Share2,
  Check,
  ExternalLink,
  Loader2,
  Mail,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn, formatCurrency, getActionColor, getActionLabel } from "@/lib/utils";
import type { AuditResult, ToolRecommendation } from "@/types";

interface Props {
  auditId: string;
  initialResult: AuditResult | null;
}

// ── Hero ───────────────────────────────────────────────────────────────────────
function SavingsHero({ result }: { result: AuditResult }) {
  const isOptimal = result.totalMonthlySavings <= 0;
  const isMajor = result.totalMonthlySavings >= 500;

  return (
    <div className={cn(
      "rounded-2xl p-8 sm:p-10 text-center mb-8",
      isOptimal
        ? "bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200"
        : isMajor
          ? "bg-gradient-to-br from-red-50 to-orange-50 border border-red-200"
          : "bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200"
    )}>
      {isOptimal ? (
        <>
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
          <h1 className="text-2xl sm:text-3xl font-bold text-emerald-900 mb-2">
            You&apos;re spending well
          </h1>
          <p className="text-emerald-700 max-w-md mx-auto">
            Your current AI stack of {formatCurrency(result.totalMonthlySpend)}/month is well-optimized.
            No major mismatches found.
          </p>
        </>
      ) : (
        <>
          <AlertTriangle className={cn("w-12 h-12 mx-auto mb-4", isMajor ? "text-red-500" : "text-orange-500")} />
          <p className="text-sm font-semibold uppercase tracking-widest text-slate-500 mb-2">
            Potential monthly savings
          </p>
          <div className={cn("text-5xl sm:text-6xl font-bold mb-1", isMajor ? "text-red-600" : "text-orange-600")}>
            {formatCurrency(result.totalMonthlySavings)}
          </div>
          <p className="text-slate-600 text-lg mb-2">
            {formatCurrency(result.totalAnnualSavings)} per year
          </p>
          <p className="text-slate-500 text-sm">
            On {formatCurrency(result.totalMonthlySpend)}/month current spend
          </p>
        </>
      )}
    </div>
  );
}

// ── Recommendation card ────────────────────────────────────────────────────────
function RecommendationCard({ rec }: { rec: ToolRecommendation }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={cn(
      "bg-white rounded-xl border overflow-hidden",
      rec.monthlySavings > 0 ? "border-orange-200" : "border-slate-200"
    )}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="font-semibold text-slate-900">{rec.toolLabel}</h3>
            <p className="text-sm text-slate-500">{rec.currentPlan}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-slate-500 text-sm line-through">{formatCurrency(rec.currentSpend)}/mo</div>
            {rec.monthlySavings > 0 && (
              <div className="text-emerald-600 font-bold text-lg">
                -{formatCurrency(rec.monthlySavings)}/mo
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className={cn(
            "inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border",
            getActionColor(rec.recommendedAction)
          )}>
            {getActionLabel(rec.recommendedAction)}
          </span>
          {rec.recommendedPlan && (
            <span className="text-xs text-slate-500">→ {rec.recommendedPlan}</span>
          )}
          {rec.recommendedTool && (
            <span className="text-xs text-slate-500">→ {rec.recommendedTool}</span>
          )}
        </div>

        <div>
          <p className={cn("text-sm text-slate-600 leading-relaxed", !expanded && "line-clamp-2")}>
            {rec.reasoning}
          </p>
          {rec.reasoning.length > 120 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs text-teal-600 mt-1 hover:text-teal-700"
            >
              {expanded ? <><span>Less</span><ChevronUp className="w-3 h-3" /></> : <><span>Full reasoning</span><ChevronDown className="w-3 h-3" /></>}
            </button>
          )}
        </div>

        {rec.monthlySavings > 0 && (
          <div className="mt-3 flex items-center justify-between bg-emerald-50 rounded-lg px-3 py-2">
            <span className="text-xs text-emerald-700 font-medium">Projected after change</span>
            <span className="text-sm font-bold text-emerald-700">{formatCurrency(rec.projectedSpend)}/mo</span>
          </div>
        )}

        {rec.credexOpportunity && (
          <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <p className="text-xs text-amber-700">Credex can provide discounted credits for this — see below</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Lead capture ───────────────────────────────────────────────────────────────
function LeadCaptureForm({ auditId, totalMonthlySavings, highSavings }: {
  auditId: string;
  totalMonthlySavings: number;
  highSavings: boolean;
}) {
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch("/api/submit-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email, companyName, role, auditId, totalMonthlySavings, _hp: "",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to submit");
      setSubmitted(true);
      toast.success("Report sent! Check your inbox.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
        <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
        <h3 className="font-semibold text-emerald-900 mb-1">Report sent!</h3>
        <p className="text-sm text-emerald-700">
          Check your inbox for the full audit report.
          {highSavings && " Our team will also reach out about Credex credits."}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6">
      <div className="flex items-start gap-3 mb-4">
        <Mail className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-slate-900">Get your report by email</h3>
          <p className="text-sm text-slate-500">
            {highSavings
              ? "We'll also have a Credex specialist reach out about capturing these savings."
              : "Save a copy and get notified when new optimizations apply to your stack."}
          </p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input type="text" name="_hp" className="hidden" tabIndex={-1} autoComplete="off" />
        <input
          type="email" required placeholder="you@company.com"
          value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text" placeholder="Company (optional)"
            value={companyName} onChange={(e) => setCompanyName(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
          />
          <input
            type="text" placeholder="Role (optional)"
            value={role} onChange={(e) => setRole(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
          />
        </div>
        <button
          type="submit" disabled={loading || !email}
          className={cn(
            "w-full flex items-center justify-center gap-2 font-medium py-2.5 rounded-lg transition-all text-sm",
            email && !loading ? "bg-teal-600 hover:bg-teal-500 text-white" : "bg-slate-200 text-slate-400 cursor-not-allowed"
          )}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Mail className="w-4 h-4" />Email me the report</>}
        </button>
      </form>
      <p className="text-xs text-slate-400 mt-2 text-center">No spam. Unsubscribe anytime.</p>
    </div>
  );
}

// ── Credex CTA ────────────────────────────────────────────────────────────────
function CredexCTA({ monthlySavings }: { monthlySavings: number }) {
  return (
    <div className="bg-gradient-to-br from-slate-900 to-teal-900 rounded-xl p-6 text-white">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <TrendingDown className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="font-semibold">Capture more with Credex</h3>
          <p className="text-sm text-slate-300 mt-1">
            Credex sources discounted AI credits at 20–30% below retail. On{" "}
            {formatCurrency(monthlySavings)}/mo in savings, credits could save another{" "}
            {formatCurrency(Math.round(monthlySavings * 0.25))}/mo.
          </p>
        </div>
      </div>
      <a
        href="https://credex.rocks" target="_blank" rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
      >
        Learn about Credex <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function AuditResultClient({ auditId, initialResult }: Props) {
  const [result, setResult] = useState<AuditResult | null>(initialResult);
  const [aiSummary, setAiSummary] = useState<string>("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // Load from sessionStorage or localStorage if no server result
  useEffect(() => {
    if (!result) {
      try {
        // Check sessionStorage first, then localStorage (persists across tabs)
        const stored =
          sessionStorage.getItem(`audit_${auditId}`) ??
          localStorage.getItem(`audit_${auditId}`);
        if (stored) {
          setResult(JSON.parse(stored));
          return;
        }
      } catch { }
      // Still no result after 3s → show not-found
      const timer = setTimeout(() => setNotFound(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [auditId, result]);

  // Generate AI summary
  useEffect(() => {
    if (result && !result.aiSummary && !aiSummary) {
      setSummaryLoading(true);
      fetch("/api/generate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result),
      })
        .then((r) => r.json())
        .then((data) => { if (data.summary) setAiSummary(data.summary); })
        .catch(() => { })
        .finally(() => setSummaryLoading(false));
    } else if (result?.aiSummary) {
      setAiSummary(result.aiSummary);
    }
  }, [result, aiSummary]);

  function copyShareLink() {
    const url = `${window.location.origin}/result/${auditId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // ── Not found / loading state ──
  if (!result) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center px-4 max-w-sm">
          {notFound ? (
            <>
              <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-7 h-7 text-orange-500" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                Audit not accessible
              </h2>
              <p className="text-slate-500 text-sm mb-1 leading-relaxed">
                This link works only while your <strong>local server is running</strong> in the same browser session.
              </p>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                To share audit links that work for anyone, deploy your app to <strong>Vercel</strong> first, then re-run the audit there.
              </p>
              <Link
                href="/audit"
                className="inline-flex items-center gap-2 bg-teal-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-teal-500 transition-colors"
              >
                Run a new audit <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          ) : (
            <>
              <Loader2 className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-3" />
              <p className="text-slate-600 text-sm">Loading your audit…</p>
            </>
          )}
        </div>
      </div>
    );
  }

  const highSavings = result.totalMonthlySavings >= 500;
  const hasCredexOpportunity = result.recommendations.some((r) => r.credexOpportunity);
  const sortedRecs = [...result.recommendations].sort((a, b) => b.monthlySavings - a.monthlySavings);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-teal-600 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-slate-900">SpendWise</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={copyShareLink}
              className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-lg transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
              {copied ? "Copied!" : "Share"}
            </button>
            <Link href="/audit" className="text-sm text-teal-600 hover:text-teal-700 font-medium border border-teal-200 hover:border-teal-300 px-3 py-1.5 rounded-lg transition-colors">
              New audit
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Hero */}
        <SavingsHero result={result} />

        {/* AI Summary */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">AI Analysis</span>
            <span className="text-xs bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded">Powered by Claude</span>
          </div>
          {summaryLoading ? (
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating personalized analysis…
            </div>
          ) : aiSummary ? (
            <p className="text-slate-700 leading-relaxed text-sm">{aiSummary}</p>
          ) : (
            <p className="text-slate-400 text-sm italic">Analysis not available.</p>
          )}
        </div>

        {/* Spend summary */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Current spend", value: formatCurrency(result.totalMonthlySpend) + "/mo", color: "text-slate-900" },
            { label: "Projected spend", value: formatCurrency(result.totalProjectedSpend) + "/mo", color: "text-emerald-600" },
            { label: "Annual savings", value: formatCurrency(result.totalAnnualSavings), color: result.totalAnnualSavings > 0 ? "text-teal-700" : "text-slate-500" },
          ].map((item) => (
            <div key={item.label} className="bg-white border border-slate-200 rounded-xl p-4 text-center">
              <div className="text-xs text-slate-500 mb-1">{item.label}</div>
              <div className={cn("text-lg font-bold", item.color)}>{item.value}</div>
            </div>
          ))}
        </div>

        {/* Per-tool recommendations */}
        <div>
          <h2 className="font-semibold text-slate-900 mb-3">Per-tool breakdown</h2>
          <div className="space-y-3">
            {sortedRecs.map((rec) => (
              <RecommendationCard key={rec.tool} rec={rec} />
            ))}
          </div>
        </div>

        {/* Credex CTA */}
        {(highSavings || hasCredexOpportunity) && (
          <CredexCTA monthlySavings={result.totalMonthlySavings} />
        )}

        {/* Lead capture */}
        <LeadCaptureForm
          auditId={auditId}
          totalMonthlySavings={result.totalMonthlySavings}
          highSavings={highSavings}
        />

        {/* Run another */}
        <div className="text-center pb-8">
          <Link href="/audit" className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium text-sm">
            Run another audit <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    </div>
  );
}
