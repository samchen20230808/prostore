"use server";

import { auth, signIn, signOut } from "@/auth";
import {
  paymentMethodSchema,
  shippingAddressSchema,
  signInSchema,
  signUpSchema,
  updateUserSchema,
} from "../validators";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { hashSync } from "bcrypt-ts-edge";
import { prisma } from "@/db/prisma";
import { formatError } from "../utils";
import { PaymentMethod, ShippingAddress, User } from "@/types";
import { PAGE_SIZE } from "../constants";
import { revalidatePath } from "next/cache";
import { Prisma } from "../generated/prisma";

export async function signInWithCredentials(
  preState: unknown,
  formData: FormData,
) {
  try {
    const user = signInSchema.parse({
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    });
    console.log("Signing in user:", user);
    await signIn("credentials", user);
    return { success: true, message: "Signed in successfully" };
  } catch (error) {
    // 如果 signIn 成功，它會拋出一個 "Redirect" 錯誤
    if (isRedirectError(error)) {
      throw error; // 這裡必須「再拋出」，Next.js 才能接收到跳轉指令
    }
    // 只有真正的「登入失敗」（如密碼錯），才會走到下面這行
    return { success: false, message: "Invalid email or password" };
  }
}

export async function signOutUser() {
  await signOut();
}

export async function signUpUser(preState: unknown, formData: FormData) {
  try {
    const user = signUpSchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

    const plainPassword = user.password;
    user.password = hashSync(user.password, 10);

    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
      },
    });

    await signIn("credentials", {
      email: user.email,
      password: plainPassword,
    });

    return { success: true, message: "Signed up successfully" };
  } catch (error) {
    // 如果 signIn 成功，它會拋出一個 "Redirect" 錯誤
    if (isRedirectError(error)) {
      throw error; // 這裡必須「再拋出」，Next.js 才能接收到跳轉指令
    }
    // 只有真正的「登入失敗」（如密碼錯），才會走到下面這行
    return { success: false, message: formatError(error) };
  }
}

export async function getUserById(userId: string) {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
    },
  });
  if (!user) throw new Error("User not found");
  return user;
}

export async function updateUserAddress(data: ShippingAddress) {
  try {
    const session = await auth();

    const user = await getUserById(session?.user?.id as string);
    if (!user) throw new Error("user not found");

    // update user address
    const address = shippingAddressSchema.parse(data);
    await prisma.user.update({
      where: { id: user.id },
      data: { address },
    });
    return { success: true, message: "User address updated  successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function updateUserPaymentMethod(data: PaymentMethod) {
  try {
    const session = await auth();
    const user = await getUserById(session?.user?.id as string);
    if (!user) throw new Error("user not found");

    // update user payment method
    const paymentMethod = paymentMethodSchema.parse(data);
    await prisma.user.update({
      where: { id: user.id },
      data: { paymentMethod: paymentMethod.type },
    });
    return { success: true, message: "User paymethod updated  successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function updateProfile(user: { name: string; email: string }) {
  try {
    const session = await auth();
    const currentUser = await getUserById(session?.user?.id as string);
    if (!currentUser) throw new Error("user not found");

    console.log({ user });
    await prisma.user.update({
      where: { id: currentUser.id },
      data: { name: user.name },
    });

    return { success: true, message: "User profile updated  successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function getAllUsers({
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
          name: {
            contains: query,
            mode: "insensitive",
          } as Prisma.StringFilter,
        }
      : "";
  const data = await prisma.user.findMany({
    where: { ...queryFilter },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: (page - 1) * limit,
  });
  const dataCount = await prisma.user.count({ where: { ...queryFilter } });

  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
    totalCount: dataCount,
  };
}

export async function deleteUser(id: string) {
  try {
    await prisma.user.delete({ where: { id } });
    revalidatePath("/admin/users");
    return { success: true, message: "delete user sucessfully" };
  } catch (error) {
    if (error instanceof Error) console.log(error.message);
    return { success: false, message: formatError(error) };
  }
}

export async function updateUser(user: User) {
  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { name: user.name, role: user.role },
    });
    revalidatePath("/admin/users");
    return { success: true, message: "update user sucessfully" };
  } catch (error) {
    if (error instanceof Error) console.log(error.message);
    return { success: false, message: formatError(error) };
  }
}
