"use client";

import { useEffect, useRef, useMemo } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Upload, Loader2 } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogHeader,
   DialogTitle,
} from "@/components/ui/dialog";
import {
   Field,
   FieldLabel,
   FieldError,
   FieldDescription,
} from "@/components/ui/field";

import {
   categoryFormSchema,
   type CategoryFormData,
   defaultCategoryFormValues,
} from "./category-form-schema";
import { type Category } from "@/lib/services/categories";
import { useUpdateCategory, useCategories } from "@/hooks/use-categories";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface CategoryEditDialogProps {
   category: Category | null;
   open: boolean;
   onOpenChange: (open: boolean) => void;
}

export function CategoryEditDialog({
   category,
   open,
   onOpenChange,
}: CategoryEditDialogProps) {
   const fileInputRef = useRef<HTMLInputElement>(null);

   const { data: categories = [] } = useCategories();
   const updateMutation = useUpdateCategory();

   const {
      control,
      handleSubmit,
      reset,
      setValue,
      formState: { isSubmitting },
   } = useForm<CategoryFormData>({
      resolver: zodResolver(categoryFormSchema),
      defaultValues: defaultCategoryFormValues,
   });

   const imageFile = useWatch({ control, name: "image" });
   const currentImagePath = useWatch({ control, name: "image_path" });

   // Compute image preview from form state
   const imagePreview = useMemo(() => {
      if (imageFile && imageFile instanceof File && imageFile.size > 0) {
         return URL.createObjectURL(imageFile);
      }
      if (currentImagePath) {
         const supabase = createClient();
         return supabase.storage
            .from("category-images")
            .getPublicUrl(currentImagePath).data.publicUrl;
      }
      return null;
   }, [imageFile, currentImagePath]);

   // Reset form when category changes
   useEffect(() => {
      if (category && open) {
         reset({
            name: category.name,
            description: category.description || "",
            is_active: category.is_active,
            parent_id: category.parent_id,
            image: null,
            image_path: category.image_path,
         });
      }
   }, [category, open, reset]);

   const onSubmit = async (data: CategoryFormData) => {
      if (!category) return;

      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description || "");
      formData.append("is_active", String(data.is_active));
      formData.append("parent_id", data.parent_id || "");

      if (data.image && data.image.size > 0) {
         formData.append("image", data.image);
      }

      // Always send the original image path so server can delete it when uploading new image
      if (category.image_path) {
         formData.append("image_path", category.image_path);
      }

      try {
         await updateMutation.mutateAsync({ id: category.id, formData });
         onOpenChange(false);
      } catch {
         // Error is handled by the mutation
      }
   };

   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
         if (file.size > 2 * 1024 * 1024) {
            toast.error("Image must be less than 2MB");
            return;
         }
         setValue("image", file, { shouldDirty: true });
      }
   };

   const handleRemoveImage = () => {
      setValue("image", null, { shouldDirty: true });
      setValue("image_path", null, { shouldDirty: true });
      if (fileInputRef.current) {
         fileInputRef.current.value = "";
      }
   };

   // Filter out current category from parent options
   const parentOptions = categories.filter((c) => c.id !== category?.id);

   const isPending = updateMutation.isPending;

   return (
      <Dialog open={open} onOpenChange={onOpenChange}>
         <DialogContent className="max-w-md">
            <DialogHeader>
               <DialogTitle>Edit Category</DialogTitle>
               <DialogDescription>
                  Update the category details below
               </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
               {/* Image Upload */}
               <Field>
                  <FieldLabel>Category Image</FieldLabel>
                  <div className="flex items-center gap-4">
                     {imagePreview ? (
                        <div className="group relative h-20 w-20 overflow-hidden rounded-lg border bg-muted">
                           <Image
                              src={imagePreview}
                              alt="Category preview"
                              fill
                              className="object-cover"
                           />
                           <button
                              type="button"
                              onClick={handleRemoveImage}
                              className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100"
                           >
                              <X className="h-3 w-3" />
                           </button>
                        </div>
                     ) : (
                        <div
                           className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 transition-colors hover:border-primary hover:bg-muted"
                           onClick={() => fileInputRef.current?.click()}
                        >
                           <Upload className="h-4 w-4 text-muted-foreground" />
                           <span className="text-[10px] text-muted-foreground">Upload</span>
                        </div>
                     )}
                     <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                     />
                     <FieldDescription className="text-xs">
                        Max 2MB. Recommended: 400×400px
                     </FieldDescription>
                  </div>
               </Field>

               {/* Name */}
               <Controller
                  control={control}
                  name="name"
                  render={({ field, fieldState }) => (
                     <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="edit-name">
                           Name <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Input
                           id="edit-name"
                           placeholder="e.g. Electronics"
                           {...field}
                           aria-invalid={fieldState.invalid}
                        />
                        {fieldState.invalid && (
                           <FieldError errors={[fieldState.error]} />
                        )}
                     </Field>
                  )}
               />

               {/* Description */}
               <Controller
                  control={control}
                  name="description"
                  render={({ field, fieldState }) => (
                     <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="edit-description">Description</FieldLabel>
                        <Textarea
                           id="edit-description"
                           placeholder="Brief description..."
                           rows={2}
                           className="resize-none"
                           {...field}
                           value={field.value || ""}
                           aria-invalid={fieldState.invalid}
                        />
                        {fieldState.invalid && (
                           <FieldError errors={[fieldState.error]} />
                        )}
                     </Field>
                  )}
               />

               {/* Parent Category */}
               <Controller
                  control={control}
                  name="parent_id"
                  render={({ field, fieldState }) => (
                     <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="edit-parent_id">Parent Category</FieldLabel>
                        <Select
                           value={field.value || "none"}
                           onValueChange={(value) =>
                              field.onChange(value === "none" ? null : value)
                           }
                        >
                           <SelectTrigger id="edit-parent_id">
                              <SelectValue placeholder="Select parent category" />
                           </SelectTrigger>
                           <SelectContent>
                              <SelectItem value="none">None (Top Level)</SelectItem>
                              {parentOptions.map((cat) => (
                                 <SelectItem key={cat.id} value={cat.id}>
                                    {cat.name}
                                 </SelectItem>
                              ))}
                           </SelectContent>
                        </Select>
                        {fieldState.invalid && (
                           <FieldError errors={[fieldState.error]} />
                        )}
                     </Field>
                  )}
               />

               {/* Is Active */}
               <Controller
                  control={control}
                  name="is_active"
                  render={({ field }) => (
                     <Field orientation="horizontal" className="rounded-lg border p-3">
                        <div className="flex-1">
                           <FieldLabel htmlFor="edit-is_active" className="font-medium text-sm">
                              Active Status
                           </FieldLabel>
                           <FieldDescription className="text-xs">
                              Inactive categories won&apos;t appear on storefront
                           </FieldDescription>
                        </div>
                        <Switch
                           id="edit-is_active"
                           checked={field.value}
                           onCheckedChange={field.onChange}
                        />
                     </Field>
                  )}
               />

               {/* Actions */}
               <div className="flex gap-3 pt-2">
                  <Button
                     type="button"
                     variant="outline"
                     onClick={() => onOpenChange(false)}
                     disabled={isPending}
                     className="flex-1"
                  >
                     Cancel
                  </Button>
                  <Button
                     type="submit"
                     disabled={isPending || isSubmitting}
                     className="flex-1"
                  >
                     {isPending ? (
                        <>
                           <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                           Saving...
                        </>
                     ) : (
                        "Save Changes"
                     )}
                  </Button>
               </div>
            </form>
         </DialogContent>
      </Dialog>
   );
}
