"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
   FolderTree,
   Edit,
   Trash2,
   GripVertical,
   MoreHorizontal,
   Loader2,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import type { Category } from "./category-form-schema";

interface CategoryListProps {
   categories: Category[];
   isLoading: boolean;
   searchQuery: string;
   onEdit: (category: Category) => void;
   onDelete: (category: Category) => void;
}

export function CategoryList({
   categories,
   isLoading,
   searchQuery,
   onEdit,
   onDelete,
}: CategoryListProps) {
   const getStatusBadge = (isActive: boolean) => {
      if (isActive) {
         return (
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
               Active
            </Badge>
         );
      }
      return <Badge variant="secondary">Draft</Badge>;
   };

   if (isLoading) {
      return (
         <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
         </div>
      );
   }

   if (categories.length === 0) {
      return (
         <div className="text-center py-8 text-muted-foreground">
            {searchQuery
               ? "No categories match your search"
               : "No categories found. Create your first category!"}
         </div>
      );
   }

   return (
      <div className="space-y-2">
         {categories.map((category) => (
            <div
               key={category.id}
               className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors group"
            >
               <div className="flex items-center gap-3">
                  <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden">
                     {category.image ? (
                        <Image
                           src={category.image}
                           alt={category.name}
                           width={40}
                           height={40}
                           className="object-cover w-full h-full"
                        />
                     ) : (
                        <FolderTree className="h-5 w-5 text-primary" />
                     )}
                  </div>
                  <div>
                     <div className="flex items-center gap-2">
                        <p className="font-medium">{category.name}</p>
                        {getStatusBadge(category.is_active)}
                     </div>
                     <p className="text-sm text-muted-foreground">
                        /{category.slug} • {category.product_count || 0} products
                     </p>
                  </div>
               </div>
               <div className="flex items-center gap-1">
                  <Button
                     variant="ghost"
                     size="icon"
                     onClick={() => onEdit(category)}
                  >
                     <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                     variant="ghost"
                     size="icon"
                     className="text-destructive hover:text-destructive"
                     onClick={() => onDelete(category)}
                  >
                     <Trash2 className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                     <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                           <MoreHorizontal className="h-4 w-4" />
                        </Button>
                     </DropdownMenuTrigger>
                     <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(category)}>
                           <Edit className="mr-2 h-4 w-4" />
                           Edit Category
                        </DropdownMenuItem>
                        <DropdownMenuItem
                           onClick={() => {
                              navigator.clipboard.writeText(category.slug);
                              toast.success("Slug copied to clipboard");
                           }}
                        >
                           <FolderTree className="mr-2 h-4 w-4" />
                           Copy Slug
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                           variant="destructive"
                           onClick={() => onDelete(category)}
                        >
                           <Trash2 className="mr-2 h-4 w-4" />
                           Delete Category
                        </DropdownMenuItem>
                     </DropdownMenuContent>
                  </DropdownMenu>
               </div>
            </div>
         ))}
      </div>
   );
}
