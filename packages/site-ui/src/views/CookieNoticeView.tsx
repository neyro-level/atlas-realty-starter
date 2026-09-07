import { Cookie } from "lucide-react";
import type { SiteLinkRenderer } from "../lib/adapters";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";

type CookieNoticeViewProps = {
  onAccept: () => void;
  linkRenderer: SiteLinkRenderer;
};

export function CookieNoticeView({ onAccept, linkRenderer: LinkRenderer }: CookieNoticeViewProps) {
  return (
    <Card
      className="fixed bottom-3 left-1/2 z-[9999] w-[calc(100%-1.5rem)] -translate-x-1/2 rounded-[10px] border border-[var(--cookie-notice-border-01)] bg-white p-3 shadow-[var(--cookie-notice-shadow-01)] sm:bottom-4 sm:w-[calc(100%-2rem)] sm:px-5 sm:py-3 lg:w-[70%] lg:max-w-[868px]"
      role="region"
      aria-label="Уведомление об использовании cookie"
      aria-describedby="cookie-notice-description"
    >
      <div className="grid gap-2.5 sm:grid-cols-[minmax(0,1fr)_180px] sm:items-center sm:gap-5">
        <div className="flex min-w-0 items-start gap-2.5 sm:items-center sm:gap-3">
          <Cookie className="mt-0.5 size-4 shrink-0 fill-[var(--cookie-notice-icon-01)] text-[var(--cookie-notice-content-01)] sm:mt-0 sm:size-6" aria-hidden />
          <p id="cookie-notice-description" className="text-pretty text-[11px] font-medium leading-4 text-[var(--cookie-notice-content-02)] sm:text-sm sm:leading-6">
            <span className="sm:hidden">Используем cookie для работы сайта и аналитики. </span>
            <span className="hidden sm:inline">Мы, как и вы, ценим комфорт и безопасность. Чтобы сайт был удобным и помогал быстрее находить подходящую недвижимость, </span>
            <LinkRenderer href="/politika-cookie" className="font-semibold text-[var(--cookie-notice-content-03)] transition hover:text-[var(--cookie-notice-content-04)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]">
              <span className="sm:hidden">Подробнее</span>
              <span className="hidden sm:inline">мы используем файлы cookie</span>
            </LinkRenderer>
            .
          </p>
        </div>
        <Button
          type="button"
          onClick={onAccept}
          className="min-h-11 w-full rounded-[10px] bg-[var(--accent)] px-3 text-xs font-bold text-white hover:bg-[var(--cookie-notice-surface-01)] sm:min-h-12 sm:px-6 sm:text-sm"
        >
          Принять
        </Button>
      </div>
    </Card>
  );
}
