"use server";

import { employeeReviewSchema, type EmployeeReviewInput } from "./review-schema";

export type EmployeeReviewActionResult = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string>;
};

export async function submitEmployeeReviewAction(input: EmployeeReviewInput): Promise<EmployeeReviewActionResult> {
  const parsed = employeeReviewSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Проверьте заполнение формы.",
      fieldErrors: Object.fromEntries(parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message])),
    };
  }

  return { ok: false, message: "Сервис отзывов временно недоступен." };
}
