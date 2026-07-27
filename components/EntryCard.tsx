"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { EntryType } from "@/db/schema";

type EntryCardProps = {
  entry: {
    id: string;
    rawText: string;
    type: EntryType;
    occurredAt: string;
  };
};

export function EntryCard({ entry }: EntryCardProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const formattedDate = new Intl.DateTimeFormat("zh-CN", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(entry.occurredAt));

  async function updateType(type: EntryType) {
    setPending(true);
    setError("");

    try {
      const response = await fetch(`/api/v1/entries/${entry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });

      if (!response.ok) throw new Error();
      router.refresh();
    } catch {
      setError("暂时没能更新");
    } finally {
      setPending(false);
    }
  }

  async function remove() {
    if (!window.confirm("删除这条记录？")) return;
    setPending(true);
    setError("");

    try {
      const response = await fetch(`/api/v1/entries/${entry.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error();
      router.refresh();
    } catch {
      setError("暂时没能删除");
    } finally {
      setPending(false);
    }
  }

  return (
    <article className="entry-card">
      <div className="entry-meta">
        <time dateTime={entry.occurredAt}>{formattedDate}</time>
        <span className={`entry-badge entry-badge-${entry.type}`}>
          {entry.type === "journal" ? "已整理" : "待整理"}
        </span>
      </div>

      <p>{entry.rawText}</p>

      <div className="entry-actions">
        {entry.type === "unclassified" ? (
          <button disabled={pending} onClick={() => updateType("journal")}>
            收入日记
          </button>
        ) : (
          <button
            disabled={pending}
            onClick={() => updateType("unclassified")}
          >
            放回收件箱
          </button>
        )}
        <button className="subtle-danger" disabled={pending} onClick={remove}>
          删除
        </button>
        {error ? <span className="form-error">{error}</span> : null}
      </div>
    </article>
  );
}
