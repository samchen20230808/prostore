"use server";
import { CartItem } from "@/types";
import { convertToPlainObject, formatError, round2 } from "../utils";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { cartItemSchema, insertCartSchema } from "../validators";
import { revalidatePath } from "next/cache";

// calc cart prices
function calcPrice(items: CartItem[]) {
  const itemsPrice = round2(
    items.reduce((acc, item) => acc + Number(item.price) * item.qty, 0),
  );
  const shippingPrice = round2(itemsPrice > 100 ? 0 : 10);
  const taxPrice = round2(itemsPrice * 0.15);
  const totalPrice = round2(itemsPrice + shippingPrice + taxPrice);
  return {
    itemsPrice: itemsPrice.toFixed(2),
    shippingPrice: shippingPrice.toFixed(2),
    taxPrice: taxPrice.toFixed(2),
    totalPrice: totalPrice.toFixed(2),
  };
}

export async function addItemToCart(data: CartItem) {
  try {
    // console.log("+++add cart item");
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;
    if (!sessionCartId) {
      throw new Error("Session cart id is not found");
    }
    const session = await auth();
    const userId = session?.user?.id ? (session.user.id as string) : undefined;

    const cart = await getMyCart(sessionCartId);

    // parse and validate item
    const item = cartItemSchema.parse(data);
    const product = await prisma.product.findFirst({
      where: { id: item.productId },
    });

    if (!product) throw new Error("Product not found");
    let message = `${product.name} add to a cart`;
    if (!cart) {
      // create new cart
      const newCart = insertCartSchema.parse({
        userId: userId,
        items: [item],
        sessionCartId: sessionCartId,
        ...calcPrice([item]),
      });
      // console.log({ newCart });

      // add to db
      await prisma.cart.create({
        data: newCart,
      });
    } else {
      // already have cart
      // 1. check if item exist
      const existItem = cart.items.find((x) => x.productId === item.productId);

      if (product.stock < (existItem?.qty ? existItem.qty : 0) + 1) {
        // console.log({
        //   stock: product.stock,
        //   qty: existItem?.qty,
        // });
        throw new Error("Not enough stock");
      }

      if (!existItem) {
        cart.items.push(item);
      } else {
        existItem.qty++;
      }

      // update cart in db
      await prisma.cart.update({
        where: { id: cart.id },
        data: {
          items: cart.items,
          ...calcPrice(cart.items),
        },
      });

      if (existItem) message = `${product.name} update to a cart`;
    }

    // test
    // console.log({
    //   sessionCartId,
    //   userId,
    //   item,
    //   product,
    //   message,
    // });

    revalidatePath(`/product/${product.slug}`);
    return { success: true, message };
  } catch (error) {
    // if (error instanceof Error) console.log(error.message);
    return { success: false, message: formatError(error) };
  }
}

export async function getMyCart(sessionCartId?: string) {
  if (!sessionCartId) {
    const newSessionCartId = (await cookies()).get("sessionCartId")?.value;
    if (!newSessionCartId) return undefined;
    sessionCartId = newSessionCartId;
  }
  const session = await auth();
  const userId = session?.user?.id ? (session.user.id as string) : undefined;

  const cart = await prisma.cart.findFirst({
    where: userId
      ? {
          userId: userId,
        }
      : { sessionCartId: sessionCartId },
  });
  if (!cart) return undefined;

  return convertToPlainObject({
    ...cart,
    items: cart.items as CartItem[],
    itemsPrice: cart.itemsPrice.toString(),
    totalPrice: cart.totalPrice.toString(),
    shippingPrice: cart.shippingPrice.toString(),
    taxPrice: cart.taxPrice.toString(),
  });
}

export async function removeItemFromCart(productId: string) {
  try {
    // console.log("+++remove cart item");
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;
    if (!sessionCartId) {
      throw new Error("Session cart id is not found");
    }

    // get product
    const product = await prisma.product.findFirst({
      where: { id: productId },
    });
    if (!product) throw new Error("Product not found");

    // get user cart
    const cart = await getMyCart(sessionCartId);
    if (!cart) throw new Error("cart not found");

    // get item
    const existItem = cart.items.find((x) => x.productId === productId);
    if (!existItem) throw new Error("item not found in cart");

    // handle qty
    if (existItem.qty === 1) {
      cart.items = cart.items.filter((x) => x.productId !== productId);
    } else {
      existItem.qty--;
    }

    // update cart in db
    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        items: cart.items,
        ...calcPrice(cart.items),
      },
    });

    revalidatePath(`/product/${product.slug}`);
    return { success: true, message: `${product.name} remove from the cart` };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
