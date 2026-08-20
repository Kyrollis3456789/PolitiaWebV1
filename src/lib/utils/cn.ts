import { clsx, type ClassValue } from 'clsx';

/**
 * Combines conditional class names cleanly.
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
