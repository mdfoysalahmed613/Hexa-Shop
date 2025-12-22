"use client";

import {
   Card,
   CardContent,
   CardDescription,
   CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FolderTree, Eye, EyeOff, Package } from "lucide-react";
import type { Category } from "./category-form-schema";

interface CategoryStatsProps {
   categories: Category[];
   isLoading: boolean;
}

export function CategoryStats({ categories, isLoading }: CategoryStatsProps) {
   const totalCategories = categories.length;
   const activeCategories = categories.filter((c) => c.is_active === true).length;
   const draftCategories = categories.filter((c) => c.is_active === false).length;
   const totalProducts = categories.reduce((acc, cat) => acc + (cat.product_count || 0), 0);

   const stats = [
      { label: "Total Categories", value: totalCategories, icon: FolderTree },
      { label: "Active Categories", value: activeCategories, icon: Eye },
      { label: "Draft Categories", value: draftCategories, icon: EyeOff },
      { label: "Total Products", value: totalProducts, icon: Package },
   ];

   return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
         {stats.map((stat) => (
            <Card key={stat.label}>
               <CardHeader className="flex flex-row items-center justify-between">
                  <CardDescription>{stat.label}</CardDescription>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
               </CardHeader>
               <CardContent>
                  <div className="text-2xl font-bold">
                     {isLoading ? <Skeleton className="w-8 h-8" /> : stat.value}
                  </div>
               </CardContent>
            </Card>
         ))}
      </div>
   );
}
