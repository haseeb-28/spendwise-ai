"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Plus, Loader2, ArrowRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { TOOLS } from "@/lib/pricing-data";
import type { AuditFormData, ToolInput, UseCase } from "@/types";

const STORAGE_KEY = "spendwise_form_v1";

const DEFAULT_TOOLS: ToolInput[] = TOOLS.map((t) => ({
  tool: t.id,
  plan: t.plans[0].planId,
  monthlySpend: 0,
  seats: 1,
  enabled: false,
}));

const USE_CASES: { value: UseCase; label: string; description: string }[] = [
  { value: "coding", label: "Coding", description: "Building software, debugging, code review" },
  { value: "writing", label: "Writing", description: "Content, docs, emails, copy" },
  { value: "data", label: "Data", description: "Analysis, reports, spreadsheets" },
  { value: "research", label: "Research", description: "Market research, synthesis, summaries" },
  { value: "mixed", label: "Mixed", description: "Combination of the above" },
];

export default function AuditForm() {
  const router = useRouter();
  const [tools, setTools] = useState<ToolInput[]>(DEFAULT_TOOLS);
  const [teamSize, setTeamSize] = useState(5);
  const [useCase, setUseCase] = useState<UseCase>("mixed");
  const [loading, setLoading] = useState(false);
  const [expandedTools, setExpandedTools] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.tools) setTools(parsed.tools);
        if (parsed.teamSize) setTeamSize(parsed.teamSize);
        if (parsed.useCase) setUseCase(parsed.useCase);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ tools, teamSize, useCase }));
    } catch {}
  }, [tools, teamSize, useCase]);

  const enabledCount = tools.filter((t) => t.enabled).length;
  const totalSpend = tools.filter((t) => t.enabled).reduce((sum, t) => sum + (t.monthlySpend || 0), 0);

  function toggleTool(toolId: string) {
    setTools((prev) =>
      prev.map((t) => (t.tool === toolId ? { ...t, enabled: !t.enabled } : t))
    );
    setExpandedTools((prev) => {
      const next = new Set(prev);
      const tool = tools.find((t) => t.tool === toolId);
      if (!tool?.enabled) { next.add(toolId); } else { next.delete(toolId); }
      return next;
    });
  }

  function updateTool(toolId: string, updates: Partial<ToolInput>) {
    setTools((prev) => prev.map((t) => (t.tool === toolId ? { ...t, ...updates } : t)));
  }

  function toggleExpand(toolId: string) {
    setExpandedTools((prev) => {
      const next = new Set(prev);
      if (next.has(toolId)) { next.delete(toolId); } else { next.add(toolId); }
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const enabledTools = tools.filter((t) => t.enabled);
    if (enabledTools.length === 0) { toast.error("Please add at least one AI tool"); return; }
    const hasSpend = enabledTools.some((t) => t.monthlySpend > 0);
    if (!hasSpend) { toast.error("Please enter monthly spend for at least one tool"); return; }

    setLoading(true);
    try {
      const formData: AuditFormData = { tools: enabledTools, teamSize, useCase };
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, _hp: "" }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error ?? "Audit failed"); }
      const result = await res.json();
      const resultJson = JSON.stringify(result);
      try { sessionStorage.setItem(`audit_${result.id}`, resultJson); } catch {}
      try { localStorage.setItem(`audit_${result.id}`, resultJson); } catch {}
      router.push(`/result/${result.id}`);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" aria-label="AI spend audit form">
      {/* Honeypot */}
      <input type="text" name="_hp" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />

      {/* Team context */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Your team</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="team-size" className="block text-sm font-medium text-slate-700 mb-1.5">
              Team size (people)
            </label>
            <input
              id="team-size"
              type="number" min="1" max="100000"
              value={teamSize}
              onChange={(e) => setTeamSize(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label htmlFor="use-case" className="block text-sm font-medium text-slate-700 mb-1.5">
              Primary use case
            </label>
            <select
              id="use-case"
              value={useCase}
              onChange={(e) => setUseCase(e.target.value as UseCase)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none bg-white"
            >
              {USE_CASES.map((uc) => (
                <option key={uc.value} value={uc.value}>
                  {uc.label} — {uc.description}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tools */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">AI tools</h2>
          <span className="text-sm text-slate-500" aria-live="polite">
            {enabledCount} selected · <span className="font-medium text-teal-700">${Math.round(totalSpend)}/mo</span>
          </span>
        </div>

        <div className="divide-y divide-slate-100" role="list">
          {TOOLS.map((toolDef) => {
            const toolInput = tools.find((t) => t.tool === toolDef.id)!;
            const isEnabled = toolInput.enabled;
            const isExpanded = expandedTools.has(toolDef.id);
            const selectedPlan = toolDef.plans.find((p) => p.planId === toolInput.plan);
            const checkboxId = `tool-${toolDef.id}`;

            return (
              <div
                key={toolDef.id}
                role="listitem"
                className={cn("transition-colors", isEnabled ? "bg-teal-50/30" : "bg-white")}
              >
                <div className="flex items-center gap-3 px-6 py-4">
                  {/* Accessible checkbox */}
                  <input
                    type="checkbox"
                    id={checkboxId}
                    checked={isEnabled}
                    onChange={() => toggleTool(toolDef.id)}
                    className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                  />

                  <label htmlFor={checkboxId} className="flex-1 min-w-0 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <span className={cn("font-medium text-sm", isEnabled ? "text-slate-900" : "text-slate-600")}>
                        {toolDef.label}
                      </span>
                      <span className="text-xs text-slate-400">{toolDef.vendor}</span>
                      {isEnabled && toolInput.monthlySpend > 0 && (
                        <span className="text-xs bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded font-medium">
                          ${Math.round(toolInput.monthlySpend)}/mo
                        </span>
                      )}
                    </div>
                    {isEnabled && selectedPlan && (
                      <p className="text-xs text-slate-500 mt-0.5">{selectedPlan.label}</p>
                    )}
                  </label>

                  {isEnabled && (
                    <button
                      type="button"
                      onClick={() => toggleExpand(toolDef.id)}
                      aria-label={isExpanded ? `Collapse ${toolDef.label} settings` : `Expand ${toolDef.label} settings`}
                      aria-expanded={isExpanded}
                      className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      {isExpanded
                        ? <ChevronUp className="w-4 h-4" aria-hidden="true" />
                        : <ChevronDown className="w-4 h-4" aria-hidden="true" />}
                    </button>
                  )}
                </div>

                {/* Expanded tool details */}
                {isEnabled && isExpanded && (
                  <div className="px-6 pb-4">
                    <div className="grid sm:grid-cols-3 gap-3 ml-7">
                      <div>
                        <label htmlFor={`${toolDef.id}-plan`} className="block text-xs font-medium text-slate-600 mb-1">
                          Plan
                        </label>
                        <select
                          id={`${toolDef.id}-plan`}
                          value={toolInput.plan}
                          onChange={(e) => updateTool(toolDef.id, { plan: e.target.value })}
                          className="w-full border border-slate-300 rounded-lg px-2.5 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none bg-white"
                        >
                          {toolDef.plans.map((p) => (
                            <option key={p.planId} value={p.planId}>{p.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor={`${toolDef.id}-spend`} className="block text-xs font-medium text-slate-600 mb-1">
                          Monthly spend ($)
                        </label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" aria-hidden="true">$</span>
                          <input
                            id={`${toolDef.id}-spend`}
                            type="number" min="0" max="100000" step="1"
                            value={toolInput.monthlySpend || ""}
                            placeholder="0"
                            onChange={(e) => updateTool(toolDef.id, { monthlySpend: parseFloat(e.target.value) || 0 })}
                            className="w-full border border-slate-300 rounded-lg pl-7 pr-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                            aria-label={`Monthly spend for ${toolDef.label} in dollars`}
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor={`${toolDef.id}-seats`} className="block text-xs font-medium text-slate-600 mb-1">
                          Users / seats
                        </label>
                        <input
                          id={`${toolDef.id}-seats`}
                          type="number" min="1" max="10000"
                          value={toolInput.seats || ""}
                          placeholder="1"
                          onChange={(e) => updateTool(toolDef.id, { seats: parseInt(e.target.value) || 1 })}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                        />
                      </div>
                    </div>

                    {selectedPlan && selectedPlan.features.length > 0 && (
                      <p className="text-xs text-slate-400 ml-7 mt-2">
                        {selectedPlan.features.slice(0, 2).join(" · ")}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-500" aria-live="polite">
          {enabledCount > 0 ? (
            <>{enabledCount} tool{enabledCount !== 1 ? "s" : ""} · <strong>${Math.round(totalSpend)}/mo total</strong></>
          ) : (
            "Select the AI tools you use"
          )}
        </div>
        <button
          type="submit"
          disabled={loading || enabledCount === 0}
          aria-label={loading ? "Running audit, please wait" : "Run my audit"}
          className={cn(
            "flex items-center gap-2 font-semibold px-6 py-3 rounded-xl transition-all",
            enabledCount > 0 && !loading
              ? "bg-teal-600 hover:bg-teal-500 text-white shadow-sm active:scale-95"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          )}
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />Running audit…</>
          ) : (
            <>Run my audit<ArrowRight className="w-4 h-4" aria-hidden="true" /></>
          )}
        </button>
      </div>
    </form>
  );
}
