const runtimeReferencePattern = /^[A-Z][A-Z0-9_]{1,127}$/

export function validateRuntimeReferenceName(value: unknown) {
  return typeof value === 'string' && runtimeReferencePattern.test(value) || 'Укажите только имя переменной окружения в UPPER_SNAKE_CASE.'
}

export function isRuntimeReferenceName(value: string) {
  return runtimeReferencePattern.test(value)
}
