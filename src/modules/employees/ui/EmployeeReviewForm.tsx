"use client";

import Link from "next/link";
import { Button, EmployeeReviewDialogView } from "@starter/site-ui";
import { useState, useTransition, type FormEvent } from "react";
import { trackEvent } from "@/modules/analytics";
import { PrivacyConsentText } from "@/components/forms/PrivacyConsentText";
import { submitEmployeeReviewAction, type EmployeeReviewActionResult } from "../review-actions";

export function EmployeeReviewForm({ agentId, fullName }: { agentId: string; fullName: string }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [phone, setPhone] = useState("");
  const [startedAt, setStartedAt] = useState(0);
  const [result, setResult] = useState<EmployeeReviewActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  function show() {
    setStartedAt(Date.now());
    setPhone("");
    setResult(null);
    setOpen(true);
    trackEvent("employee_review_open", { agent: agentId });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(event.currentTarget);
    startTransition(async () => {
      let response: EmployeeReviewActionResult;
      try {
        response = await submitEmployeeReviewAction({
          agentId,
          authorName: String(form.get("authorName") ?? ""),
          authorPhone: String(form.get("authorPhone") ?? ""),
          rating,
          text: String(form.get("text") ?? ""),
          consent: form.get("consent") === "on",
          website: String(form.get("website") ?? ""),
          startedAt,
        });
      } catch {
        response = {
          ok: false,
          message: "Не удалось отправить отзыв. Проверьте подключение и попробуйте ещё раз.",
        };
      }
      setResult(response);
      trackEvent(response.ok ? "employee_review_submit_success" : "employee_review_submit_error", { agent: agentId });
      if (response.ok) {
        formElement.reset();
        setPhone("");
      }
    });
  }

  return (
    <>
      <Button type="button" onClick={show} variant="outline" className="inline-flex min-h-11 rounded-lg border-[var(--palette-dcdcd8)] bg-white px-5 text-sm font-semibold text-[var(--text-primary)] hover:border-[var(--accent)] hover:text-[var(--accent)]">
        Оставить отзыв
      </Button>
      <EmployeeReviewDialogView
        open={open}
        fullName={fullName}
        rating={rating}
        phone={phone}
        pending={pending}
        result={result}
        consentContent={<><PrivacyConsentText /> и принимаю <Link href="/pravila-razmeshcheniya-otzyvov" className="text-[var(--accent)] underline">правила размещения отзывов</Link>.</>}
        onOpenChange={setOpen}
        onSubmit={submit}
        onRatingChange={setRating}
        onPhoneChange={(value) => setPhone(formatRuMobilePhone(value))}
        onPhoneFocus={() => {
          if (!phone) setPhone("+7 (9");
        }}
      />
    </>
  );
}

function formatRuMobilePhone(value: string) {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("7") || digits.startsWith("8")) digits = digits.slice(1);
  if (!digits) return "";
  if (!digits.startsWith("9")) digits = `9${digits}`;
  digits = digits.slice(0, 10);

  let formatted = `+7 (${digits.slice(0, 3)}`;
  if (digits.length >= 3) formatted += ")";
  if (digits.length > 3) formatted += ` ${digits.slice(3, 6)}`;
  if (digits.length > 6) formatted += `-${digits.slice(6, 8)}`;
  if (digits.length > 8) formatted += `-${digits.slice(8, 10)}`;
  return formatted;
}
