import { PrismaClient } from "@/lib/generated/prisma";
import sampleData from "./sample-data";
async function main() {
  const prisma = new PrismaClient({} as any);
  try {
    await prisma.product.deleteMany();
    await prisma.product.createMany({ data: sampleData.products });

    console.log("Database seeded successfully.");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}
main();
