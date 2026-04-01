import { PrismaClient } from "@prisma/client";

/** Seconds — libpq `connect_timeout`; avoids hanging until the platform kills the invocation. */
const SERVERLESS_CONNECT_TIMEOUT_SEC = 10;

let prismaInstance: PrismaClient | null = null;

function resolveDatasourceUrl(raw: string | undefined): string | undefined {
  if (!raw) return raw;
  try {
    const url = new URL(raw);
    if (!url.searchParams.has("connect_timeout")) {
      url.searchParams.set(
        "connect_timeout",
        String(SERVERLESS_CONNECT_TIMEOUT_SEC),
      );
    }
    return url.href;
  } catch {
    return raw;
  }
}

function createPrismaClient(): PrismaClient {
  // Prisma 7: `datasourceUrl` on the constructor is invalid. The generated client
  // reads `DATABASE_URL`; `datasources: { db: { url } }` is not in the public TS
  // types for this generator, so we normalize the URL (connect_timeout) on env.
  const resolved = resolveDatasourceUrl(process.env.DATABASE_URL);
  if (resolved) {
    process.env.DATABASE_URL = resolved;
  }
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
