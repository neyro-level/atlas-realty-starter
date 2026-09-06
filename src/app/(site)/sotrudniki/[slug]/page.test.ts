import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("public employee profile", () => {
  const source = fs.readFileSync(path.join(__dirname, "page.tsx"), "utf8");

  it("keeps objects for sales and reviews for client-facing experts only", () => {
    expect(source).toContain('employee.teamSection === "sales"');
    expect(source).toContain('employee.teamSection === "support"');
    expect(source).toContain("showsObjects");
    expect(source).toContain("showsReviews");
  });

  it("uses the shared compact protected lead form and balanced profile layout", () => {
    expect(source).toContain("premiumCompact");
    expect(source).toContain('description="Оставьте номер — специалист перезвонит и уточнит вашу задачу."');
    expect(source).toContain("md:min-h-[440px]");
    expect(source).toContain("lg:h-full");
  });

  it("shows shared premium contact details with company email fallback", () => {
    expect(source).toContain("EmployeeContactDetails");
    expect(source).toContain("email={employee.email || contacts.email}");
    expect(source).toContain("phone={publicPhone}");
  });

  it("keeps the employee callback identifiable in deliveries and analytics", () => {
    expect(source).toContain('source="employee_profile"');
    expect(source).toContain('formType="employee_callback"');
    expect(source).toContain("agentId={employee.id}");
    expect(source).toContain("Заявка со страницы сотрудника: ${employee.fullName}");
  });
});
