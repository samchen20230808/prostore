import { getAllCategories } from "@/lib/actions/product-actions";
import CategoryList from "./category-list";
import { convertToPlainObject } from "@/lib/utils";

export default async function CategoryDrawer() {
  const categoriesRaw = await getAllCategories();

  const categories = convertToPlainObject(categoriesRaw);
  // console.log(categories);
  return <CategoryList categories={categories} />;
}
