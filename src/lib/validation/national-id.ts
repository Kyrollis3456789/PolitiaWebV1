export interface NationalIdParsedData {
  century: number;
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthDateString: string; // YYYY-MM-DD
  provinceCode: string;
  provinceNameEn: string;
  provinceNameAr: string;
  gender: 'Male' | 'Female';
  sequenceNumber: string;
  checksumDigit: string;
}

export interface NationalIdValidationResult {
  isValid: boolean;
  error?: string;
  parsedData?: NationalIdParsedData;
}

export const EGYPT_PROVINCE_CODES: Record<
  string,
  { en: string; ar: string }
> = {
  '01': { en: 'Cairo', ar: 'القاهرة' },
  '02': { en: 'Alexandria', ar: 'الإسكندرية' },
  '03': { en: 'Port Said', ar: 'بورسعيد' },
  '04': { en: 'Suez', ar: 'السويس' },
  '11': { en: 'Damietta', ar: 'دمياط' },
  '12': { en: 'Dakahlia', ar: 'الدقهلية' },
  '13': { en: 'Ash Sharqia', ar: 'الشرقية' },
  '14': { en: 'Al Qalyubia', ar: 'القليوبية' },
  '15': { en: 'Kafr El Sheikh', ar: 'كفر الشيخ' },
  '16': { en: 'Gharbia', ar: 'الغربية' },
  '17': { en: 'Monufia', ar: 'المنوفية' },
  '18': { en: 'El Beheira', ar: 'البحيرة' },
  '19': { en: 'Ismailia', ar: 'الإسماعيلية' },
  '21': { en: 'Giza', ar: 'الجيزة' },
  '22': { en: 'Beni Suef', ar: 'بني سويف' },
  '23': { en: 'Faiyum', ar: 'الفيوم' },
  '24': { en: 'Minya', ar: 'المنيا' },
  '25': { en: 'Asyut', ar: 'أسيوط' },
  '26': { en: 'Sohag', ar: 'سوهاج' },
  '27': { en: 'Qena', ar: 'قنا' },
  '28': { en: 'Aswan', ar: 'أسوان' },
  '29': { en: 'Luxor', ar: 'الأقصر' },
  '31': { en: 'Red Sea', ar: 'البحر الأحمر' },
  '32': { en: 'New Valley', ar: 'الوادي الجديد' },
  '33': { en: 'Matrouh', ar: 'مطروح' },
  '34': { en: 'North Sinai', ar: 'شمال سيناء' },
  '35': { en: 'South Sinai', ar: 'جنوب سيناء' },
  '88': { en: 'Born Abroad', ar: 'خارج الجمهورية' },
};

/**
 * Parses and cross-validates a 14-digit Egyptian National ID against optional expected DOB and Gender.
 */
export function validateEgyptianNationalId(
  nationalId: string,
  expectedDob?: string, // YYYY-MM-DD
  expectedGender?: 'Male' | 'Female'
): NationalIdValidationResult {
  const cleanId = nationalId.trim();

  // Basic Format Check: 14 numeric digits starting with 2 or 3
  if (!/^[23]\d{13}$/.test(cleanId)) {
    return {
      isValid: false,
      error: 'National ID must be exactly 14 numeric digits starting with 2 or 3.',
    };
  }

  const centuryDigit = parseInt(cleanId.charAt(0), 10);
  const century = centuryDigit === 2 ? 1900 : 2000;

  const yearPart = parseInt(cleanId.substring(1, 3), 10);
  const monthPart = parseInt(cleanId.substring(3, 5), 10);
  const dayPart = parseInt(cleanId.substring(5, 7), 10);

  const fullYear = century + yearPart;
  const monthString = monthPart.toString().padStart(2, '0');
  const dayString = dayPart.toString().padStart(2, '0');
  const birthDateString = `${fullYear}-${monthString}-${dayString}`;

  // Validate extracted calendar date
  if (monthPart < 1 || monthPart > 12 || dayPart < 1 || dayPart > 31) {
    return {
      isValid: false,
      error: 'Invalid birth date encoded inside the National ID.',
    };
  }

  const parsedDate = new Date(fullYear, monthPart - 1, dayPart);
  if (
    parsedDate.getFullYear() !== fullYear ||
    parsedDate.getMonth() !== monthPart - 1 ||
    parsedDate.getDate() !== dayPart
  ) {
    return {
      isValid: false,
      error: 'National ID contains a non-existent calendar date (e.g. invalid leap year/day).',
    };
  }

  // Validate Province Code (Digits 8-9)
  const provinceCode = cleanId.substring(7, 9);
  const province = EGYPT_PROVINCE_CODES[provinceCode];
  if (!province) {
    return {
      isValid: false,
      error: `Invalid Egyptian governorate/province code (${provinceCode}) in National ID.`,
    };
  }

  // Validate Gender Parity (Digit 13)
  const genderDigit = parseInt(cleanId.charAt(12), 10);
  const gender: 'Male' | 'Female' = genderDigit % 2 === 1 ? 'Male' : 'Female';

  const sequenceNumber = cleanId.substring(9, 13);
  const checksumDigit = cleanId.charAt(13);

  const parsedData: NationalIdParsedData = {
    century,
    birthYear: fullYear,
    birthMonth: monthPart,
    birthDay: dayPart,
    birthDateString,
    provinceCode,
    provinceNameEn: province.en,
    provinceNameAr: province.ar,
    gender,
    sequenceNumber,
    checksumDigit,
  };

  // Cross-verification with User-Provided Date of Birth
  if (expectedDob) {
    const normalizedExpected = expectedDob.split('T')[0];
    if (normalizedExpected !== birthDateString) {
      return {
        isValid: false,
        error: `Date of birth in National ID (${birthDateString}) does not match entered Date of Birth (${normalizedExpected}).`,
        parsedData,
      };
    }
  }

  // Cross-verification with User-Provided Gender
  if (expectedGender && expectedGender !== gender) {
    return {
      isValid: false,
      error: `Gender in National ID (${gender}) does not match selected Gender (${expectedGender}).`,
      parsedData,
    };
  }

  return {
    isValid: true,
    parsedData,
  };
}