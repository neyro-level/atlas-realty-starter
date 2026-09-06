export type AdminEntityKey = "lead" | "property" | "agent" | "importRun" | "settings";

export type AdminViewType = "table" | "kanban" | "cards" | "timeline";

export type AdminCapability =
  | "analytics.read"
  | "analytics.export"
  | "commands.read"
  | "lead.read"
  | "lead.update"
  | "lead.export"
  | "property.read"
  | "property.manual.create"
  | "property.manual.update"
  | "property.manual.publish"
  | "property.media.update"
  | "property.xml.override"
  | "agent.read"
  | "agent.manual.create"
  | "agent.manual.update"
  | "agent.media.update"
  | "agent.updatePublicProfile"
  | "review.moderate"
  | "import.read"
  | "import.run"
  | "settings.read"
  | "settings.update";

export type AdminActivityEvent =
  | "LEAD_CREATED"
  | "LEAD_DUPLICATE_SUPPRESSED"
  | "LEAD_STAGE_CHANGED"
  | "LEAD_NOTE_ADDED"
  | "LEAD_UPDATED"
  | "PROPERTY_CREATED"
  | "PROPERTY_UPDATED"
  | "PROPERTY_PUBLISHED"
  | "PROPERTY_ARCHIVED"
  | "PROPERTY_MEDIA_ADDED"
  | "PROPERTY_MEDIA_REORDERED"
  | "PROPERTY_MAIN_IMAGE_CHANGED"
  | "XML_PROPERTY_HIDDEN"
  | "XML_PROPERTY_UNHIDDEN"
  | "AGENT_UPDATED"
  | "REVIEW_PUBLISHED"
  | "REVIEW_RETURNED_TO_MODERATION"
  | "REVIEW_REJECTED"
  | "SITE_SETTINGS_UPDATED"
  | "IMPORT_FINISHED";

export type AdminCommand = {
  id: string;
  label: string;
  description?: string;
  href: string;
  entityKey?: AdminEntityKey;
  group: "Навигация" | "Действия" | "Заявки" | "Объекты" | "Сотрудники";
};

export type AdminRecordSection = {
  key: string;
  title: string;
  description?: string;
  fields: string[];
};

export type AdminViewPresetDefinition = {
  entityKey: AdminEntityKey;
  viewKey: string;
  label: string;
  type: AdminViewType;
  filters?: Record<string, string>;
  sort?: Record<string, string>;
  visibleColumns: string[];
  groupBy?: string;
  position: number;
  isSystem: true;
};
