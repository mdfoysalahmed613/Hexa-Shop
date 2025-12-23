"use client";

import { useState, useMemo } from "react";
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
  useCategories,
  useAddCategory,
  useUpdateCategory,
  useDeleteCategory,
  usePublishAllDraftCategories,
  useHideEmptyCategories,
  useDeleteEmptyCategories,
} from "@/hooks/use-categories";

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // Dialog states
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // TanStack Query hooks
  const { data: categories = [], isLoading } = useCategories();
  const addMutation = useAddCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();
  const publishAllMutation = usePublishAllDraftCategories();
  const hideEmptyMutation = useHideEmptyCategories();
  const deleteEmptyMutation = useDeleteEmptyCategories();

  // Check if any mutation is pending
  const isSubmitting =
    addMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    publishAllMutation.isPending ||
    hideEmptyMutation.isPending ||
    deleteEmptyMutation.isPending;

  // Search filter
  const filteredCategories = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return categories.filter((cat) =>
      cat.name.toLowerCase().includes(query) ||
      cat.slug.toLowerCase().includes(query) ||
      (cat.description && cat.description.toLowerCase().includes(query))
    );
  }, [categories, searchQuery]);

  const draftCategories = useMemo(
    () => categories.filter((c) => c.is_active === false).length,
    [categories]
  );

  // Handle add category
  const handleAddSubmit = async (data: CategoryFormData) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description || "");
    formData.append("is_active", String(data.is_active));
    if (data.image) {
      formData.append("image", data.image);
    }

    await addMutation.mutateAsync(formData);
  };

  // Handle edit category
  const handleEditSubmit = async (data: CategoryFormData) => {
    if (!selectedCategory) return;

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description || "");
    formData.append("is_active", String(data.is_active));
    if (data.image) {
      formData.append("image", data.image);
    }
    if (data.image_url) {
      formData.append("image_url", data.image_url);
    }

    await updateMutation.mutateAsync({ id: selectedCategory.id, formData });
    setIsEditDialogOpen(false);
    setSelectedCategory(null);
  };

  // Handle delete category
  const handleDelete = async () => {
    if (!selectedCategory) return;

    await deleteMutation.mutateAsync(selectedCategory.id);
    setIsDeleteDialogOpen(false);
    setSelectedCategory(null);
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
            onPublishAllDraft={() => publishAllMutation.mutate()}
            onHideEmpty={() => hideEmptyMutation.mutate()}
            onDeleteEmpty={() => deleteEmptyMutation.mutate()}
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