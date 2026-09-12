"use client";

import React, { useState, useEffect } from "react";
import { Building2, X, Check, Globe, Mail, Phone, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { CompanyProfile, DEFAULT_COMPANY_PROFILE } from "@/lib/business-domains";

interface CompanyProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated?: (profile: CompanyProfile) => void;
}

export function CompanyProfileModal({
  isOpen,
  onClose,
  onProfileUpdated,
}: CompanyProfileModalProps) {
  const [profile, setProfile] = useState<CompanyProfile>(DEFAULT_COMPANY_PROFILE);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      fetchProfile();
    }
  }, [isOpen]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/company-profile");
      const json = await res.json();
      if (json.success && json.profile) {
        setProfile(json.profile);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/company-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const json = await res.json();
      if (json.success) {
        setSavedSuccess(true);
        if (onProfileUpdated) onProfileUpdated(json.profile);
        setTimeout(() => setSavedSuccess(false), 2500);
      }
    } catch (e: any) {
      alert("Failed to save profile: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleFillSample = () => {
    setProfile({
      name: "Apex Global Solutions",
      legalName: "Apex Global Solutions Inc.",
      taxId: "12-3456789",
      industry: "Enterprise Cloud Logistics & SaaS",
      website: "https://apexsolutions.io",
      email: "finance@apexsolutions.io",
      phone: "+1 (555) 987-6543",
      address: "100 Innovation Parkway, Suite 400",
      city: "San Francisco, CA 94105",
      country: "United States",
      currency: "USD",
      fiscalYearEnd: "December 31",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Company & Workspace Profile
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full border border-brand-200">
                  Global Context
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Sets corporate details used across data pipelines, SQL exports, and RAG schemas.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSave} className="overflow-y-auto p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-700">Legal & Corporate Metadata</span>
            <button
              type="button"
              onClick={handleFillSample}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 hover:text-brand-700 hover:underline"
            >
              <Sparkles className="h-3 w-3" />
              Fill Enterprise Sample
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Brand / Trading Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                placeholder="e.g. Apex Global"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Legal Registered Entity</label>
              <input
                type="text"
                value={profile.legalName}
                onChange={(e) => setProfile({ ...profile, legalName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                placeholder="e.g. Apex Global Solutions Inc."
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Federal Tax ID / EIN / VAT</label>
              <input
                type="text"
                value={profile.taxId}
                onChange={(e) => setProfile({ ...profile, taxId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                placeholder="e.g. 12-3456789"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Industry / Sector</label>
              <input
                type="text"
                value={profile.industry}
                onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                placeholder="e.g. Cloud SaaS & Enterprise Software"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Corporate Website</label>
              <div className="relative">
                <Globe className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={profile.website}
                  onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  placeholder="https://apexsolutions.io"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Finance & Billing Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  placeholder="billing@apexsolutions.io"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">HQ Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  placeholder="+1 (555) 987-6543"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Reporting Currency</label>
              <select
                value={profile.currency}
                onChange={(e) => setProfile({ ...profile, currency: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white"
              >
                <option value="USD">USD ($) - US Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="GBP">GBP (£) - British Pound</option>
                <option value="CAD">CAD ($) - Canadian Dollar</option>
                <option value="AUD">AUD ($) - Australian Dollar</option>
                <option value="PKR">PKR (Rs) - Pakistani Rupee</option>
                <option value="INR">INR (₹) - Indian Rupee</option>
              </select>
            </div>
          </div>

          <div className="text-xs pt-2">
            <label className="block font-semibold text-slate-700 mb-1">Headquarters Physical Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                placeholder="100 Innovation Parkway, Suite 400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">City, State / Province, Postal Code</label>
              <input
                type="text"
                value={profile.city}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                placeholder="San Francisco, CA 94105"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Country</label>
              <input
                type="text"
                value={profile.country}
                onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                placeholder="United States"
              />
            </div>
          </div>

          {/* Footer controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs text-emerald-600">
              {savedSuccess && (
                <>
                  <Check className="h-4 w-4" />
                  <span>Profile saved to database successfully!</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 rounded-xl transition-all shadow-xs"
              >
                {saving ? "Saving..." : "Save Company Profile"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
