"use client";

import { Controller, Control } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Tiptap } from "@/components/ui/tiptap";
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
}

export function ProductInfoForm({ control }: ProductInfoFormProps) {
   return (
      <Card>
         <CardContent>
            <FieldGroup>
               {/* Product Name and Category */}
               <div className="grid gap-4 sm:grid-cols-2">
                  <Controller
                     name="name"
                     control={control}
                     render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                           <FieldLabel htmlFor="name">
                              Product Name <span className="text-red-500">*</span>
                           </FieldLabel>
                           <Input
                              id="name"
                              placeholder="e.g., Classic White T-Shirt"
                              aria-invalid={fieldState.invalid}
                              {...field}
                           />
                           {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
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

               {/* Description */}
               <Controller
                  name="description"
                  control={control}
                  render={({ field, fieldState }) => (
                     <Field>
                        <FieldLabel htmlFor="description">Description</FieldLabel>
                        <Tiptap
                           content={field.value || ""}
                           onChange={field.onChange}
                           placeholder="Enter product description..."
                        />
                        {fieldState.error && (
                           <FieldError errors={[{ message: fieldState.error.message }]} />
                        )}
                     </Field>
                  )}
               />

               {/* Price and Compare Price */}
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
                              min="1"
                              placeholder="Enter price"
                              value={field.value === 0 ? "" : field.value}
                              onChange={(e) => {
                                 const val = e.target.value;
                                 field.onChange(val === "" ? undefined : parseFloat(val));
                              }}
                           />
                           {fieldState.error && (
                              <FieldError errors={[{ message: fieldState.error.message }]} />
                           )}
                        </Field>
                     )}
                  />

                  <Controller
                     name="compare_price"
                     control={control}
                     render={({ field, fieldState }) => (
                        <Field>
                           <FieldLabel htmlFor="compare_price">
                              Compare Price (Original)
                           </FieldLabel>
                           <Input
                              id="compare_price"
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="e.g., 99.99"
                              value={field.value ?? ""}
                              onChange={(e) => {
                                 const val = e.target.value;
                                 field.onChange(val === "" ? undefined : parseFloat(val));
                              }}
                           />
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

               {/* Status */}
               <Controller
                  name="is_active"
                  control={control}
                  render={({ field, fieldState }) => (
                     <Field>
                        <FieldLabel htmlFor="is_active">Status</FieldLabel>
                        <Select
                           value={field.value ? "active" : "draft"}
                           onValueChange={(val) => field.onChange(val === "active")}
                        >
                           <SelectTrigger id="is_active" className="w-full">
                              <SelectValue placeholder="Select status" />
                           </SelectTrigger>
                           <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="draft">Draft</SelectItem>
                           </SelectContent>
                        </Select>
                        {fieldState.error && (
                           <FieldError errors={[{ message: fieldState.error.message }]} />
                        )}
                     </Field>
                  )}
               />
            </FieldGroup>
         </CardContent>
      </Card>
   );
}
