"use client";

import { Controller, Control } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import type { ProductFormData } from "@/components/admin/products/product-form-schema";

const categories = [
   { value: "t-shirts", label: "T-Shirts" },
   { value: "shirts", label: "Shirts" },
   { value: "pants", label: "Pants" },
   { value: "shoes", label: "Shoes" },
   { value: "watches", label: "Watches" },
];

interface ProductInfoFormProps {
   control: Control<ProductFormData>;
   onNameChange?: (name: string) => void;
}

export function ProductInfoForm({ control, onNameChange }: ProductInfoFormProps) {
   return (
      <Card>
         <CardHeader>
            <CardTitle>Product Information</CardTitle>
            <CardDescription>
               Enter the basic details of your product
            </CardDescription>
         </CardHeader>
         <CardContent>
            <FieldGroup>
               {/* Product Name */}
               <div className="grid gap-4 sm:grid-cols-2">
                  <Controller
                     name="name"
                     control={control}
                     render={({ field, fieldState }) => (
                        <Field>
                           <FieldLabel htmlFor="name">
                              Product Name <span className="text-red-500">*</span>
                           </FieldLabel>
                           <Input
                              id="name"
                              placeholder="e.g., Classic White T-Shirt"
                              {...field}
                              onChange={(e) => {
                                 field.onChange(e);
                                 onNameChange?.(e.target.value);
                              }}
                           />
                           {fieldState.error && (
                              <FieldError errors={[{ message: fieldState.error.message }]} />
                           )}
                        </Field>
                     )}
                  />

                  {/* Slug */}
                  <Controller
                     name="slug"
                     control={control}
                     render={({ field, fieldState }) => (
                        <Field>
                           <FieldLabel htmlFor="slug">
                              Slug <span className="text-red-500">*</span>
                           </FieldLabel>
                           <Input
                              id="slug"
                              placeholder="e.g., classic-white-t-shirt"
                              {...field}
                           />
                           {fieldState.error && (
                              <FieldError errors={[{ message: fieldState.error.message }]} />
                           )}
                        </Field>
                     )}
                  />
               </div>

               {/* Description */}
               <Controller
                  name="description"
                  control={control}
                  render={({ field, fieldState }) => (
                     <Field>
                        <FieldLabel htmlFor="description">Description</FieldLabel>
                        <Textarea
                           id="description"
                           placeholder="Enter product description..."
                           {...field}
                           value={field.value || ""}
                           className="min-h-32"
                        />
                        {fieldState.error && (
                           <FieldError errors={[{ message: fieldState.error.message }]} />
                        )}
                     </Field>
                  )}
               />

               {/* Price and Category */}
               <div className="grid gap-4 sm:grid-cols-2">
                  <Controller
                     name="price"
                     control={control}
                     render={({ field, fieldState }) => (
                        <Field>
                           <FieldLabel htmlFor="price">
                              Price <span className="text-red-500">*</span>
                           </FieldLabel>
                           <Input
                              id="price"
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                           />
                           {fieldState.error && (
                              <FieldError errors={[{ message: fieldState.error.message }]} />
                           )}
                        </Field>
                     )}
                  />

                  <Controller
                     name="category"
                     control={control}
                     render={({ field, fieldState }) => (
                        <Field>
                           <FieldLabel htmlFor="category">
                              Category <span className="text-red-500">*</span>
                           </FieldLabel>
                           <Select
                              value={field.value}
                              onValueChange={field.onChange}
                           >
                              <SelectTrigger id="category" className="w-full">
                                 <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                 {categories.map((cat) => (
                                    <SelectItem key={cat.value} value={cat.value}>
                                       {cat.label}
                                    </SelectItem>
                                 ))}
                              </SelectContent>
                           </Select>
                           {fieldState.error && (
                              <FieldError errors={[{ message: fieldState.error.message }]} />
                           )}
                        </Field>
                     )}
                  />
               </div>

               {/* Stock and SKU */}
               <div className="grid gap-4 sm:grid-cols-2">
                  <Controller
                     name="stock"
                     control={control}
                     render={({ field, fieldState }) => (
                        <Field>
                           <FieldLabel htmlFor="stock">
                              Stock Quantity <span className="text-red-500">*</span>
                           </FieldLabel>
                           <Input
                              id="stock"
                              type="number"
                              min="0"
                              placeholder="0"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                           />
                           {fieldState.error && (
                              <FieldError errors={[{ message: fieldState.error.message }]} />
                           )}
                        </Field>
                     )}
                  />

                  <Controller
                     name="sku"
                     control={control}
                     render={({ field, fieldState }) => (
                        <Field>
                           <FieldLabel htmlFor="sku">SKU (Optional)</FieldLabel>
                           <Input
                              id="sku"
                              placeholder="e.g., TSH-001"
                              {...field}
                              value={field.value || ""}
                           />
                           {fieldState.error && (
                              <FieldError errors={[{ message: fieldState.error.message }]} />
                           )}
                        </Field>
                     )}
                  />
               </div>
            </FieldGroup>
         </CardContent>
      </Card>
   );
}
