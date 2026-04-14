import { getOrderById } from "@/lib/actions/order-actions";
import { notFound } from "next/navigation";
import OrderDetailsTable from "./order-details-table";
import { auth } from "@/auth";
import Stripe from "stripe";

export const metadata = {
  title: "Order Details",
};
export default async function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();
  const paypalClientId = process.env.PAYPAL_CLIENT_ID || "sb";

  const session = await auth();

  // for Stripe payment
  let client_secret = null;
  if (order.paymentMethod === "Stripe" && !order.isPaid) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(order.totalPrice) * 100), // 🟢 單位是「分」
      currency: "USD",
      metadata: { orderId: order.id },
    });
    client_secret = paymentIntent.client_secret;
  }

  return (
    <>
      <OrderDetailsTable
        order={order}
        stripeClientSecret={client_secret}
        paypalClientId={paypalClientId}
        isAdmin={session?.user.role === "admin" || false}
      />
    </>
  );
}
