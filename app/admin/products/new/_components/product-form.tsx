"use client";

/**
 * Product Form
 *
 * Comprehensive form for creating/editing products.
 * Handles product details, variants, and image uploads.
 *
 * Features:
 * - Basic info: name, description (rich text), category
 * - Multiple variants with price, compare price, stock
 * - Multi-image upload with drag-and-drop
 * - Primary image selection
 * - Form validation via Zod schema
 *
 * Used by:
 * - /admin/products/new (create mode)
 * - /admin/products/[id]/edit (edit mode)
 */

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import {
   productFormSchema,
   type ProductFormData,
   defaultProductFormValues,
   defaultVariant,
   type ValidSize,
   VALID_SIZES,
} from "./product-form-schema";
import { useAddProduct, useUpdateProduct } from "@/hooks/use-products";
import { type Product } from "@/lib/services/products";

import { ProductBasicInfo } from "./product-basic-info";
import { ProductVariants } from "./product-variants";
import { ProductImages } from "./product-images";
import { ProductSettings } from "./product-settings";
import { ProductActions } from "./product-actions";

export function ProductForm({ product }: { product?: Product }) {
   const router = useRouter();
   const isEditing = !!product;

   const addMutation = useAddProduct();
   const updateMutation = useUpdateProduct();

   const {
      control,
      handleSubmit,
      setValue,
      formState: { isSubmitting, errors },
   } = useForm<ProductFormData>({
      resolver: zodResolver(productFormSchema),
      defaultValues: product
         ? {
            name: product.name,
            description: product.description || "",
            category_id: product.category,
            is_active: product.is_active,
            variants:
               product.variants && product.variants.length > 0
                  ? product.variants.map((v) => ({
                     id: v.id,
                     price: v.price || 0,
                     compare_price: v.compare_price || null,
                     stock: v.stock,
                     is_active: v.is_active,
                     sku: v.sku || null,
                     size: (v.size && VALID_SIZES.includes(v.size as ValidSize) ? v.size : null) as ValidSize | null,
                     color: v.color || null,
                  }))
                  : [defaultVariant],
            images: [],
            existing_images:
               product.images?.map((img) => ({
                  id: img.id,
                  image_url: img.url,
                  is_primary: img.is_primary,
               })) || [],
            deleted_image_ids: [],
         }
         : defaultProductFormValues,
   });

   const watchedNewImages = useWatch({ control, name: "images" });
   const watchedDeletedImageIds = useWatch({ control, name: "deleted_image_ids" });

   const onSubmit = async (data: ProductFormData) => {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description || "");
      formData.append("category_id", data.category_id);
      formData.append("is_active", String(data.is_active));

      // Add variants as JSON
      formData.append("variants", JSON.stringify(data.variants));

      // Add new images
      if (data.images) {
         data.images.forEach((image) => {
            if (image && image.size > 0) {
               formData.append("images", image);
            }
         });
      }

      // Add existing and deleted image IDs for updates
      if (isEditing) {
         formData.append(
            "existing_images",
            JSON.stringify(data.existing_images?.filter((img) => img.id && !data.deleted_image_ids?.includes(img.id)))
         );
         formData.append(
            "deleted_image_ids",
            JSON.stringify(data.deleted_image_ids)
         );
      }

      try {
         if (isEditing && product) {
            await updateMutation.mutateAsync({ id: product.id, formData });
         } else {
            await addMutation.mutateAsync(formData);
         }
         router.push("/admin/products");
      } catch {
         // Error is handled by the mutation
      }
   };

   const isPending = addMutation.isPending || updateMutation.isPending || isSubmitting;

   // Suppress unused variable warnings - these are used for form state management
   void watchedNewImages;
   void watchedDeletedImageIds;

   return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
         <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            {/* Main Content */}
            <div className="space-y-6">
               <ProductBasicInfo control={control} />
               <ProductVariants control={control} errors={errors} />
               <ProductImages
                  control={control}
                  setValue={setValue}
                  isEditing={isEditing}
               />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
               <ProductSettings control={control} />
               <ProductActions isEditing={isEditing} isPending={isPending} />
            </div>
         </div>
      </form>
   );
}
