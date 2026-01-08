"use client";

import { useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound, useRouter } from "next/navigation";
import {
   ChevronLeft,
   Minus,
   Package,
   Plus,
   ShoppingCart,
   Check,
   Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useProductBySlug } from "@/hooks/use-products";
import { useCart } from "@/providers/cart-provider";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { ProductVariant } from "@/lib/services/products";

interface ProductPageProps {
   params: Promise<{ slug: string }>;
}

export default function ProductPage({ params }: ProductPageProps) {
   const { slug } = use(params);
   const { data: product, isLoading, error } = useProductBySlug(slug);
   const { addItem, getItemQuantity } = useCart();
   const router = useRouter();

   const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
   const [quantity, setQuantity] = useState(1);
   const [selectedImageIndex, setSelectedImageIndex] = useState(0);

   if (isLoading) {
      return <ProductPageSkeleton />;
   }

   if (error || !product) {
      notFound();
   }

   const variants = product.variants || [];
   const selectedVariant = variants[selectedVariantIndex];
   const images = product.images || [];
   const selectedImage = images[selectedImageIndex];

   const isOutOfStock = !selectedVariant || selectedVariant.stock === 0;
   const cartQuantity = selectedVariant
      ? getItemQuantity(product.id, selectedVariant.id)
      : 0;
   const availableStock = selectedVariant
      ? selectedVariant.stock - cartQuantity
      : 0;

   const handleAddToCart = () => {
      if (!selectedVariant || isOutOfStock) return;

      if (quantity > availableStock) {
         toast.error(`Only ${availableStock} items available`);
         return;
      }

      addItem(product, selectedVariant, quantity);
      toast.success(`${product.name} added to cart!`);
      setQuantity(1);
   };

   const handleBuyNow = () => {
      if (!selectedVariant || isOutOfStock) return;

      if (quantity > availableStock) {
         toast.error(`Only ${availableStock} items available`);
         return;
      }

      addItem(product, selectedVariant, quantity);
      router.push("/checkout");
   };

   const handleQuantityChange = (delta: number) => {
      const newQuantity = quantity + delta;
      if (newQuantity >= 1 && newQuantity <= availableStock) {
         setQuantity(newQuantity);
      }
   };

   return (
      <div className="min-h-screen bg-background">
         <div className="container mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <nav className="mb-6">
               <Button variant="ghost" size="sm" asChild className="-ml-3">
                  <Link href="/products">
                     <ChevronLeft className="mr-1 h-4 w-4" />
                     Back to Products
                  </Link>
               </Button>
            </nav>

            <div className="grid gap-8 lg:grid-cols-2">
               {/* Images Section */}
               <div className="space-y-4">
                  {/* Main Image */}
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                     {selectedImage?.url ? (
                        <Image
                           src={selectedImage.url}
                           alt={product.name}
                           fill
                           className="object-cover"
                           priority
                           sizes="(max-width: 1024px) 100vw, 50vw"
                        />
                     ) : (
                        <div className="flex h-full w-full items-center justify-center">
                           <Package className="h-24 w-24 text-muted-foreground" />
                        </div>
                     )}

                     {isOutOfStock && (
                        <Badge
                           variant="destructive"
                           className="absolute top-4 right-4 text-sm"
                        >
                           Out of Stock
                        </Badge>
                     )}
                  </div>

                  {/* Thumbnail Gallery */}
                  {images.length > 1 && (
                     <div className="flex gap-2 overflow-x-auto pb-2">
                        {images.map((image, index) => (
                           <button
                              key={image.id}
                              onClick={() => setSelectedImageIndex(index)}
                              className={cn(
                                 "relative h-20 w-20 shrink-0 overflow-hidden rounded-md border-2 transition-colors",
                                 selectedImageIndex === index
                                    ? "border-primary"
                                    : "border-transparent hover:border-muted-foreground/50"
                              )}
                           >
                              <Image
                                 src={image.url}
                                 alt={`${product.name} ${index + 1}`}
                                 fill
                                 className="object-cover"
                                 sizes="80px"
                              />
                           </button>
                        ))}
                     </div>
                  )}
               </div>

               {/* Product Info Section */}
               <div className="space-y-6">
                  {/* Category & Title */}
                  <div>
                     <Link
                        href={`/products?category=${product.category_data?.slug || ""}`}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                     >
                        {product.category_name}
                     </Link>
                     <h1 className="text-3xl font-bold mt-1">{product.name}</h1>
                  </div>

                  {/* Price */}
                  {selectedVariant && (
                     <div className="flex items-baseline gap-3">
                        <span className="text-3xl font-bold">
                           ${selectedVariant.price.toFixed(2)}
                        </span>
                        {selectedVariant.compare_price && (
                           <span className="text-xl text-muted-foreground line-through">
                              ${selectedVariant.compare_price.toFixed(2)}
                           </span>
                        )}
                        {selectedVariant.compare_price && (
                           <Badge variant="destructive">
                              {Math.round(
                                 ((selectedVariant.compare_price - selectedVariant.price) /
                                    selectedVariant.compare_price) *
                                 100
                              )}
                              % OFF
                           </Badge>
                        )}
                     </div>
                  )}

                  <Separator />

                  {/* Variants */}
                  {variants.length > 1 && (
                     <div className="space-y-3">
                        <h3 className="font-medium">Options</h3>
                        <div className="flex flex-wrap gap-2">
                           {variants.map((variant, index) => (
                              <VariantButton
                                 key={variant.id}
                                 variant={variant}
                                 isSelected={selectedVariantIndex === index}
                                 onClick={() => {
                                    setSelectedVariantIndex(index);
                                    setQuantity(1);
                                 }}
                              />
                           ))}
                        </div>
                     </div>
                  )}

                  {/* Stock Status */}
                  {selectedVariant && (
                     <div className="flex items-center gap-2 text-sm">
                        {selectedVariant.stock > 10 ? (
                           <>
                              <Check className="h-4 w-4 text-green-500" />
                              <span className="text-green-600">In Stock</span>
                           </>
                        ) : selectedVariant.stock > 0 ? (
                           <>
                              <span className="text-orange-600">
                                 Only {selectedVariant.stock} left in stock
                              </span>
                           </>
                        ) : (
                           <span className="text-destructive">Out of Stock</span>
                        )}
                     </div>
                  )}

                  {/* Quantity & Add to Cart */}
                  <div className="flex flex-col sm:flex-row gap-4">
                     <div className="flex items-center border rounded-md">
                        <Button
                           variant="ghost"
                           size="icon"
                           disabled={quantity <= 1 || isOutOfStock}
                           onClick={() => handleQuantityChange(-1)}
                        >
                           <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center font-medium">{quantity}</span>
                        <Button
                           variant="ghost"
                           size="icon"
                           disabled={quantity >= availableStock || isOutOfStock}
                           onClick={() => handleQuantityChange(1)}
                        >
                           <Plus className="h-4 w-4" />
                        </Button>
                     </div>
                     <Button
                        size="lg"
                        className="flex-1"
                        disabled={isOutOfStock}
                        onClick={handleAddToCart}
                     >
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                     </Button>
                     <Button
                        size="lg"
                        variant="secondary"
                        className="flex-1"
                        disabled={isOutOfStock}
                        onClick={handleBuyNow}
                     >
                        <Zap className="mr-2 h-5 w-5" />
                        Buy Now
                     </Button>
                  </div>

                  {cartQuantity > 0 && (
                     <p className="text-sm text-muted-foreground">
                        You have {cartQuantity} of this variant in your cart
                     </p>
                  )}

                  <Separator />

                  {/* Description */}
                  {product.description && (
                     <div className="space-y-3">
                        <h3 className="font-medium">Description</h3>
                        <div
                           className="prose prose-sm max-w-none text-muted-foreground"
                           dangerouslySetInnerHTML={{ __html: product.description }}
                        />
                     </div>
                  )}

                  {/* Product Details */}
                  {selectedVariant && (selectedVariant.size || selectedVariant.color) && (
                     <>
                        <Separator />
                        <div className="space-y-3">
                           <h3 className="font-medium">Product Details</h3>
                           <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                              {selectedVariant.size && (
                                 <div className="contents">
                                    <dt className="text-muted-foreground">Size</dt>
                                    <dd className="font-medium">{selectedVariant.size}</dd>
                                 </div>
                              )}
                              {selectedVariant.color && (
                                 <div className="contents">
                                    <dt className="text-muted-foreground">Color</dt>
                                    <dd className="font-medium">{selectedVariant.color}</dd>
                                 </div>
                              )}
                           </dl>
                        </div>
                     </>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
}

// Variant Button Component
function VariantButton({
   variant,
   isSelected,
   onClick,
}: {
   variant: ProductVariant;
   isSelected: boolean;
   onClick: () => void;
}) {
   const isOutOfStock = variant.stock === 0;
   // Build label from size/color or fall back to price
   const parts = [variant.size, variant.color].filter(Boolean);
   const label = parts.length > 0 ? parts.join(" / ") : `$${variant.price.toFixed(2)}`;

   return (
      <button
         onClick={onClick}
         disabled={isOutOfStock}
         className={cn(
            "rounded-md border px-4 py-2 text-sm font-medium transition-colors",
            isSelected
               ? "border-primary bg-primary text-primary-foreground"
               : "border-border hover:border-primary",
            isOutOfStock && "opacity-50 cursor-not-allowed line-through"
         )}
      >
         {label}
      </button>
   );
}

// Loading Skeleton
function ProductPageSkeleton() {
   return (
      <div className="min-h-screen bg-background">
         <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-8 w-32 mb-6" />
            <div className="grid gap-8 lg:grid-cols-2">
               <div className="space-y-4">
                  <Skeleton className="aspect-square w-full rounded-lg" />
                  <div className="flex gap-2">
                     {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-20 w-20 rounded-md" />
                     ))}
                  </div>
               </div>
               <div className="space-y-6">
                  <div>
                     <Skeleton className="h-4 w-24 mb-2" />
                     <Skeleton className="h-10 w-3/4" />
                  </div>
                  <Skeleton className="h-10 w-40" />
                  <Skeleton className="h-px w-full" />
                  <div className="space-y-3">
                     <Skeleton className="h-5 w-20" />
                     <div className="flex gap-2">
                        {[...Array(3)].map((_, i) => (
                           <Skeleton key={i} className="h-10 w-24 rounded-md" />
                        ))}
                     </div>
                  </div>
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-px w-full" />
                  <div className="space-y-3">
                     <Skeleton className="h-5 w-28" />
                     <Skeleton className="h-20 w-full" />
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
