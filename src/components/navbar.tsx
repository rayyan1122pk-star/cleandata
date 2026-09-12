"use client";

import Link from "next/link";
import { Sparkles, ArrowRight, Table } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-md group-hover:bg-brand-700 transition-colors">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-lg tracking-tight text-slate-900">CleanData</span>
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider bg-brand-50 px-1.5 py-0.5 rounded border border-brand-100">
              AI
            </span>
          </div>
        </Link>

        {/* Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <Link href="#demo" className="hover:text-brand-600 transition-colors">
            Live Cleaner
          </Link>
          <Link href="#story" className="hover:text-brand-600 transition-colors">
            How It Works
          </Link>
          <Link href="#features" className="hover:text-brand-600 transition-colors">
            Features
          </Link>
          <Link href="/app" className="hover:text-brand-600 transition-colors flex items-center gap-1">
            <span>RAG & Vector Hub</span>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded border border-indigo-200 font-bold">NEW</span>
          </Link>
          <Link href="#pricing" className="hover:text-brand-600 transition-colors">
            Pricing
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/app"
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-all duration-200 shadow-sm"
          >
            <Table className="h-3.5 w-3.5 text-brand-500" />
            <span>Launch Studio</span>
            <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
