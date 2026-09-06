"use client";

import Link from "next/link";
import { CookieNoticeView } from "@starter/site-ui";
import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { COOKIE_NOTICE_EVENT, dismissCookieNotice, isCookieNoticeDismissed } from "./client";

function subscribeToCookieNotice(onStoreChange: () => void) {
  window.addEventListener(COOKIE_NOTICE_EVENT, onStoreChange);
  return () => window.removeEventListener(COOKIE_NOTICE_EVENT, onStoreChange);
}

function readRequiresCookieNotice() {
  return !isCookieNoticeDismissed();
}

function CookieLink({ href, children, className, title, rel, target, ariaLabel }: {
  href: string;
  children: React.ReactNode;
  className?: string;
  title?: string;
  rel?: string;
  target?: React.HTMLAttributeAnchorTarget;
  ariaLabel?: string;
}) {
  return (
    <Link href={href} className={className} title={title} rel={rel} target={target} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}

export function CookiePreferences() {
  const showNotice = useSyncExternalStore(subscribeToCookieNotice, readRequiresCookieNotice, () => false);

  if (!showNotice || typeof document === "undefined") return null;

  return createPortal(
    <CookieNoticeView onAccept={dismissCookieNotice} linkRenderer={CookieLink} />,
    document.body,
  );
}
