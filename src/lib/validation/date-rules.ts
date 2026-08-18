/**
 * Date of Birth Validation Utility
 *
 * Checks:
 * 1) The input contains valid numerical calendar dates (including leap years and month lengths).
 * 2) The date is not in the future.
 * 3) The date is not more than 120 years in the past.
 */

export interface DateValidationResult {
  isValid: boolean;
  error?: string;
  errorAr?: string;
  age?: number;
}

/**
 * Checks if a given year is a leap year.
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Returns the maximum number of days in a given month of a specific year.
 */
export function getDaysInMonth(year: number, month: number): number {
  switch (month) {
    case 2:
      return isLeapYear(year) ? 29 : 28;
    case 4:
    case 6:
    case 9:
    case 11:
      return 30;
    default:
      return 31;
  }
}

/**
 * Validates a birthday string (expected in ISO 'YYYY-MM-DD' or numerical components).
 */
export function validateBirthday(
  dateString: string,
  minAge: number = 0,
  maxAge: number = 120
): DateValidationResult {
  const trimmed = (dateString || '').trim();

  if (!trimmed) {
    return {
      isValid: false,
      error: 'Please enter your date of birth.',
      errorAr: 'يرجى إدخال تاريخ الميلاد.',
    };
  }

  // 1) Verify format YYYY-MM-DD
  const dateRegex = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
  const match = trimmed.match(dateRegex);

  if (!match) {
    return {
      isValid: false,
      error: 'Invalid date format. Please use YYYY-MM-DD.',
      errorAr: 'تنسيق التاريخ غير صحيح. يرجى استخدام YYYY-MM-DD.',
    };
  }

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);

  // 1b) Verify numerical calendar limits
  if (month < 1 || month > 12) {
    return {
      isValid: false,
      error: 'Invalid month. Month must be between 1 and 12.',
      errorAr: 'الشهر غير صحيح. يجب أن يكون بين 1 و 12.',
    };
  }

  const maxDays = getDaysInMonth(year, month);
  if (day < 1 || day > maxDays) {
    return {
      isValid: false,
      error: `Invalid day for ${month}/${year}. Must be between 1 and ${maxDays}.`,
      errorAr: `اليوم غير صحيح للشهر ${month}/${year}. يجب أن يكون بين 1 و ${maxDays}.`,
    };
  }

  // Construct target Date object at UTC midnight for accurate calendar comparison
  const birthDate = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 2) Check: Date is not in the future
  if (birthDate > today) {
    return {
      isValid: false,
      error: 'Date of birth cannot be in the future.',
      errorAr: 'لا يمكن أن يكون تاريخ الميلاد في المستقبل.',
    };
  }

  // Calculate exact age in years
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  // 3) Check: Date is not more than 120 years in the past
  if (age > maxAge) {
    return {
      isValid: false,
      error: `Date of birth cannot be more than ${maxAge} years in the past.`,
      errorAr: `لا يمكن أن يكون تاريخ الميلاد أقدم من ${maxAge} عاماً.`,
      age,
    };
  }

  if (age < minAge) {
    return {
      isValid: false,
      error: `Age must be at least ${minAge} years old.`,
      errorAr: `يجب أن يكون العمر على الأقل ${minAge} سنة.`,
      age,
    };
  }

  return {
    isValid: true,
    age,
  };
}
