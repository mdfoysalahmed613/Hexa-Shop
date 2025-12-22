"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import {
  CategoryForm,
  CategoryList,
  CategoryStats,
  BulkActions,
  type Category,
  type CategoryFormData,
} from "@/components/admin/categories";
import {
  addCategory,
  updateCategory,
  deleteCategory,
  publishAllDraftCategories,
  hideEmptyCategories,
  deleteEmptyCategories,
  getCategories,
} from "@/app/actions/add-category";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dialog states
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    const result = await getCategories();
    if (result.ok) {
      setCategories(result.data as Category[]);
    } else {
      toast.error(result.error || "Failed to fetch categories");
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Search filter
  const filteredCategories = categories.filter((cat) => {
    const query = searchQuery.toLowerCase();
    return (
      cat.name.toLowerCase().includes(query) ||
      cat.slug.toLowerCase().includes(query) ||
      (cat.description && cat.description.toLowerCase().includes(query))
    );
  });

  const draftCategories = categories.filter((c) => c.is_active === false).length;

  // Handle add category
  const handleAddSubmit = async (data: CategoryFormData) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description || "");
      formData.append("is_active", String(data.is_active));
      if (data.image) {
        formData.append("image", data.image);
      }

      const result = await addCategory(formData);

      if (result.ok) {
        toast.success("Category created successfully!");
        fetchCategories();
      } else {
        toast.error(result.error || "Failed to create category");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit category
  const handleEditSubmit = async (data: CategoryFormData) => {
    if (!selectedCategory) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description || "");
      formData.append("is_active", String(data.is_active));
      if (data.image) {
        formData.append("image", data.image);
      }
      if (data.existingImage) {
        formData.append("existingImage", data.existingImage);
      }

      const result = await updateCategory(selectedCategory.id, formData);

      if (result.ok) {
        toast.success("Category updated successfully!");
        setIsEditDialogOpen(false);
        setSelectedCategory(null);
        fetchCategories();
      } else {
        toast.error(result.error || "Failed to update category");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete category
  const handleDelete = async () => {
    if (!selectedCategory) return;

    setIsSubmitting(true);
    try {
      const result = await deleteCategory(selectedCategory.id);

      if (result.ok) {
        toast.success("Category deleted successfully!");
        setIsDeleteDialogOpen(false);
        setSelectedCategory(null);
        fetchCategories();
      } else {
        toast.error(result.error || "Failed to delete category");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Bulk actions
  const handlePublishAllDraft = async () => {
    setIsSubmitting(true);
    try {
      const result = await publishAllDraftCategories();
      if (result.ok) {
        toast.success(`Published ${result.count} draft categories!`);
        fetchCategories();
      } else {
        toast.error(result.error || "Failed to publish categories");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHideEmpty = async () => {
    setIsSubmitting(true);
    try {
      const result = await hideEmptyCategories();
      if (result.ok) {
        toast.success(`Hidden ${result.count} empty categories!`);
        fetchCategories();
      } else {
        toast.error(result.error || "Failed to hide categories");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEmpty = async () => {
    setIsSubmitting(true);
    try {
      const result = await deleteEmptyCategories();
      if (result.ok) {
        toast.success(`Deleted ${result.count} empty categories!`);
        fetchCategories();
      } else {
        toast.error(result.error || "Failed to delete categories");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        <p className="text-muted-foreground">
          Organize products into categories
        </p>
      </div>

      {/* Stats */}
      <CategoryStats categories={categories} isLoading={isLoading} />

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Category List */}
        <div className="lg:col-span-3 space-y-4">
          {/* Search */}
          <Card>
            <CardContent>
              <InputGroup>
                <InputGroupInput
                  value={searchQuery}
                  placeholder="Search categories..."
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <InputGroupAddon>
                  <Search />
                </InputGroupAddon>
              </InputGroup>
            </CardContent>
          </Card>

          {/* Categories List */}
          <Card>
            <CardHeader>
              <CardTitle>All Categories</CardTitle>
              <CardDescription>
                {filteredCategories.length} {filteredCategories.length === 1 ? "category" : "categories"} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CategoryList
                categories={filteredCategories}
                isLoading={isLoading}
                searchQuery={searchQuery}
                onEdit={(category) => {
                  setSelectedCategory(category);
                  setIsEditDialogOpen(true);
                }}
                onDelete={(category) => {
                  setSelectedCategory(category);
                  setIsDeleteDialogOpen(true);
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6 lg:col-span-2">
          {/* Add Category */}
          <Card>
            <CardHeader>
              <CardTitle>Add Category</CardTitle>
              <CardDescription>Create a new category</CardDescription>
            </CardHeader>
            <CardContent>
              <CategoryForm
                onSubmit={handleAddSubmit}
                submitLabel="Create Category"
                isSubmitting={isSubmitting}
                showDialogFooter={false}
              />
            </CardContent>
          </Card>

          {/* Bulk Actions */}
          <BulkActions
            draftCount={draftCategories}
            isSubmitting={isSubmitting}
            onPublishAllDraft={handlePublishAllDraft}
            onHideEmpty={handleHideEmpty}
            onDeleteEmpty={handleDeleteEmpty}
          />
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) setSelectedCategory(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update the category details
            </DialogDescription>
          </DialogHeader>
          {selectedCategory && (
            <CategoryForm
              onSubmit={handleEditSubmit}
              submitLabel="Save Changes"
              isSubmitting={isSubmitting}
              category={selectedCategory}
              showDialogFooter={true}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedCategory?.name}&quot;? This action cannot be undone.
              {(selectedCategory?.product_count ?? 0) > 0 && (
                <span className="block mt-2 text-destructive font-medium">
                  Warning: This category has {selectedCategory?.product_count} products associated with it.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}