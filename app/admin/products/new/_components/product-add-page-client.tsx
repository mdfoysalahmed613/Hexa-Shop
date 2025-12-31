"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductForm } from "./product-form";

export function ProductAddPageClient() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Product</h1>
          <p className="text-muted-foreground">
            Create a new product for your store
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/products/categories">
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Link>
        </Button>
      </div>

      {/* Form */}
      <ProductForm />
    </div>
  );
}
