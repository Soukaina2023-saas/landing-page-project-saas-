import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Prisma 7: connection URLs live in `prisma.config.ts` only (not in schema.prisma).
 * - `DATABASE_URL` — pooled (transaction mode / pgbouncer). Used at runtime by `lib/db/client.ts` via `datasourceUrl`.
 * - `DIRECT_URL` — session pooler or direct Postgres; used by CLI for migrate, db execute, introspect (avoids pgbouncer limits).
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  },
});
