"use client";

import { Button } from "@ams/realty-ui";
import Image from "next/image";
import { Bed, BrickWall, Building2, Paintbrush, PencilRuler } from "lucide-react";
import { useState, type MouseEvent } from "react";
import { LeadgenRequestButton } from "./LeadgenRequestButton";
import type { LeadgenPromoApartment } from "./kvartiry-promo-content";

type PromoApartment = LeadgenPromoApartment;

type LeadgenApartmentShowcaseProps = {
  apartments: readonly PromoApartment[];
  formPrefix?: string;
};

export function LeadgenApartmentShowcase({ apartments, formPrefix = "leadgen_kvartiry_promo" }: LeadgenApartmentShowcaseProps) {
  return (
    <div className="leadgen-apartment-grid mt-10">
      <style>
        {`
          .leadgen-apartment-grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 24px;
          }

          .leadgen-catalog-card {
            position: relative;
            display: flex;
            min-width: 0;
            flex-direction: column;
            overflow: hidden;
            border: 1px solid var(--border);
            border-radius: 8px;
            background: var(--leadgen-apartment-showcase-visual-primary);
            box-shadow: 0 1px 2px var(--leadgen-apartment-showcase-effect-primary), 0 18px 42px var(--leadgen-apartment-showcase-effect-secondary);
            transition:
              transform 0.25s ease,
              border-color 0.25s ease,
              box-shadow 0.25s ease;
          }

          .leadgen-catalog-card::before {
            content: "";
            position: absolute;
            top: 0;
            right: 0;
            left: 0;
            z-index: 3;
            height: 3px;
            background: var(--accent);
            opacity: 0.82;
          }

          .leadgen-catalog-card:hover {
            transform: translateY(-3px);
            border-color: var(--leadgen-apartment-showcase-effect-tertiary);
            box-shadow: 0 1px 2px var(--leadgen-apartment-showcase-effect-subtle), 0 24px 56px var(--leadgen-apartment-showcase-effect-muted);
          }

          .leadgen-catalog-card__visual {
            position: relative;
            aspect-ratio: 1 / 1.05;
            overflow: hidden;
            background: var(--surface-muted);
          }

          .leadgen-catalog-card__image {
            object-fit: cover;
            transition: transform 0.55s ease;
          }

          .leadgen-catalog-card:hover .leadgen-catalog-card__image {
            transform: scale(1.03);
          }

          .leadgen-catalog-card__body {
            display: flex;
            flex-direction: column;
            gap: 13px;
            padding: 16px 15px 16px;
          }

          .leadgen-catalog-card__details {
            display: grid;
            gap: 8px;
          }

          .leadgen-catalog-card__fact {
            display: flex;
            min-width: 0;
            align-items: center;
            gap: 8px;
            color: var(--leadgen-apartment-showcase-visual-secondary);
            font-size: 12px;
            font-weight: 500;
            line-height: 1.35;
          }

          .leadgen-catalog-card__fact svg {
            width: 15px;
            height: 15px;
            flex: 0 0 auto;
            color: var(--accent);
            stroke-width: 1.8;
          }

          .leadgen-catalog-card__quick-cta {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 42px;
            width: 100%;
            border: 0;
            border-radius: 6px;
            background: var(--accent);
            color: var(--surface);
            cursor: pointer;
            font-size: 13px;
            font-weight: 600;
            line-height: 1.35;
            padding: 0 14px;
            box-shadow: 0 10px 22px var(--leadgen-apartment-showcase-effect-strong);
            transition:
              background-color 0.2s ease,
              color 0.2s ease,
              transform 0.2s ease,
              box-shadow 0.2s ease;
            text-align: center;
          }

          .leadgen-catalog-card__quick-cta:hover,
          .leadgen-catalog-card__quick-cta:focus-visible {
            background: var(--accent-hover);
            color: var(--surface);
            box-shadow: 0 14px 30px var(--leadgen-apartment-showcase-effect-tertiary);
            transform: translateY(-1px);
          }

          .leadgen-catalog-card__dots {
            position: absolute;
            left: 50%;
            bottom: 16px;
            z-index: 2;
            display: flex;
            align-items: center;
            gap: 9px;
            transform: translateX(-50%);
          }

          .leadgen-catalog-card__dot {
            width: 10px;
            height: 10px;
            border: 0;
            border-radius: 999px;
            background: var(--surface);
            cursor: pointer;
            opacity: 0.92;
            padding: 0;
            transition:
              background-color 0.2s ease,
              opacity 0.2s ease,
              transform 0.2s ease;
          }

          .leadgen-catalog-card__dot.is-active {
            background: var(--accent);
            opacity: 1;
            transform: scale(1.04);
          }

          @media (max-width: 1023px) {
            .leadgen-apartment-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }
          }

          @media (max-width: 640px) {
            .leadgen-apartment-grid {
              grid-template-columns: 1fr;
              gap: 16px;
              margin-top: 22px;
            }

            .leadgen-catalog-card {
              box-shadow: 0 1px 2px var(--leadgen-apartment-showcase-effect-primary), 0 14px 34px var(--leadgen-apartment-showcase-effect-inverse);
            }

            .leadgen-catalog-card:hover {
              transform: none;
            }

            .leadgen-catalog-card__visual {
              aspect-ratio: 16 / 10;
            }

            .leadgen-catalog-card__body {
              gap: 11px;
              padding: 15px 14px 16px;
            }

            .leadgen-catalog-card__details {
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: 9px 10px;
            }

            .leadgen-catalog-card__fact {
              align-items: flex-start;
              font-size: 12px;
              line-height: 1.35;
            }

            .leadgen-catalog-card__quick-cta {
              min-height: 46px;
              font-size: 14px;
            }
          }
        `}
      </style>
      {apartments.map((apartment) => (
        <LeadgenApartmentCard key={apartment.id} apartment={apartment} formPrefix={formPrefix} />
      ))}
    </div>
  );
}

function LeadgenApartmentCard({ apartment, formPrefix }: { apartment: PromoApartment; formPrefix: string }) {
  const images = apartment.images?.length ? apartment.images : [apartment.image];
  const [activeImage, setActiveImage] = useState(0);
  const currentImage = images[activeImage] ?? apartment.image;
  const rooms = apartment.facts.find(([label]) => label === "Количество комнат")?.[1];
  const area = apartment.facts.find(([label]) => label === "Общая площадь")?.[1];
  const repair = apartment.facts.find(([label]) => label === "Отделка")?.[1];
  const floor = apartment.facts.find(([label]) => label === "Этаж")?.[1];
  const floorsTotal = apartment.facts.find(([label]) => label === "Этажей в доме")?.[1];
  const houseType = apartment.facts.find(([label]) => label === "Тип дома")?.[1];
  const roomsLabel = rooms ? `${rooms.charAt(0).toUpperCase()}${rooms.slice(1)} квартира` : "Квартира из подборки";

  function stop(event: MouseEvent<HTMLElement>) {
    event.stopPropagation();
  }

  function updateActiveImage(event: MouseEvent<HTMLDivElement>) {
    if (images.length < 2) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const relativeX = event.clientX - bounds.left;
    const zoneWidth = bounds.width / images.length;
    const nextIndex = Math.max(0, Math.min(images.length - 1, Math.floor(relativeX / zoneWidth)));
    setActiveImage(nextIndex);
  }

  return (
    <article className="leadgen-catalog-card group">
      <div className="leadgen-catalog-card__visual" onMouseMove={updateActiveImage} onMouseLeave={() => setActiveImage(0)}>
        <Image
          src={currentImage}
          alt="Квартира из недавней подборки агентства недвижимости"
          fill
          unoptimized
          sizes="(max-width: 640px) calc(100vw - 40px), (max-width: 1024px) 50vw, 280px"
          className="leadgen-catalog-card__image"
        />
        {images.length > 1 ? (
          <div className="leadgen-catalog-card__dots" aria-label="Фотографии квартиры">
            {images.map((image, index) => (
              <Button variant="plain"
                key={image}
                type="button"
                className={`leadgen-catalog-card__dot ${index === activeImage ? "is-active" : ""}`}
                aria-label={`Показать фото ${index + 1}`}
                aria-pressed={index === activeImage}
                onClick={(event) => {
                  stop(event);
                  setActiveImage(index);
                }}
              />
            ))}
          </div>
        ) : null}
      </div>

      <div className="leadgen-catalog-card__body">
        <div className="grid gap-3">
          <p className="text-[18px] font-bold leading-tight tabular-nums text-[var(--text-primary)]">{apartment.price}</p>
          <p className="text-[13px] font-semibold leading-tight text-[var(--text-secondary)]">{roomsLabel}</p>
        </div>

        <div className="grid gap-3">
          <dl className="leadgen-catalog-card__details">
            {area ? (
              <div className="leadgen-catalog-card__fact">
                <dt className="sr-only">Общая площадь</dt>
                <PencilRuler aria-hidden />
                <dd>{area} м²</dd>
              </div>
            ) : null}
            {repair ? (
              <div className="leadgen-catalog-card__fact">
                <dt className="sr-only">Отделка</dt>
                <Paintbrush aria-hidden />
                <dd>{repair}</dd>
              </div>
            ) : null}
            {floor || floorsTotal ? (
              <div className="leadgen-catalog-card__fact">
                <dt className="sr-only">Этаж</dt>
                <Building2 aria-hidden />
                <dd>
                  Этаж {floor ?? "-"}
                  {floorsTotal ? `/${floorsTotal}` : ""}
                </dd>
              </div>
            ) : null}
            {houseType ? (
              <div className="leadgen-catalog-card__fact">
                <dt className="sr-only">Тип дома</dt>
                <BrickWall aria-hidden />
                <dd>{houseType}</dd>
              </div>
            ) : null}
            {!area && !repair && !floor && !floorsTotal && !houseType ? (
              <div className="leadgen-catalog-card__fact">
                <dt className="sr-only">Тип объекта</dt>
                <Bed aria-hidden />
                <dd>{roomsLabel}</dd>
              </div>
            ) : null}
          </dl>
          <LeadgenRequestButton
            className="leadgen-catalog-card__quick-cta"
            mode="request"
            title="Доступ к закрытой базе"
            submitLabel="Смотреть базу бесплатно"
            formType={`${formPrefix}_example_request`}
            source={`leadgen_yandex_direct:example:${apartment.id}`}
          >
            Смотреть базу бесплатно
          </LeadgenRequestButton>
        </div>
      </div>
    </article>
  );
}
