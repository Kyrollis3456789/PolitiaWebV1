/**
 * Global Phone Number & Numeric Validation Rules for all countries and locales.
 */

// Mapping of Eastern Arabic & Persian numerals to Western digits
const ARABIC_INDIC_DIGITS: Record<string, string> = {
  '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
  '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
  '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
  '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
};

/**
 * Normalizes Eastern Arabic (٠-٩) and Persian (۰-۹) digits into standard ASCII (0-9).
 */
export function normalizeDigits(input: string): string {
  if (!input) return '';
  return input.replace(/[٠-٩۰-۹]/g, (char) => ARABIC_INDIC_DIGITS[char] || char);
}

export interface CountryPhoneRule {
  iso: string;
  nameEn: string;
  dialCode: string;
  minLength: number;
  maxLength: number;
  regex: RegExp;
  example: string;
  errorEn: string;
  errorAr: string;
}

export const COUNTRY_PHONE_RULES: Record<string, CountryPhoneRule> = {
  EG: {
    iso: 'EG',
    nameEn: 'Egypt',
    dialCode: '+20',
    minLength: 10,
    maxLength: 11,
    // 010, 011, 012, 015 followed by 8 digits (or 10 digits without leading 0)
    regex: /^(010|011|012|015)\d{8}$|^1[0125]\d{8}$/,
    example: '010 1234 5678',
    errorEn: 'Please enter a valid Egyptian mobile number (11 digits starting with 010, 011, 012, or 015)',
    errorAr: 'يرجى إدخال رقم محمول مصري صحيح (11 رقماً يبدأ بـ 010، 011، 012، أو 015)',
  },
  SA: {
    iso: 'SA',
    nameEn: 'Saudi Arabia',
    dialCode: '+966',
    minLength: 9,
    maxLength: 10,
    // 05XXXXXXXX or 5XXXXXXXX
    regex: /^(05|5)\d{8}$/,
    example: '050 123 4567',
    errorEn: 'Please enter a valid Saudi mobile number (9 digits starting with 5 or 05)',
    errorAr: 'يرجى إدخال رقم جوال سعودي صحيح (يبدأ بـ 05 أو 5 ومكون من 9 أرقام)',
  },
  AE: {
    iso: 'AE',
    nameEn: 'United Arab Emirates',
    dialCode: '+971',
    minLength: 9,
    maxLength: 10,
    // 050, 052, 054, 055, 056, 058
    regex: /^(05[024568]|5[024568])\d{7}$/,
    example: '050 123 4567',
    errorEn: 'Please enter a valid UAE mobile number (starting with 050, 052, 054, 055, 056, 058)',
    errorAr: 'يرجى إدخال رقم محمول إماراتي صحيح (يبدأ بـ 050 أو 052 أو 054 أو 055 أو 056 أو 058)',
  },
  KW: {
    iso: 'KW',
    nameEn: 'Kuwait',
    dialCode: '+965',
    minLength: 8,
    maxLength: 8,
    // 5, 6, 9 followed by 7 digits
    regex: /^[569]\d{7}$/,
    example: '9123 4567',
    errorEn: 'Please enter a valid Kuwaiti mobile number (8 digits starting with 5, 6, or 9)',
    errorAr: 'يرجى إدخال رقم هاتف كويتي صحيح (8 أرقام تبدأ بـ 5 أو 6 أو 9)',
  },
  QA: {
    iso: 'QA',
    nameEn: 'Qatar',
    dialCode: '+974',
    minLength: 8,
    maxLength: 8,
    // 3, 5, 6, 7 followed by 7 digits
    regex: /^[3567]\d{7}$/,
    example: '5512 3456',
    errorEn: 'Please enter a valid Qatari mobile number (8 digits starting with 3, 5, 6, or 7)',
    errorAr: 'يرجى إدخال رقم جوال قطري صحيح (8 أرقام تبدأ بـ 3 أو 5 أو 6 أو 7)',
  },
  JO: {
    iso: 'JO',
    nameEn: 'Jordan',
    dialCode: '+962',
    minLength: 9,
    maxLength: 10,
    // 077, 078, 079
    regex: /^(07[789]|7[789])\d{7}$/,
    example: '079 123 4567',
    errorEn: 'Please enter a valid Jordanian mobile number (starting with 077, 078, or 079)',
    errorAr: 'يرجى إدخال رقم هاتف أردني صحيح (يبدأ بـ 077 أو 078 أو 079)',
  },
  LB: {
    iso: 'LB',
    nameEn: 'Lebanon',
    dialCode: '+961',
    minLength: 7,
    maxLength: 8,
    regex: /^(03|3|70|71|76|78|79|81)\d{6}$/,
    example: '70 123 456',
    errorEn: 'Please enter a valid Lebanese mobile number',
    errorAr: 'يرجى إدخال رقم هاتف لبناني صحيح',
  },
  US: {
    iso: 'US',
    nameEn: 'United States',
    dialCode: '+1',
    minLength: 10,
    maxLength: 10,
    // 10 digits, area code 2-9, exchange 2-9
    regex: /^[2-9]\d{2}[2-9]\d{6}$/,
    example: '202 555 0123',
    errorEn: 'Please enter a valid 10-digit US phone number (Area code + 7 digits)',
    errorAr: 'يرجى إدخال رقم هاتف أمريكي صحيح مكون من 10 أرقام',
  },
  CA: {
    iso: 'CA',
    nameEn: 'Canada',
    dialCode: '+1',
    minLength: 10,
    maxLength: 10,
    regex: /^[2-9]\d{2}[2-9]\d{6}$/,
    example: '416 555 0123',
    errorEn: 'Please enter a valid 10-digit Canadian phone number',
    errorAr: 'يرجى إدخال رقم هاتف كندي صحيح مكون من 10 أرقام',
  },
  GB: {
    iso: 'GB',
    nameEn: 'United Kingdom',
    dialCode: '+44',
    minLength: 10,
    maxLength: 11,
    // Starts with 07 or 7 followed by 9 digits
    regex: /^(07\d{9}|7\d{9})$/,
    example: '07911 123456',
    errorEn: 'Please enter a valid UK mobile number (starting with 07)',
    errorAr: 'يرجى إدخال رقم هاتف بريطاني صحيح (يبدأ بـ 07)',
  },
  DE: {
    iso: 'DE',
    nameEn: 'Germany',
    dialCode: '+49',
    minLength: 10,
    maxLength: 12,
    // Mobile starts with 15, 16, 17
    regex: /^(01[567]\d{7,9}|1[567]\d{7,9})$/,
    example: '0151 23456789',
    errorEn: 'Please enter a valid German mobile number (starting with 015, 016, or 017)',
    errorAr: 'يرجى إدخال رقم هاتف ألماني صحيح (يبدأ بـ 015 أو 016 أو 017)',
  },
  FR: {
    iso: 'FR',
    nameEn: 'France',
    dialCode: '+33',
    minLength: 9,
    maxLength: 10,
    // Mobile starts with 06 or 07
    regex: /^(0[67]\d{8}|[67]\d{8})$/,
    example: '06 12 34 56 78',
    errorEn: 'Please enter a valid French mobile number (starting with 06 or 07)',
    errorAr: 'يرجى إدخال رقم هاتف فرنسي صحيح (يبدأ بـ 06 أو 07)',
  },
  IT: {
    iso: 'IT',
    nameEn: 'Italy',
    dialCode: '+39',
    minLength: 9,
    maxLength: 10,
    // Mobile starts with 3
    regex: /^3\d{8,9}$/,
    example: '312 3456789',
    errorEn: 'Please enter a valid Italian mobile number (starting with 3)',
    errorAr: 'يرجى إدخال رقم هاتف إيطالي صحيح (يبدأ بـ 3 ومكون من 9-10 أرقام)',
  },
  ES: {
    iso: 'ES',
    nameEn: 'Spain',
    dialCode: '+34',
    minLength: 9,
    maxLength: 9,
    // Mobile starts with 6 or 7
    regex: /^[67]\d{8}$/,
    example: '612 34 56 78',
    errorEn: 'Please enter a valid Spanish mobile number (9 digits starting with 6 or 7)',
    errorAr: 'يرجى إدخال رقم هاتف إسباني صحيح (9 أرقام تبدأ بـ 6 أو 7)',
  },
  GR: {
    iso: 'GR',
    nameEn: 'Greece',
    dialCode: '+30',
    minLength: 10,
    maxLength: 10,
    // Mobile starts with 69
    regex: /^69\d{8}$/,
    example: '691 234 5678',
    errorEn: 'Please enter a valid Greek mobile number (10 digits starting with 69)',
    errorAr: 'يرجى إدخال رقم هاتف يوناني صحيح (10 أرقام تبدأ بـ 69)',
  },
  RU: {
    iso: 'RU',
    nameEn: 'Russia',
    dialCode: '+7',
    minLength: 10,
    maxLength: 10,
    // Mobile starts with 9
    regex: /^9\d{9}$/,
    example: '912 345 67 89',
    errorEn: 'Please enter a valid Russian mobile number (10 digits starting with 9)',
    errorAr: 'يرجى إدخال رقم هاتف روسي صحيح (10 أرقام تبدأ بـ 9)',
  },
  AU: {
    iso: 'AU',
    nameEn: 'Australia',
    dialCode: '+61',
    minLength: 9,
    maxLength: 10,
    // Mobile starts with 04 or 4
    regex: /^(04|4)\d{8}$/,
    example: '0412 345 678',
    errorEn: 'Please enter a valid Australian mobile number (starting with 04)',
    errorAr: 'يرجى إدخال رقم هاتف أسترالي صحيح (يبدأ بـ 04)',
  },
  IN: {
    iso: 'IN',
    nameEn: 'India',
    dialCode: '+91',
    minLength: 10,
    maxLength: 10,
    // 10 digits starting with 6, 7, 8, 9
    regex: /^[6-9]\d{9}$/,
    example: '98765 43210',
    errorEn: 'Please enter a valid Indian mobile number (10 digits starting with 6, 7, 8, or 9)',
    errorAr: 'يرجى إدخال رقم هاتف هندي صحيح (10 أرقام تبدأ بـ 6، 7، 8، أو 9)',
  },
  CN: {
    iso: 'CN',
    nameEn: 'China',
    dialCode: '+86',
    minLength: 11,
    maxLength: 11,
    // Mobile starts with 1 followed by 10 digits
    regex: /^1[3-9]\d{9}$/,
    example: '138 0013 8000',
    errorEn: 'Please enter a valid Chinese mobile number (11 digits starting with 1)',
    errorAr: 'يرجى إدخال رقم هاتف صيني صحيح (11 رقماً يبدأ بـ 1)',
  },
  JP: {
    iso: 'JP',
    nameEn: 'Japan',
    dialCode: '+81',
    minLength: 10,
    maxLength: 11,
    // Mobile starts with 070, 080, 090
    regex: /^(0[789]0\d{8}|[789]0\d{8})$/,
    example: '090 1234 5678',
    errorEn: 'Please enter a valid Japanese mobile number (starting with 070, 080, or 090)',
    errorAr: 'يرجى إدخال رقم هاتف ياباني صحيح (يبدأ بـ 070 أو 080 أو 090)',
  },
  BR: {
    iso: 'BR',
    nameEn: 'Brazil',
    dialCode: '+55',
    minLength: 10,
    maxLength: 11,
    // Area code + 9 digits (or 8 for landlines)
    regex: /^[1-9]{2}9?\d{8}$/,
    example: '11 91234 5678',
    errorEn: 'Please enter a valid Brazilian mobile number (Area code + 9 digits)',
    errorAr: 'يرجى إدخال رقم هاتف برازيلي صحيح (كود المنطقة + 9 أرقام)',
  },
};

export interface PhoneValidationResult {
  isValid: boolean;
  cleanNumber: string;
  normalizedInput: string;
  errorEn?: string;
  errorAr?: string;
  error?: string;
}

/**
 * Validates any phone number according to country rules, normalizing all Eastern & Western digits.
 */
export function validatePhoneNumber(
  rawInput: string,
  countryIso: string,
  countryDialCode: string,
  isRtl: boolean = false
): PhoneValidationResult {
  const normalized = normalizeDigits(rawInput.trim());
  const cleanDigits = normalized.replace(/\D/g, '');

  if (!cleanDigits) {
    const errorEn = 'Please enter your mobile phone number';
    const errorAr = 'يرجى إدخال رقم الهاتف المحمول';
    return {
      isValid: false,
      cleanNumber: '',
      normalizedInput: '',
      errorEn,
      errorAr,
      error: isRtl ? errorAr : errorEn,
    };
  }

  const rule = COUNTRY_PHONE_RULES[countryIso.toUpperCase()];

  if (rule) {
    const passes = rule.regex.test(cleanDigits);
    if (!passes) {
      return {
        isValid: false,
        cleanNumber: cleanDigits,
        normalizedInput: normalized,
        errorEn: rule.errorEn,
        errorAr: rule.errorAr,
        error: isRtl ? rule.errorAr : rule.errorEn,
      };
    }
    return {
      isValid: true,
      cleanNumber: cleanDigits,
      normalizedInput: normalized,
    };
  }

  // Universal international standard fallback (ITU-T E.164: 7 to 15 digits)
  if (cleanDigits.length < 7 || cleanDigits.length > 15) {
    const errorEn = `Please enter a valid phone number (7 to 15 digits for ${countryDialCode})`;
    const errorAr = `يرجى إدخال رقم هاتف صحيح (بين 7 إلى 15 رقماً لكود ${countryDialCode})`;
    return {
      isValid: false,
      cleanNumber: cleanDigits,
      normalizedInput: normalized,
      errorEn,
      errorAr,
      error: isRtl ? errorAr : errorEn,
    };
  }

  return {
    isValid: true,
    cleanNumber: cleanDigits,
    normalizedInput: normalized,
  };
}
