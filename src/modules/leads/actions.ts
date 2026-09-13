"use server";

import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { createPublicLead } from "@/project/leads/create-public-lead";
import { createLeadClientFingerprint } from "@/project/leads/client-fingerprint";
import { leadSchema, type LeadFormData } from "./schema";

export type CreateLeadActionResult = {
  ok: boolean;
  message: string;
  redirectTo?: string;
};

export async function createLeadAction(data: LeadFormData): Promise<CreateLeadActionResult> {
  const parsed = leadSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Проверьте поля формы." };
  }

  const propertyId = parsed.data.propertyId && isUuid(parsed.data.propertyId) ? parsed.data.propertyId : undefined;
  const complexId = parsed.data.complexId && isUuid(parsed.data.complexId) ? parsed.data.complexId : undefined;
  const startedAt = parsed.data.formRenderedAt && parsed.data.formRenderedAt <= Date.now() - 2_000
    ? parsed.data.formRenderedAt
    : Date.now() - 3_000;

  try {
    const requestHeaders = await headers();
    await createPublicLead({
      company: "",
      consent: true,
      email: parsed.data.email || undefined,
      formStartedAt: new Date(startedAt).toISOString(),
      formType: complexId ? "complex" : propertyId ? "property" : "general",
      idempotencyKey: parsed.data.submissionId ?? randomUUID(),
      message: parsed.data.message || undefined,
      name: parsed.data.name || undefined,
      phone: parsed.data.phone,
      propertyId,
      complexId,
      sourcePage: parsed.data.sourcePage,
      requestFingerprint: createLeadClientFingerprint(requestHeaders),
    });
    return { ok: true, message: "Ваша заявка зафиксирована. Мы свяжемся с вами в ближайшее время." };
  } catch {
    return { ok: false, message: "Не удалось сохранить заявку. Позвоните нам или попробуйте ещё раз." };
  }
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu.test(value);
}
