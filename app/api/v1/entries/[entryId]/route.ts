import { entryUpdateSchema } from "@/lib/validation";
import { auth } from "@/server/auth";
import {
  softDeleteEntry,
  updateEntryType,
} from "@/server/entries";

type RouteContext = {
  params: Promise<{ entryId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return Response.json({ error: "请先登录" }, { status: 401 });
  }

  const parsed = entryUpdateSchema.safeParse(await request.json());

  if (!parsed.success) {
    return Response.json({ error: "更新内容无效" }, { status: 400 });
  }

  const { entryId } = await context.params;
  const updated = await updateEntryType(
    session.user.id,
    entryId,
    parsed.data.type,
  );

  if (!updated) {
    return Response.json({ error: "记录不存在" }, { status: 404 });
  }

  return Response.json({ entry: updated });
}

export async function DELETE(request: Request, context: RouteContext) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return Response.json({ error: "请先登录" }, { status: 401 });
  }

  const { entryId } = await context.params;
  const deleted = await softDeleteEntry(session.user.id, entryId);

  if (!deleted) {
    return Response.json({ error: "记录不存在" }, { status: 404 });
  }

  return Response.json({ entry: deleted });
}
