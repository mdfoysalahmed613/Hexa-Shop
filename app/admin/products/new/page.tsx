"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";
import {
   ProductInfoForm,
   ProductImagesForm,
   productFormSchema,
   defaultProductFormValues,
   type ProductFormData,
} from "@/components/admin/products";
import { addProduct } from "@/app/actions/add-product";

export default function AddNewProductPage() {
   const router = useRouter();
   const [isLoading, setIsLoading] = useState(false);

   const form = useForm<ProductFormData>({
      resolver: zodResolver(productFormSchema),
      defaultValues: defaultProductFormValues,
   });

   const handleReset = () => {
      form.reset(defaultProductFormValues);
   };

   const handleSubmit = async (data: ProductFormData) => {
      setIsLoading(true);

      try {
         // Prepare form data for server action
         const formData = new FormData();
         formData.append("name", data.name);
         formData.append("description", data.description || "");
         formData.append("price", data.price.toString());
         formData.append("compare_price", data.compare_price?.toString() || "");
         formData.append("category", data.category);
         formData.append("stock", data.stock.toString());
         formData.append("sku", data.sku || "");
         formData.append("is_active", data.is_active.toString());

         // Append images
         data.images.forEach((image) => {
            formData.append("images", image.file);
         });

         const result = await addProduct(formData);

         if (!result.ok) {
            throw new Error(result.error);
         }

         toast.success("Product added successfully!");
         router.push("/admin/products");
      } catch (error: unknown) {
         toast.error(
            error instanceof Error ? error.message : "Failed to add product"
         );
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <div className="flex flex-1 flex-col gap-4 p-6">
         {/* Header */}
         <div>
            <h1 className="text-3xl font-bold tracking-tight">Add New Product</h1>
            <p className="text-muted-foreground">
               Create a new product in your inventory
            </p>
         </div>

         <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="grid gap-6 md:grid-cols-3">
               {/* Main Product Information */}
               <div className="md:col-span-2 space-y-6">
                  <ProductInfoForm control={form.control} />
               </div>

               {/* Sidebar: Images and Actions */}
               <div className="space-y-6">
                  <ProductImagesForm control={form.control} />

                  {/* Action Buttons */}
                  <Card>
                     <CardContent className="pt-6 space-y-2">
                        <Button type="submit" className="w-full" disabled={isLoading}>
                           {isLoading ? "Adding Product..." : "Add Product"}
                        </Button>
                        <Button
                           type="button"
                           variant="outline"
                           className="w-full"
                           onClick={handleReset}
                           disabled={isLoading}
                        >
                           <RotateCcw className="mr-2 h-4 w-4" />
                           Reset Form
                        </Button>
                     </CardContent>
                  </Card>
               </div>
            </div>
         </form>
      </div>
   );
}
