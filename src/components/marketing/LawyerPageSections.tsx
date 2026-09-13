import { LawyerPageView } from "./LawyerPageView";
import { AgencyFaqAccordion } from "@/components/marketing/AgencyFaqAccordion";
import { AgencyInlineLeadForm } from "@/components/marketing/AgencyInlineLeadForm";
import type { AgencyFaqItem } from "@/components/marketing/agency-faq-content";
import { LawyerServicesGallery } from "@/components/marketing/LawyerServicesGallery";
import { selectLawyerTeamMembers } from "@/components/marketing/lawyer-team-selection";
import { EmployeeTeamCard, getEmployeeDirectory } from "@/modules/employees";
import { EmployeePortrait } from "@/modules/employees/ui/EmployeePortrait";
import { faqPageSchema } from "@/shared/lib/seo/schema";
import { JsonLd } from "@/shared/ui/JsonLd";
import { siteProfile } from "@/project/tenant.config";

const LAWYER_FAQ_ITEMS: AgencyFaqItem[] = [
  { question: "Чем юрист агентства недвижимости отличается от нотариуса или стороннего адвоката?", answer: [{ type: "paragraph", text: "Нотариус удостоверяет сделки и оформляет наследство в стандартных случаях. Юрист подключается, когда стандартный путь не работает: пропущен срок, документы старого образца, есть спор или нужен суд. Мы работаем только с недвижимостью и видим всю картину сделки, а не отдельную бумагу." }] },
  { question: "Можно ли оформить наследство, если срок уже пропущен?", answer: [{ type: "paragraph", text: "Да, через суд. Нужно документально подтвердить уважительную причину пропуска срока или доказать фактическое принятие наследства. Шансы оцениваем на консультации после изучения ситуации и документов." }] },
  { question: "Что делать, если документы на квартиру или землю старого (украинского) образца?", answer: [{ type: "paragraph", text: "Большинство документов, выданных до 2022 года, подлежат приведению в соответствие с законодательством РФ. На консультации смотрим ваши документы и говорим конкретно, что нужно сделать: иногда достаточно подачи в Росреестр, иногда требуется дополнительное оформление." }] },
  { question: "Сколько стоит сопровождение сделки или оформление наследства?", answer: [{ type: "paragraph", text: "Первичная консультация по телефону — бесплатно. Стоимость дальнейшей работы зависит от объёма и сложности, фиксируется в договоре до начала работ. Без скрытых платежей или дополнительных услуг в процессе." }] },
  { question: "Можно ли снять человека с регистрации, если он не выходит на связь?", answer: [{ type: "paragraph", text: "Да, через суд. Подаём иск, документально подтверждаем факт непроживания, после решения суда снимаем с учёта в УВМ. Сроки — от двух месяцев в зависимости от загрузки суда." }] },
  { question: "Что происходит после заявки на консультацию?", answer: [{ type: "paragraph", text: "Юрист перезванивает в течение 15 минут в рабочее время, кратко уточняет ситуацию и предлагает записаться на очную встречу или прислать документы на анализ. Если вопрос простой — отвечаем по телефону бесплатно." }] },
  { question: "Работаете ли вы с объектами, которые находятся в другом городе?", answer: [{ type: "paragraph", text: "Да, юридический отдел агентства недвижимости работает с объектами в Краснодаре и других населённых пунктах. Часть вопросов решаем удалённо по документам, для суда или регистрации требуется личное присутствие или доверенность." }] },
  { question: "Какие документы нужно принести на первую консультацию?", answer: [{ type: "paragraph", text: "Минимально: паспорт, документы на объект (свидетельство о праве, договор, наследство) и документы, связанные с вопросом (свидетельство о смерти, справки о регистрации). Если чего-то не хватает — скажем на консультации, что нужно дополнительно." }] },
];

const NON_PUBLIC_PREVIEW_EMPLOYEE_NAMES = new Set(["Соколова Елена Андреевна", "Орлова Елена Андреевна", "Орлова Мария Игоревна", "Кузнецов Алексей Сергеевич"]);

export async function LawyerPageSections() {
  const [support, office] = await Promise.all([getEmployeeDirectory({ team: "support" }), getEmployeeDirectory({ team: "office" })]);
  const employees = selectLawyerTeamMembers([...office.items, ...support.items].filter((employee) => !NON_PUBLIC_PREVIEW_EMPLOYEE_NAMES.has(employee.fullName)));
  const expert = employees.find((employee) => employee.position === "Руководитель юридического отдела");
  const schemaItems = LAWYER_FAQ_ITEMS.map((item) => ({ question: item.question, answer: item.answer.map((block) => block.type === "paragraph" ? block.text : block.items.join(" ")).join(" ") }));

  return <><JsonLd data={faqPageSchema(schemaItems)} /><LawyerPageView
    cityPrepositional={siteProfile.city.prepositional}
    expert={expert ? { fullName: expert.fullName, position: expert.position, portrait: <EmployeePortrait photoUrl={expert.photoUrl} fullName={expert.fullName} sizes="(max-width: 1024px) 100vw, 520px" /> } : undefined}
    employeeCards={employees.map((employee) => <EmployeeTeamCard key={employee.id} employee={employee} showPhoneAction />)}
    servicesGallery={<LawyerServicesGallery />}
    consultationForm={<AgencyInlineLeadForm sourcePage="/yurist" source="corporate:yurist:final" formType="legal_consultation" message="Юридическая консультация" submitLabel="Получить консультацию" centerConsent requireName stacked buttonAgreementConsent />}
    initialConsultationText="Кратко описываете ситуацию. Первая консультация по телефону — бесплатно."
    consultationTitle="Оставьте заявку — юрист перезвонит в течение 15 минут и оценит вашу ситуацию"
    consultationDescription="Первая консультация по телефону бесплатно. Расскажите кратко о ситуации, и мы скажем, можно ли решить вопрос без суда или нужна подготовка документов."
    faq={<AgencyFaqAccordion items={LAWYER_FAQ_ITEMS} />}
  /></>;
}
