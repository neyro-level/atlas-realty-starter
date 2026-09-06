export type PublicSiteContacts = {
  phone: string;
  phoneHref: string;
  secondaryPhone: string | null;
  email: string;
  emailHref: string;
  officeAddress: string;
  hours: string;
  useSharedEmployeePhone: boolean;
  employeePhone: string | null;
  hidePropertyHouseNumbers: boolean;
  callbackHref: string;
  callbackLabel: string;
  telegram?: string;
  max?: string;
  vk?: string;
};

export type PublicOffice = {
  id: string;
  title: string;
  address: string;
  mapUrl: string;
  photoUrl: string | null;
};
