import { NextResponse } from "next/server";
import { CATALOG_PAGE_SIZE } from "@/lib/catalog";
import { parseCatalogSearchParams } from "@/modules/catalog";
import { getSiteEngine } from "@/site-engine";

export async function GET(request: Request) {
  const query = parseCatalogSearchParams(new URL(request.url).searchParams);
  const limit = query.limit ?? CATALOG_PAGE_SIZE;
  const catalog = await (await getSiteEngine()).getCatalog({
    ...query,
    limit,
  });

  return NextResponse.json({
    data: catalog.items,
    meta: {
      total: catalog.total,
      page: query.page ?? 1,
      limit,
    },
  });
}
