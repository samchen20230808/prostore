import { buttonVariants } from "@/components/ui/button";
import { getOrderById } from "@/lib/actions/order-actions";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export default async function StripeSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ payment_intent: string }>;
}) {
  const { id } = await params;
  const { payment_intent: paymentIntentId } = await searchParams;

  const order = await getOrderById(id);
  if (!order) notFound();

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  if (
    !paymentIntent.metadata.orderId ||
    paymentIntent.metadata.orderId !== order.id.toString()
  )
    notFound();

  const isSuccess = paymentIntent.status === "succeeded";
  if (!isSuccess) return redirect(`/order/${id}`);

  return (
    <div className="max-w-4xl w-full mx-auto space-y-8">
      <div className="flex flex-col gap-6 items-center">
        <h1 className="h1-bold">Thanks for your purchase</h1>
        <div>We are processing your order.</div>
        <Link
          href={`/order/${id}`}
          className={buttonVariants({ variant: "default" })}
        >
          View Order
        </Link>
      </div>
    </div>
  );
}
