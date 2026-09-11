export type NewBuildingMediaViewModel = {
  src: string | null;
  alt: string;
  sourceUrl?: string | null;
};

export type NewBuildingSummaryViewModel = {
  id: string;
  slug: string;
  title: string;
  address: string;
  priceFrom: number | null;
  completion: string;
  image: string | null;
  developerName?: string;
  floorsLabel?: string | null;
};

export type NewBuildingDetailViewModel = {
  sourceId: string | null;
  slug: string;
  name: string;
  shortName: string;
  positioning: string;
  address: string;
  city: string;
  district: string | null;
  latitude: number | null;
  longitude: number | null;
  developerName: string;
  completionLabel: string | null;
  classLabel: string | null;
  buildingsLabel: string | null;
  apartmentsLabel: string | null;
  floorsLabel: string | null;
  priceFrom: number | null;
  areaFrom: number | null;
  areaTo: number | null;
  formats: string[];
  mortgageLabel: string | null;
  gallery: NewBuildingMediaViewModel[];
  videoUrl: string | null;
  about: { intro: string; features: Array<{ title: string; text: string }> };
  layouts: Array<{
    id: string;
    label: string;
    areaFrom: number | null;
    areaTo: number | null;
    priceFrom: number | null;
    image: NewBuildingMediaViewModel | null;
  }>;
  purchaseOptions: Array<{ title: string; text: string; value: string | null }>;
  location: {
    intro: string;
    items: Array<{ title: string; text: string; timeLabel: string | null }>;
  };
  whyAgency: Array<{ title: string; text: string }>;
  related: NewBuildingSummaryViewModel[];
};

export type NewBuildingExpertViewModel = {
  name: string;
  role: string;
  portrait: string;
  ratingLabel?: string | null;
};
