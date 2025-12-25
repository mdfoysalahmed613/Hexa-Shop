"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RotateCcw, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
   ProductInfoForm,
   ProductImagesForm,
   productFormSchema,
   type ProductFormData,
} from "@/components/admin/products";
import { useProduct, useUpdateProduct } from "@/hooks/use-products";

interface EditProductPageProps {
   params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: EditProductPageProps) {
   const { id } = use(params);
   const router = useRouter();
   const { data: product, isLoading: productLoading } = useProduct(id);
   const updateMutation = useUpdateProduct();

   const form = useForm<ProductFormData>({
      resolver: zodResolver(productFormSchema),
      defaultValues: {
         name: "",
         description: "",
         price: undefined as unknown as number,
         compare_price: undefined,
         category: "",
         stock: 0,
         sku: "",
         is_active: true,
         images: [],
      },
   });

   // Populate form when product data is loaded
   useEffect(() => {
      if (product) {
         form.reset({
            name: product.name,
            description: product.description || "",
            price: product.price,
            compare_price: product.compare_price || undefined,
            category: product.category,
            stock: product.stock,
            sku: product.sku || "",
            is_active: product.is_active,
            // Images will be handled separately - we'll track existing URLs
            images: [],
         });
      }
   }, [product, form]);

   const handleSubmit = async (data: ProductFormData) => {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description || "");
      formData.append("price", data.price.toString());
      formData.append("compare_price", data.compare_price?.toString() || "");
      formData.append("category", data.category);
      formData.append("stock", data.stock.toString());
      formData.append("sku", data.sku || "");
      formData.append("is_active", data.is_active.toString());

      // Append new images
      data.images.forEach((image) => {
         formData.append("images", image.file);
      });

      // If no new images uploaded, keep existing images
      if (data.images.length === 0 && product?.images) {
         formData.append("existing_images", JSON.stringify(product.images));
      } else if (product?.images) {
         // If new images uploaded, still include existing ones
         formData.append("existing_images", JSON.stringify(product.images));
      }

      await updateMutation.mutateAsync({ id, formData });
      router.push("/admin/products");
   };

   if (productLoading) {
      return (
         <div className="flex flex-1 flex-col gap-4 p-6">
            <div className="space-y-2">
               <Skeleton className="h-9 w-64" />
               <Skeleton className="h-5 w-48" />
            </div>
            <div className="grid gap-6 md:grid-cols-3">
               <div className="md:col-span-2">
                  <Skeleton className="h-96 w-full" />
               </div>
               <div>
                  <Skeleton className="h-64 w-full" />
               </div>
            </div>
         </div>
      );
   }

   if (!product) {
      return (
         <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
            <h1 className="text-2xl font-bold">Product Not Found</h1>
            <p className="text-muted-foreground">
               The product you&apos;re looking for doesn&apos;t exist.
            </p>
            <Button asChild>
               <Link href="/admin/products">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Products
               </Link>
            </Button>
         </div>
      );
   }

   return (
      <div className="flex flex-1 flex-col gap-4 p-6">
         {/* Header */}
         <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
               <Link href="/admin/products">
                  <ArrowLeft className="h-4 w-4" />
               </Link>
            </Button>
            <div>
               <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
               <p className="text-muted-foreground">
                  Update &quot;{product.name}&quot;
               </p>
            </div>
         </div>

         <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="grid gap-6 md:grid-cols-3">
               {/* Main Product Information */}
               <div className="md:col-span-2 space-y-6">
                  <ProductInfoForm control={form.control} />
               </div>

               {/* Sidebar: Images and Actions */}
               <div className="space-y-6">
                  {/* Existing Images Preview */}
                  {product.images && product.images.length > 0 && (
                     <Card>
                        <CardContent className="pt-6">
                           <h3 className="text-sm font-medium mb-3">Current Images</h3>
                           <div className="grid grid-cols-2 gap-2">
                              {product.images.map((url, index) => (
                                 <div
                                    key={index}
                                    className="relative aspect-square rounded-md overflow-hidden border"
                                 >
                                    <Image
                                       src={url}
                                       alt={`Product ${index + 1}`}
                                       fill
                                       className="object-cover"
                                    />
                                    {index === 0 && (
                                       <div className="absolute bottom-1 left-1">
                                          <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                                             Primary
                                          </span>
                                       </div>
                                    )}
                                 </div>
                              ))}
                           </div>
                        </CardContent>
                     </Card>
                  )}

                  {/* Upload New Images */}
                  <ProductImagesForm control={form.control} />

                  {/* Action Buttons */}
                  <Card>
                     <CardContent className="pt-6 space-y-2">
                        <Button
                           type="submit"
                           className="w-full"
                           disabled={updateMutation.isPending}
                        >
                           {updateMutation.isPending ? (
                              <>
                                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                 Saving Changes...
                              </>
                           ) : (
                              "Save Changes"
                           )}
                        </Button>
                        <Button
                           type="button"
                           variant="outline"
                           className="w-full"
                           onClick={() => form.reset()}
                           disabled={updateMutation.isPending}
                        >
                           <RotateCcw className="mr-2 h-4 w-4" />
                           Reset Changes
                        </Button>
                     </CardContent>
                  </Card>
               </div>
            </div>
         </form>
      </div>
   );
}
