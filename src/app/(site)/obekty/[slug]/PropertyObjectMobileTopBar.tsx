"use client";

import { PropertyMobileTopBarView, type SiteLinkRendererProps } from "@starter/site-ui";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SessionCollectionButton, type SessionListingItem } from "@/modules/session-collections";

type PropertyObjectMobileTopBarProps = {
  backHref: string;
  price: string;
  title: string;
  sessionItem: SessionListingItem;
};

export function PropertyObjectMobileTopBar({
  backHref,
  price,
  title,
  sessionItem,
}: PropertyObjectMobileTopBarProps) {
  const [docked, setDocked] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setDocked(window.scrollY > 24);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <PropertyMobileTopBarView
      backHref={backHref}
      price={price}
      title={title}
      docked={docked}
      compareAction={
        <SessionCollectionButton
            kind="compare"
            item={sessionItem}
            className="inline-flex size-9 items-center justify-center rounded-md transition"
            inactiveClassName="text-[var(--text-secondary)] hover:text-[var(--accent)]"
            activeClassName="text-[var(--accent)]"
        />
      }
      favoriteAction={
        <SessionCollectionButton
            kind="favorites"
            item={sessionItem}
            className="inline-flex size-9 items-center justify-center rounded-md transition"
            inactiveClassName="text-[var(--text-secondary)] hover:text-[var(--accent)]"
            activeClassName="text-[var(--accent)]"
        />
      }
      linkRenderer={PropertyMobileLink}
    />
  );
}

function PropertyMobileLink({ href, children, ariaLabel, ariaCurrent, scroll, ...props }: SiteLinkRendererProps) {
  return <Link href={href} aria-label={ariaLabel} aria-current={ariaCurrent} scroll={scroll} {...props}>{children}</Link>;
}
