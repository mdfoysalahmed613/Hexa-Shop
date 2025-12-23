"use client";

import { useRef } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { DialogFooter } from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Upload, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { categoryFormSchema, type CategoryFormData, type Category } from "./category-form-schema";

interface CategoryFormProps {
   onSubmit: (data: CategoryFormData) => Promise<void>;
   submitLabel: string;
   isSubmitting: boolean;
   defaultValues?: Partial<CategoryFormData>;
   category?: Category | null;
   showDialogFooter?: boolean;
}

export function CategoryForm({
   onSubmit,
   submitLabel,
   isSubmitting,
   defaultValues,
   category,
   showDialogFooter = true,
}: CategoryFormProps) {
   const fileInputRef = useRef<HTMLInputElement>(null);

   const {
      control,
      handleSubmit,
      setValue,
      reset,
   } = useForm<CategoryFormData>({
      resolver: zodResolver(categoryFormSchema),
      defaultValues: {
         name: defaultValues?.name || category?.name || "",
         description: defaultValues?.description || category?.description || "",
         is_active: defaultValues?.is_active ?? category?.is_active ?? true,
         image: null,
      },
   });

   // Use useWatch for reactive field values
   const imageFile = useWatch({ control, name: "image" });

   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
         setValue("image", file);
      }
   };

   const removeImage = () => {
      setValue("image", null);
      if (fileInputRef.current) {
         fileInputRef.current.value = "";
      }
   };

   const imagePreview = imageFile
      ? URL.createObjectURL(imageFile)
      : undefined;

   const handleFormSubmit = async (data: CategoryFormData) => {
      await onSubmit(data);
      reset();
   };

   const FormContent = (
      <FieldGroup>
         {/* Category Name */}
         <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
               <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="name">
                     Category Name <span className="text-red-500">*</span>
                  </FieldLabel>
                  <Input
                     id="name"
                     placeholder="e.g., Summer Collection"
                     disabled={isSubmitting}
                     aria-invalid={fieldState.invalid}
                     {...field}
                  />
                  {fieldState.invalid && (
                     <FieldError errors={[fieldState.error]} />
                  )}
               </Field>
            )}
         />

         {/* Description */}
         <Controller
            name="description"
            control={control}
            render={({ field, fieldState }) => (
               <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="description">Description</FieldLabel>
                  <Input
                     id="description"
                     placeholder="Brief description..."
                     disabled={isSubmitting}
                     aria-invalid={fieldState.invalid}
                     {...field}
                     value={field.value || ""}
                  />
                  {fieldState.invalid && (
                     <FieldError errors={[fieldState.error]} />
                  )}
               </Field>
            )}
         />

         {/* Status Toggle */}
         <Controller
            name="is_active"
            control={control}
            render={({ field }) => (
               <Field orientation="horizontal">
                  <FieldLabel htmlFor="is_active" className="flex-1">
                     <div className="space-y-0.5">
                        <span>Active Status</span>
                        <FieldDescription>
                           {field.value ? "Category is visible to customers" : "Category is hidden from customers"}
                        </FieldDescription>
                     </div>
                  </FieldLabel>
                  <Switch
                     id="is_active"
                     checked={field.value}
                     onCheckedChange={field.onChange}
                     disabled={isSubmitting}
                  />
               </Field>
            )}
         />

         {/* Image Upload */}
         <Field>
            <FieldLabel>Category Image</FieldLabel>
            <input
               type="file"
               accept="image/*"
               onChange={handleImageChange}
               ref={fileInputRef}
               className="hidden"
               disabled={isSubmitting}
            />

            {imagePreview ? (
               <div className="relative">
                  <div className="relative h-32 w-full rounded-lg overflow-hidden border">
                     <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-cover"
                     />
                  </div>
                  <Button
                     type="button"
                     variant="destructive"
                     size="icon"
                     className="absolute -top-2 -right-2 h-6 w-6"
                     onClick={removeImage}
                     disabled={isSubmitting}
                  >
                     <X className="h-3 w-3" />
                  </Button>
               </div>
            ) : (
               <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/50 transition-colors"
               >
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">
                     Click to upload image
                  </p>
                  <p className="text-xs text-muted-foreground">
                     PNG, JPG, GIF up to 2MB
                  </p>
               </div>
            )}
         </Field>
      </FieldGroup>
   );

   if (showDialogFooter) {
      return (
         <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            {FormContent}
            <DialogFooter>
               <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                     <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                     </>
                  ) : (
                     submitLabel
                  )}
               </Button>
            </DialogFooter>
         </form>
      );
   }

   return (
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
         {FormContent}
         <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
               <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
               </>
            ) : (
               submitLabel
            )}
         </Button>
      </form>
   );
}
