export type AnalyticsMode = "baseline";

export const ANALYTICS_EVENT_NAMES = [
  "catalog_interaction",
  "property_open",
  "favorites_interaction",
  "compare_interaction",
  "map_open",
  "share_click",
  "phone_reveal",
  "phone_click",
  "chat_open",
  "modal_open",
  "lead_submit_attempt",
  "lead_submit_success",
  "lead_submit_error",
  "employee_profile_open",
  "employee_review_open",
  "employee_review_submit_success",
  "employee_review_submit_error",
  "scroll_depth",
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENT_NAMES)[number];

export type AnalyticsEventParams = Record<string, string | number | boolean | null | undefined>;
