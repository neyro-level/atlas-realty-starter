"use client";

import { Button } from "@starter/site-ui";

import { Copy, Share2 } from "lucide-react";
import { useMemo, useState } from "react";
import { sameOriginFetch } from "@/core/security/outbound-http/browser";
import {
  buildSavedSelectionShareText,
  buildSavedSelectionShareTitle,
} from "./share-copy";
import type { SessionListingItem } from "./types";

type Props = {
  items: SessionListingItem[];
};

type ShareState = "idle" | "loading" | "success" | "error";

const textButtonClass =
  "inline-flex items-baseline gap-1.5 text-body-compact font-semibold leading-none text-[var(--text-muted)] transition hover:text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-55 md:text-body-large";

export function ShareFavoritesButton({ items }: Props) {
  const [state, setState] = useState<ShareState>("idle");
  const [savedShare, setSavedShare] = useState<{ url: string; signature: string } | null>(null);
  const [message, setMessage] = useState("");
  const itemsSignature = useMemo(() => items.map((item) => item.id).join("|"), [items]);
  const shareUrl = savedShare?.signature === itemsSignature ? savedShare.url : "";
  const messageToRender = state === "error" || shareUrl ? message : "";

  async function shareOrCopyUrl(url: string) {
    const title = buildSavedSelectionShareTitle();
    const text = buildSavedSelectionShareText(items.length);

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text, url });
        setState("success");
        setMessage("Ссылку можно сразу отправить");
        return;
      } catch {
        // Cancelled or unsupported — fall back to clipboard.
      }
    }

    const copied = await copyToClipboard(url);
    setState("success");
    setMessage(copied ? "Ссылка скопирована" : "Ссылка готова к отправке");
  }

  async function createShareLink() {
    if (!items.length || state === "loading") {
      return;
    }

    setState("loading");
    setMessage("");

    try {
      const response = await sameOriginFetch("/api/izbrannoe/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          propertyIds: items.map((item) => item.id),
        }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok || !payload.ok || typeof payload.path !== "string") {
        throw new Error(typeof payload.error === "string" ? payload.error : "Не удалось создать ссылку.");
      }

      const url = new URL(payload.path, window.location.origin).toString();
      setSavedShare({ url, signature: itemsSignature });
      await shareOrCopyUrl(url);
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Не удалось создать ссылку.");
    }
  }

  async function handleShareClick() {
    if (!shareUrl) {
      await createShareLink();
      return;
    }

    if (state === "loading") {
      return;
    }

    setState("loading");
    setMessage("");

    try {
      await shareOrCopyUrl(shareUrl);
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Не удалось подготовить ссылку.");
    }
  }

  return (
    <div className="flex shrink-0 flex-col items-end gap-1.5">
      <Button variant="plain"
        type="button"
        data-analytics-event="share_click"
        onClick={handleShareClick}
        disabled={!items.length || state === "loading"}
        className={textButtonClass}
      >
        {shareUrl ? (
          <Copy className="shrink-0 translate-y-[0.05em]" aria-hidden />
        ) : (
          <Share2 className="shrink-0 translate-y-[0.05em]" aria-hidden />
        )}
        {state === "loading" ? "…" : "Поделиться"}
      </Button>
      {messageToRender ? (
        <span className={`max-w-65 text-right text-caption font-medium leading-4 ${state === "error" ? "text-[var(--accent)]" : "text-[var(--text-muted)]"}`}>
          {messageToRender}
        </span>
      ) : null}
    </div>
  );
}

async function copyToClipboard(value: string) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    return false;
  }

  return false;
}
