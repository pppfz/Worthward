import assert from "node:assert/strict";
import test from "node:test";
import { readdirSync, readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "../db/schema.ts";

const migrationsDirectory = new URL("../drizzle/", import.meta.url);
const migration = readdirSync(migrationsDirectory)
  .filter((file) => file.endsWith(".sql"))
  .sort()
  .map((file) => readFileSync(new URL(file, migrationsDirectory), "utf8"))
  .join("\n")
  .replaceAll("--> statement-breakpoint", "");

async function createDatabase() {
  const database = new PGlite();
  await database.exec(migration);
  return database;
}

test("migration creates the v0.1 schema and enforces one space per kind", async () => {
  const database = await createDatabase();

  await database.exec(`
    insert into "user" ("id", "name", "email")
    values ('user-a', 'A', 'a@example.com');
    insert into "spaces" ("user_id", "kind", "name")
    values ('user-a', 'work', '工作');
  `);

  await assert.rejects(
    database.exec(`
      insert into "spaces" ("user_id", "kind", "name")
      values ('user-a', 'work', '另一个工作空间');
    `),
  );

  await database.close();
});

test("a workspace timeline cannot return entries from the other workspace", async () => {
  const database = await createDatabase();

  await database.exec(`
    insert into "user" ("id", "name", "email")
    values ('user-a', 'A', 'a@example.com');

    insert into "spaces" ("id", "user_id", "kind", "name")
    values
      ('00000000-0000-4000-8000-000000000001', 'user-a', 'work', '工作'),
      ('00000000-0000-4000-8000-000000000002', 'user-a', 'personal', '个人');

    insert into "entries" ("space_id", "raw_text")
    values
      ('00000000-0000-4000-8000-000000000001', '工作记录'),
      ('00000000-0000-4000-8000-000000000002', '个人记录');
  `);

  const result = await database.query(`
    select e."raw_text"
    from "entries" e
    inner join "spaces" s on e."space_id" = s."id"
    where s."user_id" = 'user-a'
      and s."kind" = 'work'
      and e."deleted_at" is null
  `);

  assert.deepEqual(result.rows, [{ raw_text: "工作记录" }]);
  await database.close();
});

test("Better Auth can create and authenticate the first credential account", async () => {
  const database = await createDatabase();
  const testDb = drizzle(database, { schema });
  const testAuth = betterAuth({
    baseURL: "http://localhost:3000",
    secret: "test-secret-with-more-than-thirty-two-characters",
    database: drizzleAdapter(testDb, { provider: "pg", schema }),
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
    },
    logger: {
      disabled: true,
    },
  });

  const signUpResponse = await testAuth.handler(
    new Request("http://localhost:3000/api/auth/sign-up/email", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: "测试用户",
        email: "owner@example.com",
        password: "a-secure-test-password",
      }),
    }),
  );

  assert.equal(signUpResponse.status, 200);

  const users = await database.query(
    `select "email" from "user" where "email" = 'owner@example.com'`,
  );
  const accounts = await database.query(
    `select "provider_id" from "account" where "provider_id" = 'credential'`,
  );

  assert.deepEqual(users.rows, [{ email: "owner@example.com" }]);
  assert.deepEqual(accounts.rows, [{ provider_id: "credential" }]);

  const secondSignUpResponse = await testAuth.handler(
    new Request("http://localhost:3000/api/auth/sign-up/email", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: "第二个用户",
        email: "second@example.com",
        password: "another-secure-test-password",
      }),
    }),
  );

  assert.notEqual(secondSignUpResponse.status, 200);
  await database.close();
});
