"use client";

import Link from "next/link";
import Image from "next/image";
import { PantImage, ShirtImage, ShoeImage, TShirtsImage, WatchImage } from "@/assets/category";

const categories = [
   {
      name: "Shirts",
      image: ShirtImage,
      count: "120+ Styles",
      href: "/products?category=shirts",
   },
   {
      name: "T-Shirts",
      image: TShirtsImage,
      count: "150+ Designs",
      href: "/products?category=t-shirts",
   },
   {
      name: "Pants",
      image: PantImage,
      count: "80+ Fits",
      href: "/products?category=pants",
   },
   {
      name: "Shoes",
      image: ShoeImage,
      count: "90+ Pairs",
      href: "/products?category=shoes",
   },
   {
      name: "Watches",
      image: WatchImage,
      count: "60+ Timepieces",
      href: "/products?category=watches",
   },
];

export function CategorySection() {
   return (
      <div className="py-12 md:py-16">
         <div className="container mx-auto px-4">
            <div className="text-center mb-10">
               <h2 className="text-3xl font-bold tracking-tight mb-2">
                  Shop by Category
               </h2>
               <p className="text-muted-foreground">
                  Discover our premium collection for modern men
               </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
               {categories.map((category) => (
                  <Link
                     key={category.name}
                     href={category.href}
                     className="group"
                  >
                     <div className="bg-background rounded-lg overflow-hidden border border-border hover:border-primary hover:shadow-lg transition-all duration-300">
                        <div className="relative aspect-square w-full bg-secondary/30">
                           <Image
                              src={category.image}
                              alt={category.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                           />
                        </div>
                        <div className="p-4 text-center">
                           <h3 className="font-semibold">{category.name}</h3>
                           <p className="text-sm text-muted-foreground">
                              {category.count}
                           </p>
                        </div>
                     </div>
                  </Link>
               ))}
            </div>
         </div>
      </div>
   );
}
