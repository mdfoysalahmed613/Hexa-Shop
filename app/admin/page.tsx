import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Package, ShoppingCart, DollarSign, TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function AdminDashboard() {

  // Mock stats - replace with real data from your database
  const stats = [
    {
      title: "Total Revenue",
      value: "$45,231.89",
      change: "+20.1%",
      trend: "up",
      icon: DollarSign,
      description: "from last month",
    },
    {
      title: "Orders",
      value: "892",
      change: "+12.5%",
      trend: "up",
      icon: ShoppingCart,
      description: "from last month",
    },
    {
      title: "Products",
      value: "567",
      change: "-2.3%",
      trend: "down",
      icon: Package,
      description: "89 in stock",
    },
    {
      title: "Customers",
      value: "1,234",
      change: "+8.4%",
      trend: "up",
      icon: Users,
      description: "from last month",
    },
  ];

  // Mock recent orders
  const recentOrders = [
    { id: "#ORD-001", customer: "John Doe", amount: "$129.99", status: "completed", date: "2 mins ago" },
    { id: "#ORD-002", customer: "Jane Smith", amount: "$89.50", status: "processing", date: "15 mins ago" },
    { id: "#ORD-003", customer: "Mike Johnson", amount: "$199.99", status: "pending", date: "1 hour ago" },
    { id: "#ORD-004", customer: "Sarah Wilson", amount: "$75.00", status: "completed", date: "2 hours ago" },
  ];

  // Mock top products
  const topProducts = [
    { name: "Classic White T-Shirt", sales: 234, revenue: "$4,680", stock: 45 },
    { name: "Slim Fit Jeans", sales: 189, revenue: "$11,340", stock: 23 },
    { name: "Leather Jacket", sales: 145, revenue: "$28,900", stock: 12 },
    { name: "Running Shoes", sales: 167, revenue: "$16,700", stock: 8 },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your e-commerce store
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">Add Product</Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {stat.trend === "up" ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span className={stat.trend === "up" ? "text-green-500" : "text-red-500"}>
                  {stat.change}
                </span>
                <span>{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Orders */}
        <Card className="col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Orders</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/orders">
                  View All
                  <ArrowUpRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{order.customer}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">{order.id}</p>
                      <Badge variant={
                        order.status === "completed" ? "default" :
                          order.status === "processing" ? "secondary" : "outline"
                      }>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{order.amount}</p>
                    <p className="text-xs text-muted-foreground">{order.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-start gap-3 border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {index + 1}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{product.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{product.sales} sales</span>
                      <span>•</span>
                      <span>Stock: {product.stock}</span>
                    </div>
                  </div>
                  <div className="text-sm font-medium">{product.revenue}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/admin/products">
          <Card className="cursor-pointer transition-colors hover:bg-accent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Manage Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Add, edit, or remove products from your inventory
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/orders">
          <Card className="cursor-pointer transition-colors hover:bg-accent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                View Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Process and manage customer orders
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/customers">
          <Card className="cursor-pointer transition-colors hover:bg-accent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Manage Customers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View and manage customer accounts
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
