// /db/prisma.ts
import { PrismaNeon } from "@prisma/adapter-neon";
// 💡 注意：你的路徑是 lib/generated/prisma
import { PrismaClient } from "../lib/generated/prisma";

const connectionString = process.env.DATABASE_URL;

// 同學推薦的寫法：直接傳入 connectionString
const adapter = new PrismaNeon({ connectionString });

export const prisma = new PrismaClient({ adapter }).$extends({
  result: {
    product: {
      price: {
        compute(product) {
          return product.price?.toString() ?? "0";
        },
      },
      rating: {
        compute(product) {
          return product.rating?.toString() ?? "0";
        },
      },
    },
  },
});
