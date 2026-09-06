import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { deflateRawSync, inflateRawSync } from "node:zlib";
import { runtimeConfig } from "@/project/env";
import { normalizeShareItems } from "@/modules/session-collections/share";
import type { SavedPropertySelectionDto, SessionListingItem } from "@/modules/session-collections/types";

const MAX_TOKEN_LENGTH = 7_500;
const MAX_AGE_MS = 90 * 24 * 60 * 60 * 1_000;

type SelectionPayload = { createdAt: number; items: SessionListingItem[] };

export function createSavedPropertySelection(value: unknown) {
  const items = normalizeShareItems(value);
  if (!items.length) return { ok: false as const, error: "Добавьте хотя бы один объект." };
  const body = deflateRawSync(JSON.stringify({ createdAt: Date.now(), items } satisfies SelectionPayload)).toString("base64url");
  const token = `${body}.${sign(body)}`;
  if (token.length > MAX_TOKEN_LENGTH) return { ok: false as const, error: "В подборке слишком много данных для одной ссылки." };
  return { ok: true as const, token, itemCount: items.length };
}

export async function getSavedPropertySelection(token: string): Promise<SavedPropertySelectionDto | null> {
  if (!token || token.length > MAX_TOKEN_LENGTH) return null;
  const separator = token.lastIndexOf(".");
  if (separator < 1) return null;
  const body = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  if (!safeEqual(signature, sign(body))) return null;

  try {
    const parsed = JSON.parse(inflateRawSync(Buffer.from(body, "base64url")).toString("utf8")) as SelectionPayload;
    if (!Number.isFinite(parsed.createdAt) || Date.now() - parsed.createdAt > MAX_AGE_MS) return null;
    const items = normalizeShareItems(parsed.items);
    if (!items.length) return null;
    return {
      token,
      kind: "favorites",
      source: "favorites_share",
      itemCount: items.length,
      createdAt: new Date(parsed.createdAt).toISOString(),
      listings: items.map((listing, sortOrder) => ({ listing, sortOrder, unavailable: false })),
    };
  } catch {
    return null;
  }
}

function sign(body: string) {
  return createHmac("sha256", runtimeConfig.payloadSecret || "ams-local-selection-key").update(body).digest("base64url");
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}
