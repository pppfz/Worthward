import { and, desc, eq, inArray, isNull } from "drizzle-orm";
import { db } from "@/db";
import { entries, spaces, type EntryType, type SpaceKind } from "@/db/schema";

export async function listEntries(
  userId: string,
  kind: SpaceKind,
  filter: "timeline" | "inbox",
) {
  const conditions = [
    eq(spaces.userId, userId),
    eq(spaces.kind, kind),
    isNull(entries.deletedAt),
  ];

  if (filter === "inbox") {
    conditions.push(eq(entries.type, "unclassified"));
  }

  return db
    .select({
      id: entries.id,
      rawText: entries.rawText,
      type: entries.type,
      occurredAt: entries.occurredAt,
      createdAt: entries.createdAt,
    })
    .from(entries)
    .innerJoin(spaces, eq(entries.spaceId, spaces.id))
    .where(and(...conditions))
    .orderBy(desc(entries.occurredAt))
    .limit(100);
}

export async function updateEntryType(
  userId: string,
  entryId: string,
  type: EntryType,
) {
  const ownedEntry = db
    .select({ id: entries.id })
    .from(entries)
    .innerJoin(spaces, eq(entries.spaceId, spaces.id))
    .where(
      and(
        eq(entries.id, entryId),
        eq(spaces.userId, userId),
        isNull(entries.deletedAt),
      ),
    );

  const [updated] = await db
    .update(entries)
    .set({ type, updatedAt: new Date() })
    .where(inArray(entries.id, ownedEntry))
    .returning({ id: entries.id });

  return updated ?? null;
}

export async function softDeleteEntry(userId: string, entryId: string) {
  const ownedEntry = db
    .select({ id: entries.id })
    .from(entries)
    .innerJoin(spaces, eq(entries.spaceId, spaces.id))
    .where(
      and(
        eq(entries.id, entryId),
        eq(spaces.userId, userId),
        isNull(entries.deletedAt),
      ),
    );

  const [deleted] = await db
    .update(entries)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(inArray(entries.id, ownedEntry))
    .returning({ id: entries.id });

  return deleted ?? null;
}
