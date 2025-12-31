import { CategorySection } from "./_components/category-section";
import { HeroSection } from "./_components/hero-section";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <CategorySection />
    </main>
  );
}
