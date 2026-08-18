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

  if (words < requiredCount) {
    const remaining = requiredCount - words;
    const nameLabel = words === 1 ? 'name' : 'names';
    const remLabel = remaining === 1 ? 'name' : 'names';
    const errorMsg = `You entered ${words} ${nameLabel}. Please enter ${remaining} more ${remLabel} to make it a ${requiredCount}-part name.`;

    let errorArMsg = '';
    if (words === 1) {
      errorArMsg = `لقد أدخلت اسماً واحداً. يرجى إدخال ${remaining} أسماء أخرى ليكون الاسم ${requiredCount === 5 ? 'خماسياً' : 'رباعياً'}.`;
    } else if (words === 2) {
      errorArMsg = `لقد أدخلت اسمين. يرجى إدخال ${remaining} ${remaining === 2 ? 'اسمين آخرين' : 'أسماء أخرى'} ليكون الاسم ${requiredCount === 5 ? 'خماسياً' : 'رباعياً'}.`;
    } else if (words === 3) {
      errorArMsg = `لقد أدخلت 3 أسماء. يرجى إدخال ${remaining} ${remaining === 1 ? 'اسم واحد آخر' : 'اسمين آخرين'} ليكون الاسم ${requiredCount === 5 ? 'خماسياً' : 'رباعياً'}.`;
    } else if (words === 4 && requiredCount === 5) {
      errorArMsg = `لقد أدخلت 4 أسماء. يرجى إدخال اسم واحد آخر ليكون الاسم خماسياً.`;
    }

    return {
      isValid: false,
      wordCount: words,
      requiredWordCount: requiredCount,
      error: errorMsg,
      errorAr: errorArMsg || `يرجى إدخال الاسم الرباعي بالكامل`,
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

  if (words < minRequired) {
    const remaining = minRequired - words;
    const nameLabel = words === 1 ? 'name' : 'names';
    const remLabel = remaining === 1 ? 'name' : 'names';
    const errorMsg = `You entered ${words} ${nameLabel}. Please enter ${remaining} more ${remLabel} to make it a ${minRequired}-part name in Arabic.`;

    let errorArMsg = '';
    if (words === 1) {
      errorArMsg = `لقد أدخلت اسماً واحداً. يرجى إدخال ${remaining} أسماء أخرى باللغة العربية ليكون الاسم ${minRequired === 5 ? 'خماسياً' : 'رباعياً'}.`;
    } else if (words === 2) {
      errorArMsg = `لقد أدخلت اسمين. يرجى إدخال ${remaining} ${remaining === 2 ? 'اسمين آخرين' : 'أسماء أخرى'} باللغة العربية ليكون الاسم ${minRequired === 5 ? 'خماسياً' : 'رباعياً'}.`;
    } else if (words === 3) {
      errorArMsg = `لقد أدخلت 3 أسماء. يرجى إدخال ${remaining} ${remaining === 1 ? 'اسم واحد آخر' : 'اسمين آخرين'} باللغة العربية ليكون الاسم ${minRequired === 5 ? 'خماسياً' : 'رباعياً'}.`;
    } else if (words === 4 && minRequired === 5) {
      errorArMsg = `لقد أدخلت 4 أسماء. يرجى إدخال اسم واحد آخر باللغة العربية ليكون الاسم خماسياً.`;
    }

    return {
      isValid: false,
      wordCount: words,
      requiredWordCount: minRequired,
      error: errorMsg,
      errorAr: errorArMsg || `يرجى إدخال الاسم الرباعي بالكامل باللغة العربية`,
    };
  }

  return {
    isValid: true,
    wordCount: words,
    requiredWordCount: minRequired,
  };
}