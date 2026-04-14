import { getMyCart } from "@/lib/actions/cart-actions";
import JumpCartTable from "./jump-cart-table";

export const metadata = {
  title: "Shopping Cart",
};

export default async function CartPage() {
  const cart = await getMyCart();
  return (
    <>
      <JumpCartTable cart={cart} />
    </>
  );
}
