"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Menu, Phone, X } from "lucide-react";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/layout/BrandMark";
import { LeadgenRequestButton } from "./LeadgenRequestButton";
import { kvartiryPromoContent, type LeadgenPromoContent } from "./kvartiry-promo-content";

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
      className={`fixed z-[90] flex h-[68px] items-center border transition-all duration-300 lg:h-[78px] ${
        docked
          ? "left-3 right-3 top-3 rounded-[14px] border-[#e5e5e5] bg-white shadow-[0_18px_58px_rgba(0,0,0,0.13)] lg:left-5 lg:right-5 lg:top-4"
          : "left-0 right-0 top-0 rounded-none border-transparent border-b-[#eeeeee] bg-white shadow-[0_1px_0_rgba(0,0,0,0.04)]"
      } ${menuOpen ? "!border-transparent !bg-white !shadow-none" : ""}`}
    >
      <div className={`mx-auto flex h-full w-full max-w-[1160px] items-center gap-4 px-5 transition-all duration-300 sm:px-8 ${docked ? "lg:px-6" : ""}`}>
        <Link
          href={content.route}
          className="inline-flex shrink-0 items-center text-[#17161a] no-underline"
          aria-label="АТЛАС — рекламный лендинг"
          onClick={() => setMenuOpen(false)}
        >
          <BrandMark showSlogan={false} />
        </Link>

        <div className="hidden min-h-10 items-center gap-2 text-sm font-medium text-[#5f5b5d] sm:inline-flex">
          <MapPin className="size-4 text-[#8A1515]" aria-hidden />
          <span>Краснодар</span>
        </div>

        <div className="hidden min-h-9 items-center justify-center gap-1.5 rounded-[9px] bg-[#F4F4F2] px-3.5 text-center text-[#4f4a4d] min-[1120px]:inline-flex">
          {content.headerTrust.value ? (
            <span className="text-[18px] font-normal leading-none text-[#8A1515]">{content.headerTrust.value}</span>
          ) : null}
          <span className="text-[13px] font-normal leading-tight text-[#4b474a]">{content.headerTrust.label}</span>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-4 lg:gap-6">
          {content.phone && content.phoneHref ? (
            <a
              href={content.phoneHref}
              data-analytics-context="leadgen_header"
              data-analytics-item={content.route}
              className="hidden min-h-11 items-center text-right transition hover:text-[#8A1515] md:inline-flex"
            >
              <span className="grid leading-tight">
                <span className="text-sm font-semibold text-[#17161a]">{content.phone}</span>
                {content.hours ? <span className="text-[10px] font-medium text-[#777]">{content.hours}</span> : null}
              </span>
            </a>
          ) : null}

          <LeadgenRequestButton
            className="hidden min-h-11 items-center rounded-[10px] bg-[#8A1515] px-5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(138,21,21,0.22)] transition hover:-translate-y-0.5 hover:bg-[#630E0E] hover:shadow-[0_16px_34px_rgba(138,21,21,0.28)] sm:inline-flex"
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

          <button
            type="button"
            aria-label={menuOpen ? "Закрыть меню лендинга" : "Открыть меню лендинга"}
            aria-expanded={menuOpen}
            aria-controls="leadgen-mobile-menu"
            className="inline-flex size-11 items-center justify-center rounded-[10px] border border-[#e5e5e5] bg-white text-[#17161a] transition hover:border-[#8A1515] hover:text-[#8A1515] lg:hidden"
            onClick={() => setMenuOpen((current) => !current)}
          >
            {menuOpen ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
          </button>
        </div>
      </div>

      <div
        id="leadgen-mobile-menu"
        className={`absolute left-3 right-3 top-[calc(100%+10px)] rounded-[14px] border border-[#e5e5e5] bg-white p-4 shadow-[0_22px_70px_rgba(0,0,0,0.16)] transition lg:hidden ${
          menuOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="relative size-12 shrink-0 overflow-hidden rounded-[8px] bg-[#f4f1f1]">
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
            <p className="text-sm font-semibold leading-tight text-[#17161a]">{content.manager.name}</p>
            <p className="mt-1 text-[11px] font-medium leading-4 text-[#8A1515]">{content.manager.role}</p>
          </div>
        </div>

        <p className="mt-3.5 text-[12px] font-normal leading-[1.58] text-[#5f5b5d]">
          {content.mobileMenuText ?? mobileMenuText}
        </p>

        <div className="mt-3.5 grid gap-2">
          <LeadgenRequestButton
            className="inline-flex min-h-12 items-center justify-center rounded-[10px] bg-[#8A1515] px-5 text-[15px] font-semibold text-white transition hover:bg-[#630E0E]"
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
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[10px] border border-[#E3E3E1] bg-white px-5 text-[15px] font-semibold text-[#17161a] transition hover:border-[#d6c2c2] hover:bg-[#fbf7f7] hover:text-[#8A1515]"
            >
              <Phone className="size-4 text-[#8A1515]" aria-hidden />
              Позвонить
            </a>
          ) : null}
        </div>
      </div>
    </header>
  );
}
