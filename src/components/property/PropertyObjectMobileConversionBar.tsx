"use client";

import { MobileStickyConversionView } from "@starter/site-ui/views";

import { useMobileStickyConversionVisibility } from "@/components/marketing/useMobileStickyConversionVisibility";

type Props = {
  propertyId: string;
  agentId?: string | null;
  propertyTitle: string;
  propertyAddress?: string | null;
  propertyObjectCode?: string | null;
  propertyPath: string;
};

export function PropertyObjectMobileConversionBar({ propertyId, agentId, propertyTitle, propertyAddress, propertyObjectCode, propertyPath }: Props) {
  const visible = useMobileStickyConversionVisibility();

  return (
    <MobileStickyConversionView
      visible={visible}
      ariaLabel="Быстрая консультация по объекту"
      title="Уточним актуальность"
      note="Ответим на вопросы"
      label="Консультация по объекту"
      request={{
        title: "Консультация по объекту",
        subtitle: "Уточним актуальность, условия покупки и ответим на вопросы по этому объекту.",
        source: `property:${propertyId}:mobile_sticky`,
        formType: "property_consultation",
        submitLabel: "Получить консультацию",
        showSubtitle: true,
        propertyId,
        agentId: agentId ?? undefined,
        propertyTitle,
        propertyAddress: propertyAddress ?? undefined,
        propertyObjectCode: propertyObjectCode ?? undefined,
        propertyPath,
      }}
    />
  );
}
