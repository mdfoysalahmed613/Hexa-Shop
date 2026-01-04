/**
 * Stats Cards
 *
 * Reusable grid of statistic cards with icons and optional color coding.
 * Supports loading skeletons and responsive column layout.
 *
 * Props:
 * - stats: Array of { label, value, icon, color? }
 * - isLoading: Shows skeleton placeholders
 * - className: Additional grid styling
 *
 * Colors: default, success, warning, danger, info
 */

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatItem {
   label: string;
   value: number | string;
   icon: LucideIcon;
   color?: "default" | "success" | "warning" | "danger" | "info";
}

interface StatsCardsProps {
   stats: StatItem[];
   isLoading?: boolean;
   className?: string;
}

const colorStyles = {
   default: {
      bg: "bg-primary/10",
      icon: "text-primary",
      value: "text-foreground",
   },
   success: {
      bg: "bg-emerald-500/10",
      icon: "text-emerald-600",
      value: "text-emerald-600",
   },
   warning: {
      bg: "bg-amber-500/10",
      icon: "text-amber-600",
      value: "text-amber-600",
   },
   danger: {
      bg: "bg-red-500/10",
      icon: "text-red-600",
      value: "text-red-600",
   },
   info: {
      bg: "bg-blue-500/10",
      icon: "text-blue-600",
      value: "text-blue-600",
   },
};

export function StatsCards({ stats, isLoading, className }: StatsCardsProps) {
   return (
      <div
         className={cn(
            "grid grid-cols-2 gap-4",
            stats.length === 3 && "lg:grid-cols-3",
            stats.length === 4 && "lg:grid-cols-4",
            stats.length >= 5 && "lg:grid-cols-4 xl:grid-cols-5",
            className
         )}
      >
         {stats.map((stat) => {
            const colors = colorStyles[stat.color || "default"];
            const Icon = stat.icon;

            return (
               <Card key={stat.label}>
                  <CardContent className="flex items-center gap-4 px-4">
                     <div
                        className={cn(
                           "flex h-10 w-10 items-center justify-center rounded-lg",
                           colors.bg
                        )}
                     >
                        <Icon className={cn("h-5 w-5", colors.icon)} />
                     </div>
                     <div className="min-w-0 flex-1">
                        <p className="text-xs text-muted-foreground truncate">
                           {stat.label}
                        </p>
                        {isLoading ? (
                           <Skeleton className="mt-1 h-6 w-12" />
                        ) : (
                           <p className={cn("text-xl font-bold", colors.value)}>
                              {stat.value}
                           </p>
                        )}
                     </div>
                  </CardContent>
               </Card>
            );
         })}
      </div>
   );
}
