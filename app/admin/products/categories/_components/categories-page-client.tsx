"use client";

/**
 * Categories Page Client
 *
 * Admin category management with hierarchical tree view.
 * Supports nested parent/child category structure.
 *
 * Features:
 * - Category statistics cards (total, active, inactive)
 * - Hierarchical tree display with indentation
 * - Search/filter categories
 * - Add category panel (side drawer)
 * - Edit category dialog
 * - Toggle category status
 */

import { useState, useMemo } from "react";
import {
  FolderTree,
  Package,
  Eye,
  EyeOff,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatsCards, type StatItem } from "@/components/shared/stats-cards";
import { useCategories } from "@/hooks/use-categories";
import { type Category } from "@/lib/services/categories";
import { CategoryFormPanel } from "./category-form-panel";
import { CategoryEditDialog } from "./category-edit-dialog";
import { CategoryCard } from "./category-card";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

// Build hierarchical tree from flat categories
interface CategoryNode extends Category {
  children: CategoryNode[];
}

function buildCategoryTree(categories: Category[]): CategoryNode[] {
  const categoryMap = new Map<string, CategoryNode>();
  const roots: CategoryNode[] = [];

  // Create nodes with empty children
  categories.forEach((cat) => {
    categoryMap.set(cat.id, { ...cat, children: [] });
  });

  // Build tree structure
  categories.forEach((cat) => {
    const node = categoryMap.get(cat.id)!;
    if (cat.parent_id && categoryMap.has(cat.parent_id)) {
      categoryMap.get(cat.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  // Sort children alphabetically
  const sortNodes = (nodes: CategoryNode[]): CategoryNode[] => {
    return nodes
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((node) => ({
        ...node,
        children: sortNodes(node.children),
      }));
  };

  return sortNodes(roots);
}

// Flatten tree back to array with level info for rendering
function flattenTree(
  nodes: CategoryNode[],
  level = 0
): { category: Category; level: number }[] {
  const result: { category: Category; level: number }[] = [];

  nodes.forEach((node) => {
    const { children, ...category } = node;
    result.push({ category, level });
    result.push(...flattenTree(children, level + 1));
  });

  return result;
}

export function CategoriesPageClient() {
  // State
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: categories = [], isLoading } = useCategories();

  // Build hierarchical category list with levels
  const hierarchicalCategories = useMemo(() => {
    // If searching, filter categories first but show flat results
    if (searchQuery) {
      const filtered = categories.filter((category) => {
        return (
          category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          category.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
      return filtered.map((category) => ({ category, level: 0 }));
    }

    // Build and flatten the tree for hierarchical display
    const tree = buildCategoryTree(categories);
    return flattenTree(tree);
  }, [categories, searchQuery]);

  // Stats
  const stats: StatItem[] = useMemo(() => {
    return [
      {
        label: "Total Categories",
        value: categories.length,
        icon: FolderTree,
        color: "default",
      },
      {
        label: "Active Categories",
        value: categories.filter((c) => c.is_active).length,
        icon: Eye,
        color: "success",
      },
      {
        label: "Draft Categories",
        value: categories.filter((c) => !c.is_active).length,
        icon: EyeOff,
        color: "warning",
      },
      {
        label: "Total Products",
        value: categories.reduce((acc, c) => acc + (c.product_count ?? 0), 0),
        icon: Package,
        color: "info",
      },
    ];
  }, [categories]);

  const handleEditCategory = (category: Category) => {
    setEditCategory(category);
    setEditDialogOpen(true);
  };

  return (
    <section className="flex flex-col lg:flex-row gap-6 p-6">
      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">
            Organize products into categories
          </p>
        </div>

        {/* Stats Cards */}
        <StatsCards stats={stats} isLoading={isLoading} />
        <h1 className="text-lg font-semibold ">
          All Categories ({hierarchicalCategories.length})
        </h1>
        {/* Categories List Card */}
        <Card>
          <CardHeader>
            <InputGroup className="max-w-lg">
              <InputGroupInput
                value={searchQuery}
                placeholder="Search categories..."
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
            </InputGroup>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 rounded-lg border p-4"
                  >
                    <Skeleton className="h-14 w-14 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  </div>
                ))}
              </div>
            ) : hierarchicalCategories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="rounded-full bg-muted p-4">
                  <FolderTree className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">
                  {searchQuery ? "No categories found" : "No categories yet"}
                </h3>
                <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
                  {searchQuery
                    ? "Try adjusting your search."
                    : "Create your first category to get started."}
                </p>
                {searchQuery && (
                  <Button
                    variant="outline"
                    onClick={() => setSearchQuery("")}
                    className="mt-4"
                  >
                    Clear Search
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {hierarchicalCategories.map(({ category, level }) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    onEdit={handleEditCategory}
                    level={level}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sidebar Form */}
      <div className="lg:w-[380px] shrink-0">
        <CategoryFormPanel />
      </div>

      {/* Edit Category Dialog */}
      <CategoryEditDialog
        category={editCategory}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    </section>
  );
}
