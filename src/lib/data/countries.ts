export interface CountryInfo {
  iso: string;
  nameEn: string;
  nameAr: string;
  dialCode: string;
  flag: string;
  placeholder: string;
}

export const ALL_COUNTRIES: CountryInfo[] = [
  // Common / Middle East / North Africa first for fast access
  { iso: 'EG', nameEn: 'Egypt', nameAr: 'مصر', dialCode: '+20', flag: '🇪🇬', placeholder: '010 1234 5678' },
  { iso: 'SA', nameEn: 'Saudi Arabia', nameAr: 'المملكة العربية السعودية', dialCode: '+966', flag: '🇸🇦', placeholder: '050 123 4567' },
  { iso: 'AE', nameEn: 'United Arab Emirates', nameAr: 'الإمارات العربية المتحدة', dialCode: '+971', flag: '🇦🇪', placeholder: '050 123 4567' },
  { iso: 'KW', nameEn: 'Kuwait', nameAr: 'الكويت', dialCode: '+965', flag: '🇰🇼', placeholder: '9012 3456' },
  { iso: 'QA', nameEn: 'Qatar', nameAr: 'قطر', dialCode: '+974', flag: '🇶🇦', placeholder: '3312 3456' },
  { iso: 'BH', nameEn: 'Bahrain', nameAr: 'البحرين', dialCode: '+973', flag: '🇧🇭', placeholder: '3912 3456' },
  { iso: 'OM', nameEn: 'Oman', nameAr: 'عمان', dialCode: '+968', flag: '🇴🇲', placeholder: '9123 4567' },
  { iso: 'JO', nameEn: 'Jordan', nameAr: 'الأردن', dialCode: '+962', flag: '🇯🇴', placeholder: '07 9123 4567' },
  { iso: 'LB', nameEn: 'Lebanon', nameAr: 'لبنان', dialCode: '+961', flag: '🇱🇧', placeholder: '70 123 456' },
  { iso: 'IQ', nameEn: 'Iraq', nameAr: 'العراق', dialCode: '+964', flag: '🇮🇶', placeholder: '0790 123 4567' },
  { iso: 'SY', nameEn: 'Syria', nameAr: 'سوريا', dialCode: '+963', flag: '🇸🇾', placeholder: '0944 123 456' },
  { iso: 'PS', nameEn: 'Palestine', nameAr: 'فلسطين', dialCode: '+970', flag: '🇵🇸', placeholder: '059 123 4567' },
  { iso: 'SD', nameEn: 'Sudan', nameAr: 'السودان', dialCode: '+249', flag: '🇸🇩', placeholder: '091 234 5678' },
  { iso: 'LY', nameEn: 'Libya', nameAr: 'ليبيا', dialCode: '+218', flag: '🇱🇾', placeholder: '091 234 5678' },
  { iso: 'TN', nameEn: 'Tunisia', nameAr: 'تونس', dialCode: '+216', flag: '🇹🇳', placeholder: '98 123 456' },
  { iso: 'DZ', nameEn: 'Algeria', nameAr: 'الجزائر', dialCode: '+213', flag: '🇩🇿', placeholder: '0551 23 45 67' },
  { iso: 'MA', nameEn: 'Morocco', nameAr: 'المغرب', dialCode: '+212', flag: '🇲🇦', placeholder: '0661 23 45 67' },
  { iso: 'YE', nameEn: 'Yemen', nameAr: 'اليمن', dialCode: '+967', flag: '🇾🇪', placeholder: '771 234 567' },

  // North America
  { iso: 'US', nameEn: 'United States', nameAr: 'الولايات المتحدة', dialCode: '+1', flag: '🇺🇸', placeholder: '(555) 000-0000' },
  { iso: 'CA', nameEn: 'Canada', nameAr: 'كندا', dialCode: '+1', flag: '🇨🇦', placeholder: '(555) 000-0000' },
  { iso: 'MX', nameEn: 'Mexico', nameAr: 'المكسيك', dialCode: '+52', flag: '🇲🇽', placeholder: '55 1234 5678' },

  // Europe
  { iso: 'GB', nameEn: 'United Kingdom', nameAr: 'المملكة المتحدة', dialCode: '+44', flag: '🇬🇧', placeholder: '07123 456789' },
  { iso: 'DE', nameEn: 'Germany', nameAr: 'ألمانيا', dialCode: '+49', flag: '🇩🇪', placeholder: '0151 12345678' },
  { iso: 'FR', nameEn: 'France', nameAr: 'فرنسا', dialCode: '+33', flag: '🇫🇷', placeholder: '06 12 34 56 78' },
  { iso: 'IT', nameEn: 'Italy', nameAr: 'إيطاليا', dialCode: '+39', flag: '🇮🇹', placeholder: '333 123 4567' },
  { iso: 'ES', nameEn: 'Spain', nameAr: 'إسبانيا', dialCode: '+34', flag: '🇪🇸', placeholder: '612 34 56 78' },
  { iso: 'NL', nameEn: 'Netherlands', nameAr: 'هولندا', dialCode: '+31', flag: '🇳🇱', placeholder: '06 12345678' },
  { iso: 'BE', nameEn: 'Belgium', nameAr: 'بلجيكا', dialCode: '+32', flag: '🇧🇪', placeholder: '0470 12 34 56' },
  { iso: 'CH', nameEn: 'Switzerland', nameAr: 'سويسرا', dialCode: '+41', flag: '🇨🇭', placeholder: '079 123 45 67' },
  { iso: 'AT', nameEn: 'Austria', nameAr: 'النمسا', dialCode: '+43', flag: '🇦🇹', placeholder: '0664 1234567' },
  { iso: 'SE', nameEn: 'Sweden', nameAr: 'السويد', dialCode: '+46', flag: '🇸🇪', placeholder: '070 123 45 67' },
  { iso: 'NO', nameEn: 'Norway', nameAr: 'النرويج', dialCode: '+47', flag: '🇳🇴', placeholder: '412 34 567' },
  { iso: 'DK', nameEn: 'Denmark', nameAr: 'الدنمارك', dialCode: '+45', flag: '🇩🇰', placeholder: '20 12 34 56' },
  { iso: 'FI', nameEn: 'Finland', nameAr: 'فنلندا', dialCode: '+358', flag: '🇫🇮', placeholder: '040 1234567' },
  { iso: 'IE', nameEn: 'Ireland', nameAr: 'أيرلندا', dialCode: '+353', flag: '🇮🇪', placeholder: '085 123 4567' },
  { iso: 'GR', nameEn: 'Greece', nameAr: 'اليونان', dialCode: '+30', flag: '🇬🇷', placeholder: '691 234 5678' },
  { iso: 'CY', nameEn: 'Cyprus', nameAr: 'قبرص', dialCode: '+357', flag: '🇨🇾', placeholder: '99 123456' },
  { iso: 'PT', nameEn: 'Portugal', nameAr: 'البرتغال', dialCode: '+351', flag: '🇵🇹', placeholder: '912 345 678' },
  { iso: 'PL', nameEn: 'Poland', nameAr: 'بولندا', dialCode: '+48', flag: '🇵🇱', placeholder: '512 345 678' },
  { iso: 'CZ', nameEn: 'Czech Republic', nameAr: 'التشيك', dialCode: '+420', flag: '🇨🇿', placeholder: '601 123 456' },
  { iso: 'HU', nameEn: 'Hungary', nameAr: 'المجر', dialCode: '+36', flag: '🇭🇺', placeholder: '20 123 4567' },
  { iso: 'RO', nameEn: 'Romania', nameAr: 'رومانيا', dialCode: '+40', flag: '🇷🇴', placeholder: '0712 345 678' },
  { iso: 'RU', nameEn: 'Russia', nameAr: 'روسيا', dialCode: '+7', flag: '🇷🇺', placeholder: '912 345-67-89' },
  { iso: 'UA', nameEn: 'Ukraine', nameAr: 'أوكرانيا', dialCode: '+380', flag: '🇺🇦', placeholder: '50 123 4567' },
  { iso: 'TR', nameEn: 'Turkey', nameAr: 'تركيا', dialCode: '+90', flag: '🇹🇷', placeholder: '501 234 56 78' },

  // Asia & Oceania
  { iso: 'AU', nameEn: 'Australia', nameAr: 'أستراليا', dialCode: '+61', flag: '🇦🇺', placeholder: '0412 345 678' },
  { iso: 'NZ', nameEn: 'New Zealand', nameAr: 'نيوزيلندا', dialCode: '+64', flag: '🇳🇿', placeholder: '021 123 4567' },
  { iso: 'CN', nameEn: 'China', nameAr: 'الصين', dialCode: '+86', flag: '🇨🇳', placeholder: '138 0000 0000' },
  { iso: 'JP', nameEn: 'Japan', nameAr: 'اليابان', dialCode: '+81', flag: '🇯🇵', placeholder: '090-1234-5678' },
  { iso: 'KR', nameEn: 'South Korea', nameAr: 'كوريا الجنوبية', dialCode: '+82', flag: '🇰🇷', placeholder: '010-1234-5678' },
  { iso: 'IN', nameEn: 'India', nameAr: 'الهند', dialCode: '+91', flag: '🇮🇳', placeholder: '98123 45678' },
  { iso: 'PK', nameEn: 'Pakistan', nameAr: 'باكستان', dialCode: '+92', flag: '🇵🇰', placeholder: '0300 1234567' },
  { iso: 'BD', nameEn: 'Bangladesh', nameAr: 'بنغلاديش', dialCode: '+880', flag: '🇧🇩', placeholder: '01712-345678' },
  { iso: 'ID', nameEn: 'Indonesia', nameAr: 'إندونيسيا', dialCode: '+62', flag: '🇮🇩', placeholder: '0812-3456-789' },
  { iso: 'MY', nameEn: 'Malaysia', nameAr: 'ماليزيا', dialCode: '+60', flag: '🇲🇾', placeholder: '012-345 6789' },
  { iso: 'SG', nameEn: 'Singapore', nameAr: 'سنغافورة', dialCode: '+65', flag: '🇸🇬', placeholder: '8123 4567' },
  { iso: 'TH', nameEn: 'Thailand', nameAr: 'تايلاند', dialCode: '+66', flag: '🇹🇭', placeholder: '081 234 5678' },
  { iso: 'PH', nameEn: 'Philippines', nameAr: 'الفلبين', dialCode: '+63', flag: '🇵🇭', placeholder: '0917 123 4567' },
  { iso: 'VN', nameEn: 'Vietnam', nameAr: 'فيتنام', dialCode: '+84', flag: '🇻🇳', placeholder: '091 234 56 78' },

  // Africa
  { iso: 'ET', nameEn: 'Ethiopia', nameAr: 'إثيوبيا', dialCode: '+251', flag: '🇪🇹', placeholder: '091 123 4567' },
  { iso: 'ER', nameEn: 'Eritrea', nameAr: 'إريتريا', dialCode: '+291', flag: '🇪🇷', placeholder: '07 123 456' },
  { iso: 'NG', nameEn: 'Nigeria', nameAr: 'نيجيريا', dialCode: '+234', flag: '🇳🇬', placeholder: '0802 123 4567' },
  { iso: 'ZA', nameEn: 'South Africa', nameAr: 'جنوب أفريقيا', dialCode: '+27', flag: '🇿🇦', placeholder: '082 123 4567' },
  { iso: 'KE', nameEn: 'Kenya', nameAr: 'كينيا', dialCode: '+254', flag: '🇰🇪', placeholder: '0712 345678' },
  { iso: 'GH', nameEn: 'Ghana', nameAr: 'غانا', dialCode: '+233', flag: '🇬🇭', placeholder: '024 123 4567' },
  { iso: 'UG', nameEn: 'Uganda', nameAr: 'أوغندا', dialCode: '+256', flag: '🇺🇬', placeholder: '0772 123456' },
  { iso: 'TZ', nameEn: 'Tanzania', nameAr: 'تنزانيا', dialCode: '+255', flag: '🇹🇿', placeholder: '0712 345 678' },

  // South America
  { iso: 'BR', nameEn: 'Brazil', nameAr: 'البرازيل', dialCode: '+55', flag: '🇧🇷', placeholder: '(11) 91234-5678' },
  { iso: 'AR', nameEn: 'Argentina', nameAr: 'الأرجنتين', dialCode: '+54', flag: '🇦🇷', placeholder: '11 1234-5678' },
  { iso: 'CL', nameEn: 'Chile', nameAr: 'تشيلي', dialCode: '+56', flag: '🇨🇱', placeholder: '9 1234 5678' },
  { iso: 'CO', nameEn: 'Colombia', nameAr: 'كولومبيا', dialCode: '+57', flag: '🇨🇴', placeholder: '300 123 4567' },
  { iso: 'PE', nameEn: 'Peru', nameAr: 'بيرو', dialCode: '+51', flag: '🇵🇪', placeholder: '912 345 678' },
];

export function getCountryByIso(iso: string): CountryInfo {
  return ALL_COUNTRIES.find((c) => c.iso.toUpperCase() === iso.toUpperCase()) || ALL_COUNTRIES[0];
}

export function getCountryByDialCode(dialCode: string): CountryInfo {
  return ALL_COUNTRIES.find((c) => c.dialCode === dialCode) || ALL_COUNTRIES[0];
}
