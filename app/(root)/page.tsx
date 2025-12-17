import { CategorySection } from "@/components/home/category-section";
import { HeroSection } from "@/components/home/hero-section";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <CategorySection />
    </main>
  );
}
