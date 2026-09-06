"use client";

import Image from "next/image";
import { Clock3, Home, Ruler } from "lucide-react";
import { LeadgenRequestButton } from "./LeadgenRequestButton";
import type { LeadgenPromoConstructionExample } from "./kvartiry-promo-content";

type LeadgenConstructionProjectShowcaseProps = {
  examples: readonly LeadgenPromoConstructionExample[];
  formPrefix: string;
  modalTitle: string;
  submitLabel: string;
};

export function LeadgenConstructionProjectShowcase({
  examples,
  formPrefix,
  modalTitle,
  submitLabel,
}: LeadgenConstructionProjectShowcaseProps) {
  return (
    <div className="mt-12 sm:mt-14">
      <div
        className="grid gap-4 max-md:flex max-md:snap-x max-md:snap-mandatory max-md:overflow-x-auto max-md:scroll-px-1 max-md:pb-4 max-md:[scrollbar-width:none] max-md:[&::-webkit-scrollbar]:hidden md:grid-cols-3"
        aria-label="Примеры реализованных проектов"
      >
        {examples.map((project) => (
          <article
            key={project.id}
            className="group flex min-w-0 flex-col overflow-hidden rounded-[8px] border border-[#E3E3E1] bg-white shadow-[0_18px_42px_rgba(23,22,26,0.05)] transition duration-300 hover:-translate-y-0.5 hover:border-[#d6c2c2] hover:shadow-[0_26px_62px_rgba(23,22,26,0.09)] max-md:w-[82vw] max-md:max-w-[360px] max-md:shrink-0 max-md:snap-start"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-[#EBEBE9]">
              <Image
                src={project.image}
                alt={project.imageAlt}
                fill
                quality={75}
                sizes="(max-width: 768px) 82vw, (max-width: 1024px) 31vw, 370px"
                className="object-cover transition duration-500 group-hover:scale-[1.025]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(23,22,26,0)_44%,rgba(23,22,26,0.46)_100%)]" aria-hidden />
              <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
                <span className="rounded-[6px] bg-white/90 px-2.5 py-1.5 text-[11px] font-medium leading-none text-[#413f41] shadow-[0_10px_24px_rgba(0,0,0,0.12)] backdrop-blur-sm">
                  {project.buildTime}
                </span>
                <span className="rounded-[6px] bg-[#8A1515]/92 px-2.5 py-1.5 text-[11px] font-semibold leading-none text-white shadow-[0_10px_24px_rgba(0,0,0,0.14)] backdrop-blur-sm">
                  Ваш город
                </span>
              </div>
            </div>

            <div className="flex flex-1 flex-col p-5 sm:p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8A1515]">Материал</p>
              <h3 className="mt-2 text-[22px] font-semibold leading-tight text-[#17161A]">{project.material}</h3>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-[8px] bg-[#fbf8f8] p-3">
                  <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase leading-none text-[#827F81]">
                    <Ruler className="size-3.5" aria-hidden />
                    Площадь
                  </span>
                  <p className="mt-2 text-[19px] font-semibold leading-none text-[#17161A]">{project.area}</p>
                </div>
                <div className="rounded-[8px] bg-[#fbf8f8] p-3">
                  <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase leading-none text-[#827F81]">
                    <Clock3 className="size-3.5" aria-hidden />
                    Срок
                  </span>
                  <p className="mt-2 text-[19px] font-semibold leading-none text-[#17161A]">{project.buildTime}</p>
                </div>
              </div>

              <div className="mt-5 border-t border-[#E3E3E1] pt-5">
                <p className="text-[10px] font-semibold uppercase leading-none text-[#827F81]">Стоимость</p>
                <p className="mt-2 text-[24px] font-semibold leading-tight text-[#8A1515]">{project.priceFrom}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-9 flex flex-col items-center">
        <LeadgenRequestButton
          className="inline-flex min-h-14 w-full items-center justify-center rounded-[6px] bg-[#8A1515] px-7 text-center text-sm font-semibold text-white shadow-[0_14px_30px_rgba(138,21,21,0.18)] transition hover:-translate-y-0.5 hover:bg-[#630E0E] hover:shadow-[0_18px_38px_rgba(138,21,21,0.24)] sm:w-auto"
          mode="quiz"
          title={modalTitle}
          submitLabel={submitLabel}
          formType={`${formPrefix}_examples_quiz`}
          source="leadgen_yandex_direct"
        >
          Узнать стоимость моего варианта
        </LeadgenRequestButton>
        <p className="mt-3 flex items-center gap-2 text-center text-[12px] font-medium leading-5 text-[#827F81]">
          <Home className="size-3.5 text-[#8A1515]" aria-hidden />
          Расчет зависит от участка, комплектации и выбранных материалов
        </p>
      </div>
    </div>
  );
}
