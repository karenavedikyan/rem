import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __remcardPrisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.__remcardPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__remcardPrisma = prisma;
}
