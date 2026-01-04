"use client";

import { usePathname } from "next/navigation";
import {
   Breadcrumb,
   BreadcrumbItem,
   BreadcrumbLink,
   BreadcrumbList,
   BreadcrumbPage,
   BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const breadcrumbLabels: Record<string, string> = {
   admin: "Admin",
   dashboard: "Dashboard",
   products: "Products",
   orders: "Orders",
   customers: "Customers",
   analytics: "Analytics",
   settings: "Settings",
   new: "Add New",
   categories: "Categories",
   inventory: "Inventory",
   store: "Store Settings",
   shipping: "Shipping",
   discounts: "Discounts",
};

export function DynamicBreadcrumb() {
   const pathname = usePathname();

   // Parse the pathname to generate breadcrumb items
   const segments = pathname
      .split("/")
      .filter((segment) => segment && segment !== "admin");

   // Always start with Admin
   const breadcrumbItems = [
      { label: "Admin", href: "/admin" },
      ...segments.map((segment, index) => {
         const href = `/admin/${segments.slice(0, index + 1).join("/")}`;
         const label = breadcrumbLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
         return { label, href };
      }),
   ];

   return (
      <Breadcrumb>
         <BreadcrumbList>
            {breadcrumbItems.map((item, index) => (
               <div key={item.href} className="flex items-center gap-2">
                  <BreadcrumbItem>
                     {index === breadcrumbItems.length - 1 ? (
                        <BreadcrumbPage>{item.label}</BreadcrumbPage>
                     ) : (
                        <BreadcrumbLink href={item.href} className="hidden md:block">
                           {item.label}
                        </BreadcrumbLink>
                     )}
                  </BreadcrumbItem>
                  {index < breadcrumbItems.length - 1 && (
                     <BreadcrumbSeparator className="hidden md:block" />
                  )}
               </div>
            ))}
         </BreadcrumbList>
      </Breadcrumb>
   );
}
