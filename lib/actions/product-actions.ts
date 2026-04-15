"use server";

import { prisma } from "@/db/prisma";
import { InsertProduct, UpdateProduct } from "@/types";
import { Prisma } from "@/lib/generated/prisma";
import { revalidatePath } from "next/cache";
import { LATEST_PRODUCTS_LIMIT, PAGE_SIZE } from "../constants";
import { convertToPlainObject, formatError } from "../utils";
import { insertProductSchema, updateProductSchema } from "../validators";

export async function getLatestProducts() {
  const data = await prisma.product.findMany({
    take: LATEST_PRODUCTS_LIMIT,
    orderBy: { createdAt: "desc" },
  });

  return convertToPlainObject(data);
}

export async function getProductBySlug(slug: string) {
  return await prisma.product.findFirst({
    where: { slug: slug },
  });
}

export async function getProductById(id: string) {
  const data = await prisma.product.findFirst({
    where: { id },
  });
  return convertToPlainObject(data);
}

export async function getAllProducts({
  limit = PAGE_SIZE,
  page,
  query = "all",
  category,
  price,
  rating,
  sort,
}: {
  limit?: number;
  page: number;
  query: string;
  category?: string;
  price?: string;
  rating?: string;
  sort?: string;
}) {
  const queryFilter =
    query && query !== "all"
      ? {
          name: {
            contains: query,
            mode: "insensitive",
          } as Prisma.StringFilter,
        }
      : {};
  const categoryFilter =
    category && category !== "all"
      ? {
          category: category,
        }
      : {};
  const priceFilter =
    price && price !== "all"
      ? {
          price: {
            gte: Number(price.split("-")[0]),
            lte: Number(price.split("-")[1]),
          },
        }
      : {};
  const ratingFilter =
    rating && rating !== "all" ? { rating: { gte: Number(rating) } } : {};
  // console.log({ price, priceFilter });
  // console.log({ rating, ratingFilter });
  const data = await prisma.product.findMany({
    where: {
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    },
    orderBy:
      sort === "lowest"
        ? { price: "asc" }
        : sort === "highest"
          ? { price: "desc" }
          : sort === "rating"
            ? { rating: "desc" }
            : { createdAt: "desc" },
    take: limit,
    skip: (page - 1) * limit,
  });
  const dataCount = await prisma.product.count({
    where: {
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    },
  });

  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
    totalCount: dataCount,
  };
}

export async function deleteProduct(id: string) {
  try {
    await prisma.product.delete({ where: { id } });
    revalidatePath("/admin/products");
    return { success: true, message: "delete product sucessfully" };
  } catch (error) {
    if (error instanceof Error) console.log(error.message);
    return { success: false, message: formatError(error) };
  }
}

export async function createProduct(data: InsertProduct) {
  try {
    const product = insertProductSchema.parse(data);
    await prisma.product.create({ data: product });
    revalidatePath("/admin/products");
    return { success: true, message: "create product sucessfully" };
  } catch (error) {
    if (error instanceof Error) console.log(error.message);
    return { success: false, message: formatError(error) };
  }
}

export async function updateProduct(data: UpdateProduct) {
  try {
    const product = updateProductSchema.parse(data);
    const productExisting = await prisma.product.findFirst({
      where: { id: product.id },
    });
    if (!productExisting) throw new Error("product not found");
    await prisma.product.update({
      where: { id: product.id },
      data: product,
    });
    revalidatePath("/admin/products");
    return { success: true, message: "update product sucessfully" };
  } catch (error) {
    if (error instanceof Error) console.log(error.message);
    return { success: false, message: formatError(error) };
  }
}

export async function getAllCategories() {
  const data = await prisma.product.groupBy({
    by: ["category"],
    _count: true,
  });

  return data;
}

export async function getFeaturedProducts() {
  const data = await prisma.product.findMany({
    where: { isFeatured: true },
    orderBy: { createdAt: "desc" },
    take: 4,
  });
  // console.log({ data });
  return convertToPlainObject(data);
}
