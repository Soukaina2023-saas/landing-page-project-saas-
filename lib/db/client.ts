import { PrismaClient } from "./generated/prisma/client.js";

let prismaInstance: PrismaClient | null = null;

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: ["error"],
    datasourceUrl: process.env.DATABASE_URL,
  } as unknown as ConstructorParameters<typeof PrismaClient>[0]);
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
