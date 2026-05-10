import Link from "next/link";
import { ArrowRight, TrendingDown, Zap, Shield, BarChart3 } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-teal-950 to-slate-900">
      {/* Nav */}
      <nav className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-50 bg-slate-950/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-teal-500 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-white">SpendWise</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-400 hidden sm:block">by Credex</span>
            <Link
              href="/audit"
              className="bg-teal-500 hover:bg-teal-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Start free audit
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 rounded-full px-4 py-1.5 mb-8">
          <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
          <span className="text-teal-300 text-sm font-medium">Free • No login • 2 minutes</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
          Are you overpaying
          <br />
          <span className="text-teal-400">for AI tools?</span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
          Most startups sigh and pay their AI bill. SpendWise audits your Cursor, Claude,
          ChatGPT, and Copilot spend in 2 minutes and finds exactly where you&apos;re overpaying.
        </p>

        <Link
          href="/audit"
          className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 active:scale-95 text-white font-semibold text-lg px-8 py-4 rounded-xl transition-all shadow-lg shadow-teal-500/20"
        >
          Audit my AI spend
          <ArrowRight className="w-5 h-5" />
        </Link>

        <p className="text-slate-500 text-sm mt-4">
          No credit card. No account. Just answers.
        </p>
      </section>

      {/* Stats */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-16">
        <div className="grid grid-cols-3 gap-4 sm:gap-8">
          {[
            { value: "$340", label: "avg monthly savings found" },
            { value: "8", label: "AI tools covered" },
            { value: "2 min", label: "to complete audit" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl sm:text-4xl font-bold text-teal-400">{stat.value}</div>
              <div className="text-slate-400 text-xs sm:text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-20">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <h2 className="text-white font-semibold text-lg mb-6 text-center">How it works</h2>
          <div className="grid sm:grid-cols-4 gap-6">
            {[
              { icon: <BarChart3 className="w-5 h-5" />, title: "Enter your tools", desc: "Tell us what you pay for" },
              { icon: <Zap className="w-5 h-5" />, title: "Instant audit", desc: "Our engine analyzes every plan" },
              { icon: <TrendingDown className="w-5 h-5" />, title: "See savings", desc: "Per-tool breakdown with reasoning" },
              { icon: <Shield className="w-5 h-5" />, title: "Share report", desc: "Unique URL, no PII included" },
            ].map((step, i) => (
              <div key={step.title} className="text-center">
                <div className="w-10 h-10 bg-teal-500/20 rounded-xl flex items-center justify-center text-teal-400 mx-auto mb-3">
                  {step.icon}
                </div>
                <div className="text-white font-medium text-sm mb-1">{step.title}</div>
                <div className="text-slate-400 text-xs">{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-24 text-center">
        <div className="bg-gradient-to-r from-teal-900/50 to-emerald-900/50 border border-teal-500/20 rounded-2xl p-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Find your savings in 2 minutes
          </h2>
          <p className="text-slate-300 mb-8">
            The audit is free. The savings are real. No account required.
          </p>
          <Link
            href="/audit"
            className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white font-semibold px-8 py-4 rounded-xl transition-all"
          >
            Start my free audit <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-slate-500 text-sm">
        <p>
          SpendWise is a free tool by{" "}
          <a href="https://credex.rocks" className="text-teal-400 hover:text-teal-300">
            Credex
          </a>{" "}
          — discounted AI infrastructure credits
        </p>
      </footer>
    </main>
  );
}
