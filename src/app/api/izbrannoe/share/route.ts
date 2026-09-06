import { NextResponse } from "next/server";
import { isSameOriginRequest } from "@/core/security/request-origin";
import { createSavedPropertySelection } from "@/site-engine/saved-selection";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  const payload = await request.json().catch(() => null) as { items?: unknown } | null;
  const result = createSavedPropertySelection(payload?.items);
  if (!result.ok) return NextResponse.json(result, { status: 422 });
  return NextResponse.json({ ok: true, token: result.token, path: `/izbrannoe/s/${result.token}`, itemCount: result.itemCount });
}
