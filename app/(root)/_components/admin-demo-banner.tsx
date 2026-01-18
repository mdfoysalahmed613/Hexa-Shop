"use client";

/**
 * Admin Demo Banner
 *
 * A prominent banner/card on the landing page that informs visitors
 * about the admin panel demo feature. Shows different CTAs based on
 * auth and role state:
 *
 * - Not logged in: Login to try admin demo
 * - Logged in (no admin): Become Demo Admin button
 * - Has admin access: Go to Admin Dashboard
 */

import Link from "next/link";
import { Shield, ArrowRight, Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/providers/user-provider";
import { hasAdminAccess } from "@/lib/auth/roles";
import { BecomeDemoAdminButton } from "./become-demo-admin-button";

export function AdminDemoBanner() {
   const { user, isLoading } = useUser();
   const userHasAdminAccess = user ? hasAdminAccess(user) : false;

   return (
      <section className="container mx-auto px-4 py-12 md:py-16">
         <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/10">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-48 h-48 bg-primary/5 rounded-full blur-2xl" />

            <CardContent className="relative p-6 md:p-10">
               <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                     <div className="flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
                        <Shield className="h-8 w-8 md:h-10 md:w-10 text-primary" />
                     </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 text-center md:text-left space-y-3">
                     <div className="flex flex-col md:flex-row md:items-center gap-2">
                        <h2 className="text-xl md:text-2xl font-bold">
                           Explore the Admin Dashboard
                        </h2>
                        <Badge variant="secondary" className="w-fit mx-auto md:mx-0">
                           <Sparkles className="mr-1 h-3 w-3" />
                           Demo Available
                        </Badge>
                     </div>
                     <p className="text-muted-foreground max-w-2xl">
                        This project includes a full-featured admin panel. Try the demo admin
                        mode to explore product management, order tracking, customer analytics,
                        and more — without deleting real data.
                     </p>
                     <ul className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <li className="flex items-center gap-1">
                           <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                           Product Management
                        </li>
                        <li className="flex items-center gap-1">
                           <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                           Order Tracking
                        </li>
                        <li className="flex items-center gap-1">
                           <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                           Customer Analytics
                        </li>
                        <li className="flex items-center gap-1">
                           <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                           Settings & More
                        </li>
                     </ul>
                  </div>

                  {/* CTA */}
                  <div className="flex-shrink-0">
                     {isLoading ? (
                        <Button size="lg" disabled>
                           <Lock className="mr-2 h-4 w-4" />
                           Loading...
                        </Button>
                     ) : !user ? (
                        <Button size="lg" asChild>
                           <Link href="/auth?redirect=/admin&demo=true">
                              <Lock className="mr-2 h-4 w-4" />
                              Login to Try Demo
                              <ArrowRight className="ml-2 h-4 w-4" />
                           </Link>
                        </Button>
                     ) : userHasAdminAccess ? (
                        <Button size="lg" asChild>
                           <Link href="/admin">
                              <Shield className="mr-2 h-4 w-4" />
                              Go to Admin
                              <ArrowRight className="ml-2 h-4 w-4" />
                           </Link>
                        </Button>
                     ) : (
                        <BecomeDemoAdminButton />
                     )}
                  </div>
               </div>
            </CardContent>
         </Card>
      </section>
   );
}
