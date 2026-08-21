'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Loader2, ChevronDown, UserCircle2 } from 'lucide-react';
import { useRouter, Link } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import { isRtlLocale, SUPPORTED_LOCALES, getLocaleDisplayName } from '@/i18n/locales';
import { createClient } from '@/lib/supabase/client';
import { checkUserAccountExists } from '@/app/actions/auth-check';
import { sanitizeInput } from '@/lib/validation/sanitizer';

interface LoginScreenProps {
  onNavigateRegister?: () => void;
  onNavigateForgot?: () => void;
  onSubmit?: (e: React.FormEvent) => void;
  isStandaloneMobile?: boolean;
}

export function LoginScreen({
  onNavigateRegister,
  onNavigateForgot,
  onSubmit,
}: LoginScreenProps) {
  const router = useRouter();
  const locale = useLocale();
  const isRtl = isRtlLocale(locale);
  const t = useTranslations('signin');

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [resolvedEmail, setResolvedEmail] = useState('');
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLangOpen, setIsLangOpen] = useState(false);

  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const isEmailFloating = isEmailFocused || email.length > 0 || Boolean(errorMessage);
  const isPasswordFloating = isPasswordFocused || password.length > 0 || Boolean(errorMessage);

  const handleEmailNext = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmed = email.trim();
    if (!trimmed) {
      setErrorMessage(t('emptyIdentifierError'));
      return;
    }

    setLoading(true);

    try {
      const result = await checkUserAccountExists(trimmed);

      if (!result.exists) {
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
          setResolvedEmail(trimmed);
          setStep(2);
          return;
        }
        setErrorMessage(t('accountNotFoundError'));
        return;
      }

      if (result.resolvedEmail) {
        setResolvedEmail(result.resolvedEmail);
      }
      if (result.displayName) {
        setDisplayName(result.displayName);
      }

      setStep(2);
    } catch (err) {
      console.warn('Lookup warning, falling back to direct password step:', err);
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
        setResolvedEmail(trimmed);
        setStep(2);
      } else {
        setErrorMessage(t('genericError'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (onSubmit) {
      onSubmit(e);
      return;
    }

    setErrorMessage(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const targetEmail = sanitizeInput(resolvedEmail || email).toLowerCase();
      const cleanPassword = password;
      const { data, error } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password: cleanPassword,
      });

      if (error) {
        console.error('Supabase sign-in error:', error);
        setErrorMessage(error.message || t('wrongPasswordError'));
        return;
      }

      if (data?.session || data?.user) {
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error('Sign-in catch error:', err);
      setErrorMessage(err?.message || t('genericError'));
    } finally {
      setLoading(false);
    }
  };

  const [langSearch, setLangSearch] = useState('');

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
    router.replace('/login', { locale: newLocale });
  };

  const handleCreateAccount = () => {
    if (onNavigateRegister) onNavigateRegister();
    else router.push('/register');
  };

  const handleForgotPassword = () => {
    if (onNavigateForgot) {
      onNavigateForgot();
      return;
    }
    const target = (resolvedEmail || email).trim();
    if (target) {
      router.push(`/forgot?email=${encodeURIComponent(target)}`);
    } else {
      router.push('/forgot');
    }
  };

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="relative w-full min-h-[100dvh] sm:min-h-screen bg-[#F0F4F9] dark:bg-[#0E121A] flex flex-col justify-between md:justify-center items-center p-0 md:p-6 transition-colors duration-300 overflow-x-hidden"
    >
      {/* Desktop Background Layer (>= md only) */}
      <div className="hidden md:block absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <Image
          src="/splash-bg.webp"
          alt="Background"
          fill
          priority
          quality={90}
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/85 to-slate-50/95 dark:from-[#090D16]/90 dark:to-[#090D16]/97" />
      </div>
      {/* Main Authentication Card Container */}
      <div className="relative z-20 w-full max-w-[1040px] bg-white/95 dark:bg-[#1B212D]/95 rounded-none md:rounded-[36px] p-5 sm:p-8 md:p-12 shadow-none md:shadow-2xl border-0 md:border md:border-white/60 dark:md:border-slate-800/80 flex flex-col md:flex-row gap-6 md:gap-14 min-h-[100dvh] md:min-h-fit h-auto items-stretch md:items-start transition-all duration-300 ease-in-out">
        {/* Left Column: Branding & Title */}
        <div className="w-full md:w-1/2 flex flex-col justify-start items-start text-start min-h-0 md:min-h-[320px]">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white dark:bg-slate-800/90 p-2 shadow-sm border border-slate-200/60 dark:border-slate-700/80 flex items-center justify-center transition-all">
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

          <div className="mt-4 md:mt-6 space-y-2">
            <h1 className="text-[28px] sm:text-[38px] font-normal text-[#1F1F1F] dark:text-[#E3E3E3] tracking-tight leading-[1.15]">
              <bdi>{t('title')}</bdi>
            </h1>
            <p className="text-[15px] sm:text-[16px] text-[#1F1F1F] dark:text-[#C4C7C5] font-normal leading-relaxed">
              <bdi>{t('subtitle')}</bdi>
            </p>
          </div>
        </div>

        {/* Right Column: Interactive Forms */}
        <div className="w-full md:w-1/2 flex-1 flex flex-col justify-between min-h-0 md:min-h-[320px] overflow-hidden transition-all duration-300 ease-in-out">
          {step === 1 ? (
            <form onSubmit={handleEmailNext} className="w-full flex-1 flex flex-col justify-between overflow-y-auto min-h-0">
              <div className="my-auto space-y-4 w-full">
                <div className="relative">
                  <input
                    id="email-input"
                    type="text"
                    autoFocus
                    value={email}
                    onFocus={(e) => {
                      setIsEmailFocused(true);
                      if (typeof window !== 'undefined' && window.innerWidth < 768) {
                        e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }}
                    onBlur={() => setIsEmailFocused(false)}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    className={`w-full h-[56px] px-4 text-[16px] text-[#1F1F1F] dark:text-[#E3E3E3] bg-transparent rounded-[4px] focus:outline-none transition-all box-border ${errorMessage
                      ? 'border-2 border-[#B3261E] dark:border-[#F2B8B5]'
                      : isEmailFocused
                        ? 'border-2 border-[#0B57D0] dark:border-[#A8C7FA]'
                        : 'border border-[#747775] dark:border-[#8E918F] hover:border-[#1F1F1F] dark:hover:border-white'
                      }`}
                  />
                  <label
                    htmlFor="email-input"
                    className={`absolute pointer-events-none transition-all duration-150 start-3 ${isEmailFloating
                      ? '-top-2.5 px-1 text-xs bg-white dark:bg-[#1B212D]'
                      : 'top-4 text-[16px]'
                      } ${errorMessage
                        ? 'text-[#B3261E] dark:text-[#F2B8B5]'
                        : isEmailFocused
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

                <div className="pt-1">
                  <p className="text-sm text-[#444746] dark:text-[#C4C7C5] leading-normal">
                    <bdi>{t('sharedDeviceNotice')}</bdi>{' '}
                    <button
                      type="button"
                      className="font-medium text-[#0B57D0] dark:text-[#A8C7FA] hover:underline cursor-pointer inline p-0"
                    >
                      <bdi>{t('learnMoreSecurity')}</bdi>
                    </button>
                  </p>
                </div>
              </div>

              <div className="flex justify-between md:justify-end items-center gap-4 pt-6 mt-auto">
                {onNavigateRegister ? (
                  <button
                    type="button"
                    onClick={handleCreateAccount}
                    className="text-sm font-medium text-[#0B57D0] dark:text-[#A8C7FA] hover:bg-[#F2F6FC] dark:hover:bg-[#1E2738] px-4 py-2 rounded-full transition-colors cursor-pointer"
                  >
                    <bdi>{t('createAccount')}</bdi>
                  </button>
                ) : (
                  <Link
                    href="/register"
                    className="text-sm font-medium text-[#0B57D0] dark:text-[#A8C7FA] hover:bg-[#F2F6FC] dark:hover:bg-[#1E2738] px-4 py-2 rounded-full transition-colors cursor-pointer inline-flex items-center justify-center"
                  >
                    <bdi>{t('createAccount')}</bdi>
                  </Link>
                )}

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
          ) : (
            <form onSubmit={handlePasswordSubmit} className="w-full flex-1 flex flex-col justify-between">
              <div className="my-auto space-y-4 w-full">
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setErrorMessage(null);
                    }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#747775] dark:border-slate-700 hover:bg-[#F2F6FC] dark:hover:bg-slate-800 transition-colors text-sm text-[#1F1F1F] dark:text-[#E3E3E3] cursor-pointer"
                  >
                    <UserCircle2 className="w-4 h-4 text-[#0B57D0] dark:text-[#A8C7FA]" />
                    <span className="font-mono text-xs sm:text-sm truncate max-w-[240px]">
                      {displayName ? `${displayName} (${email})` : email}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                </div>

                <div>
                  <div className="relative">
                    <input
                      id="password-input"
                      type={showPassword ? 'text' : 'password'}
                      autoFocus
                      disabled={loading}
                      value={password}
                      onFocus={(e) => {
                        setIsPasswordFocused(true);
                        if (typeof window !== 'undefined' && window.innerWidth < 768) {
                          e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                      }}
                      onBlur={() => setIsPasswordFocused(false)}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      className={`w-full h-[56px] px-4 text-[16px] text-[#1F1F1F] dark:text-[#E3E3E3] bg-transparent rounded-[4px] focus:outline-none transition-all disabled:opacity-50 box-border ${errorMessage
                        ? 'border-2 border-[#B3261E] dark:border-[#F2B8B5]'
                        : isPasswordFocused
                          ? 'border-2 border-[#0B57D0] dark:border-[#A8C7FA]'
                          : 'border border-[#747775] dark:border-[#8E918F] hover:border-[#1F1F1F] dark:hover:border-white'
                        }`}
                    />
                    <label
                      htmlFor="password-input"
                      className={`absolute pointer-events-none transition-all duration-150 start-3 ${isPasswordFloating
                        ? '-top-2.5 px-1 text-xs bg-white dark:bg-[#1B212D]'
                        : 'top-4 text-[16px]'
                        } ${errorMessage
                          ? 'text-[#B3261E] dark:text-[#F2B8B5]'
                          : isPasswordFocused
                            ? 'text-[#0B57D0] dark:text-[#A8C7FA]'
                            : 'text-[#444746] dark:text-[#8E918F]'
                        }`}
                    >
                      <bdi>{t('passwordLabel')}</bdi>
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

                <div className="flex items-center justify-between gap-4 text-sm">
                  <label className="flex items-center gap-2 cursor-pointer text-[#444746] dark:text-[#C4C7C5]">
                    <input
                      type="checkbox"
                      checked={showPassword}
                      onChange={(e) => setShowPassword(e.target.checked)}
                      className="w-4 h-4 rounded-[2px] border-[#747775] text-[#0B57D0] focus:ring-[#0B57D0] cursor-pointer"
                    />
                    <span><bdi>{t('showPassword')}</bdi></span>
                  </label>

                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm font-medium text-[#0B57D0] dark:text-[#A8C7FA] hover:underline cursor-pointer p-0 bg-transparent border-0"
                  >
                    <bdi>{t('forgotPassword')}</bdi>
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-8 mt-auto">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#0B57D0] hover:bg-[#0842A0] active:bg-[#06337E] text-white text-sm font-medium px-6 py-2.5 rounded-full transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span><bdi>{t('signingIn')}</bdi></span>
                    </>
                  ) : (
                    <span><bdi>{t('next')}</bdi></span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <div className="relative z-20 w-full max-w-[1040px] flex flex-col sm:flex-row items-center justify-between text-xs text-[#444746] dark:text-[#8E918F] px-4 sm:px-6 mt-2.5 md:mt-3 pb-6 md:pb-0 gap-2.5">
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
                        className={`w-full text-start px-2.5 py-2 rounded-lg transition-colors cursor-pointer flex items-center justify-between gap-2 ${locale === loc
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
