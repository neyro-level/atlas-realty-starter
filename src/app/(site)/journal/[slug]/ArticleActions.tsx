"use client";
import { ArticleActionsView } from "@starter/site-ui";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { createArticleSessionItem, isDefaultFavoriteArticleId } from "@/modules/session-collections/favorite-article";
import { isSessionCollectionItemActive, SESSION_COLLECTION_EVENT, toggleSessionCollectionItem } from "@/modules/session-collections/storage";

export function ArticleActions({ title, slug, coverImage = null, excerpt = null, variant = "desktop", className = "" }: { title: string; slug: string; coverImage?: string | null; excerpt?: string | null; variant?: "desktop" | "mobile"; className?: string }) {
  const [shareLabel, setShareLabel] = useState("Поделиться");
  const [favoriteActive, setFavoriteActive] = useState(false);
  const hydrated = useSyncExternalStore(subscribeHydration, getClientHydrationSnapshot, getServerHydrationSnapshot);
  const item = useMemo(() => createArticleSessionItem({ slug, title, image: coverImage, excerpt }), [coverImage, excerpt, slug, title]);
  useEffect(() => { const sync = () => setFavoriteActive(isSessionCollectionItemActive("favorites", item.id)); sync(); window.addEventListener(SESSION_COLLECTION_EVENT, sync); return () => window.removeEventListener(SESSION_COLLECTION_EVENT, sync); }, [item.id]);
  const onShare = async () => { try { if (navigator.share) { await navigator.share({ title, url: window.location.href }); return; } await navigator.clipboard.writeText(window.location.href); setShareLabel("Ссылка скопирована"); } catch { setShareLabel("Не удалось"); } window.setTimeout(() => setShareLabel("Поделиться"), 1800); };
  const favoriteLabel = favoriteActive ? isDefaultFavoriteArticleId(item.id) ? "В избранном" : "Убрать из избранного" : "В избранное";
  return <ArticleActionsView favoriteActive={favoriteActive} favoriteLabel={favoriteLabel} shareLabel={shareLabel} hydrated={hydrated} variant={variant} className={className} onToggleFavorite={() => setFavoriteActive(toggleSessionCollectionItem("favorites", item))} onShare={onShare} />;
}

const subscribeHydration = () => () => undefined;
const getClientHydrationSnapshot = () => true;
const getServerHydrationSnapshot = () => false;
