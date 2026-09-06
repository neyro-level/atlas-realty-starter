import type { SessionCollectionItemDto } from "@starter/site-contracts";

export type SessionCollectionKind = "favorites" | "compare";
export type SessionListingItem = SessionCollectionItemDto;

export type SavedSelectionListing = {
  listing: SessionListingItem;
  sortOrder: number;
  unavailable: boolean;
};

export type SavedPropertySelectionDto = {
  token: string;
  kind: string;
  source: string;
  itemCount: number;
  createdAt: string;
  listings: SavedSelectionListing[];
};
