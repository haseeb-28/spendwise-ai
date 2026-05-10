"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Plus, Loader2, ArrowRight } from "lucide-react";
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

  // Load from localStorage
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

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ tools, teamSize, useCase }));
    } catch {}
  }, [tools, teamSize, useCase]);

  const enabledCount = tools.filter((t) => t.enabled).length;
  const totalSpend = tools
    .filter((t) => t.enabled)
    .reduce((sum, t) => sum + (t.monthlySpend || 0), 0);

  function toggleTool(toolId: string) {
    setTools((prev) =>
      prev.map((t) =>
        t.tool === toolId
          ? {
              ...t,
              enabled: !t.enabled,
            }
          : t
      )
    );
    setExpandedTools((prev) => {
      const next = new Set(prev);
      const tool = tools.find((t) => t.tool === toolId);
      if (!tool?.enabled) {
        next.add(toolId);
      } else {
        next.delete(toolId);
      }
      return next;
    });
  }

  function updateTool(toolId: string, updates: Partial<ToolInput>) {
    setTools((prev) =>
      prev.map((t) => (t.tool === toolId ? { ...t, ...updates } : t))
    );
  }

  function toggleExpand(toolId: string) {
    setExpandedTools((prev) => {
      const next = new Set(prev);
      if (next.has(toolId)) {
        next.delete(toolId);
      } else {
        next.add(toolId);
      }
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const enabledTools = tools.filter((t) => t.enabled);
    if (enabledTools.length === 0) {
      toast.error("Please add at least one AI tool");
      return;
    }

    const hasSpend = enabledTools.some((t) => t.monthlySpend > 0);
    if (!hasSpend) {
      toast.error("Please enter monthly spend for at least one tool");
      return;
    }

    setLoading(true);
    try {
      const formData: AuditFormData = {
        tools: enabledTools,
        teamSize,
        useCase,
      };

      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, _hp: "" }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Audit failed");
      }

      const result = await res.json();

      // Store in both sessionStorage AND localStorage so result page
      // loads even if opened in a new tab from the same device
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Hidden honeypot */}
      <input type="text" name="_hp" className="hidden" tabIndex={-1} autoComplete="off" />

      {/* Team context */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Your team</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Team size (people)
            </label>
            <input
              type="number"
              min="1"
              max="100000"
              value={teamSize}
              onChange={(e) => setTeamSize(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Primary use case
            </label>
            <select
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
          <span className="text-sm text-slate-500">
            {enabledCount} selected · <span className="font-medium text-teal-700">${Math.round(totalSpend)}/mo</span>
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {TOOLS.map((toolDef) => {
            const toolInput = tools.find((t) => t.tool === toolDef.id)!;
            const isEnabled = toolInput.enabled;
            const isExpanded = expandedTools.has(toolDef.id);
            const selectedPlan = toolDef.plans.find((p) => p.planId === toolInput.plan);

            return (
              <div
                key={toolDef.id}
                className={cn("transition-colors", isEnabled ? "bg-teal-50/30" : "bg-white")}
              >
                {/* Tool header row */}
                <div className="flex items-center gap-3 px-6 py-4">
                  <button
                    type="button"
                    onClick={() => toggleTool(toolDef.id)}
                    className={cn(
                      "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                      isEnabled
                        ? "bg-teal-600 border-teal-600"
                        : "border-slate-300 bg-white hover:border-teal-400"
                    )}
                    aria-label={`${isEnabled ? "Remove" : "Add"} ${toolDef.label}`}
                  >
                    {isEnabled && (
                      <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                        <path
                          d="M2 6l3 3 5-5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "font-medium text-sm",
                          isEnabled ? "text-slate-900" : "text-slate-600"
                        )}
                      >
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
                  </div>

                  {isEnabled && (
                    <button
                      type="button"
                      onClick={() => toggleExpand(toolDef.id)}
                      className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  )}

                  {!isEnabled && (
                    <button
                      type="button"
                      onClick={() => toggleTool(toolDef.id)}
                      className="flex items-center gap-1 text-xs text-slate-400 hover:text-teal-600 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add
                    </button>
                  )}
                </div>

                {/* Expanded tool details */}
                {isEnabled && isExpanded && (
                  <div className="px-6 pb-4 pt-0">
                    <div className="grid sm:grid-cols-3 gap-3 ml-8">
                      {/* Plan selector */}
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Plan
                        </label>
                        <select
                          value={toolInput.plan}
                          onChange={(e) => updateTool(toolDef.id, { plan: e.target.value })}
                          className="w-full border border-slate-300 rounded-lg px-2.5 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none bg-white"
                        >
                          {toolDef.plans.map((p) => (
                            <option key={p.planId} value={p.planId}>
                              {p.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Monthly spend */}
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Monthly spend ($)
                        </label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                            $
                          </span>
                          <input
                            type="number"
                            min="0"
                            max="100000"
                            step="1"
                            value={toolInput.monthlySpend || ""}
                            placeholder="0"
                            onChange={(e) =>
                              updateTool(toolDef.id, {
                                monthlySpend: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="w-full border border-slate-300 rounded-lg pl-7 pr-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                          />
                        </div>
                      </div>

                      {/* Seats */}
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Seats / users
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="10000"
                          value={toolInput.seats || ""}
                          placeholder="1"
                          onChange={(e) =>
                            updateTool(toolDef.id, {
                              seats: parseInt(e.target.value) || 1,
                            })
                          }
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                        />
                      </div>
                    </div>

                    {/* Plan features hint */}
                    {selectedPlan && selectedPlan.features.length > 0 && (
                      <div className="ml-8 mt-2">
                        <p className="text-xs text-slate-400">
                          {selectedPlan.features.slice(0, 2).join(" · ")}
                        </p>
                      </div>
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
        <div className="text-sm text-slate-500">
          {enabledCount > 0 ? (
            <>
              {enabledCount} tool{enabledCount !== 1 ? "s" : ""} ·{" "}
              <strong>${Math.round(totalSpend)}/mo total</strong>
            </>
          ) : (
            "Select the AI tools you use"
          )}
        </div>
        <button
          type="submit"
          disabled={loading || enabledCount === 0}
          className={cn(
            "flex items-center gap-2 font-semibold px-6 py-3 rounded-xl transition-all",
            enabledCount > 0 && !loading
              ? "bg-teal-600 hover:bg-teal-500 text-white shadow-sm active:scale-95"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          )}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Running audit…
            </>
          ) : (
            <>
              Run my audit
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
