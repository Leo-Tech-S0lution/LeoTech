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
// Kept small: `next build` runs generateStaticParams across several worker
// processes at once, each with its own pool — a large `max` here multiplies
// into far more simultaneous connections against Neon's pooler than any of
// our pages actually need at once (none run more than a handful of parallel
// queries), and pushed the pooler into dropping connections under build load.
const pool =
  global.__leotechPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 4,
    connectionTimeoutMillis: 10_000,
  });

if (process.env.NODE_ENV !== "production") {
  global.__leotechPool = pool;
}

export const db = drizzle(pool, { schema });
