"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
   Percent,
   Plus,
   Search,
   Filter,
   Copy,
   Trash2,
   Edit,
   Calendar,
   Tag,
   DollarSign,
   Users
} from "lucide-react";
import { useState } from "react";

export default function DiscountsPage() {
   // Dummy discount codes data
   const discounts = [
      {
         id: 1,
         code: "WELCOME20",
         type: "percentage" as const,
         value: 20,
         description: "20% off for new customers",
         usageLimit: 100,
         usageCount: 45,
         minPurchase: 50,
         status: "active" as const,
         startDate: "2024-12-01",
         endDate: "2025-01-31",
         applicableTo: "All products"
      },
      {
         id: 2,
         code: "FREESHIP",
         type: "free_shipping" as const,
         value: 0,
         description: "Free shipping on orders over $75",
         usageLimit: null,
         usageCount: 234,
         minPurchase: 75,
         status: "active" as const,
         startDate: "2024-11-15",
         endDate: null,
         applicableTo: "All products"
      },
      {
         id: 3,
         code: "HOLIDAY25",
         type: "percentage" as const,
         value: 25,
         description: "Holiday season special",
         usageLimit: 500,
         usageCount: 312,
         minPurchase: 100,
         status: "active" as const,
         startDate: "2024-12-15",
         endDate: "2024-12-31",
         applicableTo: "Selected categories"
      },
      {
         id: 4,
         code: "FLAT10",
         type: "fixed" as const,
         value: 10,
         description: "$10 off any purchase",
         usageLimit: 200,
         usageCount: 200,
         minPurchase: 30,
         status: "expired" as const,
         startDate: "2024-10-01",
         endDate: "2024-11-30",
         applicableTo: "All products"
      },
      {
         id: 5,
         code: "VIP50",
         type: "percentage" as const,
         value: 50,
         description: "VIP members exclusive",
         usageLimit: 50,
         usageCount: 12,
         minPurchase: 200,
         status: "active" as const,
         startDate: "2024-12-01",
         endDate: "2025-03-01",
         applicableTo: "VIP members only"
      },
      {
         id: 6,
         code: "SUMMER30",
         type: "percentage" as const,
         value: 30,
         description: "Summer clearance sale",
         usageLimit: 1000,
         usageCount: 876,
         minPurchase: 0,
         status: "expired" as const,
         startDate: "2024-06-01",
         endDate: "2024-08-31",
         applicableTo: "Summer collection"
      },
   ];

   const [searchQuery, setSearchQuery] = useState("");

   const filteredDiscounts = discounts.filter(d =>
      d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description.toLowerCase().includes(searchQuery.toLowerCase())
   );

   const activeDiscounts = discounts.filter(d => d.status === "active").length;
   const totalUsage = discounts.reduce((acc, d) => acc + d.usageCount, 0);
   const totalSavings = discounts.reduce((acc, d) => {
      if (d.type === "percentage") return acc + (d.usageCount * 25); // Estimated avg
      if (d.type === "fixed") return acc + (d.usageCount * d.value);
      return acc;
   }, 0);

   const stats = [
      { label: "Active Codes", value: activeDiscounts, icon: Tag },
      { label: "Total Uses", value: totalUsage.toLocaleString(), icon: Users },
      { label: "Est. Savings", value: `$${totalSavings.toLocaleString()}`, icon: DollarSign },
   ];

   const getStatusBadge = (status: string) => {
      switch (status) {
         case "active":
            return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Active</Badge>;
         case "expired":
            return <Badge variant="secondary">Expired</Badge>;
         case "scheduled":
            return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Scheduled</Badge>;
         default:
            return <Badge variant="outline">{status}</Badge>;
      }
   };

   const getDiscountDisplay = (discount: typeof discounts[0]) => {
      switch (discount.type) {
         case "percentage":
            return `${discount.value}% off`;
         case "fixed":
            return `$${discount.value} off`;
         case "free_shipping":
            return "Free Shipping";
      }
   };

   const copyCode = (code: string) => {
      navigator.clipboard.writeText(code);
      // In real app, show toast notification
   };

   return (
      <div className="flex flex-1 flex-col gap-6 p-6">
         {/* Header */}
         <div className="flex items-center justify-between">
            <div>
               <h1 className="text-3xl font-bold tracking-tight">Discounts & Promotions</h1>
               <p className="text-muted-foreground">
                  Create and manage discount codes for your customers
               </p>
            </div>
            <Button>
               <Plus className="mr-2 h-4 w-4" />
               Create Discount
            </Button>
         </div>

         {/* Stats */}
         <div className="grid gap-4 md:grid-cols-3">
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

         {/* Filters */}
         <Card>
            <CardContent className="pt-6">
               <div className="flex gap-4">
                  <div className="relative flex-1">
                     <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                     <Input
                        placeholder="Search discount codes..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                     />
                  </div>
                  <Button variant="outline">
                     <Filter className="mr-2 h-4 w-4" />
                     Filter
                  </Button>
               </div>
            </CardContent>
         </Card>

         {/* Discounts Table */}
         <Card>
            <CardHeader>
               <CardTitle>All Discount Codes ({filteredDiscounts.length})</CardTitle>
               <CardDescription>
                  Manage your promotional offers and track their performance
               </CardDescription>
            </CardHeader>
            <CardContent>
               <div className="space-y-4">
                  {filteredDiscounts.map((discount) => (
                     <div
                        key={discount.id}
                        className="flex items-center justify-between border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                     >
                        <div className="flex items-center gap-4">
                           <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Percent className="h-6 w-6 text-primary" />
                           </div>
                           <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                 <code className="text-sm font-mono font-bold bg-secondary px-2 py-0.5 rounded">
                                    {discount.code}
                                 </code>
                                 <button
                                    onClick={() => copyCode(discount.code)}
                                    className="text-muted-foreground hover:text-foreground"
                                    title="Copy code"
                                 >
                                    <Copy className="h-3.5 w-3.5" />
                                 </button>
                                 {getStatusBadge(discount.status)}
                              </div>
                              <p className="text-sm text-muted-foreground">{discount.description}</p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                 <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {discount.endDate ? `Ends ${discount.endDate}` : "No expiry"}
                                 </span>
                                 <span>Min: ${discount.minPurchase}</span>
                                 <span>{discount.applicableTo}</span>
                              </div>
                           </div>
                        </div>
                        <div className="flex items-center gap-6">
                           <div className="text-right">
                              <p className="text-lg font-semibold text-primary">
                                 {getDiscountDisplay(discount)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                 {discount.usageLimit
                                    ? `${discount.usageCount}/${discount.usageLimit} used`
                                    : `${discount.usageCount} used`
                                 }
                              </p>
                              {discount.usageLimit && (
                                 <div className="w-24 h-1.5 bg-secondary rounded-full mt-1">
                                    <div
                                       className="h-full bg-primary rounded-full"
                                       style={{
                                          width: `${Math.min((discount.usageCount / discount.usageLimit) * 100, 100)}%`
                                       }}
                                    />
                                 </div>
                              )}
                           </div>
                           <div className="flex gap-1">
                              <Button variant="ghost" size="icon" title="Edit">
                                 <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" title="Delete" className="text-destructive hover:text-destructive">
                                 <Trash2 className="h-4 w-4" />
                              </Button>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </CardContent>
         </Card>

         {/* Quick Create Presets */}
         <Card>
            <CardHeader>
               <CardTitle>Quick Create</CardTitle>
               <CardDescription>
                  Use these templates to quickly create common discount types
               </CardDescription>
            </CardHeader>
            <CardContent>
               <div className="grid gap-4 md:grid-cols-4">
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                     <Percent className="h-6 w-6" />
                     <span className="text-sm font-medium">Percentage Off</span>
                     <span className="text-xs text-muted-foreground">e.g., 20% off</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                     <DollarSign className="h-6 w-6" />
                     <span className="text-sm font-medium">Fixed Amount</span>
                     <span className="text-xs text-muted-foreground">e.g., $10 off</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                     <Tag className="h-6 w-6" />
                     <span className="text-sm font-medium">Free Shipping</span>
                     <span className="text-xs text-muted-foreground">No delivery fee</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                     <Users className="h-6 w-6" />
                     <span className="text-sm font-medium">Buy X Get Y</span>
                     <span className="text-xs text-muted-foreground">Bundle deals</span>
                  </Button>
               </div>
            </CardContent>
         </Card>
      </div>
   );
}