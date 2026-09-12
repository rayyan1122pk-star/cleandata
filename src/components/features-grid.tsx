import { Users, PhoneCall, Type, ShieldCheck, FileSpreadsheet, BrainCircuit } from "lucide-react";

export function FeaturesGrid() {
  const features = [
    {
      title: "Smart Deduplication",
      description: "Detects and merges duplicate records even when typos, extra spaces, or case variations exist.",
      icon: Users,
      before: `"john doe" (Row 1) & "  John Doe  " (Row 42)`,
      after: `Merged into 1 verified, clean customer profile`,
      color: "bg-blue-50 text-blue-600 border-blue-100",
    },
    {
      title: "Phone & Date Standardizer",
      description: "Converts 10 different phone formats and messy international date strings into one unified format.",
      icon: PhoneCall,
      before: `(555) 0192834, 555-019-2834, +15550192834`,
      after: `+1 (555) 019-2834 & 2025-04-15 (Standard)`,
      color: "bg-indigo-50 text-brand-600 border-brand-100",
    },
    {
      title: "Intelligent Text Casing",
      description: "Automatically converts ALL-CAPS screaming or all-lowercase entries into clean, natural Title Case.",
      icon: Type,
      before: `"SARAH CONNOR" & "mIkE wAZOWSKI"`,
      after: `"Sarah Connor" & "Mike Wazowski"`,
      color: "bg-emerald-50 text-success-600 border-emerald-100",
    },
    {
      title: "Omni-Channel Intake (Excel, PDF, Paste)",
      description: "Copy-paste raw text from chat or upload native Excel (.xlsx), CSV, and PDF invoices with zero hassle.",
      icon: FileSpreadsheet,
      before: `Messy PDF invoice or unformatted text dump`,
      after: `Structured spreadsheet grid in 1 click`,
      color: "bg-amber-50 text-amber-600 border-amber-100",
    },
    {
      title: "Enterprise RAG & Vector Sync",
      description: "Directly convert cleaned records into natural language chunks and sync to Pinecone, Qdrant, Chroma, or Supabase.",
      icon: BrainCircuit,
      before: `Raw tabular data unreadable by LLMs`,
      after: `Vectorized JSONL & live vector DB sync`,
      color: "bg-purple-50 text-purple-600 border-purple-100",
    },
    {
      title: "Spam & Bot Anomaly Filter",
      description: "Identifies fake placeholder emails, invalid domain extensions, and test spam rows before you import.",
      icon: ShieldCheck,
      before: `"test@test.com", "asdf@asdf.com", "null"`,
      after: `Automatically flagged & purged safely`,
      color: "bg-rose-50 text-rose-600 border-rose-100",
    },
  ];

  return (
    <section id="features" className="py-24 bg-slate-50/50 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 font-mono bg-brand-50 px-3 py-1 rounded-full border border-brand-100 mb-4 inline-block">
            EVERYTHING YOU NEED
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            Six Data Superpowers in One Simple Tool
          </h2>
          <p className="text-slate-600 text-base">
            CleanData AI automatically applies standard data-engineering transformations, multi-source ingestion, and vector RAG pipelines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="rounded-3xl border border-slate-200/90 bg-white p-7 shadow-soft hover:shadow-card transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3.5 mb-4">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${feat.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 leading-snug">{feat.title}</h3>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-6">
                    {feat.description}
                  </p>
                </div>

                {/* Before & After Visual Pill */}
                <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3.5 space-y-1.5 text-xs font-mono">
                  <div className="flex items-center justify-between text-slate-400 text-[10px]">
                    <span className="text-red-500 font-bold">MESSY INPUT</span>
                    <span className="text-slate-400">➔</span>
                    <span className="text-success-600 font-bold">CLEANED RESULT</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700 font-medium text-[11px]">
                    <span className="truncate max-w-[45%] text-slate-500 line-through">{feat.before}</span>
                    <span className="truncate max-w-[50%] text-slate-900 font-semibold text-right">{feat.after}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
