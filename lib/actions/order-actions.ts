"use server";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { convertToPlainObject, formatError } from "../utils";
import { auth } from "@/auth";
import { getMyCart } from "./cart-actions";
import { getUserById } from "./user-actions";
import { insertOrderSchema } from "../validators";
import { prisma } from "@/db/prisma";
import { Order, PaymentResult, ShippingAddress } from "@/types";
import { paypal } from "../paypal";
import { revalidatePath } from "next/cache";
import { PAGE_SIZE } from "../constants";
import { Prisma } from "@/lib/generated/prisma";
import { sendPurcaseReceipt } from "@/email";

export async function createOrder() {
  try {
    const session = await auth();
    if (!session) throw new Error("User is not authenticated");

    const userId = session?.user?.id;
    if (!userId) throw new Error("User not found");
    const user = await getUserById(userId);

    const cart = await getMyCart();
    if (!cart || cart.items.length === 0) {
      return {
        success: false,
        message: "Your cart is empty",
        redirectTo: "/cart",
      };
    }
    if (!user.address) {
      return {
        success: false,
        message: "No shipping address",
        redirectTo: "/shiping-address",
      };
    }
    if (!user.paymentMethod) {
      return {
        success: false,
        message: "No payment method",
        redirectTo: "/payment-method",
      };
    }

    // --- create order
    // 1. make an order
    const order = insertOrderSchema.parse({
      userId: user.id,
      shippingAddress: user.address,
      paymentMethod: user.paymentMethod,
      itemsPrice: cart.itemsPrice,
      taxPrice: cart.taxPrice,
      shippingPrice: cart.shippingPrice,
      totalPrice: cart.totalPrice,
    });

    // 2. use a transaction to create order & order items
    const insertedOrderId = await prisma.$transaction(async (tx) => {
      // create order
      const insertedOrder = await tx.order.create({ data: order });
      // create order items
      cart.items.forEach(async (item) => {
        await tx.orderItem.create({
          data: {
            ...item,
            price: item.price,
            orderId: insertedOrder.id,
          },
        });
      });
      // clear cart
      await tx.cart.update({
        where: { id: cart.id },
        data: {
          items: [],
          totalPrice: 0,
          taxPrice: 0,
          shippingPrice: 0,
          itemsPrice: 0,
        },
      });
      // return to insertedOrderId
      return insertedOrder.id;
    });
    if (!insertedOrderId) throw new Error("order not created");
    return {
      success: true,
      message: "order created successfully",
      redirectTo: `/order/${insertedOrderId}`,
    };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { success: false, message: formatError(error) };
  }
}

export async function getOrderById(orderId: string) {
  const data = await prisma.order.findFirst({
    where: { id: orderId },
    include: {
      orderItems: true,
      user: { select: { name: true, email: true } },
    },
  });
  if (!data) return null;
  const formatedData = {
    ...data,
    shippingAddress: data.shippingAddress as ShippingAddress,
    paymentResult: data.paymentResult as PaymentResult,
  };

  return convertToPlainObject(formatedData) as Order;
}

export async function createPayPalOrder(orderId: string) {
  try {
    const order = await prisma.order.findFirst({
      where: { id: orderId },
    });
    if (!order) throw new Error("order not found");

    // create paypal order
    const paypalOrder = await paypal.createOrder(+order.totalPrice);
    // update db in order.paymentResult
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentResult: {
          id: paypalOrder.id,
          email_address: "",
          status: "",
          pricePaid: 0,
        },
      },
    });
    return {
      success: true,
      message: "item order created successfully",
      data: paypalOrder.id,
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function approvePayPalOrder(
  orderId: string,
  data: { orderID: string },
) {
  try {
    // console.log("approvePayPalOrder");
    // console.log({ orderId, data });
    const order = await prisma.order.findFirst({
      where: { id: orderId },
    });
    if (!order) throw new Error("order not found");
    // console.log({ order: order });
    // console.log({ orderId: data.orderID });
    const captureData = await paypal.capturePayment(data.orderID);
    // console.log({ captureData: captureData });
    if (
      !captureData ||
      captureData.id !== (order.paymentResult as PaymentResult).id ||
      captureData.status !== "COMPLETED"
    )
      throw new Error("paypal payment error");

    // update db in order.paymentResult
    await updateOrderToPaid({
      orderId,
      paymentResult: {
        id: captureData.id,
        status: captureData.status,
        email_address: captureData.payer.email_address,
        pricePaid:
          captureData.purchase_units[0]?.payments?.captures[0]?.amount?.value,
      },
    });
    revalidatePath(`/order/${orderId}`);
    return {
      success: true,
      message: "order approved successfully",
    };
  } catch (error) {
    if (error instanceof Error) console.log(error.message);
    return { success: false, message: formatError(error) };
  }
}

export async function updateOrderToPaid({
  orderId,
  paymentResult,
}: {
  orderId: string;
  paymentResult?: PaymentResult;
}) {
  const order = await prisma.order.findFirst({
    where: { id: orderId },
    include: {
      orderItems: true,
    },
  });
  if (!order) throw new Error("order not found");
  if (order.isPaid) throw new Error("order is already paid");

  // transaction to update order and account for product stock
  await prisma.$transaction(async (tx) => {
    // update product stock
    order.orderItems.forEach(async (item) => {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: -item.qty } },
      });
    });
    // set order to paid
    await tx.order.update({
      where: { id: orderId },
      data: {
        isPaid: true,
        paidAt: new Date(),
        paymentResult,
      },
    });
  });

  // check order
  const updatedOrder = await prisma.order.findFirst({
    where: { id: orderId },
    include: {
      orderItems: true,
      user: { select: { name: true, email: true } },
    },
  });
  if (!updatedOrder) throw new Error("Order not found");

  // send email
  sendPurcaseReceipt({
    order: {
      ...updatedOrder,
      shippingAddress: updatedOrder.shippingAddress as ShippingAddress,
      paymentResult: updatedOrder.paymentResult as PaymentResult,
    },
  });
}

export async function getMyOrders({
  limit = PAGE_SIZE,
  page,
}: {
  limit?: number;
  page: number;
}) {
  const session = await auth();
  if (!session) throw new Error("User is not authenticated");

  const data = await prisma.order.findMany({
    where: { userId: session?.user?.id },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: (page - 1) * limit, // 跳頁
  });

  const dataCount = await prisma.order.count({
    where: { userId: session?.user?.id },
  });
  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
    totalCount: dataCount,
  };
}

type SalesDataType = {
  month: string;
  totalSales: number;
}[];

export async function getOrderSummary() {
  // get count
  const ordersCount = await prisma.order.count();
  const productsCount = await prisma.product.count();
  const usersCount = await prisma.user.count();

  // calc totalSales
  const totalSales = await prisma.order.aggregate({
    _sum: { totalPrice: true },
  });

  // get monthly sales
  const salesDataRaw = await prisma.$queryRaw<
    Array<{ month: string; totalSales: Prisma.Decimal }>
  >`SELECT to_char("createdAt",'MM/YY') as "month",sum("totalPrice") as "totalSales" FROM "Order" GROUP BY to_char("createdAt",'MM/YY')`;
  const salesData: SalesDataType = salesDataRaw.map((data) => ({
    month: data.month,
    totalSales: Number(data.totalSales),
  }));

  // console.log({ salesDataRaw, salesData });

  // get latest sales
  const latestSales = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } } },
    take: 6,
  });

  return {
    ordersCount,
    productsCount,
    usersCount,
    totalSales,
    latestSales,
    salesData,
  };
}

export async function getAllOrders({
  limit = PAGE_SIZE,
  page,
  query = "all",
}: {
  limit?: number;
  page: number;
  query: string;
}) {
  const queryFilter =
    query && query !== "all"
      ? {
          user: {
            name: {
              contains: query,
              mode: "insensitive",
            } as Prisma.StringFilter,
          },
        }
      : "";
  const data = await prisma.order.findMany({
    where: { ...queryFilter },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: (page - 1) * limit,
    include: { user: { select: { name: true } } },
  });
  const dataCount = await prisma.order.count({ where: { ...queryFilter } });

  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
    totalCount: dataCount,
  };
}

export async function deleteOrder(id: string) {
  try {
    await prisma.order.delete({ where: { id } });
    revalidatePath("/admin/orders");
    return { success: true, message: "delete order sucessfully" };
  } catch (error) {
    if (error instanceof Error) console.log(error.message);
    return { success: false, message: formatError(error) };
  }
}

// COD: cash on delivery (貨到付款)
export async function updateOrderToPaidCOD(orderId: string) {
  try {
    await updateOrderToPaid({ orderId });
    revalidatePath(`/order/${orderId}`);
    return { success: true, message: "update order sucessfully" };
  } catch (error) {
    if (error instanceof Error) console.log(error.message);
    return { success: false, message: formatError(error) };
  }
}

export async function deliverOrder(orderId: string) {
  try {
    const order = await prisma.order.findFirst({
      where: { id: orderId },
    });
    if (!order) throw new Error("order not found");
    if (!order.isPaid) throw new Error("order not paid");

    await prisma.order.update({
      where: { id: orderId },
      data: { isDelivered: true, deliveredAt: new Date() },
    });
    revalidatePath(`/order/${orderId}`);
    return { success: true, message: "deliver order sucessfully" };
  } catch (error) {
    if (error instanceof Error) console.log(error.message);
    return { success: false, message: formatError(error) };
  }
}
