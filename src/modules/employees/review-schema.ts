import { z } from "zod";

const russianMobilePhone = /^\+7\d{10}$/;

export const employeeReviewSchema = z.object({
  agentId: z.string().min(1),
  authorName: z.string().trim().min(2, "Укажите ваше имя").max(100),
  authorPhone: z.string().trim().transform(normalizeReviewPhone).refine(
    (value) => russianMobilePhone.test(value),
    "Введите российский номер телефона",
  ),
  rating: z.coerce.number().int().min(1).max(5),
  text: z.string().trim().min(30, "Расскажите о работе специалиста чуть подробнее").max(2000),
  consent: z.boolean().refine(Boolean, "Нужно согласие на обработку персональных данных"),
  website: z.string().max(0).optional().or(z.literal("")),
  startedAt: z.number().int().positive(),
});

export type EmployeeReviewInput = z.input<typeof employeeReviewSchema>;

export function normalizeReviewPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("8")) return `+7${digits.slice(1)}`;
  if (digits.length === 11 && digits.startsWith("7")) return `+${digits}`;
  if (digits.length === 10 && digits.startsWith("9")) return `+7${digits}`;
  return value.trim();
}
