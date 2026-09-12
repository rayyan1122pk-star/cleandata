"use client";

import React from "react";
import {
  Building2,
  Receipt,
  Package,
  Users,
  Briefcase,
  GraduationCap,
  Sparkles,
  Database,
  ArrowRight
} from "lucide-react";
import { BUSINESS_DOMAINS, BusinessDomain } from "@/lib/business-domains";

interface DomainSelectorProps {
  activeDomainId: string;
  onSelectDomain: (domain: BusinessDomain) => void;
  onOpenCompanyProfile: () => void;
  companyName?: string;
  companyTaxId?: string;
}

export function DomainSelector({
  activeDomainId,
  onSelectDomain,
  onOpenCompanyProfile,
  companyName = "Apex Global Solutions",
  companyTaxId = "12-3456789",
}: DomainSelectorProps) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Building2":
        return <Building2 className="h-4 w-4" />;
      case "Receipt":
        return <Receipt className="h-4 w-4" />;
      case "Package":
        return <Package className="h-4 w-4" />;
      case "Users":
        return <Users className="h-4 w-4" />;
      case "Briefcase":
        return <Briefcase className="h-4 w-4" />;
      case "GraduationCap":
        return <GraduationCap className="h-4 w-4" />;
      default:
        return <Building2 className="h-4 w-4" />;
    }
  };

  const activeDomain = BUSINESS_DOMAINS.find((d) => d.id === activeDomainId) || BUSINESS_DOMAINS[0];

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs mb-4 space-y-3">
      {/* Top row: Company details banner + settings trigger */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-700">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">{companyName}</span>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                EIN: {companyTaxId}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Enterprise workspace data engine active
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCompanyProfile}
            className="flex items-center gap-1 text-[11px] font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 px-3 py-1.5 rounded-xl transition-colors"
          >
            <span>Edit Company Profile</span>
          </button>
        </div>
      </div>

      {/* Domain pills */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Business Domain & Schemas
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            Active Table: <code className="text-brand-600 font-mono font-semibold">{activeDomain.defaultTableName}</code>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {BUSINESS_DOMAINS.map((dom) => {
            const isActive = dom.id === activeDomainId;
            return (
              <button
                key={dom.id}
                onClick={() => onSelectDomain(dom)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60"
                }`}
              >
                <span className={isActive ? "text-brand-400" : "text-slate-400"}>
                  {getIcon(dom.icon)}
                </span>
                <span>{dom.shortName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Domain quick actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
        <p className="text-[11px] text-slate-500">
          {activeDomain.description}
        </p>

        <button
          onClick={() => onSelectDomain(activeDomain)}
          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-2.5 py-1 rounded-lg border border-brand-200 transition-all"
        >
          <Sparkles className="h-3 w-3 text-brand-600" />
          <span>Load {activeDomain.shortName} Messy Dataset</span>
        </button>
      </div>
    </div>
  );
}
