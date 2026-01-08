"use client";

/**
 * Product Images Section
 *
 * Handles multi-image upload, preview, and management.
 */

import { useRef, useMemo } from "react";
import { UseFormSetValue, Control, useWatch } from "react-hook-form";
import { X, ImagePlus } from "lucide-react";
import Image from "next/image";
import {
   Card,
   CardContent,
   CardDescription,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import { FieldDescription } from "@/components/ui/field";
import { toast } from "sonner";
import type { ProductFormData } from "./product-form-schema";

interface ProductImagesProps {
   control: Control<ProductFormData>;
   setValue: UseFormSetValue<ProductFormData>;
   isEditing: boolean;
}

export function ProductImages({ control, setValue, isEditing }: ProductImagesProps) {
   const fileInputRef = useRef<HTMLInputElement>(null);

   const watchedNewImages = useWatch({ control, name: "images" });
   const watchedExistingImages = useWatch({ control, name: "existing_images" });
   const watchedDeletedImageIds = useWatch({ control, name: "deleted_image_ids" });

   const newImages = useMemo(() => watchedNewImages || [], [watchedNewImages]);
   const existingImages = useMemo(
      () => watchedExistingImages || [],
      [watchedExistingImages]
   );
   const deletedImageIds = useMemo(
      () => watchedDeletedImageIds || [],
      [watchedDeletedImageIds]
   );

   // Filter existing images that haven't been deleted
   const activeExistingImages = useMemo(() => {
      return existingImages.filter((img) => img.id && !deletedImageIds.includes(img.id));
   }, [existingImages, deletedImageIds]);

   // Image previews for new uploads
   const newImagePreviews = useMemo(() => {
      return newImages
         .filter((file) => file && file.size > 0)
         .map((file) => ({
            file,
            url: URL.createObjectURL(file),
         }));
   }, [newImages]);

   const totalImageCount = activeExistingImages.length + newImagePreviews.length;

   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      const validFiles: File[] = [];

      for (const file of files) {
         if (file.size > 2 * 1024 * 1024) {
            toast.error(`Image must be less than 2MB`);
            continue;
         }
         validFiles.push(file);
      }

      if (validFiles.length > 0) {
         setValue("images", [...newImages, ...validFiles], { shouldDirty: true });
      }
   };

   const handleRemoveNewImage = (index: number) => {
      const updated = newImages.filter((_, i) => i !== index);
      setValue("images", updated, { shouldDirty: true });
   };

   const handleRemoveExistingImage = (imageId: string) => {
      setValue("deleted_image_ids", [...deletedImageIds, imageId], {
         shouldDirty: true,
      });
   };

   return (
      <Card>
         <CardHeader>
            <CardTitle>Product Images</CardTitle>
            <CardDescription>
               Upload up to 10 images. First image will be the main product
               image.
            </CardDescription>
         </CardHeader>
         <CardContent>
            <div className="space-y-4">
               {/* Image Grid */}
               <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {/* Existing Images */}
                  {activeExistingImages.map((image, index) => (
                     <div
                        key={image.id}
                        className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
                     >
                        <Image
                           src={image.image_url || ""}
                           alt={`Product image ${index + 1}`}
                           fill
                           className="object-cover"
                        />
                        {image.is_primary && (
                           <span className="absolute left-2 top-2 rounded bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                              Main
                           </span>
                        )}
                        <button
                           type="button"
                           onClick={() =>
                              image.id && handleRemoveExistingImage(image.id)
                           }
                           className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100"
                        >
                           <X className="h-4 w-4" />
                        </button>
                     </div>
                  ))}

                  {/* New Image Previews */}
                  {newImagePreviews.map((preview, index) => (
                     <div
                        key={`new-${index}`}
                        className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
                     >
                        <Image
                           src={preview.url}
                           alt={`New image ${index + 1}`}
                           fill
                           className="object-cover"
                        />
                        {activeExistingImages.length === 0 && index === 0 && (
                           <span className="absolute left-2 top-2 rounded bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                              Main
                           </span>
                        )}
                        <button
                           type="button"
                           onClick={() => handleRemoveNewImage(index)}
                           className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100"
                        >
                           <X className="h-4 w-4" />
                        </button>
                     </div>
                  ))}

                  {/* Upload Button */}
                  {totalImageCount < 10 && (
                     <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex aspect-square flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 transition-colors hover:border-primary hover:bg-muted"
                     >
                        <div className="rounded-full bg-primary/10 p-2">
                           <ImagePlus className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-xs text-muted-foreground">
                           Add Image
                        </span>
                     </button>
                  )}
               </div>

               <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
               />

               <FieldDescription>
                  Recommended: 800×800px or larger. Max 2MB per image.
                  {!isEditing && totalImageCount === 0 && (
                     <span className="text-destructive">
                        {" "}
                        At least one image is required.
                     </span>
                  )}
               </FieldDescription>
            </div>
         </CardContent>
      </Card>
   );
}
