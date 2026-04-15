import DealCountDown from "@/components/deal-countdown";
import IconBoxes from "@/components/icon-boxes";
import ProductCarousel from "@/components/shared/product/product-carousel";
import ProductList from "@/components/shared/product/product-list";
import ViewAllProductsButton from "@/components/view-all-products-button";
// import sampleData from "@/db/sample-data";
import {
  getFeaturedProducts,
  getLatestProducts,
} from "@/lib/actions/product-actions";
// import { setTimeout } from "timers/promises";
export const metadata = {
  title: "Home",
};

export default async function HomePage() {
  // await new Promise((resolve) => setTimeout(resolve, 5000));
  // await setTimeout(2000);
  // console.log(sampleData);

  const lastestProducts = await getLatestProducts();
  const featuredProducts = await getFeaturedProducts();
  return (
    <>
      <ProductCarousel products={featuredProducts} />
      <ProductList data={lastestProducts} title="Newest Arrivals" />
      <ViewAllProductsButton />
      <DealCountDown />
      <IconBoxes />
    </>
  );
}
