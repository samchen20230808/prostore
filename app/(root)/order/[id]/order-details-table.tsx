"use client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDateTime, formatId } from "@/lib/utils";
import { Order } from "@/types";
import Image from "next/image";
import Link from "next/link";
import {
  PayPalButtons,
  PayPalScriptProvider,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";
import {
  approvePayPalOrder,
  createPayPalOrder,
  deliverOrder,
  updateOrderToPaidCOD,
} from "@/lib/actions/order-actions";
import { toast } from "sonner";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import StripePayment from "./stripe-payment";

export default function OrderDetailsTable({
  order,
  paypalClientId,
  isAdmin,
  stripeClientSecret,
}: {
  order: Order;
  paypalClientId: string;
  isAdmin: boolean;
  stripeClientSecret: string | null;
}) {
  const { id, shippingAddress } = order;

  console.log(paypalClientId);

  function PrintLoadingState() {
    const [{ isPending, isRejected }] = usePayPalScriptReducer();
    const status = isPending
      ? "Loadig PayPal..."
      : isRejected
        ? "Error Loading PayPal"
        : "";
    return status;
  }
  async function handleCreatePayPalOrder() {
    const res = await createPayPalOrder(order.id);

    if (!res.success) {
      toast.error(res.message, { className: " !text-red-50 !bg-red-500" });
      return;
    }
    toast.success(res.message);
    return res.data;
  }

  async function handleApprovePayPalOrder(data: { orderID: string }) {
    const res = await approvePayPalOrder(order.id, data);
    if (!res.success) {
      toast.error(res.message, { className: " !text-red-50 !bg-red-500" });
      return;
    }
    toast.success(res.message);
  }

  function MarkAsPaidButton() {
    const [isPending, startTransition] = useTransition();
    return (
      <Button
        disabled={isPending}
        className="cursor-pointer"
        onClick={() => {
          startTransition(async () => {
            const res = await updateOrderToPaidCOD(order.id);
            if (!res.success) {
              toast.error(res.message, {
                className: " !text-red-50 !bg-red-500",
              });
              return;
            }
            toast.success(res.message);
          });
        }}
      >
        {isPending ? "Processing..." : "Mark As Paid"}
      </Button>
    );
  }

  function MarkAsDeliveredButton() {
    const [isPending, startTransition] = useTransition();
    return (
      <Button
        disabled={isPending}
        className="cursor-pointer"
        onClick={() => {
          startTransition(async () => {
            const res = await deliverOrder(order.id);
            if (!res.success) {
              toast.error(res.message, {
                className: " !text-red-50 !bg-red-500",
              });
              return;
            }
            toast.success(res.message);
          });
        }}
      >
        {isPending ? "Processing..." : "Mark As Delivered"}
      </Button>
    );
  }

  return (
    <>
      <h1 className="py-4 text-2xl">Order {formatId(id)}</h1>
      <div className="grid md:grid-cols-3 md:gap-5">
        <div className="col-span-2 gap-y-4 overflow-x-auto">
          <Card>
            <CardContent className="p-4 gap-4">
              <h2 className="text-xl pb-4">Payment Method</h2>
              <p className="mb-2">{order.paymentMethod}</p>
              {order.isPaid ? (
                <Badge variant="secondary">
                  Paid at {formatDateTime(order.paidAt!).dateTime}
                </Badge>
              ) : (
                <Badge variant="destructive">Not paid</Badge>
              )}
            </CardContent>
          </Card>
          <Card className="my-4">
            <CardContent className="p-4 gap-4">
              <h2 className="text-xl pb-4">Shipping Address</h2>
              <p>{shippingAddress.fullName}</p>
              <p className="mb-2">
                {shippingAddress.streetAddress}, {shippingAddress.city}
                {shippingAddress.postCode}, {shippingAddress.country}
              </p>
              {order.isDelivered ? (
                <Badge variant="secondary">
                  Paid at {formatDateTime(order.deliveredAt!).dateTime}
                </Badge>
              ) : (
                <Badge variant="destructive">Not delivered</Badge>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 gap-4">
              <h2 className="text-xl pb-4">Order Items</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.orderItems.map((item) => (
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
                      <TableCell className="px-2">{item.qty}</TableCell>
                      <TableCell className="text-right">{item.price}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardContent className="p-4 gap-4 space-y-4">
              <div className="flex justify-between">
                <div>Items</div>
                <div>{formatCurrency(order.itemsPrice)}</div>
              </div>
              <div className="flex justify-between">
                <div>Tax</div>
                <div>{formatCurrency(order.taxPrice)}</div>
              </div>
              <div className="flex justify-between">
                <div>Shipping</div>
                <div>{formatCurrency(order.shippingPrice)}</div>
              </div>
              <div className="flex justify-between">
                <div>Total</div>
                <div>{formatCurrency(order.totalPrice)}</div>
              </div>

              {/* paypal payment */}
              {!order.isPaid && order.paymentMethod === "PayPal" && (
                <div>
                  <PayPalScriptProvider options={{ clientId: paypalClientId }}>
                    <PrintLoadingState />
                    <PayPalButtons
                      createOrder={handleCreatePayPalOrder}
                      onApprove={handleApprovePayPalOrder}
                    />
                  </PayPalScriptProvider>
                </div>
              )}
              {/* stripe payment */}
              {!order.isPaid &&
                order.paymentMethod === "Stripe" &&
                stripeClientSecret && (
                  <StripePayment
                    priceInCents={Math.round(Number(order.totalPrice) * 100)}
                    orderId={order.id}
                    clientSecret={stripeClientSecret}
                  />
                )}

              {/* CashOnDelivery -COD */}
              {/* handle pay */}
              {isAdmin &&
                !order.isPaid &&
                order.paymentMethod === "CashOnDelivery" && (
                  <MarkAsPaidButton />
                )}
              {/* handle delivery */}
              {isAdmin && order.isPaid && !order.isDelivered && (
                <MarkAsDeliveredButton />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
