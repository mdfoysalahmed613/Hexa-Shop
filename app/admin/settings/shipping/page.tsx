"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
   Truck,
   Plus,
   Globe,
   MapPin,
   Package,
   Clock,
   DollarSign,
   Edit,
   Trash2,
   ChevronDown,
   ChevronUp,
   Plane
} from "lucide-react";
import { useState } from "react";

export default function ShippingPage() {
   // Dummy shipping zones data
   const shippingZones = [
      {
         id: 1,
         name: "Domestic (United States)",
         countries: ["United States"],
         methods: [
            { id: 1, name: "Standard Shipping", price: 5.99, minDays: 5, maxDays: 7, freeAbove: 75 },
            { id: 2, name: "Express Shipping", price: 12.99, minDays: 2, maxDays: 3, freeAbove: null },
            { id: 3, name: "Overnight Shipping", price: 24.99, minDays: 1, maxDays: 1, freeAbove: null },
         ],
         status: "active" as const,
      },
      {
         id: 2,
         name: "Canada",
         countries: ["Canada"],
         methods: [
            { id: 4, name: "Standard International", price: 14.99, minDays: 7, maxDays: 14, freeAbove: 150 },
            { id: 5, name: "Express International", price: 29.99, minDays: 3, maxDays: 5, freeAbove: null },
         ],
         status: "active" as const,
      },
      {
         id: 3,
         name: "Europe",
         countries: ["United Kingdom", "Germany", "France", "Italy", "Spain", "Netherlands"],
         methods: [
            { id: 6, name: "International Standard", price: 19.99, minDays: 10, maxDays: 21, freeAbove: 200 },
            { id: 7, name: "International Express", price: 39.99, minDays: 5, maxDays: 7, freeAbove: null },
         ],
         status: "active" as const,
      },
      {
         id: 4,
         name: "Rest of World",
         countries: ["All other countries"],
         methods: [
            { id: 8, name: "Economy International", price: 24.99, minDays: 14, maxDays: 30, freeAbove: null },
         ],
         status: "inactive" as const,
      },
   ];

   // Shipping carriers
   const carriers = [
      { id: 1, name: "USPS", logo: "📦", status: "connected", trackingEnabled: true },
      { id: 2, name: "UPS", logo: "📦", status: "connected", trackingEnabled: true },
      { id: 3, name: "FedEx", logo: "📦", status: "disconnected", trackingEnabled: false },
      { id: 4, name: "DHL", logo: "📦", status: "disconnected", trackingEnabled: false },
   ];

   const [expandedZone, setExpandedZone] = useState<number | null>(1);

   // Stats
   const totalZones = shippingZones.length;
   const activeZones = shippingZones.filter(z => z.status === "active").length;
   const totalMethods = shippingZones.reduce((acc, z) => acc + z.methods.length, 0);
   const connectedCarriers = carriers.filter(c => c.status === "connected").length;

   const stats = [
      { label: "Shipping Zones", value: totalZones, icon: Globe },
      { label: "Active Zones", value: activeZones, icon: MapPin },
      { label: "Shipping Methods", value: totalMethods, icon: Truck },
      { label: "Connected Carriers", value: connectedCarriers, icon: Package },
   ];

   return (
      <div className="flex flex-1 flex-col gap-6 p-6">
         {/* Header */}
         <div className="flex items-center justify-between">
            <div>
               <h1 className="text-3xl font-bold tracking-tight">Shipping</h1>
               <p className="text-muted-foreground">
                  Configure shipping zones, rates, and delivery options
               </p>
            </div>
            <Button>
               <Plus className="mr-2 h-4 w-4" />
               Add Shipping Zone
            </Button>
         </div>

         {/* Stats */}
         <div className="grid gap-4 md:grid-cols-4">
            {stats.map((stat) => (
               <Card key={stat.label}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                     <CardTitle className="text-sm font-medium text-muted-foreground">
                        {stat.label}
                     </CardTitle>
                     <stat.icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                     <div className="text-2xl font-bold">{stat.value}</div>
                  </CardContent>
               </Card>
            ))}
         </div>

         <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content - Shipping Zones */}
            <div className="lg:col-span-2 space-y-4">
               <Card>
                  <CardHeader>
                     <CardTitle>Shipping Zones</CardTitle>
                     <CardDescription>
                        Define regions and their shipping rates
                     </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     {shippingZones.map((zone) => (
                        <div
                           key={zone.id}
                           className="border rounded-lg overflow-hidden"
                        >
                           {/* Zone Header */}
                           <div
                              className="flex items-center justify-between p-4 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                              onClick={() => setExpandedZone(expandedZone === zone.id ? null : zone.id)}
                           >
                              <div className="flex items-center gap-3">
                                 <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Globe className="h-5 w-5 text-primary" />
                                 </div>
                                 <div>
                                    <div className="flex items-center gap-2">
                                       <span className="font-medium">{zone.name}</span>
                                       <Badge variant={zone.status === "active" ? "default" : "secondary"}>
                                          {zone.status}
                                       </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                       {zone.countries.length > 3
                                          ? `${zone.countries.slice(0, 3).join(", ")} +${zone.countries.length - 3} more`
                                          : zone.countries.join(", ")
                                       }
                                    </p>
                                 </div>
                              </div>
                              <div className="flex items-center gap-2">
                                 <span className="text-sm text-muted-foreground">
                                    {zone.methods.length} method{zone.methods.length !== 1 ? "s" : ""}
                                 </span>
                                 {expandedZone === zone.id ? (
                                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                                 ) : (
                                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                 )}
                              </div>
                           </div>

                           {/* Expanded Methods */}
                           {expandedZone === zone.id && (
                              <div className="p-4 space-y-3 border-t">
                                 {zone.methods.map((method) => (
                                    <div
                                       key={method.id}
                                       className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
                                    >
                                       <div className="flex items-center gap-3">
                                          <Truck className="h-4 w-4 text-muted-foreground" />
                                          <div>
                                             <p className="text-sm font-medium">{method.name}</p>
                                             <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                   <Clock className="h-3 w-3" />
                                                   {method.minDays === method.maxDays
                                                      ? `${method.minDays} day${method.minDays !== 1 ? "s" : ""}`
                                                      : `${method.minDays}-${method.maxDays} days`
                                                   }
                                                </span>
                                                {method.freeAbove && (
                                                   <span className="text-green-600">
                                                      Free over ${method.freeAbove}
                                                   </span>
                                                )}
                                             </div>
                                          </div>
                                       </div>
                                       <div className="flex items-center gap-3">
                                          <span className="font-semibold">${method.price}</span>
                                          <Button variant="ghost" size="icon" className="h-8 w-8">
                                             <Edit className="h-3.5 w-3.5" />
                                          </Button>
                                       </div>
                                    </div>
                                 ))}
                                 <Button variant="outline" size="sm" className="w-full mt-2">
                                    <Plus className="mr-2 h-3.5 w-3.5" />
                                    Add Shipping Method
                                 </Button>
                              </div>
                           )}
                        </div>
                     ))}
                  </CardContent>
               </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
               {/* Carriers */}
               <Card>
                  <CardHeader>
                     <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Shipping Carriers
                     </CardTitle>
                     <CardDescription>
                        Connect carriers for real-time rates and tracking
                     </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                     {carriers.map((carrier) => (
                        <div
                           key={carrier.id}
                           className="flex items-center justify-between p-3 border rounded-lg"
                        >
                           <div className="flex items-center gap-3">
                              <span className="text-2xl">{carrier.logo}</span>
                              <div>
                                 <p className="text-sm font-medium">{carrier.name}</p>
                                 <p className="text-xs text-muted-foreground">
                                    {carrier.trackingEnabled ? "Tracking enabled" : "No tracking"}
                                 </p>
                              </div>
                           </div>
                           <Button
                              variant={carrier.status === "connected" ? "outline" : "default"}
                              size="sm"
                           >
                              {carrier.status === "connected" ? "Manage" : "Connect"}
                           </Button>
                        </div>
                     ))}
                  </CardContent>
               </Card>

               {/* Default Settings */}
               <Card>
                  <CardHeader>
                     <CardTitle>Default Settings</CardTitle>
                     <CardDescription>
                        Fallback shipping configuration
                     </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="handling-time">Handling Time (days)</Label>
                        <Input
                           id="handling-time"
                           type="number"
                           defaultValue={2}
                           min={0}
                        />
                        <p className="text-xs text-muted-foreground">
                           Time to prepare order before shipping
                        </p>
                     </div>
                     <div className="space-y-2">
                        <Label htmlFor="default-weight">Default Package Weight (lbs)</Label>
                        <Input
                           id="default-weight"
                           type="number"
                           defaultValue={1}
                           min={0}
                           step={0.1}
                        />
                     </div>
                     <div className="space-y-2">
                        <Label>Origin Address</Label>
                        <div className="p-3 bg-secondary/50 rounded-lg text-sm">
                           <p>123 Fashion Street</p>
                           <p>Style City, SC 12345</p>
                           <p>United States</p>
                        </div>
                        <Button variant="outline" size="sm" className="w-full">
                           <Edit className="mr-2 h-3.5 w-3.5" />
                           Edit Origin
                        </Button>
                     </div>
                  </CardContent>
               </Card>

               {/* Free Shipping Threshold */}
               <Card>
                  <CardHeader>
                     <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Free Shipping
                     </CardTitle>
                     <CardDescription>
                        Set minimum order for free shipping
                     </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                           <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                           <Input
                              type="number"
                              defaultValue={75}
                              min={0}
                              className="pl-8"
                           />
                        </div>
                     </div>
                     <div className="flex items-center gap-2">
                        <input
                           type="checkbox"
                           id="free-ship-enabled"
                           defaultChecked
                           className="h-4 w-4 rounded border-gray-300"
                        />
                        <Label htmlFor="free-ship-enabled" className="text-sm font-normal">
                           Enable free shipping threshold
                        </Label>
                     </div>
                     <p className="text-xs text-muted-foreground">
                        Customers get free standard shipping on orders over this amount
                     </p>
                  </CardContent>
               </Card>

               {/* International Shipping Notice */}
               <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30">
                  <CardHeader className="pb-2">
                     <CardTitle className="text-base flex items-center gap-2">
                        <Plane className="h-4 w-4" />
                        International Shipping
                     </CardTitle>
                  </CardHeader>
                  <CardContent>
                     <p className="text-sm text-muted-foreground">
                        Customers may be responsible for import duties and taxes on international orders.
                     </p>
                  </CardContent>
               </Card>
            </div>
         </div>
      </div>
   );
}