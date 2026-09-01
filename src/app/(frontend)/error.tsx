"use client";

import { RouteStatusState } from "@/components/layout/RouteStatusState";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <RouteStatusState
      title="Не удалось загрузить страницу"
      description="Попробуйте обновить страницу, если ошибка повторится, вернитесь на главную."
      primaryHref="/"
      primaryLabel="На главную"
      onRetry={() => {
        // Soft boundary reset alone often looks like "nothing happened" if the
        // underlying render error is still present. CTA promises a page refresh.
        reset();
        window.location.reload();
      }}
      onRetryLabel="Обновить страницу"
    />
  );
}
