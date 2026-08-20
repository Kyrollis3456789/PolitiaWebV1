const fs = require('fs');
const path = require('path');

// 1. Core database cities and prominent world cities (key/id, English name, Arabic name)
const WORLD_CITIES = [
  // Egyptian Cities
  { id: "cairo", en: "Cairo", ar: "القاهرة" },
  { id: "giza", en: "Giza", ar: "الجيزة" },
  { id: "alexandria", en: "Alexandria", ar: "الإسكندرية" },
  { id: "shubra_el_kheima", en: "Shubra El Kheima", ar: "شبرا الخيمة" },
  { id: "port_said", en: "Port Said", ar: "بورسعيد" },
  { id: "suez", en: "Suez", ar: "السويس" },
  { id: "luxor", en: "Luxor", ar: "الأقصر" },
  { id: "mansoura", en: "Mansoura", ar: "المنصورة" },
  { id: "tanta", en: "Tanta", ar: "طنطا" },
  { id: "assiut", en: "Assiut", ar: "أسيوط" },
  { id: "ismailia", en: "Ismailia", ar: "الإسماعيلية" },
  { id: "fayoum", en: "Faiyum", ar: "الفيوم" },
  { id: "zagazig", en: "Zagazig", ar: "الزقازيق" },
  { id: "damietta", en: "Damietta", ar: "دمياط" },
  { id: "aswan", en: "Aswan", ar: "أسوان" },
  { id: "minya", en: "Minya", ar: "المنيا" },
  { id: "damanhur", en: "Damanhur", ar: "دمنهور" },
  { id: "beni_suef", en: "Beni Suef", ar: "بني سويف" },
  { id: "hurghada", en: "Hurghada", ar: "الغردقة" },
  { id: "qena", en: "Qena", ar: "قنا" },
  { id: "sohag", en: "Sohag", ar: "سوهاج" },
  { id: "shibin_el_kom", en: "Shibin El Kom", ar: "شبين الكوم" },
  { id: "banha", en: "Banha", ar: "بنها" },
  { id: "kafr_el_sheikh", en: "Kafr El Sheikh", ar: "كفر الشيخ" },
  { id: "arish", en: "Arish", ar: "العريش" },
  { id: "mallawi", en: "Mallawi", ar: "ملوي" },
  { id: "10th_of_ramadan", en: "10th of Ramadan", ar: "العاشر من رمضان" },
  { id: "marsa_matruh", en: "Marsa Matruh", ar: "مرسى مطروح" },
  { id: "sharm_el_sheikh", en: "Sharm El Sheikh", ar: "شرم الشيخ" },
  { id: "6th_of_october", en: "6th of October", ar: "السادس من أكتوبر" },
  { id: "sheikh_zayed", en: "Sheikh Zayed", ar: "الشيخ زايد" },
  { id: "heliopolis", en: "Heliopolis", ar: "مصر الجديدة" },
  { id: "nasr_city", en: "Nasr City", ar: "مدينة نصر" },
  { id: "maadi", en: "Maadi", ar: "المعادي" },
  { id: "zamalek", en: "Zamalek", ar: "الزمالك" },
  { id: "dokki", en: "Dokki", ar: "الدقي" },
  { id: "mohandessin", en: "Mohandessin", ar: "المهندسين" },
  { id: "el_gouna", en: "El Gouna", ar: "الجونة" },
  { id: "new_cairo", en: "New Cairo", ar: "القاهرة الجديدة" },
  { id: "el_alamein", en: "El Alamein", ar: "العلمين" },
  { id: "dahab", en: "Dahab", ar: "دهب" },
  { id: "nuweiba", en: "Nuweiba", ar: "نويبع" },
  { id: "taba", en: "Taba", ar: "طابا" },
  { id: "siwa", en: "Siwa Oasis", ar: "سيوة" },

  // Arab Capitals & Major Cities
  { id: "riyadh", en: "Riyadh", ar: "الرياض" },
  { id: "jeddah", en: "Jeddah", ar: "جدة" },
  { id: "makkah", en: "Makkah", ar: "مكة المكرمة" },
  { id: "madinah", en: "Madinah", ar: "المدينة المنورة" },
  { id: "dammam", en: "Dammam", ar: "الدمام" },
  { id: "khobar", en: "Khobar", ar: "الخبر" },
  { id: "dubai", en: "Dubai", ar: "دبي" },
  { id: "abu_dhabi", en: "Abu Dhabi", ar: "أبو ظبي" },
  { id: "sharjah", en: "Sharjah", ar: "الشارقة" },
  { id: "ajman", en: "Ajman", ar: "عجمان" },
  { id: "al_ain", en: "Al Ain", ar: "العين" },
  { id: "kuwait_city", en: "Kuwait City", ar: "مدينة الكويت" },
  { id: "hawalli", en: "Hawalli", ar: "حولي" },
  { id: "salmiya", en: "Salmiya", ar: "السالمية" },
  { id: "doha", en: "Doha", ar: "الدوحة" },
  { id: "manama", en: "Manama", ar: "المنامة" },
  { id: "muscat", en: "Muscat", ar: "مسقط" },
  { id: "salalah", en: "Salalah", ar: "صلالة" },
  { id: "amman", en: "Amman", ar: "عمّان" },
  { id: "zarqa", en: "Zarqa", ar: "الزرقاء" },
  { id: "irbid", en: "Irbid", ar: "إربد" },
  { id: "aqaba", en: "Aqaba", ar: "العقبة" },
  { id: "beirut", en: "Beirut", ar: "بيروت" },
  { id: "tripoli_lb", en: "Tripoli (Lebanon)", ar: "طرابلس لبنان" },
  { id: "sidon", en: "Sidon", ar: "صيدا" },
  { id: "damascus", en: "Damascus", ar: "دمشق" },
  { id: "aleppo", en: "Aleppo", ar: "حلب" },
  { id: "homs", en: "Homs", ar: "حمص" },
  { id: "latakia", en: "Latakia", ar: "اللاذقية" },
  { id: "baghdad", en: "Baghdad", ar: "بغداد" },
  { id: "basra", en: "Basra", ar: "البصرة" },
  { id: "erbil", en: "Erbil", ar: "أربيل" },
  { id: "mosul", en: "Mosul", ar: "الموصل" },
  { id: "jerusalem", en: "Jerusalem", ar: "القدس" },
  { id: "gaza", en: "Gaza", ar: "غزة" },
  { id: "ramallah", en: "Ramallah", ar: "رام الله" },
  { id: "tripoli", en: "Tripoli", ar: "طرابلس" },
  { id: "benghazi", en: "Benghazi", ar: "بنغازي" },
  { id: "misrata", en: "Misrata", ar: "مصراتة" },
  { id: "tunis", en: "Tunis", ar: "تونس" },
  { id: "sfax", en: "Sfax", ar: "صفاقس" },
  { id: "sousse", en: "Sousse", ar: "سوسة" },
  { id: "algiers", en: "Algiers", ar: "الجزائر العاصمة" },
  { id: "oran", en: "Oran", ar: "وهران" },
  { id: "constantine", en: "Constantine", ar: "قسنطينة" },
  { id: "rabat", en: "Rabat", ar: "الرباط" },
  { id: "casablanca", en: "Casablanca", ar: "الدار البيضاء" },
  { id: "marrakech", en: "Marrakech", ar: "مراكش" },
  { id: "tangier", en: "Tangier", ar: "طنجة" },
  { id: "fes", en: "Fes", ar: "فاس" },
  { id: "khartoum", en: "Khartoum", ar: "الخرطوم" },
  { id: "omdurman", en: "Omdurman", ar: "أم درمان" },
  { id: "sanaa", en: "Sanaa", ar: "صنعاء" },
  { id: "aden", en: "Aden", ar: "عدن" },

  // World Global Metropolises & Capitals
  { id: "new_york", en: "New York City", ar: "مدينة نيويورك" },
  { id: "los_angeles", en: "Los Angeles", ar: "لوس أنجلوس" },
  { id: "chicago", en: "Chicago", ar: "شيكاغو" },
  { id: "houston", en: "Houston", ar: "هيوستن" },
  { id: "san_francisco", en: "San Francisco", ar: "سان فرانسيسكو" },
  { id: "miami", en: "Miami", ar: "ميامي" },
  { id: "washington_dc", en: "Washington, D.C.", ar: "واشنطن العاصمة" },
  { id: "boston", en: "Boston", ar: "بوسطن" },
  { id: "toronto", en: "Toronto", ar: "تورونتو" },
  { id: "montreal", en: "Montreal", ar: "مونتريال" },
  { id: "vancouver", en: "Vancouver", ar: "فانكوفر" },
  { id: "ottawa", en: "Ottawa", ar: "أوتاوا" },
  { id: "london", en: "London", ar: "لندن" },
  { id: "manchester", en: "Manchester", ar: "مانشستر" },
  { id: "birmingham", en: "Birmingham", ar: "برمنغهام" },
  { id: "paris", en: "Paris", ar: "باريس" },
  { id: "lyon", en: "Lyon", ar: "ليون" },
  { id: "marseille", en: "Marseille", ar: "مارسيليا" },
  { id: "berlin", en: "Berlin", ar: "برلين" },
  { id: "munich", en: "Munich", ar: "ميونخ" },
  { id: "frankfurt", en: "Frankfurt", ar: "فرانكفورت" },
  { id: "rome", en: "Rome", ar: "روما" },
  { id: "milan", en: "Milan", ar: "ميلانو" },
  { id: "madrid", en: "Madrid", ar: "مدريد" },
  { id: "barcelona", en: "Barcelona", ar: "برشلونة" },
  { id: "amsterdam", en: "Amsterdam", ar: "أمستردام" },
  { id: "brussels", en: "Brussels", ar: "بروكسل" },
  { id: "vienna", en: "Vienna", ar: "فيينا" },
  { id: "zurich", en: "Zurich", ar: "زيورخ" },
  { id: "geneva", en: "Geneva", ar: "جنيف" },
  { id: "stockholm", en: "Stockholm", ar: "ستوكهولم" },
  { id: "oslo", en: "Oslo", ar: "أوسلو" },
  { id: "copenhagen", en: "Copenhagen", ar: "كوبنهاغن" },
  { id: "helsinki", en: "Helsinki", ar: "هلسنكي" },
  { id: "athens", en: "Athens", ar: "أثينا" },
  { id: "istanbul", en: "Istanbul", ar: "إسطنبول" },
  { id: "ankara", en: "Ankara", ar: "أنقرة" },
  { id: "moscow", en: "Moscow", ar: "موسكو" },
  { id: "saint_petersburg", en: "Saint Petersburg", ar: "سانت بطرسبرغ" },
  { id: "tokyo", en: "Tokyo", ar: "طوكيو" },
  { id: "osaka", en: "Osaka", ar: "أوساكا" },
  { id: "kyoto", en: "Kyoto", ar: "كيوتو" },
  { id: "beijing", en: "Beijing", ar: "بكين" },
  { id: "shanghai", en: "Shanghai", ar: "شنغهاي" },
  { id: "guangzhou", en: "Guangzhou", ar: "قوانغتشو" },
  { id: "hong_kong", en: "Hong Kong", ar: "هونغ كونغ" },
  { id: "seoul", en: "Seoul", ar: "سيول" },
  { id: "busan", en: "Busan", ar: "بوسان" },
  { id: "singapore", en: "Singapore", ar: "سنغافورة" },
  { id: "kuala_lumpur", en: "Kuala Lumpur", ar: "كوالالمبور" },
  { id: "bangkok", en: "Bangkok", ar: "بانكوك" },
  { id: "jakarta", en: "Jakarta", ar: "جاكرتا" },
  { id: "manila", en: "Manila", ar: "مانيلا" },
  { id: "new_delhi", en: "New Delhi", ar: "نيودلهي" },
  { id: "mumbai", en: "Mumbai", ar: "مومباي" },
  { id: "bangalore", en: "Bangalore", ar: "بنغالور" },
  { id: "sydney", en: "Sydney", ar: "سيدني" },
  { id: "melbourne", en: "Melbourne", ar: "ملبورن" },
  { id: "auckland", en: "Auckland", ar: "أوكلاند" },
  { id: "sao_paulo", en: "São Paulo", ar: "ساو باولو" },
  { id: "rio_de_janeiro", en: "Rio de Janeiro", ar: "ريو دي جانيرو" },
  { id: "buenos_aires", en: "Buenos Aires", ar: "بوينس آيرس" },
  { id: "mexico_city", en: "Mexico City", ar: "مدينة مكسيكو" },
  { id: "johannesburg", en: "Johannesburg", ar: "جوهانسبرغ" },
  { id: "cape_town", en: "Cape Town", ar: "كيب تاون" },
  { id: "nairobi", en: "Nairobi", ar: "نيروبي" }
];

const messagesDir = path.resolve(__dirname, '../../messages');

function getCityTranslation(city, locale) {
  if (locale.startsWith('ar-') || locale === 'arc' || locale === 'syc' || locale.startsWith('cop-')) {
    return city.ar || city.en;
  }
  return city.en;
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
    const cityMap = {};

    for (const c of WORLD_CITIES) {
      cityMap[c.id] = getCityTranslation(c, lang);
    }

    // Write Cities.json
    const citiesFile = path.join(langPath, 'Cities.json');
    fs.writeFileSync(citiesFile, JSON.stringify(cityMap, null, 2), 'utf8');

    totalUpdated++;
  }

  console.log(`Successfully generated Cities.json in all ${totalUpdated} language directories!`);
}

run();
