"use client";

import { useState } from "react";
import Image from "next/image";
import {
   Pencil,
   Trash2,
   ImageIcon,
   Loader2,
   MoreHorizontal,
   Eye,
   EyeOff,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
   Tooltip,
   TooltipContent,
   TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { type Category } from "@/lib/services/categories";
import { useDeleteCategory, useToggleCategoryStatus } from "@/hooks/use-categories";
import { createClient } from "@/lib/supabase/client";

interface CategoryCardProps {
   category: Category;
   onEdit: (category: Category) => void;
   level?: number;
}

export function CategoryCard({
   category,
   onEdit,
   level = 0,
}: CategoryCardProps) {
   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

   const deleteMutation = useDeleteCategory();
   const toggleStatusMutation = useToggleCategoryStatus();

   const handleConfirmDelete = async () => {
      await deleteMutation.mutateAsync(category.id);
      setDeleteDialogOpen(false);
   };

   const handleToggleStatus = async () => {
      await toggleStatusMutation.mutateAsync(category.id);
   };
   const supabase = createClient();
   const imageUrl = category.image_path
      ? supabase.storage
           .from("category-images")
           .getPublicUrl(category.image_path).data.publicUrl
      : null;

   return (
      <>
         <div
            className={cn(
               "flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50",
               !category.is_active && "opacity-70"
            )}
            style={{ marginLeft: level * 24 }}
         >
            {/* Image */}
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
               {imageUrl ? (
                  <Image
                     src={imageUrl}
                     alt={category.name}
                     fill
                     className="object-cover"
                  />
               ) : (
                  <div className="flex h-full w-full items-center justify-center">
                     <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
               )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
               <div className="flex items-center gap-2">
                  <h3 className="font-medium truncate">{category.name}</h3>
                  <Badge
                     variant={category.is_active ? "default" : "secondary"}
                     className="shrink-0 text-xs"
                  >
                     {category.is_active ? "Active" : "Draft"}
                  </Badge>
               </div>

               <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="text-muted-foreground">/{category.slug}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                     {category.product_count ?? 0} products
                  </span>
               </div>
            </div>

            {/* Actions - 3-dot menu */}
            <div className="flex items-center gap-2 shrink-0">
               <Tooltip>
                  <TooltipTrigger asChild>
                     <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onEdit(category)}
                     >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                     </Button>
                  </TooltipTrigger>
                  <TooltipContent>Edit category</TooltipContent>
               </Tooltip>

               <Tooltip>
                  <TooltipTrigger asChild>
                     <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteDialogOpen(true)}
                        disabled={deleteMutation.isPending}
                     >
                        {deleteMutation.isPending ? (
                           <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                           <Trash2 className="h-4 w-4" />
                        )}
                        <span className="sr-only">Delete</span>
                     </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete category</TooltipContent>
               </Tooltip>

               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                     <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">More options</span>
                     </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                     <DropdownMenuItem onClick={() => onEdit(category)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit category
                     </DropdownMenuItem>
                     <DropdownMenuItem
                        onClick={handleToggleStatus}
                        disabled={toggleStatusMutation.isPending}
                     >
                        {category.is_active ? (
                           <>
                              <EyeOff className="mr-2 h-4 w-4" />
                              Inactive
                           </>
                        ) : (
                           <>
                              <Eye className="mr-2 h-4 w-4" />
                              Active
                           </>
                        )}
                     </DropdownMenuItem>
                     <DropdownMenuSeparator />
                     <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setDeleteDialogOpen(true)}
                        disabled={deleteMutation.isPending}
                     >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                     </DropdownMenuItem>
                  </DropdownMenuContent>
               </DropdownMenu>
            </div>
         </div>

         {/* Delete Confirmation Dialog */}
         <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
               <AlertDialogHeader>
                  <AlertDialogTitle>Delete Category</AlertDialogTitle>
                  <AlertDialogDescription>
                     Are you sure you want to delete &quot;{category.name}&quot;? This
                     action cannot be undone. All products in this category will also
                     be deleted.
                  </AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                     onClick={handleConfirmDelete}
                  >
                     {deleteMutation.isPending ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
               </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>
      </>
   );
}
