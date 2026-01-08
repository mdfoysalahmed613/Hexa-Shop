"use client";

/**
 * Product Basic Information Section
 *
 * Handles product name and rich text description.
 */

import { Controller, Control } from "react-hook-form";
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
import { Tiptap } from "@/components/ui/tiptap";
import type { ProductFormData } from "./product-form-schema";

interface ProductBasicInfoProps {
   control: Control<ProductFormData>;
}

export function ProductBasicInfo({ control }: ProductBasicInfoProps) {
   return (
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
   );
}
