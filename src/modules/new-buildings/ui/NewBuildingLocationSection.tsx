import { NewBuildingLocationView } from "@starter/site-ui";
import { buildYandexCoordinateWidgetURL, buildYandexLocationURL, buildYandexSearchWidgetURL } from "@/core/integrations/maps/navigation";
import type { NewBuilding } from "../schema";
import { toNewBuildingDetailDto } from "../to-detail-dto";
import { DeferredYandexMap } from "./DeferredYandexMap";

export function NewBuildingLocationSection({ complex, contained = false }: { complex: NewBuilding; contained?: boolean }) {
  const detail = toNewBuildingDetailDto(complex);
  const hasCoordinates = detail.latitude !== null && detail.longitude !== null;
  const yandexUrl = buildYandexLocationURL(detail);
  const widgetUrl = hasCoordinates
    ? buildYandexCoordinateWidgetURL(detail.latitude as number, detail.longitude as number)
    : buildYandexSearchWidgetURL(detail.address, detail.name);

  return (
    <NewBuildingLocationView
      detail={detail}
      contained={contained}
      map={<DeferredYandexMap widgetUrl={widgetUrl} yandexUrl={yandexUrl} title={`Карта: ${detail.name}`} />}
    />
  );
}
