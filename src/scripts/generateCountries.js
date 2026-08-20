const fs = require('fs');
const path = require('path');

// 1. All countries list (ISO-2 code, English name, Arabic name)
const COUNTRIES = [
  { code: "AF", en: "Afghanistan", ar: "أفغانستان" },
  { code: "AL", en: "Albania", ar: "ألبانيا" },
  { code: "DZ", en: "Algeria", ar: "الجزائر" },
  { code: "AD", en: "Andorra", ar: "أندورا" },
  { code: "AO", en: "Angola", ar: "أنغولا" },
  { code: "AR", en: "Argentina", ar: "الأرجنتين" },
  { code: "AM", en: "Armenia", ar: "أرمينيا" },
  { code: "AU", en: "Australia", ar: "أستراليا" },
  { code: "AT", en: "Austria", ar: "النمسا" },
  { code: "AZ", en: "Azerbaijan", ar: "أذربيجان" },
  { code: "BH", en: "Bahrain", ar: "البحرين" },
  { code: "BD", en: "Bangladesh", ar: "بنغلاديش" },
  { code: "BY", en: "Belarus", ar: "بيلاروسيا" },
  { code: "BE", en: "Belgium", ar: "بلجيكا" },
  { code: "BO", en: "Bolivia", ar: "بوليفيا" },
  { code: "BA", en: "Bosnia and Herzegovina", ar: "البوسنة والهرسك" },
  { code: "BR", en: "Brazil", ar: "البرازيل" },
  { code: "BG", en: "Bulgaria", ar: "بلغاريا" },
  { code: "CA", en: "Canada", ar: "كندا" },
  { code: "CL", en: "Chile", ar: "تشيلي" },
  { code: "CN", en: "China", ar: "الصين" },
  { code: "CO", en: "Colombia", ar: "كولومبيا" },
  { code: "CR", en: "Costa Rica", ar: "كوستاريكا" },
  { code: "HR", en: "Croatia", ar: "كرواتيا" },
  { code: "CU", en: "Cuba", ar: "كوبا" },
  { code: "CY", en: "Cyprus", ar: "قبرص" },
  { code: "CZ", en: "Czech Republic", ar: "التشيك" },
  { code: "DK", en: "Denmark", ar: "الدنمارك" },
  { code: "DO", en: "Dominican Republic", ar: "جمهورية الدومينيكان" },
  { code: "EC", en: "Ecuador", ar: "الإكوادور" },
  { code: "EG", en: "Egypt", ar: "مصر" },
  { code: "SV", en: "El Salvador", ar: "السلفادور" },
  { code: "EE", en: "Estonia", ar: "إستونيا" },
  { code: "ET", en: "Ethiopia", ar: "إثيوبيا" },
  { code: "FI", en: "Finland", ar: "فنلندا" },
  { code: "FR", en: "France", ar: "فرنسا" },
  { code: "GE", en: "Georgia", ar: "جورجيا" },
  { code: "DE", en: "Germany", ar: "ألمانيا" },
  { code: "GR", en: "Greece", ar: "اليونان" },
  { code: "GT", en: "Guatemala", ar: "غواتيمالا" },
  { code: "HN", en: "Honduras", ar: "هندوراس" },
  { code: "HU", en: "Hungary", ar: "المجر" },
  { code: "IS", en: "Iceland", ar: "آيسلندا" },
  { code: "IN", en: "India", ar: "الهند" },
  { code: "ID", en: "Indonesia", ar: "إندونيسيا" },
  { code: "IR", en: "Iran", ar: "إيران" },
  { code: "IQ", en: "Iraq", ar: "العراق" },
  { code: "IE", en: "Ireland", ar: "أيرلندا" },
  { code: "IL", en: "Israel", ar: "إسرائيل" },
  { code: "IT", en: "Italy", ar: "إيطاليا" },
  { code: "JP", en: "Japan", ar: "اليابان" },
  { code: "JO", en: "Jordan", ar: "الأردن" },
  { code: "KZ", en: "Kazakhstan", ar: "كازاخستان" },
  { code: "KE", en: "Kenya", ar: "كينيا" },
  { code: "KW", en: "Kuwait", ar: "الكويت" },
  { code: "LV", en: "Latvia", ar: "لاتفيا" },
  { code: "LB", en: "Lebanon", ar: "لبنان" },
  { code: "LY", en: "Libya", ar: "ليبيا" },
  { code: "LT", en: "Lithuania", ar: "ليتوانيا" },
  { code: "LU", en: "Luxembourg", ar: "لوكسمبورغ" },
  { code: "MY", en: "Malaysia", ar: "ماليزيا" },
  { code: "MX", en: "Mexico", ar: "المكسيك" },
  { code: "MA", en: "Morocco", ar: "المغرب" },
  { code: "NL", en: "Netherlands", ar: "هولندا" },
  { code: "NZ", en: "New Zealand", ar: "نيوزيلندا" },
  { code: "NI", en: "Nicaragua", ar: "نيكاراغوا" },
  { code: "NG", en: "Nigeria", ar: "نيجيريا" },
  { code: "NO", en: "Norway", ar: "النرويج" },
  { code: "OM", en: "Oman", ar: "عُمان" },
  { code: "PK", en: "Pakistan", ar: "باكستان" },
  { code: "PS", en: "Palestine", ar: "فلسطين" },
  { code: "PA", en: "Panama", ar: "بنما" },
  { code: "PY", en: "Paraguay", ar: "باراغواي" },
  { code: "PE", en: "Peru", ar: "بيرو" },
  { code: "PH", en: "Philippines", ar: "الفلبين" },
  { code: "PL", en: "Poland", ar: "بولندا" },
  { code: "PT", en: "Portugal", ar: "البرتغال" },
  { code: "QA", en: "Qatar", ar: "قطر" },
  { code: "RO", en: "Romania", ar: "رومانيا" },
  { code: "RU", en: "Russia", ar: "روسيا" },
  { code: "SA", en: "Saudi Arabia", ar: "المملكة العربية السعودية" },
  { code: "SN", en: "Senegal", ar: "السنغال" },
  { code: "RS", en: "Serbia", ar: "صربيا" },
  { code: "SG", en: "Singapore", ar: "سنغافورة" },
  { code: "SK", en: "Slovakia", ar: "سلوفاكيا" },
  { code: "SI", en: "Slovenia", ar: "سلوفينيا" },
  { code: "ZA", en: "South Africa", ar: "جنوب إفريقيا" },
  { code: "KR", en: "South Korea", ar: "كوريا الجنوبية" },
  { code: "ES", en: "Spain", ar: "إسبانيا" },
  { code: "LK", en: "Sri Lanka", ar: "سريلانكا" },
  { code: "SD", en: "Sudan", ar: "السودان" },
  { code: "SE", en: "Sweden", ar: "السويد" },
  { code: "CH", en: "Switzerland", ar: "سويسرا" },
  { code: "SY", en: "Syria", ar: "سوريا" },
  { code: "TW", en: "Taiwan", ar: "تايوان" },
  { code: "TH", en: "Thailand", ar: "تايلاند" },
  { code: "TN", en: "Tunisia", ar: "تونس" },
  { code: "TR", en: "Turkey", ar: "تركيا" },
  { code: "UA", en: "Ukraine", ar: "أوكرانيا" },
  { code: "AE", en: "United Arab Emirates", ar: "الإمارات العربية المتحدة" },
  { code: "GB", en: "United Kingdom", ar: "المملكة المتحدة" },
  { code: "US", en: "United States", ar: "الولايات المتحدة الأمريكية" },
  { code: "UY", en: "Uruguay", ar: "أوروغواي" },
  { code: "UZ", en: "Uzbekistan", ar: "أوزبكستان" },
  { code: "VE", en: "Venezuela", ar: "فنزويلا" },
  { code: "VN", en: "Vietnam", ar: "فيتنام" },
  { code: "YE", en: "Yemen", ar: "اليمن" }
];

const messagesDir = path.resolve(__dirname, '../../messages');

function getLocalizedName(code, fallbackEn, fallbackAr, locale) {
  if (locale.startsWith('ar-')) {
    return fallbackAr || fallbackEn;
  }
  try {
    const displayNames = new Intl.DisplayNames([locale], { type: 'region' });
    const name = displayNames.of(code);
    if (name && name !== code) {
      return name;
    }
  } catch (e) {
    // ignore
  }
  return fallbackEn;
}

function run() {
  if (!fs.existsSync(messagesDir)) {
    console.error('messages directory not found:', messagesDir);
    process.exit(1);
  }

  const entries = fs.readdirSync(messagesDir, { withFileTypes: true });
  const languageDirs = entries.filter((e) => e.isDirectory()).map((e) => e.name);

  console.log(`Found ${languageDirs.length} language folders in messages.`);

  let totalUpdated = 0;

  for (const lang of languageDirs) {
    const langPath = path.join(messagesDir, lang);
    const countryMap = {};

    for (const c of COUNTRIES) {
      countryMap[c.code] = getLocalizedName(c.code, c.en, c.ar, lang);
    }

    // Write Countries.json
    const countriesFile = path.join(langPath, 'Countries.json');
    fs.writeFileSync(countriesFile, JSON.stringify(countryMap, null, 2), 'utf8');

    totalUpdated++;
  }

  console.log(`Successfully generated Countries.json in all ${totalUpdated} language directories!`);
}

run();
