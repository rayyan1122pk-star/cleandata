import { BarChart3, TrendingUp, DollarSign, Users, Award, ArrowUpRight } from "lucide-react";

export function AutoAnalyst() {
  return (
    <section id="analyst" className="py-24 bg-white border-b border-slate-200/80 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 border border-brand-100 px-3.5 py-1 text-xs text-brand-700 font-semibold mb-4">
            <BarChart3 className="h-3.5 w-3.5 text-brand-600" />
            <span>INSTANT DATA ANALYST</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            Instant Insights Without Writing a Single Formula
          </h2>
          <p className="text-slate-600 text-base">
            Once your data is cleaned, CleanData AI automatically generates executive summary cards and visual metrics ready for your next presentation.
          </p>
        </div>

        {/* Mockup Dashboard Cards */}
        <div className="max-w-5xl mx-auto rounded-3xl border border-slate-200 bg-slate-50/50 p-6 sm:p-10 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                DATASET SUMMARY REPORT
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                customer_leads_april_raw.csv (Cleaned)
              </h3>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold bg-success-50 text-success-700 border border-success-200 px-3 py-1.5 rounded-full">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Data Health: 100% (Audit Passed)</span>
            </div>
          </div>

          {/* Metric Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-soft">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-3">
                <span>TOTAL REVENUE VALUE</span>
                <DollarSign className="h-4 w-4 text-brand-600" />
              </div>
              <div className="text-3xl font-black text-slate-900 font-mono">$8,090.50</div>
              <div className="text-xs text-success-600 mt-2 font-medium">✓ Normalized from messy inputs</div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-soft">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-3">
                <span>UNIQUE CUSTOMERS</span>
                <Users className="h-4 w-4 text-brand-600" />
              </div>
              <div className="text-3xl font-black text-slate-900 font-mono">5 Accounts</div>
              <div className="text-xs text-slate-500 mt-2">2 duplicate records merged</div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-soft">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-3">
                <span>AVG. ORDER VALUE</span>
                <Award className="h-4 w-4 text-brand-600" />
              </div>
              <div className="text-3xl font-black text-slate-900 font-mono">$1,618.10</div>
              <div className="text-xs text-brand-600 mt-2 font-medium">Top Lead: Sarah Connor</div>
            </div>
          </div>

          {/* Mini Visual Chart Bar */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-soft">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
              Status Distribution Across Clean Records
            </div>
            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex gap-1">
              <div className="h-full bg-brand-600 w-[60%]" title="Active: 60%" />
              <div className="h-full bg-success-500 w-[40%]" title="Paid: 40%" />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 mt-3 font-medium">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-brand-600" />
                <span>Active Leads (60%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-success-500" />
                <span>Paid / Completed (40%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
