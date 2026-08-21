'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Loader2, ChevronDown, Smartphone, CheckCircle2 } from 'lucide-react';
import { useRouter, Link } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import { isRtlLocale, SUPPORTED_LOCALES, getLocaleDisplayName } from '@/i18n/locales';
import { createClient } from '@/lib/supabase/client';
import {
  checkUserAccountExists,
  sendRecoveryEmailOtp,
  verifyRecoveryEmailOtp,
} from '@/app/actions/auth-check';

/**
 * Ensures only English alphabet letters and spaces are typed,
 * with the first letter of each name automatically capitalized.
 */
function formatEnglishFullName(input: string): string {
  const englishOnly = input.replace(/[^a-zA-Z\s]/g, '');
  const parts = englishOnly.split(' ');
  return parts
    .map((word) => {
      if (!word) return '';
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

export function ForgotScreen() {
  const router = useRouter();
  const locale = useLocale();
  const isRtl = isRtlLocale(locale);
  const t = useTranslations('forgot');

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Step 1 State: Identifier (Phone number or email)
  const [identifier, setIdentifier] = useState('');
  const [resolvedEmail, setResolvedEmail] = useState('');
  const [isIdentifierFocused, setIsIdentifierFocused] = useState(false);

  // Step 2 State: Full Name (Single English 4-part name text box)
  const [fullName, setFullName] = useState('');
  const [isFullNameFocused, setIsFullNameFocused] = useState(false);

  // Step 4 State: 6-digit OTP Code
  const [otpCode, setOtpCode] = useState('');
  const [isOtpFocused, setIsOtpFocused] = useState(false);

  // Step 5 State: Reset Password
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isNewPasswordFocused, setIsNewPasswordFocused] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [langSearch, setLangSearch] = useState('');

  // Auto-read ?email= query param if present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const emailParam = params.get('email');
      if (emailParam) {
        setIdentifier(emailParam);
        setResolvedEmail(emailParam);
        setStep(2);
      }
    }
  }, []);

  // Floating label calculations
  const isIdentifierFloating = isIdentifierFocused || identifier.length > 0 || Boolean(errorMessage && step === 1);
  const isFullNameFloating = isFullNameFocused || fullName.length > 0 || Boolean(errorMessage && step === 2);
  const isOtpFloating = isOtpFocused || otpCode.length > 0 || Boolean(errorMessage && step === 4);
  const isNewPasswordFloating = isNewPasswordFocused || newPassword.length > 0 || Boolean(errorMessage && step === 5);
  const isConfirmPasswordFloating = isConfirmPasswordFocused || confirmPassword.length > 0 || Boolean(errorMessage && step === 5);

  const targetEmail = resolvedEmail || (identifier.includes('@') ? identifier.trim() : '');

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmed = identifier.trim();
    if (!trimmed) {
      setErrorMessage(t('emptyIdentifierError'));
      return;
    }

    setLoading(true);

    try {
      const result = await checkUserAccountExists(trimmed);

      if (!result.exists) {
        setErrorMessage(t('accountNotFoundError'));
        return;
      }

      if (result.resolvedEmail) {
        setResolvedEmail(result.resolvedEmail);
      }

      setStep(2);
    } catch {
      setErrorMessage(t('genericError'));
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedName = fullName.trim();
    if (!trimmedName) {
      setErrorMessage(t('enterFullNameError'));
      return;
    }

    const nameParts = trimmedName.split(/\s+/).filter(Boolean);
    if (nameParts.length < 4) {
      setErrorMessage(t('fourNamesRequiredError'));
      return;
    }

    setLoading(true);

    try {
      const nameResult = await checkUserAccountExists(trimmedName);

      if (!nameResult.exists) {
        const idCheck = await checkUserAccountExists(identifier.trim());
        if (!idCheck.exists) {
          setErrorMessage(t('accountNotFoundError'));
          return;
        }
        if (idCheck.resolvedEmail) {
          setResolvedEmail(idCheck.resolvedEmail);
        }
      } else if (nameResult.resolvedEmail) {
        setResolvedEmail(nameResult.resolvedEmail);
      }

      setStep(3);
    } catch {
      setErrorMessage(t('genericError'));
    } finally {
      setLoading(false);
    }
  };

  const handleStep3SendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const emailToSend = targetEmail || identifier.trim();
    if (!emailToSend) {
      setErrorMessage(t('accountNotFoundError'));
      return;
    }

    setLoading(true);

    try {
      const result = await sendRecoveryEmailOtp(emailToSend);

      if (!result.success) {
        setErrorMessage(result.error || t('genericError'));
        return;
      }

      setSuccessMessage(t('otpSentSuccess'));
      setStep(4);
    } catch {
      setErrorMessage(t('genericError'));
    } finally {
      setLoading(false);
    }
  };

  const handleStep4VerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanCode = otpCode.trim();
    if (!cleanCode) {
      setErrorMessage(t('invalidCodeError'));
      return;
    }

    const emailToVerify = targetEmail || identifier.trim();
    setLoading(true);

    try {
      const result = await verifyRecoveryEmailOtp(emailToVerify, cleanCode);

      if (!result.success) {
        setErrorMessage(result.error || t('invalidCodeError'));
        return;
      }

      // OTP Verified successfully! Transition to Step 5: Reset Password
      setSuccessMessage(null);
      setStep(5);
    } catch {
      setErrorMessage(t('genericError'));
    } finally {
      setLoading(false);
    }
  };

  const handleStep5ResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (newPassword.length < 6) {
      setErrorMessage(t('passwordLengthError'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage(t('passwordMismatchError'));
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setSuccessMessage(t('passwordResetSuccess'));
      setTimeout(() => {
        router.push('/login');
        router.refresh();
      }, 1500);
    } catch {
      setErrorMessage(t('genericError'));
    } finally {
      setLoading(false);
    }
  };

  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatEnglishFullName(e.target.value);
    setFullName(formatted);
    if (errorMessage) setErrorMessage(null);
    if (successMessage) setSuccessMessage(null);
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericOnly = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
    setOtpCode(numericOnly);
    if (errorMessage) setErrorMessage(null);
  };

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
    router.replace('/forgot', { locale: newLocale });
  };

  const renderLeftTitle = () => {
    if (step === 1) {
      return (
        <>
          <h1 className="text-[34px] sm:text-[38px] font-normal text-[#1F1F1F] dark:text-[#E3E3E3] tracking-tight leading-[1.15]">
            <bdi>{t('findYourAccount')}</bdi>
          </h1>
          <p className="text-[16px] text-[#1F1F1F] dark:text-[#C4C7C5] font-normal leading-relaxed">
            <bdi>{t('findYourAccountSubtitle')}</bdi>
          </p>
        </>
      );
    }
    if (step === 2) {
      return (
        <>
          <h1 className="text-[34px] sm:text-[38px] font-normal text-[#1F1F1F] dark:text-[#E3E3E3] tracking-tight leading-[1.15]">
            <bdi>{t('whatsYourName')}</bdi>
          </h1>
          <p className="text-[16px] text-[#1F1F1F] dark:text-[#C4C7C5] font-normal leading-relaxed">
            <bdi>{t('enterNameSubtitle')}</bdi>
          </p>
        </>
      );
    }
    if (step === 3) {
      return (
        <>
          <h1 className="text-[34px] sm:text-[38px] font-normal text-[#1F1F1F] dark:text-[#E3E3E3] tracking-tight leading-[1.15]">
            <bdi>{t('getVerificationCode')}</bdi>
          </h1>
          <p className="text-[16px] text-[#1F1F1F] dark:text-[#C4C7C5] font-normal leading-relaxed">
            <bdi>{t('keepAccountSafeSubtitle')}</bdi>
          </p>
        </>
      );
    }
    if (step === 4) {
      return (
        <>
          <h1 className="text-[34px] sm:text-[38px] font-normal text-[#1F1F1F] dark:text-[#E3E3E3] tracking-tight leading-[1.15]">
            <bdi>{t('enterCode')}</bdi>
          </h1>
          <p className="text-[16px] text-[#1F1F1F] dark:text-[#C4C7C5] font-normal leading-relaxed">
            <bdi>{t('enterCodeSubtitle', { identifier: targetEmail || identifier })}</bdi>
          </p>
        </>
      );
    }
    return (
      <>
        <h1 className="text-[34px] sm:text-[38px] font-normal text-[#1F1F1F] dark:text-[#E3E3E3] tracking-tight leading-[1.15]">
          <bdi>{t('resetPassword')}</bdi>
        </h1>
        <p className="text-[16px] text-[#1F1F1F] dark:text-[#C4C7C5] font-normal leading-relaxed">
          <bdi>{t('resetPasswordSubtitle')}</bdi>
        </p>
      </>
    );
  };

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="relative w-full min-h-screen shared-bg flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 transition-colors duration-300 overflow-x-hidden"
    >
      {/* Main Authentication Card */}
      <div className="relative z-20 w-full max-w-[1040px] bg-white/95 dark:bg-[#1B212D]/95 rounded-[28px] sm:rounded-[36px] p-6 sm:p-8 md:p-12 shadow-2xl border border-white/60 dark:border-slate-800/80 flex flex-col md:flex-row gap-8 md:gap-14 min-h-fit h-auto items-start transition-all duration-300 ease-in-out">
        {/* Left Column: Branding & Title */}
        <div className="w-full md:w-1/2 flex flex-col justify-start items-start text-start min-h-auto md:min-h-[320px]">
          <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800/90 p-2 shadow-sm border border-slate-200/60 dark:border-slate-700/80 flex items-center justify-center transition-all">
            <Image
              src="/logo.webp"
              alt="Politia logo"
              width={48}
              height={48}
              priority
              style={{ width: 'auto', height: 'auto' }}
              className="object-contain w-full h-full"
            />
          </div>

          <div className="mt-6 space-y-2">
            {renderLeftTitle()}
          </div>
        </div>

        {/* Right Column: Step Forms */}
        <div className="w-full md:w-1/2 flex flex-col justify-between min-h-auto md:min-h-[320px] overflow-hidden transition-all duration-300 ease-in-out">
          {step === 1 ? (
            /* STEP 1: Phone number or email */
            <form onSubmit={handleStep1Submit} className="w-full flex-1 flex flex-col justify-between">
              <div className="my-auto space-y-4 w-full">
                <div className="relative">
                  <input
                    id="recovery-input"
                    type="text"
                    autoFocus
                    value={identifier}
                    onFocus={() => setIsIdentifierFocused(true)}
                    onBlur={() => setIsIdentifierFocused(false)}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    className={`w-full h-[56px] px-4 text-[16px] text-[#1F1F1F] dark:text-[#E3E3E3] bg-transparent rounded-[4px] focus:outline-none transition-all box-border ${
                      errorMessage
                        ? 'border-2 border-[#B3261E] dark:border-[#F2B8B5]'
                        : isIdentifierFocused
                        ? 'border-2 border-[#0B57D0] dark:border-[#A8C7FA]'
                        : 'border border-[#747775] dark:border-[#8E918F] hover:border-[#1F1F1F] dark:hover:border-white'
                    }`}
                  />
                  <label
                    htmlFor="recovery-input"
                    className={`absolute pointer-events-none transition-all duration-150 start-3 ${
                      isIdentifierFloating
                        ? '-top-2.5 px-1 text-xs bg-white dark:bg-[#1B212D]'
                        : 'top-4 text-[16px]'
                    } ${
                      errorMessage
                        ? 'text-[#B3261E] dark:text-[#F2B8B5]'
                        : isIdentifierFocused
                        ? 'text-[#0B57D0] dark:text-[#A8C7FA]'
                        : 'text-[#444746] dark:text-[#8E918F]'
                    }`}
                  >
                    <bdi>{t('identifierLabel')}</bdi>
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
              </div>

              <div className="flex justify-between md:justify-end items-center gap-4 pt-6 mt-auto">
                <Link
                  href="/login"
                  className="text-sm font-medium text-[#0B57D0] dark:text-[#A8C7FA] hover:bg-[#F2F6FC] dark:hover:bg-[#1E2738] px-4 py-2 rounded-full transition-colors cursor-pointer"
                >
                  <bdi>{t('backToSignIn')}</bdi>
                </Link>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#0B57D0] hover:bg-[#0842A0] active:bg-[#06337E] text-white text-sm font-medium px-6 py-2.5 rounded-full transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 min-w-[80px]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span><bdi>{t('next')}</bdi></span>
                    </>
                  ) : (
                    <bdi>{t('next')}</bdi>
                  )}
                </button>
              </div>
            </form>
          ) : step === 2 ? (
            /* STEP 2: What's your name? (Single English 4-part name input, vertically centered) */
            <form onSubmit={handleStep2Submit} className="w-full flex-1 flex flex-col justify-between">
              <div className="my-auto space-y-4 w-full">
                <div className="relative">
                  <input
                    id="full-name-input"
                    type="text"
                    lang="en"
                    dir="ltr"
                    autoFocus
                    value={fullName}
                    onFocus={() => setIsFullNameFocused(true)}
                    onBlur={() => setIsFullNameFocused(false)}
                    onChange={handleFullNameChange}
                    className={`w-full h-[56px] px-4 text-[16px] text-[#1F1F1F] dark:text-[#E3E3E3] bg-transparent rounded-[4px] focus:outline-none transition-all box-border ${
                      errorMessage
                        ? 'border-2 border-[#B3261E] dark:border-[#F2B8B5]'
                        : isFullNameFocused
                        ? 'border-2 border-[#0B57D0] dark:border-[#A8C7FA]'
                        : 'border border-[#747775] dark:border-[#8E918F] hover:border-[#1F1F1F] dark:hover:border-white'
                    }`}
                  />
                  <label
                    htmlFor="full-name-input"
                    className={`absolute pointer-events-none transition-all duration-150 start-3 ${
                      isFullNameFloating
                        ? '-top-2.5 px-1 text-xs bg-white dark:bg-[#1B212D]'
                        : 'top-4 text-[16px]'
                    } ${
                      errorMessage
                        ? 'text-[#B3261E] dark:text-[#F2B8B5]'
                        : isFullNameFocused
                        ? 'text-[#0B57D0] dark:text-[#A8C7FA]'
                        : 'text-[#444746] dark:text-[#8E918F]'
                    }`}
                  >
                    <bdi>{t('fullName')}</bdi>
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
              </div>

              <div className="flex justify-between md:justify-end items-center gap-4 pt-6 mt-auto">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setErrorMessage(null);
                  }}
                  className="text-sm font-medium text-[#0B57D0] dark:text-[#A8C7FA] hover:bg-[#F2F6FC] dark:hover:bg-[#1E2738] px-4 py-2 rounded-full transition-colors cursor-pointer"
                >
                  <bdi>{t('back')}</bdi>
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#0B57D0] hover:bg-[#0842A0] active:bg-[#06337E] text-white text-sm font-medium px-6 py-2.5 rounded-full transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 min-w-[80px]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span><bdi>{t('next')}</bdi></span>
                    </>
                  ) : (
                    <bdi>{t('next')}</bdi>
                  )}
                </button>
              </div>
            </form>
          ) : step === 3 ? (
            /* STEP 3: Get a verification code (Device illustration & Send to Email) */
            <form onSubmit={handleStep3SendOtp} className="w-full flex-1 flex flex-col justify-between">
              <div className="my-auto space-y-4 w-full">
                {/* Phone Graphic Backdrop */}
                <div className="w-full h-40 sm:h-44 rounded-2xl bg-gradient-to-b from-[#EAEFF7] to-[#DFE7F2] dark:from-[#1E2532] dark:to-[#161C26] flex items-end justify-center overflow-hidden relative shadow-inner">
                  <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/5 to-transparent dark:from-white/5 pointer-events-none" />

                  {/* Styled Phone Mockup */}
                  <div className="w-24 sm:w-28 h-32 sm:h-36 bg-[#1F1F1F] dark:bg-[#0A0D14] rounded-t-[20px] p-2 border-[3px] border-b-0 border-[#2D3139] dark:border-[#38404E] shadow-2xl relative flex flex-col items-center">
                    <div className="w-8 h-1 bg-[#3E4552] rounded-full mb-1.5 shrink-0" />
                    <div className="w-full flex-1 bg-white dark:bg-[#121620] rounded-t-md flex flex-col items-center justify-center p-2 text-center">
                      <div className="w-8 h-8 rounded-full bg-[#E8F0FE] dark:bg-[#1E293B] flex items-center justify-center mb-1">
                        <Smartphone className="w-4 h-4 text-[#0B57D0] dark:text-[#A8C7FA]" />
                      </div>
                      <div className="w-10 h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full mb-1" />
                      <div className="w-6 h-1 bg-gray-100 dark:bg-slate-800 rounded-full" />
                    </div>
                  </div>
                </div>

                {/* Text Info */}
                <div className="space-y-1.5 text-start">
                  <h2 className="text-[17px] sm:text-[18px] font-medium text-[#1F1F1F] dark:text-[#E3E3E3]">
                    <bdi>{t('getVerificationCode')}</bdi>
                  </h2>
                  <p className="text-sm text-[#444746] dark:text-[#C4C7C5] leading-relaxed">
                    <bdi>
                      {t('sendCodeDescription', { identifier: targetEmail || identifier })}
                    </bdi>
                  </p>
                </div>

                {errorMessage && (
                  <div className="flex items-center gap-2 text-xs text-[#B3261E] dark:text-[#F2B8B5]">
                    <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#B3261E] dark:bg-[#F2B8B5] text-white dark:text-[#601410] text-[11px] font-bold select-none leading-none pb-[1px]">
                      !
                    </span>
                    <bdi>{errorMessage}</bdi>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between md:justify-end items-center gap-4 pt-6 mt-auto">
                <button
                  type="button"
                  onClick={() => {
                    setStep(2);
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="text-sm font-medium text-[#0B57D0] dark:text-[#A8C7FA] hover:bg-[#F2F6FC] dark:hover:bg-[#1E2738] px-4 py-2 rounded-full transition-colors cursor-pointer"
                >
                  <bdi>{t('back')}</bdi>
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#0B57D0] hover:bg-[#0842A0] active:bg-[#06337E] text-white text-sm font-medium px-7 py-2.5 rounded-full transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 min-w-[90px]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span><bdi>{t('send')}</bdi></span>
                    </>
                  ) : (
                    <bdi>{t('send')}</bdi>
                  )}
                </button>
              </div>
            </form>
          ) : step === 4 ? (
            /* STEP 4: Enter 6-digit OTP Code sent to email */
            <form onSubmit={handleStep4VerifyOtp} className="w-full flex-1 flex flex-col justify-between">
              <div className="my-auto space-y-4 w-full">
                <div className="relative">
                  <input
                    id="otp-input"
                    type="text"
                    inputMode="numeric"
                    autoFocus
                    maxLength={6}
                    value={otpCode}
                    onFocus={() => setIsOtpFocused(true)}
                    onBlur={() => setIsOtpFocused(false)}
                    onChange={handleOtpChange}
                    className={`w-full h-[56px] px-4 text-[20px] font-mono tracking-widest text-[#1F1F1F] dark:text-[#E3E3E3] bg-transparent rounded-[4px] focus:outline-none transition-all box-border ${
                      errorMessage
                        ? 'border-2 border-[#B3261E] dark:border-[#F2B8B5]'
                        : isOtpFocused
                        ? 'border-2 border-[#0B57D0] dark:border-[#A8C7FA]'
                        : 'border border-[#747775] dark:border-[#8E918F] hover:border-[#1F1F1F] dark:hover:border-white'
                    }`}
                  />
                  <label
                    htmlFor="otp-input"
                    className={`absolute pointer-events-none transition-all duration-150 start-3 ${
                      isOtpFloating
                        ? '-top-2.5 px-1 text-xs bg-white dark:bg-[#1B212D]'
                        : 'top-4 text-[16px]'
                    } ${
                      errorMessage
                        ? 'text-[#B3261E] dark:text-[#F2B8B5]'
                        : isOtpFocused
                        ? 'text-[#0B57D0] dark:text-[#A8C7FA]'
                        : 'text-[#444746] dark:text-[#8E918F]'
                    }`}
                  >
                    <bdi>{t('enterCodeLabel')}</bdi>
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

                {successMessage && !errorMessage && (
                  <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 mt-1.5">
                    <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white text-[11px] font-bold select-none leading-none pb-[1px]">
                      ✓
                    </span>
                    <bdi>{successMessage}</bdi>
                  </div>
                )}
              </div>

              <div className="flex justify-between md:justify-end items-center gap-4 pt-6 mt-auto">
                <button
                  type="button"
                  onClick={() => {
                    setStep(3);
                    setErrorMessage(null);
                  }}
                  className="text-sm font-medium text-[#0B57D0] dark:text-[#A8C7FA] hover:bg-[#F2F6FC] dark:hover:bg-[#1E2738] px-4 py-2 rounded-full transition-colors cursor-pointer"
                >
                  <bdi>{t('back')}</bdi>
                </button>

                <button
                  type="submit"
                  disabled={loading || otpCode.length < 6}
                  className="bg-[#0B57D0] hover:bg-[#0842A0] active:bg-[#06337E] text-white text-sm font-medium px-7 py-2.5 rounded-full transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 min-w-[90px]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span><bdi>{t('verify')}</bdi></span>
                    </>
                  ) : (
                    <bdi>{t('verify')}</bdi>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* STEP 5: Reset Password (New password & Confirm password) */
            <form onSubmit={handleStep5ResetPassword} className="w-full flex-1 flex flex-col justify-between">
              <div className="my-auto space-y-4 w-full">
                {/* New Password */}
                <div>
                  <div className="relative">
                    <input
                      id="new-password-input"
                      type={showPassword ? 'text' : 'password'}
                      autoFocus
                      value={newPassword}
                      onFocus={() => setIsNewPasswordFocused(true)}
                      onBlur={() => setIsNewPasswordFocused(false)}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      className={`w-full h-[56px] px-4 text-[16px] text-[#1F1F1F] dark:text-[#E3E3E3] bg-transparent rounded-[4px] focus:outline-none transition-all box-border ${
                        errorMessage
                          ? 'border-2 border-[#B3261E] dark:border-[#F2B8B5]'
                          : isNewPasswordFocused
                          ? 'border-2 border-[#0B57D0] dark:border-[#A8C7FA]'
                          : 'border border-[#747775] dark:border-[#8E918F] hover:border-[#1F1F1F] dark:hover:border-white'
                      }`}
                    />
                    <label
                      htmlFor="new-password-input"
                      className={`absolute pointer-events-none transition-all duration-150 start-3 ${
                        isNewPasswordFloating
                          ? '-top-2.5 px-1 text-xs bg-white dark:bg-[#1B212D]'
                          : 'top-4 text-[16px]'
                      } ${
                        errorMessage
                          ? 'text-[#B3261E] dark:text-[#F2B8B5]'
                          : isNewPasswordFocused
                          ? 'text-[#0B57D0] dark:text-[#A8C7FA]'
                          : 'text-[#444746] dark:text-[#8E918F]'
                      }`}
                    >
                      <bdi>{t('newPasswordLabel')}</bdi>
                    </label>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <div className="relative">
                    <input
                      id="confirm-password-input"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onFocus={() => setIsConfirmPasswordFocused(true)}
                      onBlur={() => setIsConfirmPasswordFocused(false)}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      className={`w-full h-[56px] px-4 text-[16px] text-[#1F1F1F] dark:text-[#E3E3E3] bg-transparent rounded-[4px] focus:outline-none transition-all box-border ${
                        errorMessage
                          ? 'border-2 border-[#B3261E] dark:border-[#F2B8B5]'
                          : isConfirmPasswordFocused
                          ? 'border-2 border-[#0B57D0] dark:border-[#A8C7FA]'
                          : 'border border-[#747775] dark:border-[#8E918F] hover:border-[#1F1F1F] dark:hover:border-white'
                      }`}
                    />
                    <label
                      htmlFor="confirm-password-input"
                      className={`absolute pointer-events-none transition-all duration-150 start-3 ${
                        isConfirmPasswordFloating
                          ? '-top-2.5 px-1 text-xs bg-white dark:bg-[#1B212D]'
                          : 'top-4 text-[16px]'
                      } ${
                        errorMessage
                          ? 'text-[#B3261E] dark:text-[#F2B8B5]'
                          : isConfirmPasswordFocused
                          ? 'text-[#0B57D0] dark:text-[#A8C7FA]'
                          : 'text-[#444746] dark:text-[#8E918F]'
                      }`}
                    >
                      <bdi>{t('confirmPasswordLabel')}</bdi>
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

                  {successMessage && !errorMessage && (
                    <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 mt-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <bdi>{successMessage}</bdi>
                    </div>
                  )}
                </div>

                {/* Show Password Toggle */}
                <div className="flex items-center gap-2 text-sm pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-[#444746] dark:text-[#C4C7C5]">
                    <input
                      type="checkbox"
                      checked={showPassword}
                      onChange={(e) => setShowPassword(e.target.checked)}
                      className="w-4 h-4 rounded-[2px] border-[#747775] text-[#0B57D0] focus:ring-[#0B57D0] cursor-pointer"
                    />
                    <span><bdi>{t('showPassword')}</bdi></span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between md:justify-end items-center gap-4 pt-6 mt-auto">
                <Link
                  href="/login"
                  className="text-sm font-medium text-[#0B57D0] dark:text-[#A8C7FA] hover:bg-[#F2F6FC] dark:hover:bg-[#1E2738] px-4 py-2 rounded-full transition-colors cursor-pointer"
                >
                  <bdi>{t('backToSignIn')}</bdi>
                </Link>

                <button
                  type="submit"
                  disabled={loading || newPassword.length < 6 || !confirmPassword}
                  className="bg-[#0B57D0] hover:bg-[#0842A0] active:bg-[#06337E] text-white text-sm font-medium px-7 py-2.5 rounded-full transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 min-w-[120px]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span><bdi>{t('savePassword')}</bdi></span>
                    </>
                  ) : (
                    <bdi>{t('savePassword')}</bdi>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Footer outside card */}
      <div className="relative z-10 w-full max-w-[1040px] flex flex-col sm:flex-row items-center justify-between text-xs text-[#444746] dark:text-[#8E918F] px-4 sm:px-6 mt-4 gap-3">
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsLangOpen(!isLangOpen);
              setLangSearch('');
            }}
            className="flex items-center gap-2 py-1.5 px-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer text-xs"
          >
            <span>{getLocaleDisplayName(locale)}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#444746] dark:text-[#8E918F]" />
          </button>

          {isLangOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsLangOpen(false)} />
              <div className="absolute bottom-full mb-2 start-0 w-72 max-h-80 bg-white dark:bg-[#1B212D] border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl p-2 z-50 text-xs flex flex-col">
                <div className="pb-2 border-b border-gray-100 dark:border-slate-800">
                  <input
                    type="text"
                    placeholder={t('searchLanguages')}
                    value={langSearch}
                    onChange={(e) => setLangSearch(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-xs text-[#1F1F1F] dark:text-[#E3E3E3] placeholder-[#747775] dark:placeholder-[#8E918F] focus:outline-none focus:border-[#0B57D0] dark:focus:border-[#A8C7FA]"
                    autoFocus
                  />
                </div>
                <div className="overflow-y-auto flex-1 mt-1 space-y-0.5 max-h-60">
                  {filteredLocales.length === 0 ? (
                    <div className="p-3 text-center text-gray-400">
                      {t('noLanguagesFound')}
                    </div>
                  ) : (
                    filteredLocales.map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => handleLanguageChange(loc)}
                        className={`w-full text-start px-2.5 py-2 rounded-lg transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                          locale === loc
                            ? 'bg-[#E8F0FE] dark:bg-[#1E293B] text-[#0B57D0] dark:text-[#A8C7FA] font-medium'
                            : 'hover:bg-gray-100 dark:hover:bg-slate-800 text-[#1F1F1F] dark:text-[#E3E3E3]'
                        }`}
                      >
                        <span className="truncate">{getLocaleDisplayName(loc)}</span>
                        <span className="text-[10px] text-gray-400 font-mono shrink-0">{loc}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-7 text-xs">
          <Link href="/help" className="hover:text-[#1F1F1F] dark:hover:text-white transition-colors">
            <bdi>{t('help')}</bdi>
          </Link>
          <Link href="/privacy" className="hover:text-[#1F1F1F] dark:hover:text-white transition-colors">
            <bdi>{t('privacy')}</bdi>
          </Link>
          <Link href="/terms" className="hover:text-[#1F1F1F] dark:hover:text-white transition-colors">
            <bdi>{t('terms')}</bdi>
          </Link>
        </div>
      </div>
    </div>
  );
}
