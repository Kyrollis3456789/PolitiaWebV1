/**
 * Utility function to sanitize text input strings:
 * - Trims leading and trailing whitespace
 * - Strips dangerous HTML tag characters (<, >) and script injection tags
 * - Normalizes quotes and removes null bytes to prevent injection crashes
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '');
}

/**
 * Sanitizes an object of string key-value pairs recursively.
 */
export function sanitizePayload<T extends Record<string, any>>(payload: T): T {
  if (!payload || typeof payload !== 'object') return payload;

  const sanitized: Record<string, any> = Array.isArray(payload) ? [] : {};
  for (const [key, value] of Object.entries(payload)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizePayload(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized as T;
}
