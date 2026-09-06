"use client";

import type { FormEvent, KeyboardEvent, ReactNode } from "react";
import { useCallback, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";

type Props = {
  action: string;
  className?: string;
  children: ReactNode;
};

export function CatalogAutoSubmitForm({ action, className, children }: Props) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [, startTransition] = useTransition();

  const submit = useCallback((delay = 0) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    const run = () => {
      const form = formRef.current;
      if (!form) return;

      const params = new URLSearchParams();
      const formData = new FormData(form);

      formData.forEach((value, key) => {
        const normalized = String(value).trim();
        if (!normalized || key === "page") return;
        params.set(key, normalized);
      });

      const queryString = params.toString();
      startTransition(() => {
        router.push(queryString ? `${action}?${queryString}` : action, { scroll: false });
      });
    };

    if (delay > 0) {
      debounceRef.current = setTimeout(run, delay);
      return;
    }

    run();
  }, [action, router]);

  function handleInput(event: FormEvent<HTMLFormElement>) {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    if (target.type === "text" || target.type === "search" || target.type === "number") {
      submit(500);
    }
  }

  function handleChange(event: FormEvent<HTMLFormElement>) {
    const target = event.target;
    if (target instanceof HTMLSelectElement || (target instanceof HTMLInputElement && target.type === "checkbox")) {
      submit();
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLFormElement>) {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    if (event.key === "Enter") {
      event.preventDefault();
      submit();
    }
  }

  return (
    <form
      ref={formRef}
      action={action}
      className={className}
      onInput={handleInput}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
    >
      {children}
    </form>
  );
}
