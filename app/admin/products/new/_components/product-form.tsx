"use client";

import { useRef, useMemo, forwardRef, useImperativeHandle } from "react";
import { useForm, Controller, useWatch, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, ImagePlus, Loader2, Save, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Tiptap } from "@/components/ui/tiptap";

import {
   productFormSchema,
   type ProductFormData,
   defaultProductFormValues,
   defaultVariant,
} from "./product-form-schema";
import { useCategories } from "@/hooks/use-categories";
import { useAddProduct, useUpdateProduct } from "@/hooks/use-products";
import { type Product } from "@/lib/services/products";
import { toast } from "sonner";

export interface ProductFormHandle {
   submit: () => void;
   reset: () => void;
}

interface ProductFormProps {
   product?: Product | null;
}

export const ProductForm = forwardRef<ProductFormHandle, ProductFormProps>(
   function ProductForm({ product }, ref) {
      const router = useRouter();
      const isEditing = !!product;
      const fileInputRef = useRef<HTMLInputElement>(null);

      const { data: categories = [] } = useCategories();
      const addMutation = useAddProduct();
      const updateMutation = useUpdateProduct();

      const {
         control,
         handleSubmit,
         setValue,
         reset,
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
                        price: v.price || v.price_adjustment || 0,
                        compare_price: v.compare_price || null,
                        stock: v.stock,
                        is_active: v.is_active,
                        attributes: v.attributes || null,
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

      // Variants field array
      const {
         fields: variantFields,
         append: appendVariant,
         remove: removeVariant,
      } = useFieldArray({
         control,
         name: "variants",
      });

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

      // Expose submit and reset methods to parent
      useImperativeHandle(ref, () => ({
         submit: () => handleSubmit(onSubmit)(),
         reset: () => reset(defaultProductFormValues),
      }));

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

      const handleSetPrimaryImage = (imageId: string, isNew: boolean, index?: number) => {
         if (isNew && index !== undefined) {
            // For new images, we'll handle primary status on submit
            // Just visually indicate it for now
         } else {
            // Update existing images primary status
            const updated = existingImages.map((img) => ({
               ...img,
               is_primary: img.id === imageId,
            }));
            setValue("existing_images", updated, { shouldDirty: true });
         }
      };

      const isPending = addMutation.isPending || updateMutation.isPending;

      // Filter active categories
      const activeCategories = categories.filter((c) => c.is_active);

      return (
         <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
               {/* Main Content */}
               <div className="space-y-6">
                  {/* Basic Information */}
                  <Card>
                     <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                        <CardDescription>
                           Enter the basic details about your product
                        </CardDescription>
                     </CardHeader>
                     <CardContent className="space-y-4">
                        {/* Name */}
                        <Controller
                           control={control}
                           name="name"
                           render={({ field, fieldState }) => (
                              <Field data-invalid={fieldState.invalid}>
                                 <FieldLabel htmlFor="name">
                                    Product Name <span className="text-destructive">*</span>
                                 </FieldLabel>
                                 <Input
                                    id="name"
                                    placeholder="e.g. Classic Cotton T-Shirt"
                                    {...field}
                                    aria-invalid={fieldState.invalid}
                                 />
                                 {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                 )}
                              </Field>
                           )}
                        />

                        {/* Description with TipTap */}
                        <Controller
                           control={control}
                           name="description"
                           render={({ field, fieldState }) => (
                              <Field data-invalid={fieldState.invalid}>
                                 <FieldLabel htmlFor="description">Description</FieldLabel>
                                 <Tiptap
                                    content={field.value || ""}
                                    onChange={field.onChange}
                                    placeholder="Describe your product in detail..."
                                 />
                                 <FieldDescription>
                                    Use rich text formatting to create engaging product
                                    descriptions
                                 </FieldDescription>
                                 {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                 )}
                              </Field>
                           )}
                        />
                     </CardContent>
                  </Card>

                  {/* Product Variants */}
                  <Card>
                     <CardHeader>
                        <div className="flex items-center justify-between">
                           <div>
                              <CardTitle>Product Variants</CardTitle>
                              <CardDescription>
                                 Add pricing, stock, and optional attributes for each variant
                              </CardDescription>
                           </div>
                           <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => appendVariant(defaultVariant)}
                           >
                              <Plus className="mr-2 h-4 w-4" />
                              Add Variant
                           </Button>
                        </div>
                     </CardHeader>
                     <CardContent className="space-y-4">
                        {errors.variants?.root && (
                           <p className="text-sm text-destructive">
                              {errors.variants.root.message}
                           </p>
                        )}

                        {variantFields.map((variantField, index) => (
                           <div
                              key={variantField.id}
                              className="relative rounded-lg border p-4 space-y-4"
                           >
                              {/* Variant Header */}
                              <div className="flex items-center justify-between">
                                 <h4 className="font-medium text-sm">
                                    Variant {index + 1}
                                 </h4>
                                 {variantFields.length > 1 && (
                                    <Button
                                       type="button"
                                       variant="ghost"
                                       size="sm"
                                       onClick={() => removeVariant(index)}
                                       className="text-destructive hover:text-destructive"
                                    >
                                       <Trash2 className="h-4 w-4" />
                                    </Button>
                                 )}
                              </div>

                              {/* Price and Compare Price */}
                              <div className="grid grid-cols-2 gap-4">
                                 <Controller
                                    control={control}
                                    name={`variants.${index}.price`}
                                    render={({ field, fieldState }) => (
                                       <Field data-invalid={fieldState.invalid}>
                                          <FieldLabel htmlFor={`price-${index}`}>
                                             Price <span className="text-destructive">*</span>
                                          </FieldLabel>
                                          <Input
                                             id={`price-${index}`}
                                             type="number"
                                             min={0}
                                             step="0.01"
                                             placeholder="0.00"
                                             {...field}
                                             value={field.value ?? ""}
                                             onChange={(e) =>
                                                field.onChange(
                                                   e.target.value
                                                      ? parseFloat(e.target.value)
                                                      : 0
                                                )
                                             }
                                             aria-invalid={fieldState.invalid}
                                          />
                                          {fieldState.invalid && (
                                             <FieldError errors={[fieldState.error]} />
                                          )}
                                       </Field>
                                    )}
                                 />

                                 <Controller
                                    control={control}
                                    name={`variants.${index}.compare_price`}
                                    render={({ field, fieldState }) => (
                                       <Field data-invalid={fieldState.invalid}>
                                          <FieldLabel htmlFor={`compare_price-${index}`}>
                                             Compare Price
                                          </FieldLabel>
                                          <Input
                                             id={`compare_price-${index}`}
                                             type="number"
                                             min={0}
                                             step="0.01"
                                             placeholder="0.00"
                                             {...field}
                                             value={field.value ?? ""}
                                             onChange={(e) =>
                                                field.onChange(
                                                   e.target.value
                                                      ? parseFloat(e.target.value)
                                                      : null
                                                )
                                             }
                                             aria-invalid={fieldState.invalid}
                                          />
                                          {fieldState.invalid && (
                                             <FieldError errors={[fieldState.error]} />
                                          )}
                                       </Field>
                                    )}
                                 />
                              </div>

                              {/* Stock and Active */}
                              <div className="grid grid-cols-2 gap-4">
                                 <Controller
                                    control={control}
                                    name={`variants.${index}.stock`}
                                    render={({ field, fieldState }) => (
                                       <Field data-invalid={fieldState.invalid}>
                                          <FieldLabel htmlFor={`stock-${index}`}>
                                             Stock <span className="text-destructive">*</span>
                                          </FieldLabel>
                                          <Input
                                             id={`stock-${index}`}
                                             type="number"
                                             min={0}
                                             step="1"
                                             placeholder="0"
                                             {...field}
                                             value={field.value ?? ""}
                                             onChange={(e) =>
                                                field.onChange(
                                                   e.target.value
                                                      ? parseInt(e.target.value, 10)
                                                      : 0
                                                )
                                             }
                                             aria-invalid={fieldState.invalid}
                                          />
                                          {fieldState.invalid && (
                                             <FieldError errors={[fieldState.error]} />
                                          )}
                                       </Field>
                                    )}
                                 />

                                 <Controller
                                    control={control}
                                    name={`variants.${index}.is_active`}
                                    render={({ field }) => (
                                       <Field
                                          orientation="horizontal"
                                          className="h-full items-end pb-2"
                                       >
                                          <div className="flex items-center gap-2">
                                             <Switch
                                                id={`variant_active-${index}`}
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                             />
                                             <FieldLabel
                                                htmlFor={`variant_active-${index}`}
                                                className="font-normal"
                                             >
                                                Active
                                             </FieldLabel>
                                          </div>
                                       </Field>
                                    )}
                                 />
                              </div>

                              {/* Attributes (optional key-value pairs) */}
                              <FieldDescription className="text-xs">
                                 Attributes like Color, Size can be added as key-value
                                 pairs in the database.
                              </FieldDescription>
                           </div>
                        ))}
                     </CardContent>
                  </Card>

                  {/* Images */}
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
               </div>

               {/* Sidebar */}
               <div className="space-y-6">
                  {/* Settings - Combined Active & Category */}
                  <Card>
                     <CardHeader>
                        <CardTitle>Settings</CardTitle>
                     </CardHeader>
                     <CardContent className="space-y-4">
                        {/* Active Status */}
                        <Controller
                           control={control}
                           name="is_active"
                           render={({ field }) => (
                              <Field
                                 orientation="horizontal"
                                 className="rounded-lg border p-4"
                              >
                                 <div className="flex-1 space-y-0.5">
                                    <FieldLabel htmlFor="is_active" className="font-medium">
                                       Active
                                    </FieldLabel>
                                    <FieldDescription className="text-xs">
                                       Visible on storefront
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

                        {/* Category */}
                        <Controller
                           control={control}
                           name="category_id"
                           render={({ field, fieldState }) => (
                              <Field data-invalid={fieldState.invalid}>
                                 <FieldLabel htmlFor="category_id">
                                    Category <span className="text-destructive">*</span>
                                 </FieldLabel>
                                 <Select
                                    value={field.value || ""}
                                    onValueChange={field.onChange}
                                 >
                                    <SelectTrigger id="category_id">
                                       <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                       {activeCategories.map((cat) => (
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
                     </CardContent>
                  </Card>

                  {/* Actions */}
                  <Card>
                     <CardContent className="pt-6">
                        <div className="flex flex-col gap-3">
                           <Button
                              type="submit"
                              disabled={isPending || isSubmitting}
                              className="w-full"
                              size="lg"
                           >
                              {isPending ? (
                                 <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {isEditing ? "Updating..." : "Creating..."}
                                 </>
                              ) : (
                                 <>
                                    <Save className="mr-2 h-4 w-4" />
                                    {isEditing ? "Update Product" : "Save Product"}
                                 </>
                              )}
                           </Button>
                           <Button
                              type="button"
                              variant="outline"
                              asChild
                              disabled={isPending}
                              className="w-full"
                           >
                              <Link href="/admin/products">
                                 <X className="mr-2 h-4 w-4" />
                                 Discard
                              </Link>
                           </Button>
                        </div>
                     </CardContent>
                  </Card>
               </div>
            </div>
         </form>
      );
   }
);
