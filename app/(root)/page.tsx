import { CategorySection } from "@/components/home/category-section";
import { HeroSection } from "@/components/home/hero-section";
import Practice from "@/components/home/practice";

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <CategorySection />
      {/* <Practice /> */}
    </main>
  );
}
