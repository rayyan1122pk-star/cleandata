import { Clock, CheckCircle2, XCircle, ArrowRight, Zap, Sparkles } from "lucide-react";

export function ScrollStory() {
  return (
    <section id="story" className="py-24 bg-white border-y border-slate-200/80 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3.5 py-1 text-xs font-semibold text-slate-700 mb-4">
            <Clock className="h-3.5 w-3.5 text-brand-600" />
            <span>HOW MUCH TIME ARE YOU WASTING?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            The Spreadsheet Trap vs. CleanData AI
          </h2>
          <p className="text-slate-600 text-base">
            Every week, teams waste hundreds of hours manually fixing data in Excel just to send emails or run simple reports.
          </p>
        </div>

        {/* Side by Side Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
          {/* The Old Way */}
          <div className="rounded-3xl border border-red-200/80 bg-red-50/20 p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-red-600 font-mono bg-red-100 px-2.5 py-1 rounded-full">
                  THE OLD WAY (EXCEL AGONY)
                </span>
                <span className="text-xs text-red-600 font-bold">~3 to 5 Hours</span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-4">
                Manual Formula Hell & Messy Exports
              </h3>

              <ul className="space-y-4 text-sm text-slate-700">
                <li className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  <span>Struggling with broken `=VLOOKUP` and `=PROPER` formulas that crash Excel.</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  <span>Scanning thousands of rows by hand trying to find duplicate customer emails.</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  <span>Phone numbers formatted as numbers, stripping away leading zeros and `+1`.</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  <span>Accidentally emailing test addresses like `test@test.com` and ruining deliverability.</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-red-200/60 text-xs font-medium text-red-700">
              Outcome: Frustrated team, delayed campaigns, and dirty CRM data.
            </div>
          </div>

          {/* The CleanData Way */}
          <div className="rounded-3xl border-2 border-brand-500 bg-brand-50/30 p-8 flex flex-col justify-between shadow-card relative">
            <div className="absolute -top-3.5 right-6 bg-brand-600 text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
              RECOMMENDED
            </div>

            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-700 font-mono bg-brand-100 px-2.5 py-1 rounded-full">
                  THE CLEANDATA WAY
                </span>
                <span className="text-xs text-brand-700 font-bold">~30 Seconds</span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-4">
                1-Click Automatic In-Browser Intelligence
              </h3>

              <ul className="space-y-4 text-sm text-slate-700">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-success-600 shrink-0 mt-0.5" />
                  <span>Drag & drop any CSV or Excel file — no setup, no formulas needed.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-success-600 shrink-0 mt-0.5" />
                  <span>Instant intelligent deduplication matching variations across names & emails.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-success-600 shrink-0 mt-0.5" />
                  <span>Automatic standardization of international phone numbers, dates, and names.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-success-600 shrink-0 mt-0.5" />
                  <span>Instant clean CSV download ready to import into Shopify, HubSpot, or Klaviyo.</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-brand-200/60 text-xs font-semibold text-brand-700 flex items-center justify-between">
              <span>Outcome: 100% clean data in seconds. Zero headache.</span>
              <Sparkles className="h-4 w-4 text-brand-600" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
