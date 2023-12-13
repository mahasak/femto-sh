import { getPrismaClient } from "@femto-sh/femto-shared/prisma";

export const getPrisma = async () => {
  const { prisma } = await getPrismaClient();
  return prisma;
}
