import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("public employee directory", () => {
  const source = fs.readFileSync(path.join(__dirname, "page.tsx"), "utf8");
  const cardSource = fs.readFileSync(
    path.join(__dirname, "../../modules/employees/ui/EmployeeTeamCard.tsx"),
    "utf8",
  );

  it("renders three switchable client-facing team sections", () => {
    expect(source).toContain("Отдел продаж");
    expect(source).toContain("Эксперты сопровождения");
    expect(source).toContain("Команда офиса");
    expect(source).not.toContain("Руководство компании");
    expect(source).toContain('single(params.team)');
    expect(source).toContain('aria-label="Разделы команды"');
    expect(source).toContain("EmployeeTeamCard");
  });

  it("uses one four-column card pattern in every team tab", () => {
    expect(source).not.toContain("EmployeeCard");
    expect(source).toContain("lg:grid-cols-4");
    expect(source).not.toContain('team === "sales" ? "lg:grid-cols-4" : "lg:grid-cols-3"');
    expect(cardSource).toContain('employee.teamSection !== "office"');
    expect(cardSource).toContain("EmployeePhoneAction");
    expect(cardSource).toContain("Открыть профиль");
  });
});
