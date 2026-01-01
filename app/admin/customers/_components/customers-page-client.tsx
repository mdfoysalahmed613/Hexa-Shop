"use client";

import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
   Users,
   Search,
   Shield,
   ShieldCheck,
   UserCheck,
   X,
   ChevronLeft,
   ChevronRight,
   ChevronsLeft,
   ChevronsRight,
   Mail,
   Calendar,
   Clock,
} from "lucide-react";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useCustomers } from "@/hooks/use-customers";
import { StatsCards } from "@/components/shared/stats-cards";

type RoleFilter = "all" | "user" | "admin" | "demo_admin";
type StatusFilter = "all" | "verified" | "unverified";

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100] as const;
type ItemsPerPage = (typeof ITEMS_PER_PAGE_OPTIONS)[number];

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

function formatDate(date: string | null): string {
   if (!date) return "Never";
   return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
   });
}

function formatRelativeTime(date: string | null): string {
   if (!date) return "Never";
   const now = new Date();
   const then = new Date(date);
   const diffMs = now.getTime() - then.getTime();
   const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

   if (diffDays === 0) return "Today";
   if (diffDays === 1) return "Yesterday";
   if (diffDays < 7) return `${diffDays} days ago`;
   if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
   if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
   return `${Math.floor(diffDays / 365)} years ago`;
}

export function CustomersPageClient() {
   const [searchQuery, setSearchQueryState] = useState("");
   const [roleFilter, setRoleFilterState] = useState<RoleFilter>("all");
   const [statusFilter, setStatusFilterState] = useState<StatusFilter>("all");
   const [currentPage, setCurrentPage] = useState(1);
   const [itemsPerPage, setItemsPerPage] = useState<ItemsPerPage>(10);

   const { data: customers = [], isLoading } = useCustomers();

   // Wrapper setters that also reset page
   const setSearchQuery = useCallback((value: string) => {
      setSearchQueryState(value);
      setCurrentPage(1);
   }, []);

   const setRoleFilter = useCallback((value: RoleFilter) => {
      setRoleFilterState(value);
      setCurrentPage(1);
   }, []);

   const setStatusFilter = useCallback((value: StatusFilter) => {
      setStatusFilterState(value);
      setCurrentPage(1);
   }, []);

   // Filter customers
   const filteredCustomers = useMemo(() => {
      return customers.filter((customer) => {
         // Search filter
         const query = searchQuery.toLowerCase();
         const matchesSearch =
            searchQuery === "" ||
            customer.email.toLowerCase().includes(query) ||
            customer.full_name?.toLowerCase().includes(query);

         // Role filter
         const matchesRole =
            roleFilter === "all" || customer.role === roleFilter;

         // Status filter (verified = email confirmed)
         const matchesStatus =
            statusFilter === "all" ||
            (statusFilter === "verified" && customer.email_confirmed_at) ||
            (statusFilter === "unverified" && !customer.email_confirmed_at);

         return matchesSearch && matchesRole && matchesStatus;
      });
   }, [customers, searchQuery, roleFilter, statusFilter]);

   // Pagination calculations
   const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
   const startIndex = (currentPage - 1) * itemsPerPage;
   const endIndex = startIndex + itemsPerPage;
   const paginatedCustomers = useMemo(() => {
      return filteredCustomers.slice(startIndex, endIndex);
   }, [filteredCustomers, startIndex, endIndex]);

   // Stats
   const stats = useMemo(() => {
      const totalCustomers = customers.filter((c) => c.role === "user").length;
      const admins = customers.filter((c) => c.role === "admin").length;
      const demoAdmins = customers.filter((c) => c.role === "demo_admin").length;
      const verified = customers.filter((c) => c.email_confirmed_at).length;

      return { totalCustomers, admins, demoAdmins, verified };
   }, [customers]);

   const clearFilters = () => {
      setSearchQueryState("");
      setRoleFilterState("all");
      setStatusFilterState("all");
      setCurrentPage(1);
   };

   const handleItemsPerPageChange = (value: string) => {
      setItemsPerPage(parseInt(value) as ItemsPerPage);
      setCurrentPage(1);
   };

   const hasActiveFilters =
      searchQuery !== "" || roleFilter !== "all" || statusFilter !== "all";

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
            <CardHeader className="border-b">
               <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle>All Users</CardTitle>

                  {/* Search & Filters */}
                  <div className="flex flex-wrap items-center gap-2">
                     <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                           value={searchQuery}
                           placeholder="Search by name or email..."
                           onChange={(e) => setSearchQuery(e.target.value)}
                           className="pl-9"
                        />
                     </div>

                     {/* Role Filter */}
                     <Select
                        value={roleFilter}
                        onValueChange={(value) => setRoleFilter(value as RoleFilter)}
                     >
                        <SelectTrigger className="w-36">
                           <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent>
                           <SelectItem value="all">All Roles</SelectItem>
                           <SelectItem value="user">Customers</SelectItem>
                           <SelectItem value="admin">Admins</SelectItem>
                           <SelectItem value="demo_admin">Demo Admins</SelectItem>
                        </SelectContent>
                     </Select>

                     {/* Status Filter */}
                     <Select
                        value={statusFilter}
                        onValueChange={(value) =>
                           setStatusFilter(value as StatusFilter)
                        }
                     >
                        <SelectTrigger className="w-36">
                           <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                           <SelectItem value="all">All Status</SelectItem>
                           <SelectItem value="verified">Verified</SelectItem>
                           <SelectItem value="unverified">Unverified</SelectItem>
                        </SelectContent>
                     </Select>

                     {hasActiveFilters && (
                        <Button
                           variant="ghost"
                           size="sm"
                           onClick={clearFilters}
                           className="h-9 gap-1 text-xs"
                        >
                           <X className="h-3 w-3" />
                           Clear
                        </Button>
                     )}
                  </div>
               </div>
            </CardHeader>

            <CardContent className="p-0">
               {/* Results Count & Items Per Page */}
               <div className="flex items-center justify-between border-b px-6 py-3">
                  {isLoading ? (
                     <Skeleton className="h-4 w-40" />
                  ) : (
                     <p className="text-sm text-muted-foreground">
                        Showing{" "}
                        <span className="font-medium text-foreground">
                           {filteredCustomers.length > 0 ? startIndex + 1 : 0}
                        </span>{" "}
                        -{" "}
                        <span className="font-medium text-foreground">
                           {Math.min(endIndex, filteredCustomers.length)}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium text-foreground">
                           {filteredCustomers.length}
                        </span>{" "}
                        users
                     </p>
                  )}
                  <div className="flex items-center gap-2">
                     <span className="text-sm text-muted-foreground">Per page:</span>
                     <Select
                        value={itemsPerPage.toString()}
                        onValueChange={handleItemsPerPageChange}
                     >
                        <SelectTrigger className="h-8 w-20">
                           <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                           {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                              <SelectItem key={option} value={option.toString()}>
                                 {option}
                              </SelectItem>
                           ))}
                        </SelectContent>
                     </Select>
                  </div>
               </div>

               {/* Customers List */}
               <div className="p-4">
                  {isLoading ? (
                     <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                           <div
                              key={i}
                              className="flex items-center justify-between rounded-lg border p-4"
                           >
                              <div className="flex items-center gap-4">
                                 <Skeleton className="h-12 w-12 rounded-full" />
                                 <div className="space-y-2">
                                    <Skeleton className="h-5 w-40" />
                                    <Skeleton className="h-4 w-48" />
                                 </div>
                              </div>
                              <div className="flex items-center gap-4">
                                 <Skeleton className="h-4 w-24" />
                                 <Skeleton className="h-6 w-20" />
                              </div>
                           </div>
                        ))}
                     </div>
                  ) : filteredCustomers.length === 0 ? (
                     <div className="flex flex-col items-center justify-center py-12">
                        <div className="rounded-full bg-muted p-4">
                           <Users className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold">
                           {hasActiveFilters ? "No users found" : "No users yet"}
                        </h3>
                        <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
                           {hasActiveFilters
                              ? "Try adjusting your filters to find what you're looking for."
                              : "Users will appear here when they sign up."}
                        </p>
                        {hasActiveFilters && (
                           <Button
                              variant="outline"
                              onClick={clearFilters}
                              className="mt-4"
                           >
                              Clear Filters
                           </Button>
                        )}
                     </div>
                  ) : (
                     <div className="space-y-3">
                        {paginatedCustomers.map((customer) => {
                           const roleBadge = getRoleBadge(customer.role);
                           const initials = getInitials(
                              customer.full_name,
                              customer.email
                           );

                           return (
                              <div
                                 key={customer.id}
                                 className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                              >
                                 <div className="flex items-center gap-4">
                                    <Avatar className="h-12 w-12">
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
                                    <div className="space-y-1">
                                       <p className="font-medium">
                                          {customer.full_name || "Unnamed User"}
                                       </p>
                                       <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                          <Mail className="h-3 w-3" />
                                          {customer.email}
                                       </div>
                                    </div>
                                 </div>

                                 <div className="flex items-center gap-6">
                                    <div className="hidden text-right sm:block">
                                       <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                          <Calendar className="h-3 w-3" />
                                          Joined {formatDate(customer.created_at)}
                                       </div>
                                       <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                                          <Clock className="h-3 w-3" />
                                          Last active:{" "}
                                          {formatRelativeTime(customer.last_sign_in_at)}
                                       </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                       <Badge variant={roleBadge.variant}>
                                          {roleBadge.label}
                                       </Badge>
                                       {customer.email_confirmed_at ? (
                                          <Badge
                                             variant="outline"
                                             className="border-green-500 text-green-600"
                                          >
                                             Verified
                                          </Badge>
                                       ) : (
                                          <Badge
                                             variant="outline"
                                             className="border-orange-500 text-orange-600"
                                          >
                                             Unverified
                                          </Badge>
                                       )}
                                    </div>
                                 </div>
                              </div>
                           );
                        })}
                     </div>
                  )}
               </div>

               {/* Pagination Controls */}
               {filteredCustomers.length > 0 && totalPages > 1 && (
                  <div className="flex items-center justify-between border-t px-6 py-4">
                     <p className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                     </p>
                     <div className="flex items-center gap-1">
                        <Button
                           variant="outline"
                           size="icon"
                           className="h-8 w-8"
                           disabled={currentPage === 1}
                           onClick={() => setCurrentPage(1)}
                        >
                           <ChevronsLeft className="h-4 w-4" />
                           <span className="sr-only">First page</span>
                        </Button>
                        <Button
                           variant="outline"
                           size="icon"
                           className="h-8 w-8"
                           disabled={currentPage === 1}
                           onClick={() => setCurrentPage((p) => p - 1)}
                        >
                           <ChevronLeft className="h-4 w-4" />
                           <span className="sr-only">Previous page</span>
                        </Button>

                        {/* Page Number Buttons */}
                        <div className="flex items-center gap-1">
                           {Array.from({ length: totalPages }, (_, i) => i + 1)
                              .filter((page) => {
                                 return (
                                    page === 1 ||
                                    page === totalPages ||
                                    Math.abs(page - currentPage) <= 1
                                 );
                              })
                              .reduce<(number | "ellipsis")[]>((acc, page, idx, arr) => {
                                 if (idx > 0) {
                                    const prevPage = arr[idx - 1];
                                    if (page - prevPage > 1) {
                                       acc.push("ellipsis");
                                    }
                                 }
                                 acc.push(page);
                                 return acc;
                              }, [])
                              .map((item, idx) =>
                                 item === "ellipsis" ? (
                                    <span
                                       key={`ellipsis-${idx}`}
                                       className="px-2 text-muted-foreground"
                                    >
                                       …
                                    </span>
                                 ) : (
                                    <Button
                                       key={item}
                                       variant={currentPage === item ? "default" : "outline"}
                                       size="icon"
                                       className="h-8 w-8"
                                       onClick={() => setCurrentPage(item)}
                                    >
                                       {item}
                                    </Button>
                                 )
                              )}
                        </div>

                        <Button
                           variant="outline"
                           size="icon"
                           className="h-8 w-8"
                           disabled={currentPage === totalPages}
                           onClick={() => setCurrentPage((p) => p + 1)}
                        >
                           <ChevronRight className="h-4 w-4" />
                           <span className="sr-only">Next page</span>
                        </Button>
                        <Button
                           variant="outline"
                           size="icon"
                           className="h-8 w-8"
                           disabled={currentPage === totalPages}
                           onClick={() => setCurrentPage(totalPages)}
                        >
                           <ChevronsRight className="h-4 w-4" />
                           <span className="sr-only">Last page</span>
                        </Button>
                     </div>
                  </div>
               )}
            </CardContent>
         </Card>
      </div>
   );
}
