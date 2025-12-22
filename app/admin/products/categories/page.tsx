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
  FolderTree,
  Plus,
  Search,
  Edit,
  Trash2,
  ChevronRight,
  GripVertical,
  Image as ImageIcon,
  Package,
  Eye,
  EyeOff,
  MoreHorizontal,
} from "lucide-react";
import { useState } from "react";

export default function CategoriesPage() {
  // Dummy categories data with nested structure
  const categories = [
    {
      id: 1,
      name: "Clothing",
      slug: "clothing",
      description: "All types of clothing and apparel",
      image: null,
      productCount: 145,
      status: "active" as const,
      children: [
        {
          id: 2,
          name: "T-Shirts",
          slug: "t-shirts",
          description: "Casual and graphic t-shirts",
          productCount: 45,
          status: "active" as const,
        },
        {
          id: 3,
          name: "Pants",
          slug: "pants",
          description: "Jeans, chinos, and casual pants",
          productCount: 32,
          status: "active" as const,
        },
        {
          id: 4,
          name: "Jackets",
          slug: "jackets",
          description: "Outerwear and jackets",
          productCount: 18,
          status: "active" as const,
        },
        {
          id: 5,
          name: "Shirts",
          slug: "shirts",
          description: "Formal and casual shirts",
          productCount: 28,
          status: "active" as const,
        },
        {
          id: 6,
          name: "Dresses",
          slug: "dresses",
          description: "Women's dresses",
          productCount: 22,
          status: "draft" as const,
        },
      ],
    },
    {
      id: 7,
      name: "Shoes",
      slug: "shoes",
      description: "Footwear for all occasions",
      image: null,
      productCount: 67,
      status: "active" as const,
      children: [
        {
          id: 8,
          name: "Sneakers",
          slug: "sneakers",
          description: "Casual and athletic sneakers",
          productCount: 25,
          status: "active" as const,
        },
        {
          id: 9,
          name: "Boots",
          slug: "boots",
          description: "Work and fashion boots",
          productCount: 15,
          status: "active" as const,
        },
        {
          id: 10,
          name: "Sandals",
          slug: "sandals",
          description: "Summer sandals and flip-flops",
          productCount: 12,
          status: "inactive" as const,
        },
        {
          id: 11,
          name: "Formal",
          slug: "formal-shoes",
          description: "Dress shoes and loafers",
          productCount: 15,
          status: "active" as const,
        },
      ],
    },
    {
      id: 12,
      name: "Accessories",
      slug: "accessories",
      description: "Watches, bags, and jewelry",
      image: null,
      productCount: 89,
      status: "active" as const,
      children: [
        {
          id: 13,
          name: "Watches",
          slug: "watches",
          description: "Digital and analog watches",
          productCount: 24,
          status: "active" as const,
        },
        {
          id: 14,
          name: "Bags",
          slug: "bags",
          description: "Backpacks, handbags, and wallets",
          productCount: 35,
          status: "active" as const,
        },
        {
          id: 15,
          name: "Jewelry",
          slug: "jewelry",
          description: "Necklaces, rings, and bracelets",
          productCount: 18,
          status: "active" as const,
        },
        {
          id: 16,
          name: "Hats",
          slug: "hats",
          description: "Caps, beanies, and hats",
          productCount: 12,
          status: "active" as const,
        },
      ],
    },
    {
      id: 17,
      name: "Sale",
      slug: "sale",
      description: "Discounted items",
      image: null,
      productCount: 34,
      status: "active" as const,
      children: [],
    },
    {
      id: 18,
      name: "New Arrivals",
      slug: "new-arrivals",
      description: "Latest products",
      image: null,
      productCount: 28,
      status: "active" as const,
      children: [],
    },
  ];

  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<number[]>([1, 7, 12]);

  // Stats
  const totalCategories = categories.length;
  const totalSubcategories = categories.reduce(
    (acc, cat) => acc + (cat.children?.length || 0),
    0
  );
  const activeCategories =
    categories.filter((c) => c.status === "active").length +
    categories.reduce(
      (acc, cat) =>
        acc + (cat.children?.filter((c) => c.status === "active").length || 0),
      0
    );
  const totalProducts = categories.reduce((acc, cat) => acc + cat.productCount, 0);

  const stats = [
    { label: "Main Categories", value: totalCategories, icon: FolderTree },
    { label: "Subcategories", value: totalSubcategories, icon: FolderTree },
    { label: "Active Categories", value: activeCategories, icon: Eye },
    { label: "Total Products", value: totalProducts, icon: Package },
  ];

  const toggleCategory = (id: number) => {
    setExpandedCategories((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            Active
          </Badge>
        );
      case "draft":
        return <Badge variant="secondary">Draft</Badge>;
      case "inactive":
        return <Badge variant="outline">Inactive</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredCategories = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.children?.some((child) =>
        child.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">
            Organize products into categories and subcategories
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Category Tree - Takes 2 columns */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search categories..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Categories List */}
          <Card>
            <CardHeader>
              <CardTitle>Category Structure</CardTitle>
              <CardDescription>
                Drag to reorder. Click to expand/collapse.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {filteredCategories.map((category) => (
                <div key={category.id} className="space-y-1">
                  {/* Parent Category */}
                  <div
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                    onClick={() =>
                      category.children?.length && toggleCategory(category.id)
                    }
                  >
                    <div className="flex items-center gap-3">
                      <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                      {category.children && category.children.length > 0 && (
                        <ChevronRight
                          className={`h-4 w-4 text-muted-foreground transition-transform ${expandedCategories.includes(category.id)
                              ? "rotate-90"
                              : ""
                            }`}
                        />
                      )}
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        {category.image ? (
                          <ImageIcon className="h-5 w-5 text-primary" />
                        ) : (
                          <FolderTree className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{category.name}</p>
                          {getStatusBadge(category.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          /{category.slug} • {category.productCount} products
                          {category.children && category.children.length > 0 && (
                            <span>
                              {" "}
                              • {category.children.length} subcategories
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Subcategories */}
                  {expandedCategories.includes(category.id) &&
                    category.children &&
                    category.children.length > 0 && (
                      <div className="ml-8 space-y-1">
                        {category.children.map((child) => (
                          <div
                            key={child.id}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                              <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center">
                                <FolderTree className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium">
                                    {child.name}
                                  </p>
                                  {getStatusBadge(child.status)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  /{category.slug}/{child.slug} •{" "}
                                  {child.productCount} products
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full mt-1 border-dashed border"
                        >
                          <Plus className="mr-2 h-3.5 w-3.5" />
                          Add Subcategory
                        </Button>
                      </div>
                    )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Add */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Add Category</CardTitle>
              <CardDescription>Create a new category quickly</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category Name</label>
                <Input placeholder="e.g., Summer Collection" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Parent Category</label>
                <select className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm">
                  <option value="">None (Top Level)</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input placeholder="Brief description..." />
              </div>
              <Button className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Create Category
              </Button>
            </CardContent>
          </Card>

          {/* Category Image */}
          <Card>
            <CardHeader>
              <CardTitle>Category Images</CardTitle>
              <CardDescription>
                Add images to categories for visual navigation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center">
                <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  Select a category to upload image
                </p>
                <Button variant="outline" size="sm" disabled>
                  Upload Image
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">💡 Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Use descriptive category names for better SEO</p>
              <p>• Keep the hierarchy to 2-3 levels max</p>
              <p>• Add images to main categories for visual appeal</p>
              <p>• Use the slug for URL-friendly paths</p>
            </CardContent>
          </Card>

          {/* Bulk Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Bulk Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Eye className="mr-2 h-4 w-4" />
                Publish All Draft
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <EyeOff className="mr-2 h-4 w-4" />
                Hide Empty Categories
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-destructive hover:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Empty Categories
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}