import { Loader2, Send, X } from "lucide-react";
import type { FormEvent, ReactNode, RefObject } from "react";

type PropertyChatViewProps = {
  message: string;
  lockMessage: boolean;
  phone: string;
  consent: boolean;
  website: string;
  showInlineHint: boolean;
  isPending: boolean;
  resultMessage?: string | null;
  errors: {
    message?: string;
    phone?: string;
    consent?: string;
  };
  consentContent: ReactNode;
  textareaRef?: RefObject<HTMLTextAreaElement | null>;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onMessageChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onConsentChange: (checked: boolean) => void;
  onWebsiteChange: (value: string) => void;
};

export function PropertyChatView({
  message,
  lockMessage,
  phone,
  consent,
  website,
  showInlineHint,
  isPending,
  resultMessage,
  errors,
  consentContent,
  textareaRef,
  onClose,
  onSubmit,
  onMessageChange,
  onPhoneChange,
  onConsentChange,
  onWebsiteChange,
}: PropertyChatViewProps) {
  return (
    <div
      className="fixed inset-0 z-[70] flex items-end bg-[var(--surface-dark-strong)]/56 px-4 py-4 backdrop-blur-sm sm:items-center sm:justify-center"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="property-chat-title"
        className="w-full max-w-[520px] rounded-lg bg-white px-5 pb-8 pt-5 shadow-[0_28px_90px_rgba(0,0,0,0.22)] sm:px-6 sm:pb-10 sm:pt-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Сообщение по объекту</p>
            <h2 id="property-chat-title" className="mt-3 max-w-[400px] text-[20px] font-semibold leading-[1.28] text-[var(--text-primary)] sm:text-[22px]">
              Напишите сообщение ответственному специалисту
            </h2>
          </div>
          <button
            type="button"
            aria-label="Закрыть чат"
            onClick={onClose}
            className="flex size-10 shrink-0 items-center justify-center rounded-md border border-[var(--border)] text-[var(--text-primary)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <form className="mt-7 grid gap-4 pb-2" onSubmit={onSubmit} data-analytics-form-type="property_chat" noValidate>
          <label className="sr-only" htmlFor="property-chat-website">
            Сайт
          </label>
          <input
            id="property-chat-website"
            name="website"
            type="text"
            value={website}
            onChange={(event) => onWebsiteChange(event.target.value)}
            tabIndex={-1}
            autoComplete="off"
            className="pointer-events-none absolute left-[-9999px] top-auto h-px w-px opacity-0"
            aria-hidden="true"
          />

          {lockMessage ? (
            <div className="grid gap-2.5 text-[13px] font-semibold text-[var(--text-primary)]">
              <span>Сообщение</span>
              <div className="rounded-md border border-[var(--border)] bg-[var(--surface-card-soft)] px-3 py-3 text-[13px] font-normal leading-6 whitespace-pre-wrap text-[var(--text-primary)]">
                {message}
              </div>
              <p className="text-[11px] font-medium leading-5 text-[var(--text-muted)]">
                Сообщение уже подготовлено. Оставьте телефон, и специалист свяжется с вами по этому вопросу.
              </p>
            </div>
          ) : (
            <label className="grid gap-2.5 text-[13px] font-semibold text-[var(--text-primary)]">
              Сообщение
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  autoFocus
                  value={message}
                  onChange={(event) => onMessageChange(event.target.value)}
                  rows={4}
                  className="min-h-32 w-full rounded-md border border-[var(--border)] bg-white px-3 py-3 text-[13px] font-normal leading-6 outline-none transition focus:border-[var(--accent)]"
                  placeholder="Здравствуйте, есть вопросы по этому объекту."
                />
              </div>
              {showInlineHint ? <span className="text-[12px] font-normal leading-5 text-[var(--text-muted)]">Здесь можно написать свое сообщение.</span> : null}
              {errors.message ? <span className="text-xs text-[var(--error)]">{errors.message}</span> : null}
            </label>
          )}

          <label className="grid gap-2.5 text-[13px] font-semibold text-[var(--text-primary)]">
            Телефон для связи
            <input
              value={phone}
              onChange={(event) => onPhoneChange(event.target.value)}
              className="min-h-11 rounded-md border border-[var(--border)] bg-white px-3 text-[13px] outline-none transition focus:border-[var(--accent)]"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              placeholder="+7 (9__) ___-__-__"
              maxLength={18}
            />
            {errors.phone ? <span className="text-xs text-[var(--error)]">{errors.phone}</span> : null}
          </label>

          <label className="mt-1 flex gap-3 text-[11px] leading-5 text-[var(--text-secondary)]">
            <input type="checkbox" checked={consent} onChange={(event) => onConsentChange(event.target.checked)} className="mt-1 size-4 shrink-0 accent-[var(--accent)]" />
            <span>{consentContent}</span>
          </label>
          {errors.consent ? <span className="text-xs font-semibold text-[var(--error)]">{errors.consent}</span> : null}

          {resultMessage ? <div className="rounded-md border border-[var(--palette-f2c6c6)] bg-[var(--palette-fff7f7)] px-3 py-2 text-sm font-semibold text-[var(--error)]">{resultMessage}</div> : null}

          <button
            type="submit"
            disabled={isPending}
            className="mt-2 inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-5 text-sm font-bold text-white transition hover:bg-[var(--accent-hover)] disabled:cursor-wait disabled:opacity-70"
          >
            {isPending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Send className="size-4" aria-hidden />}
            {isPending ? "Отправляем" : "Отправить сообщение"}
          </button>
        </form>
      </section>
    </div>
  );
}
