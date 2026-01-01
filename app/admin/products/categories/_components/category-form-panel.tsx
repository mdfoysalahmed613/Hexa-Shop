"use client";

import { useRef, useMemo } from "react";
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
   Card,
   CardContent,
   CardDescription,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
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
import { useAddCategory, useCategories } from "@/hooks/use-categories";

interface CategoryFormPanelProps {
   onSuccess?: () => void;
}

export function CategoryFormPanel({ onSuccess }: CategoryFormPanelProps) {
   const fileInputRef = useRef<HTMLInputElement>(null);

   const { data: categories = [] } = useCategories();
   const addMutation = useAddCategory();

   const {
      control,
      handleSubmit,
      reset,
      setValue,
      formState: { isSubmitting, isDirty },
   } = useForm<CategoryFormData>({
      resolver: zodResolver(categoryFormSchema),
      defaultValues: defaultCategoryFormValues,
   });

   const imageFile = useWatch({ control, name: "image" });
   const currentImageUrl = useWatch({ control, name: "image_path" });

   // Compute image preview from form state
   const imagePreview = useMemo(() => {
      if (imageFile && imageFile instanceof File && imageFile.size > 0) {
         return URL.createObjectURL(imageFile);
      }
      return currentImageUrl || null;
   }, [imageFile, currentImageUrl]);

   const onSubmit = async (data: CategoryFormData) => {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description || "");
      formData.append("is_active", String(data.is_active));
      formData.append("parent_id", data.parent_id || "");

      if (data.image && data.image.size > 0) {
         formData.append("image", data.image);
      }

      if (data.image_path) {
         formData.append("image_path", data.image_path);
      }

      try {
         await addMutation.mutateAsync(formData);
         reset(defaultCategoryFormValues);
         onSuccess?.();
      } catch {
         // Error is handled by the mutation
      }
   };

   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
         if (file.size > 2 * 1024 * 1024) {
            alert("Image must be less than 2MB");
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

   const handleClear = () => {
      reset(defaultCategoryFormValues);
   };

   // All categories can be parents for new categories
   const parentOptions = categories;

   const isPending = addMutation.isPending;

   return (
      <Card className="sticky top-6">
         <CardHeader>
            <CardTitle className="text-lg tracking-tight">Add Category</CardTitle>
            <CardDescription>
               Create a new category
            </CardDescription>
         </CardHeader>

         <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
               {/* Image Upload - Prominent at top */}
               <Field>
                  <FieldLabel className="mb-2">Category Image</FieldLabel>
                  <div className="flex flex-col items-center gap-4">
                     {imagePreview ? (
                        <div className="group relative h-32 w-32 overflow-hidden rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/50">
                           <Image
                              src={imagePreview}
                              alt="Category preview"
                              fill
                              className="object-cover transition-transform group-hover:scale-105"
                           />
                           <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                              <button
                                 type="button"
                                 onClick={handleRemoveImage}
                                 className="rounded-full bg-white/90 p-2 text-gray-700 shadow-lg transition-transform hover:scale-110"
                              >
                                 <X className="h-4 w-4" />
                              </button>
                           </div>
                        </div>
                     ) : (
                        <div
                           className="flex h-32 w-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/50 transition-colors hover:border-primary hover:bg-muted"
                           onClick={() => fileInputRef.current?.click()}
                        >
                           <div className="rounded-full bg-primary/10 p-2">
                              <Upload className="h-5 w-5 text-primary" />
                           </div>
                           <span className="text-xs text-muted-foreground">
                              Upload image
                           </span>
                        </div>
                     )}
                     <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                     />
                     <FieldDescription className="text-center text-xs">
                        Recommended: 400×400px, max 2MB
                     </FieldDescription>
                  </div>
               </Field>

               {/* Name */}
               <Controller
                  control={control}
                  name="name"
                  render={({ field, fieldState }) => (
                     <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="name">
                           Name <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Input
                           id="name"
                           placeholder="e.g. Electronics, Clothing"
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
                        <FieldLabel htmlFor="description">Description</FieldLabel>
                        <Textarea
                           id="description"
                           placeholder="Brief description of the category..."
                           rows={3}
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
                        <FieldLabel htmlFor="parent_id">Parent Category</FieldLabel>
                        <Select
                           value={field.value || "none"}
                           onValueChange={(value) =>
                              field.onChange(value === "none" ? null : value)
                           }
                        >
                           <SelectTrigger id="parent_id">
                              <SelectValue placeholder="Select parent category" />
                           </SelectTrigger>
                           <SelectContent>
                              <SelectItem value="none">
                                 <span className="flex items-center gap-2">
                                    <span className="text-muted-foreground">—</span>
                                    None (Top Level)
                                 </span>
                              </SelectItem>
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
                     <Field orientation="horizontal" className="rounded-lg border p-4">
                        <div className="flex-1 space-y-0.5">
                           <FieldLabel htmlFor="is_active" className="font-medium">
                              Active Status
                           </FieldLabel>
                           <FieldDescription className="text-xs">
                              Inactive categories won&apos;t appear on storefront
                           </FieldDescription>
                        </div>
                        <Switch
                           id="is_active"
                           checked={field.value}
                           onCheckedChange={field.onChange}
                        />
                     </Field>
                  )}
               />

               {/* Actions */}
               <div className="flex gap-3 pt-2">
                  {isDirty && (
                     <Button
                        type="button"
                        variant="outline"
                        onClick={handleClear}
                        disabled={isPending}
                        className="flex-1"
                     >
                        Clear
                     </Button>
                  )}
                  <Button
                     type="submit"
                     disabled={isPending || isSubmitting}
                     className="flex-1"
                  >
                     {isPending ? (
                        <>
                           <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                           Creating...
                        </>
                     ) : (
                        "Create Category"
                     )}
                  </Button>
               </div>
            </form>
         </CardContent>
      </Card>
   );
}
