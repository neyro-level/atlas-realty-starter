import { z } from "zod";
import { normalizeLeadPhone } from "@/modules/anti-spam";
import { normalizeAllowedLeadSourcePage } from "./source-page-policy";

const slugLikeRegex = /^[a-z0-9:_/\-.]{1,120}$/i;
const cuidLikeRegex = /^[a-z0-9]{8,64}$/i;

export function normalizeLeadSourcePage(value: string): string | null {
  return normalizeAllowedLeadSourcePage(value);
}

const sourcePageSchema = z.string().trim().min(1).max(200).transform((value, ctx) => {
  const normalized = normalizeLeadSourcePage(value);
  if (!normalized) {
    ctx.addIssue({
      code: "custom",
      message: "sourcePage must be a public local pathname",
    });
    return z.NEVER;
  }
  return normalized;
});

export const leadSchema = z.object({
  submissionId: z.uuid().optional(),
  propertyId: z.string().trim().regex(cuidLikeRegex, "propertyId has invalid format").optional().nullable(),
  complexId: z.uuid("complexId has invalid format").optional().nullable(),
  agentId: z.string().trim().regex(cuidLikeRegex, "agentId has invalid format").optional().nullable(),
  sourcePage: sourcePageSchema,
  source: z.string().trim().regex(slugLikeRegex, "source has invalid format").default("page_showcase"),
  formType: z.string().trim().regex(slugLikeRegex, "formType has invalid format").default("lead"),
  name: z.string().trim().max(100).optional().or(z.literal("")),
  phone: z.string().trim().refine((value) => Boolean(normalizeLeadPhone(value)), {
    message: "Введите корректный телефон",
  }),
  email: z.string().trim().email("Введите корректный email").optional().or(z.literal("")),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
  consent: z.boolean().refine((value) => value === true, {
    error: "Необходимо согласие на обработку персональных данных",
  }),
  website: z.string().trim().max(500).optional().or(z.literal("")),
  formRenderedAt: z.number().int().positive().optional(),
  payload: z.unknown().optional(),
});

export type LeadFormData = z.input<typeof leadSchema>;
export type ParsedLeadFormData = z.output<typeof leadSchema>;
