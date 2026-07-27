import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const schemaSource = readFileSync(
  new URL("../db/schema.ts", import.meta.url),
  "utf8",
);
const entryRouteSource = readFileSync(
  new URL("../app/api/v1/entries/route.ts", import.meta.url),
  "utf8",
);
const pageSource = readFileSync(
  new URL("../app/spaces/[kind]/page.tsx", import.meta.url),
  "utf8",
);

test("database schema enforces one space of each kind per user", () => {
  assert.match(schemaSource, /spaces_user_kind_unique/);
  assert.match(schemaSource, /table\.userId,\s*table\.kind/);
});

test("entry creation resolves the space through the authenticated user", () => {
  assert.match(entryRouteSource, /getUserSpace\(session\.user\.id/);
});

test("space page filters records with the authenticated user id", () => {
  assert.match(pageSource, /listEntries\(session\.user\.id/);
});

test("v0.1 page does not invoke AI or push features", () => {
  assert.doesNotMatch(pageSource, /openai|web push|notification/i);
});
