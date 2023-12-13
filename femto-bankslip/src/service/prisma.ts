import { getPrismaClient } from "@mahasak/femto-sh-schema";

export const getPrisma = async () => {
  const { prisma } = await getPrismaClient();
  return prisma;
}
