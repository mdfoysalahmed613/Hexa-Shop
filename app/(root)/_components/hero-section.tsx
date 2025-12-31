// Marketing hero section with static image. Uses blur placeholder
// to avoid layout/pop-in glitches during image load.
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { HeroImage } from "@/assets/common";
export function HeroSection() {
   return (
      <section className="relative w-full">
         {/* Main Hero */}
         <div className="container mx-auto px-4 py-16 md:py-24 lg:py-32">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
               {/* Left Content */}
               <div className="flex flex-col justify-center space-y-6">
                  <Badge className="w-fit" variant="secondary">
                     New Collection 2025
                  </Badge>
                  <div className="space-y-4">
                     <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                        Premium Essentials for the {" "}
                        <span className="text-primary">Modern Man</span>
                     </h1>
                     <p className="text-lg text-muted-foreground md:text-xl max-w-[600px]">
                        Hexa Shop offers shirts, pants, wallets, and everyday essentials built to elevate your style and confidence.
                     </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                     <Button size="lg" asChild>
                        <Link href="/products">
                           Shop Collection
                           <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                     </Button>
                     <Button size="lg" variant="outline" asChild>
                        <Link href="/about">Learn More</Link>
                     </Button>
                  </div>
                  {/* Stats */}
                  <div className="flex gap-8 pt-4">
                     <div>
                        <div className="text-2xl font-bold">500+</div>
                        <div className="text-sm text-muted-foreground">Products</div>
                     </div>
                     <div>
                        <div className="text-2xl font-bold">10K+</div>
                        <div className="text-sm text-muted-foreground">
                           Happy Customers
                        </div>
                     </div>
                     <div>
                        <div className="text-2xl font-bold">4.9</div>
                        <div className="text-sm text-muted-foreground">Rating</div>
                     </div>
                  </div>
               </div>

               {/* Right Content - Hero Image */}
               <div className="relative flex justify-center lg:justify-end items-center">
                  {/* Decorative Background Bubble */}
                  <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/10 rounded-full blur-3xl" />
                  <div className="relative w-full max-w-[450px] lg:max-w-[600px] aspect-square rounded-full overflow-hidden border-8 border-background ring-1 ring-border/20">
                     <Image
                        src={HeroImage}
                        alt="Men's Fashion Collection"
                        fill
                        className="object-cover object-top"
                        priority
                        sizes="(max-width: 768px) 100vw, 50vw"
                     />
                  </div>
               </div>
            </div>
         </div>
      </section>
   );
}
