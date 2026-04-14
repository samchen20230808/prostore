"use server";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { InsertReview } from "@/types";
import { revalidatePath } from "next/cache";
import { formatError } from "../utils";
import { insertReviewSchema } from "../validators";

export async function createUpdateReview(data: InsertReview) {
  try {
    const session = await auth();
    if (!session) throw new Error("user not authenticated");

    const review = insertReviewSchema.parse({
      ...data,
      userId: session.user.id,
    });

    const product = await prisma.product.findFirst({
      where: {
        id: review.productId,
      },
    });
    if (!product) throw new Error("product not found");

    const reviewExisting = await prisma.review.findFirst({
      where: {
        productId: review.productId,
        userId: review.userId,
      },
    });

    await prisma.$transaction(async (tx) => {
      if (reviewExisting) {
        // update review
        await tx.review.update({
          where: { id: reviewExisting.id },
          data: {
            title: review.title,
            description: review.description,
            rating: review.rating,
          },
        });
      } else {
        // create review
        await tx.review.create({ data: review });
      }

      // update rating , numReviews to product db
      const averageRating = await tx.review.aggregate({
        _avg: { rating: true },
      });
      const numReviews = await tx.review.count({
        where: { productId: review.productId },
      });

      await tx.product.update({
        where: { id: review.productId },
        data: {
          rating: averageRating._avg.rating || 0,
          numReviews,
        },
      });
    });

    revalidatePath("/product/${product.slug}");
    return { success: true, message: "update review sucessfully" };
  } catch (error) {
    if (error instanceof Error) console.log(error.message);
    return { success: false, message: formatError(error) };
  }
}

export async function getReviews({ productId }: { productId: string }) {
  const data = await prisma.review.findMany({
    where: { productId: productId },
    include: {
      user: {
        select: { name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return data;
}

export async function getReviewsByProductId({
  productId,
}: {
  productId: string;
}) {
  const session = await auth();
  if (!session) throw new Error("user not authenticated");

  return await prisma.review.findFirst({
    where: {
      userId: session.user.id,
      productId,
    },
  });
}
