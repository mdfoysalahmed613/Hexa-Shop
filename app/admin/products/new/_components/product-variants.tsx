"use client";

/**
 * Product Variants Section
 *
 * Handles multiple product variants with pricing, stock, SKU, size and color.
 */

import {
   Controller,
   Control,
   useFieldArray,
   FieldErrors,
} from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import { defaultVariant, VALID_SIZES, type ProductFormData } from "./product-form-schema";

interface ProductVariantsProps {
   control: Control<ProductFormData>;
   errors: FieldErrors<ProductFormData>;
}

export function ProductVariants({ control, errors }: ProductVariantsProps) {
   const {
      fields: variantFields,
      append: appendVariant,
      remove: removeVariant,
   } = useFieldArray({
      control,
      name: "variants",
   });

   return (
      <Card>
         <CardHeader>
            <div className="flex items-center justify-between">
               <div>
                  <CardTitle>Product Variants</CardTitle>
                  <CardDescription>
                     Add pricing, stock, and size/color options for each variant
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

                  {/* Stock and SKU */}
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
                        name={`variants.${index}.sku`}
                        render={({ field, fieldState }) => (
                           <Field data-invalid={fieldState.invalid}>
                              <FieldLabel htmlFor={`sku-${index}`}>
                                 SKU <span className="text-destructive">*</span>
                              </FieldLabel>
                              <Input
                                 id={`sku-${index}`}
                                 placeholder="Enter SKU (e.g. PROD-001)"
                                 {...field}
                                 value={field.value ?? ""}
                                 onChange={(e) => field.onChange(e.target.value)}
                                 aria-invalid={fieldState.invalid}
                              />
                              {fieldState.invalid && (
                                 <FieldError errors={[fieldState.error]} />
                              )}
                           </Field>
                        )}
                     />
                  </div>

                  {/* Size and Color */}
                  <div className="grid grid-cols-2 gap-4">
                     <Controller
                        control={control}
                        name={`variants.${index}.size`}
                        render={({ field, fieldState }) => (
                           <Field data-invalid={fieldState.invalid}>
                              <FieldLabel htmlFor={`size-${index}`}>
                                 Size
                              </FieldLabel>
                              <Select
                                 value={field.value ?? ""}
                                 onValueChange={(value) => field.onChange(value || null)}
                              >
                                 <SelectTrigger id={`size-${index}`}>
                                    <SelectValue placeholder="Select size (optional)" />
                                 </SelectTrigger>
                                 <SelectContent>
                                    {VALID_SIZES.map((size) => (
                                       <SelectItem key={size} value={size}>
                                          {size}
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

                     <Controller
                        control={control}
                        name={`variants.${index}.color`}
                        render={({ field, fieldState }) => (
                           <Field data-invalid={fieldState.invalid}>
                              <FieldLabel htmlFor={`color-${index}`}>
                                 Color
                              </FieldLabel>
                              <Input
                                 id={`color-${index}`}
                                 placeholder="e.g. Red, Blue, Black"
                                 {...field}
                                 value={field.value ?? ""}
                                 onChange={(e) => field.onChange(e.target.value || null)}
                                 aria-invalid={fieldState.invalid}
                              />
                              {fieldState.invalid && (
                                 <FieldError errors={[fieldState.error]} />
                              )}
                           </Field>
                        )}
                     />
                  </div>
               </div>
            ))}
         </CardContent>
      </Card>
   );
}
