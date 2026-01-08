"use client";

/**
 * Product Variants Section
 *
 * Handles multiple product variants with pricing, stock, and attributes.
 */

import {
   Controller,
   Control,
   useFieldArray,
   FieldErrors,
} from "react-hook-form";
import { Plus, Trash2, X } from "lucide-react";
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
import { defaultVariant, type ProductFormData } from "./product-form-schema";

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
                     Add pricing, stock, and variant names for each option
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

                  {/* Stock and Variant Name */}
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
                        name={`variants.${index}.variant_name`}
                        render={({ field, fieldState }) => (
                           <Field data-invalid={fieldState.invalid}>
                              <FieldLabel htmlFor={`variant_name-${index}`}>
                                 Variant Name
                              </FieldLabel>
                              <Input
                                 id={`variant_name-${index}`}
                                 placeholder="e.g. Red / Large"
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

                  {/* Variant Attributes */}
                  <Controller
                     control={control}
                     name={`variants.${index}.attributes`}
                     render={({ field }) => (
                        <AttributesEditor
                           attributes={field.value || {}}
                           onChange={field.onChange}
                           variantIndex={index}
                        />
                     )}
                  />
               </div>
            ))}
         </CardContent>
      </Card>
   );
}

// ============================================================================
// Attributes Editor Component
// ============================================================================

interface AttributesEditorProps {
   attributes: Record<string, string>;
   onChange: (attributes: Record<string, string>) => void;
   variantIndex: number;
}

function AttributesEditor({ attributes, onChange, variantIndex }: AttributesEditorProps) {
   const entries = Object.entries(attributes);

   const handleAddAttribute = () => {
      onChange({ ...attributes, "": "" });
   };

   const handleRemoveAttribute = (key: string) => {
      const newAttrs = { ...attributes };
      delete newAttrs[key];
      onChange(newAttrs);
   };

   const handleKeyChange = (oldKey: string, newKey: string) => {
      if (oldKey === newKey) return;
      const newAttrs: Record<string, string> = {};
      for (const [k, v] of Object.entries(attributes)) {
         if (k === oldKey) {
            newAttrs[newKey] = v;
         } else {
            newAttrs[k] = v;
         }
      }
      onChange(newAttrs);
   };

   const handleValueChange = (key: string, value: string) => {
      onChange({ ...attributes, [key]: value });
   };

   return (
      <Field>
         <div className="flex items-center justify-between">
            <FieldLabel>Attributes</FieldLabel>
            <Button
               type="button"
               variant="ghost"
               size="sm"
               onClick={handleAddAttribute}
               className="h-7 text-xs"
            >
               <Plus className="mr-1 h-3 w-3" />
               Add Attribute
            </Button>
         </div>
         <FieldDescription className="text-xs mb-2">
            Add key-value attributes like Size, Color, Material, etc.
         </FieldDescription>
         {entries.length > 0 ? (
            <div className="space-y-2">
               {entries.map(([key, value], attrIndex) => (
                  <div key={`${variantIndex}-attr-${attrIndex}`} className="flex gap-2">
                     <Input
                        placeholder="Key (e.g. Size)"
                        value={key}
                        onChange={(e) => handleKeyChange(key, e.target.value)}
                        className="flex-1"
                     />
                     <Input
                        placeholder="Value (e.g. XL)"
                        value={value}
                        onChange={(e) => handleValueChange(key, e.target.value)}
                        className="flex-1"
                     />
                     <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveAttribute(key)}
                        className="text-destructive hover:text-destructive shrink-0"
                     >
                        <X className="h-4 w-4" />
                     </Button>
                  </div>
               ))}
            </div>
         ) : (
            <p className="text-xs text-muted-foreground italic">
               No attributes added yet.
            </p>
         )}
      </Field>
   );
}
