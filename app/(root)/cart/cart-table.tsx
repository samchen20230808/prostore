"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { addItemToCart, removeItemFromCart } from "@/lib/actions/cart-actions";
import { formatCurrency } from "@/lib/utils";
import { Cart, CartItem } from "@/types";
import { ArrowRight, Loader, Minus, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

export default function CartTable({ cart }: { cart?: Cart }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [currentProductId, setCurrentProductId] = useState<
    string | undefined
  >();

  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        window.location.reload();
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  async function handleAddToCart(item: CartItem) {
    setCurrentProductId(item.productId);
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

  async function handleRemoveFromCart(item: CartItem) {
    setCurrentProductId(item.productId);
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

  return (
    <>
      <h1 className="py-4 h2-bold">Shopping Cart</h1>
      {cart?.items.length === 0 ? (
        <div>
          Cart is empty. <Link href="/">Go Shopping</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-4 md:gap-5">
          <div className="overflow-x-auto md:col-span-3">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cart?.items.map((item) => (
                  <TableRow key={item.slug}>
                    <TableCell>
                      <Link
                        href={`/product/${item.slug}`}
                        className="flex items-center"
                      >
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={50}
                          height={50}
                        />
                        <span className="px-2">{item.name}</span>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 items-center justify-center">
                        <Button
                          variant="outline"
                          type="button"
                          onClick={() => handleRemoveFromCart(item)}
                          disabled={
                            isPending && item.productId === currentProductId
                          }
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span>
                          {isPending && item.productId === currentProductId ? (
                            <Loader className="h-4 w-4 animate-spin" />
                          ) : (
                            item.qty
                          )}
                        </span>
                        <Button
                          variant="outline"
                          type="button"
                          onClick={() => handleAddToCart(item)}
                          disabled={
                            isPending && item.productId === currentProductId
                          }
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">${item.price}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Card>
            <CardContent className="p-4 gap-4">
              <div className="pb-3 text-xl">
                Subtotal ({cart?.items.reduce((acc, cur) => acc + cur.qty, 0)})
                :
                <span className="font-bold">
                  {" "}
                  {formatCurrency(cart?.itemsPrice as string)}
                </span>
              </div>
              <Button
                className="w-full cursor-pointer"
                disabled={isPending}
                onClick={() =>
                  startTransition(() => {
                    router.push("/shipping-address");
                  })
                }
              >
                {isPending ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}{" "}
                Proceed to Checkout
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
