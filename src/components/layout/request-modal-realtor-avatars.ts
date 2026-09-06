export type RequestModalRealtorAvatar = {
  label: string;
  src: string;
};

export type RequestModalEmployeePhoto = {
  fullName: string;
  photoUrl: string | null;
};

export const REQUEST_MODAL_REALTOR_AVATAR_FALLBACKS: RequestModalRealtorAvatar[] = [
  { label: "Риэлтор агентства недвижимости", src: "https://is.vladis.ru/api/upload/53066708?preset=full&compressed=true" },
  { label: "Риэлтор агентства недвижимости", src: "https://is.vladis.ru/api/upload/53068381?preset=full&compressed=true" },
  { label: "Риэлтор агентства недвижимости", src: "https://is.vladis.ru/api/upload/53068278?preset=full&compressed=true" },
];

export function buildRequestModalRealtorAvatarPool(
  employees: readonly RequestModalEmployeePhoto[],
): RequestModalRealtorAvatar[] {
  return employees.flatMap((employee) => {
    const src = employee.photoUrl?.trim();
    return src ? [{ label: employee.fullName, src }] : [];
  });
}

export function selectDailyRequestModalAvatars(
  avatars: readonly RequestModalRealtorAvatar[],
  date = new Date(),
) {
  const unique = [...new Map(avatars.map((avatar) => [avatar.src, avatar])).values()]
    .filter((avatar) => avatar.src.trim())
    .sort((left, right) => hashString(left.src) - hashString(right.src));
  if (unique.length <= 3) return unique;

  const offset = moscowDayNumber(date) % unique.length;
  return Array.from({ length: 3 }, (_, index) => unique[(offset + index) % unique.length]!);
}

function moscowDayNumber(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Moscow",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return Math.floor(Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day)) / 86_400_000);
}

function hashString(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
