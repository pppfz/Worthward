import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { spaces, type SpaceKind } from "@/db/schema";

export const SPACE_META: Record<
  SpaceKind,
  { name: string; eyebrow: string; description: string }
> = {
  work: {
    name: "工作",
    eyebrow: "WORK",
    description: "收下工作中的判断、线索和未完成的思考。",
  },
  personal: {
    name: "个人",
    eyebrow: "LIFE",
    description: "给生活、情绪和想做的事留一个安静的位置。",
  },
};

export function isSpaceKind(value: string): value is SpaceKind {
  return value === "work" || value === "personal";
}

export async function ensureUserSpaces(userId: string) {
  await db
    .insert(spaces)
    .values([
      { userId, kind: "work", name: "工作" },
      { userId, kind: "personal", name: "个人" },
    ])
    .onConflictDoNothing();
}

export async function getUserSpace(userId: string, kind: SpaceKind) {
  const [space] = await db
    .select()
    .from(spaces)
    .where(and(eq(spaces.userId, userId), eq(spaces.kind, kind)))
    .limit(1);

  return space ?? null;
}
