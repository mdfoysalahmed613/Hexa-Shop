"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Package,
  Search,
  Filter,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  ArrowUpDown,
  Download,
  Upload,
  Edit,
  History,
  BarChart3,
} from "lucide-react";
import { useState } from "react";

export default function InventoryPage() {
  // Dummy inventory data
  const inventory = [
    {
      id: 1,
      sku: "TSH-WHT-001",
      name: "Classic White T-Shirt",
      category: "T-Shirts",
      variants: [
        { size: "S", stock: 12, reserved: 2 },
        { size: "M", stock: 25, reserved: 5 },
        { size: "L", stock: 8, reserved: 3 },
        { size: "XL", stock: 0, reserved: 0 },
      ],
      totalStock: 45,
      reorderPoint: 20,
      costPrice: 8.5,
      lastRestocked: "2024-12-15",
      status: "in-stock" as const,
    },
    {
      id: 2,
      sku: "JNS-BLU-002",
      name: "Slim Fit Jeans",
      category: "Pants",
      variants: [
        { size: "28", stock: 5, reserved: 1 },
        { size: "30", stock: 8, reserved: 2 },
        { size: "32", stock: 7, reserved: 0 },
        { size: "34", stock: 3, reserved: 1 },
      ],
      totalStock: 23,
      reorderPoint: 15,
      costPrice: 25.0,
      lastRestocked: "2024-12-10",
      status: "in-stock" as const,
    },
    {
      id: 3,
      sku: "JKT-LTH-003",
      name: "Leather Jacket",
      category: "Jackets",
      variants: [
        { size: "S", stock: 3, reserved: 0 },
        { size: "M", stock: 5, reserved: 2 },
        { size: "L", stock: 4, reserved: 1 },
      ],
      totalStock: 12,
      reorderPoint: 10,
      costPrice: 85.0,
      lastRestocked: "2024-11-28",
      status: "low-stock" as const,
    },
    {
      id: 4,
      sku: "SHO-RUN-004",
      name: "Running Shoes",
      category: "Shoes",
      variants: [
        { size: "8", stock: 0, reserved: 0 },
        { size: "9", stock: 3, reserved: 1 },
        { size: "10", stock: 5, reserved: 2 },
        { size: "11", stock: 0, reserved: 0 },
      ],
      totalStock: 8,
      reorderPoint: 15,
      costPrice: 45.0,
      lastRestocked: "2024-12-01",
      status: "low-stock" as const,
    },
    {
      id: 5,
      sku: "WCH-CLS-005",
      name: "Classic Watch",
      category: "Accessories",
      variants: [{ size: "One Size", stock: 15, reserved: 3 }],
      totalStock: 15,
      reorderPoint: 10,
      costPrice: 120.0,
      lastRestocked: "2024-12-18",
      status: "in-stock" as const,
    },
    {
      id: 6,
      sku: "POL-CTN-006",
      name: "Cotton Polo",
      category: "Shirts",
      variants: [
        { size: "S", stock: 0, reserved: 0 },
        { size: "M", stock: 0, reserved: 0 },
        { size: "L", stock: 0, reserved: 0 },
      ],
      totalStock: 0,
      reorderPoint: 20,
      costPrice: 15.0,
      lastRestocked: "2024-10-15",
      status: "out-of-stock" as const,
    },
    {
      id: 7,
      sku: "HAT-CAP-007",
      name: "Baseball Cap",
      category: "Accessories",
      variants: [{ size: "One Size", stock: 42, reserved: 5 }],
      totalStock: 42,
      reorderPoint: 25,
      costPrice: 8.0,
      lastRestocked: "2024-12-20",
      status: "in-stock" as const,
    },
  ];

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"stock" | "name" | "status">("stock");

  // Stats
  const totalItems = inventory.reduce((acc, item) => acc + item.totalStock, 0);
  const lowStockItems = inventory.filter((i) => i.status === "low-stock").length;
  const outOfStockItems = inventory.filter((i) => i.status === "out-of-stock").length;
  const totalValue = inventory.reduce(
    (acc, item) => acc + item.totalStock * item.costPrice,
    0
  );

  const stats = [
    { label: "Total Units", value: totalItems.toLocaleString(), icon: Package },
    {
      label: "Low Stock Alerts",
      value: lowStockItems,
      icon: AlertTriangle,
      color: "text-amber-600",
    },
    {
      label: "Out of Stock",
      value: outOfStockItems,
      icon: TrendingDown,
      color: "text-red-600",
    },
    {
      label: "Inventory Value",
      value: `$${totalValue.toLocaleString()}`,
      icon: BarChart3,
    },
  ];

  const filteredInventory = inventory
    .filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "stock") return a.totalStock - b.totalStock;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "status") {
        const order = { "out-of-stock": 0, "low-stock": 1, "in-stock": 2 };
        return order[a.status] - order[b.status];
      }
      return 0;
    });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in-stock":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            In Stock
          </Badge>
        );
      case "low-stock":
        return (
          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
            Low Stock
          </Badge>
        );
      case "out-of-stock":
        return <Badge variant="destructive">Out of Stock</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">
            Track stock levels and manage inventory
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button>
            <Package className="mr-2 h-4 w-4" />
            Add Stock
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon
                className={`h-4 w-4 ${stat.color || "text-muted-foreground"}`}
              />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color || ""}`}>
                {stat.value}
              </div>
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
                placeholder="Search by product name or SKU..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                setSortBy(
                  sortBy === "stock"
                    ? "name"
                    : sortBy === "name"
                      ? "status"
                      : "stock"
                )
              }
            >
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Sort: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Low Stock Alerts */}
      {lowStockItems > 0 && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-amber-700 dark:text-amber-400">
              {lowStockItems} product{lowStockItems !== 1 ? "s" : ""} below
              reorder point.{" "}
              <button className="underline font-medium">
                Create purchase order →
              </button>
            </p>
          </CardContent>
        </Card>
      )}

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Products ({filteredInventory.length})</CardTitle>
          <CardDescription>
            Click on a product to view and manage stock by variant
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredInventory.map((item) => (
              <div
                key={item.id}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center">
                      <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{item.name}</p>
                        {getStatusBadge(item.status)}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>SKU: {item.sku}</span>
                        <span>•</span>
                        <span>{item.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-semibold">
                        {item.totalStock} units
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Reorder at: {item.reorderPoint}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" title="Stock history">
                        <History className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Adjust stock">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Variants */}
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
                  {item.variants.map((variant) => (
                    <div
                      key={variant.size}
                      className={`px-3 py-2 rounded-lg text-sm ${variant.stock === 0
                          ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400"
                          : variant.stock < 5
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                            : "bg-secondary text-secondary-foreground"
                        }`}
                    >
                      <span className="font-medium">{variant.size}</span>
                      <span className="ml-2">
                        {variant.stock}
                        {variant.reserved > 0 && (
                          <span className="text-xs ml-1">
                            ({variant.reserved} reserved)
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Stock Level Bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Stock level</span>
                    <span>
                      {Math.round(
                        (item.totalStock /
                          Math.max(item.reorderPoint * 2, item.totalStock)) *
                        100
                      )}
                      %
                    </span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.status === "out-of-stock"
                          ? "bg-red-500"
                          : item.status === "low-stock"
                            ? "bg-amber-500"
                            : "bg-green-500"
                        }`}
                      style={{
                        width: `${Math.min((item.totalStock / Math.max(item.reorderPoint * 2, item.totalStock)) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common inventory management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
              <TrendingUp className="h-6 w-6" />
              <span className="text-sm font-medium">Receive Stock</span>
              <span className="text-xs text-muted-foreground">Add incoming inventory</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
              <TrendingDown className="h-6 w-6" />
              <span className="text-sm font-medium">Adjust Stock</span>
              <span className="text-xs text-muted-foreground">Correct stock counts</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
              <History className="h-6 w-6" />
              <span className="text-sm font-medium">View History</span>
              <span className="text-xs text-muted-foreground">Stock movement log</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
              <Package className="h-6 w-6" />
              <span className="text-sm font-medium">Stock Count</span>
              <span className="text-xs text-muted-foreground">Physical inventory</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}