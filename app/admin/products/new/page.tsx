"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field, FieldError } from "@/components/ui/field";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Controller, useForm } from "react-hook-form";
import {
   Select,
   SelectContent,
   SelectGroup,
   SelectItem,
   SelectLabel,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const formSchema = z.object({
   name: z.string().min(1, "Product name is required"),
   price: z
      .string()
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
         message: "Price must be a positive number",
      }),
   sku: z.string().min(1, "SKU is required"),
   stock: z
      .string()
      .refine((val) => Number.isInteger(Number(val)) && Number(val) >= 0, {
         message: "Stock must be a non-negative integer",
      }),
   category: z.string().min(1, "Category is required"),
   description: z.string().min(1, "Description is required"),
   images: z
      .any()
      .refine((files) => files instanceof FileList && files.length > 0, {
         message: "At least one image is required",
      }),
})

export default function AddProductPage() {
   const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
         name: "",
         price: "",
         sku: "",
         stock: "",
         category: "",
         description: "",
         images: [],
      },
   })
   const onSubmit = async (data: z.infer<typeof formSchema>) => {
      console.log("Form Data:", data);
      // Add your Supabase logic here
      toast.success("Form submitted! Check console for data.");
   }
   return (
      <Card className="my-6 mx-2 md:mx-6 xl:mx-auto max-w-5xl">
         <CardHeader className="text-2xl md:text-3xl font-semibold tracking-tight mb-6">
            Add New Product
         </CardHeader>
         <CardContent>
            <form id="product-form" className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Controller
                     control={form.control}
                     name="name"
                     render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                           <Label htmlFor="name">Product Name</Label>
                           <Input
                              id="name"
                              {...field}
                              aria-invalid={fieldState.invalid}
                              placeholder="e.g., Classic Oxford Shirt"

                           />
                           {form.formState.errors.name && (
                              <FieldError errors={[fieldState.error]}>
                                 {form.formState.errors.name.message as string}
                              </FieldError>
                           )}
                        </Field>
                     )}
                  />

                  <Controller
                     control={form.control}
                     name="price"
                     render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                           <Label htmlFor="price">Price</Label>
                           <Input
                              id="price"
                              type="number"
                              step="0.01"
                              {...field}
                              aria-invalid={fieldState.invalid}
                              placeholder="e.g., 49.99"
                           />
                           {fieldState.error && (
                              <FieldError errors={[fieldState.error]}>
                                 {fieldState.error.message as string}
                              </FieldError>
                           )}
                        </Field>
                     )}
                  />

                  <Controller
                     control={form.control}
                     name="sku"
                     render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                           <Label htmlFor="sku">SKU</Label>
                           <Input
                              id="sku"
                              {...field}
                              aria-invalid={fieldState.invalid}
                              placeholder="e.g., OXF-CL-001"
                           />
                           {fieldState.error && (
                              <FieldError errors={[fieldState.error]}>
                                 {fieldState.error.message as string}
                              </FieldError>
                           )}
                        </Field>
                     )}
                  />

                  <Controller
                     control={form.control}
                     name="stock"
                     render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                           <Label htmlFor="stock">Stock</Label>
                           <Input
                              id="stock"
                              type="number"
                              {...field}
                              aria-invalid={fieldState.invalid}
                              placeholder="e.g., 120"
                           />
                           {fieldState.error && (
                              <FieldError errors={[fieldState.error]}>
                                 {fieldState.error.message as string}
                              </FieldError>
                           )}
                        </Field>
                     )}
                  />

                  <Controller
                     control={form.control}
                     name="category"
                     render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                           <Label htmlFor="category">Category</Label>
                           <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger className="w-full">
                                 <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                 <SelectGroup>
                                    <SelectLabel>Categories</SelectLabel>
                                    <SelectItem value="shirts">Shirts</SelectItem>
                                    <SelectItem value="pants">Pants</SelectItem>
                                    <SelectItem value="wallets">Wallets</SelectItem>
                                    <SelectItem value="accessories">Accessories</SelectItem>
                                 </SelectGroup>
                              </SelectContent>
                           </Select>
                           {fieldState.error && (
                              <FieldError errors={[fieldState.error]}>
                                 {fieldState.error.message as string}
                              </FieldError>
                           )}
                        </Field>
                     )}
                  />

                  <Controller
                     control={form.control}
                     name="images"
                     render={({ field: { onChange, value, ...field }, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                           <Label htmlFor="images">Images</Label>
                           <Input
                              id="images"
                              type="file"
                              accept="image/*"
                              multiple
                              {...field}
                              aria-invalid={fieldState.invalid}
                              onChange={(e) => onChange(e.target.files)}
                           />
                           {fieldState.error && (
                              <FieldError errors={[fieldState.error]}>
                                 {fieldState.error.message as string}
                              </FieldError>
                           )}
                        </Field>
                     )}
                  />
               </div>
               <Controller
                  control={form.control}
                  name="description"
                  render={({ field, fieldState }) => (
                     <Field data-invalid={fieldState.invalid}>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                           id="description"
                           rows={5}
                           className="h-32"
                           {...field}
                           aria-invalid={fieldState.invalid}
                           placeholder="Brief product details, materials, fit, care..."
                        />
                        {fieldState.error && (
                           <FieldError errors={[fieldState.error]}>
                              {fieldState.error.message as string}
                           </FieldError>
                        )}
                     </Field>
                  )}
               />
            </form>
         </CardContent>
         <CardFooter>
            <Field orientation="horizontal">
               <Button type="submit" form="product-form" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Submitting..." : "Submit"}
               </Button>
               <Button type="button" variant="outline" onClick={() => form.reset()}>
                  Reset
               </Button>
            </Field>
         </CardFooter>
      </Card>
   );
}