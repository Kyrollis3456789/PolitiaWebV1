/**
 * Formats a raw timestamp or ISO date string into locale-aware presentation.
 */
export function formatTimestamp(ts?: string | null, locale = 'en'): string {
  if (!ts) return '—';
  try {
    return new Date(ts).toLocaleString(locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return ts;
  }
}

/**
 * Calculates a person's exact age in years from their date of birth string (YYYY-MM-DD).
 */
export function calculateAgeInYears(dobString?: string | null): number | null {
  if (!dobString) return null;
  try {
    const birth = new Date(dobString);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    return age >= 0 ? age : null;
  } catch {
    return null;
  }
}

/**
 * Masks sensitive national ID numbers showing only leading and trailing digits.
 */
export function maskNationalId(nid?: string | null): string {
  if (!nid || nid.length < 14) return nid || '—';
  return `${nid.slice(0, 3)}••••••••${nid.slice(-3)}`;
}
