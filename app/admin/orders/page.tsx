import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Search, Filter, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function OrdersPage() {

   // Mock orders data
   const orders = [
      { id: "#ORD-001", customer: "John Doe", email: "john@example.com", total: 129.99, status: "completed", items: 3, date: "2024-12-02" },
      { id: "#ORD-002", customer: "Jane Smith", email: "jane@example.com", total: 89.50, status: "processing", items: 2, date: "2024-12-02" },
      { id: "#ORD-003", customer: "Mike Johnson", email: "mike@example.com", total: 199.99, status: "pending", items: 1, date: "2024-12-01" },
      { id: "#ORD-004", customer: "Sarah Wilson", email: "sarah@example.com", total: 75.00, status: "completed", items: 4, date: "2024-12-01" },
      { id: "#ORD-005", customer: "Tom Brown", email: "tom@example.com", total: 249.99, status: "shipped", items: 2, date: "2024-11-30" },
      { id: "#ORD-006", customer: "Lisa Davis", email: "lisa@example.com", total: 159.00, status: "cancelled", items: 3, date: "2024-11-30" },
   ];

   const stats = [
      { label: "Total Orders", value: orders.length },
      { label: "Pending", value: orders.filter(o => o.status === "pending").length },
      { label: "Processing", value: orders.filter(o => o.status === "processing").length },
      { label: "Completed", value: orders.filter(o => o.status === "completed").length },
   ];

   return (
      <div className="flex flex-1 flex-col gap-4 p-6">
         <div className="flex items-center justify-between">
            <div>
               <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
               <p className="text-muted-foreground">
                  Manage and track customer orders
               </p>
            </div>
         </div>

         {/* Stats */}
         <div className="grid gap-4 md:grid-cols-4">
            {stats.map((stat) => (
               <Card key={stat.label}>
                  <CardHeader className="pb-2">
                     <CardTitle className="text-sm font-medium text-muted-foreground">
                        {stat.label}
                     </CardTitle>
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
                     <Input placeholder="Search orders..." className="pl-8" />
                  </div>
                  <Button variant="outline">
                     <Filter className="mr-2 h-4 w-4" />
                     Filter
                  </Button>
               </div>
            </CardContent>
         </Card>

         {/* Orders Table */}
         <Card>
            <CardHeader>
               <CardTitle>All Orders</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="space-y-4">
                  {orders.map((order) => (
                     <div key={order.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                        <div className="flex items-center gap-4">
                           <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center">
                              <ShoppingCart className="h-6 w-6 text-muted-foreground" />
                           </div>
                           <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                 <p className="text-sm font-medium">{order.id}</p>
                                 <Badge variant={
                                    order.status === "completed" ? "default" :
                                       order.status === "processing" ? "secondary" :
                                          order.status === "shipped" ? "default" :
                                             order.status === "cancelled" ? "destructive" : "outline"
                                 }>
                                    {order.status}
                                 </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">{order.customer} • {order.email}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-4">
                           <div className="text-right">
                              <p className="text-sm font-medium">${order.total}</p>
                              <p className="text-xs text-muted-foreground">{order.items} items • {order.date}</p>
                           </div>
                           <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                           </Button>
                        </div>
                     </div>
                  ))}
               </div>
            </CardContent>
         </Card>
      </div>
   );
}
