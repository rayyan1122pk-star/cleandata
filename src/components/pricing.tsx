"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Sparkles, ArrowRight } from "lucide-react";

export function Pricing() {
  const [annual, setAnnual] = useState(true);

  const plans = [
    {
      name: "Starter",
      badge: "Solopreneurs",
      description: "For founders and marketers who need to clean email lists and monthly sales sheets.",
      priceMonthly: 24,
      priceAnnual: 19,
      features: [
        "Up to 25 spreadsheets / month",
        "Up to 5,000 rows per file",
        "All 4 automatic AI cleaners",
        "Instant clean CSV & Excel download",
        "100% private browser processing",
      ],
      cta: "Get Started Free",
      highlighted: false,
    },
    {
      name: "Pro",
      badge: "Most Popular",
      description: "For growing businesses and e-commerce stores cleaning customer data regularly.",
      priceMonthly: 59,
      priceAnnual: 49,
      features: [
        "Unlimited spreadsheets / month",
        "Up to 50,000 rows per file",
        "Instant Automated Analyst charts & reports",
        "Advanced fuzzy deduplication",
        "Custom export formatting (Shopify, HubSpot)",
        "Priority email support",
      ],
      cta: "Start 14-Day Free Trial",
      highlighted: true,
    },
    {
      name: "Agency & Team",
      badge: "High Volume",
      description: "For marketing agencies, accountants, and teams managing client data lists.",
      priceMonthly: 119,
      priceAnnual: 99,
      features: [
        "Everything in Pro",
        "Up to 250,000 rows per file",
        "5 Team member seats included",
        "Client white-label audit reports",
        "Zapier & Webhook automation",
        "Dedicated onboarding call",
      ],
      cta: "Contact Team Sales",
      highlighted: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 bg-slate-50 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 font-mono bg-brand-50 px-3 py-1 rounded-full border border-brand-100 mb-4 inline-block">
            SIMPLE & PREDICTABLE
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            Spend Less Than One Hour of an Analyst's Time
          </h2>
          <p className="text-slate-600 text-base mb-6">
            A freelance data analyst charges \$75/hour to write Python scripts. CleanData AI does it in 10 seconds.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                !annual ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                annual ? "bg-brand-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] bg-brand-500 text-white font-bold px-1.5 py-0.5 rounded">
                SAVE 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
          {plans.map((plan) => {
            const price = annual ? plan.priceAnnual : plan.priceMonthly;
            return (
              <div
                key={plan.name}
                className={`rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                  plan.highlighted
                    ? "bg-white border-2 border-brand-600 shadow-card relative"
                    : "bg-white border border-slate-200 shadow-soft hover:shadow-card"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brand-600 text-white font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                    {plan.badge}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                    {!plan.highlighted && (
                      <span className="text-xs font-semibold text-slate-500 uppercase">{plan.badge}</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mb-6 min-h-[36px] leading-relaxed">{plan.description}</p>

                  <div className="mb-6 pb-6 border-b border-slate-100">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-slate-900 font-mono">${price}</span>
                      <span className="text-xs text-slate-500 font-medium">/ month</span>
                    </div>
                    {annual && (
                      <span className="text-[11px] text-brand-600 font-medium block mt-1">Billed annually (${price * 12}/yr)</span>
                    )}
                  </div>

                  <ul className="space-y-3.5 mb-8 text-xs text-slate-700">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <Check className="h-4 w-4 text-success-600 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href="/app"
                  className={`w-full py-3.5 rounded-xl text-xs font-bold text-center transition-all flex items-center justify-center gap-2 ${
                    plan.highlighted
                      ? "bg-brand-600 text-white hover:bg-brand-700 shadow-glow"
                      : "bg-slate-900 text-white hover:bg-slate-800 shadow-sm"
                  }`}
                >
                  <span>{plan.cta}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
