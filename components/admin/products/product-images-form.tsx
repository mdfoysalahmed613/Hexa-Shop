"use client";

import { Controller, Control } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
   Card,
   CardContent,
   CardDescription,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import { Upload, X, ImagePlus } from "lucide-react";
import { Field, FieldError } from "@/components/ui/field";
import Image from "next/image";
import { toast } from "sonner";
import type { ProductFormData, ProductImage } from "@/components/admin/products/product-form-schema";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

interface ProductImagesFormProps {
   control: Control<ProductFormData>;
}

async function processImageFiles(
   files: FileList,
   currentImages: ProductImage[]
): Promise<ProductImage[]> {
   const validFiles: File[] = [];

   Array.from(files).forEach((file) => {
      // Validate file size (2MB max)
      if (file.size > MAX_FILE_SIZE) {
         toast.error(`${file.name} is too large. Max size is 2MB.`);
         return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
         toast.error(`${file.name} is not a valid image file.`);
         return;
      }

      validFiles.push(file);
   });

   if (validFiles.length === 0) {
      return currentImages;
   }

   // Read all valid files
   const imagePromises = validFiles.map((file) => {
      return new Promise<ProductImage>((resolve, reject) => {
         const reader = new FileReader();
         reader.onloadend = () => {
            resolve({
               file,
               preview: reader.result as string,
            });
         };
         reader.onerror = reject;
         reader.readAsDataURL(file);
      });
   });

   try {
      const newImages = await Promise.all(imagePromises);
      return [...currentImages, ...newImages];
   } catch {
      toast.error("Failed to read image files");
      return currentImages;
   }
}

export function ProductImagesForm({ control }: ProductImagesFormProps) {
   const handleImageChange = async (
      e: React.ChangeEvent<HTMLInputElement>,
      fieldValue: ProductImage[],
      fieldOnChange: (value: ProductImage[]) => void
   ) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      const updatedImages = await processImageFiles(files, fieldValue);
      fieldOnChange(updatedImages);

      // Reset input
      e.target.value = "";
   };

   return (
      <Card>
         <CardHeader>
            <CardTitle>Product Images</CardTitle>
            <CardDescription>Upload multiple product images</CardDescription>
         </CardHeader>
         <CardContent>
            <Controller
               name="images"
               control={control}
               render={({ field, fieldState }) => (
                  <Field>
                     <div className="space-y-4">
                        {/* Image Grid */}
                        {field.value.length > 0 && (
                           <div className="grid grid-cols-2 gap-4">
                              {field.value.map((image: ProductImage, index: number) => (
                                 <div key={index} className="relative group">
                                    <Image
                                       src={image.preview}
                                       alt={`Product ${index + 1}`}
                                       width={200}
                                       height={128}
                                       className="w-full h-32 object-cover rounded-md border"
                                    />
                                    <Button
                                       type="button"
                                       variant="destructive"
                                       size="icon"
                                       className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                       onClick={() => {
                                          const updated = field.value.filter(
                                             (_: ProductImage, i: number) => i !== index
                                          );
                                          field.onChange(updated);
                                       }}
                                    >
                                       <X className="h-3 w-3" />
                                    </Button>
                                    {index === 0 && (
                                       <div className="absolute bottom-2 left-2">
                                          <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                                             Primary
                                          </span>
                                       </div>
                                    )}
                                 </div>
                              ))}
                           </div>
                        )}

                        {/* Upload Area */}
                        <Label
                           htmlFor="images"
                           className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/50 transition-colors"
                        >
                           <div className="flex flex-col items-center justify-center py-4">
                              {field.value.length === 0 ? (
                                 <>
                                    <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                                    <p className="mb-1 text-sm text-muted-foreground">
                                       <span className="font-semibold">
                                          Click to upload
                                       </span>
                                    </p>
                                 </>
                              ) : (
                                 <>
                                    <ImagePlus className="w-6 h-6 mb-2 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">
                                       <span className="font-semibold">
                                          Add more images
                                       </span>
                                    </p>
                                 </>
                              )}
                              <p className="text-xs text-muted-foreground mt-1">
                                 PNG, JPG or WEBP (MAX. 2MB each)
                              </p>
                           </div>
                           <Input
                              id="images"
                              type="file"
                              className="hidden"
                              accept="image/*"
                              multiple
                              onChange={(e) =>
                                 handleImageChange(e, field.value, field.onChange)
                              }
                           />
                        </Label>

                        {field.value.length > 0 && (
                           <p className="text-xs text-muted-foreground">
                              {field.value.length}{" "}
                              {field.value.length === 1 ? "image" : "images"}{" "}
                              selected. First image will be the primary image.
                           </p>
                        )}
                     </div>
                     {fieldState.error && (
                        <FieldError
                           errors={[{ message: fieldState.error.message }]}
                        />
                     )}
                  </Field>
               )}
            />
         </CardContent>
      </Card>
   );
}
