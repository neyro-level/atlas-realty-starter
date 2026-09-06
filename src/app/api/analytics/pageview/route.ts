import { NextResponse } from "next/server";
import { isSameOriginRequest } from "@/core/security/request-origin";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return NextResponse.json({ ok: false }, { status: 403 });
  return new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}
