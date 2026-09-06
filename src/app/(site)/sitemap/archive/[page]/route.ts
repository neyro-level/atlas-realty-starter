import { NextResponse } from "next/server";
import { absoluteUrl } from "@/project/seo-config";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ page: string }> },
) {
  const page = Number((await params).page);
  if (!Number.isInteger(page) || page < 1) {
    return new Response("Not found", { status: 404 });
  }

  return NextResponse.redirect(absoluteUrl(`/sitemap/reserve/${page}`), 301);
}
