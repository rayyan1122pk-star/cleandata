import { Navbar } from "@/components/navbar";
import { HeroCleaner } from "@/components/hero-cleaner";
import { ScrollStory } from "@/components/scroll-story";
import { FeaturesGrid } from "@/components/features-grid";
import { AutoAnalyst } from "@/components/auto-analyst";
import { Pricing } from "@/components/pricing";
import { Footer } from "@/components/footer";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <HeroCleaner />
      <ScrollStory />
      <FeaturesGrid />
      <AutoAnalyst />
      <Pricing />
      <Footer />
    </main>
  );
}
