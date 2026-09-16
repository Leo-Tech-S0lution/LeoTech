import "server-only";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Add it to .env.local (see .env.example).");
}

declare global {
  // eslint-disable-next-line no-var
  var __leotechPool: Pool | undefined;
}

// Reuse the pool across hot reloads in dev to avoid exhausting Neon connections.
const pool =
  global.__leotechPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
  });

if (process.env.NODE_ENV !== "production") {
  global.__leotechPool = pool;
}

export const db = drizzle(pool, { schema });
