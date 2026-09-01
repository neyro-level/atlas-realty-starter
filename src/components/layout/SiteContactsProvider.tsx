"use client";

import { createContext, useContext } from "react";
import type { PublicSiteContacts } from "@/shared/types/public-site-contacts";

const SiteContactsContext = createContext<PublicSiteContacts | null>(null);

export function SiteContactsProvider({
  children,
  contacts,
}: {
  children: React.ReactNode;
  contacts: PublicSiteContacts;
}) {
  return <SiteContactsContext.Provider value={contacts}>{children}</SiteContactsContext.Provider>;
}

export function useSiteContacts() {
  const contacts = useContext(SiteContactsContext);
  if (!contacts) {
    throw new Error("useSiteContacts должен использоваться внутри SiteContactsProvider.");
  }
  return contacts;
}
