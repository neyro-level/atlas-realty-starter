"use client";

export function sameOriginFetch(path: string, init?: RequestInit) {
  if (!path.startsWith("/") || path.startsWith("//")) {
    throw new Error("Browser request must use a same-origin path");
  }
  return fetch(path, init);
}
