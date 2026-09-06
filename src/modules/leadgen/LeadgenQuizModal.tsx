"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { Check, ChevronLeft, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition, type FormEvent } from "react";
import { createLeadAction, type CreateLeadActionResult } from "@/modules/leads";
import { trackEvent } from "@/modules/analytics";
import { PrivacyConsentText } from "@/components/forms/PrivacyConsentText";
import { kvartiryPromoContent, type LeadgenPromoContent, type LeadgenQuizStep } from "./kvartiry-promo-content";

type QuizAnswers = Record<string, string>;

type QuizErrors = {
  name?: string;
  phone?: string;
  consent?: string;
  submit?: string;
};

type LeadgenQuizOpenDetail = {
  source?: string;
  formType?: string;
};

const DEFAULT_SOURCE = "leadgen_yandex_direct";
const MIN_SUBMIT_DELAY_MS = 1800;

function validatePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  const normalized = digits.startsWith("8") ? `7${digits.slice(1)}` : digits;
  return normalized.length === 11 && normalized.startsWith("79");
}

function formatPhoneInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (!digits) return "";

  const normalized = digits.startsWith("8") ? `7${digits.slice(1)}` : digits;
  const hasCountry = normalized.startsWith("7");
  const body = hasCountry ? normalized.slice(1) : normalized;
  const parts = [body.slice(0, 3), body.slice(3, 6), body.slice(6, 8), body.slice(8, 10)].filter(Boolean);

  if (!hasCountry) return parts.join(" ");
  if (parts.length === 1) return `+7 (${parts[0]}`;
  if (parts.length === 2) return `+7 (${parts[0]}) ${parts[1]}`;
  if (parts.length === 3) return `+7 (${parts[0]}) ${parts[1]}-${parts[2]}`;
  return `+7 (${parts[0]}) ${parts[1]}-${parts[2]}-${parts[3]}`;
}

function normalizeDetailText(value: string | undefined, fallback: string) {
  const normalized = value?.replace(/\s+/g, " ").trim();
  return normalized || fallback;
}

function getQuizOpenDetail(event: Event): LeadgenQuizOpenDetail {
  if (!("detail" in event)) return {};
  const detail = (event as CustomEvent<LeadgenQuizOpenDetail>).detail;
  return detail && typeof detail === "object" ? detail : {};
}

function createEmptyAnswers(steps: readonly LeadgenQuizStep[]): QuizAnswers {
  return Object.fromEntries(steps.map((step) => [step.key, ""]));
}

type LeadgenQuizModalProps = {
  content?: LeadgenPromoContent;
  openEventName?: string;
  defaultSource?: string;
};

export function LeadgenQuizModal({
  content = kvartiryPromoContent,
  openEventName = "open-leadgen-quiz-modal",
  defaultSource = DEFAULT_SOURCE,
}: LeadgenQuizModalProps) {
  const quiz = content.quiz;
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>(() => createEmptyAnswers(quiz.steps));
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [openedAt, setOpenedAt] = useState(0);
  const [errors, setErrors] = useState<QuizErrors>({});
  const [result, setResult] = useState<CreateLeadActionResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const phoneRef = useRef<HTMLInputElement | null>(null);
  const lastActiveElementRef = useRef<HTMLElement | null>(null);

  const totalSteps = quiz.steps.length + 1;
  const progress = Math.round(((stepIndex + 1) / totalSteps) * 100);
  const isFinalStep = stepIndex === quiz.steps.length;
  const currentStep = quiz.steps[stepIndex];
  const selectedAnswer = currentStep ? answers[currentStep.key] : "";
  const defaultFormType = quiz.formType ?? `${content.formPrefix}_quiz`;
  const [activeFormType, setActiveFormType] = useState(defaultFormType);
  const [activeSource, setActiveSource] = useState(defaultSource);

  const answerSummary = useMemo(
    () => quiz.steps.map((step) => `${step.label}: ${answers[step.key] || "не указано"}`),
    [answers, quiz.steps],
  );

  const resetQuiz = useCallback(() => {
    setStepIndex(0);
    setAnswers(createEmptyAnswers(quiz.steps));
    setName("");
    setPhone("");
    setConsent(false);
    setWebsite("");
    setErrors({});
    setResult(null);
    setOpenedAt(Date.now());
  }, [quiz.steps]);

  function closeModal() {
    setIsOpen(false);
    setErrors({});
    setResult(null);
  }

  const openModal = useCallback((event: Event) => {
    const detail = getQuizOpenDetail(event);
    const nextFormType = normalizeDetailText(detail.formType, defaultFormType);
    const nextSource = normalizeDetailText(detail.source, defaultSource);

    lastActiveElementRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setActiveFormType(nextFormType);
    setActiveSource(nextSource);
    resetQuiz();
    setIsOpen(true);
    trackEvent("modal_open", { modal: "leadgen_quiz", form_type: nextFormType });
  }, [defaultFormType, defaultSource, resetQuiz]);

  useEffect(() => {
    window.addEventListener(openEventName, openModal);
    return () => window.removeEventListener(openEventName, openModal);
  }, [openEventName, openModal]);

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = "";
      lastActiveElementRef.current?.focus();
      return;
    }

    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => {
      if (isFinalStep) {
        phoneRef.current?.focus();
      } else {
        panelRef.current?.querySelector<HTMLButtonElement>("button[data-quiz-option]")?.focus();
      }
    }, 80);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (!focusable.length) return;

      const firstElement = focusable[0];
      const lastElement = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isFinalStep, isOpen]);

  function selectAnswer(step: LeadgenQuizStep, option: string) {
    setAnswers((current) => ({ ...current, [step.key]: option }));
    setErrors({});

    window.setTimeout(() => {
      setStepIndex((current) => Math.min(current + 1, quiz.steps.length));
    }, 260);
  }

  function goNext() {
    if (!currentStep) return;
    if (!answers[currentStep.key]) {
      setErrors({ submit: quiz.errors.noAnswer });
      return;
    }

    setErrors({});
    setStepIndex((current) => Math.min(current + 1, quiz.steps.length));
  }

  function goBack() {
    setErrors({});
    setStepIndex((current) => Math.max(current - 1, 0));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: QuizErrors = {};
    if (name.trim().length < 2) {
      nextErrors.name = quiz.errors.name;
    }
    if (!validatePhone(phone)) {
      nextErrors.phone = quiz.errors.phone;
    }
    if (!consent) {
      nextErrors.consent = quiz.errors.consent;
    }
    if (Date.now() - openedAt < MIN_SUBMIT_DELAY_MS) {
      nextErrors.submit = quiz.errors.delay;
    }

    setErrors(nextErrors);
    setResult(null);
    if (Object.keys(nextErrors).length > 0) return;

    startTransition(async () => {
      const response = await createLeadAction({
        sourcePage: pathname || content.route,
        source: activeSource,
        formType: activeFormType,
        name,
        phone,
        message: [
          quiz.messageIntro,
          ...answerSummary,
          "Канал связи: телефон",
        ].join("\n"),
        consent,
        website,
        formRenderedAt: openedAt,
      });

      setResult(response.ok ? null : response);
      trackEvent(response.ok ? "lead_submit_success" : "lead_submit_error", { form_type: activeFormType });
      if (response.ok) {
        closeModal();
      }
    });
  }

  if (!isOpen) return null;

  return (
    <div
      className="request-modal__overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeModal();
      }}
    >
      <div
        className={`request-modal__panel leadgen-quiz-modal ${isFinalStep ? "leadgen-quiz-modal--final" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="leadgen-quiz-title"
        aria-describedby="leadgen-quiz-description"
        ref={panelRef}
      >
        <button className="request-modal__close" type="button" aria-label="Закрыть квиз" onClick={closeModal}>
          <X className="size-5" aria-hidden />
        </button>
        <p className="sr-only" id="leadgen-quiz-description">{quiz.title}</p>

        <style>
          {`
            .leadgen-quiz-modal {
              background: #f6f2f2 !important;
            }

            .leadgen-quiz-modal .request-modal__header {
              background: linear-gradient(180deg, #fbf8f8 0%, #f4f1f1 100%) !important;
              padding-top: 34px;
              padding-bottom: 24px;
            }

            .leadgen-quiz-modal .leadgen-quiz-expert-card {
              border-color: rgba(138, 21, 21, 0.1) !important;
              background: rgba(255, 255, 255, 0.72) !important;
            }

            .leadgen-quiz-modal .leadgen-quiz-expert-text {
              color: #5f5656 !important;
              font-size: 12px !important;
              font-weight: 400 !important;
              line-height: 1.5 !important;
            }

            .leadgen-quiz-modal .leadgen-quiz-option {
              border-color: #E3E3E1;
            }

            .leadgen-quiz-modal .leadgen-quiz-option-dot {
              border-color: #d6c2c2;
            }

            .leadgen-quiz-modal .request-modal__form {
              gap: 14px;
              padding-bottom: 24px;
            }

            .leadgen-quiz-modal .request-modal__input {
              min-height: 56px;
              font-size: 15px;
            }

            .leadgen-quiz-modal--final .request-modal__header {
              padding-bottom: 12px;
            }

            .leadgen-quiz-modal--final .leadgen-quiz-progress {
              margin-top: 0;
            }

            @media (min-width: 768px) {
              .leadgen-quiz-modal {
                width: min(calc(100vw - 80px), 960px);
                max-height: min(640px, calc(100dvh - 56px));
                background: #f6f2f2;
              }

              .leadgen-quiz-modal__layout {
                display: grid;
                min-height: 600px;
                grid-template-columns: 260px minmax(0, 1fr);
              }

              .leadgen-quiz-modal .request-modal__header {
                align-content: start;
                justify-items: start;
                min-height: 600px;
                padding: 26px 26px 32px;
                background: linear-gradient(180deg, #fbf8f8 0%, #f4f1f1 100%);
                border-right: 0;
                text-align: left;
              }

              .leadgen-quiz-modal .request-modal__title {
                max-width: 600px;
                font-size: 14px;
                line-height: 1.3;
              }

              .leadgen-quiz-manager-photo {
                width: 54px;
                height: 54px;
              }

              .leadgen-quiz-expert-card {
                margin-top: 16px;
                border-radius: 8px;
                border: 1px solid rgba(138, 21, 21, 0.1);
                background: rgba(255, 255, 255, 0.68);
                padding: 12px;
                box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.62);
              }

              .leadgen-quiz-expert-note {
                margin-top: auto;
                max-width: 210px;
                color: #756d6d;
              }

              .leadgen-quiz-step,
              .leadgen-quiz-final-form {
                min-height: 600px;
                position: relative;
                overflow: hidden;
                background: #ffffff;
                border-radius: 6px;
              }

              .leadgen-quiz-modal .leadgen-quiz-progress {
                position: absolute;
                top: 0;
                right: 0;
                left: 0;
                height: 4px;
                border-radius: 0;
              }

              .leadgen-quiz-step {
                align-content: stretch;
                padding: 0;
              }

              .leadgen-quiz-final-form {
                display: grid;
                min-height: 600px;
                grid-template-rows: auto auto auto 1fr auto;
                align-content: stretch;
                gap: 18px;
                padding: 42px 44px 32px;
              }

              .leadgen-quiz-workspace {
                display: grid;
                min-height: 600px;
                grid-template-rows: auto 1fr auto;
                padding: 42px 44px 32px;
              }

              .leadgen-quiz-options {
                grid-template-columns: repeat(2, minmax(0, 1fr));
              }

              .leadgen-quiz-final-fields {
                grid-template-columns: 1fr;
              }

              .leadgen-quiz-final-actions {
                align-self: end;
              }

              .leadgen-quiz-final-back {
                width: 52px;
                min-width: 52px;
                padding-inline: 0;
              }

              .leadgen-quiz-final-submit {
                width: auto;
                min-width: 130px;
                padding-inline: 24px;
              }
            }

            @media (max-width: 640px) {
              .leadgen-quiz-modal .request-modal__header {
                gap: 8px;
                padding: 42px 22px 12px;
              }

              .leadgen-quiz-modal .leadgen-quiz-expert-card {
                margin-top: 4px;
              }

              .leadgen-quiz-modal .leadgen-quiz-expert-card p:nth-child(3),
              .leadgen-quiz-modal .leadgen-quiz-expert-note {
                display: none;
              }

              .leadgen-quiz-modal .request-modal__title {
                font-size: 24px;
                line-height: 1.12;
              }

              .leadgen-quiz-modal--final .request-modal__header {
                padding-bottom: 8px;
              }

              .leadgen-quiz-modal--final .request-modal__title {
                font-size: 23px;
              }

              .leadgen-quiz-modal .leadgen-quiz-final-title {
                font-size: 20px;
              }

              .leadgen-quiz-modal .leadgen-quiz-final-text {
                font-size: 13px;
                line-height: 1.62;
              }

              .leadgen-quiz-modal .request-modal__form {
                gap: 12px;
                padding: 0 22px 22px;
              }

              .leadgen-quiz-modal .request-modal__input {
                min-height: 52px;
                font-size: 16px;
              }

              .leadgen-quiz-final-actions > div {
                width: 100%;
              }

              .leadgen-quiz-final-submit {
                flex: 1;
                width: auto;
                min-height: 52px;
                font-size: 15px;
              }
            }
          `}
        </style>

        {result?.ok ? (
          <div className="request-modal__success" role="status">
            <span className="request-modal__success-icon" aria-hidden>
              <Check className="size-7" />
            </span>
            <h2 className="request-modal__title" id="leadgen-quiz-title">
              Заявка отправлена
            </h2>
            <p className="request-modal__subtitle">{quiz.successText}</p>
            <button className="site-primary-action request-modal__submit" type="button" onClick={closeModal}>
              Хорошо
            </button>
          </div>
        ) : (
            <div className="leadgen-quiz-modal__layout">
            <div
              className="request-modal__header pb-0"
              style={{ background: "linear-gradient(180deg, #fbf8f8 0%, #f4f1f1 100%)" }}
            >
              <div className="leadgen-quiz-manager-photo relative size-14 overflow-hidden rounded-[6px] bg-white shadow-[0_10px_24px_rgba(23,22,26,0.1)]">
                <Image
                  src={content.manager.photo}
                  alt={`${content.manager.name}, ${content.manager.role}`}
                  fill
                  sizes="64px"
                  priority
                  unoptimized
                  className={content.manager.photoFit === "contain" ? "object-contain p-1" : "object-cover object-top"}
                />
              </div>
              <p className="mt-4 text-[12px] font-semibold leading-[1.4] text-[#8A1515]">{quiz.title}</p>
              <div
                className="leadgen-quiz-expert-card"
                style={{
                  borderColor: "rgba(138, 21, 21, 0.1)",
                  background: "rgba(255, 255, 255, 0.72)",
                }}
              >
                <p className="text-[13px] font-semibold leading-tight text-[#17161a]">{content.manager.name}</p>
                <p className="mt-1 text-[11px] font-normal leading-4 text-[#8A1515]">{content.manager.role}</p>
                <p className="leadgen-quiz-expert-text mt-3 text-[12px] font-normal leading-[1.5] text-[#5f5656]">{quiz.expertText}</p>
              </div>
              <p className="leadgen-quiz-expert-note text-[11px] font-normal leading-[1.45] text-[#756d6d]">{quiz.expertNote}</p>
            </div>

            {!isFinalStep && currentStep ? (
              <div className="leadgen-quiz-step grid gap-5 px-7 pb-7 sm:px-8">
                <div className="leadgen-quiz-workspace">
                  <div>
                    <div className="leadgen-quiz-progress h-1.5 w-full overflow-hidden rounded-full bg-[#f1e7e7]" aria-label={`Заполнено ${progress}%`}>
                      <div className="h-full rounded-full bg-[#8A1515] transition-all duration-300" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="mt-4 text-[22px] font-extrabold leading-tight text-[#17161a] sm:text-[25px]" id="leadgen-quiz-title">
                      {currentStep.question}
                    </p>
                    <p className="mt-2 text-sm font-normal leading-6 text-[#777]">
                      {quiz.questionHint}
                    </p>
                  </div>

                  <div className="leadgen-quiz-options grid gap-4 self-start pt-6">
                    {currentStep.options.map((option) => {
                      const isSelected = selectedAnswer === option;
                      return (
                        <button
                          key={option}
                          type="button"
                          data-quiz-option
                          className={`leadgen-quiz-option grid min-h-[58px] grid-cols-[24px_1fr] items-center gap-3 rounded-[6px] border px-4 text-left text-sm font-semibold transition ${
                            isSelected
                              ? "border-[#8A1515] bg-[#fbf7f7] text-[#17161a] shadow-[0_12px_28px_rgba(138,21,21,0.1)]"
                              : "border-[#E3E3E1] bg-white text-[#4a4a4a] hover:border-[#d6c2c2] hover:bg-[#fbf7f7]"
                          }`}
                          style={{
                            borderColor: isSelected ? "#8A1515" : "#E3E3E1",
                            background: isSelected ? "#fbf7f7" : "#ffffff",
                          }}
                          aria-pressed={isSelected}
                          onClick={() => selectAnswer(currentStep, option)}
                        >
                          <span
                            className={`leadgen-quiz-option-dot grid size-5 place-items-center rounded-full border ${isSelected ? "border-[#8A1515] bg-[#8A1515] text-white" : "border-[#d6c2c2] text-transparent"}`}
                            style={{
                              borderColor: isSelected ? "#8A1515" : "#d6c2c2",
                              background: isSelected ? "#8A1515" : "transparent",
                            }}
                          >
                            <Check className="size-3.5" aria-hidden />
                          </span>
                          <span>{option}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div>
                    {errors.submit ? <p className="request-modal__error mb-3">{errors.submit}</p> : null}

                    <div className="flex items-center justify-between gap-3 pt-1">
                      <p className="text-xs font-semibold text-[#aaa]">Шаг: {stepIndex + 1}/{totalSteps}</p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="inline-flex min-h-12 w-[52px] items-center justify-center rounded-[6px] border border-[#E3E3E1] bg-white text-[#8A1515] transition hover:border-[#d6c2c2] hover:bg-[#fbf7f7] disabled:cursor-not-allowed disabled:opacity-45"
                          aria-label="Вернуться к предыдущему вопросу"
                          onClick={goBack}
                          disabled={stepIndex === 0}
                        >
                          <ChevronLeft className="size-5" aria-hidden />
                        </button>
                        <button
                          type="button"
                          className="inline-flex min-h-12 min-w-[130px] items-center justify-center rounded-[6px] bg-[#8A1515] px-5 text-sm font-bold text-white transition hover:bg-[#630E0E] disabled:cursor-not-allowed disabled:opacity-45"
                          onClick={goNext}
                        >
                          Далее
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <form className="request-modal__form leadgen-quiz-final-form pt-0" onSubmit={handleSubmit} data-analytics-form-type={activeFormType} noValidate>
                <div>
                  <div className="leadgen-quiz-progress h-1.5 w-full overflow-hidden rounded-full bg-[#f1e7e7]" aria-label={`Заполнено ${progress}%`}>
                    <div className="h-full rounded-full bg-[#8A1515] transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                  <h3 className="leadgen-quiz-final-title mt-4 text-[25px] font-extrabold leading-tight text-[#17161a]" id="leadgen-quiz-title">{quiz.finalTitle}</h3>
                  <p className="leadgen-quiz-final-text mt-4 max-w-[600px] text-sm font-normal leading-[1.55] text-[#5f5a5a]">{quiz.finalText}</p>
                </div>

                <label className="request-modal__honeypot">
                  Сайт
                  <input
                    tabIndex={-1}
                    autoComplete="off"
                    value={website}
                    onChange={(event) => setWebsite(event.target.value)}
                  />
                </label>

                <div className="leadgen-quiz-final-fields grid gap-4">
                  <div className="request-modal__field">
                    <label className="request-modal__label" htmlFor="leadgen-quiz-name">
                      {quiz.fields.nameLabel}
                    </label>
                    <input
                      id="leadgen-quiz-name"
                      className="request-modal__input"
                      autoComplete="name"
                      value={name}
                      required
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? "leadgen-quiz-name-error" : undefined}
                      onChange={(event) => {
                        setName(event.target.value);
                        if (errors.name) setErrors((current) => ({ ...current, name: undefined }));
                      }}
                      placeholder={quiz.fields.namePlaceholder}
                    />
                    {errors.name ? <p className="request-modal__error" id="leadgen-quiz-name-error">{errors.name}</p> : null}
                  </div>

                  <div className="request-modal__field">
                    <label className="request-modal__label" htmlFor="leadgen-quiz-phone">
                      {quiz.fields.phoneLabel}
                    </label>
                    <input
                      id="leadgen-quiz-phone"
                      ref={phoneRef}
                      className="request-modal__input"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={phone}
                      aria-invalid={Boolean(errors.phone)}
                      aria-describedby={errors.phone ? "leadgen-quiz-phone-error" : undefined}
                      onChange={(event) => {
                        setPhone(formatPhoneInput(event.target.value));
                        if (errors.phone) setErrors((current) => ({ ...current, phone: undefined }));
                      }}
                      onFocus={() => {
                        if (!phone) setPhone("+7 (9");
                      }}
                      placeholder={quiz.fields.phonePlaceholder}
                    />
                    {errors.phone ? <p className="request-modal__error" id="leadgen-quiz-phone-error">{errors.phone}</p> : null}
                  </div>
                </div>

                <label className="request-modal__consent">
                  <input
                    className="request-modal__checkbox"
                    type="checkbox"
                    checked={consent}
                    aria-invalid={Boolean(errors.consent)}
                    aria-describedby={errors.consent ? "leadgen-quiz-consent-error" : undefined}
                    onChange={(event) => {
                      setConsent(event.target.checked);
                      if (errors.consent) setErrors((current) => ({ ...current, consent: undefined }));
                    }}
                  />
                  <span><PrivacyConsentText className="request-modal__link" /></span>
                </label>
                {errors.consent ? <p className="request-modal__error" id="leadgen-quiz-consent-error">{errors.consent}</p> : null}
                {errors.submit ? <p className="request-modal__submit-error" role="alert">{errors.submit}</p> : null}
                {result && !result.ok ? <p className="request-modal__submit-error" role="alert">{result.message}</p> : null}

                <div className="leadgen-quiz-final-actions flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs font-semibold text-[#aaa]">Шаг: {totalSteps}/{totalSteps}</p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="leadgen-quiz-final-back inline-flex min-h-12 items-center justify-center rounded-[6px] border border-[#E3E3E1] bg-white text-[#8A1515] transition hover:border-[#d6c2c2] hover:bg-[#fbf7f7]"
                      aria-label="Вернуться к предыдущему вопросу"
                      onClick={goBack}
                    >
                      <ChevronLeft className="size-5" aria-hidden />
                    </button>
                    <button
                      className="leadgen-quiz-final-submit inline-flex min-h-12 items-center justify-center rounded-[6px] bg-[#8A1515] px-6 text-sm font-bold text-white shadow-[0_10px_22px_rgba(138,21,21,0.18)] transition hover:bg-[#630E0E] disabled:cursor-not-allowed disabled:opacity-60"
                      type="submit"
                      disabled={isPending}
                    >
                      {isPending ? quiz.loadingLabel : quiz.submitLabel}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
