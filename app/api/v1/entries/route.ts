import { db } from "@/db";
import { entries } from "@/db/schema";
import { captureSchema } from "@/lib/validation";
import { auth } from "@/server/auth";
import { getUserSpace } from "@/server/spaces";

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return Response.json({ error: "请先登录" }, { status: 401 });
  }

  const parsed = captureSchema.safeParse(await request.json());

  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "记录内容无效" },
      { status: 400 },
    );
  }

  const space = await getUserSpace(session.user.id, parsed.data.spaceKind);

  if (!space) {
    return Response.json({ error: "空间不存在" }, { status: 404 });
  }

  const [entry] = await db
    .insert(entries)
    .values({
      spaceId: space.id,
      rawText: parsed.data.text,
    })
    .returning({
      id: entries.id,
      createdAt: entries.createdAt,
    });

  return Response.json({ entry }, { status: 201 });
}
