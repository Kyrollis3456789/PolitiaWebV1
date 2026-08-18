export interface NameValidationResult {
  isValid: boolean;
  wordCount: number;
  requiredWordCount: number;
  error?: string;
  errorAr?: string;
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
 * Requires 4 words (First, Middle, Grandfather, Family name), or 5 if hasCollision is true.
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
      error: 'Please enter your full name',
      errorAr: 'يرجى إدخال الاسم الكامل بالإنجليزية',
    };
  }

  if (!ENGLISH_NAME_REGEX.test(trimmed)) {
    return {
      isValid: false,
      wordCount: words,
      requiredWordCount: requiredCount,
      error: 'Please use English/Latin letters only',
      errorAr: 'يرجى استخدام الحروف الإنجليزية فقط',
    };
  }

  if (words < 4) {
    return {
      isValid: false,
      wordCount: words,
      requiredWordCount: 4,
      error: 'Please enter your full four-part name (First, Middle, Grandfather, Family name)',
      errorAr: 'يرجى إدخال الاسم الرباعي بالكامل (الاسم الأول، الأب، الجد، العائلة)',
    };
  }

  if (hasCollision && words < 5) {
    return {
      isValid: false,
      wordCount: words,
      requiredWordCount: 5,
      error: 'Name collision detected. Please provide a 5th name.',
      errorAr: 'تم اكتشاف تطابق في الاسم. يرجى إدخال اسم خامس لفض التشابه.',
    };
  }

  return {
    isValid: true,
    wordCount: words,
    requiredWordCount: requiredCount,
  };
}

/**
 * Validates an Arabic full name, ensuring Arabic script and 4 words.
 */
export function validateArabicName(
  name: string,
  targetWordCount = 4
): NameValidationResult {
  const trimmed = name.trim();
  const words = countWords(trimmed);
  const minRequired = Math.max(4, targetWordCount);

  if (!trimmed) {
    return {
      isValid: false,
      wordCount: 0,
      requiredWordCount: minRequired,
      error: 'Please enter your full name in Arabic',
      errorAr: 'يرجى إدخال الاسم باللغة العربية',
    };
  }

  if (!ARABIC_NAME_REGEX.test(trimmed)) {
    return {
      isValid: false,
      wordCount: words,
      requiredWordCount: minRequired,
      error: 'Please use Arabic characters only',
      errorAr: 'يرجى استخدام الحروف العربية فقط',
    };
  }

  if (words < 4) {
    return {
      isValid: false,
      wordCount: words,
      requiredWordCount: 4,
      error: 'Please enter your full four-part name in Arabic',
      errorAr: 'يرجى إدخال الاسم الرباعي بالكامل باللغة العربية',
    };
  }

  return {
    isValid: true,
    wordCount: words,
    requiredWordCount: minRequired,
  };
}