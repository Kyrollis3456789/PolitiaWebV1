'use client';

import React, { useState } from 'react';
import { Link } from '@/i18n/routing';
import { useLocale } from 'next-intl';
import { isRtlLocale } from '@/i18n/locales';
import { Step1BasicInfo, Step1Data } from './steps/Step1BasicInfo';
import { Step2ContactSocial, Step2Data } from './steps/Step2ContactSocial';
import { validateEnglishName, validateArabicName } from '@/lib/validation/name-rules';
import { validateEgyptianNationalId } from '@/lib/validation/national-id';

export function CreateAccountWizard() {
  const locale = useLocale();
  const isRtl = isRtlLocale(locale);

  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  // Step 1 State
  const [step1Data, setStep1Data] = useState<Step1Data>({
    englishName: '',
    hasNameCollision: false,
    arabicName: '',
    dob: '',
    gender: null,
    nationalId: '',
    avatarFile: null,
    avatarPreview: null,
    photoSkippedGracePeriod: false,
  });

  // Step 2 State
  const [step2Data, setStep2Data] = useState<Step2Data>({
    phones: [{ number: '', isPrimary: true }],
    emails: [],
    landline: '',
    socials: {
      facebook: '',
      instagram: '',
      tiktok: '',
      snapchat: '',
      threads: '',
      x: '',
      github: '',
      linkedin: '',
    },
  });

  // Validation Checks for Progression
  const isStep1Valid = (): boolean => {
    const engValid = validateEnglishName(step1Data.englishName, step1Data.hasNameCollision).isValid;
    const arValid = validateArabicName(
      step1Data.arabicName,
      step1Data.hasNameCollision ? 5 : 4
    ).isValid;
    const dobValid = !!step1Data.dob;
    const genderValid = step1Data.gender !== null;
    const nationalIdValid = validateEgyptianNationalId(
      step1Data.nationalId,
      step1Data.dob || undefined,
      step1Data.gender || undefined
    ).isValid;

    return engValid && arValid && dobValid && genderValid && nationalIdValid;
  };

  const isStep2Valid = (): boolean => {
    const hasPrimaryPhone = step2Data.phones.some((p) => p.number.trim().length >= 8);
    return hasPrimaryPhone;
  };

  const handleNext = () => {
    if (currentStep === 1 && isStep1Valid()) {
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleComplete = async () => {
    if (!isStep2Valid()) return;
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmissionSuccess(true);
    }, 1000);
  };

  const t = {
    wizardHeader: isRtl ? 'Ø¥Ù†Ø´Ø§Ø¡ Ø­Ø³Ø§Ø¨ Ø¬Ø¯ÙŠØ¯' : 'Create Your PolitiaApp Account',
    step1Tab: isRtl ? '1. Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø£Ø³Ø§Ø³ÙŠØ©' : '1. Basic Information',
    step2Tab: isRtl ? '2. Ø§Ù„Ø§ØªØµØ§Ù„ ÙˆØ§Ù„ØªÙˆØ§ØµÙ„' : '2. Contact & Social',
    nextBtn: isRtl ? 'Ø§Ù„Ù…ØªØ§Ø¨Ø¹Ø© Ø¥Ù„Ù‰ Ø§Ù„Ø®Ø·ÙˆØ© Ø§Ù„ØªØ§Ù„ÙŠØ© â†' : 'Next Step â†’',
    backBtn: isRtl ? 'â†’ Ø§Ù„Ø±Ø¬ÙˆØ¹' : 'â† Back',
    completeBtn: isRtl ? 'Ø¥ØªÙ…Ø§Ù… Ø§Ù„ØªØ³Ø¬ÙŠÙ„ ÙˆØªØ£ÙƒÙŠØ¯ Ø§Ù„Ø­Ø³Ø§Ø¨' : 'Complete Registration',
    alreadyHaveAccount: isRtl ? 'Ù„Ø¯ÙŠÙƒ Ø­Ø³Ø§Ø¨ Ø¨Ø§Ù„ÙØ¹Ù„ØŸ' : 'Already have an account?',
    signInLink: isRtl ? 'ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„' : 'Sign In',
    successTitle: isRtl ? 'ØªÙ… Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø¨Ù†Ø¬Ø§Ø­!' : 'Profile Data Verified Successfully!',
    successSubtitle: isRtl
      ? 'ØªÙ… Ø­ÙØ¸ ÙˆÙ…Ø·Ø§Ø¨Ù‚Ø© Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø£Ø³Ø§Ø³ÙŠØ© ÙˆØ¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø§ØªØµØ§Ù„ ÙˆØ¬Ø§Ù‡Ø²Ø© Ù„Ù„Ø±Ø¨Ø· Ù…Ø¹ Ù†Ø¸Ø§Ù… Ø§Ù„Ø£Ù…Ø§Ù† ÙˆØ§Ù„Ù…ØµØ§Ø¯Ù‚Ø©.'
      : 'Your basic identity and contact attributes have been validated and staged.',
    proceedToLogin: isRtl ? 'Ø§Ù„Ø§Ù†ØªÙ‚Ø§Ù„ Ù„ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„' : 'Proceed to Sign In',
  };

  if (submissionSuccess) {
    return (
      <div className="w-full max-w-xl mx-auto p-8 rounded-3xl border border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)] shadow-xl text-center space-y-6 animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-3xl mx-auto shadow-sm">
          âœ“
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">
            <bdi>{t.successTitle}</bdi>
          </h2>
          <p className="text-sm text-[var(--muted-foreground)] max-w-md mx-auto leading-relaxed">
            <bdi>{t.successSubtitle}</bdi>
          </p>
        </div>
        <div className="pt-4 border-t border-[var(--border)]">
          <Link
            href="/login"
            className="inline-flex items-center justify-center py-3 px-6 rounded-xl text-sm font-medium bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 active:scale-95 transition shadow cursor-pointer"
          >
            <bdi>{t.proceedToLogin}</bdi>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6 sm:p-10 rounded-3xl border border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)] shadow-2xl transition-all">
      {/* Wizard Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[var(--primary)] text-[var(--primary-foreground)] mb-3 font-bold text-xl shadow-md">
          P
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          <bdi>{t.wizardHeader}</bdi>
        </h1>
      </div>

      {/* Progress Tabs */}
      <div className="grid grid-cols-2 gap-2 mb-8 p-1.5 rounded-2xl bg-[var(--muted)] border border-[var(--border)]">
        <button
          type="button"
          onClick={() => setCurrentStep(1)}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            currentStep === 1
              ? 'bg-[var(--card)] text-[var(--foreground)] shadow-sm'
              : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
          }`}
        >
          <bdi>{t.step1Tab}</bdi>
        </button>
        <button
          type="button"
          onClick={() => isStep1Valid() && setCurrentStep(2)}
          disabled={!isStep1Valid()}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed ${
            currentStep === 2
              ? 'bg-[var(--card)] text-[var(--foreground)] shadow-sm'
              : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer'
          }`}
        >
          <bdi>{t.step2Tab}</bdi>
        </button>
      </div>

      {/* Step Content */}
      <div className="mb-10">
        {currentStep === 1 ? (
          <Step1BasicInfo
            data={step1Data}
            onChange={(updated) => setStep1Data((prev) => ({ ...prev, ...updated }))}
            isRtl={isRtl}
          />
        ) : (
          <Step2ContactSocial
            data={step2Data}
            onChange={(updated) => setStep2Data((prev) => ({ ...prev, ...updated }))}
            isRtl={isRtl}
          />
        )}
      </div>

      {/* Wizard Footer Controls */}
      <div className="flex items-center justify-between pt-6 border-t border-[var(--border)]">
        {currentStep === 2 ? (
          <button
            type="button"
            onClick={handleBack}
            className="py-3 px-5 rounded-xl text-sm font-semibold border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--muted)] active:scale-95 transition cursor-pointer"
          >
            <bdi>{t.backBtn}</bdi>
          </button>
        ) : (
          <div />
        )}

        {currentStep === 1 ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={!isStep1Valid()}
            className="py-3 px-6 rounded-xl text-sm font-semibold bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 active:scale-95 transition shadow disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <bdi>{t.nextBtn}</bdi>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleComplete}
            disabled={!isStep2Valid() || isSubmitting}
            className="py-3 px-6 rounded-xl text-sm font-semibold bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 active:scale-95 transition shadow disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <span>...</span>
            ) : (
              <bdi>{t.completeBtn}</bdi>
            )}
          </button>
        )}
      </div>

      {/* Already have account prompt */}
      <div className="mt-8 text-center text-xs text-[var(--muted-foreground)]">
        <span><bdi>{t.alreadyHaveAccount}</bdi> </span>
        <Link href="/login" className="font-semibold text-[var(--foreground)] hover:underline">
          <bdi>{t.signInLink}</bdi>
        </Link>
      </div>
    </div>
  );
}