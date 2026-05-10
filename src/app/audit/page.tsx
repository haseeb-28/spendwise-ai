import { Metadata } from "next";
import AuditForm from "@/components/AuditForm";
import { TrendingDown } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AI Spend Audit — SpendWise",
  description: "Enter your AI tools and get an instant spend analysis",
};

export default function AuditPage() {
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
          <span className="text-sm text-slate-500">Free AI Spend Audit</span>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
            Audit your AI spend
          </h1>
          <p className="text-slate-600">
            Tell us what you&apos;re paying. We&apos;ll tell you what you should be paying.
          </p>
        </div>

        <AuditForm />
      </main>
    </div>
  );
}
