import { contactsConfig } from "@/project/site-config";

export function buildTelHref(phone: string | null | undefined) {
  if (!phone) {
    return contactsConfig.phoneHref;
  }

  const digits = phone.replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : contactsConfig.phoneHref;
}
