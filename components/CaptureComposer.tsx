"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { SpaceKind } from "@/db/schema";

type CaptureComposerProps = {
  defaultSpace?: SpaceKind;
  compact?: boolean;
};

export function CaptureComposer({
  defaultSpace,
  compact = false,
}: CaptureComposerProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [spaceKind, setSpaceKind] = useState<SpaceKind>(
    defaultSpace ?? "personal",
  );
  const [text, setText] = useState("");
  const [status, setStatus] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!text.trim()) return;

    setPending(true);
    setStatus("");

    try {
      const response = await fetch("/api/v1/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spaceKind, text }),
      });

      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setStatus(result.error ?? "保存失败，请稍后再试");
        return;
      }

      setText("");
      setStatus("已安静收下");
      router.refresh();
      inputRef.current?.focus();
    } catch {
      setStatus("网络似乎断开了，这条内容还没有保存");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      className={compact ? "capture-card capture-card-compact" : "capture-card"}
      onSubmit={handleSubmit}
    >
      <label className="sr-only" htmlFor="capture-text">
        记录此刻的想法
      </label>
      <textarea
        id="capture-text"
        maxLength={5000}
        onChange={(event) => {
          setText(event.target.value);
          setStatus("");
        }}
        placeholder="此刻脑海里有什么？先写下来，不急着处理。"
        ref={inputRef}
        rows={compact ? 3 : 5}
        value={text}
      />

      <div className="capture-footer">
        <div className="space-switch" aria-label="选择记录空间">
          <button
            aria-pressed={spaceKind === "work"}
            className={spaceKind === "work" ? "is-active" : ""}
            onClick={() => setSpaceKind("work")}
            type="button"
          >
            工作
          </button>
          <button
            aria-pressed={spaceKind === "personal"}
            className={spaceKind === "personal" ? "is-active" : ""}
            onClick={() => setSpaceKind("personal")}
            type="button"
          >
            个人
          </button>
        </div>

        <div className="capture-actions">
          <span aria-live="polite" className="save-status">
            {status}
          </span>
          <button
            className="primary-button"
            disabled={pending || !text.trim()}
          >
            {pending ? "保存中…" : "收下"}
          </button>
        </div>
      </div>
    </form>
  );
}
