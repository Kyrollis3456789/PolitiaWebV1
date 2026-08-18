const fs = require('fs');
const path = require('path');

const messagesDir = path.join(__dirname, '..', 'messages');
const locales = fs.readdirSync(messagesDir);

// Base templates
const enCommon = {
  title: "PolitiaApp",
  description: "Digital Portal Platform",
  welcome: "Welcome to PolitiaApp",
  systemTheme: "Automatic System Theme Sync Active",
  deviceLanguage: "Device Language Detected: English",
  direction: "LTR"
};

const arCommon = {
  title: "تطبيق بوليتيا",
  description: "بوابة الخدمات الرقمية الموحدة",
  welcome: "مرحباً بك في تطبيق بوليتيا",
  systemTheme: "مزامنة سمة النظام التلقائية نشطة",
  deviceLanguage: "تم اكتشاف لغة الجهاز: العربية",
  direction: "RTL"
};

const RTL_LOCALES = [
  'arc', 'syc', 'fa-IR', 'he-IL', 'ur-PK', 'ar-AE', 'ar-BH', 'ar-DZ', 'ar-EG',
  'ar-IQ', 'ar-JO', 'ar-KW', 'ar-LB', 'ar-LY', 'ar-MA', 'ar-OM', 'ar-QA',
  'ar-SA', 'ar-SY', 'ar-TN', 'ar-YE'
];

function isRtl(loc) {
  return loc.startsWith('ar-') || loc === 'ar' || RTL_LOCALES.includes(loc);
}

// Errors template generator
const enErrors = {
  nameRequired: "Please enter your name.",
  nameFourPart: "Please enter your full 4-part name.",
  nameInvalidChars: "Invalid characters in name.",
  nameCollision: "This name is already registered. Please add an additional name.",
  nationalIdRequired: "Please enter your 14-digit National ID.",
  nationalIdInvalid: "Please enter a valid 14-digit National ID.",
  nationalIdCollision: "This National ID is already registered to another account.",
  dobRequired: "Please enter your date of birth.",
  dobInvalid: "Invalid date of birth.",
  dobFuture: "Date of birth cannot be in the future.",
  dobOverMaxAge: "Date of birth cannot exceed 120 years in the past.",
  phoneRequired: "Please enter your mobile phone number.",
  phoneInvalid: "Please enter a valid mobile phone number.",
  emailInvalid: "Please enter a valid email address.",
  passwordRequired: "Password is required.",
  passwordTooShort: "Password must be at least 8 characters long.",
  passwordMismatch: "Passwords do not match.",
  cameraAccessError: "Live camera access is not supported or requires a secure HTTPS connection.",
  unknownError: "An unexpected error occurred. Please try again."
};

const arErrors = {
  nameRequired: "يرجى إدخال الاسم.",
  nameFourPart: "يرجى إدخال الاسم رباعياً بالكامل.",
  nameInvalidChars: "حروف غير مسموح بها في الاسم.",
  nameCollision: "هذا الاسم مسجل بالفعل. يرجى إضافة اسم خامس.",
  nationalIdRequired: "يرجى إدخال الرقم القومي المكون من 14 رقماً.",
  nationalIdInvalid: "يرجى إدخال رقم قومي صحيح مكون من 14 رقماً.",
  nationalIdCollision: "الرقم القومي مسجل بالفعل لحساب آخر.",
  dobRequired: "يرجى إدخال تاريخ الميلاد.",
  dobInvalid: "تاريخ ميلاد غير صحيح.",
  dobFuture: "لا يمكن أن يكون تاريخ الميلاد في المستقبل.",
  dobOverMaxAge: "لا يمكن أن يتجاوز العمر 120 عاماً في الماضي.",
  phoneRequired: "يرجى إدخال رقم الهاتف المحمول.",
  phoneInvalid: "يرجى إدخال رقم هاتف محمول صحيح.",
  emailInvalid: "يرجى إدخال بريد إلكتروني صحيح.",
  passwordRequired: "كلمة المرور مطلوبة.",
  passwordTooShort: "يجب أن لا تقل كلمة المرور عن 8 أحرف.",
  passwordMismatch: "كلمتا المرور غير متطابقتين.",
  cameraAccessError: "المتصفح لا يتيح الكاميرا عبر هذا الاتصال (يلزم اتصال HTTPS آمن أو localhost).",
  unknownError: "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى."
};

let commonCount = 0;
let errorsCount = 0;

for (const loc of locales) {
  const locDir = path.join(messagesDir, loc);
  if (!fs.statSync(locDir).isDirectory()) continue;

  const rtl = isRtl(loc);

  // 1. common.json
  const commonFile = path.join(locDir, 'common.json');
  if (!fs.existsSync(commonFile)) {
    const data = rtl ? { ...arCommon, direction: "RTL" } : { ...enCommon, direction: "LTR" };
    fs.writeFileSync(commonFile, JSON.stringify(data, null, 2), 'utf8');
    commonCount++;
  }

  // 2. errors.json
  const errorsFile = path.join(locDir, 'errors.json');
  if (!fs.existsSync(errorsFile)) {
    const data = rtl ? arErrors : enErrors;
    fs.writeFileSync(errorsFile, JSON.stringify(data, null, 2), 'utf8');
    errorsCount++;
  }
}

console.log(`Successfully generated ${commonCount} common.json and ${errorsCount} errors.json files across all 131 locales!`);
