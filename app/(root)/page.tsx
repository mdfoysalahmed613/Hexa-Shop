import { CategorySection } from "./_components/category-section";
import { HeroSection } from "./_components/hero-section";
import { AdminDemoBanner } from "./_components/admin-demo-banner";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <AdminDemoBanner />
      <CategorySection />
    </main>
  );
}
