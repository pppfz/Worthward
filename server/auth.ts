import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { count } from "drizzle-orm";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { ensureUserSpaces } from "@/server/spaces";

const trustedOrigins = [
  process.env.APP_URL,
  process.env.BETTER_AUTH_URL,
  "http://localhost:3000",
].filter((origin): origin is string => Boolean(origin));

export const auth = betterAuth({
  appName: "前台",
  baseURL:
    process.env.BETTER_AUTH_URL ??
    process.env.APP_URL ??
    "http://localhost:3000",
  secret:
    process.env.BETTER_AUTH_SECRET ??
    "development-only-secret-change-before-deploying",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
  },
  trustedOrigins,
  databaseHooks: {
    user: {
      create: {
        before: async () => {
          const [result] = await db
            .select({ count: count() })
            .from(schema.user);
          return Number(result?.count ?? 0) === 0;
        },
        after: async (createdUser) => {
          await ensureUserSpaces(createdUser.id);
        },
      },
    },
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 20,
  },
});

export async function hasAdmin() {
  const [result] = await db.select({ count: count() }).from(schema.user);
  return Number(result?.count ?? 0) > 0;
}
