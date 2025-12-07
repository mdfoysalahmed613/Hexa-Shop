import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Plus, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function ProductsPage() {

   // Mock products data
   const products = [
      { id: 1, name: "Classic White T-Shirt", category: "T-Shirts", price: 19.99, stock: 45, status: "active" },
      { id: 2, name: "Slim Fit Jeans", category: "Pants", price: 59.99, stock: 23, status: "active" },
      { id: 3, name: "Leather Jacket", category: "Shirts", price: 199.99, stock: 12, status: "active" },
      { id: 4, name: "Running Shoes", category: "Shoes", price: 89.99, stock: 8, status: "low stock" },
      { id: 5, name: "Classic Watch", category: "Watches", price: 249.99, stock: 15, status: "active" },
      { id: 6, name: "Cotton Polo", category: "Shirts", price: 34.99, stock: 0, status: "out of stock" },
   ];

   return (
      <div className="flex flex-1 flex-col gap-4 p-6 z-40">
         <div className="flex items-center justify-between">
            <div>
               <h1 className="text-3xl font-bold tracking-tight">Products</h1>
               <p className="text-muted-foreground">
                  Manage your product inventory
               </p>
            </div>
            <Button asChild>
               <Link href="/admin/products/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
               </Link>
            </Button>
         </div>

         {/* Filters */}
         <Card>
            <CardContent className="pt-6">
               <div className="flex gap-4">
                  <div className="relative flex-1">
                     <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                     <Input placeholder="Search products..." className="pl-8" />
                  </div>
                  <Button variant="outline">
                     <Filter className="mr-2 h-4 w-4" />
                     Filter
                  </Button>
               </div>
            </CardContent>
         </Card>

         {/* Products Table */}
         <Card>
            <CardHeader>
               <CardTitle>All Products ({products.length})</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="space-y-4">
                  {products.map((product) => (
                     <div key={product.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                        <div className="flex items-center gap-4">
                           <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center">
                              <Package className="h-6 w-6 text-muted-foreground" />
                           </div>
                           <div className="space-y-1">
                              <p className="text-sm font-medium">{product.name}</p>
                              <p className="text-xs text-muted-foreground">{product.category}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-4">
                           <div className="text-right">
                              <p className="text-sm font-medium">${product.price}</p>
                              <p className="text-xs text-muted-foreground">Stock: {product.stock}</p>
                           </div>
                           <Badge variant={
                              product.status === "active" ? "default" :
                                 product.status === "low stock" ? "secondary" : "destructive"
                           }>
                              {product.status}
                           </Badge>
                           <Button variant="ghost" size="sm">Edit</Button>
                        </div>
                     </div>
                  ))}
               </div>
            </CardContent>
         </Card>
      </div>
   );
}
