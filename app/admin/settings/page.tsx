import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
   Store,
   Truck,
   Percent,
   Bell,
   CreditCard,
   Shield,
   Users,
   Globe,
   ChevronRight
} from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
   // Settings categories with dummy data
   const settingsCategories = [
      {
         title: "Store Settings",
         description: "Configure your store name, logo, contact information, and branding",
         icon: Store,
         href: "/admin/settings/store",
         status: "Configure your store identity",
      },
      {
         title: "Shipping",
         description: "Manage shipping zones, rates, carriers, and delivery options",
         icon: Truck,
         href: "/admin/settings/shipping",
         status: "3 shipping zones configured",
      },
      {
         title: "Discounts & Promotions",
         description: "Create and manage discount codes, sales, and promotional campaigns",
         icon: Percent,
         href: "/admin/settings/discounts",
         status: "5 active discount codes",
      },
   ];

   // Additional settings that can be implemented later
   const additionalSettings = [
      {
         title: "Payment Methods",
         description: "Configure payment gateways and checkout options",
         icon: CreditCard,
         status: "Coming soon",
         disabled: true,
      },
      {
         title: "Notifications",
         description: "Email templates and notification preferences",
         icon: Bell,
         status: "Coming soon",
         disabled: true,
      },
      {
         title: "Security",
         description: "Two-factor authentication and security settings",
         icon: Shield,
         status: "Coming soon",
         disabled: true,
      },
      {
         title: "Team & Permissions",
         description: "Manage team members and their access levels",
         icon: Users,
         status: "Coming soon",
         disabled: true,
      },
      {
         title: "Domains & SEO",
         description: "Custom domains, meta tags, and SEO settings",
         icon: Globe,
         status: "Coming soon",
         disabled: true,
      },
   ];

   return (
      <div className="flex flex-1 flex-col gap-6 p-6">
         {/* Header */}
         <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
               Manage your store settings and preferences
            </p>
         </div>

         {/* Main Settings */}
         <div className="space-y-4">
            <h2 className="text-lg font-semibold">Store Configuration</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
               {settingsCategories.map((category) => (
                  <Link key={category.title} href={category.href}>
                     <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer group">
                        <CardHeader>
                           <div className="flex items-center justify-between">
                              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                 <category.icon className="h-5 w-5 text-primary" />
                              </div>
                              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                           </div>
                           <CardTitle className="text-lg">{category.title}</CardTitle>
                           <CardDescription>{category.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <p className="text-sm text-muted-foreground">{category.status}</p>
                        </CardContent>
                     </Card>
                  </Link>
               ))}
            </div>
         </div>

         {/* Additional Settings (Coming Soon) */}
         <div className="space-y-4">
            <h2 className="text-lg font-semibold">Additional Settings</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
               {additionalSettings.map((setting) => (
                  <Card key={setting.title} className="h-full opacity-60">
                     <CardHeader>
                        <div className="flex items-center justify-between">
                           <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                              <setting.icon className="h-5 w-5 text-muted-foreground" />
                           </div>
                           <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                              {setting.status}
                           </span>
                        </div>
                        <CardTitle className="text-lg">{setting.title}</CardTitle>
                        <CardDescription>{setting.description}</CardDescription>
                     </CardHeader>
                  </Card>
               ))}
            </div>
         </div>

         {/* Quick Stats */}
         <Card>
            <CardHeader>
               <CardTitle>Store Overview</CardTitle>
               <CardDescription>Quick summary of your store configuration</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="grid gap-4 md:grid-cols-4">
                  <div className="space-y-1">
                     <p className="text-sm text-muted-foreground">Store Status</p>
                     <p className="text-lg font-semibold text-green-600">Active</p>
                  </div>
                  <div className="space-y-1">
                     <p className="text-sm text-muted-foreground">Active Discounts</p>
                     <p className="text-lg font-semibold">5</p>
                  </div>
                  <div className="space-y-1">
                     <p className="text-sm text-muted-foreground">Shipping Zones</p>
                     <p className="text-lg font-semibold">3</p>
                  </div>
                  <div className="space-y-1">
                     <p className="text-sm text-muted-foreground">Payment Methods</p>
                     <p className="text-lg font-semibold">2</p>
                  </div>
               </div>
            </CardContent>
         </Card>
      </div>
   );
}