"use client";

import { useRef, useMemo, forwardRef, useImperativeHandle } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, ImagePlus, Loader2, Save } from "lucide-react";
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
} from "./product-form-schema";
import { useCategories } from "@/hooks/use-categories";
import { useAddProduct, useUpdateProduct } from "@/hooks/use-products";
import { type Product } from "@/lib/services/products";

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
         formState: { isSubmitting },
      } = useForm<ProductFormData>({
         resolver: zodResolver(productFormSchema),
         defaultValues: product
            ? {
               name: product.name,
               description: product.description || "",
               category: product.category,
               is_active: product.is_active,
               images: [],
               existing_image_ids: product.images?.map((img) => img.id) || [],
               deleted_image_ids: [],
            }
            : defaultProductFormValues,
      });

      const watchedNewImages = useWatch({ control, name: "images" });
      const watchedExistingImageIds = useWatch({ control, name: "existing_image_ids" });
      const watchedDeletedImageIds = useWatch({ control, name: "deleted_image_ids" });

      const newImages = useMemo(() => watchedNewImages || [], [watchedNewImages]);
      const existingImageIds = useMemo(() => watchedExistingImageIds || [], [watchedExistingImageIds]);
      const deletedImageIds = useMemo(() => watchedDeletedImageIds || [], [watchedDeletedImageIds]);

      // Get existing images that haven't been deleted
      const existingImages = useMemo(() => {
         const images = product?.images;
         if (!images) return [];
         return images.filter((img) => !deletedImageIds.includes(img.id));
      }, [product?.images, deletedImageIds]);

      // Image previews for new uploads
      const newImagePreviews = useMemo(() => {
         return newImages
            .filter((file) => file && file.size > 0)
            .map((file) => ({
               file,
               url: URL.createObjectURL(file),
            }));
      }, [newImages]);

      const totalImageCount = existingImages.length + newImagePreviews.length;

      const onSubmit = async (data: ProductFormData) => {
         const formData = new FormData();
         formData.append("name", data.name);
         formData.append("description", data.description || "");
         formData.append("category", data.category);
         formData.append("is_active", String(data.is_active));

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
               "existing_image_ids",
               JSON.stringify(data.existing_image_ids)
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
               alert(`Image "${file.name}" must be less than 2MB`);
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
         setValue(
            "existing_image_ids",
            existingImageIds.filter((id) => id !== imageId),
            { shouldDirty: true }
         );
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
                                    Use rich text formatting to create engaging product descriptions
                                 </FieldDescription>
                                 {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                 )}
                              </Field>
                           )}
                        />
                     </CardContent>
                  </Card>

                  {/* Images */}
                  <Card>
                     <CardHeader>
                        <CardTitle>Product Images</CardTitle>
                        <CardDescription>
                           Upload up to 10 images. First image will be the main product image.
                        </CardDescription>
                     </CardHeader>
                     <CardContent>
                        <div className="space-y-4">
                           {/* Image Grid */}
                           <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                              {/* Existing Images */}
                              {existingImages.map((image, index) => (
                                 <div
                                    key={image.id}
                                    className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
                                 >
                                    <Image
                                       src={image.url}
                                       alt={`Product image ${index + 1}`}
                                       fill
                                       className="object-cover"
                                    />
                                    {index === 0 && (
                                       <span className="absolute left-2 top-2 rounded bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                                          Main
                                       </span>
                                    )}
                                    <button
                                       type="button"
                                       onClick={() => handleRemoveExistingImage(image.id)}
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
                                    {existingImages.length === 0 && index === 0 && (
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
                                 <span className="text-destructive"> At least one image is required.</span>
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
                              <Field orientation="horizontal" className="rounded-lg border p-4">
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
                           name="category"
                           render={({ field, fieldState }) => (
                              <Field data-invalid={fieldState.invalid}>
                                 <FieldLabel htmlFor="category">
                                    Category <span className="text-destructive">*</span>
                                 </FieldLabel>
                                 <Select
                                    value={field.value || ""}
                                    onValueChange={field.onChange}
                                 >
                                    <SelectTrigger id="category">
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
   });
