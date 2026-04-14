"use client";
import { Button } from "@/components/ui/button";
import { createOrder } from "@/lib/actions/order-actions";
import { Check, Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

export default function PlaceOrderForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await createOrder();
      if (res.redirectTo) {
        router.push(res.redirectTo);
      }

      if (!res.success) {
        toast.error(res.message, { className: " !text-red-50 !bg-red-500" });
        return;
      }
      toast.success(res.message);
    });
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Button
          disabled={isPending}
          className="w-full cursor-pointer"
          type="submit"
        >
          {isPending ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}{" "}
          Place Order
        </Button>
      </form>
    </>
  );
}
