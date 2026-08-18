'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  Loader2,
  ChevronDown,
  Camera,
  Upload,
  User,
  Trash2,
  Pencil,
  CheckCircle2,
  ShieldCheck,
  KeyRound,
  RotateCw,
} from 'lucide-react';
import { CameraCaptureModal, PhotoEditorModal } from '@/components/media';
import { useRouter, Link } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import { isRtlLocale, SUPPORTED_LOCALES, getLocaleDisplayName } from '@/i18n/locales';
import {
  autoCapitalizeEnglishName,
  validateEnglishName,
  validateArabicName,
} from '@/lib/validation/name-rules';
import { validateEgyptianNationalId } from '@/lib/validation/national-id';
import { validateBirthday } from '@/lib/validation/date-rules';
import { createAccountAction, CreateAccountPayload } from '@/app/actions/create-account';
import {
  checkEnglishNameCollision,
  checkArabicNameCollision,
  checkNationalIdCollision,
} from '@/app/actions/auth-check';
import { sendPhoneOtp, verifyPhoneOtp } from '@/app/actions/phone-otp';
import { GenderType, SocialPlatform } from '@/types/database.types';
import {
  REGISTRATION_SCHEMA,
  TOTAL_REGISTRATION_MAIN_STEPS,
  TOTAL_REGISTRATION_SUBSTEPS,
} from '@/lib/constants/registrationSteps';
import { ALL_COUNTRIES, getCountryByIso, getLocalizedCountryName } from '@/lib/data/countries';

interface RegisterScreenProps {
  onNavigateLogin?: () => void;
  onSubmit?: (e: React.FormEvent) => void;
  isStandaloneMobile?: boolean;
}

const EGYPTIAN_GOVERNORATES = [
  'Cairo', 'Giza', 'Alexandria', 'Qalyubia', 'Sharqia', 'Dakahlia',
  'Gharbia', 'Menofia', 'Beheira', 'Kafr El Sheikh', 'Damietta',
  'Port Said', 'Ismailia', 'Suez', 'North Sinai', 'South Sinai',
  'Beni Suef', 'Faiyum', 'Minya', 'Asyut', 'Sohag', 'Qena',
  'Luxor', 'Aswan', 'Red Sea', 'New Valley', 'Matruh',
];

const EGYPTIAN_GOVERNORATES_AR = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'القليوبية', 'الشرقية', 'الدقهلية',
  'الغربية', 'المنوفية', 'البحيرة', 'كفر الشيخ', 'دمياط',
  'بورسعيد', 'الإسماعيلية', 'السويس', 'شمال سيناء', 'جنوب سيناء',
  'بني سويف', 'الفيوم', 'المنيا', 'أسيوط', 'سوهاج', 'قنا',
  'الأقصر', 'أسوان', 'البحر الأحمر', 'الوادي الجديد', 'مطروح',
];

const EDUCATION_STAGES = [
  { id: 'primary', labelEn: 'Primary School', labelAr: 'المرحلة الابتدائية' },
  { id: 'prep', labelEn: 'Preparatory School', labelAr: 'المرحلة الإعدادية' },
  { id: 'sec', labelEn: 'Secondary School', labelAr: 'المرحلة الثانوية' },
  { id: 'univ', labelEn: 'University Student', labelAr: 'طالب جامعي' },
  { id: 'grad', labelEn: "Bachelor's / Graduate", labelAr: 'خريج / بكالوريوس / ليسانس' },
  { id: 'postgrad', labelEn: 'Post-Graduate Studies', labelAr: 'دراسات عليا / ماجستير / دكتوراه' },
];

const MARITAL_STATUSES = [
  { id: 'single', labelEn: 'Single', labelAr: 'أعزب / آنسة' },
  { id: 'engaged', labelEn: 'Engaged', labelAr: 'مخطوب / مخطوبة' },
  { id: 'married', labelEn: 'Married', labelAr: 'متزوج / متزوجة' },
  { id: 'widowed', labelEn: 'Widowed', labelAr: 'أرمل / أرملة' },
];

const AVAILABLE_HOBBIES = [
  { id: 'hymns', labelEn: 'Hymns & Chants', labelAr: 'الألحان والتسبحة' },
  { id: 'deacon', labelEn: 'Deaconship', labelAr: 'الخدمة الشماسية' },
  { id: 'sunday_school', labelEn: 'Sunday School', labelAr: 'مدارس الأحد' },
  { id: 'scouts', labelEn: 'Scouts & Camps', labelAr: 'الكشافة والمعسكرات' },
  { id: 'reading', labelEn: 'Reading & Research', labelAr: 'القراءة والبحث' },
  { id: 'music', labelEn: 'Music & Instruments', labelAr: 'الموسيقى والعزف' },
  { id: 'art', labelEn: 'Drawing & Art', labelAr: 'الرسم والفنون' },
  { id: 'sports', labelEn: 'Sports & Fitness', labelAr: 'الرياضة والأنشطة' },
  { id: 'tech', labelEn: 'Tech & Media', labelAr: 'التكنولوجيا والميديا' },
];

const AVAILABLE_LANGUAGES = [
  { id: 'ar', labelEn: 'Arabic', labelAr: 'العربية' },
  { id: 'en', labelEn: 'English', labelAr: 'الإنجليزية' },
  { id: 'cop', labelEn: 'Coptic', labelAr: 'القبطية' },
  { id: 'fr', labelEn: 'French', labelAr: 'الفرنسية' },
  { id: 'de', labelEn: 'German', labelAr: 'الألمانية' },
  { id: 'it', labelEn: 'Italian', labelAr: 'الإيطالية' },
];

// LocalStorage Persistence Helpers for granular field-by-field storage
function getLocalItem(key: string, defaultValue: string): string {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const val = localStorage.getItem(`politia_reg_${key}`);
    return val !== null ? val : defaultValue;
  } catch {
    return defaultValue;
  }
}

function getLocalNumber(key: string, defaultValue: number): number {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const val = localStorage.getItem(`politia_reg_${key}`);
    if (val !== null) {
      const num = Number(val);
      if (!isNaN(num) && num > 0) return num;
    }
    return defaultValue;
  } catch {
    return defaultValue;
  }
}

function getLocalJson<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const val = localStorage.getItem(`politia_reg_${key}`);
    if (val) return JSON.parse(val);
    return defaultValue;
  } catch {
    return defaultValue;
  }
}

function setLocalItem(key: string, value: string | number | boolean | object | null | undefined) {
  if (typeof window === 'undefined') return;
  try {
    if (value === undefined || value === null) {
      localStorage.removeItem(`politia_reg_${key}`);
    } else if (typeof value === 'object') {
      localStorage.setItem(`politia_reg_${key}`, JSON.stringify(value));
    } else {
      localStorage.setItem(`politia_reg_${key}`, String(value));
    }
  } catch (e) {
    console.warn(`Failed to save ${key} to localStorage`, e);
  }
}

function clearAllRegistrationDrafts() {
  if (typeof window === 'undefined') return;
  const keysToRemove = [
    'main_step',
    'sub_step',
    'full_name_en',
    'full_name_ar',
    'gender',
    'dob',
    'national_id',
    'avatar_preview',
    'photo_skipped',
    'country_iso',
    'country_code',
    'phone_number',
    'phone_verified',
    'email',
    'landline_area_code',
    'landline_number',
    'socials',
    'marital_status',
    'guardian_name',
    'guardian_phone',
    'family_relation_type',
    'education_stage',
    'faculty_or_school',
    'profession',
    'workplace',
    'governorate',
    'city',
    'street_address',
    'building_number',
    'floor_number',
    'apartment_number',
    'secondary_address',
    'diocese',
    'primary_church',
    'secondary_church',
    'priest_name',
    'hobbies',
    'languages',
  ];
  keysToRemove.forEach((k) => {
    try {
      localStorage.removeItem(`politia_reg_${k}`);
    } catch {}
  });
}

export function RegisterScreen({ onNavigateLogin }: RegisterScreenProps) {
  const router = useRouter();
  const locale = useLocale();
  const isRtl = isRtlLocale(locale);
  const t = useTranslations('register');

  // Dynamic Navigation state:
  const [isMounted, setIsMounted] = useState(false);
  const [mainStepIndex, setMainStepIndex] = useState<number>(1);
  const [subStepIndex, setSubStepIndex] = useState<number>(1);
  const [slideDirection, setSlideDirection] = useState<'forward' | 'backward'>('forward');

  // Milestone 1: Personal Info
  const [englishFullName, setEnglishFullName] = useState<string>('');
  const [isEnglishFullNameFocused, setIsEnglishFullNameFocused] = useState(false);
  const [arabicFullName, setArabicFullName] = useState<string>('');
  const [isArabicFullNameFocused, setIsArabicFullNameFocused] = useState(false);
  const [gender, setGender] = useState<GenderType>('Male');
  const [dob, setDob] = useState<string>('');
  const [isDobFocused, setIsDobFocused] = useState(false);
  const [nationalId, setNationalId] = useState<string>('');
  const [isNationalIdFocused, setIsNationalIdFocused] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [photoSkippedGracePeriod, setPhotoSkippedGracePeriod] = useState<boolean>(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [rawImageToEdit, setRawImageToEdit] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Milestone 2: Contact & Social
  const [countryIso, setCountryIso] = useState<string>('EG');
  const [countryCode, setCountryCode] = useState<string>('+20');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState<boolean>(false);
  const [isPhoneOtpActive, setIsPhoneOtpActive] = useState<boolean>(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [otpResendTimer, setOtpResendTimer] = useState<number>(0);
  const [demoOtpNotice, setDemoOtpNotice] = useState<string | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState<boolean>(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [email, setEmail] = useState<string>('');
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [landlineAreaCode, setLandlineAreaCode] = useState<string>('');
  const [landlineNumber, setLandlineNumber] = useState<string>('');
  const [socials, setSocials] = useState<Record<SocialPlatform, { url: string }>>({
    facebook: { url: '' },
    instagram: { url: '' },
    tiktok: { url: '' },
    snapchat: { url: '' },
    threads: { url: '' },
    x: { url: '' },
    github: { url: '' },
    linkedin: { url: '' },
  });

  // Milestone 3: Relations
  const [maritalStatus, setMaritalStatus] = useState<string>('single');
  const [guardianName, setGuardianName] = useState<string>('');
  const [guardianPhone, setGuardianPhone] = useState<string>('');
  const [familyRelationType, setFamilyRelationType] = useState<string>('Parent');

  // Milestone 4: Education & Work
  const [educationStage, setEducationStage] = useState<string>('univ');
  const [facultyOrSchool, setFacultyOrSchool] = useState<string>('');
  const [profession, setProfession] = useState<string>('');
  const [workplace, setWorkplace] = useState<string>('');

  // Milestone 5: Locations
  const [governorate, setGovernorate] = useState<string>(isRtl ? 'القاهرة' : 'Cairo');
  const [city, setCity] = useState<string>('');
  const [streetAddress, setStreetAddress] = useState<string>('');
  const [buildingNumber, setBuildingNumber] = useState<string>('');
  const [floorNumber, setFloorNumber] = useState<string>('');
  const [apartmentNumber, setApartmentNumber] = useState<string>('');
  const [secondaryAddress, setSecondaryAddress] = useState<string>('');

  // Milestone 6: Church Commitment
  const [diocese, setDiocese] = useState<string>('');
  const [primaryChurch, setPrimaryChurch] = useState<string>('');
  const [secondaryChurch, setSecondaryChurch] = useState<string>('');
  const [priestName, setPriestName] = useState<string>('');

  // Milestone 7: Additional Info
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>(['hymns']);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['ar', 'en']);

  // Password Setup
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false);

  // Global UI State
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [langSearch, setLangSearch] = useState('');

  // Client-side Draft Hydration
  useEffect(() => {
    setIsMounted(true);
    try {
      const savedMain = getLocalNumber('main_step', 1);
      const savedSub = getLocalNumber('sub_step', 1);
      if (savedMain > 1) setMainStepIndex(savedMain);
      if (savedSub > 1) setSubStepIndex(savedSub);

      const fnEn = getLocalItem('full_name_en', '');
      if (fnEn) setEnglishFullName(fnEn);
      const fnAr = getLocalItem('full_name_ar', '');
      if (fnAr) setArabicFullName(fnAr);
      const g = getLocalItem('gender', '');
      if (g) setGender(g as GenderType);
      const d = getLocalItem('dob', '');
      if (d) setDob(d);
      const nid = getLocalItem('national_id', '');
      if (nid) setNationalId(nid);
      const av = getLocalItem('avatar_preview', '');
      if (av) setAvatarPreview(av);
      const pskip = getLocalItem('photo_skipped', '');
      if (pskip === 'true') setPhotoSkippedGracePeriod(true);
      const cIso = getLocalItem('country_iso', '');
      if (cIso) setCountryIso(cIso);
      const cCode = getLocalItem('country_code', '');
      if (cCode) setCountryCode(cCode);
      const ph = getLocalItem('phone_number', '');
      if (ph) setPhoneNumber(ph);
      const pv = getLocalItem('phone_verified', '');
      if (pv === 'true') setIsPhoneVerified(true);
      const em = getLocalItem('email', '');
      if (em) setEmail(em);
      const lAc = getLocalItem('landline_area_code', '');
      if (lAc) setLandlineAreaCode(lAc);
      const lNum = getLocalItem('landline_number', '');
      if (lNum) setLandlineNumber(lNum);
      const soc = getLocalJson('socials', null);
      if (soc) setSocials(soc);
      const ms = getLocalItem('marital_status', '');
      if (ms) setMaritalStatus(ms);
      const gn = getLocalItem('guardian_name', '');
      if (gn) setGuardianName(gn);
      const gp = getLocalItem('guardian_phone', '');
      if (gp) setGuardianPhone(gp);
      const frt = getLocalItem('family_relation_type', '');
      if (frt) setFamilyRelationType(frt);
      const es = getLocalItem('education_stage', '');
      if (es) setEducationStage(es);
      const fos = getLocalItem('faculty_or_school', '');
      if (fos) setFacultyOrSchool(fos);
      const prof = getLocalItem('profession', '');
      if (prof) setProfession(prof);
      const wp = getLocalItem('workplace', '');
      if (wp) setWorkplace(wp);
      const gov = getLocalItem('governorate', '');
      if (gov) setGovernorate(gov);
      const cit = getLocalItem('city', '');
      if (cit) setCity(cit);
      const sa = getLocalItem('street_address', '');
      if (sa) setStreetAddress(sa);
      const bn = getLocalItem('building_number', '');
      if (bn) setBuildingNumber(bn);
      const fln = getLocalItem('floor_number', '');
      if (fln) setFloorNumber(fln);
      const an = getLocalItem('apartment_number', '');
      if (an) setApartmentNumber(an);
      const secAddr = getLocalItem('secondary_address', '');
      if (secAddr) setSecondaryAddress(secAddr);
      const dio = getLocalItem('diocese', '');
      if (dio) setDiocese(dio);
      const pc = getLocalItem('primary_church', '');
      if (pc) setPrimaryChurch(pc);
      const sc = getLocalItem('secondary_church', '');
      if (sc) setSecondaryChurch(sc);
      const pn = getLocalItem('priest_name', '');
      if (pn) setPriestName(pn);
      const hob = getLocalJson('hobbies', null);
      if (hob) setSelectedHobbies(hob);
      const langList = getLocalJson('languages', null);
      if (langList) setSelectedLanguages(langList);
    } catch {}
  }, []);

  // OTP Countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpResendTimer > 0) {
      interval = setInterval(() => {
        setOtpResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpResendTimer]);

  // Sync state one by one into localStorage
  useEffect(() => { if (isMounted) setLocalItem('main_step', mainStepIndex); }, [mainStepIndex, isMounted]);
  useEffect(() => { if (isMounted) setLocalItem('sub_step', subStepIndex); }, [subStepIndex, isMounted]);
  useEffect(() => { if (isMounted) setLocalItem('full_name_en', englishFullName); }, [englishFullName, isMounted]);
  useEffect(() => { if (isMounted) setLocalItem('full_name_ar', arabicFullName); }, [arabicFullName, isMounted]);
  useEffect(() => { if (isMounted) setLocalItem('gender', gender); }, [gender, isMounted]);
  useEffect(() => { if (isMounted) setLocalItem('dob', dob); }, [dob, isMounted]);
  useEffect(() => { if (isMounted) setLocalItem('national_id', nationalId); }, [nationalId, isMounted]);
  useEffect(() => { if (isMounted) setLocalItem('avatar_preview', avatarPreview); }, [avatarPreview, isMounted]);
  useEffect(() => { if (isMounted) setLocalItem('photo_skipped', photoSkippedGracePeriod); }, [photoSkippedGracePeriod, isMounted]);
  useEffect(() => { if (isMounted) setLocalItem('country_iso', countryIso); }, [countryIso, isMounted]);
  useEffect(() => { if (isMounted) setLocalItem('country_code', countryCode); }, [countryCode, isMounted]);
  useEffect(() => { if (isMounted) setLocalItem('phone_number', phoneNumber); }, [phoneNumber, isMounted]);
  useEffect(() => { if (isMounted) setLocalItem('phone_verified', isPhoneVerified); }, [isPhoneVerified, isMounted]);
  useEffect(() => { if (isMounted) setLocalItem('email', email); }, [email, isMounted]);
  useEffect(() => { if (isMounted) setLocalItem('landline_area_code', landlineAreaCode); }, [landlineAreaCode, isMounted]);
  useEffect(() => { if (isMounted) setLocalItem('landline_number', landlineNumber); }, [landlineNumber, isMounted]);
  useEffect(() => { if (isMounted) setLocalItem('socials', socials); }, [socials, isMounted]);
  useEffect(() => { if (isMounted) setLocalItem('marital_status', maritalStatus); }, [maritalStatus, isMounted]);
  useEffect(() => { if (isMounted) setLocalItem('guardian_name', guardianName); }, [guardianName, isMounted]);
  useEffect(() => { if (isMounted) setLocalItem('guardian_phone', guardianPhone); }, [guardianPhone, isMounted]);
  useEffect(() => { if (isMounted) setLocalItem('family_relation_type', familyRelationType); }, [familyRelationType, isMounted]);
  useEffect(() => { if (isMounted) setLocalItem('education_stage', educationStage); }, [educationStage, isMounted]);
  useEffect(() => { if (isMounted) setLocalItem('faculty_or_school', facultyOrSchool); }, [facultyOrSchool, isMounted]);
  useEffect(() => { if (isMounted) setLocalItem('profession', profession); }, [profession, isMounted]);
  useEffect(() => { if (isMounted) setLocalItem('workplace', workplace); }, [workplace, isMounted]);
  useEffect(() => { if (isMounted) setLocalItem('governorate', governorate); }, [governorate, isMounted]);
  useEffect(() => { if (isMounted) setLocalItem('city', city); }, [city, isMounted]);
  useEffect(() => { if (isMounted) setLocalItem('street_address', streetAddress); }, [streetAddress, isMounted]);
  useEffect(() => { if (isMounted) setLocalItem('building_number', buildingNumber); }, [buildingNumber, isMounted]);
  useEffect(() => { if (isMounted) setLocalItem('floor_number', floorNumber); }, [floorNumber, isMounted]);
  useEffect(() => { if (isMounted) setLocalItem('apartment_number', apartmentNumber); }, [apartmentNumber, isMounted]);
  useEffect(() => { if (isMounted) setLocalItem('secondary_address', secondaryAddress); }, [secondaryAddress, isMounted]);
  useEffect(() => { if (isMounted) setLocalItem('diocese', diocese); }, [diocese, isMounted]);
  useEffect(() => { if (isMounted) setLocalItem('primary_church', primaryChurch); }, [primaryChurch, isMounted]);
  useEffect(() => { if (isMounted) setLocalItem('secondary_church', secondaryChurch); }, [secondaryChurch, isMounted]);
  useEffect(() => { if (isMounted) setLocalItem('priest_name', priestName); }, [priestName, isMounted]);
  useEffect(() => { if (isMounted) setLocalItem('hobbies', selectedHobbies); }, [selectedHobbies, isMounted]);
  useEffect(() => { if (isMounted) setLocalItem('languages', selectedLanguages); }, [selectedLanguages, isMounted]);

  // Names cleanup & derived values
  const fullEnglishName = englishFullName.trim().replace(/\s+/g, ' ');
  const fullArabicName = arabicFullName.trim().replace(/\s+/g, ' ');
  const formattedDob = dob;

  const calculateAge = (): number | null => {
    if (!formattedDob) return null;
    const birthDate = new Date(formattedDob + 'T00:00:00');
    if (isNaN(birthDate.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? age : null;
  };
  const currentAge = calculateAge();

  const nationalIdValidation = validateEgyptianNationalId(
    nationalId,
    formattedDob || undefined,
    gender || undefined
  );

  // Name and ID collision detection states
  const [checkingCollision, setCheckingCollision] = useState(false);
  const [hasNameCollision, setHasNameCollision] = useState(false);
  const [hasArabicNameCollision, setHasArabicNameCollision] = useState(false);
  const [hasNationalIdCollision, setHasNationalIdCollision] = useState(false);

  // Debounced English Name Collision Check
  useEffect(() => {
    if (mainStepIndex !== 1 || subStepIndex !== 1 || !englishFullName.trim()) {
      setHasNameCollision(false);
      return;
    }

    const val = validateEnglishName(englishFullName, false);
    if (!val.isValid) {
      setHasNameCollision(false);
      return;
    }

    setCheckingCollision(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const isCollision = await checkEnglishNameCollision(englishFullName);
        setHasNameCollision(isCollision);
        if (isCollision) {
          setErrorMessage(
            isRtl
              ? 'هذا الاسم مسجل بالفعل. يرجى تعديله أو كتابة اسم خماسي لتجنب التكرار.'
              : 'This name is already registered. Please add a 5th name to avoid conflict.'
          );
        } else {
          setErrorMessage((prev) =>
            prev?.includes('registered') || prev?.includes('مسجل بالفعل') ? null : prev
          );
        }
      } catch (err) {
        console.warn('Collision check error:', err);
      } finally {
        setCheckingCollision(false);
      }
    }, 600);

    return () => clearTimeout(delayDebounceFn);
  }, [englishFullName, mainStepIndex, subStepIndex, isRtl]);

  // Debounced Arabic Name Collision Check
  useEffect(() => {
    if (mainStepIndex !== 1 || subStepIndex !== 2 || !arabicFullName.trim()) {
      setHasArabicNameCollision(false);
      return;
    }

    const val = validateArabicName(arabicFullName, 4);
    if (!val.isValid) {
      setHasArabicNameCollision(false);
      return;
    }

    setCheckingCollision(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const isCollision = await checkArabicNameCollision(arabicFullName);
        setHasArabicNameCollision(isCollision);
        if (isCollision) {
          setErrorMessage(
            isRtl
              ? 'هذا الاسم العربي مسجل بالفعل. يرجى تعديله أو كتابة اسم خماسي لتجنب التكرار.'
              : 'This Arabic name is already registered. Please add a 5th name to avoid conflict.'
          );
        } else {
          setErrorMessage((prev) =>
            prev?.includes('registered') || prev?.includes('مسجل بالفعل') ? null : prev
          );
        }
      } catch (err) {
        console.warn('Arabic collision check error:', err);
      } finally {
        setCheckingCollision(false);
      }
    }, 600);

    return () => clearTimeout(delayDebounceFn);
  }, [arabicFullName, mainStepIndex, subStepIndex, isRtl]);

  // Debounced National ID Collision Check
  useEffect(() => {
    if (mainStepIndex !== 1 || subStepIndex !== 5 || !nationalId.trim()) {
      setHasNationalIdCollision(false);
      return;
    }

    if (nationalId.length !== 14 || !nationalIdValidation.isValid) {
      setHasNationalIdCollision(false);
      return;
    }

    setCheckingCollision(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const isCollision = await checkNationalIdCollision(nationalId);
        setHasNationalIdCollision(isCollision);
        if (isCollision) {
          setErrorMessage(
            isRtl
              ? 'الرقم القومي مسجل بالفعل لحساب آخر.'
              : 'This National ID is already registered to another account.'
          );
        } else {
          setErrorMessage((prev) =>
            prev?.includes('National ID') || prev?.includes('الرقم القومي مسجل') ? null : prev
          );
        }
      } catch (err) {
        console.warn('National ID collision check error:', err);
      } finally {
        setCheckingCollision(false);
      }
    }, 600);

    return () => clearTimeout(delayDebounceFn);
  }, [nationalId, nationalIdValidation.isValid, mainStepIndex, subStepIndex, isRtl]);

  // Real-time name validation while writing
  useEffect(() => {
    if (mainStepIndex === 1) {
      if (subStepIndex === 1) {
        if (!englishFullName.trim()) {
          setErrorMessage(null);
          return;
        }
        const val = validateEnglishName(englishFullName, hasNameCollision);
        if (!val.isValid) {
          setErrorMessage(isRtl ? (val.errorAr || val.error || '') : (val.error || val.errorAr || ''));
        } else if (!hasNameCollision) {
          setErrorMessage(null);
        }
      } else if (subStepIndex === 2) {
        if (!arabicFullName.trim()) {
          setErrorMessage(null);
          return;
        }
        const val = validateArabicName(arabicFullName, hasArabicNameCollision ? 5 : 4);
        if (!val.isValid) {
          setErrorMessage(isRtl ? (val.errorAr || val.error || '') : (val.error || val.errorAr || ''));
        } else if (!hasArabicNameCollision) {
          setErrorMessage(null);
        }
      }
    }
  }, [englishFullName, arabicFullName, mainStepIndex, subStepIndex, isRtl, hasNameCollision, hasArabicNameCollision]);



  // Active Schema Configuration
  const currentMainConfig = REGISTRATION_SCHEMA[mainStepIndex - 1];
  const currentSubConfig = currentMainConfig?.subSteps[subStepIndex - 1];

  // Calculate flattened progress
  const calculateFlattenedIndex = () => {
    if (mainStepIndex === 8) return TOTAL_REGISTRATION_SUBSTEPS + 1;
    if (mainStepIndex === 9) return TOTAL_REGISTRATION_SUBSTEPS + 2;

    let flat = 0;
    for (let i = 0; i < mainStepIndex - 1; i++) {
      flat += REGISTRATION_SCHEMA[i].subSteps.length;
    }
    return flat + subStepIndex;
  };

  const currentFlatStep = calculateFlattenedIndex();
  const totalTotalSteps = TOTAL_REGISTRATION_SUBSTEPS + 1; // including password
  const progressPercentage = Math.min(100, Math.round((currentFlatStep / totalTotalSteps) * 100));

  // Language changer
  const filteredLocales = langSearch.trim()
    ? SUPPORTED_LOCALES.filter((loc) => {
        const q = langSearch.toLowerCase();
        return (
          loc.toLowerCase().includes(q) ||
          getLocaleDisplayName(loc).toLowerCase().includes(q)
        );
      })
    : SUPPORTED_LOCALES;

  const handleLanguageChange = (newLocale: string) => {
    setIsLangOpen(false);
    setLangSearch('');
    router.replace('/register', { locale: newLocale });
  };

  // Photo handlers
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setAvatarFile(file);
      setAvatarPreview(previewUrl);
      setRawImageToEdit(previewUrl);
      setIsEditorOpen(true);
      setPhotoSkippedGracePeriod(false);
      if (errorMessage) setErrorMessage(null);
    }
    if (e.target) e.target.value = '';
  };

  const handleCameraCapture = (file: File, previewUrl: string) => {
    setAvatarFile(file);
    setAvatarPreview(previewUrl);
    setRawImageToEdit(previewUrl);
    setIsEditorOpen(true);
    setPhotoSkippedGracePeriod(false);
    if (errorMessage) setErrorMessage(null);
  };

  const handleEditorSave = (file: File, previewUrl: string) => {
    setAvatarFile(file);
    setAvatarPreview(previewUrl);
    setPhotoSkippedGracePeriod(false);
    if (errorMessage) setErrorMessage(null);
  };

  // Helper: File to Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Phone OTP Handlers
  const handleSendPhoneOtp = async () => {
    const cleanPhone = phoneNumber.trim().replace(/\D/g, '');
    if (!cleanPhone) {
      setErrorMessage(isRtl ? 'يرجى إدخال رقم الهاتف المحمول' : 'Please enter your mobile phone number');
      return;
    }
    if (countryCode === '+20') {
      const isValidEgy = /^(010|011|012|015)\d{8}$/.test(cleanPhone) || /^1[0125]\d{8}$/.test(cleanPhone);
      if (!isValidEgy) {
        setErrorMessage(
          isRtl
            ? 'يرجى إدخال رقم محمول مصري صحيح (11 رقماً يبدأ بـ 010، 011، 012، أو 015)'
            : 'Please enter a valid Egyptian mobile number (11 digits starting with 010, 011, 012, or 015)'
        );
        return;
      }
    } else if (cleanPhone.length < 7 || cleanPhone.length > 15) {
      setErrorMessage(isRtl ? 'يرجى إدخال رقم هاتف صحيح' : 'Please enter a valid phone number');
      return;
    }

    setErrorMessage(null);
    setIsSendingOtp(true);
    try {
      const res = await sendPhoneOtp(countryCode, phoneNumber);
      if (res.success) {
        setIsPhoneOtpActive(true);
        setOtpResendTimer(30);
        setOtpDigits(['', '', '', '', '', '']);
        if (res.demoOtp) {
          setDemoOtpNotice(res.demoOtp);
        }
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 120);
      } else {
        setErrorMessage(res.error || (isRtl ? 'فشل إرسال رمز التحقق' : 'Failed to send verification code.'));
      }
    } catch {
      setErrorMessage(isRtl ? 'حدث خطأ في الشبكة' : 'Network error sending OTP.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (codeToVerify?: string) => {
    const code = codeToVerify || otpDigits.join('');
    if (code.length !== 6) {
      setErrorMessage(isRtl ? 'يرجى إدخال رمز التحقق المكون من 6 أرقام' : 'Please enter the complete 6-digit code');
      return;
    }

    setErrorMessage(null);
    setIsVerifyingOtp(true);
    try {
      const res = await verifyPhoneOtp(countryCode, phoneNumber, code);
      if (res.success) {
        setIsPhoneVerified(true);
        setIsPhoneOtpActive(false);
        setErrorMessage(null);
        // Automatically advance to sub-step 2 (Email)
        setSlideDirection('forward');
        setSubStepIndex(2);
      } else {
        setErrorMessage(res.error || (isRtl ? 'رمز التحقق غير صحيح أو منتهي الصلاحية' : 'Invalid or expired verification code.'));
      }
    } catch {
      setErrorMessage(isRtl ? 'حدث خطأ أثناء التحقق' : 'Error verifying OTP code.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleOtpDigitChange = (index: number, val: string) => {
    const sanitized = val.replace(/\D/g, '');
    if (sanitized.length > 1) {
      const pasted = sanitized.slice(0, 6).split('');
      const newDigits = [...otpDigits];
      pasted.forEach((d, idx) => {
        if (index + idx < 6) newDigits[index + idx] = d;
      });
      setOtpDigits(newDigits);
      const nextFocus = Math.min(index + pasted.length, 5);
      otpInputRefs.current[nextFocus]?.focus();
      if (newDigits.every((d) => d.length === 1)) {
        handleVerifyOtp(newDigits.join(''));
      }
      return;
    }

    const singleDigit = sanitized.slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = singleDigit;
    setOtpDigits(newDigits);

    if (errorMessage) setErrorMessage(null);

    if (singleDigit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    if (singleDigit && newDigits.every((d) => d.length === 1)) {
      handleVerifyOtp(newDigits.join(''));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Navigation Logic
  const handleAdvance = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    // Validation per sub-step
    if (mainStepIndex === 1) {
      if (subStepIndex === 1) {
        const val = validateEnglishName(englishFullName, hasNameCollision);
        if (!val.isValid) {
          setErrorMessage(isRtl ? (val.errorAr || val.error || '') : (val.error || val.errorAr || ''));
          return;
        }
      } else if (subStepIndex === 2) {
        const val = validateArabicName(arabicFullName, hasArabicNameCollision ? 5 : 4);
        if (!val.isValid) {
          setErrorMessage(isRtl ? (val.errorAr || val.error || '') : (val.error || val.errorAr || ''));
          return;
        }
      } else if (subStepIndex === 4) {
        const dateVal = validateBirthday(dob, 0, 120);
        if (!dateVal.isValid) {
          setErrorMessage(isRtl ? (dateVal.errorAr || dateVal.error || '') : (dateVal.error || dateVal.errorAr || ''));
          return;
        }
      } else if (subStepIndex === 5) {
        if (!nationalId.trim()) {
          setErrorMessage(isRtl ? 'يرجى إدخال الرقم القومي' : 'Please enter your National ID');
          return;
        }
        if (!nationalIdValidation.isValid) {
          setErrorMessage(
            nationalIdValidation.error ||
              (isRtl ? 'الرقم القومي غير صحيح (14 رقماً)' : 'Invalid National ID number (must be 14 digits).')
          );
          return;
        }
        if (hasNationalIdCollision) {
          setErrorMessage(
            isRtl
              ? 'الرقم القومي مسجل بالفعل لحساب آخر.'
              : 'This National ID is already registered to another account.'
          );
          return;
        }
      } else if (subStepIndex === 6) {
        if (!avatarFile && !avatarPreview && !photoSkippedGracePeriod) {
          setErrorMessage(isRtl ? 'يرجى اختيار صورة أو الضغط على "تخطي مؤقتاً"' : 'Please select a photo or click Skip');
          return;
        }
      }
    } else if (mainStepIndex === 2) {
      if (subStepIndex === 1) {
        const cleanPhone = phoneNumber.trim().replace(/\D/g, '');
        if (!cleanPhone) {
          setErrorMessage(isRtl ? 'يرجى إدخال رقم الهاتف المحمول' : 'Please enter your mobile phone number');
          return;
        }
        if (countryCode === '+20') {
          // Egyptian mobile: 11 digits starting with 010, 011, 012, or 015 (or 10 digits without leading 0)
          const isValidEgy = /^(010|011|012|015)\d{8}$/.test(cleanPhone) || /^1[0125]\d{8}$/.test(cleanPhone);
          if (!isValidEgy) {
            setErrorMessage(
              isRtl
                ? 'يرجى إدخال رقم محمول مصري صحيح (11 رقماً يبدأ بـ 010، 011، 012، أو 015)'
                : 'Please enter a valid Egyptian mobile number (11 digits starting with 010, 011, 012, or 015)'
            );
            return;
          }
        } else if (cleanPhone.length < 7 || cleanPhone.length > 15) {
          setErrorMessage(isRtl ? 'يرجى إدخال رقم هاتف صحيح' : 'Please enter a valid phone number');
          return;
        }

        // Phone OTP Verification Gate
        if (!isPhoneVerified) {
          if (isPhoneOtpActive) {
            handleVerifyOtp();
          } else {
            handleSendPhoneOtp();
          }
          return;
        }
      } else if (subStepIndex === 2) {
        const trimmedEmail = email.trim();
        if (trimmedEmail) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(trimmedEmail)) {
            setErrorMessage(isRtl ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Please enter a valid email address');
            return;
          }
        }
      } else if (subStepIndex === 3) {
        if (landlineNumber.trim() && !landlineAreaCode.trim()) {
          setErrorMessage(isRtl ? 'يرجى إدخال كود المحافظة للتليفون الأرضي' : 'Please enter the area code for your landline');
          return;
        }
      } else if (subStepIndex === 4) {
        for (const [platform, data] of Object.entries(socials)) {
          if (data.url.trim()) {
            try {
              const testUrl = data.url.trim().startsWith('http') ? data.url.trim() : `https://${data.url.trim()}`;
              new URL(testUrl);
            } catch {
              setErrorMessage(isRtl ? `رابط ${platform} غير صحيح` : `Invalid URL format for ${platform}`);
              return;
            }
          }
        }
      }
    } else if (mainStepIndex === 5) {
      if (subStepIndex === 1) {
        if (!city.trim() && !streetAddress.trim()) {
          setErrorMessage(isRtl ? 'يرجى إدخال المدينة أو اسم الشارع' : 'Please enter city/district or street');
          return;
        }
      }
    }

    // Move to next sub-step or next main step
    setSlideDirection('forward');
    if (subStepIndex < currentMainConfig.subSteps.length) {
      setSubStepIndex((prev) => prev + 1);
    } else if (mainStepIndex < TOTAL_REGISTRATION_MAIN_STEPS) {
      setMainStepIndex((prev) => prev + 1);
      setSubStepIndex(1);
    } else {
      // Advance to Password step (8)
      setMainStepIndex(8);
      setSubStepIndex(1);
    }
  };

  const handleBack = () => {
    setErrorMessage(null);
    setSlideDirection('backward');
    if (mainStepIndex === 2 && subStepIndex === 1 && isPhoneOtpActive) {
      setIsPhoneOtpActive(false);
      return;
    }
    if (mainStepIndex === 8) {
      // Back from Password to Step 7 last sub-step
      setMainStepIndex(7);
      setSubStepIndex(REGISTRATION_SCHEMA[6].subSteps.length);
    } else if (subStepIndex > 1) {
      setSubStepIndex((prev) => prev - 1);
    } else if (mainStepIndex > 1) {
      const prevMain = mainStepIndex - 1;
      setMainStepIndex(prevMain);
      setSubStepIndex(REGISTRATION_SCHEMA[prevMain - 1].subSteps.length);
    } else {
      if (onNavigateLogin) onNavigateLogin();
      else router.push('/login');
    }
  };

  const handleSkip = () => {
    setErrorMessage(null);
    setSlideDirection('forward');
    if (mainStepIndex === 1 && subStepIndex === 6) {
      setPhotoSkippedGracePeriod(true);
    }
    if (subStepIndex < currentMainConfig.subSteps.length) {
      setSubStepIndex((prev) => prev + 1);
    } else if (mainStepIndex < TOTAL_REGISTRATION_MAIN_STEPS) {
      setMainStepIndex((prev) => prev + 1);
      setSubStepIndex(1);
    } else {
      setMainStepIndex(8);
    }
  };

  // Final Submit Action
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 8) {
      setErrorMessage(isRtl ? 'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل' : 'Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(isRtl ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      let avatarBase64: string | undefined;
      let avatarFileName: string | undefined;

      if (avatarFile) {
        avatarBase64 = await fileToBase64(avatarFile);
        avatarFileName = avatarFile.name;
      }

      const payload: CreateAccountPayload = {
        englishName: fullEnglishName,
        hasNameCollision: false,
        arabicName: fullArabicName,
        dob: formattedDob,
        gender,
        nationalId: nationalId.trim(),
        avatarBase64,
        avatarFileName,
        photoSkippedGracePeriod,
        phones: [{ countryCode, number: phoneNumber.trim(), isPrimary: true }],
        emails: email.trim() ? [{ email: email.trim(), isPrimary: true }] : [],
        landlineAreaCode: landlineAreaCode.trim() || undefined,
        landlineNumber: landlineNumber.trim() || undefined,
        socials,
        password,
        maritalStatus,
        guardianName: guardianName.trim() || undefined,
        guardianPhone: guardianPhone.trim() || undefined,
        familyRelationType,
        educationStage,
        facultyOrSchool: facultyOrSchool.trim() || undefined,
        profession: profession.trim() || undefined,
        workplace: workplace.trim() || undefined,
        governorate,
        city: city.trim() || undefined,
        streetAddress: streetAddress.trim() || undefined,
        buildingNumber: buildingNumber.trim() || undefined,
        floorNumber: floorNumber.trim() || undefined,
        apartmentNumber: apartmentNumber.trim() || undefined,
        secondaryAddress: secondaryAddress.trim() || undefined,
        diocese: diocese.trim() || undefined,
        primaryChurch: primaryChurch.trim() || undefined,
        secondaryChurch: secondaryChurch.trim() || undefined,
        priestName: priestName.trim() || undefined,
        hobbies: selectedHobbies,
        languages: selectedLanguages,
      };

      const result = await createAccountAction(payload);

      if (!result.success) {
        setErrorMessage(result.error || (isRtl ? 'حدث خطأ أثناء إنشاء الحساب' : 'Failed to create account.'));
        setLoading(false);
        return;
      }

      clearAllRegistrationDrafts();
      setMainStepIndex(9); // Success
      setLoading(false);

      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 2400);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setErrorMessage(msg);
      setLoading(false);
    }
  };

  // Header texts
  const getHeader = () => {
    if (mainStepIndex === 2 && subStepIndex === 1 && isPhoneOtpActive) {
      return {
        title: isRtl ? 'تأكيد رقم الهاتف' : 'Verify your phone number',
        subtitle: isRtl
          ? `أدخل رمز التحقق المكون من 6 أرقام المرسل إلى ${countryCode} ${phoneNumber}`
          : `Enter the 6-digit verification code sent to ${countryCode} ${phoneNumber}`,
      };
    }
    if (mainStepIndex === 8) {
      return {
        title: isRtl ? 'تعيين كلمة المرور' : 'Create a Password',
        subtitle: isRtl ? 'أنشئ كلمة مرور قوية لحماية وتأمين حسابك الدائم' : 'Create a strong password to secure your permanent lifetime profile',
      };
    }
    if (mainStepIndex === 9) {
      return {
        title: isRtl ? 'تم إنشاء الحساب بنجاح!' : 'Account Created Successfully!',
        subtitle: isRtl ? 'جاري تجهيز لوحة التحكم ونقلك تلقائياً...' : 'Your universal lifetime profile is active. Redirecting to your dashboard...',
      };
    }
    return {
      title: isRtl ? currentSubConfig?.labelAr || currentMainConfig?.titleAr : currentSubConfig?.labelEn || currentMainConfig?.titleEn,
      subtitle: isRtl ? currentMainConfig?.titleAr : currentMainConfig?.titleEn,
    };
  };

  const header = getHeader();

  // Floating label helpers
  const isEnglishFullNameFloating = isEnglishFullNameFocused || englishFullName.length > 0;
  const isArabicFullNameFloating = isArabicFullNameFocused || arabicFullName.length > 0;
  const isDobFloating = isDobFocused || dob.length > 0;
  const isNationalIdFloating = isNationalIdFocused || nationalId.length > 0;
  const isPhoneFloating = isPhoneFocused || phoneNumber.length > 0;
  const isEmailFloating = isEmailFocused || email.length > 0;
  const isPasswordFloating = isPasswordFocused || password.length > 0;
  const isConfirmPasswordFloating = isConfirmPasswordFocused || confirmPassword.length > 0;

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="relative w-full min-h-screen shared-bg flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 transition-colors duration-300 overflow-x-hidden"
    >
      {/* Main Authentication Card */}
      <div className="relative z-20 w-full max-w-[1040px] bg-white/95 dark:bg-[#1B212D]/95 rounded-[28px] sm:rounded-[36px] p-6 sm:p-8 md:p-12 shadow-2xl border border-white/60 dark:border-slate-800/80 flex flex-col md:flex-row gap-8 md:gap-14 min-h-fit h-auto items-start transition-all duration-300 ease-in-out">
        {/* Left Column: Dynamic Progress Indicator & Step Headers */}
        <div className="w-full md:w-1/2 flex flex-col justify-start items-start text-start min-h-[420px]">
          <div className="space-y-3 w-full">
            {/* Integrated Step Progress Bar & Milestone Indicator */}
            {mainStepIndex <= 8 && (
              <div className="space-y-2.5 w-full">
                {/* Milestone & Sub-step Pill */}
                <div className="flex flex-wrap items-center gap-3">
                  <Image
                    src="/logo.png"
                    alt="Politia logo"
                    width={32}
                    height={32}
                    priority
                    style={{ height: 'auto' }}
                    className="object-contain shrink-0"
                  />
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/50 text-[#0B57D0] dark:text-[#93C5FD] border border-blue-200 dark:border-blue-700/50 text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0B57D0] dark:bg-[#60A5FA] animate-pulse" />
                    <span>
                      <bdi suppressHydrationWarning>
                        {mainStepIndex === 8
                          ? isRtl ? 'الخطوة الأخيرة: كلمة المرور' : 'Final Step: Password'
                          : isRtl
                          ? `الخطوة ${mainStepIndex} من ${TOTAL_REGISTRATION_MAIN_STEPS}: ${currentMainConfig?.titleAr}`
                          : `Step ${mainStepIndex} of ${TOTAL_REGISTRATION_MAIN_STEPS}: ${currentMainConfig?.titleEn}`}
                      </bdi>
                    </span>
                  </span>

                  {mainStepIndex <= 7 && (
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50">
                      <bdi suppressHydrationWarning>
                        {isRtl
                          ? `القسم ${subStepIndex}/${currentMainConfig?.subSteps.length}`
                          : `Part ${subStepIndex}/${currentMainConfig?.subSteps.length}`}
                      </bdi>
                    </span>
                  )}
                </div>

                {/* Smooth Animated Progress Bar */}
                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                  <div
                    className="h-full bg-gradient-to-r from-[#0B57D0] to-[#3B82F6] dark:from-[#3B82F6] dark:to-[#60A5FA] rounded-full transition-all duration-300 shadow-sm"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            )}

            {/* Dynamic Step Title & Subtitle */}
            <h1 className="text-[30px] sm:text-[34px] font-normal text-[#1F1F1F] dark:text-[#E3E3E3] tracking-tight leading-[1.15] pt-1">
              <bdi suppressHydrationWarning>{header.title}</bdi>
            </h1>
            <p className="text-[15px] sm:text-[16px] text-[#1F1F1F] dark:text-[#C4C7C5] font-normal leading-relaxed">
              <bdi suppressHydrationWarning>{header.subtitle}</bdi>
            </p>
          </div>
        </div>

        {/* Right Column: Dynamic Form Area (Vertically Centered with lateral slide transition) */}
        <div className="w-full md:w-1/2 flex flex-col justify-between min-h-[420px] overflow-hidden transition-all duration-300 ease-in-out">
          {/* Milestone 1: Personal Info */}
          {mainStepIndex === 1 && (
            <form onSubmit={handleAdvance} className="w-full flex-1 flex flex-col justify-between min-h-[420px] space-y-4">
              <div
                key={`1-${subStepIndex}`}
                className={`w-full flex-1 flex flex-col justify-center py-2 ${slideDirection === 'forward' ? 'animate-slide-forward' : 'animate-slide-backward'}`}
              >
                {/* 1.1: English Full Name */}
              {subStepIndex === 1 && (
                <div className="space-y-3 py-2">
                  <div className="relative">
                    <input
                      id="reg-full-name-en"
                      type="text"
                      dir="ltr"
                      autoFocus
                      value={englishFullName}
                      onFocus={() => setIsEnglishFullNameFocused(true)}
                      onBlur={() => setIsEnglishFullNameFocused(false)}
                      onChange={(e) => {
                        setEnglishFullName(autoCapitalizeEnglishName(e.target.value));
                      }}
                      className={`w-full h-[56px] px-4 text-[15px] text-[#1F1F1F] dark:text-[#E3E3E3] bg-transparent rounded-[4px] focus:outline-none transition-all box-border ${
                        errorMessage
                          ? 'border-2 border-[#B3261E] dark:border-[#F2B8B5]'
                          : isEnglishFullNameFocused
                          ? 'border-2 border-[#0B57D0] dark:border-[#A8C7FA]'
                          : 'border border-[#747775] dark:border-[#8E918F] hover:border-[#1F1F1F] dark:hover:border-white'
                      }`}
                    />
                    <label
                      htmlFor="reg-full-name-en"
                      className={`absolute pointer-events-none transition-all duration-150 start-3 ${
                        isEnglishFullNameFloating
                          ? '-top-2.5 px-1 text-xs bg-white dark:bg-[#1B212D]'
                          : 'top-4 text-[15px]'
                      } ${
                        errorMessage
                          ? 'text-[#B3261E] dark:text-[#F2B8B5]'
                          : isEnglishFullNameFocused
                          ? 'text-[#0B57D0] dark:text-[#A8C7FA]'
                          : 'text-[#444746] dark:text-[#8E918F]'
                      }`}
                    >
                      <bdi>{isRtl ? 'الاسم الرباعي بالإنجليزية' : 'Full Name (English)'}</bdi>
                    </label>
                  </div>
                </div>
              )}

              {/* 1.2: Arabic Full Name */}
              {subStepIndex === 2 && (
                <div className="space-y-3 py-2">
                  <div className="relative">
                    <input
                      id="reg-full-name-ar"
                      type="text"
                      dir="rtl"
                      autoFocus
                      value={arabicFullName}
                      onFocus={() => setIsArabicFullNameFocused(true)}
                      onBlur={() => setIsArabicFullNameFocused(false)}
                      onChange={(e) => {
                        setArabicFullName(e.target.value);
                      }}
                      className={`w-full h-[56px] px-4 text-[15px] text-[#1F1F1F] dark:text-[#E3E3E3] bg-transparent rounded-[4px] focus:outline-none transition-all box-border text-right ${
                        errorMessage
                          ? 'border-2 border-[#B3261E] dark:border-[#F2B8B5]'
                          : isArabicFullNameFocused
                          ? 'border-2 border-[#0B57D0] dark:border-[#A8C7FA]'
                          : 'border border-[#747775] dark:border-[#8E918F] hover:border-[#1F1F1F] dark:hover:border-white'
                      }`}
                    />
                    <label
                      htmlFor="reg-full-name-ar"
                      className={`absolute pointer-events-none transition-all duration-150 start-3 ${
                        isArabicFullNameFloating
                          ? '-top-2.5 px-1 text-xs bg-white dark:bg-[#1B212D]'
                          : 'top-4 text-[15px]'
                      } ${
                        errorMessage
                          ? 'text-[#B3261E] dark:text-[#F2B8B5]'
                          : isArabicFullNameFocused
                          ? 'text-[#0B57D0] dark:text-[#A8C7FA]'
                          : 'text-[#444746] dark:text-[#8E918F]'
                      }`}
                    >
                      <bdi>{isRtl ? 'الاسم الرباعي باللغة العربية' : 'Full Name (Arabic)'}</bdi>
                    </label>
                  </div>
                </div>
              )}

              {/* 1.3: Gender */}
              {subStepIndex === 3 && (
                <div className="grid grid-cols-2 gap-3.5 py-2">
                  <button
                    type="button"
                    onClick={() => setGender('Male')}
                    className={`p-5 rounded-2xl border-2 flex flex-col items-center justify-center gap-2.5 transition cursor-pointer ${
                      gender === 'Male'
                        ? 'border-[#0B57D0] dark:border-[#A8C7FA] bg-blue-50/70 dark:bg-blue-950/40 font-semibold text-[#0B57D0] dark:text-[#A8C7FA] shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="text-3xl">👨</span>
                    <span className="text-sm font-semibold"><bdi>{isRtl ? 'ذكر' : 'Male'}</bdi></span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGender('Female')}
                    className={`p-5 rounded-2xl border-2 flex flex-col items-center justify-center gap-2.5 transition cursor-pointer ${
                      gender === 'Female'
                        ? 'border-[#0B57D0] dark:border-[#A8C7FA] bg-blue-50/70 dark:bg-blue-950/40 font-semibold text-[#0B57D0] dark:text-[#A8C7FA] shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="text-3xl">👩</span>
                    <span className="text-sm font-semibold"><bdi>{isRtl ? 'أنثى' : 'Female'}</bdi></span>
                  </button>
                </div>
              )}

              {/* 1.4: Date of Birth */}
              {subStepIndex === 4 && (
                <div className="space-y-3 py-2">
                  <div className="relative">
                    <input
                      id="reg-dob"
                      type="date"
                      autoFocus
                      value={dob}
                      onFocus={() => setIsDobFocused(true)}
                      onBlur={() => setIsDobFocused(false)}
                      onChange={(e) => {
                        setDob(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      className={`w-full h-[56px] px-4 text-[15px] text-[#1F1F1F] dark:text-[#E3E3E3] bg-transparent rounded-[4px] focus:outline-none transition-all box-border ${
                        errorMessage
                          ? 'border-2 border-[#B3261E] dark:border-[#F2B8B5]'
                          : isDobFocused
                          ? 'border-2 border-[#0B57D0] dark:border-[#A8C7FA]'
                          : 'border border-[#747775] dark:border-[#8E918F] hover:border-[#1F1F1F] dark:hover:border-white'
                      }`}
                    />
                    <label
                      htmlFor="reg-dob"
                      className={`absolute pointer-events-none transition-all duration-150 start-3 -top-2.5 px-1 text-xs bg-white dark:bg-[#1B212D] ${
                        errorMessage
                          ? 'text-[#B3261E] dark:text-[#F2B8B5]'
                          : isDobFocused
                          ? 'text-[#0B57D0] dark:text-[#A8C7FA]'
                          : 'text-[#444746] dark:text-[#8E918F]'
                      }`}
                    >
                      <bdi>{isRtl ? 'تاريخ الميلاد' : 'Date of Birth'}</bdi>
                    </label>
                  </div>
                  {currentAge !== null && (
                    <span className="inline-flex items-center text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <bdi>{isRtl ? `العمر: ${currentAge} سنة` : `Age: ${currentAge} years old`}</bdi>
                    </span>
                  )}
                </div>
              )}

              {/* 1.5: Egyptian National ID */}
              {subStepIndex === 5 && (
                <div className="space-y-3 py-2">
                  <div className="relative">
                    <input
                      id="reg-national-id"
                      type="text"
                      dir="ltr"
                      maxLength={14}
                      autoFocus
                      value={nationalId}
                      onFocus={() => setIsNationalIdFocused(true)}
                      onBlur={() => setIsNationalIdFocused(false)}
                      onChange={(e) => {
                        setNationalId(e.target.value.replace(/\D/g, ''));
                        if (errorMessage) setErrorMessage(null);
                      }}
                      className={`w-full h-[56px] px-4 text-[16px] font-mono tracking-widest text-[#1F1F1F] dark:text-[#E3E3E3] bg-transparent rounded-[4px] focus:outline-none transition-all box-border ${
                        errorMessage
                          ? 'border-2 border-[#B3261E] dark:border-[#F2B8B5]'
                          : isNationalIdFocused
                          ? 'border-2 border-[#0B57D0] dark:border-[#A8C7FA]'
                          : 'border border-[#747775] dark:border-[#8E918F] hover:border-[#1F1F1F] dark:hover:border-white'
                      }`}
                    />
                    <label
                      htmlFor="reg-national-id"
                      className={`absolute pointer-events-none transition-all duration-150 start-3 ${
                        isNationalIdFloating
                          ? '-top-2.5 px-1 text-xs bg-white dark:bg-[#1B212D]'
                          : 'top-4 text-[15px]'
                      } ${
                        errorMessage
                          ? 'text-[#B3261E] dark:text-[#F2B8B5]'
                          : isNationalIdFocused
                          ? 'text-[#0B57D0] dark:text-[#A8C7FA]'
                          : 'text-[#444746] dark:text-[#8E918F]'
                      }`}
                    >
                      <bdi>{isRtl ? 'الرقم القومي (14 رقماً)' : 'National ID (14 Digits)'}</bdi>
                    </label>
                  </div>
                  {nationalIdValidation.parsedData && (
                    <span className="inline-flex items-center text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <bdi>
                        {isRtl
                          ? `📍 المحافظة: ${nationalIdValidation.parsedData.provinceNameAr}`
                          : `📍 Governorate: ${nationalIdValidation.parsedData.provinceNameEn}`}
                      </bdi>
                    </span>
                  )}
                </div>
              )}

              {/* 1.6: Profile Picture */}
              {subStepIndex === 6 && (
                <div className="flex flex-col items-center justify-center text-center space-y-4 py-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />

                  <div className="relative group">
                    <div className="w-28 h-28 rounded-full border-2 border-dashed border-slate-400 dark:border-slate-600 flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-800 shadow-inner">
                      {avatarPreview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-14 h-14 text-gray-400" />
                      )}
                    </div>

                    {avatarPreview && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setRawImageToEdit(avatarPreview);
                            setIsEditorOpen(true);
                          }}
                          title={isRtl ? 'تعديل وقص' : 'Edit & Crop'}
                          className="absolute bottom-0 start-0 p-1.5 rounded-full bg-[#0B57D0] text-white shadow hover:bg-[#0842A0] cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAvatarFile(null);
                            setAvatarPreview(null);
                          }}
                          title={isRtl ? 'حذف' : 'Remove'}
                          className="absolute bottom-0 end-0 p-1.5 rounded-full bg-red-600 text-white shadow hover:bg-red-700 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer text-slate-700 dark:text-slate-200"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#0B57D0] dark:text-[#A8C7FA]" />
                      <span><bdi>{isRtl ? 'رفع ملف' : 'Upload'}</bdi></span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsCameraOpen(true)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer text-slate-700 dark:text-slate-200"
                    >
                      <Camera className="w-3.5 h-3.5 text-[#0B57D0] dark:text-[#A8C7FA]" />
                      <span><bdi>{isRtl ? 'التقاط بالكاميرا' : 'Take photo'}</bdi></span>
                    </button>
                  </div>
                </div>
              )}

              {/* Error Alert */}
              {errorMessage && (
                <div id="register-error-alert" className="flex items-center gap-2 text-xs text-[#B3261E] dark:text-[#F2B8B5] mt-3">
                  <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#B3261E] dark:bg-[#F2B8B5] text-white dark:text-[#601410] text-[11px] font-bold select-none leading-none pb-[1px]">
                    !
                  </span>
                  <bdi id="error-message-text">{errorMessage}</bdi>
                </div>
              )}
            </div>

              {/* Navigation Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={handleBack}
                  className="text-xs sm:text-sm font-semibold text-[#0B57D0] dark:text-[#93C5FD] hover:underline px-3 py-2 rounded-full transition-colors cursor-pointer"
                >
                  <bdi>{isRtl ? 'السابق' : 'Back'}</bdi>
                </button>

                <div className="flex items-center gap-2">
                  {currentSubConfig?.isOptional && (
                    <button
                      type="button"
                      onClick={handleSkip}
                      className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 px-3.5 py-2 rounded-full transition cursor-pointer"
                    >
                      <bdi>{isRtl ? 'تخطي' : 'Skip'}</bdi>
                    </button>
                  )}

                  <button
                    type="submit"
                    className="bg-[#0B57D0] hover:bg-[#0842A0] active:bg-[#06337E] text-white text-xs sm:text-sm font-semibold px-6 py-2.5 rounded-full transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                  >
                    <bdi>{isRtl ? 'التالي' : 'Next'}</bdi>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Milestone 2: Contact & Social */}
          {mainStepIndex === 2 && (
            <form onSubmit={handleAdvance} className="w-full flex-1 flex flex-col justify-between min-h-[420px] space-y-4">
              <div
                key={`2-${subStepIndex}`}
                className={`w-full flex-1 flex flex-col justify-center py-2 ${slideDirection === 'forward' ? 'animate-slide-forward' : 'animate-slide-backward'}`}
              >
                {/* 2.1: Phone Number & OTP Verification */}
              {subStepIndex === 1 && (
                <div className="space-y-4 py-2">
                  {isPhoneOtpActive ? (
                    /* 6-Digit OTP Verification View */
                    <div className="space-y-5 animate-fadeIn">
                      {/* Active Phone Chip */}
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2 text-xs font-mono font-semibold text-slate-800 dark:text-slate-200">
                          <span className="text-base">{getCountryByIso(countryIso)?.flag || '🌐'}</span>
                          <span>{countryCode} {phoneNumber}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIsPhoneOtpActive(false);
                            if (errorMessage) setErrorMessage(null);
                          }}
                          className="text-xs font-semibold text-[#0B57D0] dark:text-[#93C5FD] hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <Pencil className="w-3 h-3" />
                          <span><bdi>{isRtl ? 'تعديل الرقم' : 'Edit Number'}</bdi></span>
                        </button>
                      </div>

                      {/* 6-Box Segmented OTP Inputs */}
                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 text-center">
                          <bdi>{isRtl ? 'أدخل رمز التحقق (6 أرقام)' : 'Enter 6-digit verification code'}</bdi>
                        </label>
                        <div className="flex items-center justify-center gap-2 sm:gap-2.5" dir="ltr">
                          {otpDigits.map((digit, index) => (
                            <input
                              key={index}
                              ref={(el) => { otpInputRefs.current[index] = el; }}
                              type="text"
                              inputMode="numeric"
                              pattern="\d*"
                              maxLength={1}
                              value={digit}
                              autoFocus={index === 0}
                              onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                              onKeyDown={(e) => handleOtpKeyDown(index, e)}
                              className={`w-11 sm:w-12 h-13 sm:h-14 text-center font-mono text-xl sm:text-2xl font-bold rounded-lg border bg-transparent text-[#1F1F1F] dark:text-[#E3E3E3] focus:outline-none transition-all box-border ${
                                digit
                                  ? 'border-[#0B57D0] dark:border-[#A8C7FA] bg-blue-50/20 dark:bg-blue-900/10'
                                  : 'border-[#747775] dark:border-[#8E918F]'
                              } focus:border-2 focus:border-[#0B57D0] dark:focus:border-[#A8C7FA] shadow-sm`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Resend Timer & Demo Code Badge */}
                      <div className="flex flex-col items-center gap-2 pt-1">
                        <div className="flex items-center justify-center gap-2 text-xs">
                          {otpResendTimer > 0 ? (
                            <span className="text-slate-500 dark:text-slate-400">
                              <bdi>
                                {isRtl
                                  ? `إعادة إرسال الرمز خلال 0:${otpResendTimer < 10 ? '0' : ''}${otpResendTimer}`
                                  : `Resend code in 0:${otpResendTimer < 10 ? '0' : ''}${otpResendTimer}`}
                              </bdi>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={handleSendPhoneOtp}
                              disabled={isSendingOtp}
                              className="text-[#0B57D0] dark:text-[#93C5FD] font-semibold hover:underline cursor-pointer flex items-center gap-1.5"
                            >
                              <RotateCw className={`w-3 h-3 ${isSendingOtp ? 'animate-spin' : ''}`} />
                              <span><bdi>{isRtl ? 'إعادة إرسال الرمز' : 'Resend Code'}</bdi></span>
                            </button>
                          )}
                        </div>

                        {demoOtpNotice && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-mono">
                            <span>💡</span>
                            <span><bdi>{isRtl ? `رمز التجربة: ${demoOtpNotice}` : `Test code: ${demoOtpNotice}`}</bdi></span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Phone Number & Country Code View */
                    <div className="space-y-4">
                      {/* Country Selector */}
                      <div className="relative">
                        <select
                          id="reg-country"
                          value={countryIso}
                          onChange={(e) => {
                            const iso = e.target.value;
                            setCountryIso(iso);
                            const found = getCountryByIso(iso);
                            if (found) setCountryCode(found.dialCode);
                            setIsPhoneVerified(false);
                          }}
                          className="w-full h-[56px] px-4 text-[15px] text-[#1F1F1F] dark:text-[#E3E3E3] bg-transparent rounded-[4px] border border-[#747775] dark:border-[#8E918F] focus:border-2 focus:border-[#0B57D0] dark:focus:border-[#A8C7FA] focus:outline-none transition-all box-border cursor-pointer appearance-none"
                        >
                          {ALL_COUNTRIES.map((c) => (
                            <option
                              key={c.iso}
                              value={c.iso}
                              className="bg-white dark:bg-[#1B212D] text-[#1F1F1F] dark:text-[#E3E3E3]"
                            >
                              {c.flag} {getLocalizedCountryName(c.iso, locale)} ({c.dialCode})
                            </option>
                          ))}
                        </select>
                        <label
                          htmlFor="reg-country"
                          className="absolute -top-2.5 px-1.5 text-xs bg-white dark:bg-[#1B212D] text-[#0B57D0] dark:text-[#A8C7FA] start-3 pointer-events-none z-10"
                        >
                          <bdi>{isRtl ? 'الدولة' : 'Country'}</bdi>
                        </label>
                        <div className="absolute end-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 dark:text-slate-400">
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </div>

                      {/* Phone Number Input with Dial Code Badge */}
                      <div className="flex gap-2.5 items-center">
                        <div className="h-[56px] px-3.5 flex items-center justify-center rounded-[4px] border border-[#747775] dark:border-[#8E918F] bg-slate-50 dark:bg-slate-800/50 text-[#1F1F1F] dark:text-[#E3E3E3] font-mono text-sm font-semibold shrink-0">
                          {countryCode}
                        </div>

                        <div className="flex-1 relative">
                          <input
                            id="reg-phone"
                            type="tel"
                            dir="ltr"
                            autoFocus
                            placeholder={
                              isPhoneFocused || isPhoneFloating
                                ? getCountryByIso(countryIso)?.placeholder || '010 1234 5678'
                                : ''
                            }
                            value={phoneNumber}
                            onFocus={() => setIsPhoneFocused(true)}
                            onBlur={() => setIsPhoneFocused(false)}
                            onChange={(e) => {
                              setPhoneNumber(e.target.value);
                              setIsPhoneVerified(false);
                              if (errorMessage) setErrorMessage(null);
                            }}
                            className={`w-full h-[56px] px-4 text-[15px] font-mono text-[#1F1F1F] dark:text-[#E3E3E3] bg-transparent rounded-[4px] focus:outline-none transition-all box-border ${
                              errorMessage
                                ? 'border-2 border-[#B3261E] dark:border-[#F2B8B5]'
                                : isPhoneFocused
                                ? 'border-2 border-[#0B57D0] dark:border-[#A8C7FA]'
                                : 'border border-[#747775] dark:border-[#8E918F] hover:border-[#1F1F1F] dark:hover:border-white'
                            }`}
                          />
                          <label
                            htmlFor="reg-phone"
                            className={`absolute pointer-events-none transition-all duration-150 start-3 z-10 ${
                              isPhoneFloating
                                ? '-top-2.5 px-1.5 text-xs bg-white dark:bg-[#1B212D]'
                                : 'top-4 text-[15px]'
                            } ${
                              errorMessage
                                ? 'text-[#B3261E] dark:text-[#F2B8B5]'
                                : isPhoneFocused
                                ? 'text-[#0B57D0] dark:text-[#A8C7FA]'
                                : 'text-[#444746] dark:text-[#8E918F]'
                            }`}
                          >
                            <bdi>{isRtl ? 'رقم الهاتف المحمول' : 'Mobile Phone Number'}</bdi>
                          </label>
                        </div>
                      </div>

                      {/* Verified Badge */}
                      {isPhoneVerified && (
                        <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 animate-fadeIn">
                          <div className="flex items-center gap-2 text-xs font-semibold">
                            <CheckCircle2 className="w-4 h-4" />
                            <span><bdi>{isRtl ? 'تم تأكيد رقم الهاتف بنجاح ✓' : 'Phone Number Verified ✓'}</bdi></span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setIsPhoneVerified(false);
                              setIsPhoneOtpActive(false);
                            }}
                            className="text-xs text-slate-500 dark:text-slate-400 hover:underline cursor-pointer"
                          >
                            <bdi>{isRtl ? 'تغيير' : 'Change'}</bdi>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 2.2: Email */}
              {subStepIndex === 2 && (
                <div className="relative py-2">
                  <input
                    id="reg-email"
                    type="email"
                    dir="ltr"
                    autoFocus
                    value={email}
                    onFocus={() => setIsEmailFocused(true)}
                    onBlur={() => setIsEmailFocused(false)}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    className={`w-full h-[56px] px-4 text-[15px] text-[#1F1F1F] dark:text-[#E3E3E3] bg-transparent rounded-[4px] focus:outline-none transition-all box-border ${
                      isEmailFocused
                        ? 'border-2 border-[#0B57D0] dark:border-[#A8C7FA]'
                        : 'border border-[#747775] dark:border-[#8E918F] hover:border-[#1F1F1F] dark:hover:border-white'
                    }`}
                  />
                  <label
                    htmlFor="reg-email"
                    className={`absolute pointer-events-none transition-all duration-150 start-3 ${
                      isEmailFloating ? '-top-2.5 px-1 text-xs bg-white dark:bg-[#1B212D]' : 'top-4 text-[15px]'
                    } text-[#0B57D0] dark:text-[#A8C7FA]`}
                  >
                    <bdi>{isRtl ? 'البريد الإلكتروني (اختياري)' : 'Email Address (Optional)'}</bdi>
                  </label>
                </div>
              )}

              {/* 2.3: Landline */}
              {subStepIndex === 3 && (
                <div className="flex gap-2 py-2">
                  <div className="w-[110px] shrink-0 relative">
                    <input
                      id="reg-landline-code"
                      type="text"
                      dir="ltr"
                      maxLength={4}
                      value={landlineAreaCode}
                      onChange={(e) => {
                        setLandlineAreaCode(e.target.value.replace(/\D/g, ''));
                        if (errorMessage) setErrorMessage(null);
                      }}
                      className="w-full h-[56px] px-3 text-sm font-mono text-[#1F1F1F] dark:text-[#E3E3E3] bg-transparent rounded-[4px] border border-[#747775] dark:border-[#8E918F] focus:border-2 focus:border-[#0B57D0] dark:focus:border-[#A8C7FA] focus:outline-none transition-all box-border"
                    />
                    <label htmlFor="reg-landline-code" className="absolute -top-2.5 px-1 text-xs bg-white dark:bg-[#1B212D] text-[#0B57D0] dark:text-[#A8C7FA] start-2 pointer-events-none">
                      <bdi>{isRtl ? 'كود المحافظة' : 'Area Code'}</bdi>
                    </label>
                  </div>

                  <div className="flex-1 relative">
                    <input
                      id="reg-landline-num"
                      type="text"
                      dir="ltr"
                      maxLength={10}
                      autoFocus
                      value={landlineNumber}
                      onChange={(e) => {
                        setLandlineNumber(e.target.value.replace(/\D/g, ''));
                        if (errorMessage) setErrorMessage(null);
                      }}
                      className="w-full h-[56px] px-4 text-sm font-mono text-[#1F1F1F] dark:text-[#E3E3E3] bg-transparent rounded-[4px] border border-[#747775] dark:border-[#8E918F] focus:border-2 focus:border-[#0B57D0] dark:focus:border-[#A8C7FA] focus:outline-none transition-all box-border"
                    />
                    <label htmlFor="reg-landline-num" className="absolute -top-2.5 px-1 text-xs bg-white dark:bg-[#1B212D] text-[#0B57D0] dark:text-[#A8C7FA] start-3 pointer-events-none">
                      <bdi>{isRtl ? 'رقم التليفون الأرضي (اختياري)' : 'Landline Number (Optional)'}</bdi>
                    </label>
                  </div>
                </div>
              )}

              {/* 2.4: Social Links */}
              {subStepIndex === 4 && (
                <div className="space-y-3 py-2">
                  <div className="relative">
                    <input
                      id="reg-social-fb"
                      type="url"
                      dir="ltr"
                      value={socials.facebook.url}
                      onChange={(e) => setSocials((prev) => ({ ...prev, facebook: { url: e.target.value } }))}
                      className="w-full h-[50px] px-3 text-xs text-[#1F1F1F] dark:text-[#E3E3E3] bg-transparent rounded-[4px] border border-[#747775] dark:border-[#8E918F] focus:border-2 focus:border-[#0B57D0] dark:focus:border-[#A8C7FA] focus:outline-none transition-all box-border"
                    />
                    <label htmlFor="reg-social-fb" className="absolute -top-2.5 px-1 text-xs bg-white dark:bg-[#1B212D] text-[#0B57D0] dark:text-[#A8C7FA] start-3 pointer-events-none">
                      <bdi>Facebook (https://facebook.com/...)</bdi>
                    </label>
                  </div>

                  <div className="relative">
                    <input
                      id="reg-social-ig"
                      type="url"
                      dir="ltr"
                      value={socials.instagram.url}
                      onChange={(e) => setSocials((prev) => ({ ...prev, instagram: { url: e.target.value } }))}
                      className="w-full h-[50px] px-3 text-xs text-[#1F1F1F] dark:text-[#E3E3E3] bg-transparent rounded-[4px] border border-[#747775] dark:border-[#8E918F] focus:border-2 focus:border-[#0B57D0] dark:focus:border-[#A8C7FA] focus:outline-none transition-all box-border"
                    />
                    <label htmlFor="reg-social-ig" className="absolute -top-2.5 px-1 text-xs bg-white dark:bg-[#1B212D] text-[#0B57D0] dark:text-[#A8C7FA] start-3 pointer-events-none">
                      <bdi>Instagram (https://instagram.com/...)</bdi>
                    </label>
                  </div>

                  <div className="relative">
                    <input
                      id="reg-social-li"
                      type="url"
                      dir="ltr"
                      value={socials.linkedin.url}
                      onChange={(e) => setSocials((prev) => ({ ...prev, linkedin: { url: e.target.value } }))}
                      className="w-full h-[50px] px-3 text-xs text-[#1F1F1F] dark:text-[#E3E3E3] bg-transparent rounded-[4px] border border-[#747775] dark:border-[#8E918F] focus:border-2 focus:border-[#0B57D0] dark:focus:border-[#A8C7FA] focus:outline-none transition-all box-border"
                    />
                    <label htmlFor="reg-social-li" className="absolute -top-2.5 px-1 text-xs bg-white dark:bg-[#1B212D] text-[#0B57D0] dark:text-[#A8C7FA] start-3 pointer-events-none">
                      <bdi>LinkedIn (https://linkedin.com/in/...)</bdi>
                    </label>
                  </div>
                </div>
              )}

              {/* Error Alert */}
              {errorMessage && (
                <div id="register-error-alert" className="flex items-center gap-2 text-xs text-[#B3261E] dark:text-[#F2B8B5] mt-3">
                  <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#B3261E] dark:bg-[#F2B8B5] text-white dark:text-[#601410] text-[11px] font-bold select-none leading-none pb-[1px]">
                    !
                  </span>
                  <bdi id="error-message-text">{errorMessage}</bdi>
                </div>
              )}
            </div>

              {/* Navigation Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={handleBack}
                  className="text-xs sm:text-sm font-semibold text-[#0B57D0] dark:text-[#93C5FD] hover:underline px-3 py-2 rounded-full transition-colors cursor-pointer"
                >
                  <bdi>{isRtl ? 'السابق' : 'Back'}</bdi>
                </button>

                <div className="flex items-center gap-2">
                  {currentSubConfig?.isOptional && (
                    <button
                      type="button"
                      onClick={handleSkip}
                      className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 px-3.5 py-2 rounded-full transition cursor-pointer"
                    >
                      <bdi>{isRtl ? 'تخطي' : 'Skip'}</bdi>
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={isSendingOtp || isVerifyingOtp}
                    className="bg-[#0B57D0] hover:bg-[#0842A0] active:bg-[#06337E] text-white text-xs sm:text-sm font-semibold px-6 py-2.5 rounded-full transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {(isSendingOtp || isVerifyingOtp) && <Loader2 className="w-4 h-4 animate-spin" />}
                    <bdi>
                      {subStepIndex === 1
                        ? isPhoneOtpActive
                          ? isRtl
                            ? 'تحقق ومتابعة'
                            : 'Verify & Continue'
                          : !isPhoneVerified
                          ? isRtl
                            ? 'إرسال رمز التحقق'
                            : 'Send Verification Code'
                          : isRtl
                          ? 'التالي'
                          : 'Next'
                        : isRtl
                        ? 'التالي'
                        : 'Next'}
                    </bdi>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Milestone 3: Family Relations */}
          {mainStepIndex === 3 && (
            <form onSubmit={handleAdvance} className="w-full flex-1 flex flex-col justify-between min-h-[420px] space-y-4">
              <div
                key={`3-${subStepIndex}`}
                className={`w-full flex-1 flex flex-col justify-center py-2 ${slideDirection === 'forward' ? 'animate-slide-forward' : 'animate-slide-backward'}`}
              >
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <bdi>{isRtl ? 'الحالة الاجتماعية' : 'Marital Status'}</bdi>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {MARITAL_STATUSES.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setMaritalStatus(m.id)}
                        className={`p-2.5 rounded-xl border text-xs font-medium transition cursor-pointer ${
                          maritalStatus === m.id
                            ? 'border-[#0B57D0] dark:border-[#A8C7FA] bg-blue-50 dark:bg-blue-950/40 text-[#0B57D0] dark:text-[#A8C7FA] font-semibold'
                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <bdi>{isRtl ? m.labelAr : m.labelEn}</bdi>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-3">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <bdi>{isRtl ? 'بيانات ولي الأمر / الربط العائلي (اختياري)' : 'Guardian or Family Link (Optional)'}</bdi>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <input
                      type="text"
                      aria-label="Guardian Name"
                      placeholder={isRtl ? 'اسم ولي الأمر' : 'Guardian Name'}
                      value={guardianName}
                      onChange={(e) => setGuardianName(e.target.value)}
                      className="px-3 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-[#1F1F1F] dark:text-[#E3E3E3]"
                    />
                    <input
                      type="tel"
                      aria-label="Guardian Phone"
                      placeholder={isRtl ? 'هاتف ولي الأمر' : 'Guardian Phone'}
                      value={guardianPhone}
                      onChange={(e) => setGuardianPhone(e.target.value)}
                      className="px-3 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-[#1F1F1F] dark:text-[#E3E3E3]"
                    />
                  </div>
                </div>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div id="register-error-alert" className="flex items-center gap-2 text-xs text-[#B3261E] dark:text-[#F2B8B5] mt-1.5">
                  <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#B3261E] dark:bg-[#F2B8B5] text-white dark:text-[#601410] text-[11px] font-bold select-none leading-none pb-[1px]">
                    !
                  </span>
                  <bdi id="error-message-text">{errorMessage}</bdi>
                </div>
              )}

              <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={handleBack}
                  className="text-xs sm:text-sm font-semibold text-[#0B57D0] dark:text-[#93C5FD] hover:underline px-3 py-2 rounded-full cursor-pointer"
                >
                  <bdi>{isRtl ? 'السابق' : 'Back'}</bdi>
                </button>
                <button
                  type="submit"
                  className="bg-[#0B57D0] hover:bg-[#0842A0] text-white text-xs sm:text-sm font-semibold px-6 py-2.5 rounded-full shadow-sm cursor-pointer"
                >
                  <bdi>{isRtl ? 'التالي' : 'Next'}</bdi>
                </button>
              </div>
            </form>
          )}

          {/* Milestone 4: Education & Work */}
          {mainStepIndex === 4 && (
            <form onSubmit={handleAdvance} className="w-full flex-1 flex flex-col justify-between min-h-[420px] space-y-4">
              <div
                key={`4-${subStepIndex}`}
                className={`w-full flex-1 flex flex-col justify-center py-2 ${slideDirection === 'forward' ? 'animate-slide-forward' : 'animate-slide-backward'}`}
              >
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <bdi>{isRtl ? 'المرحلة التعليمية' : 'Educational Stage'}</bdi>
                  </label>
                  <select
                    value={educationStage}
                    onChange={(e) => setEducationStage(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-[#1F1F1F] dark:text-[#E3E3E3] cursor-pointer"
                  >
                    {EDUCATION_STAGES.map((s) => (
                      <option key={s.id} value={s.id} className="bg-white dark:bg-[#1B212D]">
                        {isRtl ? s.labelAr : s.labelEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                  <input
                    type="text"
                    aria-label="Faculty or School"
                    placeholder={isRtl ? 'الكلية أو المدرسة' : 'Faculty or School'}
                    value={facultyOrSchool}
                    onChange={(e) => setFacultyOrSchool(e.target.value)}
                    className="px-3 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-[#1F1F1F] dark:text-[#E3E3E3]"
                  />
                  <input
                    type="text"
                    aria-label="Profession or Job Title"
                    placeholder={isRtl ? 'المهنة أو الوظيفة' : 'Profession / Job'}
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    className="px-3 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-[#1F1F1F] dark:text-[#E3E3E3]"
                  />
                </div>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div id="register-error-alert" className="flex items-center gap-2 text-xs text-[#B3261E] dark:text-[#F2B8B5] mt-1.5">
                  <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#B3261E] dark:bg-[#F2B8B5] text-white dark:text-[#601410] text-[11px] font-bold select-none leading-none pb-[1px]">
                    !
                  </span>
                  <bdi id="error-message-text">{errorMessage}</bdi>
                </div>
              )}

              <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={handleBack}
                  className="text-xs sm:text-sm font-semibold text-[#0B57D0] dark:text-[#93C5FD] hover:underline px-3 py-2 rounded-full cursor-pointer"
                >
                  <bdi>{isRtl ? 'السابق' : 'Back'}</bdi>
                </button>
                <button
                  type="submit"
                  className="bg-[#0B57D0] hover:bg-[#0842A0] text-white text-xs sm:text-sm font-semibold px-6 py-2.5 rounded-full shadow-sm cursor-pointer"
                >
                  <bdi>{isRtl ? 'التالي' : 'Next'}</bdi>
                </button>
              </div>
            </form>
          )}

          {/* Milestone 5: Locations & Addresses */}
          {mainStepIndex === 5 && (
            <form onSubmit={handleAdvance} className="w-full flex-1 flex flex-col justify-between min-h-[420px] space-y-4">
              <div
                key={`5-${subStepIndex}`}
                className={`w-full flex-1 flex flex-col justify-center py-2 ${slideDirection === 'forward' ? 'animate-slide-forward' : 'animate-slide-backward'}`}
              >
                {/* 5.1: Primary Address */}
                {subStepIndex === 1 && (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={governorate}
                        onChange={(e) => setGovernorate(e.target.value)}
                        className="px-3 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-[#1F1F1F] dark:text-[#E3E3E3] cursor-pointer"
                      >
                        {(isRtl ? EGYPTIAN_GOVERNORATES_AR : EGYPTIAN_GOVERNORATES).map((gov) => (
                          <option key={gov} value={gov} className="bg-white dark:bg-[#1B212D]">
                            {gov}
                          </option>
                        ))}
                      </select>

                      <input
                        type="text"
                        aria-label="City or District"
                        placeholder={isRtl ? 'المدينة أو الحي' : 'City or District'}
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="px-3 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-[#1F1F1F] dark:text-[#E3E3E3]"
                      />
                    </div>

                    <input
                      type="text"
                      aria-label="Street Address"
                      placeholder={isRtl ? 'اسم الشارع' : 'Street Address'}
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-[#1F1F1F] dark:text-[#E3E3E3]"
                    />

                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        aria-label="Building Number"
                        placeholder={isRtl ? 'رقم العقار' : 'Building No.'}
                        value={buildingNumber}
                        onChange={(e) => setBuildingNumber(e.target.value)}
                        className="px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-[#1F1F1F] dark:text-[#E3E3E3]"
                      />
                      <input
                        type="text"
                        aria-label="Floor Number"
                        placeholder={isRtl ? 'الدور' : 'Floor No.'}
                        value={floorNumber}
                        onChange={(e) => setFloorNumber(e.target.value)}
                        className="px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-[#1F1F1F] dark:text-[#E3E3E3]"
                      />
                      <input
                        type="text"
                        aria-label="Apartment Number"
                        placeholder={isRtl ? 'رقم الشقة' : 'Apartment'}
                        value={apartmentNumber}
                        onChange={(e) => setApartmentNumber(e.target.value)}
                        className="px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-[#1F1F1F] dark:text-[#E3E3E3]"
                      />
                    </div>
                  </div>
                )}

                {/* 5.2: Secondary Address */}
                {subStepIndex === 2 && (
                  <div className="space-y-2 py-2">
                    <input
                      type="text"
                      aria-label="Secondary Address"
                      placeholder={isRtl ? 'عنوان بديل أو إضافي (اختياري)' : 'Secondary / Alternative Address (Optional)'}
                      value={secondaryAddress}
                      onChange={(e) => setSecondaryAddress(e.target.value)}
                      className="w-full px-3 py-3 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-[#1F1F1F] dark:text-[#E3E3E3]"
                    />
                  </div>
                )}
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div id="register-error-alert" className="flex items-center gap-2 text-xs text-[#B3261E] dark:text-[#F2B8B5] mt-1.5">
                  <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#B3261E] dark:bg-[#F2B8B5] text-white dark:text-[#601410] text-[11px] font-bold select-none leading-none pb-[1px]">
                    !
                  </span>
                  <bdi id="error-message-text">{errorMessage}</bdi>
                </div>
              )}

              <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={handleBack}
                  className="text-xs sm:text-sm font-semibold text-[#0B57D0] dark:text-[#93C5FD] hover:underline px-3 py-2 rounded-full cursor-pointer"
                >
                  <bdi>{isRtl ? 'السابق' : 'Back'}</bdi>
                </button>
                <div className="flex items-center gap-2">
                  {currentSubConfig?.isOptional && (
                    <button
                      type="button"
                      onClick={handleSkip}
                      className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 px-3.5 py-2 rounded-full cursor-pointer"
                    >
                      <bdi>{isRtl ? 'تخطي' : 'Skip'}</bdi>
                    </button>
                  )}
                  <button
                    type="submit"
                    className="bg-[#0B57D0] hover:bg-[#0842A0] text-white text-xs sm:text-sm font-semibold px-6 py-2.5 rounded-full shadow-sm cursor-pointer"
                  >
                    <bdi>{isRtl ? 'التالي' : 'Next'}</bdi>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Milestone 6: Church Commitment */}
          {mainStepIndex === 6 && (
            <form onSubmit={handleAdvance} className="w-full flex-1 flex flex-col justify-between min-h-[420px] space-y-4">
              <div
                key={`6-${subStepIndex}`}
                className={`w-full flex-1 flex flex-col justify-center py-2 ${slideDirection === 'forward' ? 'animate-slide-forward' : 'animate-slide-backward'}`}
              >
                {/* 6.1: Churches Selection */}
                {subStepIndex === 1 && (
                  <div className="space-y-2.5">
                    <input
                      type="text"
                      aria-label="Diocese or Region"
                      placeholder={isRtl ? 'الإيبارشية أو المنطقة' : 'Diocese / Region'}
                      value={diocese}
                      onChange={(e) => setDiocese(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-[#1F1F1F] dark:text-[#E3E3E3]"
                    />
                    <input
                      type="text"
                      aria-label="Primary Church"
                      placeholder={isRtl ? 'الكنيسة الأساسية' : 'Primary Church'}
                      value={primaryChurch}
                      onChange={(e) => setPrimaryChurch(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-[#1F1F1F] dark:text-[#E3E3E3]"
                    />
                    <input
                      type="text"
                      aria-label="Secondary Church"
                      placeholder={isRtl ? 'كنيسة إضافية (اختياري)' : 'Secondary Church (Optional)'}
                      value={secondaryChurch}
                      onChange={(e) => setSecondaryChurch(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-[#1F1F1F] dark:text-[#E3E3E3]"
                    />
                  </div>
                )}

                {/* 6.2: Priest Selection */}
                {subStepIndex === 2 && (
                  <div className="space-y-2.5">
                    <input
                      type="text"
                      aria-label="Confession Father / Priest Name"
                      placeholder={isRtl ? 'اسم أب الاعتراف / الكاهن المسؤول' : 'Father of Confession / Priest Name'}
                      value={priestName}
                      onChange={(e) => setPriestName(e.target.value)}
                      className="w-full px-3 py-3 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-[#1F1F1F] dark:text-[#E3E3E3]"
                    />
                  </div>
                )}
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div id="register-error-alert" className="flex items-center gap-2 text-xs text-[#B3261E] dark:text-[#F2B8B5] mt-1.5">
                  <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#B3261E] dark:bg-[#F2B8B5] text-white dark:text-[#601410] text-[11px] font-bold select-none leading-none pb-[1px]">
                    !
                  </span>
                  <bdi id="error-message-text">{errorMessage}</bdi>
                </div>
              )}

              <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={handleBack}
                  className="text-xs sm:text-sm font-semibold text-[#0B57D0] dark:text-[#93C5FD] hover:underline px-3 py-2 rounded-full cursor-pointer"
                >
                  <bdi>{isRtl ? 'السابق' : 'Back'}</bdi>
                </button>
                <button
                  type="submit"
                  className="bg-[#0B57D0] hover:bg-[#0842A0] text-white text-xs sm:text-sm font-semibold px-6 py-2.5 rounded-full shadow-sm cursor-pointer"
                >
                  <bdi>{isRtl ? 'التالي' : 'Next'}</bdi>
                </button>
              </div>
            </form>
          )}

          {/* Milestone 7: Additional Info */}
          {mainStepIndex === 7 && (
            <form onSubmit={handleAdvance} className="w-full flex-1 flex flex-col justify-between min-h-[420px] space-y-4">
              <div
                key={`7-${subStepIndex}`}
                className={`w-full flex-1 flex flex-col justify-center py-2 ${slideDirection === 'forward' ? 'animate-slide-forward' : 'animate-slide-backward'}`}
              >
                {/* 7.1: Hobbies */}
                {subStepIndex === 1 && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <bdi>{isRtl ? 'اختر اهتماماتك وأنشطتك الكنسية' : 'Select Hobbies & Church Activities'}</bdi>
                    </label>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {AVAILABLE_HOBBIES.map((h) => {
                        const selected = selectedHobbies.includes(h.id);
                        return (
                          <button
                            key={h.id}
                            type="button"
                            onClick={() => {
                              if (selected) setSelectedHobbies(selectedHobbies.filter((x) => x !== h.id));
                              else setSelectedHobbies([...selectedHobbies, h.id]);
                            }}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                              selected
                                ? 'bg-[#0B57D0] text-white shadow-sm'
                                : 'border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <bdi>{isRtl ? h.labelAr : h.labelEn}</bdi>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 7.2: Languages */}
                {subStepIndex === 2 && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <bdi>{isRtl ? 'اللغات المتقنة' : 'Languages Spoken'}</bdi>
                    </label>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {AVAILABLE_LANGUAGES.map((l) => {
                        const selected = selectedLanguages.includes(l.id);
                        return (
                          <button
                            key={l.id}
                            type="button"
                            onClick={() => {
                              if (selected) setSelectedLanguages(selectedLanguages.filter((x) => x !== l.id));
                              else setSelectedLanguages([...selectedLanguages, l.id]);
                            }}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                              selected
                                ? 'bg-[#0B57D0] text-white shadow-sm'
                                : 'border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <bdi>{isRtl ? l.labelAr : l.labelEn}</bdi>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div id="register-error-alert" className="flex items-center gap-2 text-xs text-[#B3261E] dark:text-[#F2B8B5] mt-1.5">
                  <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#B3261E] dark:bg-[#F2B8B5] text-white dark:text-[#601410] text-[11px] font-bold select-none leading-none pb-[1px]">
                    !
                  </span>
                  <bdi id="error-message-text">{errorMessage}</bdi>
                </div>
              )}

              <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={handleBack}
                  className="text-xs sm:text-sm font-semibold text-[#0B57D0] dark:text-[#93C5FD] hover:underline px-3 py-2 rounded-full cursor-pointer"
                >
                  <bdi>{isRtl ? 'السابق' : 'Back'}</bdi>
                </button>
                <button
                  type="submit"
                  className="bg-[#0B57D0] hover:bg-[#0842A0] text-white text-xs sm:text-sm font-semibold px-6 py-2.5 rounded-full shadow-sm cursor-pointer"
                >
                  <bdi>{isRtl ? 'التالي' : 'Next'}</bdi>
                </button>
              </div>
            </form>
          )}

          {/* Final Step 8: Password Setup */}
          {mainStepIndex === 8 && (
            <form onSubmit={handleFinalSubmit} className="w-full flex-1 flex flex-col justify-between min-h-[420px] space-y-4">
              <div
                key="8-1"
                className={`w-full flex-1 flex flex-col justify-center py-2 space-y-4 ${slideDirection === 'forward' ? 'animate-slide-forward' : 'animate-slide-backward'}`}
              >
                <div className="relative">
                  <input
                    id="reg-pass"
                    type={showPassword ? 'text' : 'password'}
                    autoFocus
                    disabled={loading}
                    value={password}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    className={`w-full h-[56px] px-4 text-[15px] text-[#1F1F1F] dark:text-[#E3E3E3] bg-transparent rounded-[4px] focus:outline-none transition-all box-border ${
                      errorMessage
                        ? 'border-2 border-[#B3261E] dark:border-[#F2B8B5]'
                        : isPasswordFocused
                        ? 'border-2 border-[#0B57D0] dark:border-[#A8C7FA]'
                        : 'border border-[#747775] dark:border-[#8E918F] hover:border-[#1F1F1F] dark:hover:border-white'
                    }`}
                  />
                  <label
                    htmlFor="reg-pass"
                    className={`absolute pointer-events-none transition-all duration-150 start-3 ${
                      isPasswordFloating ? '-top-2.5 px-1 text-xs bg-white dark:bg-[#1B212D]' : 'top-4 text-[15px]'
                    } ${
                      errorMessage
                        ? 'text-[#B3261E] dark:text-[#F2B8B5]'
                        : isPasswordFocused
                        ? 'text-[#0B57D0] dark:text-[#A8C7FA]'
                        : 'text-[#444746] dark:text-[#8E918F]'
                    }`}
                  >
                    <bdi>{isRtl ? 'كلمة المرور (8 أحرف على الأقل)' : 'Password (8+ characters)'}</bdi>
                  </label>
                </div>

                <div className="relative">
                  <input
                    id="reg-pass-confirm"
                    type={showPassword ? 'text' : 'password'}
                    disabled={loading}
                    value={confirmPassword}
                    onFocus={() => setIsConfirmPasswordFocused(true)}
                    onBlur={() => setIsConfirmPasswordFocused(false)}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    className={`w-full h-[56px] px-4 text-[15px] text-[#1F1F1F] dark:text-[#E3E3E3] bg-transparent rounded-[4px] focus:outline-none transition-all box-border ${
                      errorMessage
                        ? 'border-2 border-[#B3261E] dark:border-[#F2B8B5]'
                        : isConfirmPasswordFocused
                        ? 'border-2 border-[#0B57D0] dark:border-[#A8C7FA]'
                        : 'border border-[#747775] dark:border-[#8E918F] hover:border-[#1F1F1F] dark:hover:border-white'
                    }`}
                  />
                  <label
                    htmlFor="reg-pass-confirm"
                    className={`absolute pointer-events-none transition-all duration-150 start-3 ${
                      isConfirmPasswordFloating ? '-top-2.5 px-1 text-xs bg-white dark:bg-[#1B212D]' : 'top-4 text-[15px]'
                    } ${
                      errorMessage
                        ? 'text-[#B3261E] dark:text-[#F2B8B5]'
                        : isConfirmPasswordFocused
                        ? 'text-[#0B57D0] dark:text-[#A8C7FA]'
                        : 'text-[#444746] dark:text-[#8E918F]'
                    }`}
                  >
                    <bdi>{isRtl ? 'تأكيد كلمة المرور' : 'Confirm Password'}</bdi>
                  </label>
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-400">
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-400 text-[#0B57D0] cursor-pointer"
                  />
                  <span><bdi>{isRtl ? 'عرض كلمة المرور' : 'Show password'}</bdi></span>
                </label>
              </div>

              {errorMessage && (
                <div className="flex items-center gap-2 text-xs text-[#B3261E] dark:text-[#F2B8B5] mt-1.5">
                  <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#B3261E] dark:bg-[#F2B8B5] text-white dark:text-[#601410] text-[11px] font-bold select-none leading-none pb-[1px]">
                    !
                  </span>
                  <bdi>{errorMessage}</bdi>
                </div>
              )}

              <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={loading}
                  className="text-xs sm:text-sm font-semibold text-[#0B57D0] dark:text-[#93C5FD] hover:underline px-3 py-2 rounded-full cursor-pointer disabled:opacity-50"
                >
                  <bdi>{isRtl ? 'السابق' : 'Back'}</bdi>
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#0B57D0] hover:bg-[#0842A0] active:bg-[#06337E] text-white text-xs sm:text-sm font-semibold px-7 py-2.5 rounded-full shadow-sm cursor-pointer disabled:opacity-60 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span><bdi>{isRtl ? 'جاري التسجيل...' : 'Creating...'}</bdi></span>
                    </>
                  ) : (
                    <span><bdi>{isRtl ? 'إتمام التسجيل' : 'Create Account'}</bdi></span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Success Step 9 */}
          {mainStepIndex === 9 && (
            <div className="w-full flex flex-col items-center justify-center text-center space-y-5 py-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-3xl shadow-md">
                ✓
              </div>
              <div className="space-y-1.5">
                <h2 className="text-xl sm:text-2xl font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
                  <bdi>{isRtl ? 'تم إنشاء الحساب بنجاح!' : 'Account Created Successfully!'}</bdi>
                </h2>
                <p className="text-xs sm:text-sm text-[#444746] dark:text-[#C4C7C5] max-w-sm mx-auto leading-relaxed">
                  <bdi>
                    {isRtl
                      ? 'تم تسجيل ملفك الشخصي الشامل وجاري نقلك تلقائياً إلى لوحة التحكم...'
                      : 'Your universal lifetime profile is active. Redirecting to your dashboard...'}
                  </bdi>
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center py-2.5 px-7 rounded-full text-xs sm:text-sm font-semibold bg-[#0B57D0] text-white hover:bg-[#0842A0] active:scale-95 transition shadow cursor-pointer"
                >
                  <bdi>{isRtl ? 'الانتقال إلى لوحة التحكم' : 'Go to Dashboard'}</bdi>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Links & Language Switcher */}
      <div className="relative z-20 w-full max-w-[1040px] flex flex-col sm:flex-row items-center justify-between text-xs text-[#444746] dark:text-[#8E918F] px-4 sm:px-6 mt-4 gap-3">
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-white/60 dark:hover:bg-slate-800 transition cursor-pointer text-slate-700 dark:text-slate-300 font-medium"
          >
            <span>{getLocaleDisplayName(locale)}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isLangOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsLangOpen(false)} />
              <div className="absolute bottom-full mb-2 start-0 z-50 w-56 max-h-72 overflow-hidden bg-white dark:bg-[#1B212D] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 flex flex-col">
                <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                  <input
                    type="text"
                    aria-label="Search languages"
                    placeholder={t('footer.searchLanguages')}
                    value={langSearch}
                    onChange={(e) => setLangSearch(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 text-[#1F1F1F] dark:text-[#E3E3E3] outline-none"
                  />
                </div>
                <div className="overflow-y-auto p-1 max-h-56">
                  {filteredLocales.map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => handleLanguageChange(loc)}
                      className={`w-full text-start px-3 py-2 rounded-xl text-xs flex items-center justify-between cursor-pointer transition ${
                        loc === locale
                          ? 'bg-blue-50 dark:bg-blue-950/50 text-[#0B57D0] dark:text-[#A8C7FA] font-semibold'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span>{getLocaleDisplayName(loc)}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{loc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-6 text-xs font-medium">
          <Link href="/login" className="text-[#0B57D0] dark:text-[#93C5FD] hover:underline transition">
            <bdi>{t('buttons.signInInstead')}</bdi>
          </Link>
          <Link href="/help" className="hover:text-slate-900 dark:hover:text-white transition">
            <bdi>{t('footer.help')}</bdi>
          </Link>
          <Link href="/privacy" className="hover:text-slate-900 dark:hover:text-white transition">
            <bdi>{t('footer.privacy')}</bdi>
          </Link>
          <Link href="/terms" className="hover:text-slate-900 dark:hover:text-white transition">
            <bdi>{t('footer.terms')}</bdi>
          </Link>
        </div>
      </div>

      {/* Live Camera Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
        isRtl={isRtl}
      />

      {/* Interactive Photo Editor Modal */}
      <PhotoEditorModal
        isOpen={isEditorOpen}
        imageUrl={rawImageToEdit}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleEditorSave}
        isRtl={isRtl}
      />
    </div>
  );
}
