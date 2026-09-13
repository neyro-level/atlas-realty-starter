import { buildSearchParams, type CatalogQuery } from "@/lib/catalog";

export function resolveCatalogPageParam(value: string | string[] | undefined) {
  if (value === undefined) return { page: 1, valid: true } as const;
  if (Array.isArray(value) || !/^\d+$/.test(value)) return { page: 1, valid: false } as const;
  const page = Number(value);
  return { page, valid: Number.isSafeInteger(page) && page >= 1 } as const;
}

export function hasCatalogQueryFilters(searchParams: Record<string, string | string[] | undefined>) {
  return Object.keys(searchParams).some((key) => key !== "page");
}

export function buildCatalogPageHref(basePath: string, query: CatalogQuery, page: number) {
  const params = buildSearchParams({ ...query, page: page > 1 ? page : undefined });
  const search = params.toString();
  return search ? `${basePath}?${search}` : basePath;
}

export function buildCatalogPaginationWindow(page: number, totalPages: number): Array<number | "ellipsis"> {
  const visible = [...new Set([1, totalPages, page - 2, page - 1, page, page + 1, page + 2])]
    .filter((item) => item >= 1 && item <= totalPages)
    .sort((a, b) => a - b);
  const result: Array<number | "ellipsis"> = [];
  visible.forEach((item, index) => {
    if (index > 0 && item - visible[index - 1]! > 1) result.push("ellipsis");
    result.push(item);
  });
  return result;
}
