export interface NameValidationResult {
  isValid: boolean;
  wordCount: number;
  requiredWordCount: number;
  error?: string;
}

const ENGLISH_NAME_REGEX = /^[A-Za-z\s]+$/;
const ARABIC_NAME_REGEX = /^[\u0621-\u064A\s]+$/;

/**
 * Automatically capitalizes the first letter of each word in an English string.
 */
export function autoCapitalizeEnglishName(input: string): string {
  return input
    .toLowerCase()
    .replace(/(?:^|\s)\S/g, (char) => char.toUpperCase());
}

/**
 * Counts non-empty whitespace-separated words in a string.
 */
export function countWords(input: string): number {
  const trimmed = input.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}

/**
 * Validates an English full name.
 * Minimum 4 words (quadruple name), or 5 words if hasCollision is true.
 */
export function validateEnglishName(
  name: string,
  hasCollision = false
): NameValidationResult {
  const trimmed = name.trim();
  const words = countWords(trimmed);
  const requiredCount = hasCollision ? 5 : 4;

  if (!trimmed) {
    return {
      isValid: false,
      wordCount: 0,
      requiredWordCount: requiredCount,
      error: 'English full name is required.',
    };
  }

  if (!ENGLISH_NAME_REGEX.test(trimmed)) {
    return {
      isValid: false,
      wordCount: words,
      requiredWordCount: requiredCount,
      error: 'English name must contain only English alphabet characters and spaces.',
    };
  }

  if (words < requiredCount) {
    const missing = requiredCount - words;
    return {
      isValid: false,
      wordCount: words,
      requiredWordCount: requiredCount,
      error: hasCollision
        ? `Name collision detected. Please provide a 5th name (${missing} more required).`
        : `Please enter at least 4 names (${missing} more required).`,
    };
  }

  return {
    isValid: true,
    wordCount: words,
    requiredWordCount: requiredCount,
  };
}

/**
 * Validates an Arabic full name, ensuring Arabic script and strict word count synchronization.
 */
export function validateArabicName(
  name: string,
  targetWordCount: number
): NameValidationResult {
  const trimmed = name.trim();
  const words = countWords(trimmed);

  if (!trimmed) {
    return {
      isValid: false,
      wordCount: 0,
      requiredWordCount: targetWordCount,
      error: 'Arabic full name is required.',
    };
  }

  if (!ARABIC_NAME_REGEX.test(trimmed)) {
    return {
      isValid: false,
      wordCount: words,
      requiredWordCount: targetWordCount,
      error: 'Arabic name must contain only Arabic letters and spaces.',
    };
  }

  if (words !== targetWordCount) {
    return {
      isValid: false,
      wordCount: words,
      requiredWordCount: targetWordCount,
      error: `Arabic name must have exactly ${targetWordCount} words to match the English name (currently ${words}).`,
    };
  }

  return {
    isValid: true,
    wordCount: words,
    requiredWordCount: targetWordCount,
  };
}