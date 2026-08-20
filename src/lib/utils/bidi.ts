/**
 * Standard RTL locales list supported in Politia.
 */
export const RTL_LOCALES = ['ar', 'ar-EG', 'ar-SA', 'ar-AE', 'he', 'fa', 'ur'];

/**
 * Returns true if the provided locale string is Right-to-Left.
 */
export function isRTL(locale: string): boolean {
  return RTL_LOCALES.some((l) => locale.toLowerCase().startsWith(l.toLowerCase()));
}

/**
 * Resolves logical CSS direction ('rtl' or 'ltr') from locale.
 */
export function getDirection(locale: string): 'rtl' | 'ltr' {
  return isRTL(locale) ? 'rtl' : 'ltr';
}
