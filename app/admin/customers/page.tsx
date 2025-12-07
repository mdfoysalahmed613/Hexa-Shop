import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Search, Filter, Mail, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function CustomersPage() {

   // Mock customers data
   const customers = [
      { id: 1, name: "John Doe", email: "john@example.com", orders: 12, spent: 1249.88, joined: "2024-01-15", role: "user" },
      { id: 2, name: "Jane Smith", email: "jane@example.com", orders: 8, spent: 679.92, joined: "2024-02-20", role: "user" },
      { id: 3, name: "Mike Johnson", email: "mike@example.com", orders: 15, spent: 1899.85, joined: "2023-11-10", role: "user" },
      { id: 4, name: "Sarah Wilson", email: "sarah@example.com", orders: 5, spent: 425.00, joined: "2024-03-05", role: "user" },
      { id: 5, name: "Admin User", email: "admin@hexashop.com", orders: 0, spent: 0, joined: "2023-10-01", role: "admin" },
   ];

   return (
      <div className="flex flex-1 flex-col gap-4 p-6">
         <div className="flex items-center justify-between">
            <div>
               <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
               <p className="text-muted-foreground">
                  Manage your customer accounts
               </p>
            </div>
         </div>

         {/* Stats */}
         <div className="grid gap-4 md:grid-cols-3">
            <Card>
               <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                     Total Customers
                  </CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="text-2xl font-bold">{customers.length}</div>
               </CardContent>
            </Card>
            <Card>
               <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                     Active This Month
                  </CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="text-2xl font-bold">{customers.filter(c => c.orders > 0).length}</div>
               </CardContent>
            </Card>
            <Card>
               <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                     Avg. Orders per Customer
                  </CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="text-2xl font-bold">
                     {(customers.reduce((sum, c) => sum + c.orders, 0) / customers.length).toFixed(1)}
                  </div>
               </CardContent>
            </Card>
         </div>

         {/* Filters */}
         <Card>
            <CardContent className="pt-6">
               <div className="flex gap-4">
                  <div className="relative flex-1">
                     <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                     <Input placeholder="Search customers..." className="pl-8" />
                  </div>
                  <Button variant="outline">
                     <Filter className="mr-2 h-4 w-4" />
                     Filter
                  </Button>
               </div>
            </CardContent>
         </Card>

         {/* Customers Table */}
         <Card>
            <CardHeader>
               <CardTitle>All Customers</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="space-y-4">
                  {customers.map((customer) => (
                     <div key={customer.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                        <div className="flex items-center gap-4">
                           <Avatar className="h-12 w-12">
                              <AvatarFallback>
                                 {customer.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                              </AvatarFallback>
                           </Avatar>
                           <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                 <p className="text-sm font-medium">{customer.name}</p>
                                 {customer.role === "admin" && (
                                    <Badge variant="default" className="flex items-center gap-1">
                                       <Shield className="h-3 w-3" />
                                       Admin
                                    </Badge>
                                 )}
                              </div>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                 <Mail className="h-3 w-3" />
                                 {customer.email}
                              </p>
                           </div>
                        </div>
                        <div className="flex items-center gap-4">
                           <div className="text-right">
                              <p className="text-sm font-medium">{customer.orders} orders</p>
                              <p className="text-xs text-muted-foreground">${customer.spent.toFixed(2)} spent</p>
                           </div>
                           <div className="text-right">
                              <p className="text-xs text-muted-foreground">Joined</p>
                              <p className="text-xs font-medium">{customer.joined}</p>
                           </div>
                           <Button variant="ghost" size="sm">View</Button>
                        </div>
                     </div>
                  ))}
               </div>
            </CardContent>
         </Card>
      </div>
   );
}
