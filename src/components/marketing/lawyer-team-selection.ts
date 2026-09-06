import type { EmployeeListItem } from "@/modules/employees/types";

const LEGAL_MANAGER_POSITION = "Руководитель юридического отдела";
const LAWYER_POSITION_MARKER = "юрист";
const LAWYER_TEAM_SIZE = 3;

export function selectLawyerTeamMembers(employees: EmployeeListItem[]): EmployeeListItem[] {
  const uniqueEmployees = employees.filter(
    (employee, index, items) => items.findIndex((item) => item.id === employee.id) === index,
  );
  const manager = uniqueEmployees.find((employee) => employee.position === LEGAL_MANAGER_POSITION);
  const lawyers = uniqueEmployees.filter(
    (employee) =>
      employee.position !== LEGAL_MANAGER_POSITION &&
      employee.position.toLocaleLowerCase("ru-RU").includes(LAWYER_POSITION_MARKER),
  );

  return [...(manager ? [manager] : []), ...lawyers].slice(0, LAWYER_TEAM_SIZE);
}
