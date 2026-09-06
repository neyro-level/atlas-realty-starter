import type { Metadata } from "next";
import Link from "next/link";
import type { EmployeeDirectoryPageDto } from "@starter/site-contracts";
import { EmployeesDirectoryView, type SiteLinkRendererProps } from "@starter/site-ui";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { CatalogHeroBlock } from "@/components/marketing/CatalogHeroBlock";
import { EmployeeTeamCard } from "@/modules/employees/ui/EmployeeTeamCard";
import { getDefaultEmployeeTeamSection, isEmployeeTeamSection, type EmployeeTeamSection } from "@/modules/employees/positions";
import { getSiteEngine } from "@/site-engine";
import { resolvePublicEmployeePhone } from "@/modules/employees/phone-policy";
import { buildSeoMetadata } from "@/modules/seo/metadata";
import { getSiteUrl } from "@/project/site-config";
import { tenant } from "@/project/tenant";
import { breadcrumbSchema } from "@/shared/lib/seo/schema";
import { JsonLd } from "@/shared/ui/JsonLd";
import { getPublicSiteContacts } from "@/site-engine/site-contacts";

const EMPLOYEES_CITY_IN = tenant.cityRuLocative;

export const revalidate = 300;

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const noIndex = hasDirectoryQueryState(params);
  return buildSeoMetadata({
    path: "/sotrudniki",
    title: `Команда специалистов агентства «${tenant.brand}»`,
    description: `Специалисты по недвижимости, юристы, ипотечные брокеры и руководство агентства ${tenant.brand} в ${EMPLOYEES_CITY_IN}.`,
    noIndex,
  });
}

const EMPLOYEES_HERO_TITLE = `Команда специалистов агентства «${tenant.brand}»`;
const EMPLOYEES_HERO_DESCRIPTION = "Выберите специалиста по недвижимости или получите помощь юриста и ипотечного брокера.";
const EMPLOYEES_HERO_IMAGE = "/images/agency-employees-hero-v2.webp";
const TEAM_TABS: Array<{ value: EmployeeTeamSection; label: string; description: string }> = [
  { value: "sales", label: "Отдел продаж", description: "Специалисты по недвижимости с актуальной базой объектов." },
  { value: "support", label: "Эксперты сопровождения", description: "Ипотечные брокеры и юристы по недвижимости." },
  { value: "office", label: "Команда офиса", description: "Директора, руководители направлений и администраторы офиса." },
];

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function EmployeesPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = single(params.q)?.trim() ?? "";
  const teamValue = single(params.team) ?? "sales";
  const team: EmployeeTeamSection = isEmployeeTeamSection(teamValue) ? teamValue : "sales";
  const page = positiveInt(single(params.page));
  const [result, contacts] = await Promise.all([
    loadEmployeeDirectoryPageData({ q, team, page }),
    getPublicSiteContacts(),
  ]);
  const employees = result.items.map((employee) => ({
    ...employee,
    phone: resolvePublicEmployeePhone(employee.phone, contacts),
  }));
  const host = getSiteUrl().replace(/\/$/, "");
  const activeTab = TEAM_TABS.find((item) => item.value === team) ?? TEAM_TABS[0];
  const pages = Math.ceil(result.total / result.pageSize);
  const pageDto: EmployeeDirectoryPageDto = {
    title: EMPLOYEES_HERO_TITLE,
    titleLines: ["Команда специалистов", `агентства «${tenant.brand}»`],
    description: EMPLOYEES_HERO_DESCRIPTION,
    heroImage: EMPLOYEES_HERO_IMAGE,
    query: q,
    activeTab: { label: activeTab.label, description: activeTab.description },
    tabs: TEAM_TABS.map((tab) => ({
      ...tab,
      href: directoryHref({ team: tab.value }),
      count: result.sectionTotals[tab.value],
      active: tab.value === team,
    })),
    total: result.total,
    page: result.page,
    pageLinks: Array.from({ length: pages }, (_, index) => {
      const value = index + 1;
      return { label: String(value), href: directoryHref({ q, team, page: value }), current: value === result.page };
    }),
  };

  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Главная", url: "/" }, { name: "Сотрудники", url: "/sotrudniki" }])} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: EMPLOYEES_HERO_TITLE,
          description: EMPLOYEES_HERO_DESCRIPTION,
          url: `${host}/sotrudniki`,
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: result.total,
            itemListElement: result.items.map((employee, index) => ({
              "@type": "ListItem",
              position: (result.page - 1) * result.pageSize + index + 1,
              name: employee.fullName,
              url: `${host}/sotrudniki/${employee.slug}`,
            })),
          },
        }}
      />

      <EmployeesDirectoryView
        page={pageDto}
        breadcrumbs={<Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Компания" }, { label: "Сотрудники" }]} />}
        hero={<CatalogHeroBlock title={EMPLOYEES_HERO_TITLE} titleLines={pageDto.titleLines} titleLinesDesktop="inline" elevateContent description={EMPLOYEES_HERO_DESCRIPTION} descriptionVisibility="always" imageSrc={EMPLOYEES_HERO_IMAGE} />}
        employeeCards={employees.map((employee) => <EmployeeTeamCard key={employee.id} employee={employee} />)}
        linkRenderer={EmployeeDirectoryLink}
      />
    </>
  );
}

function EmployeeDirectoryLink({ href, children, ariaCurrent, ...props }: SiteLinkRendererProps) {
  return <Link href={href} aria-current={ariaCurrent} {...props}>{children}</Link>;
}

function directoryHref({ q, team, page }: { q?: string; team?: EmployeeTeamSection; page?: number }) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (team && team !== "sales") params.set("team", team);
  if (page && page > 1) params.set("page", String(page));
  return params.size ? `/sotrudniki?${params}` : "/sotrudniki";
}

function positiveInt(value?: string) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

async function loadEmployeeDirectoryPageData({
  q,
  team,
  page,
}: {
  q: string;
  team: EmployeeTeamSection;
  page: number;
}) {
  const pageSize = 6;
  const allEmployees = (await (await getSiteEngine()).getEmployees())
    .map((employee) => ({
      id: employee.id,
      slug: employee.slug,
      fullName: employee.name,
      position: employee.role,
      teamSection: getDefaultEmployeeTeamSection(employee.role),
      publicSummary: employee.bio,
      phone: employee.phone,
      email: employee.email,
      photoUrl: employee.photo,
      bio: employee.bio,
      objectCount: 0,
      reviewCount: 0,
      rating: null,
      specializations: ["all"] as Array<"all">,
    }))
    .filter((employee) => !q || employee.fullName.toLocaleLowerCase("ru-RU").includes(q.toLocaleLowerCase("ru-RU")));

  const activeItems = allEmployees.filter((employee) => employee.teamSection === team);
  return {
    items: activeItems.slice((page - 1) * pageSize, page * pageSize),
    activeSection: team,
    sectionTotals: {
      sales: allEmployees.filter((employee) => employee.teamSection === "sales").length,
      support: allEmployees.filter((employee) => employee.teamSection === "support").length,
      office: allEmployees.filter((employee) => employee.teamSection === "office").length,
    },
    total: activeItems.length,
    page,
    pageSize,
  };
}

function hasDirectoryQueryState(params: Record<string, string | string[] | undefined>) {
  const q = single(params.q)?.trim();
  const team = single(params.team);
  const page = single(params.page);
  return Boolean(q || (team && team !== "sales") || (page && page !== "1"));
}
