'use client';

import React, { useRef } from 'react';
import {
  autoCapitalizeEnglishName,
  countWords,
  validateEnglishName,
  validateArabicName,
} from '@/lib/validation/name-rules';
import { validateEgyptianNationalId } from '@/lib/validation/national-id';
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

interface Step1Props {
  data: Step1Data;
  onChange: (updated: Partial<Step1Data>) => void;
  isRtl: boolean;
}

export function Step1BasicInfo({ data, onChange, isRtl }: Step1Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const englishValidation = validateEnglishName(data.englishName, data.hasNameCollision);
  const engWordCount = countWords(data.englishName);
  const requiredEngWords = data.hasNameCollision ? 5 : 4;

  const arabicValidation = validateArabicName(
    data.arabicName,
    Math.max(requiredEngWords, engWordCount || requiredEngWords)
  );

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

  const nationalIdValidation = validateEgyptianNationalId(
    data.nationalId,
    data.dob || undefined,
    data.gender || undefined
  );

  const handleEnglishNameChange = (val: string) => {
    const formatted = autoCapitalizeEnglishName(val);
    onChange({ englishName: formatted });
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
    step1Title: isRtl ? 'المعلومات الأساسية' : 'Basic Information',
    step1Subtitle: isRtl
      ? 'بيانات الهوية الشخصية الموثقة للملف الدائم'
      : 'Verified identity attributes for your permanent profile',
    engNameLabel: isRtl ? 'الاسم الكامل بالإنجليزية' : 'English Full Name',
    engNamePlaceholder: 'First Father Grandfather Family',
    collisionToggle: isRtl ? 'تفعيل الاسم الخماسي (في حال تطابق الاسم الرباعي)' : 'Name collision? Add 5th name',
    arNameLabel: isRtl ? 'الاسم الكامل بالعربية' : 'Arabic Full Name',
    arNamePlaceholder: 'الاسم الأول الأب الجد العائلة',
    dobLabel: isRtl ? 'تاريخ الميلاد' : 'Date of Birth',
    agePrefix: isRtl ? 'العمر: ' : 'Age: ',
    yearsOld: isRtl ? 'سنة' : 'years old',
    genderLabel: isRtl ? 'النوع / الجنس' : 'Gender',
    male: isRtl ? 'ذكر' : 'Male',
    female: isRtl ? 'أنثى' : 'Female',
    nationalIdLabel: isRtl ? 'الرقم القومي (14 رقم)' : 'Egyptian National ID (14 Digits)',
    nationalIdPlaceholder: '29901010101234',
    provincePrefix: isRtl ? 'محافظة الميلاد: ' : 'Governorate: ',
    photoLabel: isRtl ? 'الصورة الشخصية' : 'Profile Photo',
    photoSubtitle: isRtl ? 'التقاط عبر الكاميرا أو رفع ملف' : 'Capture with camera or upload image',
    takePhoto: isRtl ? 'الكاميرا' : 'Camera',
    uploadPhoto: isRtl ? 'رفع ملف' : 'Upload',
    skipPhoto: isRtl ? 'تخطي لمدة 3 أيام' : 'Skip for 3 days',
    skippedBadge: isRtl ? 'تم تفعيل مهلة 3 أيام للصورة' : '3-Day Photo Grace Period Active',
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="border-b border-[var(--border)] pb-4">
        <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)]">
          <bdi>{t.step1Title}</bdi>
        </h2>
        <p className="text-xs text-[var(--muted-foreground)] mt-1">
          <bdi>{t.step1Subtitle}</bdi>
        </p>
      </div>

      {/* 1. English Full Name */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            <bdi>{t.engNameLabel}</bdi> <span className="text-red-500">*</span>
          </label>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-mono font-medium ${
              engWordCount >= requiredEngWords
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
            }`}
          >
            {engWordCount}/{requiredEngWords} words
          </span>
        </div>
        <input
          type="text"
          value={data.englishName}
          onChange={(e) => handleEnglishNameChange(e.target.value)}
          placeholder={t.engNamePlaceholder}
          className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm placeholder:text-[var(--muted-foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:outline-none transition"
        />
        {data.englishName && !englishValidation.isValid && (
          <p className="text-xs text-red-500 font-medium mt-1 text-start">
            <bdi>{englishValidation.error}</bdi>
          </p>
        )}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="collisionCheck"
            checked={data.hasNameCollision}
            onChange={(e) => onChange({ hasNameCollision: e.target.checked })}
            className="rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)] cursor-pointer"
          />
          <label htmlFor="collisionCheck" className="text-xs text-[var(--muted-foreground)] cursor-pointer">
            <bdi>{t.collisionToggle}</bdi>
          </label>
        </div>
      </div>

      {/* 2. Arabic Full Name */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            <bdi>{t.arNameLabel}</bdi> <span className="text-red-500">*</span>
          </label>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-mono font-medium ${
              arabicValidation.isValid
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
            }`}
          >
            {countWords(data.arabicName)}/{Math.max(requiredEngWords, engWordCount || requiredEngWords)} words
          </span>
        </div>
        <input
          type="text"
          dir="rtl"
          value={data.arabicName}
          onChange={(e) => onChange({ arabicName: e.target.value })}
          placeholder={t.arNamePlaceholder}
          className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm placeholder:text-[var(--muted-foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:outline-none transition text-right"
        />
        {data.arabicName && !arabicValidation.isValid && (
          <p className="text-xs text-red-500 font-medium mt-1 text-start">
            <bdi>{arabicValidation.error}</bdi>
          </p>
        )}
      </div>

      {/* 3. Date of Birth */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            <bdi>{t.dobLabel}</bdi> <span className="text-red-500">*</span>
          </label>
          {currentAge !== null && (
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium">
              <bdi>
                {t.agePrefix}
                {currentAge} {t.yearsOld}
              </bdi>
            </span>
          )}
        </div>
        <input
          type="date"
          value={data.dob}
          onChange={(e) => onChange({ dob: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:ring-2 focus:ring-[var(--primary)] focus:outline-none transition"
        />
      </div>

      {/* 4. Gender Selection */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] block">
          <bdi>{t.genderLabel}</bdi> <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => onChange({ gender: 'Male' })}
            className={`py-3 px-4 rounded-xl border text-sm font-medium transition flex items-center justify-center gap-3 cursor-pointer ${
              data.gender === 'Male'
                ? 'border-[var(--primary)] bg-[var(--muted)] text-[var(--foreground)] ring-2 ring-[var(--primary)]'
                : 'border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:border-[var(--foreground)]'
            }`}
          >
            <span className="text-lg">👨</span>
            <bdi>{t.male}</bdi>
          </button>
          <button
            type="button"
            onClick={() => onChange({ gender: 'Female' })}
            className={`py-3 px-4 rounded-xl border text-sm font-medium transition flex items-center justify-center gap-3 cursor-pointer ${
              data.gender === 'Female'
                ? 'border-[var(--primary)] bg-[var(--muted)] text-[var(--foreground)] ring-2 ring-[var(--primary)]'
                : 'border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:border-[var(--foreground)]'
            }`}
          >
            <span className="text-lg">👩</span>
            <bdi>{t.female}</bdi>
          </button>
        </div>
      </div>

      {/* 5. National ID (14 Digits) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            <bdi>{t.nationalIdLabel}</bdi> <span className="text-red-500">*</span>
          </label>
          {nationalIdValidation.parsedData && (
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
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
          maxLength={14}
          value={data.nationalId}
          onChange={(e) => onChange({ nationalId: e.target.value.replace(/\D/g, '') })}
          placeholder={t.nationalIdPlaceholder}
          className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm font-mono tracking-wider placeholder:text-[var(--muted-foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:outline-none transition"
        />
        {data.nationalId && !nationalIdValidation.isValid && (
          <p className="text-xs text-red-500 font-medium mt-1 text-start">
            <bdi>{nationalIdValidation.error}</bdi>
          </p>
        )}
      </div>

      {/* 6. Profile Photo */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            <bdi>{t.photoLabel}</bdi>
          </label>
          {data.photoSkippedGracePeriod && (
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium">
              <bdi>{t.skippedBadge}</bdi>
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
          <div className="w-20 h-20 rounded-2xl bg-[var(--muted)] border border-[var(--border)] overflow-hidden flex items-center justify-center shrink-0">
            {data.avatarPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl text-[var(--muted-foreground)]">📷</span>
            )}
          </div>

          <div className="flex-1 space-y-2 w-full text-center sm:text-start">
            <p className="text-xs text-[var(--muted-foreground)]">
              <bdi>{t.photoSubtitle}</bdi>
            </p>
            <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="user"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="px-3.5 py-1.5 rounded-xl border border-[var(--border)] text-xs font-semibold bg-[var(--background)] hover:bg-[var(--muted)] transition cursor-pointer"
              >
                <bdi>{t.takePhoto}</bdi>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-1.5 rounded-xl border border-[var(--border)] text-xs font-semibold bg-[var(--background)] hover:bg-[var(--muted)] transition cursor-pointer"
              >
                <bdi>{t.uploadPhoto}</bdi>
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
                className="px-3 py-1.5 rounded-xl text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition cursor-pointer"
              >
                <bdi>{t.skipPhoto}</bdi>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}