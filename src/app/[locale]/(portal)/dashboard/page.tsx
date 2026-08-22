import { setRequestLocale } from 'next-intl/server';
import { redirect } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/server';
import { SignOutButton } from '@/components/shared/SignOutButton';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { isRtlLocale } from '@/i18n/locales';
import Image from 'next/image';
import Link from 'next/link';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Church as ChurchIcon,
  GraduationCap,
  Briefcase,
  Heart,
  Globe,
  Users,
  ShieldCheck,
  Calendar,
  Building,
  Home,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Award,
} from 'lucide-react';
import { COMPREHENSIVE_HOBBIES } from '@/lib/constants/hobbiesData';
import { ALL_GLOBAL_LANGUAGES } from '@/lib/constants/languagesData';

interface UserProfile {
  id: string;
  full_name_en?: string | null;
  full_name_ar?: string | null;
  username?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  national_id?: string | null;
  birth_province_code?: string | null;
  avatar_url?: string | null;
  avatar_skipped_at?: string | null;
  primary_phone?: string | null;
  phone?: string | null;
  primary_email?: string | null;
  landline_phone?: string | null;
  facebook_url?: string | null;
  instagram_url?: string | null;
  linkedin_url?: string | null;
  facebook_handle?: string | null;
  instagram_handle?: string | null;
  tiktok_handle?: string | null;
  x_handle?: string | null;
  marital_status?: string | null;
  guardian_name?: string | null;
  guardian_phone?: string | null;
  education_stage?: string | null;
  faculty_or_school?: string | null;
  profession?: string | null;
  education_path?: string | null;
  school_stage?: string | null;
  school_id?: string | null;
  school_custom_name?: string | null;
  education_system?: string | null;
  grade_level?: string | null;
  school_name?: string | null;
  university_id?: string | null;
  university_name?: string | null;
  university_custom_name?: string | null;
  faculty_id?: string | null;
  faculty_name?: string | null;
  faculty_custom_name?: string | null;
  academic_year?: string | null;
  is_working?: boolean | null;
  job_title?: string | null;
  company_name?: string | null;
  is_postgrad?: boolean | null;
  postgrad_details?: string | null;
  country_id?: string | null;
  governorate_id?: string | null;
  city_id?: string | null;
  street_address?: string | null;
  building_no?: string | null;
  floor_no?: string | null;
  apartment?: string | null;
  has_secondary_address?: boolean | null;
  secondary_address_type?: string | null;
  secondary_country_id?: string | null;
  secondary_governorate_id?: string | null;
  secondary_city_id?: string | null;
  secondary_street_address?: string | null;
  secondary_building_no?: string | null;
  secondary_floor_no?: string | null;
  secondary_apartment?: string | null;
  address_governorate?: string | null;
  address_city?: string | null;
  address_street?: string | null;
  address_building?: string | null;
  address_floor?: string | null;
  address_apartment?: string | null;
  secondary_address?: string | null;
  primary_diocese_id?: string | null;
  primary_church_id?: string | null;
  secondary_diocese_id?: string | null;
  secondary_church_id?: string | null;
  priest_id?: string | null;
  diocese?: string | null;
  primary_church?: string | null;
  secondary_church?: string | null;
  priest_name?: string | null;
  hobbies?: string[] | null;
  languages?: string[] | null;
  is_deceased?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isRtl = isRtlLocale(locale);

  // Retrieve authenticated Supabase user
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect({ href: '/login', locale });
    return null;
  }

  // Fetch complete profile record
  let profile: UserProfile | null = null;
  try {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    profile = data as UserProfile | null;
  } catch (e) {
    console.warn('Dashboard profile fetch warning:', e);
  }

  // Fetch additional phones & emails
  let additionalPhones: { phone: string; is_primary: boolean }[] = [];
  let additionalEmails: { email: string; is_primary: boolean }[] = [];
  try {
    const [phonesRes, emailsRes] = await Promise.all([
      supabase.from('user_phones').select('phone, is_primary').eq('user_id', user.id),
      supabase.from('user_emails').select('email, is_primary').eq('user_id', user.id),
    ]);
    if (phonesRes.data) additionalPhones = phonesRes.data;
    if (emailsRes.data) additionalEmails = emailsRes.data;
  } catch (e) {
    console.warn('Contact lists fetch warning:', e);
  }

  // Fetch church, diocese, and priest relational names if available
  let primaryDioceseName = profile?.diocese || null;
  let primaryChurchName = profile?.primary_church || null;
  let secondaryDioceseName = null;
  let secondaryChurchName = profile?.secondary_church || null;
  let priestFullName = profile?.priest_name || null;

  try {
    if (profile?.primary_diocese_id) {
      const { data: d } = await supabase.from('dioceses').select('name_en, name_ar').eq('id', profile.primary_diocese_id).maybeSingle();
      if (d) primaryDioceseName = isRtl ? d.name_ar : d.name_en;
    }
    if (profile?.primary_church_id) {
      const { data: c } = await supabase.from('churches').select('name_en, name_ar').eq('id', profile.primary_church_id).maybeSingle();
      if (c) primaryChurchName = isRtl ? c.name_ar : c.name_en;
    }
    if (profile?.secondary_diocese_id) {
      const { data: d2 } = await supabase.from('dioceses').select('name_en, name_ar').eq('id', profile.secondary_diocese_id).maybeSingle();
      if (d2) secondaryDioceseName = isRtl ? d2.name_ar : d2.name_en;
    }
    if (profile?.secondary_church_id) {
      const { data: c2 } = await supabase.from('churches').select('name_en, name_ar').eq('id', profile.secondary_church_id).maybeSingle();
      if (c2) secondaryChurchName = isRtl ? c2.name_ar : c2.name_en;
    }
    if (profile?.priest_id) {
      const { data: p } = await supabase.from('priests').select('name_en, name_ar').eq('id', profile.priest_id).maybeSingle();
      if (p) priestFullName = isRtl ? p.name_ar : p.name_en;
    }
  } catch (e) {
    console.warn('Relational church lookups note:', e);
  }

  // Helper to detect UUID strings to prevent raw UUID display
  const isUUID = (str?: string | null): boolean =>
    Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str.trim()));

  // 1. Resolve Location & Address Names
  let resolvedPrimaryGov: string | null = null;
  let resolvedPrimaryCity: string | null = null;
  let resolvedPrimaryCountry: string | null = null;
  let secondaryAddressesList: { type: string; formatted: string }[] = [];

  try {
    if (profile?.governorate_id) {
      const { data: g } = await supabase.from('governorates').select('name_en, name_ar').eq('id', profile.governorate_id).maybeSingle();
      if (g) resolvedPrimaryGov = isRtl ? g.name_ar : g.name_en;
    }
    if (!resolvedPrimaryGov && profile?.address_governorate && !isUUID(profile.address_governorate)) {
      resolvedPrimaryGov = profile.address_governorate;
    }

    if (profile?.city_id) {
      const { data: c } = await supabase.from('cities').select('name_en, name_ar').eq('id', profile.city_id).maybeSingle();
      if (c) resolvedPrimaryCity = isRtl ? c.name_ar : c.name_en;
    }
    if (!resolvedPrimaryCity && profile?.address_city && !isUUID(profile.address_city)) {
      resolvedPrimaryCity = profile.address_city;
    }

    if (profile?.country_id) {
      const { data: ct } = await supabase.from('countries').select('name_en, name_ar').eq('id', profile.country_id).maybeSingle();
      if (ct) resolvedPrimaryCountry = isRtl ? ct.name_ar : ct.name_en;
    }

    // Fetch User Addresses table
    const { data: userAddrs } = await supabase
      .from('user_addresses')
      .select('address_type, country_id, governorate_id, city_id, street_address, building_no, floor_no, apartment')
      .eq('user_id', user.id);

    if (userAddrs && userAddrs.length > 0) {
      for (const addr of userAddrs) {
        let gName: string | null = null;
        let cName: string | null = null;

        if (addr.governorate_id) {
          const { data: g } = await supabase.from('governorates').select('name_en, name_ar').eq('id', addr.governorate_id).maybeSingle();
          if (g) gName = isRtl ? g.name_ar : g.name_en;
        }
        if (addr.city_id) {
          const { data: c } = await supabase.from('cities').select('name_en, name_ar').eq('id', addr.city_id).maybeSingle();
          if (c) cName = isRtl ? c.name_ar : c.name_en;
        }

        const bldgStr = addr.building_no ? `${isRtl ? 'عمارة' : 'Bldg'} ${addr.building_no}` : null;
        const floorStr = addr.floor_no ? `${isRtl ? 'دور' : 'Floor'} ${addr.floor_no}` : null;
        const aptStr = addr.apartment ? `${isRtl ? 'شقة' : 'Apt'} ${addr.apartment}` : null;
        const streetStr = addr.street_address && !isUUID(addr.street_address) ? addr.street_address : null;

        const parts = [bldgStr, floorStr, aptStr, streetStr, cName, gName].filter(Boolean);
        if (parts.length > 0) {
          secondaryAddressesList.push({
            type: addr.address_type || 'Other',
            formatted: parts.join(', '),
          });
        }
      }
    }
  } catch (e) {
    console.warn('Address resolution note:', e);
  }

  // 2. Resolve Education & Institution Names
  let resolvedSchoolName: string | null = null;
  let resolvedUniversityName: string | null = null;
  let resolvedFacultyName: string | null = null;

  try {
    if (profile?.school_id) {
      const { data: s } = await supabase.from('schools').select('name_en, name_ar').eq('id', profile.school_id).maybeSingle();
      if (s) resolvedSchoolName = isRtl ? s.name_ar : s.name_en;
    }
    if (!resolvedSchoolName) {
      resolvedSchoolName = (profile as any)?.school_custom_name ||
        (profile?.school_name && !isUUID(profile.school_name) ? profile.school_name : null) ||
        (profile?.faculty_or_school && !isUUID(profile.faculty_or_school) ? profile.faculty_or_school : null);
    }

    if (profile?.university_id) {
      const { data: u } = await supabase.from('universities').select('name_en, name_ar').eq('id', profile.university_id).maybeSingle();
      if (u) resolvedUniversityName = isRtl ? u.name_ar : u.name_en;
    }
    if (!resolvedUniversityName) {
      resolvedUniversityName = (profile as any)?.university_custom_name ||
        (profile?.university_name && !isUUID(profile.university_name) ? profile.university_name : null);
    }

    if (profile?.faculty_id) {
      const { data: f } = await supabase.from('faculties').select('name_en, name_ar').eq('id', profile.faculty_id).maybeSingle();
      if (f) resolvedFacultyName = isRtl ? f.name_ar : f.name_en;
    }
    if (!resolvedFacultyName) {
      resolvedFacultyName = (profile as any)?.faculty_custom_name ||
        (profile?.faculty_name && !isUUID(profile.faculty_name) ? profile.faculty_name : null);
    }
  } catch (e) {
    console.warn('Education resolution note:', e);
  }

  // Format primary address line cleanly
  const primaryBldgStr = profile?.building_no ? `${isRtl ? 'عمارة' : 'Bldg'} ${profile.building_no}` : (profile?.address_building ? `${isRtl ? 'عمارة' : 'Bldg'} ${profile.address_building}` : null);
  const primaryFloorStr = profile?.floor_no ? `${isRtl ? 'دور' : 'Floor'} ${profile.floor_no}` : (profile?.address_floor ? `${isRtl ? 'دور' : 'Floor'} ${profile.address_floor}` : null);
  const primaryAptStr = profile?.apartment ? `${isRtl ? 'شقة' : 'Apt'} ${profile.apartment}` : (profile?.address_apartment ? `${isRtl ? 'شقة' : 'Apt'} ${profile.address_apartment}` : null);
  const primaryStreetStr = (profile?.street_address && !isUUID(profile.street_address))
    ? profile.street_address
    : ((profile?.address_street && !isUUID(profile.address_street)) ? profile.address_street : null);

  const primaryAddressFormatted = [
    primaryBldgStr,
    primaryFloorStr,
    primaryAptStr,
    primaryStreetStr,
    resolvedPrimaryCity,
    resolvedPrimaryGov,
    resolvedPrimaryCountry,
  ].filter(Boolean).join(', ');

  const calculateAge = (dobString?: string | null) => {
    if (!dobString) return null;
    try {
      const birth = new Date(dobString);
      const now = new Date();
      let age = now.getFullYear() - birth.getFullYear();
      const m = now.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
        age--;
      }
      return age >= 0 ? age : null;
    } catch {
      return null;
    }
  };

  const formatTimestamp = (ts?: string | null) => {
    if (!ts) return '—';
    try {
      return new Date(ts).toLocaleString(locale, {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return ts;
    }
  };

  const userAge = calculateAge(profile?.date_of_birth);

  const userMeta = user.user_metadata as Record<string, unknown> | undefined;
  const englishName = profile?.full_name_en || (typeof userMeta?.full_name_en === 'string' ? userMeta.full_name_en : null) || 'User';
  const arabicName = profile?.full_name_ar || (typeof userMeta?.full_name_ar === 'string' ? userMeta.full_name_ar : null) || '';
  const primaryDisplay = isRtl ? (arabicName || englishName) : (englishName || arabicName);
  const secondaryDisplay = isRtl ? englishName : arabicName;

  // Resolve hobbies details
  const userHobbies = (profile?.hobbies || []).map((hobbyId: string) => {
    const found = COMPREHENSIVE_HOBBIES.find((h: { id: string }) => h.id === hobbyId);
    if (found) {
      return { id: found.id, emoji: found.emoji, label: isRtl ? found.labelAr : found.labelEn };
    }
    return { id: hobbyId, emoji: '⭐', label: hobbyId.replace(/^custom_\d+_/, '').replace(/_/g, ' ') };
  });

  // Resolve languages details
  const userLanguages = (profile?.languages || []).map((code: string) => {
    const found = ALL_GLOBAL_LANGUAGES.find((l: { code: string }) => l.code === code);
    if (found) {
      return { code: found.code, flag: found.flag || '🌐', label: isRtl ? found.nameAr : found.nameEn };
    }
    return { code, flag: '🗣️', label: code.replace(/^custom_\d+_/, '').replace(/_/g, ' ') };
  });

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen bg-slate-50 dark:bg-[#0F141C] text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-[#151B26]/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.webp"
              alt="Politia logo"
              width={34}
              height={34}
              priority
              style={{ width: 'auto', height: 'auto' }}
              className="object-contain shrink-0"
            />
            <div>
              <h1 className="font-bold text-sm sm:text-base tracking-tight leading-tight flex items-center gap-1.5">
                <span>{isRtl ? 'منصة بوليتيا الكنسية' : 'Politia App'}</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                  {isRtl ? 'الملف الشامل' : 'Universal Profile'}
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{isRtl ? 'حساب موثق ونشط' : 'Verified Lifetime Account'}</span>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        
        {/* 1. Hero Profile Banner */}
        <section className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#18202F] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <UserAvatar
              src={profile?.avatar_url}
              alt={primaryDisplay}
              initialLetter={primaryDisplay}
            />

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {primaryDisplay}
                </h2>
                {secondaryDisplay && secondaryDisplay !== primaryDisplay && (
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    ({secondaryDisplay})
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                {profile?.gender && (
                  <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                    {profile.gender === 'Male' || profile.gender === 'male' ? (isRtl ? 'ذكر 👨' : 'Male 👨') : (isRtl ? 'أنثى 👩' : 'Female 👩')}
                  </span>
                )}
                {userAge !== null && (
                  <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                    {isRtl ? `${userAge} سنة` : `${userAge} years old`}
                  </span>
                )}
                {profile?.national_id && (
                  <span className="px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-mono font-medium border border-blue-200/60 dark:border-blue-900">
                    🆔 {profile.national_id}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="text-start md:text-end text-xs text-slate-500 dark:text-slate-400 space-y-1">
            <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center md:justify-end gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>{isRtl ? 'الملف الشخصي الدائم' : 'Permanent Member ID'}</span>
            </p>
            <code className="text-[11px] font-mono text-slate-400 block break-all select-all">
              {user.id}
            </code>
            <p className="text-[11px]">
              {isRtl ? 'تاريخ التسجيل: ' : 'Member since: '} {formatTimestamp(user.created_at)}
            </p>
          </div>
        </section>

        {/* 2. Comprehensive Info Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Card 1: Personal & Identity Info */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#18202F] space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800 text-blue-600 dark:text-blue-400 font-bold text-xs">
              <User className="w-4 h-4" />
              <span>{isRtl ? 'البيانات الشخصية والهوية' : 'Personal & Identity Details'}</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">{isRtl ? 'الاسم بالإنجليزية (رباعي/خماسي):' : 'Full English Name:'}</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{profile?.full_name_en || '—'}</p>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">{isRtl ? 'الاسم بالعربية (رباعي/خماسي):' : 'Full Arabic Name:'}</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{profile?.full_name_ar || '—'}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block mb-0.5">{isRtl ? 'تاريخ الميلاد:' : 'Date of Birth:'}</span>
                  <p className="font-medium text-slate-800 dark:text-slate-200">{profile?.date_of_birth || '—'}</p>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">{isRtl ? 'العمر:' : 'Age:'}</span>
                  <p className="font-medium text-slate-800 dark:text-slate-200">{userAge !== null ? `${userAge} ${isRtl ? 'سنة' : 'years'}` : '—'}</p>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">{isRtl ? 'الرقم القومي المصري:' : 'National ID:'}</span>
                <p className="font-mono font-semibold text-slate-800 dark:text-slate-200">{profile?.national_id || '—'}</p>
              </div>

              {profile?.marital_status && (
                <div>
                  <span className="text-slate-400 block mb-0.5">{isRtl ? 'الحالة الاجتماعية:' : 'Marital Status:'}</span>
                  <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-medium capitalize">
                    {profile.marital_status}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Contact & Social Info */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#18202F] space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
              <Phone className="w-4 h-4" />
              <span>{isRtl ? 'بيانات التواصل والحسابات' : 'Contact & Social Details'}</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">{isRtl ? 'رقم الهاتف الأساسي:' : 'Primary Phone:'}</span>
                <p className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  {profile?.primary_phone || profile?.phone || '—'}
                </p>
              </div>

              {additionalPhones.length > 1 && (
                <div>
                  <span className="text-slate-400 block mb-0.5">{isRtl ? 'أرقام هواتف إضافية:' : 'Additional Phones:'}</span>
                  <div className="flex flex-wrap gap-1">
                    {additionalPhones.slice(1).map((p, idx) => (
                      <span key={idx} className="font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px]">
                        {p.phone}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <span className="text-slate-400 block mb-0.5">{isRtl ? 'البريد الإلكتروني:' : 'Primary Email:'}</span>
                <p className="font-medium text-slate-800 dark:text-slate-200 break-all">
                  {profile?.primary_email || user.email || '—'}
                </p>
              </div>

              {profile?.landline_phone && (
                <div>
                  <span className="text-slate-400 block mb-0.5">{isRtl ? 'التليفون الأرضي:' : 'Landline:'}</span>
                  <p className="font-mono font-medium text-slate-800 dark:text-slate-200">
                    {profile.landline_phone}
                  </p>
                </div>
              )}

              {/* Connected Socials */}
              <div className="pt-1">
                <span className="text-slate-400 block mb-1.5">{isRtl ? 'حسابات التواصل المربوطة:' : 'Connected Social Profiles:'}</span>
                <div className="flex flex-wrap gap-1.5">
                  {profile?.facebook_url && (
                    <a href={profile.facebook_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:underline text-[11px] font-medium border border-blue-200/60 dark:border-blue-900">
                      <span>Facebook</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                  {profile?.instagram_url && (
                    <a href={profile.instagram_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 hover:underline text-[11px] font-medium border border-pink-200/60 dark:border-pink-900">
                      <span>Instagram</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                  {profile?.linkedin_url && (
                    <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 hover:underline text-[11px] font-medium border border-sky-200/60 dark:border-sky-900">
                      <span>LinkedIn</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                  {!profile?.facebook_url && !profile?.instagram_url && !profile?.linkedin_url && (
                    <span className="text-slate-400 text-[11px]">{isRtl ? 'لا توجد روابط مضافة' : 'None linked'}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Church Commitment & Priest */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#18202F] space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800 text-amber-600 dark:text-amber-400 font-bold text-xs">
              <ChurchIcon className="w-4 h-4" />
              <span>{isRtl ? 'الارتباط الكنسي وأب الاعتراف' : 'Church Commitment & Clergy'}</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">{isRtl ? 'الإيبارشية التابع لها:' : 'Primary Diocese:'}</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {primaryDioceseName || '—'}
                </p>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">{isRtl ? 'الكنيسة الأساسية:' : 'Primary Parish / Church:'}</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <span>⛪</span>
                  <span>{primaryChurchName || '—'}</span>
                </p>
              </div>

              {secondaryChurchName && (
                <div>
                  <span className="text-slate-400 block mb-0.5">{isRtl ? 'الكنيسة الثانوية / الإضافية:' : 'Secondary Church:'}</span>
                  <p className="font-medium text-slate-700 dark:text-slate-300">
                    {secondaryChurchName}
                  </p>
                </div>
              )}

              <div className="pt-1">
                <span className="text-slate-400 block mb-0.5">{isRtl ? 'أب الاعتراف / الكاهن المسؤول:' : 'Father of Confession / Priest:'}</span>
                <p className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 bg-blue-50/50 dark:bg-blue-950/40 p-2 rounded-xl border border-blue-100 dark:border-blue-900/60">
                  <span>✝️</span>
                  <span>{priestFullName || (isRtl ? 'لم يحدد' : 'Not specified')}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Card 4: Residential Locations */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#18202F] space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800 text-rose-600 dark:text-rose-400 font-bold text-xs">
              <MapPin className="w-4 h-4" />
              <span>{isRtl ? 'العناوين ومحل الإقامة' : 'Residential Addresses'}</span>
            </div>

            <div className="space-y-3 text-xs">
              {/* Primary Address */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Home className="w-3.5 h-3.5 text-blue-600" />
                  <span>{isRtl ? 'محل الإقامة الأساسي:' : 'Primary Residence:'}</span>
                </span>
                <p className="font-medium text-slate-800 dark:text-slate-200">
                  {primaryAddressFormatted || '—'}
                </p>
              </div>

              {/* Secondary Addresses (from user_addresses or secondary profile fields) */}
              {secondaryAddressesList.length > 0 ? (
                secondaryAddressesList.map((addr, idx) => (
                  <div key={idx} className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{isRtl ? `العنوان الثانوي (${addr.type}):` : `Secondary Address (${addr.type}):`}</span>
                    </span>
                    <p className="font-medium text-slate-700 dark:text-slate-300">
                      {addr.formatted}
                    </p>
                  </div>
                ))
              ) : (profile?.secondary_street_address || profile?.secondary_address) && (
                <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{isRtl ? `العنوان الثانوي (${profile.secondary_address_type || 'إضافي'}):` : `Secondary Address (${profile.secondary_address_type || 'Other'}):`}</span>
                  </span>
                  <p className="font-medium text-slate-700 dark:text-slate-300">
                    {[
                      !isUUID(profile.secondary_street_address) ? profile.secondary_street_address : (!isUUID(profile.secondary_address) ? profile.secondary_address : null),
                      profile.secondary_building_no ? `${isRtl ? 'عمارة' : 'Bldg'} ${profile.secondary_building_no}` : null,
                      profile.secondary_floor_no ? `${isRtl ? 'دور' : 'Floor'} ${profile.secondary_floor_no}` : null,
                      profile.secondary_apartment ? `${isRtl ? 'شقة' : 'Apt'} ${profile.secondary_apartment}` : null,
                    ].filter(Boolean).join(', ')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Card 5: Education & Career */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#18202F] space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
              <GraduationCap className="w-4 h-4" />
              <span>{isRtl ? 'التعليم والمسار المهني' : 'Education & Career'}</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">{isRtl ? 'المسار التعليمي:' : 'Educational Path:'}</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                  {profile?.education_path === 'BASIC'
                    ? (isRtl ? 'تعليم أساسي / قبلي (مدارس)' : 'Basic School Education')
                    : profile?.education_path === 'UNIVERSITY'
                    ? (isRtl ? 'تعليم جامعي (طالب)' : 'University Student')
                    : profile?.education_path === 'GRADUATED'
                    ? (isRtl ? 'خريج جامعي' : 'University Graduate')
                    : (profile?.education_path || profile?.education_stage || '—')}
                </p>
              </div>

              {/* School Name */}
              {resolvedSchoolName && (
                <div>
                  <span className="text-slate-400 block mb-0.5">{isRtl ? 'المدرسة:' : 'School:'}</span>
                  <p className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <span>🏫</span>
                    <span>
                      {resolvedSchoolName}
                      {profile?.school_stage ? ` (${profile.school_stage})` : ''}
                    </span>
                  </p>
                </div>
              )}

              {/* University & Faculty Name */}
              {(resolvedUniversityName || resolvedFacultyName) && (
                <div>
                  <span className="text-slate-400 block mb-0.5">{isRtl ? 'الجامعة والكلية:' : 'University & Faculty:'}</span>
                  <p className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <span>🎓</span>
                    <span>
                      {[resolvedUniversityName, resolvedFacultyName].filter(Boolean).join(' - ')}
                    </span>
                  </p>
                </div>
              )}

              {/* Grade / Academic Year */}
              {(profile?.academic_year || profile?.grade_level) && (
                <div>
                  <span className="text-slate-400 block mb-0.5">{isRtl ? 'السنة الدراسية / الصف:' : 'Grade / Academic Year:'}</span>
                  <p className="font-medium text-slate-800 dark:text-slate-200">
                    {profile?.academic_year || profile?.grade_level}
                  </p>
                </div>
              )}

              {/* Job Title & Company */}
              {profile?.job_title && (
                <div className="pt-1">
                  <span className="text-slate-400 block mb-0.5">{isRtl ? 'الوظيفة الحالية:' : 'Current Job / Profession:'}</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                    <span>{profile.job_title} {profile.company_name ? `@ ${profile.company_name}` : ''}</span>
                  </p>
                </div>
              )}

              {/* Postgrad Studies */}
              {profile?.is_postgrad && (
                <div className="pt-1">
                  <span className="text-slate-400 block mb-0.5">{isRtl ? 'الدراسات العليا:' : 'Post-Graduate Studies:'}</span>
                  <p className="font-medium text-indigo-600 dark:text-indigo-400">
                    {profile.postgrad_details || (isRtl ? 'مسجل دراسات عليا' : 'Enrolled in post-grad')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Card 6: Hobbies & Languages */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#18202F] space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800 text-purple-600 dark:text-purple-400 font-bold text-xs">
              <Heart className="w-4 h-4" />
              <span>{isRtl ? 'الهوايات واللغات المتقنة' : 'Hobbies & Languages'}</span>
            </div>

            <div className="space-y-3 text-xs">
              {/* Hobbies List */}
              <div>
                <span className="text-slate-400 block mb-1.5">{isRtl ? 'الاهتمامات والأنشطة:' : 'Hobbies & Church Activities:'}</span>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto [&::-webkit-scrollbar]:hidden">
                  {userHobbies.length > 0 ? (
                    userHobbies.map((h) => (
                      <span key={h.id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium border border-slate-200/60 dark:border-slate-700/60">
                        <span>{h.emoji}</span>
                        <span>{h.label}</span>
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </div>
              </div>

              {/* Languages List */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block mb-1.5">{isRtl ? 'اللغات المتقنة:' : 'Languages Spoken:'}</span>
                <div className="flex flex-wrap gap-1.5">
                  {userLanguages.length > 0 ? (
                    userLanguages.map((l) => (
                      <span key={l.code} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[11px] font-medium border border-blue-200/80 dark:border-blue-900/60">
                        <span>{l.flag}</span>
                        <span>{l.label}</span>
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}