import {
   Card,
   CardContent,
   CardDescription,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
   TrendingUp,
   DollarSign,
   ShoppingCart,
   Users,
   Package,
   ArrowUpRight,
   ArrowDownRight,
   Eye,
   CreditCard,
   Calendar,
} from "lucide-react";

export default function AnalyticsPage() {
   // Dummy analytics data
   const overviewStats = [
      {
         title: "Total Revenue",
         value: "$45,231.89",
         change: "+20.1%",
         trend: "up" as const,
         icon: DollarSign,
         description: "vs last month",
      },
      {
         title: "Orders",
         value: "2,350",
         change: "+15.2%",
         trend: "up" as const,
         icon: ShoppingCart,
         description: "vs last month",
      },
      {
         title: "Customers",
         value: "1,247",
         change: "+12.5%",
         trend: "up" as const,
         icon: Users,
         description: "vs last month",
      },
      {
         title: "Conversion Rate",
         value: "3.24%",
         change: "-2.1%",
         trend: "down" as const,
         icon: TrendingUp,
         description: "vs last month",
      },
   ];

   // Top selling products
   const topProducts = [
      {
         id: 1,
         name: "Classic White T-Shirt",
         sales: 234,
         revenue: 4679.66,
         growth: 12.5,
      },
      {
         id: 2,
         name: "Slim Fit Jeans",
         sales: 189,
         revenue: 11337.11,
         growth: 8.3,
      },
      {
         id: 3,
         name: "Leather Jacket",
         sales: 156,
         revenue: 31198.44,
         growth: -3.2,
      },
      {
         id: 4,
         name: "Running Shoes",
         sales: 142,
         revenue: 12774.58,
         growth: 15.7,
      },
      {
         id: 5,
         name: "Classic Watch",
         sales: 98,
         revenue: 24499.02,
         growth: 22.1,
      },
   ];

   // Sales by category
   const categoryData = [
      { name: "T-Shirts", sales: 4521, percentage: 28, color: "bg-blue-500" },
      { name: "Pants", sales: 3245, percentage: 20, color: "bg-green-500" },
      { name: "Shoes", sales: 2876, percentage: 18, color: "bg-yellow-500" },
      { name: "Accessories", sales: 2543, percentage: 16, color: "bg-purple-500" },
      { name: "Jackets", sales: 1987, percentage: 12, color: "bg-pink-500" },
      { name: "Other", sales: 965, percentage: 6, color: "bg-gray-500" },
   ];

   // Recent activity / traffic sources
   const trafficSources = [
      { source: "Direct", visits: 12453, percentage: 35, change: 5.2 },
      { source: "Organic Search", visits: 8932, percentage: 25, change: 12.8 },
      { source: "Social Media", visits: 7123, percentage: 20, change: -2.3 },
      { source: "Email", visits: 4521, percentage: 13, change: 8.1 },
      { source: "Referral", visits: 2487, percentage: 7, change: 15.4 },
   ];

   // Monthly revenue data (for chart visualization)
   const monthlyRevenue = [
      { month: "Jan", revenue: 32000 },
      { month: "Feb", revenue: 28500 },
      { month: "Mar", revenue: 35200 },
      { month: "Apr", revenue: 41000 },
      { month: "May", revenue: 38700 },
      { month: "Jun", revenue: 45231 },
   ];

   const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.revenue));

   // Recent orders
   const recentOrders = [
      {
         id: "#ORD-2341",
         customer: "John Doe",
         amount: 129.99,
         status: "completed",
         time: "2 min ago",
      },
      {
         id: "#ORD-2340",
         customer: "Jane Smith",
         amount: 89.5,
         status: "processing",
         time: "15 min ago",
      },
      {
         id: "#ORD-2339",
         customer: "Mike Johnson",
         amount: 249.99,
         status: "completed",
         time: "1 hour ago",
      },
      {
         id: "#ORD-2338",
         customer: "Sarah Wilson",
         amount: 175.0,
         status: "shipped",
         time: "2 hours ago",
      },
      {
         id: "#ORD-2337",
         customer: "Tom Brown",
         amount: 59.99,
         status: "pending",
         time: "3 hours ago",
      },
   ];

   return (
      <div className="flex flex-1 flex-col gap-6 p-6">
         {/* Header */}
         <div className="flex items-center justify-between">
            <div>
               <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
               <p className="text-muted-foreground">
                  Track your store performance and insights
               </p>
            </div>
            <div className="flex items-center gap-2">
               <Button variant="outline" size="sm">
                  <Calendar className="mr-2 h-4 w-4" />
                  Last 30 Days
               </Button>
               <Button size="sm">Download Report</Button>
            </div>
         </div>

         {/* Overview Stats */}
         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {overviewStats.map((stat) => (
               <Card key={stat.title}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                     <CardTitle className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                     </CardTitle>
                     <stat.icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                     <div className="text-2xl font-bold">{stat.value}</div>
                     <div className="flex items-center gap-1 text-xs">
                        {stat.trend === "up" ? (
                           <ArrowUpRight className="h-3 w-3 text-green-600" />
                        ) : (
                           <ArrowDownRight className="h-3 w-3 text-red-600" />
                        )}
                        <span
                           className={
                              stat.trend === "up" ? "text-green-600" : "text-red-600"
                           }
                        >
                           {stat.change}
                        </span>
                        <span className="text-muted-foreground">
                           {stat.description}
                        </span>
                     </div>
                  </CardContent>
               </Card>
            ))}
         </div>

         <div className="grid gap-6 lg:grid-cols-7">
            {/* Revenue Chart - Takes 4 columns */}
            <Card className="lg:col-span-4">
               <CardHeader>
                  <CardTitle>Revenue Overview</CardTitle>
                  <CardDescription>Monthly revenue for the last 6 months</CardDescription>
               </CardHeader>
               <CardContent>
                  {/* Simple bar chart visualization */}
                  <div className="flex items-end justify-between gap-2 h-[200px]">
                     {monthlyRevenue.map((data) => (
                        <div key={data.month} className="flex flex-col items-center gap-2 flex-1">
                           <div className="w-full flex flex-col items-center">
                              <span className="text-xs font-medium mb-1">
                                 ${(data.revenue / 1000).toFixed(1)}k
                              </span>
                              <div
                                 className="w-full max-w-[40px] bg-primary rounded-t-md transition-all"
                                 style={{
                                    height: `${(data.revenue / maxRevenue) * 150}px`,
                                 }}
                              />
                           </div>
                           <span className="text-xs text-muted-foreground">
                              {data.month}
                           </span>
                        </div>
                     ))}
                  </div>
               </CardContent>
            </Card>

            {/* Sales by Category - Takes 3 columns */}
            <Card className="lg:col-span-3">
               <CardHeader>
                  <CardTitle>Sales by Category</CardTitle>
                  <CardDescription>Product category distribution</CardDescription>
               </CardHeader>
               <CardContent className="space-y-4">
                  {categoryData.map((category) => (
                     <div key={category.name} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                           <span>{category.name}</span>
                           <span className="text-muted-foreground">
                              {category.sales.toLocaleString()} ({category.percentage}%)
                           </span>
                        </div>
                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                           <div
                              className={`h-full ${category.color} rounded-full`}
                              style={{ width: `${category.percentage}%` }}
                           />
                        </div>
                     </div>
                  ))}
               </CardContent>
            </Card>
         </div>

         <div className="grid gap-6 lg:grid-cols-3">
            {/* Top Products */}
            <Card className="lg:col-span-2">
               <CardHeader>
                  <CardTitle>Top Selling Products</CardTitle>
                  <CardDescription>Best performing products this month</CardDescription>
               </CardHeader>
               <CardContent>
                  <div className="space-y-4">
                     {topProducts.map((product, index) => (
                        <div
                           key={product.id}
                           className="flex items-center justify-between"
                        >
                           <div className="flex items-center gap-4">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                                 {index + 1}
                              </div>
                              <div>
                                 <p className="text-sm font-medium">{product.name}</p>
                                 <p className="text-xs text-muted-foreground">
                                    {product.sales} sales
                                 </p>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className="text-sm font-medium">
                                 ${product.revenue.toLocaleString()}
                              </p>
                              <div className="flex items-center justify-end gap-1 text-xs">
                                 {product.growth >= 0 ? (
                                    <ArrowUpRight className="h-3 w-3 text-green-600" />
                                 ) : (
                                    <ArrowDownRight className="h-3 w-3 text-red-600" />
                                 )}
                                 <span
                                    className={
                                       product.growth >= 0
                                          ? "text-green-600"
                                          : "text-red-600"
                                    }
                                 >
                                    {product.growth > 0 ? "+" : ""}
                                    {product.growth}%
                                 </span>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </CardContent>
            </Card>

            {/* Traffic Sources */}
            <Card>
               <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                     <Eye className="h-5 w-5" />
                     Traffic Sources
                  </CardTitle>
                  <CardDescription>Where visitors come from</CardDescription>
               </CardHeader>
               <CardContent className="space-y-4">
                  {trafficSources.map((source) => (
                     <div
                        key={source.source}
                        className="flex items-center justify-between"
                     >
                        <div>
                           <p className="text-sm font-medium">{source.source}</p>
                           <p className="text-xs text-muted-foreground">
                              {source.visits.toLocaleString()} visits
                           </p>
                        </div>
                        <div className="flex items-center gap-2">
                           <Badge variant="secondary">{source.percentage}%</Badge>
                           <span
                              className={`text-xs ${source.change >= 0 ? "text-green-600" : "text-red-600"}`}
                           >
                              {source.change > 0 ? "+" : ""}
                              {source.change}%
                           </span>
                        </div>
                     </div>
                  ))}
               </CardContent>
            </Card>
         </div>

         {/* Recent Orders */}
         <Card>
            <CardHeader>
               <div className="flex items-center justify-between">
                  <div>
                     <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Recent Orders
                     </CardTitle>
                     <CardDescription>Latest transactions in real-time</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                     View All
                  </Button>
               </div>
            </CardHeader>
            <CardContent>
               <div className="space-y-4">
                  {recentOrders.map((order) => (
                     <div
                        key={order.id}
                        className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                     >
                        <div className="flex items-center gap-4">
                           <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                              <Package className="h-5 w-5 text-muted-foreground" />
                           </div>
                           <div>
                              <p className="text-sm font-medium">{order.id}</p>
                              <p className="text-xs text-muted-foreground">
                                 {order.customer}
                              </p>
                           </div>
                        </div>
                        <div className="flex items-center gap-4">
                           <div className="text-right">
                              <p className="text-sm font-medium">
                                 ${order.amount.toFixed(2)}
                              </p>
                              <p className="text-xs text-muted-foreground">{order.time}</p>
                           </div>
                           <Badge
                              variant={
                                 order.status === "completed"
                                    ? "default"
                                    : order.status === "processing"
                                       ? "secondary"
                                       : order.status === "shipped"
                                          ? "outline"
                                          : "destructive"
                              }
                           >
                              {order.status}
                           </Badge>
                        </div>
                     </div>
                  ))}
               </div>
            </CardContent>
         </Card>
      </div>
   );
}