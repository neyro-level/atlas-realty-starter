import Link from "next/link";
import { type SiteLinkRendererProps } from "@starter/site-ui/contracts";
import { SharedSelectionView } from "@starter/site-ui/views";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { buildSavedSelectionShareDescription, buildSavedSelectionShareTitle } from "@/modules/session-collections/share-copy";
import { SessionSelectionGrid } from "@/modules/session-collections/SessionSelectionGrid";
import type { SavedPropertySelectionDto } from "./types";

function SelectionLink({href,children,className,ariaCurrent}:SiteLinkRendererProps){return <Link href={href} className={className} aria-current={ariaCurrent}>{children}</Link>;}

export function SharedSelectionPage({ selection }: { selection: SavedPropertySelectionDto }) {
  const visibleCount=selection.listings.filter((item)=>!item.unavailable).length||selection.listings.length;
  const title=buildSavedSelectionShareTitle();
  const description=visibleCount?buildSavedSelectionShareDescription(visibleCount):"В подборке не осталось доступных для показа объектов.";
  const grid=visibleCount?<SessionSelectionGrid items={selection.listings.map((item,index)=>({listing:item.listing,href:item.listing.path,priority:index<4,unavailable:item.unavailable,showFavoriteControl:false}))}/>:undefined;
  return <SharedSelectionView title={title} description={description} createdLabel={formatDate(selection.createdAt)} visibleCount={visibleCount} breadcrumbs={<Breadcrumbs items={[{label:"Главная",href:"/"},{label:"Недвижимость",href:"/nedvizhimost"},{label:"Подборка"}]} className="mb-5"/>} grid={grid} linkRenderer={SelectionLink}/>;
}
function formatDate(value:string){const date=new Date(value);return Number.isNaN(date.getTime())?"недавно":new Intl.DateTimeFormat("ru-RU",{day:"numeric",month:"long",year:"numeric"}).format(date);}
