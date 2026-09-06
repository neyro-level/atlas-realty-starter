export const EMPLOYEE_POSITION_OPTIONS = [
  "Специалист по недвижимости",
  "Ипотечный брокер",
  "Юрист по недвижимости",
  "Руководитель отдела продаж",
  "Руководитель юридического отдела",
  "Руководитель ипотечного отдела",
  "Администратор офиса",
  "Директор по продажам",
  "Директор по развитию",
  "Генеральный директор",
] as const;

export type EmployeePosition = (typeof EMPLOYEE_POSITION_OPTIONS)[number];
export type EmployeeTeamSection = "sales" | "support" | "office";

export const DEFAULT_XML_EMPLOYEE_POSITION: EmployeePosition = "Специалист по недвижимости";
export const DEFAULT_XML_EMPLOYEE_TEAM_SECTION: EmployeeTeamSection = "sales";

export const EMPLOYEE_TEAM_SECTION_OPTIONS: ReadonlyArray<{ value: EmployeeTeamSection; label: string }> = [
  { value: "sales", label: "Отдел продаж" },
  { value: "support", label: "Эксперты сопровождения" },
  { value: "office", label: "Команда офиса" },
];

export const REAL_ESTATE_SPECIALIST_PROFILE_DESCRIPTION =
  "Помогу выгодно купить или продать недвижимость, подобрать ипотечную программу и провести сделку с проверкой документов на каждом этапе.";

const EMPLOYEE_TEAM_SECTION_BY_POSITION: Record<EmployeePosition, EmployeeTeamSection> = {
  "Специалист по недвижимости": "sales",
  "Ипотечный брокер": "support",
  "Юрист по недвижимости": "support",
  "Руководитель отдела продаж": "office",
  "Руководитель юридического отдела": "office",
  "Руководитель ипотечного отдела": "office",
  "Администратор офиса": "office",
  "Директор по продажам": "office",
  "Директор по развитию": "office",
  "Генеральный директор": "office",
};

const EMPLOYEE_POSITION_RANK: Record<EmployeePosition, number> = {
  "Генеральный директор": 10,
  "Директор по продажам": 20,
  "Директор по развитию": 30,
  "Руководитель отдела продаж": 40,
  "Руководитель юридического отдела": 50,
  "Руководитель ипотечного отдела": 60,
  "Администратор офиса": 70,
  "Ипотечный брокер": 80,
  "Юрист по недвижимости": 90,
  "Специалист по недвижимости": 100,
};

const EMPLOYEE_PUBLIC_SUMMARY_BY_POSITION: Record<EmployeePosition, string> = {
  "Специалист по недвижимости": "Подберёт объект, организует просмотр и проведёт переговоры по сделке.",
  "Ипотечный брокер": "Поможет подобрать ипотечную программу и подготовить документы для банка.",
  "Юрист по недвижимости": "Проверит документы и поможет безопасно пройти юридическую часть сделки.",
  "Руководитель отдела продаж": "Координирует работу специалистов и помогает в сложных сделочных ситуациях.",
  "Руководитель юридического отдела": "Отвечает за юридическую проверку и стандарты сопровождения сделок.",
  "Руководитель ипотечного отдела": "Координирует ипотечные программы и сложные случаи одобрения.",
  "Администратор офиса": "Поможет сориентироваться в офисе и связаться с нужным специалистом.",
  "Директор по продажам": "Отвечает за качество работы отдела продаж и клиентский результат.",
  "Директор по развитию": "Развивает сервисы компании и новые направления работы с клиентами.",
  "Генеральный директор": "Отвечает за стратегию, стандарты и качество работы компании.",
};

export function isApprovedEmployeePosition(value: string): value is EmployeePosition {
  return EMPLOYEE_POSITION_OPTIONS.includes(value as EmployeePosition);
}

export function getDefaultEmployeeTeamSection(position: string): EmployeeTeamSection {
  return isApprovedEmployeePosition(position) ? EMPLOYEE_TEAM_SECTION_BY_POSITION[position] : "sales";
}

export function isEmployeeTeamSection(value: string): value is EmployeeTeamSection {
  return value === "sales" || value === "support" || value === "office";
}

export function getEmployeePositionRank(position: string) {
  return isApprovedEmployeePosition(position) ? EMPLOYEE_POSITION_RANK[position] : 999;
}

export function getEmployeePublicSummary(position: string) {
  return isApprovedEmployeePosition(position)
    ? EMPLOYEE_PUBLIC_SUMMARY_BY_POSITION[position]
    : "Поможет разобраться в задаче и подключит нужного специалиста агентства недвижимости.";
}

export function resolveEmployeeProfileDescription(
  position: string,
  storedBio: string | null | undefined,
  fallback: string,
) {
  if (position === DEFAULT_XML_EMPLOYEE_POSITION) {
    return REAL_ESTATE_SPECIALIST_PROFILE_DESCRIPTION;
  }

  return storedBio?.trim() || fallback;
}
