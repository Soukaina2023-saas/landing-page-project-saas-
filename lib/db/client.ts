import { PrismaClient } from "@prisma/client";

let prismaInstance: PrismaClient | null = null;

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: ["error"],
  });
}

export function getPrisma() {
  if (!prismaInstance) {
    prismaInstance = createPrismaClient();
  }

  return prismaInstance;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrisma();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function"
      ? (value as (...args: unknown[]) => unknown).bind(client)
      : value;
  },
});
