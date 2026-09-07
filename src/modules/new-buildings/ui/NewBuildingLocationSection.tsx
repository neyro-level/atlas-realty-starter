import { NewBuildingLocationView } from "@ams/realty-ui";
import type { NewBuilding } from "../schema";
import { toNewBuildingDetailDto } from "../to-detail-dto";
import { DeferredYandexMap } from "./DeferredYandexMap";

export function NewBuildingLocationSection({ complex, contained = false }: { complex: NewBuilding; contained?: boolean }) {
  const detail = toNewBuildingDetailDto(complex);
  const hasCoordinates = detail.latitude !== null && detail.longitude !== null;
  const yandexUrl = buildYandexMapsUrl(detail);
  const widgetUrl = hasCoordinates
    ? buildYandexWidgetUrl({ latitude: detail.latitude as number, longitude: detail.longitude as number })
    : buildYandexSearchWidgetUrl({ address: detail.address, name: detail.name });

  return (
    <NewBuildingLocationView
      detail={detail}
      contained={contained}
      map={<DeferredYandexMap widgetUrl={widgetUrl} yandexUrl={yandexUrl} title={`Карта: ${detail.name}`} />}
    />
  );
}

function buildYandexWidgetUrl({ latitude, longitude }: { latitude: number; longitude: number }) {
  const url = new URL("https://yandex.ru/map-widget/v1/");
  url.searchParams.set("ll", `${longitude},${latitude}`);
  url.searchParams.set("pt", `${longitude},${latitude},pm2rdm`);
  url.searchParams.set("z", "16");
  return url.toString();
}

function buildYandexSearchWidgetUrl({ address, name }: { address: string; name: string }) {
  const url = new URL("https://yandex.ru/map-widget/v1/");
  url.searchParams.set("text", `${name}, ${address}`);
  url.searchParams.set("z", "16");
  return url.toString();
}

function buildYandexMapsUrl({ address, latitude, longitude, name }: { address: string; latitude: number | null; longitude: number | null; name: string }) {
  const url = new URL("https://yandex.ru/maps/");
  if (latitude !== null && longitude !== null) {
    url.searchParams.set("ll", `${longitude},${latitude}`);
    url.searchParams.set("pt", `${longitude},${latitude},pm2rdm`);
    url.searchParams.set("z", "16");
  } else {
    url.searchParams.set("text", `${name}, ${address}`);
  }
  return url.toString();
}
