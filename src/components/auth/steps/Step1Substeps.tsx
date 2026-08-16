'use client';

import React, { useRef, useState } from 'react';
import {
  autoCapitalizeEnglishName,
  countWords,
  validateEnglishName,
  validateArabicName,
} from '@/lib/validation/name-rules';
import { validateEgyptianNationalId } from '@/lib/validation/national-id';
import { checkEnglishNameCollision } from '@/app/actions/auth-check';
import { GenderType } from '@/types/database.types';

export interface Step1Data {
  englishName: string;
  hasNameCollision: boolean;
  arabicName: string;
  dob: string;
  gender: GenderType | null;
  nationalId: string;
  avatarFile: File | null;
  avatarPreview: string | null;
  photoSkippedGracePeriod: boolean;
}

interface Step1SubstepProps {
  substep: 1 | 2 | 3 | 4 | 5 | 6;
  data: Step1Data;
  onChange: (updated: Partial<Step1Data>) => void;
  isRtl: boolean;
}

export function Step1Substeps({ substep, data, onChange, isRtl }: Step1SubstepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [checkingCollision, setCheckingCollision] = useState(false);

  // English Name Validations
  const englishValidation = validateEnglishName(data.englishName, data.hasNameCollision);
  const engWordCount = countWords(data.englishName);
  const requiredEngWords = data.hasNameCollision ? 5 : 4;
  const engRemaining = Math.max(0, requiredEngWords - engWordCount);

  // Arabic Name Validations
  const targetArWords = Math.max(requiredEngWords, engWordCount || requiredEngWords);
  const arabicValidation = validateArabicName(data.arabicName, targetArWords);
  const arWordCount = countWords(data.arabicName);

  // Age calculation
  const calculateAge = (dobString: string): number | null => {
    if (!dobString) return null;
    const birthDate = new Date(dobString);
    if (isNaN(birthDate.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? age : null;
  };
  const currentAge = calculateAge(data.dob);

  // National ID Validation & Cross-checks
  const nationalIdValidation = validateEgyptianNationalId(
    data.nationalId,
    data.dob || undefined,
    data.gender || undefined
  );

  const handleEnglishChange = (val: string) => {
    const formatted = autoCapitalizeEnglishName(val);
    onChange({ englishName: formatted });
  };

  const handleEnglishBlur = async () => {
    if (engWordCount >= 4 && !data.hasNameCollision) {
      setCheckingCollision(true);
      try {
        const isDuplicate = await checkEnglishNameCollision(data.englishName);
        if (isDuplicate) {
          onChange({ hasNameCollision: true });
        }
      } catch {
        // Continue gracefully
      } finally {
        setCheckingCollision(false);
      }
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      onChange({
        avatarFile: file,
        avatarPreview: previewUrl,
        photoSkippedGracePeriod: false,
      });
    }
  };

  const t = {
    s1Title: isRtl ? 'الاسم الكامل بالإنجليزية' : 'English Full Name',
    s1Subtitle: isRtl ? 'أدخل اسمك الرباعي الرسمي باللغة الإنجليزية' : 'Enter your official quadruple name in English',
    engPlaceholder: 'First Father Grandfather Family',
    collisionLabel: isRtl ? 'تطابق في الاسم الرباعي؟ تفعيل الاسم الخماسي' : 'Quadruple name collision? Enforce 5th name',
    collisionBadge: isRtl
      ? `${engWordCount}/5 أسماء (مطلوب اسم خامس لفض التشابه)`
      : `${engWordCount}/5 names entered (1 more name required to resolve duplicate)`,
    quadCompleteBadge: isRtl ? '4/4 تم اكتمال الاسم الرباعي' : '4/4 Quadruple name complete',
    remainingBadge: isRtl
      ? `تم إدخال ${engWordCount}/${requiredEngWords} أسماء (متبقي ${engRemaining})`
      : `${engWordCount}/${requiredEngWords} names entered (${engRemaining} remaining)`,
    checkingCollision: isRtl ? 'جاري فحص تشابه الأسماء...' : 'Checking database for name duplicates...',

    s2Title: isRtl ? 'الاسم الكامل بالعربية' : 'Arabic Full Name',
    s2Subtitle: isRtl
      ? `أدخل اسمك باللغة العربية مطابقاً لعدد أسماء الإنجليزية (${targetArWords} أسماء)`
      : `Enter your official Arabic name matching the English name count (${targetArWords} words)`,
    arPlaceholder: 'الاسم الأول الأب الجد العائلة',
    arBadge: isRtl
      ? `تم إدخال ${arWordCount}/${targetArWords} أسماء`
      : `${arWordCount}/${targetArWords} words entered`,

    s3Title: isRtl ? 'تاريخ الميلاد' : 'Date of Birth',
    s3Subtitle: isRtl ? 'حدد تاريخ ميلادك الرسمي' : 'Select your official date of birth',
    ageBadge: isRtl ? `العمر: ${currentAge} سنة` : `Age: ${currentAge} years old`,

    s4Title: isRtl ? 'النوع / الجنس' : 'Gender Selection',
    s4Subtitle: isRtl ? 'حدد النوع كما هو مدون في بطاقة الرقم القومي' : 'Select gender as registered in official records',
    male: isRtl ? 'ذكر' : 'Male',
    female: isRtl ? 'أنثى' : 'Female',

    s5Title: isRtl ? 'الرقم القومي (14 رقم)' : '14-Digit Egyptian National ID',
    s5Subtitle: isRtl ? 'أدخل الرقم القومي الخاص بك بدقة للتحقق التلقائي' : 'Enter your 14-digit Egyptian National ID for live verification',
    nidPlaceholder: '29901010101234',
    provincePrefix: isRtl ? '📍 محافظة الميلاد: ' : '📍 Province: ',

    s6Title: isRtl ? 'الصورة الشخصية' : 'Profile Photo',
    s6Subtitle: isRtl ? 'التقط صورة بالكاميرا أو قم برفع ملف من جهازك' : 'Take a photo with your camera or upload from device',
    cameraBtn: isRtl ? '📷 التقاط بالكاميرا' : '📷 Take Photo with Camera',
    uploadBtn: isRtl ? '📁 رفع من الجهاز' : '📁 Upload from Device',
    skipBtn: isRtl ? 'تخطي لمدة 3 أيام' : 'Skip for 3 days',
    skippedAlert: isRtl
      ? 'تم تفعيل مهلة 3 أيام للصورة الشخصية — يمكنك المتابعة الآن'
      : '3-day photo grace period active — you can proceed now',
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Sub-step 1.1: English Full Name */}
      {substep === 1 && (
        <div className="space-y-5">
          <div>
            <h3 className="text-lg font-bold tracking-tight text-[var(--foreground)]">
              <bdi>{t.s1Title}</bdi>
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              <bdi>{t.s1Subtitle}</bdi>
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                {isRtl ? 'الاسم بالإنجليزية' : 'English Name'}
              </span>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  engWordCount >= requiredEngWords
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                    : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
                }`}
              >
                <bdi>
                  {data.hasNameCollision
                    ? t.collisionBadge
                    : engWordCount >= requiredEngWords
                    ? t.quadCompleteBadge
                    : t.remainingBadge}
                </bdi>
              </span>
            </div>

            <input
              type="text"
              autoFocus
              value={data.englishName}
              onChange={(e) => handleEnglishChange(e.target.value)}
              onBlur={handleEnglishBlur}
              placeholder={t.engPlaceholder}
              className="w-full px-4 py-3.5 rounded-2xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-base placeholder:text-[var(--muted-foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:outline-none transition shadow-sm"
            />

            {checkingCollision && (
              <p className="text-xs text-blue-500 font-medium animate-pulse">
                <bdi>{t.checkingCollision}</bdi>
              </p>
            )}

            {data.englishName && !englishValidation.isValid && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium text-start">
                <bdi>{englishValidation.error}</bdi>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="collisionToggle"
                checked={data.hasNameCollision}
                onChange={(e) => onChange({ hasNameCollision: e.target.checked })}
                className="w-4 h-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)] cursor-pointer"
              />
              <label htmlFor="collisionToggle" className="text-xs text-[var(--muted-foreground)] cursor-pointer font-medium">
                <bdi>{t.collisionLabel}</bdi>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Sub-step 1.2: Arabic Full Name */}
      {substep === 2 && (
        <div className="space-y-5">
          <div>
            <h3 className="text-lg font-bold tracking-tight text-[var(--foreground)]">
              <bdi>{t.s2Title}</bdi>
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              <bdi>{t.s2Subtitle}</bdi>
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                {isRtl ? 'الاسم بالعربية' : 'Arabic Name'}
              </span>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  arabicValidation.isValid
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                    : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
                }`}
              >
                <bdi>{t.arBadge}</bdi>
              </span>
            </div>

            <input
              type="text"
              dir="rtl"
              autoFocus
              value={data.arabicName}
              onChange={(e) => onChange({ arabicName: e.target.value })}
              placeholder={t.arPlaceholder}
              className="w-full px-4 py-3.5 rounded-2xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-base placeholder:text-[var(--muted-foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:outline-none transition shadow-sm text-right"
            />

            {data.arabicName && !arabicValidation.isValid && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium text-start">
                <bdi>{arabicValidation.error}</bdi>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sub-step 1.3: Date of Birth */}
      {substep === 3 && (
        <div className="space-y-5">
          <div>
            <h3 className="text-lg font-bold tracking-tight text-[var(--foreground)]">
              <bdi>{t.s3Title}</bdi>
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              <bdi>{t.s3Subtitle}</bdi>
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                {isRtl ? 'تاريخ الميلاد' : 'Date of Birth'}
              </span>
              {currentAge !== null && (
                <span className="text-xs px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold">
                  <bdi>{t.ageBadge}</bdi>
                </span>
              )}
            </div>

            <input
              type="date"
              autoFocus
              value={data.dob}
              onChange={(e) => onChange({ dob: e.target.value })}
              className="w-full px-4 py-3.5 rounded-2xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-base focus:ring-2 focus:ring-[var(--primary)] focus:outline-none transition shadow-sm"
            />
          </div>
        </div>
      )}

      {/* Sub-step 1.4: Gender Selection */}
      {substep === 4 && (
        <div className="space-y-5">
          <div>
            <h3 className="text-lg font-bold tracking-tight text-[var(--foreground)]">
              <bdi>{t.s4Title}</bdi>
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              <bdi>{t.s4Subtitle}</bdi>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <button
              type="button"
              onClick={() => onChange({ gender: 'Male' })}
              className={`p-6 rounded-2xl border-2 text-center transition flex flex-col items-center justify-center gap-3 cursor-pointer ${
                data.gender === 'Male'
                  ? 'border-[var(--primary)] bg-[var(--muted)] text-[var(--foreground)] shadow-md ring-2 ring-[var(--primary)]'
                  : 'border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:border-[var(--foreground)]'
              }`}
            >
              <span className="text-4xl">👨</span>
              <span className="font-bold text-base"><bdi>{t.male}</bdi></span>
            </button>

            <button
              type="button"
              onClick={() => onChange({ gender: 'Female' })}
              className={`p-6 rounded-2xl border-2 text-center transition flex flex-col items-center justify-center gap-3 cursor-pointer ${
                data.gender === 'Female'
                  ? 'border-[var(--primary)] bg-[var(--muted)] text-[var(--foreground)] shadow-md ring-2 ring-[var(--primary)]'
                  : 'border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:border-[var(--foreground)]'
              }`}
            >
              <span className="text-4xl">👩</span>
              <span className="font-bold text-base"><bdi>{t.female}</bdi></span>
            </button>
          </div>
        </div>
      )}

      {/* Sub-step 1.5: 14-Digit Egyptian National ID */}
      {substep === 5 && (
        <div className="space-y-5">
          <div>
            <h3 className="text-lg font-bold tracking-tight text-[var(--foreground)]">
              <bdi>{t.s5Title}</bdi>
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              <bdi>{t.s5Subtitle}</bdi>
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                {isRtl ? 'الرقم القومي' : 'National ID'}
              </span>
              {nationalIdValidation.parsedData && (
                <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <bdi>
                    {t.provincePrefix}
                    {isRtl
                      ? nationalIdValidation.parsedData.provinceNameAr
                      : nationalIdValidation.parsedData.provinceNameEn}
                  </bdi>
                </span>
              )}
            </div>

            <input
              type="text"
              autoFocus
              maxLength={14}
              value={data.nationalId}
              onChange={(e) => onChange({ nationalId: e.target.value.replace(/\D/g, '') })}
              placeholder={t.nidPlaceholder}
              className="w-full px-4 py-3.5 rounded-2xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-lg font-mono tracking-widest placeholder:text-[var(--muted-foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:outline-none transition shadow-sm"
            />

            {data.nationalId && !nationalIdValidation.isValid && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-medium text-start space-y-1">
                <p className="font-bold">{isRtl ? 'خطأ في التحقق من الرقم القومي:' : 'National ID Verification Error:'}</p>
                <p><bdi>{nationalIdValidation.error}</bdi></p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sub-step 1.6: Profile Photo */}
      {substep === 6 && (
        <div className="space-y-5">
          <div>
            <h3 className="text-lg font-bold tracking-tight text-[var(--foreground)]">
              <bdi>{t.s6Title}</bdi>
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              <bdi>{t.s6Subtitle}</bdi>
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-[var(--border)] bg-[var(--card)] flex flex-col items-center text-center space-y-5">
            <div className="w-28 h-28 rounded-3xl bg-[var(--muted)] border-2 border-[var(--border)] overflow-hidden flex items-center justify-center shadow-inner">
              {data.avatarPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={data.avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-5xl text-[var(--muted-foreground)]">👤</span>
              )}
            </div>

            {data.photoSkippedGracePeriod && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-medium">
                <bdi>{t.skippedAlert}</bdi>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 w-full">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              <input ref={cameraInputRef} type="file" accept="image/*" capture="user" onChange={handlePhotoUpload} className="hidden" />

              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs font-semibold hover:bg-[var(--muted)] active:scale-95 transition cursor-pointer"
              >
                <bdi>{t.cameraBtn}</bdi>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs font-semibold hover:bg-[var(--muted)] active:scale-95 transition cursor-pointer"
              >
                <bdi>{t.uploadBtn}</bdi>
              </button>

              <button
                type="button"
                onClick={() =>
                  onChange({
                    photoSkippedGracePeriod: true,
                    avatarFile: null,
                    avatarPreview: null,
                  })
                }
                className="px-4 py-2.5 rounded-xl text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition cursor-pointer"
              >
                <bdi>{t.skipBtn}</bdi>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}