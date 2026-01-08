"use client";

/**
 * Product Settings Sidebar
 *
 * Handles product active status and category selection.
 */

import { Controller, Control } from "react-hook-form";
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
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import {
   Field,
   FieldLabel,
   FieldError,
   FieldDescription,
} from "@/components/ui/field";
import { useCategories } from "@/hooks/use-categories";
import type { ProductFormData } from "./product-form-schema";

interface ProductSettingsProps {
   control: Control<ProductFormData>;
}

export function ProductSettings({ control }: ProductSettingsProps) {
   const { data: categories = [] } = useCategories();

   // Filter active categories
   const activeCategories = categories.filter((c) => c.is_active);

   return (
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
   );
}
