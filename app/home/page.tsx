import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { CaptureComposer } from "@/components/CaptureComposer";
import { requireSession } from "@/server/session";
import { SPACE_META } from "@/server/spaces";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await requireSession();

  return (
    <>
      <AppHeader userName={session.user.name} />
      <main className="home-shell">
        <section className="home-intro">
          <p className="eyebrow">A QUIET PLACE TO BEGIN</p>
          <h1>现在脑海里，有什么值得先被收下？</h1>
          <p>只记录，不急着分析。等你想整理时，再回到对应的空间。</p>
        </section>

        <CaptureComposer />

        <section aria-label="选择空间" className="space-grid">
          {(["work", "personal"] as const).map((kind) => {
            const meta = SPACE_META[kind];
            return (
              <Link
                className={`space-card space-card-${kind}`}
                href={`/spaces/${kind}`}
                key={kind}
              >
                <div className="space-card-top">
                  <span className="space-symbol">
                    {kind === "work" ? "工" : "生"}
                  </span>
                  <span className="space-arrow">↗</span>
                </div>
                <div>
                  <p className="eyebrow">{meta.eyebrow}</p>
                  <h2>{meta.name}</h2>
                  <p>{meta.description}</p>
                </div>
              </Link>
            );
          })}
        </section>

        <p className="privacy-note">
          两个空间的数据不会互相展示，也不会被放进同一次整理中。
        </p>
      </main>
    </>
  );
}
