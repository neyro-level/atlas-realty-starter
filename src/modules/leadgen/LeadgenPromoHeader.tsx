"use client";

import { Button } from "@starter/site-ui/primitives";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Menu, Phone, X } from "lucide-react";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/layout/BrandMark";
import { LeadgenRequestButton } from "./LeadgenRequestButton";
import { kvartiryPromoContent, type LeadgenPromoContent } from "./kvartiry-promo-content";
import { tenant } from "@/project/tenant.config";

const mobileMenuText =
  "Поможем выбрать выгодный вариант из нашей закрытой базы эксклюзивных предложений. Все варианты проверены юристами. Оставьте свои данные и мы пришлем вам подборку бесплатно.";

type LeadgenPromoHeaderProps = {
  content?: LeadgenPromoContent;
};

export function LeadgenPromoHeader({ content = kvartiryPromoContent }: LeadgenPromoHeaderProps) {
  const [docked, setDocked] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRequestSubtitle =
    content.headerRequest?.subtitle ??
    "Оставьте контакты. Специалист перезвонит и поможет с подбором квартиры из закрытой базы.";
  const headerRequestMessage =
    content.headerRequest?.message ??
    "Клиент просит звонок по подбору квартир из закрытой базы.";

  useEffect(() => {
    const onScroll = () => setDocked(window.scrollY > 116);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header
      id="leadgen-header"
      data-state={docked ? "dock" : "top"}
      data-overlay={menuOpen ? "true" : "false"}
      className={`fixed z-[90] flex h-17 items-center border transition-all duration-300 lg:h-19.5 ${
        docked
          ? "left-3 right-3 top-3 rounded-emphasis border-[var(--leadgen-promo-header-border-primary)] bg-white shadow-[var(--leadgen-promo-header-shadow-primary)] lg:left-5 lg:right-5 lg:top-4"
          : "left-0 right-0 top-0 rounded-none border-transparent border-b-[var(--leadgen-promo-header-visual-primary)] bg-white shadow-[var(--leadgen-promo-header-shadow-secondary)]"
      } ${menuOpen ? "!border-transparent !bg-white !shadow-none" : ""}`}
    >
      <div className={`mx-auto flex h-full w-full max-w-290 items-center gap-4 px-5 transition-all duration-300 sm:px-8 ${docked ? "lg:px-6" : ""}`}>
        <Link
          href={content.route}
          className="inline-flex shrink-0 items-center text-[var(--text-primary)] no-underline"
          aria-label="АТЛАС — рекламный лендинг"
          onClick={() => setMenuOpen(false)}
        >
          <BrandMark showSlogan={false} />
        </Link>

        <div className="hidden min-h-10 items-center gap-2 text-sm font-medium text-[var(--leadgen-promo-header-content-primary)] sm:inline-flex">
          <MapPin className="size-4 text-[var(--accent)]" aria-hidden />
          <span>{tenant.cityRu}</span>
        </div>

        <div className="hidden min-h-9 items-center justify-center gap-1.5 rounded-callout bg-[var(--leadgen-promo-header-surface-primary)] px-3.5 text-center text-[var(--leadgen-promo-header-content-secondary)] min-[1120px]:inline-flex">
          {content.headerTrust.value ? (
            <span className="text-lead font-normal leading-none text-[var(--accent)]">{content.headerTrust.value}</span>
          ) : null}
          <span className="text-support font-normal leading-tight text-[var(--leadgen-promo-header-content-tertiary)]">{content.headerTrust.label}</span>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-4 lg:gap-6">
          {content.phone && content.phoneHref ? (
            <a
              href={content.phoneHref}
              data-analytics-context="leadgen_header"
              data-analytics-item={content.route}
              className="hidden min-h-11 items-center text-right transition hover:text-[var(--accent)] md:inline-flex"
            >
              <span className="grid leading-tight">
                <span className="text-sm font-semibold text-[var(--text-primary)]">{content.phone}</span>
                {content.hours ? <span className="text-overline font-medium text-[var(--leadgen-promo-header-content-subtle)]">{content.hours}</span> : null}
              </span>
            </a>
          ) : null}

          <LeadgenRequestButton
            className="hidden min-h-11 items-center rounded-md bg-[var(--accent)] px-5 text-sm font-bold text-white shadow-[var(--leadgen-promo-header-shadow-tertiary)] transition hover:-translate-y-0.5 hover:bg-[var(--accent-hover)] hover:shadow-[var(--leadgen-promo-header-shadow-subtle)] sm:inline-flex"
            mode="request"
            title="Заказать звонок"
            subtitle={headerRequestSubtitle}
            submitLabel="Заказать звонок"
            formType={`${content.formPrefix}_header_callback`}
            source="leadgen_yandex_direct:header_callback"
            message={headerRequestMessage}
          >
            Заказать звонок
          </LeadgenRequestButton>

          <Button variant="plain"
            type="button"
            aria-label={menuOpen ? "Закрыть меню лендинга" : "Открыть меню лендинга"}
            aria-expanded={menuOpen}
            aria-controls="leadgen-mobile-menu"
            className="inline-flex items-center justify-center rounded-md border border-[var(--leadgen-promo-header-border-primary)] bg-white text-[var(--text-primary)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] lg:hidden"
            onClick={() => setMenuOpen((current) => !current)}
          >
            {menuOpen ? <X className="" aria-hidden /> : <Menu className="" aria-hidden />}
          </Button>
        </div>
      </div>

      <div
        id="leadgen-mobile-menu"
        className={`absolute left-3 right-3 top-[calc(100%+10px)] rounded-emphasis border border-[var(--leadgen-promo-header-border-primary)] bg-white p-4 shadow-[var(--leadgen-promo-header-shadow-muted)] transition lg:hidden ${
          menuOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="relative size-12 shrink-0 overflow-hidden rounded-sm bg-[var(--leadgen-promo-header-surface-secondary)]">
            <Image
              src={content.manager.photo}
              alt={`${content.manager.name}, ${content.manager.role}`}
              fill
              sizes="48px"
              unoptimized
              className="object-cover object-top"
            />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-tight text-[var(--text-primary)]">{content.manager.name}</p>
            <p className="mt-1 text-caption font-medium leading-4 text-[var(--accent)]">{content.manager.role}</p>
          </div>
        </div>

        <p className="mt-3.5 text-label font-normal leading-[1.58] text-[var(--leadgen-promo-header-content-primary)]">
          {content.mobileMenuText ?? mobileMenuText}
        </p>

        <div className="mt-3.5 grid gap-2">
          <LeadgenRequestButton
            className="inline-flex min-h-12 items-center justify-center rounded-md bg-[var(--accent)] px-5 text-body-compact font-semibold text-white transition hover:bg-[var(--accent-hover)]"
            mode="quiz"
            title={content.hero.modalTitle}
            subtitle={`Оставьте контакты. ${content.manager.name} уточнит параметры и отправит подборку бесплатно.`}
            submitLabel="Получить подборку"
            formType={`${content.formPrefix}_mobile_menu_quiz`}
            onOpen={() => setMenuOpen(false)}
          >
            Получить подборку
          </LeadgenRequestButton>
          {content.phone && content.phoneHref ? (
            <a
              href={content.phoneHref}
              data-analytics-context="leadgen_mobile_menu"
              data-analytics-item={content.route}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-white px-5 text-body-compact font-semibold text-[var(--text-primary)] transition hover:border-[var(--leadgen-promo-header-border-secondary)] hover:bg-[var(--leadgen-promo-header-surface-tertiary)] hover:text-[var(--accent)]"
            >
              <Phone className="size-4 text-[var(--accent)]" aria-hidden />
              Позвонить
            </a>
          ) : null}
        </div>
      </div>
    </header>
  );
}
