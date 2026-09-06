import Image from "next/image";
import { AgencyInlineLeadForm } from "@/components/marketing/AgencyInlineLeadForm";

type AgencyInlineLeadSectionProps = {
  id: string;
  eyebrow?: string;
  title: string;
  text: string;
  sourcePage: string;
  source: string;
  formType: string;
  message: string;
  submitLabel: string;
  expertName: string;
  expertCaption?: string;
  expertImageSrc: string;
  expertImageAlt: string;
  trustItems?: string[];
};

export function AgencyInlineLeadSection({
  id,
  eyebrow = "Помощь специалиста",
  title,
  text,
  sourcePage,
  source,
  formType,
  message,
  submitLabel,
  expertName,
  expertCaption = "Специалист агентства недвижимости",
  expertImageSrc,
  expertImageAlt,
  trustItems = [],
}: AgencyInlineLeadSectionProps) {
  const titleId = `${id}-title`;

  return (
    <section id={id} className="bg-white" aria-labelledby={titleId}>
      <div className="mx-auto max-w-site-frame px-5 pb-20 pt-8 md:pb-24 md:pt-10 lg:pt-14">
        <div className="grid overflow-hidden rounded-lg border border-[#E3E3E1] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02),0_18px_44px_rgba(0,0,0,0.05)] lg:grid-cols-[0.34fr_0.66fr]">
          <div className="relative min-h-[360px] bg-[#F7F7F5] md:min-h-[500px] lg:min-h-[520px]">
            <Image
              src={expertImageSrc}
              alt={expertImageAlt}
              fill
              quality={95}
              sizes="(max-width: 1024px) 100vw, 620px"
              className="object-cover object-[center_6%] brightness-[1.05] lg:object-[center_24%]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0)_42%,rgba(16,16,17,0.58)_100%)]" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white md:p-8">
              <p className="text-[24px] font-extrabold leading-tight">{expertName}</p>
              <p className="mt-2 text-sm font-semibold text-white/78">{expertCaption}</p>
            </div>
          </div>

          <div className="flex flex-col justify-center p-6 md:p-10 lg:p-14">
            <p className="mb-4 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#8A1515]">
              {eyebrow}
            </p>
            <h2
              id={titleId}
              className="max-w-[760px] text-[26px] font-extrabold leading-[1.14] text-[#17161A] [text-wrap:balance] md:text-[32px] lg:text-[36px]"
            >
              {title}
            </h2>
            <p className="mt-7 max-w-[680px] text-[18px] leading-8 text-[#17161A]">
              {text}
            </p>

            {trustItems.length > 0 ? (
              <ul className="mt-8 grid gap-3 text-[15px] font-semibold leading-6 text-[#4C494A] md:grid-cols-3">
                {trustItems.map((item) => (
                  <li key={item} className="border-l border-[#8A1515]/30 pl-4">
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}

            <AgencyInlineLeadForm
              sourcePage={sourcePage}
              source={source}
              formType={formType}
              message={message}
              submitLabel={submitLabel}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
