import Link from "next/link";
import { Button, buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils";

export default function ViewAllProductsButton() {
  return (
    <div className="flex justify-center items-center my-8">
      <Link
        href="/search"
        className={cn(
          buttonVariants({ variant: "default" }),
          "px-8 py-4 text-lg font-semibold",
        )}
      >
        View All Products
      </Link>
    </div>
  );
}
