import type { RequestOverlayDetail } from "../../components/shared/site-overlay-context";
import { MobileStickyConversionView } from "../shared/MobileStickyConversionView";

export function NewBuildingStickyConversionView({ visible, title, note, label, request, ariaLabel = "Быстрое действие по новостройкам" }: { visible: boolean; title: string; note: string; label: string; request: RequestOverlayDetail; ariaLabel?: string }) {
  return (
    <MobileStickyConversionView visible={visible} ariaLabel={ariaLabel} title={title} note={note} label={label} request={request} />
  );
}
