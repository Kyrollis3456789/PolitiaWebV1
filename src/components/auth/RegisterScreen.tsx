'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import {
  Loader2,
  ChevronDown,
  Camera,
  Upload,
  User,
  UserCheck,
  Check,
  Trash2,
  Pencil,
  CheckCircle2,
  ShieldCheck,
  KeyRound,
  RotateCw,
  Info,
  AlertCircle,
} from 'lucide-react';
import { CameraCaptureModal, PhotoEditorModal } from '@/components/media';
import { useRouter, Link } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import { isRtlLocale, SUPPORTED_LOCALES, getLocaleDisplayName } from '@/i18n/locales';
import {
  autoCapitalizeEnglishName,
  countWords,
  validateEnglishName,
  validateArabicName,
} from '@/lib/validation/name-rules';
import { validateEgyptianNationalId } from '@/lib/validation/national-id';
import { validateBirthday } from '@/lib/validation/date-rules';
import { validatePhoneNumber, normalizeDigits, COUNTRY_PHONE_RULES } from '@/lib/validation/phone-rules';
import { createAccountAction, CreateAccountPayload } from '@/app/actions/create-account';
import Step4EducationWork, { Step4Payload } from './Step4EducationWork';
import Step5Locations from './Step5Locations';
import Step6ChurchCommitment from './Step6ChurchCommitment';
import FacebookHobbiesSelector from './FacebookHobbiesSelector';
import LanguagesSelector from './LanguagesSelector';
import AccountPickerPriestDropdown, { MOCK_PRIESTS } from './AccountPickerPriestDropdown';
import PasswordStrengthMeter, { checkPasswordStrength } from '@/components/ui/PasswordStrengthMeter';
import { Country, Step5LocationPayload, Step6ChurchPayload, Diocese, Church, Priest } from '@/types/database.types';
import { fetchChurchesDataAction } from '@/app/actions/location-data';
import {
  checkEnglishNameCollision,
  checkArabicNameCollision,
  checkNationalIdCollision,
  checkPhoneCollision,
  checkEmailCollision,
} from '@/app/actions/auth-check';
import { sendPhoneOtp, verifyPhoneOtp } from '@/app/actions/phone-otp';
import { sendEmailOtp, verifyEmailOtp } from '@/app/actions/email-otp';
import { GenderType, SocialPlatform } from '@/types/database.types';
import {
  REGISTRATION_SCHEMA,
  TOTAL_REGISTRATION_MAIN_STEPS,
  TOTAL_REGISTRATION_SUBSTEPS,
} from '@/lib/constants/registrationSteps';
import { ALL_COUNTRIES, CountryInfo, getCountryByIso, getLocalizedCountryName } from '@/lib/data/countries';
import { SocialMediaStep } from './SocialMediaStep';
import { FamilyRelationsStep, calculateAge } from './FamilyRelationsStep';
import { FamilyMemberEntry } from '@/types/database.types';

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
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('politia_') || key.startsWith('reg_') || key.includes('draft'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => {
      try {
        localStorage.removeItem(k);
      } catch {}
    });
    sessionStorage.clear();
  } catch (e) {
    console.warn('Error clearing registration drafts:', e);
  }
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

  // Safeguard: Ensure mainStepIndex is always within valid range [1, 8]
  useEffect(() => {
    if (mainStepIndex > 8 || mainStepIndex < 1) {
      setMainStepIndex(1);
      setSubStepIndex(1);
    }
  }, [mainStepIndex]);

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
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState<boolean>(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Multi-Contact State (up to 10 phones and 10 emails)
  const [additionalPhones, setAdditionalPhones] = useState<
    Array<{ id: string; countryIso: string; countryCode: string; phone: string; isVerified: boolean }>
  >([]);
  const [additionalEmails, setAdditionalEmails] = useState<
    Array<{ id: string; email: string; isVerified: boolean }>
  >([]);

  const [email, setEmail] = useState<string>('');
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);
  const [isEmailOtpActive, setIsEmailOtpActive] = useState<boolean>(false);
  const [emailOtpDigits, setEmailOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [emailOtpResendTimer, setEmailOtpResendTimer] = useState<number>(0);
  const [isSendingEmailOtp, setIsSendingEmailOtp] = useState<boolean>(false);
  const [isVerifyingEmailOtp, setIsVerifyingEmailOtp] = useState<boolean>(false);
  const [emailDevCode, setEmailDevCode] = useState<string | null>(null);
  const emailOtpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [landlineAreaCode, setLandlineAreaCode] = useState<string>('');
  const [landlineNumber, setLandlineNumber] = useState<string>('');
  const [socials, setSocials] = useState<Record<SocialPlatform, { url: string }>>({
    whatsapp: { url: '' },
    facebook: { url: '' },
    instagram: { url: '' },
    threads: { url: '' },
    messenger: { url: '' },
    tiktok: { url: '' },
    snapchat: { url: '' },
    x: { url: '' },
    github: { url: '' },
    linkedin: { url: '' },
  });

  // Milestone 3: Relations
  const [maritalStatus, setMaritalStatus] = useState<string>('single');
  const [guardianName, setGuardianName] = useState<string>('');
  const [guardianPhone, setGuardianPhone] = useState<string>('');
  const [familyRelationType, setFamilyRelationType] = useState<string>('Parent');
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberEntry[]>([
    { id: 'father_default', relation: 'father', mode: 'search', isDeceased: false, countryCode: '+20' },
    { id: 'mother_default', relation: 'mother', mode: 'search', isDeceased: false, countryCode: '+20' },
  ]);
  const [shakeStep3Missing, setShakeStep3Missing] = useState(false);
  const [showStep3Tooltip, setShowStep3Tooltip] = useState(false);

  // Milestone 4: Education & Work
  const [step4Payload, setStep4Payload] = useState<any>(null);
  const [step4Parts, setStep4Parts] = useState<{ current: number; total: number }>({ current: 1, total: 1 });
  const handleStep4PartChange = useCallback((curr: number, tot: number) => {
    setStep4Parts((prev) => {
      if (prev.current === curr && prev.total === tot) return prev;
      return { current: curr, total: tot };
    });
  }, []);

  // Milestone 5: Locations
  const [step5Payload, setStep5Payload] = useState<Step5LocationPayload | null>(null);
  const [governorate, setGovernorate] = useState<string>(isRtl ? 'القاهرة' : 'Cairo');
  const [city, setCity] = useState<string>('');
  const [streetAddress, setStreetAddress] = useState<string>('');
  const [buildingNumber, setBuildingNumber] = useState<string>('');
  const [floorNumber, setFloorNumber] = useState<string>('');
  const [apartmentNumber, setApartmentNumber] = useState<string>('');
  const [secondaryAddress, setSecondaryAddress] = useState<string>('');

  // Milestone 6: Church Commitment
  const [step6Payload, setStep6Payload] = useState<Step6ChurchPayload | null>(null);
  const [diocesesList, setDiocesesList] = useState<Diocese[]>([]);
  const [churchesList, setChurchesList] = useState<Church[]>([]);
  const [priestsList, setPriestsList] = useState<Priest[]>(MOCK_PRIESTS);
  const [diocese, setDiocese] = useState<string>('');
  const [primaryChurch, setPrimaryChurch] = useState<string>('');
  const [secondaryChurch, setSecondaryChurch] = useState<string>('');
  const [priestId, setPriestId] = useState<string>('');
  const [priestName, setPriestName] = useState<string>('');
  const [isCustomPriest, setIsCustomPriest] = useState<boolean>(false);

  // Fetch Dioceses, Churches, and Priests
  useEffect(() => {
    fetchChurchesDataAction().then((res: { success: boolean; dioceses?: Diocese[]; churches?: Church[]; priests?: Priest[] }) => {
      if (res.success) {
        if (res.dioceses) setDiocesesList(res.dioceses);
        if (res.churches) setChurchesList(res.churches);
        if (res.priests && res.priests.length > 0) setPriestsList(res.priests);
      }
    });
  }, []);

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

  // Reset handler via URL param ?reset=true or explicit reset button
  const resetFormDrafts = useCallback(() => {
    clearAllRegistrationDrafts();
    setMainStepIndex(1);
    setSubStepIndex(1);
    setEnglishFullName('');
    setArabicFullName('');
    setGender('Male');
    setDob('');
    setNationalId('');
    setAvatarFile(null);
    setAvatarPreview(null);
    setPhotoSkippedGracePeriod(false);
    setPhoneNumber('');
    setIsPhoneVerified(false);
    setEmail('');
    setIsEmailVerified(false);
    setAdditionalPhones([]);
    setAdditionalEmails([]);
    setStep4Payload(null);
    setStep5Payload(null);
    setStep6Payload(null);
    setPriestId('');
    setPriestName('');
    setIsCustomPriest(false);
  }, []);

  // Client-side Draft Hydration for Steps 1 through 7
  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined' && window.location.search.includes('reset=true')) {
      resetFormDrafts();
      return;
    }
    try {
      const masterDraft = getLocalJson<any>('registration_draft_v1', null);

      const savedMain = masterDraft?.mainStepIndex ?? getLocalNumber('main_step', 1);
      const savedSub = masterDraft?.subStepIndex ?? getLocalNumber('sub_step', 1);
      if (savedMain >= 1 && savedMain <= 8) {
        setMainStepIndex(savedMain);
      } else {
        setMainStepIndex(1);
        try { localStorage.removeItem('politia_reg_main_step'); } catch {}
      }
      if (savedSub >= 1) setSubStepIndex(savedSub);

      const fnEn = masterDraft?.englishFullName ?? getLocalItem('full_name_en', '');
      if (fnEn) setEnglishFullName(fnEn);
      const fnAr = masterDraft?.arabicFullName ?? getLocalItem('full_name_ar', '');
      if (fnAr) setArabicFullName(fnAr);
      const g = masterDraft?.gender ?? getLocalItem('gender', '');
      if (g) setGender(g as GenderType);
      const d = masterDraft?.dob ?? getLocalItem('dob', '');
      if (d) setDob(d);
      const nid = masterDraft?.nationalId ?? getLocalItem('national_id', '');
      if (nid) setNationalId(nid);
      const av = masterDraft?.avatarPreview ?? getLocalItem('avatar_preview', '');
      if (av) setAvatarPreview(av);
      const pskip = masterDraft?.photoSkippedGracePeriod ?? (getLocalItem('photo_skipped', '') === 'true');
      if (pskip) setPhotoSkippedGracePeriod(true);
      const cIso = masterDraft?.countryIso ?? getLocalItem('country_iso', '');
      if (cIso) setCountryIso(cIso);
      const cCode = masterDraft?.countryCode ?? getLocalItem('country_code', '');
      if (cCode) setCountryCode(cCode);
      const ph = masterDraft?.phoneNumber ?? getLocalItem('phone_number', '');
      if (ph) setPhoneNumber(ph);
      const pv = masterDraft?.isPhoneVerified ?? (getLocalItem('phone_verified', '') === 'true');
      if (pv) setIsPhoneVerified(true);
      const em = masterDraft?.email ?? getLocalItem('email', '');
      if (em) setEmail(em);
      const ev = masterDraft?.isEmailVerified ?? (getLocalItem('email_verified', '') === 'true');
      if (ev) setIsEmailVerified(true);
      const lAc = masterDraft?.landlineAreaCode ?? getLocalItem('landline_area_code', '');
      if (lAc) setLandlineAreaCode(lAc);
      const lNum = masterDraft?.landlineNumber ?? getLocalItem('landline_number', '');
      if (lNum) setLandlineNumber(lNum);
      const soc = masterDraft?.socials ?? getLocalJson('socials', null);
      if (soc) setSocials(soc);
      const ms = masterDraft?.maritalStatus ?? getLocalItem('marital_status', '');
      if (ms) setMaritalStatus(ms);
      const fam = masterDraft?.familyMembers ?? getLocalJson('family_members', null);
      if (fam) setFamilyMembers(fam);
      const gn = masterDraft?.guardianName ?? getLocalItem('guardian_name', '');
      if (gn) setGuardianName(gn);
      const gp = masterDraft?.guardianPhone ?? getLocalItem('guardian_phone', '');
      if (gp) setGuardianPhone(gp);
      const frt = masterDraft?.familyRelationType ?? getLocalItem('family_relation_type', '');
      if (frt) setFamilyRelationType(frt);
      const s4 = masterDraft?.step4Payload ?? getLocalJson('step4_payload', null);
      if (s4) setStep4Payload(s4);

      // Hydrate Step 5 Location Payload
      const s5 = masterDraft?.step5Payload ?? getLocalJson('step5_payload', null);
      if (s5) setStep5Payload(s5);
      const gov = masterDraft?.governorate ?? getLocalItem('governorate', '');
      if (gov) setGovernorate(gov);
      const cit = masterDraft?.city ?? getLocalItem('city', '');
      if (cit) setCity(cit);
      const sa = masterDraft?.streetAddress ?? getLocalItem('street_address', '');
      if (sa) setStreetAddress(sa);
      const bn = masterDraft?.buildingNumber ?? getLocalItem('building_number', '');
      if (bn) setBuildingNumber(bn);
      const fln = masterDraft?.floorNumber ?? getLocalItem('floor_number', '');
      if (fln) setFloorNumber(fln);
      const an = masterDraft?.apartmentNumber ?? getLocalItem('apartment_number', '');
      if (an) setApartmentNumber(an);
      const secAddr = masterDraft?.secondaryAddress ?? getLocalItem('secondary_address', '');
      if (secAddr) setSecondaryAddress(secAddr);

      // Hydrate Step 6 Church Payload
      const s6 = masterDraft?.step6Payload ?? getLocalJson('step6_payload', null);
      if (s6) setStep6Payload(s6);
      const dio = masterDraft?.diocese ?? getLocalItem('diocese', '');
      if (dio) setDiocese(dio);
      const pc = masterDraft?.primaryChurch ?? getLocalItem('primary_church', '');
      if (pc) setPrimaryChurch(pc);
      const sc = masterDraft?.secondaryChurch ?? getLocalItem('secondary_church', '');
      if (sc) setSecondaryChurch(sc);

      // Hydrate Step 7 Priest & Preferences
      const pId = masterDraft?.priestId ?? getLocalItem('priest_id', '');
      if (pId) setPriestId(pId);
      const pn = masterDraft?.priestName ?? getLocalItem('priest_name', '');
      if (pn) setPriestName(pn);
      const isCustomP = masterDraft?.isCustomPriest ?? (getLocalItem('is_custom_priest', '') === 'true');
      if (isCustomP) setIsCustomPriest(isCustomP);
      const hob = masterDraft?.selectedHobbies ?? getLocalJson('hobbies', null);
      if (hob) setSelectedHobbies(hob);
      const langList = masterDraft?.selectedLanguages ?? getLocalJson('languages', null);
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

  // Email OTP Countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (emailOtpResendTimer > 0) {
      interval = setInterval(() => {
        setEmailOtpResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [emailOtpResendTimer]);

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
  useEffect(() => { if (isMounted) setLocalItem('email_verified', isEmailVerified); }, [isEmailVerified, isMounted]);
  useEffect(() => { if (isMounted) setLocalItem('landline_area_code', landlineAreaCode); }, [landlineAreaCode, isMounted]);
  useEffect(() => { if (isMounted) setLocalItem('landline_number', landlineNumber); }, [landlineNumber, isMounted]);
  useEffect(() => { if (isMounted) setLocalItem('socials', socials); }, [socials, isMounted]);
  useEffect(() => { if (isMounted) setLocalItem('marital_status', maritalStatus); }, [maritalStatus, isMounted]);
  useEffect(() => { if (isMounted) setLocalItem('family_members', familyMembers); }, [familyMembers, isMounted]);
  useEffect(() => { if (isMounted) setLocalItem('guardian_name', guardianName); }, [guardianName, isMounted]);
  useEffect(() => { if (isMounted) setLocalItem('guardian_phone', guardianPhone); }, [guardianPhone, isMounted]);
  useEffect(() => { if (isMounted) setLocalItem('family_relation_type', familyRelationType); }, [familyRelationType, isMounted]);
  useEffect(() => { if (isMounted) setLocalItem('additional_phones', additionalPhones); }, [additionalPhones, isMounted]);
  useEffect(() => { if (isMounted) setLocalItem('additional_emails', additionalEmails); }, [additionalEmails, isMounted]);
  useEffect(() => { if (isMounted) setLocalItem('step4_payload', step4Payload); }, [step4Payload, isMounted]);
  useEffect(() => { if (isMounted) setLocalItem('step5_payload', step5Payload); }, [step5Payload, isMounted]);
  useEffect(() => { if (isMounted) setLocalItem('step6_payload', step6Payload); }, [step6Payload, isMounted]);
  useEffect(() => { if (isMounted) setLocalItem('priest_id', priestId); }, [priestId, isMounted]);
  useEffect(() => { if (isMounted) setLocalItem('is_custom_priest', isCustomPriest); }, [isCustomPriest, isMounted]);
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

  // Unified master draft auto-save for Steps 1 through 7
  useEffect(() => {
    if (!isMounted) return;
    setLocalItem('registration_draft_v1', {
      mainStepIndex,
      subStepIndex,
      englishFullName,
      arabicFullName,
      gender,
      dob,
      nationalId,
      avatarPreview,
      photoSkippedGracePeriod,
      countryIso,
      countryCode,
      phoneNumber,
      isPhoneVerified,
      additionalPhones,
      phoneNumbers: [phoneNumber, ...additionalPhones.map((p) => p.phone).filter(Boolean)],
      email,
      isEmailVerified,
      additionalEmails,
      emails: [email, ...additionalEmails.map((e) => e.email).filter(Boolean)],
      landlineAreaCode,
      landlineNumber,
      socials,
      maritalStatus,
      familyMembers,
      guardianName,
      guardianPhone,
      familyRelationType,
      step4Payload,
      step5Payload,
      governorate,
      city,
      streetAddress,
      buildingNumber,
      floorNumber,
      apartmentNumber,
      secondaryAddress,
      step6Payload,
      diocese,
      primaryChurch,
      secondaryChurch,
      priestId: isCustomPriest ? '__custom__' : priestId,
      customPriestName: isCustomPriest ? priestName : undefined,
      priestName,
      isCustomPriest,
      selectedHobbies,
      selectedLanguages,
    });
  }, [
    isMounted,
    mainStepIndex,
    subStepIndex,
    englishFullName,
    arabicFullName,
    gender,
    dob,
    nationalId,
    avatarPreview,
    photoSkippedGracePeriod,
    countryIso,
    countryCode,
    phoneNumber,
    isPhoneVerified,
    additionalPhones,
    email,
    isEmailVerified,
    additionalEmails,
    landlineAreaCode,
    landlineNumber,
    socials,
    maritalStatus,
    familyMembers,
    guardianName,
    guardianPhone,
    familyRelationType,
    step4Payload,
    step5Payload,
    governorate,
    city,
    streetAddress,
    buildingNumber,
    floorNumber,
    apartmentNumber,
    secondaryAddress,
    step6Payload,
    diocese,
    primaryChurch,
    secondaryChurch,
    priestId,
    priestName,
    isCustomPriest,
    selectedHobbies,
    selectedLanguages,
  ]);

  // Names cleanup & derived values
  const fullEnglishName = englishFullName.trim().replace(/\s+/g, ' ');
  const fullArabicName = arabicFullName.trim().replace(/\s+/g, ' ');
  const formattedDob = dob;

  // Reactive derived values for age and national ID validation
  const currentAge = useMemo((): number | null => {
    if (!dob) return null;
    const birthDate = new Date(dob + 'T00:00:00');
    if (isNaN(birthDate.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? age : null;
  }, [dob]);

  // DOB change protection: lock and reset to single if under 18
  useEffect(() => {
    if (currentAge !== null && currentAge < 18 && maritalStatus !== 'single') {
      setMaritalStatus('single');
    }
  }, [currentAge, maritalStatus]);

  const nationalIdValidation = useMemo(() => {
    return validateEgyptianNationalId(
      nationalId,
      dob || undefined,
      gender || undefined
    );
  }, [nationalId, dob, gender]);

  // Missing requirements and validity for Step 3 (Family Relations)
  const missingStep3Requirements = useMemo(() => {
    if (mainStepIndex !== 3) return [];
    const reqs: string[] = [];
    const isAdult = currentAge === null || currentAge >= 18;
    if (subStepIndex === 1 && isAdult) {
      if (!maritalStatus) {
        reqs.push(isRtl ? 'يرجى تحديد الحالة الاجتماعية' : 'Please select your marital status');
      }
      return reqs;
    }

    const father = familyMembers.find((m) => m.relation === 'father');
    const isFatherOk = Boolean(
      father && (father.isDeceased || father.memberId || (father.phone?.trim() && father.phone.trim().length >= 8))
    );

    const mother = familyMembers.find((m) => m.relation === 'mother');
    const isMotherOk = Boolean(
      mother && (mother.isDeceased || mother.memberId || (mother.phone?.trim() && mother.phone.trim().length >= 8))
    );

    const isParentOk = isFatherOk || isMotherOk;
    if (!isParentOk) {
      reqs.push(
        isRtl
          ? 'بيانات أحد الوالدين مطلوبة (الأب أو الأم: ربط عضو، إدخال هاتف، أو تحديد متوفى)'
          : 'At least one parent is required (Father or Mother: linked member, manual phone, or marked deceased)'
      );
    }

    if (maritalStatus === 'married') {
      const spouse = familyMembers.find((m) => m.relation === 'spouse');
      const isSpouseOk = Boolean(
        spouse && (spouse.isDeceased || spouse.memberId || (spouse.phone?.trim() && spouse.phone.trim().length >= 8))
      );
      if (!isSpouseOk) {
        reqs.push(
          isRtl
            ? 'بيانات شريك الحياة مطلوبة (ربط عضو، إدخال هاتف، أو تحديد متوفى)'
            : 'Spouse details are required (linked member, manual phone, or marked deceased)'
        );
      }
    }

    return reqs;
  }, [mainStepIndex, subStepIndex, currentAge, maritalStatus, familyMembers, isRtl]);

  const isStep3Valid = missingStep3Requirements.length === 0;

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

  // Dynamic Skip Button Visibility
  const isSkipVisible = useMemo(() => {
    if (!currentSubConfig?.isOptional) return false;
    // Step 2, Sub-step 2 (Email): Hide skip immediately when text is typed
    if (mainStepIndex === 2 && subStepIndex === 2 && email.trim().length > 0) {
      return false;
    }
    return true;
  }, [currentSubConfig?.isOptional, mainStepIndex, subStepIndex, email]);

  // Language changer
  const filteredLocales = langSearch.trim()
    ? SUPPORTED_LOCALES.filter((loc: string) => {
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
    const isPhoneOptional = currentAge !== null && currentAge < 13;
    if (isPhoneOptional && !phoneNumber.trim()) {
      return;
    }

    const val = validatePhoneNumber(phoneNumber, countryIso, countryCode, isRtl);
    if (!val.isValid) {
      setErrorMessage(val.error || (isRtl ? 'يرجى إدخال رقم هاتف صحيح' : 'Please enter a valid phone number'));
      return;
    }

    setErrorMessage(null);
    setIsSendingOtp(true);
    try {
      // 0. Check phone collision in directory
      const isCollision = await checkPhoneCollision(countryCode + phoneNumber);
      if (isCollision) {
        setErrorMessage(
          isRtl
            ? 'رقم الهاتف مسجل بالفعل لحساب آخر.'
            : 'This phone number is already registered to another account.'
        );
        return;
      }

      const res = await sendPhoneOtp(countryCode, phoneNumber);
      if (res.success) {
        setIsPhoneOtpActive(true);
        setOtpResendTimer(30);
        setOtpDigits(['', '', '', '', '', '']);
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

  // Email OTP Handlers
  const handleSendEmailOtp = async () => {
    const isEmailOptional = currentAge !== null && currentAge < 13;
    const trimmed = email.trim();
    if (isEmailOptional && !trimmed) {
      return;
    }

    if (!trimmed) {
      setErrorMessage(isRtl ? 'يرجى إدخال البريد الإلكتروني' : 'Please enter an email address');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setErrorMessage(isRtl ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Please enter a valid email address');
      return;
    }

    setErrorMessage(null);
    setIsSendingEmailOtp(true);
    try {
      // 0. Check email collision in directory
      const isCollision = await checkEmailCollision(trimmed);
      if (isCollision) {
        setErrorMessage(
          isRtl
            ? 'البريد الإلكتروني مسجل بالفعل لحساب آخر.'
            : 'This email address is already registered to another account.'
        );
        return;
      }

      const res = await sendEmailOtp(trimmed);
      if (res.success) {
        setEmailDevCode(res.devCode || null);
        setIsEmailOtpActive(true);
        setEmailOtpResendTimer(30);
        setEmailOtpDigits(['', '', '', '', '', '']);
        setTimeout(() => {
          emailOtpInputRefs.current[0]?.focus();
        }, 120);
      } else {
        setErrorMessage(res.error || (isRtl ? 'فشل إرسال رمز التحقق للبريد' : 'Failed to send email verification code.'));
      }
    } catch {
      setErrorMessage(isRtl ? 'حدث خطأ في الشبكة' : 'Network error sending email OTP.');
    } finally {
      setIsSendingEmailOtp(false);
    }
  };

  const handleVerifyEmailOtp = async (codeToVerify?: string) => {
    const code = codeToVerify || emailOtpDigits.join('');
    if (code.length !== 6) {
      setErrorMessage(isRtl ? 'يرجى إدخال رمز التحقق المكون من 6 أرقام' : 'Please enter the complete 6-digit code');
      return;
    }

    setErrorMessage(null);
    setIsVerifyingEmailOtp(true);
    try {
      const res = await verifyEmailOtp(email.trim(), code);
      if (res.success) {
        setIsEmailVerified(true);
        setIsEmailOtpActive(false);
        setErrorMessage(null);
        // Automatically advance to sub-step 3 (Landline)
        setSlideDirection('forward');
        setSubStepIndex(3);
      } else {
        setErrorMessage(res.error || (isRtl ? 'رمز التحقق غير صحيح أو منتهي الصلاحية' : 'Invalid or expired verification code.'));
      }
    } catch {
      setErrorMessage(isRtl ? 'حدث خطأ أثناء التحقق' : 'Error verifying email OTP code.');
    } finally {
      setIsVerifyingEmailOtp(false);
    }
  };

  const handleEmailOtpDigitChange = (index: number, val: string) => {
    const sanitized = val.replace(/\D/g, '');
    if (sanitized.length > 1) {
      const pasted = sanitized.slice(0, 6).split('');
      const newDigits = [...emailOtpDigits];
      pasted.forEach((d, idx) => {
        if (index + idx < 6) newDigits[index + idx] = d;
      });
      setEmailOtpDigits(newDigits);
      const nextFocus = Math.min(index + pasted.length, 5);
      emailOtpInputRefs.current[nextFocus]?.focus();
      if (newDigits.every((d) => d.length === 1)) {
        handleVerifyEmailOtp(newDigits.join(''));
      }
      return;
    }

    const singleDigit = sanitized.slice(-1);
    const newDigits = [...emailOtpDigits];
    newDigits[index] = singleDigit;
    setEmailOtpDigits(newDigits);

    if (errorMessage) setErrorMessage(null);

    if (singleDigit && index < 5) {
      emailOtpInputRefs.current[index + 1]?.focus();
    }

    if (singleDigit && newDigits.every((d) => d.length === 1)) {
      handleVerifyEmailOtp(newDigits.join(''));
    }
  };

  const handleEmailOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !emailOtpDigits[index] && index > 0) {
      emailOtpInputRefs.current[index - 1]?.focus();
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
        const isNationalIdRequired = currentAge === null || currentAge >= 16;
        if (isNationalIdRequired) {
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
        } else if (nationalId.trim()) {
          // Optional for < 16, but if entered, must be valid
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
        }
      } else if (subStepIndex === 6) {
        if (!avatarFile && !avatarPreview && !photoSkippedGracePeriod) {
          setErrorMessage(isRtl ? 'يرجى اختيار صورة أو الضغط على "تخطي مؤقتاً"' : 'Please select a photo or click Skip');
          return;
        }
      }
    } else if (mainStepIndex === 2) {
      if (subStepIndex === 1) {
        const isPhoneOptional = currentAge !== null && currentAge < 13;
        if (!isPhoneOptional || phoneNumber.trim()) {
          const val = validatePhoneNumber(phoneNumber, countryIso, countryCode, isRtl);
          if (!val.isValid) {
            setErrorMessage(val.error || (isRtl ? 'يرجى إدخال رقم هاتف صحيح' : 'Please enter a valid phone number'));
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
        }
      } else if (subStepIndex === 2) {
        const trimmedEmail = email.trim();
        if (trimmedEmail) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(trimmedEmail)) {
            setErrorMessage(isRtl ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Please enter a valid email address');
            return;
          }

          // Email OTP Verification Gate
          if (!isEmailVerified) {
            if (isEmailOtpActive) {
              handleVerifyEmailOtp();
            } else {
              handleSendEmailOtp();
            }
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
        // Advance from Step 2 to Step 3 with age check
        const isUnder18 = currentAge !== null && currentAge < 18;
        setSlideDirection('forward');
        setMainStepIndex(3);
        if (isUnder18) {
          setMaritalStatus('single');
          setSubStepIndex(2); // Skip marital status directly to family links
        } else {
          setSubStepIndex(1);
        }
        return;
      }
    } else if (mainStepIndex === 3) {
      const isAdult = currentAge === null || currentAge >= 18;
      if (subStepIndex === 1 && isAdult) {
        if (!maritalStatus) {
          setErrorMessage(isRtl ? 'يرجى تحديد حالتك الاجتماعية' : 'Please select your marital status');
          return;
        }
        setSlideDirection('forward');
        setSubStepIndex(2);
        return;
      } else {
        // Substep 2 (or under 18): Validate Mandatory Parents and Spouse
        const cleanReg = phoneNumber.trim().replace(/\D/g, '');

        const father = familyMembers.find((m) => m.relation === 'father');
        const isFatherOk = Boolean(father && (father.isDeceased || father.memberId || (father.phone?.trim() && father.phone.trim().length >= 8)));

        const mother = familyMembers.find((m) => m.relation === 'mother');
        const isMotherOk = Boolean(mother && (mother.isDeceased || mother.memberId || (mother.phone?.trim() && mother.phone.trim().length >= 8)));

        if (!isFatherOk && !isMotherOk) {
          setErrorMessage(
            isRtl
              ? 'يرجى استكمال بيانات أحد الوالدين على الأقل (الأب أو الأم: بحث في دليل الأعضاء، إدخال رقم الهاتف، أو تحديد متوفى)'
              : 'Please complete at least one parent (Father or Mother: search directory, enter phone number, or mark deceased)'
          );
          return;
        }

        // Duplicate phone check for Father vs Registered phone
        if (father && !father.isDeceased && father.phone) {
          const cleanFather = father.phone.trim().replace(/\D/g, '');
          if (cleanReg && cleanFather === cleanReg) {
            setErrorMessage(isRtl ? 'لا يمكن استخدام رقم هاتفك الشخصي لبيانات الأب' : 'Cannot use your own phone number for father');
            return;
          }
        }

        // Duplicate phone check for Mother vs Registered phone
        if (mother && !mother.isDeceased && mother.phone) {
          const cleanMother = mother.phone.trim().replace(/\D/g, '');
          if (cleanReg && cleanMother === cleanReg) {
            setErrorMessage(isRtl ? 'لا يمكن استخدام رقم هاتفك الشخصي لبيانات الأم' : 'Cannot use your own phone number for mother');
            return;
          }
        }

        // Duplicate phone check for Father vs Mother
        if (father && !father.isDeceased && father.phone && mother && !mother.isDeceased && mother.phone) {
          const cleanFather = father.phone.trim().replace(/\D/g, '');
          const cleanMother = mother.phone.trim().replace(/\D/g, '');
          if (cleanFather && cleanMother && cleanFather === cleanMother) {
            setErrorMessage(isRtl ? 'لا يمكن تكرار نفس رقم الهاتف للوالد والوالدة' : 'Father and mother cannot share the same phone number');
            return;
          }
        }

        if (maritalStatus === 'married') {
          const spouse = familyMembers.find((m) => m.relation === 'spouse');
          const isSpouseOk = Boolean(spouse && (spouse.isDeceased || spouse.memberId || (spouse.phone?.trim() && spouse.phone.trim().length >= 8)));
          if (!isSpouseOk) {
            setErrorMessage(
              isRtl
                ? 'يرجى استكمال بيانات شريك الحياة (الزوج / الزوجة)'
                : 'Please complete spouse information (search directory, enter phone number, or mark deceased)'
            );
            return;
          }

          if (spouse && !spouse.isDeceased && spouse.phone) {
            const cleanSpouse = spouse.phone.trim().replace(/\D/g, '');
            if (cleanReg && cleanSpouse === cleanReg) {
              setErrorMessage(isRtl ? 'لا يمكن استخدام رقم هاتفك الشخصي لبيانات شريك الحياة' : 'Cannot use your own phone number for spouse');
              return;
            }
          }
        }

        // Advance to Step 4
        setSlideDirection('forward');
        setMainStepIndex(4);
        setSubStepIndex(1);
        return;
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
    if (mainStepIndex === 2 && subStepIndex === 2 && isEmailOtpActive) {
      setIsEmailOtpActive(false);
      return;
    }
    if (mainStepIndex === 3) {
      const isUnder18 = currentAge !== null && currentAge < 18;
      if (subStepIndex === 2) {
        if (isUnder18) {
          setMainStepIndex(2);
          setSubStepIndex(4);
        } else {
          setSubStepIndex(1);
        }
        return;
      }
      if (subStepIndex === 1) {
        setMainStepIndex(2);
        setSubStepIndex(4);
        return;
      }
    }
    if (mainStepIndex === 4 && subStepIndex === 1) {
      setMainStepIndex(3);
      setSubStepIndex(2);
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
    if (mainStepIndex === 2 && subStepIndex === 2) {
      setEmail('');
      setIsEmailVerified(false);
      setIsEmailOtpActive(false);
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

    // Password Strength & Match Validations
    const strength = checkPasswordStrength(password);
    if (!strength.isStrong) {
      if (!strength.criteria.hasMinLength) {
        setErrorMessage(isRtl ? 'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل' : 'Password must be at least 8 characters long.');
      } else if (!strength.criteria.hasUppercase) {
        setErrorMessage(isRtl ? 'يجب أن تحتوي كلمة المرور على حرف كبير واحد على الأقل (A-Z)' : 'Password must include at least one uppercase letter (A-Z).');
      } else if (!strength.criteria.hasLowercase) {
        setErrorMessage(isRtl ? 'يجب أن تحتوي كلمة المرور على حرف صغير واحد على الأقل (a-z)' : 'Password must include at least one lowercase letter (a-z).');
      } else if (!strength.criteria.hasNumber) {
        setErrorMessage(isRtl ? 'يجب أن تحتوي كلمة المرور على رقم واحد على الأقل (0-9)' : 'Password must include at least one number (0-9).');
      } else if (!strength.criteria.hasSpecialChar) {
        setErrorMessage(isRtl ? 'يجب أن تحتوي كلمة المرور على رمز خاص واحد على الأقل (!@#$%^&*)' : 'Password must include at least one special symbol (!@#$%^&*).');
      } else {
        setErrorMessage(isRtl ? 'يجب أن تكون كلمة المرور قوية وتستوفي جميع شروط الأمان' : 'Password must be strong and satisfy all security criteria.');
      }
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
        phones: [
          ...(phoneNumber.trim() ? [{ countryCode, number: phoneNumber.trim(), isPrimary: true }] : []),
          ...additionalPhones
            .filter((p) => p.phone.trim())
            .map((p) => ({ countryCode: p.countryCode, number: p.phone.trim(), isPrimary: false })),
        ],
        emails: [
          ...(email.trim() ? [{ email: email.trim(), isPrimary: true }] : []),
          ...additionalEmails
            .filter((e) => e.email.trim())
            .map((e) => ({ email: e.email.trim(), isPrimary: false })),
        ],
        landlineAreaCode: landlineAreaCode.trim() || undefined,
        landlineNumber: landlineNumber.trim() || undefined,
        socials,
        password,
        maritalStatus,
        guardianName: guardianName.trim() || undefined,
        guardianPhone: guardianPhone.trim() || undefined,
        familyRelationType,
        familyMembers,
        ...step4Payload,
        ...step5Payload,
        ...step6Payload,
        governorate: step5Payload?.governorate_id || governorate,
        city: step5Payload?.city_id || city.trim() || undefined,
        streetAddress: step5Payload?.street_address || streetAddress.trim() || undefined,
        buildingNumber: step5Payload?.building_no || buildingNumber.trim() || undefined,
        floorNumber: step5Payload?.floor_no || floorNumber.trim() || undefined,
        apartmentNumber: step5Payload?.apartment || apartmentNumber.trim() || undefined,
        secondaryAddress: secondaryAddress.trim() || undefined,
        primary_diocese_id: step6Payload?.primary_diocese_id || undefined,
        primary_church_id: step6Payload?.primary_church_id || undefined,
        secondary_diocese_id: step6Payload?.secondary_diocese_id || undefined,
        secondary_church_id: step6Payload?.secondary_church_id || undefined,
        priest_id: priestId || undefined,
        diocese: step6Payload?.primary_diocese_name || diocese.trim() || undefined,
        primaryChurch: step6Payload?.primary_church_name || primaryChurch.trim() || undefined,
        secondaryChurch: step6Payload?.secondary_church_name || secondaryChurch.trim() || undefined,
        priestName: priestName.trim() || undefined,
        hobbies: selectedHobbies,
        languages: selectedLanguages,
      };

      const result = await createAccountAction(payload);

      const resetRegistrationFormToStart = () => {
        clearAllRegistrationDrafts();
        setMainStepIndex(1);
        setSubStepIndex(1);
        setEnglishFullName('');
        setArabicFullName('');
        setDob('');
        setGender('Male');
        setNationalId('');
        setAvatarFile(null);
        setAvatarPreview(null);
        setPhotoSkippedGracePeriod(false);
        setPhoneNumber('');
        setIsPhoneVerified(false);
        setEmail('');
        setIsEmailVerified(false);
        setAdditionalPhones([]);
        setAdditionalEmails([]);
        setLandlineAreaCode('');
        setLandlineNumber('');
        setSocials({
          whatsapp: { url: '' },
          facebook: { url: '' },
          instagram: { url: '' },
          threads: { url: '' },
          messenger: { url: '' },
          tiktok: { url: '' },
          snapchat: { url: '' },
          x: { url: '' },
          github: { url: '' },
          linkedin: { url: '' },
        });
        setMaritalStatus('single');
        setGuardianName('');
        setGuardianPhone('');
        setFamilyRelationType('Parent');
        setFamilyMembers([
          { id: 'father_default', relation: 'father', mode: 'search', isDeceased: false, countryCode: '+20' },
          { id: 'mother_default', relation: 'mother', mode: 'search', isDeceased: false, countryCode: '+20' },
        ]);
        setStep4Payload(null);
        setStep5Payload(null);
        setStep6Payload(null);
        setDiocese('');
        setPrimaryChurch('');
        setSecondaryChurch('');
        setPriestId('');
        setPriestName('');
        setIsCustomPriest(false);
        setSelectedHobbies(['hymns']);
        setSelectedLanguages(['ar', 'en']);
        setPassword('');
        setConfirmPassword('');
        setErrorMessage(null);
      };

      if (!result.success) {
        setErrorMessage(result.error || (isRtl ? 'حدث خطأ أثناء إنشاء الحساب' : 'Failed to create account.'));
        setLoading(false);
        return;
      }

      resetRegistrationFormToStart();
      setLoading(false);

      if (onNavigateLogin) {
        onNavigateLogin();
      } else {
        router.push('/login');
      }
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
        title: isRtl ? 'تأكيد رقم الهاتف عبر واتساب' : 'Verify Phone via WhatsApp',
        subtitle: isRtl
          ? `أدخل رمز التحقق المكون من 6 أرقام المرسل عبر واتساب إلى ${countryCode} ${phoneNumber}`
          : `Enter the 6-digit verification code sent via WhatsApp to ${countryCode} ${phoneNumber}`,
      };
    }
    if (mainStepIndex === 2 && subStepIndex === 2 && isEmailOtpActive) {
      return {
        title: isRtl ? 'تأكيد البريد الإلكتروني' : 'Verify your email address',
        subtitle: isRtl
          ? `أدخل رمز التحقق المكون من 6 أرقام المرسل إلى ${email}`
          : `Enter the 6-digit verification code sent to ${email}`,
      };
    }
    if (mainStepIndex === 2 && subStepIndex === 4) {
      return {
        title: isRtl ? 'حسابات التواصل الاجتماعي' : 'Social Media Accounts',
        subtitle: isRtl
          ? 'اربط حساباتك الرسمية لتسهيل التواصل والتحقق الموثوق لهويتك (مُوصى به)'
          : 'Connect your public profiles for fast verification and community features (Recommended)',
      };
    }
    if (mainStepIndex === 3) {
      if (currentAge !== null && currentAge < 18) {
        return {
          title: isRtl ? 'روابط الأسرة والعائلة' : 'Family Links & Household',
          subtitle: isRtl
            ? 'اربط بيانات الوالدين وأفراد الأسرة لتجميع العائلة في قاعدة بيانات الكنيسة'
            : 'Map your family connections and guardian details to link your church household.',
        };
      }
      if (subStepIndex === 1) {
        return {
          title: isRtl ? 'الحالة الاجتماعية' : 'Marital Status',
          subtitle: isRtl
            ? 'حدد حالتك الاجتماعية الحالية لتخصيص الأنشطة والخدمات الرعوية المناسبة'
            : 'Select your current marital status to tailor relevant pastoral care and community events',
        };
      }
      return {
        title: isRtl ? 'روابط الأسرة والعائلة' : 'Family Links & Household',
        subtitle: isRtl
          ? 'اربط بيانات الوالدين وشريك الحياة لتجميع العائلة في قاعدة بيانات الكنيسة'
          : 'Map your family connections and guardian details to link your church household.',
      };
    }
    if (mainStepIndex === 8) {
      return {
        title: isRtl ? 'تعيين كلمة المرور' : 'Create a Password',
        subtitle: isRtl ? 'أنشئ كلمة مرور قوية لحماية وتأمين حسابك الدائم' : 'Create a strong password to secure your permanent lifetime profile',
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
      className="relative w-full min-h-[100dvh] sm:min-h-screen shared-bg flex flex-col justify-between items-center p-0 md:p-8 transition-colors duration-300 overflow-x-hidden"
    >
      {/* Main Authentication Card Container */}
      <div className="relative z-20 w-full max-w-[1040px] flex flex-col md:flex-row gap-0 md:gap-14 min-h-[100dvh] md:min-h-fit h-auto items-stretch md:items-start transition-all duration-300 ease-in-out md:bg-white/95 md:dark:bg-[#1B212D]/95 md:rounded-[36px] md:p-12 md:shadow-2xl md:border md:border-white/60 md:dark:border-slate-800/80">
        {/* Top Section (Mobile Background / Desktop Left Column) */}
        <div className="w-full md:w-1/2 flex flex-col justify-start items-start text-start px-5 pt-6 pb-4 md:p-0 min-h-0 md:min-h-[420px]">
          <div className="space-y-3 w-full">
            {/* Integrated Unified Step Progress Bar & Milestone Indicator */}
            {mainStepIndex <= 8 && (
              <div className="space-y-3 w-full">
                {/* Milestone Pill & Draft Saved Indicator */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Image
                      src="/logo.webp"
                      alt="Politia logo"
                      width={28}
                      height={28}
                      priority
                      style={{ width: 'auto', height: 'auto' }}
                      className="object-contain shrink-0"
                    />
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#0B57D0] dark:text-[#93C5FD] border border-blue-200/80 dark:border-blue-800 text-xs font-bold shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0B57D0] dark:bg-[#60A5FA] animate-pulse" />
                      <span>
                        <bdi suppressHydrationWarning>
                          {mainStepIndex === 8
                            ? isRtl ? 'الخطوة الأخيرة: كلمة المرور' : 'Final Step: Password'
                            : isRtl
                            ? `الخطوة ${mainStepIndex} من 7 • ${currentMainConfig?.titleAr}`
                            : `Step ${mainStepIndex} of 7 • ${currentMainConfig?.titleEn}`}
                        </bdi>
                      </span>
                    </span>
                  </div>

                  {/* Real-Time Local Draft Saved Visual Cue */}
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 text-[11px] font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span><bdi>{isRtl ? 'المسودة محفوظة' : 'Draft saved'}</bdi></span>
                  </span>
                </div>

                {/* Smooth Animated Progress Bar */}
                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                  <div
                    className="h-full bg-gradient-to-r from-[#0B57D0] to-[#3B82F6] dark:from-[#3B82F6] dark:to-[#60A5FA] rounded-full transition-all duration-300 shadow-xs"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            )}

            {/* Dynamic Step Title & Subtitle */}
            <h1 className="text-[28px] sm:text-[34px] font-normal text-[#1F1F1F] dark:text-[#E3E3E3] tracking-tight leading-[1.15] pt-1">
              <bdi suppressHydrationWarning>{header.title}</bdi>
            </h1>
            <p className="text-[14px] sm:text-[16px] text-[#1F1F1F] dark:text-[#C4C7C5] font-normal leading-relaxed">
              <bdi suppressHydrationWarning>{header.subtitle}</bdi>
            </p>
          </div>
        </div>

        {/* Bottom Section (Mobile Bottom Sheet / Desktop Right Column) */}
        <div className="w-full md:w-1/2 flex-1 flex flex-col justify-between bg-white/95 dark:bg-[#1B212D]/95 md:bg-transparent md:dark:bg-transparent rounded-t-[32px] md:rounded-none p-5 pt-6 sm:p-8 md:p-0 shadow-2xl md:shadow-none border-t border-white/60 dark:border-slate-800/80 md:border-0 min-h-[55vh] md:min-h-[420px] overflow-hidden transition-all duration-300 ease-in-out mt-auto md:mt-0">
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
                      data-testid="input-fullname-en"
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
                      data-testid="input-fullname-ar"
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
                    data-testid="gender-option-male"
                    onClick={() => setGender('Male')}
                    className={`relative p-5 rounded-2xl border-2 flex flex-col items-center justify-center gap-2.5 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 ${
                      gender === 'Male'
                        ? 'border-[#0B57D0] dark:border-[#A8C7FA] bg-blue-50/80 dark:bg-blue-950/40 font-semibold text-[#0B57D0] dark:text-[#A8C7FA] shadow-xs'
                        : 'border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {gender === 'Male' && (
                      <span className="absolute top-2.5 end-2.5 w-5 h-5 rounded-full bg-[#0B57D0] text-white flex items-center justify-center text-[10px] shadow-xs">
                        <Check className="w-3 h-3 stroke-[2.5]" />
                      </span>
                    )}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      gender === 'Male' ? 'bg-blue-100 dark:bg-blue-900/60 text-[#0B57D0] dark:text-[#A8C7FA]' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}>
                      <User className="w-5 h-5" strokeWidth={1.75} />
                    </div>
                    <span className="text-xs sm:text-sm font-bold"><bdi>{isRtl ? 'ذكر' : 'Male'}</bdi></span>
                  </button>

                  <button
                    type="button"
                    data-testid="gender-option-female"
                    onClick={() => setGender('Female')}
                    className={`relative p-5 rounded-2xl border-2 flex flex-col items-center justify-center gap-2.5 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 ${
                      gender === 'Female'
                        ? 'border-[#0B57D0] dark:border-[#A8C7FA] bg-purple-50/80 dark:bg-purple-950/40 font-semibold text-purple-700 dark:text-purple-300 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {gender === 'Female' && (
                      <span className="absolute top-2.5 end-2.5 w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] shadow-xs">
                        <Check className="w-3 h-3 stroke-[2.5]" />
                      </span>
                    )}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      gender === 'Female' ? 'bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}>
                      <UserCheck className="w-5 h-5" strokeWidth={1.75} />
                    </div>
                    <span className="text-xs sm:text-sm font-bold"><bdi>{isRtl ? 'أنثى' : 'Female'}</bdi></span>
                  </button>
                </div>
              )}

              {/* 1.4: Date of Birth */}
              {subStepIndex === 4 && (
                <div className="space-y-3 py-2">
                  <div className="relative">
                    <input
                      id="reg-dob"
                      data-testid="input-dob"
                      type="date"
                      autoFocus
                      min="1920-01-01"
                      max={new Date().toISOString().split('T')[0]}
                      value={dob || ''}
                      onFocus={() => setIsDobFocused(true)}
                      onBlur={() => setIsDobFocused(false)}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDob(val);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      onInput={(e: React.FormEvent<HTMLInputElement>) => {
                        const val = (e.target as HTMLInputElement).value;
                        setDob(val);
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
                      data-testid="input-national-id"
                      type="text"
                      dir="ltr"
                      maxLength={14}
                      autoFocus
                      value={nationalId}
                      onFocus={() => setIsNationalIdFocused(true)}
                      onBlur={() => setIsNationalIdFocused(false)}
                      onChange={(e) => {
                        setNationalId(normalizeDigits(e.target.value).replace(/\D/g, ''));
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
                  <p className="text-[12px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-0.5">
                    <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span>
                      <bdi>
                        {isRtl
                          ? 'يجب أن يتكون من 14 رقماً ويطابق تاريخ ميلادك المسجل'
                          : 'Must contain 14 digits and match your registered date of birth'}
                      </bdi>
                    </span>
                  </p>
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
                  data-testid="onboarding-back-btn"
                  onClick={handleBack}
                  className="text-xs sm:text-sm font-semibold text-[#0B57D0] dark:text-[#93C5FD] hover:underline px-3 py-2 rounded-full transition-colors cursor-pointer"
                >
                  <bdi>{isRtl ? 'السابق' : 'Back'}</bdi>
                </button>

                <div className="flex items-center gap-2">
                  {isSkipVisible && (
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
                    data-testid="onboarding-next-btn"
                    disabled={
                      checkingCollision ||
                      (subStepIndex === 1 && hasNameCollision && countWords(englishFullName) < 5) ||
                      (subStepIndex === 2 && hasArabicNameCollision && countWords(arabicFullName) < 5)
                    }
                    className={`text-white text-xs sm:text-sm font-semibold px-6 py-2.5 rounded-full transition-colors flex items-center justify-center gap-2 shadow-sm ${
                      checkingCollision ||
                      (subStepIndex === 1 && hasNameCollision && countWords(englishFullName) < 5) ||
                      (subStepIndex === 2 && hasArabicNameCollision && countWords(arabicFullName) < 5)
                        ? 'bg-[#0B57D0]/50 cursor-not-allowed opacity-60'
                        : 'bg-[#0B57D0] hover:bg-[#0842A0] active:bg-[#06337E] cursor-pointer'
                    }`}
                  >
                    {checkingCollision ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <bdi>{isRtl ? 'جارٍ التحقق...' : 'Checking...'}</bdi>
                      </>
                    ) : (
                      <bdi>{isRtl ? 'التالي' : 'Next'}</bdi>
                    )}
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
                          <bdi>{isRtl ? 'أدخل رمز التحقق المرسل عبر واتساب (6 أرقام)' : 'Enter 6-digit code sent via WhatsApp'}</bdi>
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
                          {ALL_COUNTRIES.map((c: CountryInfo) => (
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

                      {/* Unified Material 3 Outlined Phone Number Input */}
                      <div className="relative">
                        <div
                          className={`w-full h-[56px] px-3.5 flex items-center bg-transparent rounded-[4px] border transition-all box-border ${
                            errorMessage
                              ? 'border-2 border-[#B3261E] dark:border-[#F2B8B5]'
                              : isPhoneFocused
                              ? 'border-2 border-[#0B57D0] dark:border-[#A8C7FA]'
                              : 'border border-[#747775] dark:border-[#8E918F] hover:border-[#1F1F1F] dark:hover:border-white'
                          }`}
                        >
                          {/* Dial Code Prefix */}
                          <span
                            className="font-mono text-sm font-semibold text-[#1F1F1F] dark:text-[#E3E3E3] shrink-0 select-none pe-3 border-e border-slate-300 dark:border-slate-700"
                            dir="ltr"
                          >
                            {countryCode}
                          </span>

                          {/* Numeric Phone Input */}
                          <input
                            id="reg-phone"
                            type="tel"
                            dir="ltr"
                            autoFocus
                            placeholder={
                              getCountryByIso(countryIso)?.placeholder ||
                              COUNTRY_PHONE_RULES[countryIso.toUpperCase()]?.example ||
                              '010 1234 5678'
                            }
                            value={phoneNumber}
                            onFocus={() => setIsPhoneFocused(true)}
                            onBlur={() => setIsPhoneFocused(false)}
                            onChange={(e) => {
                              setPhoneNumber(normalizeDigits(e.target.value));
                              setIsPhoneVerified(false);
                              if (errorMessage) setErrorMessage(null);
                            }}
                            className="flex-1 h-full ps-3 text-[15px] font-mono text-[#1F1F1F] dark:text-[#E3E3E3] bg-transparent focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                          />
                        </div>

                        {/* Persistent Top Border Floating Label matching Country Selector */}
                        <label
                          htmlFor="reg-phone"
                          className={`absolute -top-2.5 px-1.5 text-xs bg-white dark:bg-[#1B212D] start-3 pointer-events-none z-10 transition-colors ${
                            errorMessage
                              ? 'text-[#B3261E] dark:text-[#F2B8B5]'
                              : isPhoneFocused
                              ? 'text-[#0B57D0] dark:text-[#A8C7FA]'
                              : 'text-[#0B57D0] dark:text-[#A8C7FA]'
                          }`}
                        >
                          <bdi>{isRtl ? 'رقم الهاتف المحمول' : 'Mobile Phone Number'}</bdi>
                        </label>
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

                      {/* Secondary Phone Numbers (Max 10 total) */}
                      {isPhoneVerified && (
                        <div className="space-y-3 pt-2">
                          {additionalPhones.map((ap, idx) => (
                            <div key={ap.id} className="flex items-center gap-2 animate-fadeIn">
                              <div className="flex-1 flex items-center h-[48px] px-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                                <span className="text-xs font-mono text-slate-500 pe-2 border-e border-slate-200 dark:border-slate-700 select-none">
                                  {ap.countryCode}
                                </span>
                                <input
                                  type="tel"
                                  dir="ltr"
                                  placeholder="010XXXXXXXX"
                                  value={ap.phone}
                                  onChange={(e) => {
                                    const updated = [...additionalPhones];
                                    updated[idx].phone = normalizeDigits(e.target.value);
                                    setAdditionalPhones(updated);
                                  }}
                                  className="w-full h-full ps-2 text-xs font-mono bg-transparent text-[#1F1F1F] dark:text-[#E3E3E3] focus:outline-none"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setAdditionalPhones(additionalPhones.filter((_, i) => i !== idx));
                                }}
                                className="p-2.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-500 transition cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}

                          {additionalPhones.length < 9 && (
                            <button
                              type="button"
                              onClick={() => {
                                setAdditionalPhones([
                                  ...additionalPhones,
                                  { id: `phone_${Date.now()}`, countryIso: 'EG', countryCode: '+20', phone: '', isVerified: false },
                                ]);
                              }}
                              className="w-full py-2.5 border border-dashed border-slate-300 dark:border-slate-700 hover:border-[#0B57D0] dark:hover:border-[#A8C7FA] rounded-xl text-xs font-semibold text-[#0B57D0] dark:text-[#A8C7FA] transition flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <span>+ <bdi>{isRtl ? 'إضافة رقم هاتف إضافي (حتى 10 أرقام)' : 'Add Secondary Phone (Up to 10)'}</bdi></span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 2.2: Email & Email OTP */}
              {subStepIndex === 2 && (
                <div className="space-y-4 py-2">
                  {isEmailOtpActive ? (
                    /* 6-Digit Email OTP Verification View */
                    <div className="space-y-5 animate-fadeIn">
                      {/* Active Email Chip */}
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2 text-xs font-mono font-semibold text-slate-800 dark:text-slate-200">
                          <span className="text-base">📧</span>
                          <span className="truncate max-w-[200px] sm:max-w-none">{email}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEmailOtpActive(false);
                            if (errorMessage) setErrorMessage(null);
                          }}
                          className="text-xs font-semibold text-[#0B57D0] dark:text-[#93C5FD] hover:underline cursor-pointer flex items-center gap-1 shrink-0"
                        >
                          <Pencil className="w-3 h-3" />
                          <span><bdi>{isRtl ? 'تعديل البريد' : 'Edit Email'}</bdi></span>
                        </button>
                      </div>

                      {/* 6-Box Segmented OTP Inputs */}
                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 text-center">
                          <bdi>{isRtl ? 'أدخل رمز تأكيد البريد (6 أرقام)' : 'Enter email verification code (6 digits)'}</bdi>
                        </label>
                        <div className="flex items-center justify-center gap-2 sm:gap-2.5" dir="ltr">
                          {emailOtpDigits.map((digit, index) => (
                            <input
                              key={index}
                              ref={(el) => { emailOtpInputRefs.current[index] = el; }}
                              type="text"
                              inputMode="numeric"
                              pattern="\d*"
                              maxLength={1}
                              value={digit}
                              autoFocus={index === 0}
                              onChange={(e) => handleEmailOtpDigitChange(index, e.target.value)}
                              onKeyDown={(e) => handleEmailOtpKeyDown(index, e)}
                              className={`w-11 sm:w-12 h-13 sm:h-14 text-center font-mono text-xl sm:text-2xl font-bold rounded-lg border bg-transparent text-[#1F1F1F] dark:text-[#E3E3E3] focus:outline-none transition-all box-border ${
                                digit
                                  ? 'border-[#0B57D0] dark:border-[#A8C7FA] bg-blue-50/20 dark:bg-blue-900/10'
                                  : 'border-[#747775] dark:border-[#8E918F]'
                              } focus:border-2 focus:border-[#0B57D0] dark:focus:border-[#A8C7FA] shadow-sm`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Resend Timer & Actions */}
                      <div className="flex flex-col items-center gap-2 pt-1">
                        <div className="flex items-center justify-center gap-2 text-xs">
                          {emailOtpResendTimer > 0 ? (
                            <span className="text-slate-500 dark:text-slate-400">
                              <bdi>
                                {isRtl
                                  ? `إعادة إرسال الرمز خلال 0:${emailOtpResendTimer < 10 ? '0' : ''}${emailOtpResendTimer}`
                                  : `Resend code in 0:${emailOtpResendTimer < 10 ? '0' : ''}${emailOtpResendTimer}`}
                              </bdi>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={handleSendEmailOtp}
                              disabled={isSendingEmailOtp}
                              className="text-[#0B57D0] dark:text-[#93C5FD] font-semibold hover:underline cursor-pointer flex items-center gap-1.5"
                            >
                              <RotateCw className={`w-3 h-3 ${isSendingEmailOtp ? 'animate-spin' : ''}`} />
                              <span><bdi>{isRtl ? 'إعادة إرسال الرمز' : 'Resend Code'}</bdi></span>
                            </button>
                          )}
                        </div>

                        {emailDevCode && (
                          <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-[11px] text-blue-700 dark:text-blue-300 animate-fadeIn">
                            <Info className="w-3.5 h-3.5 shrink-0" />
                            <span>
                              <bdi>
                                {isRtl ? 'رمز التحقق (اختبار): ' : 'Test Code: '}
                                <strong className="font-mono font-bold text-blue-800 dark:text-blue-200">{emailDevCode}</strong> (أو 123456)
                              </bdi>
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const digits = (emailDevCode || '123456').slice(0, 6).split('');
                                setEmailOtpDigits(digits);
                                handleVerifyEmailOtp(digits.join(''));
                              }}
                              className="ms-1 underline font-bold cursor-pointer hover:text-blue-900 dark:hover:text-blue-100"
                            >
                              <bdi>{isRtl ? 'ملء وتأكيد' : 'Autofill'}</bdi>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Normal Email Input View */
                    <div className="space-y-3">
                      <div className="relative">
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
                            setIsEmailVerified(false);
                            if (errorMessage) setErrorMessage(null);
                          }}
                          className={`w-full h-[56px] px-4 text-[15px] text-[#1F1F1F] dark:text-[#E3E3E3] bg-transparent rounded-[4px] focus:outline-none transition-all box-border ${
                            errorMessage
                              ? 'border-2 border-[#B3261E] dark:border-[#F2B8B5]'
                              : isEmailFocused
                              ? 'border-2 border-[#0B57D0] dark:border-[#A8C7FA]'
                              : 'border border-[#747775] dark:border-[#8E918F] hover:border-[#1F1F1F] dark:hover:border-white'
                          }`}
                        />
                        <label
                          htmlFor="reg-email"
                          className={`absolute pointer-events-none transition-all duration-150 start-3 ${
                            isEmailFloating ? '-top-2.5 px-1 text-xs bg-white dark:bg-[#1B212D]' : 'top-4 text-[15px]'
                          } ${
                            errorMessage
                              ? 'text-[#B3261E] dark:text-[#F2B8B5]'
                              : 'text-[#0B57D0] dark:text-[#A8C7FA]'
                          }`}
                        >
                          <bdi>{isRtl ? 'البريد الإلكتروني (اختياري)' : 'Email Address (Optional)'}</bdi>
                        </label>
                      </div>

                      {/* Verified Badge */}
                      {isEmailVerified && email.trim() && (
                        <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 animate-fadeIn">
                          <div className="flex items-center gap-2 text-xs font-semibold">
                            <CheckCircle2 className="w-4 h-4" />
                            <span><bdi>{isRtl ? 'تم تأكيد البريد الإلكتروني بنجاح ✓' : 'Email Address Verified ✓'}</bdi></span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setIsEmailVerified(false);
                              setIsEmailOtpActive(false);
                            }}
                            className="text-xs text-slate-500 dark:text-slate-400 hover:underline cursor-pointer"
                          >
                            <bdi>{isRtl ? 'تغيير' : 'Change'}</bdi>
                          </button>
                        </div>
                      )}

                      {/* Secondary Emails (Max 10 total) */}
                      {isEmailVerified && (
                        <div className="space-y-3 pt-2">
                          {additionalEmails.map((ae, idx) => (
                            <div key={ae.id} className="flex items-center gap-2 animate-fadeIn">
                              <div className="flex-1 flex items-center h-[48px] px-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                                <input
                                  type="email"
                                  dir="ltr"
                                  placeholder="secondary@example.com"
                                  value={ae.email}
                                  onChange={(e) => {
                                    const updated = [...additionalEmails];
                                    updated[idx].email = e.target.value.trim();
                                    setAdditionalEmails(updated);
                                  }}
                                  className="w-full h-full text-xs font-mono bg-transparent text-[#1F1F1F] dark:text-[#E3E3E3] focus:outline-none"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setAdditionalEmails(additionalEmails.filter((_, i) => i !== idx));
                                }}
                                className="p-2.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-500 transition cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}

                          {additionalEmails.length < 9 && (
                            <button
                              type="button"
                              onClick={() => {
                                setAdditionalEmails([
                                  ...additionalEmails,
                                  { id: `email_${Date.now()}`, email: '', isVerified: false },
                                ]);
                              }}
                              className="w-full py-2.5 border border-dashed border-slate-300 dark:border-slate-700 hover:border-[#0B57D0] dark:hover:border-[#A8C7FA] rounded-xl text-xs font-semibold text-[#0B57D0] dark:text-[#A8C7FA] transition flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <span>+ <bdi>{isRtl ? 'إضافة بريد إلكتروني إضافي (حتى 10 حسابات)' : 'Add Secondary Email (Up to 10)'}</bdi></span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
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

              {/* 2.4: Social Links (Interactive Grid & Subscreens) */}
              {subStepIndex === 4 && (
                <SocialMediaStep
                  isRtl={isRtl}
                  socials={socials}
                  setSocials={setSocials}
                  registeredPhone={`${countryCode}${phoneNumber}`}
                  registeredEmail={email}
                  fullName={isRtl ? arabicFullName : englishFullName}
                />
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
                  {isSkipVisible && (
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
                    disabled={isSendingOtp || isVerifyingOtp || isSendingEmailOtp || isVerifyingEmailOtp}
                    className="bg-[#0B57D0] hover:bg-[#0842A0] active:bg-[#06337E] text-white text-xs sm:text-sm font-semibold px-6 py-2.5 rounded-full transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {(isSendingOtp || isVerifyingOtp || isSendingEmailOtp || isVerifyingEmailOtp) && <Loader2 className="w-4 h-4 animate-spin" />}
                    <bdi>
                      {subStepIndex === 1
                        ? isPhoneOtpActive
                          ? isRtl
                            ? 'تحقق ومتابعة'
                            : 'Verify & Continue'
                          : !isPhoneVerified
                          ? isRtl
                            ? 'إرسال الرمز عبر واتساب'
                            : 'Send WhatsApp Code'
                          : isRtl
                          ? 'التالي'
                          : 'Next'
                        : subStepIndex === 2
                        ? isEmailOtpActive
                          ? isRtl
                            ? 'تحقق ومتابعة'
                            : 'Verify & Continue'
                          : email.trim() && !isEmailVerified
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
                <FamilyRelationsStep
                  isRtl={isRtl}
                  userDob={dob}
                  userGender={gender}
                  userFullNameEn={fullEnglishName}
                  userFullNameAr={fullArabicName}
                  userGovernorate={governorate}
                  registeredPhone={phoneNumber}
                  maritalStatus={maritalStatus}
                  setMaritalStatus={setMaritalStatus}
                  familyMembers={familyMembers}
                  setFamilyMembers={setFamilyMembers}
                  subStepIndex={subStepIndex}
                  shakeMissingCards={shakeStep3Missing}
                />
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div id="register-error-alert" className="flex items-center gap-2 text-xs text-[#B3261E] dark:text-[#F2B8B5] mt-1.5 animate-fadeIn">
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

                <div
                  className="relative inline-block"
                  onMouseEnter={() => setShowStep3Tooltip(true)}
                  onMouseLeave={() => setShowStep3Tooltip(false)}
                >
                  {/* Floating Interactive Tooltip when invalid */}
                  {!isStep3Valid && showStep3Tooltip && (
                    <div
                      role="tooltip"
                      className={`absolute bottom-full right-0 mb-3 z-50 w-max max-w-[280px] sm:max-w-[320px] p-3 rounded-2xl shadow-xl border bg-slate-900 text-slate-50 border-slate-800 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 dark:shadow-2xl text-xs leading-relaxed animate-fadeIn transition-all pointer-events-none whitespace-normal break-words ${
                        isRtl ? 'text-right' : 'text-left'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-semibold pb-1.5 mb-1.5 border-b border-slate-800/80 dark:border-slate-700/80 text-amber-500 dark:text-amber-400">
                        <Info className="w-3.5 h-3.5 shrink-0" />
                        <span><bdi>{isRtl ? 'بيانات مطلوبة للاستمرار:' : 'Required to Proceed:'}</bdi></span>
                      </div>
                      <ul className="space-y-1.5 text-slate-200 dark:text-slate-300">
                        {missingStep3Requirements.map((req: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-amber-500 dark:text-amber-400 font-bold shrink-0">•</span>
                            <bdi className="leading-snug">{req}</bdi>
                          </li>
                        ))}
                      </ul>
                      {/* Tooltip arrow pointing to the button below */}
                      <div
                        className="absolute top-full w-2.5 h-2.5 bg-slate-900 dark:bg-slate-800 border-r border-b border-slate-800 dark:border-slate-700 transform rotate-45 -mt-1.5 right-6"
                      />
                    </div>
                  )}

                  {/* Next Button with disabled interaction & click-to-highlight */}
                  <div
                    onClick={() => {
                      if (!isStep3Valid) {
                        setShakeStep3Missing(true);
                        setTimeout(() => setShakeStep3Missing(false), 600);
                        if (missingStep3Requirements.length > 0) {
                          setErrorMessage(missingStep3Requirements[0]);
                        }
                      }
                    }}
                    className={!isStep3Valid ? 'cursor-not-allowed' : ''}
                  >
                    <button
                      type="submit"
                      disabled={!isStep3Valid}
                      className={`text-xs sm:text-sm font-semibold px-6 py-2.5 rounded-full transition-all flex items-center justify-center gap-2 shadow-sm ${
                        isStep3Valid
                          ? 'bg-[#0B57D0] hover:bg-[#0842A0] active:bg-[#06337E] text-white cursor-pointer'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-80 pointer-events-none'
                      }`}
                    >
                      <bdi>{isRtl ? 'التالي' : 'Next'}</bdi>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* Milestone 4: Education & Work */}
          {mainStepIndex === 4 && (
            <div className={`w-full flex-1 flex flex-col justify-between min-h-[420px] ${slideDirection === 'forward' ? 'animate-slide-forward' : 'animate-slide-backward'}`}>
              <Step4EducationWork
                age={currentAge ?? 18}
                defaultValues={step4Payload}
                isRtl={isRtl}
                onPartChange={handleStep4PartChange}
                onNext={(data: Step4Payload) => {
                  setStep4Payload(data);
                  // Manually advance to step 5 here if handleAdvance needs an event
                  setSlideDirection('forward');
                  setMainStepIndex(5);
                  setSubStepIndex(1);
                }}
                onBack={handleBack}
              />
            </div>
          )}

          {/* Milestone 5: Locations & Addresses */}
          {mainStepIndex === 5 && (
            <div className={`w-full flex-1 flex flex-col justify-between min-h-[420px] ${slideDirection === 'forward' ? 'animate-slide-forward' : 'animate-slide-backward'}`}>
              <Step5Locations
                defaultValues={step5Payload || undefined}
                isRtl={isRtl}
                onNext={(locData: Step5LocationPayload) => {
                  setStep5Payload(locData);
                  setSlideDirection('forward');
                  setMainStepIndex(6);
                  setSubStepIndex(1);
                }}
                onBack={handleBack}
              />
            </div>
          )}

          {/* Milestone 6: Church Commitment */}
          {mainStepIndex === 6 && (
            <div className={`w-full flex-1 flex flex-col justify-between min-h-[420px] ${slideDirection === 'forward' ? 'animate-slide-forward' : 'animate-slide-backward'}`}>
              {/* 6.1: Dynamic Location-Dependent Church Commitment */}
              {subStepIndex === 1 && (
                <Step6ChurchCommitment
                  primaryCityId={step5Payload?.city_id}
                  primaryGovernorateId={step5Payload?.governorate_id}
                  secondaryCityId={step5Payload?.secondary_city_id}
                  secondaryGovernorateId={step5Payload?.secondary_governorate_id}
                  dioceses={diocesesList}
                  churches={churchesList}
                  defaultValues={step6Payload || undefined}
                  isRtl={isRtl}
                  onSubmitAction={async (payload: Step6ChurchPayload) => {
                    setStep6Payload(payload);
                    if (payload.primary_diocese_name) setDiocese(payload.primary_diocese_name);
                    if (payload.primary_church_name) setPrimaryChurch(payload.primary_church_name);
                    if (payload.secondary_church_name) setSecondaryChurch(payload.secondary_church_name);
                    setSlideDirection('forward');
                    setSubStepIndex(2);
                  }}
                  onBack={handleBack}
                />
              )}

              {/* 6.2: Priest / Father of Confession Selection Dropdown */}
              {subStepIndex === 2 && (
                <form onSubmit={handleAdvance} className="w-full flex-1 flex flex-col justify-between min-h-[420px] space-y-4">
                  <div className="flex-grow flex flex-col justify-center min-h-[300px] w-full py-2 animate-fadeIn">
                    <div className="space-y-4 max-w-xl mx-auto w-full">
                      <div className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3.5">
                        
                        {/* Header */}
                        <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800/80">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span>{isRtl ? 'أب الاعتراف / الكاهن المسؤول (اختياري)' : 'Father of Confession / Priest (Optional)'}</span>
                          </span>

                          {step6Payload?.primary_church_name && (
                            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                              {step6Payload.primary_church_name}
                            </span>
                          )}
                        </div>

                        {/* Rich Account-Picker Priest Dropdown */}
                        <AccountPickerPriestDropdown
                          id="priest-account-picker"
                          value={isCustomPriest ? '__custom__' : priestId}
                          priestName={priestName}
                          isCustomPriest={isCustomPriest}
                          priests={priestsList}
                          churchName={step6Payload?.primary_church_name}
                          isRtl={isRtl}
                          onChange={(pId, pName, isCustom) => {
                            if (isCustom) {
                              setIsCustomPriest(true);
                              setPriestId('__custom__');
                              setPriestName(pName);
                            } else if (!pId) {
                              setIsCustomPriest(false);
                              setPriestId('');
                              setPriestName('');
                            } else {
                              setIsCustomPriest(false);
                              setPriestId(pId);
                              setPriestName(pName);
                            }
                          }}
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
                      onClick={() => {
                        setSlideDirection('backward');
                        setSubStepIndex(1);
                      }}
                      className="text-xs sm:text-sm font-semibold text-[#0B57D0] dark:text-[#93C5FD] hover:underline px-4 py-2 rounded-full cursor-pointer"
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
            </div>
          )}

          {/* Milestone 7: Additional Info */}
          {mainStepIndex === 7 && (
            <form onSubmit={handleAdvance} className="w-full flex-1 flex flex-col justify-between min-h-[420px] space-y-4">
              <div
                key={`7-${subStepIndex}`}
                className={`w-full flex-1 flex flex-col justify-center py-2 ${slideDirection === 'forward' ? 'animate-slide-forward' : 'animate-slide-backward'}`}
              >
                {/* 7.1: Facebook-style Hobbies & Church Activities */}
                {subStepIndex === 1 && (
                  <div className="w-full">
                    <FacebookHobbiesSelector
                      selectedHobbies={selectedHobbies}
                      onChange={setSelectedHobbies}
                      isRtl={isRtl}
                    />
                  </div>
                )}

                {/* 7.2: Hybrid Global Languages Selector */}
                {subStepIndex === 2 && (
                  <div className="w-full">
                    <LanguagesSelector
                      selectedLanguages={selectedLanguages}
                      onChange={setSelectedLanguages}
                      isRtl={isRtl}
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
                    <bdi>{isRtl ? 'كلمة المرور (يجب أن تكون قوية ومحمية)' : 'Password (Must be strong & secure)'}</bdi>
                  </label>
                </div>

                {/* Real-time Password Strength Meter & Security Checklist */}
                {password && (
                  <div className="animate-fadeIn">
                    <PasswordStrengthMeter password={password} isRtl={isRtl} />
                  </div>
                )}

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
                  {filteredLocales.map((loc: string) => (
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
