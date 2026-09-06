"use client";

import { createContext, useContext, type ReactNode } from "react";
import {
  REQUEST_MODAL_REALTOR_AVATAR_FALLBACKS,
  type RequestModalRealtorAvatar,
} from "./request-modal-realtor-avatars";

const RequestModalRealtorAvatarsContext = createContext<readonly RequestModalRealtorAvatar[]>(
  REQUEST_MODAL_REALTOR_AVATAR_FALLBACKS,
);

export function RequestModalRealtorAvatarsProvider({
  avatars,
  children,
}: {
  avatars: readonly RequestModalRealtorAvatar[];
  children: ReactNode;
}) {
  return (
    <RequestModalRealtorAvatarsContext.Provider value={avatars.length ? avatars : REQUEST_MODAL_REALTOR_AVATAR_FALLBACKS}>
      {children}
    </RequestModalRealtorAvatarsContext.Provider>
  );
}

export function useRequestModalRealtorAvatars() {
  return useContext(RequestModalRealtorAvatarsContext);
}
