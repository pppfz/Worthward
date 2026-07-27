import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { CaptureComposer } from "@/components/CaptureComposer";
import { EntryCard } from "@/components/EntryCard";
import { listEntries } from "@/server/entries";
import { requireSession } from "@/server/session";
import { isSpaceKind, SPACE_META } from "@/server/spaces";

export const dynamic = "force-dynamic";

type SpacePageProps = {
  params: Promise<{ kind: string }>;
  searchParams: Promise<{ view?: string }>;
};

export default async function SpacePage({
  params,
  searchParams,
}: SpacePageProps) {
  const { kind: rawKind } = await params;

  if (!isSpaceKind(rawKind)) {
    notFound();
  }

  const session = await requireSession();
  const { view } = await searchParams;
  const activeView = view === "inbox" ? "inbox" : "timeline";
  const items = await listEntries(session.user.id, rawKind, activeView);
  const meta = SPACE_META[rawKind];

  return (
    <>
      <AppHeader backHref="/home" userName={session.user.name} />
      <main className={`space-shell space-theme-${rawKind}`}>
        <section className="space-heading">
          <div>
            <p className="eyebrow">{meta.eyebrow}</p>
            <h1>{meta.name}</h1>
            <p>{meta.description}</p>
          </div>
          <div className="frontstage-placeholder">
            <span>前台目标</span>
            <p>v0.2 开启。现在先让记录这件事变得自然。</p>
          </div>
        </section>

        <CaptureComposer compact defaultSpace={rawKind} />

        <section className="journal-section">
          <div className="journal-toolbar">
            <div>
              <p className="eyebrow">RECORDS</p>
              <h2>{activeView === "inbox" ? "收件箱" : "日记时间流"}</h2>
            </div>
            <nav aria-label="记录筛选" className="view-tabs">
              <Link
                aria-current={activeView === "timeline" ? "page" : undefined}
                className={activeView === "timeline" ? "is-active" : ""}
                href={`/spaces/${rawKind}`}
              >
                时间流
              </Link>
              <Link
                aria-current={activeView === "inbox" ? "page" : undefined}
                className={activeView === "inbox" ? "is-active" : ""}
                href={`/spaces/${rawKind}?view=inbox`}
              >
                待整理
              </Link>
            </nav>
          </div>

          {items.length ? (
            <div className="entry-list">
              {items.map((entry) => (
                <EntryCard
                  entry={{
                    ...entry,
                    occurredAt: entry.occurredAt.toISOString(),
                  }}
                  key={entry.id}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span>○</span>
              <h3>
                {activeView === "inbox"
                  ? "没有等待整理的内容"
                  : "这里还很安静"}
              </h3>
              <p>
                {activeView === "inbox"
                  ? "已经整理过的记录仍然保留在时间流中。"
                  : "写下一点真实发生的事就好，不必把它写完整。"}
              </p>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
