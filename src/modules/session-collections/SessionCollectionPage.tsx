"use client";

import Image, { type ImageProps } from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CompareTableView, SessionCollectionPageView, type SiteImageRendererProps, type SiteLinkRendererProps } from "@starter/site-ui";
import { buildCollectionGroups, filterItemsByCollectionGroup, type CollectionGroupKey } from "./collection-groups";
import { FavoriteArticleCard } from "./FavoriteArticleCard";
import { isArticleSessionItem } from "./favorite-article";
import { SessionSelectionGrid } from "./SessionSelectionGrid";
import { ShareFavoritesButton } from "./ShareFavoritesButton";
import { readSessionCollection, SESSION_COLLECTION_EVENT, writeSessionCollection } from "./storage";
import type { SessionCollectionKind, SessionListingItem } from "./types";

function CollectionLink({ href, children, className, ariaCurrent }: SiteLinkRendererProps) { return <Link href={href} className={className} aria-current={ariaCurrent}>{children}</Link>; }
function CollectionImage({ alt, ...props }: SiteImageRendererProps) { return <Image alt={alt} {...(props as Omit<ImageProps,"alt">)} />; }

export function SessionCollectionPage({ kind }: { kind: SessionCollectionKind }) {
  const [items,setItems]=useState<SessionListingItem[]>([]); const [ready,setReady]=useState(false); const [activeGroup,setActiveGroup]=useState<CollectionGroupKey|null>(null); const favorites=kind==="favorites";
  const groups=useMemo(()=>buildCollectionGroups(items),[items]);
  const resolvedGroup=useMemo(()=>groups.length?(activeGroup&&groups.some((group)=>group.key===activeGroup)?activeGroup:groups[0]?.key??null):null,[activeGroup,groups]);
  const visible=useMemo(()=>resolvedGroup?filterItemsByCollectionGroup(items,resolvedGroup):items,[items,resolvedGroup]);
  const properties=useMemo(()=>items.filter((item)=>!isArticleSessionItem(item)),[items]);
  useEffect(()=>{let alive=true;const sync=()=>{const next=readSessionCollection(kind);queueMicrotask(()=>{if(alive){setItems(next);setReady(true);}});};sync();window.addEventListener(SESSION_COLLECTION_EVENT,sync);window.addEventListener("storage",sync);return()=>{alive=false;window.removeEventListener(SESSION_COLLECTION_EVENT,sync);window.removeEventListener("storage",sync);};},[kind]);
  const remove=(id:string)=>{writeSessionCollection(kind,items.filter((item)=>item.id!==id));setItems(readSessionCollection(kind));};
  const empty=ready&&!properties.length;
  const content=!ready||empty?undefined:favorites?(resolvedGroup==="article"?<ArticleGrid items={visible}/>:<SessionSelectionGrid items={visible.map((listing,index)=>({listing,href:listing.path,priority:index<4}))}/>):<CompareTableView items={visible.length?visible:properties} onRemove={remove} linkRenderer={CollectionLink} imageRenderer={CollectionImage}/>;
  return <SessionCollectionPageView kind={kind} ready={ready} groups={groups} activeGroup={resolvedGroup} onGroupChange={(key)=>setActiveGroup(key as CollectionGroupKey)} shareControl={ready&&favorites&&properties.length?<ShareFavoritesButton items={items}/>:undefined} content={content}/>;
}

function ArticleGrid({items}:{items:SessionListingItem[]}){return <div className="mt-5 grid gap-x-5 gap-y-7 sm:grid-cols-2 lg:mt-6 lg:grid-cols-3 lg:gap-y-8 xl:grid-cols-4">{items.map((item,index)=><FavoriteArticleCard key={item.id} item={item} priority={index<2}/>)}</div>;}
