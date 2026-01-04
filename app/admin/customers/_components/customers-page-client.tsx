"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
   Users,
   Shield,
   ShieldCheck,
   UserCheck,
} from "lucide-react";
import { useCustomers } from "@/hooks/use-customers";
import { StatsCards } from "@/components/shared/stats-cards";
import { DataTable } from "@/components/ui/data-table";
import type { Customer } from "@/lib/services/customers";

// ============================================================================
// Helper Functions
// ============================================================================

function getInitials(name: string | null, email: string): string {
   if (name) {
      const parts = name.split(" ");
      return parts
         .slice(0, 2)
         .map((p) => p[0])
         .join("")
         .toUpperCase();
   }
   return email.charAt(0).toUpperCase();
}

function getRoleBadge(role: string) {
   switch (role) {
      case "admin":
         return { label: "Admin", variant: "default" as const };
      case "demo_admin":
         return { label: "Demo Admin", variant: "secondary" as const };
      default:
         return { label: "Customer", variant: "outline" as const };
   }
}

// ============================================================================
// Columns
// ============================================================================

const columns: ColumnDef<Customer>[] = [
   {
      accessorKey: "full_name",
      header: "Customer",
      cell: ({ row }) => {
         const customer = row.original;
         const initials = getInitials(customer.full_name, customer.email);

         return (
            <div className="flex items-center gap-3">
               <Avatar className="h-10 w-10">
                  {customer.avatar_url && (
                     <AvatarImage
                        src={customer.avatar_url}
                        alt={customer.full_name || customer.email}
                     />
                  )}
                  <AvatarFallback className="bg-primary/10 text-primary">
                     {initials}
                  </AvatarFallback>
               </Avatar>
               <div>
                  <p className="font-medium">
                     {customer.full_name || "Unnamed User"}
                  </p>
                  <p className="text-sm text-muted-foreground">{customer.email}</p>
               </div>
            </div>
         );
      },
   },
   {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
         const roleBadge = getRoleBadge(row.original.role);
         return <Badge variant={roleBadge.variant}>{roleBadge.label}</Badge>;
      },
   },
   {
      accessorKey: "email_confirmed_at",
      header: "Status",
      cell: ({ row }) => {
         const confirmed = row.original.email_confirmed_at;
         return confirmed ? (
            <Badge variant="outline" className="border-green-500 text-green-600">
               Verified
            </Badge>
         ) : (
            <Badge variant="outline" className="border-orange-500 text-orange-600">
               Unverified
            </Badge>
         );
      },
   },
   {
      accessorKey: "created_at",
      header: "Joined",
      cell: ({ row }) => {
         return format(new Date(row.original.created_at), "MMM d, yyyy");
      },
   },
   {
      accessorKey: "last_sign_in_at",
      header: "Last Active",
      cell: ({ row }) => {
         const date = row.original.last_sign_in_at;
         if (!date) return <span className="text-muted-foreground">Never</span>;
         return format(new Date(date), "MMM d, yyyy");
      },
   },
];

// ============================================================================
// Component
// ============================================================================

export function CustomersPageClient() {
   const { data: customers = [], isLoading } = useCustomers();

   // Stats
   const stats = useMemo(() => {
      const totalCustomers = customers.filter((c) => c.role === "user").length;
      const admins = customers.filter((c) => c.role === "admin").length;
      const demoAdmins = customers.filter((c) => c.role === "demo_admin").length;
      const verified = customers.filter((c) => c.email_confirmed_at).length;

      return { totalCustomers, admins, demoAdmins, verified };
   }, [customers]);

   // Build stats items
   const statsItems = useMemo(
      () => [
         {
            label: "Total Customers",
            value: stats.totalCustomers,
            icon: Users,
            color: "default" as const,
         },
         {
            label: "Admins",
            value: stats.admins,
            icon: ShieldCheck,
            color: "success" as const,
         },
         {
            label: "Demo Admins",
            value: stats.demoAdmins,
            icon: Shield,
            color: "warning" as const,
         },
         {
            label: "Verified",
            value: stats.verified,
            icon: UserCheck,
            color: "success" as const,
         },
      ],
      [stats]
   );

   return (
      <div className="flex flex-1 flex-col gap-6 p-6">
         {/* Header */}
         <div className="flex items-center justify-between">
            <div>
               <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
               <p className="text-muted-foreground">
                  Manage your customer accounts
               </p>
            </div>
         </div>

         {/* Stats Cards */}
         <StatsCards stats={statsItems} isLoading={isLoading} />

         {/* Customers Table */}
         <Card>
            <CardHeader>
               <CardTitle>All Users ({customers.length})</CardTitle>
            </CardHeader>
            <CardContent>
               {isLoading ? (
                  <div className="space-y-4">
                     {[...Array(5)].map((_, i) => (
                        <div
                           key={i}
                           className="flex items-center justify-between rounded-lg border p-4"
                        >
                           <div className="flex items-center gap-4">
                              <Skeleton className="h-10 w-10 rounded-full" />
                              <div className="space-y-2">
                                 <Skeleton className="h-4 w-32" />
                                 <Skeleton className="h-3 w-48" />
                              </div>
                           </div>
                           <Skeleton className="h-6 w-20" />
                        </div>
                     ))}
                  </div>
               ) : (
                  <DataTable columns={columns} data={customers} pageSize={10} />
               )}
            </CardContent>
         </Card>
      </div>
   );
}
