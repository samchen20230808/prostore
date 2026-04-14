"use client";
import { Button } from "@/components/ui/button";
import { addItemToCart, removeItemFromCart } from "@/lib/actions/cart-actions";
import { Cart, CartItem } from "@/types";
import { Loader, Minus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

export default function AddToCart({
  cart,
  item,
}: {
  cart?: Cart;
  item: CartItem;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function handleAddToCart() {
    startTransition(async () => {
      const res = await addItemToCart(item);
      if (!res.success) {
        toast.error(res.message, { className: " !text-red-50 !bg-red-500" });
        return;
      }
      toast.success(res.message, {
        action: {
          label: "Go to Cart",
          onClick: () => router.push("/cart"),
        },
      });
    });
  }

  async function handleRemoveFromCart() {
    startTransition(async () => {
      const res = await removeItemFromCart(item.productId);
      if (!res.success) {
        toast.error(res.message, { className: " !text-red-50 !bg-red-500" });
        return;
      }
      toast.success(res.message);
      return;
    });
  }

  // check item
  const existItem = cart?.items.find((x) => x.productId === item.productId);

  return !existItem ? (
    <Button
      className="w-full cursor-pointer"
      type="button"
      onClick={handleAddToCart}
    >
      {isPending ? (
        <Loader className="h-4 w-4 animate-spin" />
      ) : (
        <span>+ Add to cart</span>
      )}
    </Button>
  ) : (
    <div className="flex gap-2 items-center">
      <Button
        variant="outline"
        type="button"
        onClick={handleRemoveFromCart}
        disabled={isPending}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span>
        {isPending ? (
          <Loader className="h-4 w-4 animate-spin" />
        ) : (
          existItem.qty
        )}
      </span>
      <Button
        variant="outline"
        type="button"
        onClick={handleAddToCart}
        disabled={isPending}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
