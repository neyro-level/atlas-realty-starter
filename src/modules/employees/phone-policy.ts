export type EmployeePhoneSettings = {
  useSharedEmployeePhone: boolean;
  employeePhone: string | null;
};

export function resolvePublicEmployeePhone(
  employeePhone: string | null,
  settings: EmployeePhoneSettings,
) {
  if (!settings.useSharedEmployeePhone) return employeePhone;
  return settings.employeePhone?.trim() || employeePhone;
}
