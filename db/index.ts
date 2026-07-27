import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://frontstage:frontstage@localhost:5432/frontstage";

const globalForDb = globalThis as unknown as {
  postgresClient?: ReturnType<typeof postgres>;
};

export const postgresClient =
  globalForDb.postgresClient ??
  postgres(connectionString, {
    max: process.env.NODE_ENV === "production" ? 10 : 3,
    prepare: false,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.postgresClient = postgresClient;
}

export const db = drizzle(postgresClient, { schema });
