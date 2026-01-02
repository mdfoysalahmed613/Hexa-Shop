import { ProductEditPageClient } from "./_components/product-edit-page-client";

interface ProductEditPageProps {
   params: Promise<{ id: string }>;
}

export default async function ProductEditPage({ params }: ProductEditPageProps) {
   const { id } = await params;
   return <ProductEditPageClient productId={id} />;
}
