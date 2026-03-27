import ProductList from "@/components/shared/product/product-list";
import sampleData from "@/db/sample-data";
import { getLatestProducts } from "@/lib/actions/product-actions";
// import { setTimeout } from "timers/promises";
export const metadata = {
  title: "Home",
};

export default async function HomePage() {
  // await new Promise((resolve) => setTimeout(resolve, 5000));
  // await setTimeout(2000);
  // console.log(sampleData);

  const lastestProducts = await getLatestProducts();
  return (
    <>
      <ProductList data={lastestProducts} title="Newest Arrivals" />
    </>
  );
}
