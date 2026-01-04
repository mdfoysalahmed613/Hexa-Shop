"use client";

/**
 * Customers Page Client Component
 *
 * Admin panel page displaying all users with stats and table.
 * Includes search, sorting, and admin actions (make admin, delete).
 *
 * Features:
 * - Stats cards showing user role breakdown
 * - Searchable by name and email
 * - Sortable by join date
 * - Actions: Make Admin (admin only), Delete User (admin only)
 */

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
   Users,
   Shield,
   ShieldCheck,
   UserCheck,
   MoreHorizontal,
   Search,
   ShieldPlus,
   Trash2,
   ArrowUpDown,
} from "lucide-react";
import { useCustomers, useMakeAdmin, useDeleteCustomer } from "@/hooks/use-customers";
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
// Actions Cell Component
// ============================================================================

interface ActionsCellProps {
   customer: Customer;
   onMakeAdmin: (customer: Customer) => void;
   onDelete: (customer: Customer) => void;
}

function ActionsCell({ customer, onMakeAdmin, onDelete }: ActionsCellProps) {

   const handleMakeAdmin = () => {
      onMakeAdmin(customer);
   };

   const handleDelete = () => {
      onDelete(customer);
   };

   return (
      <DropdownMenu>
         <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
               <span className="sr-only">Open menu</span>
               <MoreHorizontal className="h-4 w-4" />
            </Button>
         </DropdownMenuTrigger>
         <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleMakeAdmin} >
               <ShieldPlus className="mr-2 h-4 w-4" />
               Make Admin
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
               onClick={handleDelete}
               variant="destructive"
            >
               <Trash2 className="mr-2 h-4 w-4" />
               Delete User
            </DropdownMenuItem>
         </DropdownMenuContent>
      </DropdownMenu>
   );
}

// ============================================================================
// Component
// ============================================================================

export function CustomersPageClient() {
   const { data: customers = [], isLoading } = useCustomers();
   const makeAdminMutation = useMakeAdmin();
   const deleteCustomerMutation = useDeleteCustomer();

   // Search state
   const [searchQuery, setSearchQuery] = useState("");

   // Delete confirmation dialog state
   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
   const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

   // Filter customers by search query
   const filteredCustomers = customers.filter((customer) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      const name = customer.full_name?.toLowerCase() || "";
      const email = customer.email.toLowerCase();
      return name.includes(query) || email.includes(query);
   });

   // Stats - computed directly from filtered data (TanStack Query handles caching)
   const totalCustomers = customers.filter((c) => c.role === "user").length;
   const admins = customers.filter((c) => c.role === "admin").length;
   const demoAdmins = customers.filter((c) => c.role === "demo_admin").length;
   const verified = customers.filter((c) => c.email_confirmed_at).length;

   const statsItems = [
      {
         label: "Total Customers",
         value: totalCustomers,
         icon: Users,
         color: "default" as const,
      },
      {
         label: "Admins",
         value: admins,
         icon: ShieldCheck,
         color: "success" as const,
      },
      {
         label: "Demo Admins",
         value: demoAdmins,
         icon: Shield,
         color: "warning" as const,
      },
      {
         label: "Verified",
         value: verified,
         icon: UserCheck,
         color: "success" as const,
      },
   ];

   // Action handlers
   const handleMakeAdmin = (customer: Customer) => {
      makeAdminMutation.mutate(customer.id);
   };

   const handleDeleteClick = (customer: Customer) => {
      setCustomerToDelete(customer);
      setDeleteDialogOpen(true);
   };

   const handleDeleteConfirm = () => {
      if (customerToDelete) {
         deleteCustomerMutation.mutate(customerToDelete.id);
      }
      setDeleteDialogOpen(false);
      setCustomerToDelete(null);
   };

   // Columns with actions
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
         header: ({ column }) => {
            return (
               <Button
                  variant="ghost"
                  onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                  className="-ml-4"
               >
                  Joined
                  <ArrowUpDown className="ml-2 h-4 w-4" />
               </Button>
            );
         },
         cell: ({ row }) => {
            return format(new Date(row.original.created_at), "MMM d, yyyy");
         },
      },
      {
         id: "actions",
         header: "Actions",
         cell: ({ row }) => (
            <ActionsCell
               customer={row.original}
               onMakeAdmin={handleMakeAdmin}
               onDelete={handleDeleteClick}
            />
         ),
      },
   ];

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
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
               <CardTitle>All Users ({filteredCustomers.length})</CardTitle>
               <div className="relative w-72">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                     placeholder="Search by name or email..."
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="pl-9"
                  />
               </div>
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
                  <DataTable columns={columns} data={filteredCustomers} pageSize={10} />
               )}
            </CardContent>
         </Card>

         {/* Delete Confirmation Dialog */}
         <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
               <AlertDialogHeader>
                  <AlertDialogTitle>Delete User</AlertDialogTitle>
                  <AlertDialogDescription>
                     Are you sure you want to delete{" "}
                     <span className="font-semibold">
                        {customerToDelete?.full_name || customerToDelete?.email}
                     </span>
                     ? This action cannot be undone.
                  </AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                     onClick={handleDeleteConfirm}
                     className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                     Delete
                  </AlertDialogAction>
               </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>
      </div>
   );
}
