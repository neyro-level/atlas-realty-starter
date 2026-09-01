export function shouldBlurPropertyAddress({ enabled, origin }: { enabled: boolean; origin?: string; categoryKey?: string }) {
  return enabled && origin === 'XML'
}

export function splitBlurredAddress(address: string) {
  const match = address.match(/^(.*?)(\s+(?:д\.?|дом)\s*\d+[\w/-]*)$/iu)
  return match
    ? { applied: true, hiddenHousePart: match[2], visiblePrefix: match[1] }
    : { applied: false, hiddenHousePart: null, visiblePrefix: address }
}
