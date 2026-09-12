import Link from "next/link";
import { Sparkles, Shield, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-12 text-slate-500 text-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-bold text-base text-slate-900">CleanData AI</span>
            <span className="text-slate-400">• The No-Code Automated Data Engineer</span>
          </div>

          <div className="flex items-center gap-6 font-medium text-slate-600">
            <Link href="#demo" className="hover:text-brand-600 transition-colors">Live Cleaner</Link>
            <Link href="#story" className="hover:text-brand-600 transition-colors">How It Works</Link>
            <Link href="#features" className="hover:text-brand-600 transition-colors">Features</Link>
            <Link href="#pricing" className="hover:text-brand-600 transition-colors">Pricing</Link>
            <Link href="/app" className="hover:text-brand-600 transition-colors font-bold text-brand-600">Studio App</Link>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400">
          <p>© {new Date().getFullYear()} CleanData AI Inc. All rights reserved. 100% private in-browser processing.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-500">
              <Shield className="h-3.5 w-3.5 text-success-600" />
              <span>Zero Data Retained On Servers</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
