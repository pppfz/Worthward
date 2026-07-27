import { redirect } from "next/navigation";
import { hasAdmin } from "@/server/auth";
import { getSession } from "@/server/session";

export const dynamic = "force-dynamic";

export default async function EntryPage() {
  const configured = await hasAdmin();

  if (!configured) {
    redirect("/setup");
  }

  const session = await getSession();
  redirect(session ? "/home" : "/login");
}
