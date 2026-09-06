import "server-only";
import { runtimeConfig } from "@/project/env";

export const PUBLIC_CATALOG_LIMIT = 100;
export const LOCAL_FULL_CATALOG_LIMIT = 5000;

export function isFallbackCatalogAllowed() {
  return runtimeConfig.environment !== "production";
}

export function isLocalFullCatalogEnabled() {
  return runtimeConfig.environment !== "production" && runtimeConfig.localFullCatalog;
}

export function getMaxCatalogLimit() {
  return isLocalFullCatalogEnabled() ? LOCAL_FULL_CATALOG_LIMIT : PUBLIC_CATALOG_LIMIT;
}
