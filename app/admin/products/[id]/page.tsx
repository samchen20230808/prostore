import ProductForm from "@/components/admin/product-form";
import { getProductById } from "@/lib/actions/product-actions";
import { Product } from "@/types";
import { notFound } from "next/navigation";

export const metadata = { title: "Update Product" };

export default async function AdminUpdateProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  console.log(product);
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <h1 className="h2-bold">Update Product</h1>
      <ProductForm type="Update" product={product} productId={id} />
    </div>
  );
}
