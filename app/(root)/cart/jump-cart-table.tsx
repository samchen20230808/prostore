"use client";
import { Cart } from "@/types";
import dynamic from "next/dynamic";

const CartTable = dynamic(() => import("./cart-table"), {
  ssr: false,
  loading: () => <p className="p-4">Loading table...</p>,
});

export default function JumpCartTable({ cart }: { cart?: Cart }) {
  return <CartTable cart={cart} />;
}
