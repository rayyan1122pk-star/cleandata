import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CleanData AI — Fix Messy Spreadsheets & Data in 1-Click",
  description:
    "The simplest no-code AI spreadsheet cleaner. Remove duplicates, fix phone numbers, correct names and casing, normalize dates, and get instant insights without complex formulas.",
  keywords: [
    "data cleaner",
    "spreadsheet cleaner",
    "csv cleaner",
    "remove duplicates excel",
    "clean data ai",
    "no code data cleaning",
    "data preparation tool",
  ],
  authors: [{ name: "CleanData AI" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth antialiased">
      <body className="min-h-screen bg-slate-50 text-slate-900 selection:bg-brand-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
