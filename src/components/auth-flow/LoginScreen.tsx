'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Loader2, ChevronDown, UserCircle2 } from 'lucide-react';
import { useRouter, Link } from '@/i18n/routing';
import { useLocale } from 'next-intl';
import { isRtlLocale } from '@/i18n/locales';
import { createClient } from '@/lib/supabase/client';

interface LoginScreenProps {
  onNavigateRegister?: () => void;
  onNavigateVerify?: () => void;
  onSubmit?: (e: React.FormEvent) => void;
  isStandaloneMobile?: boolean;
}

export function LoginScreen({
  onNavigateRegister,
  onSubmit,
}: LoginScreenProps) {
  const router = useRouter();
  const locale = useLocale();
  const isRtl = isRtlLocale(locale);

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLangOpen, setIsLangOpen] = useState(false);

  const handleEmailNext = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage(isRtl ? 'أدخل بريدًا إلكترونيًا أو رقم هاتف' : 'Enter an email or phone number');
      return;
    }

    setStep(2);
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMessage(
          isRtl
            ? 'كلمة المرور غير صحيحة. حاول مرة أخرى أو اختر "نسيت كلمة المرور؟".'
            : 'Wrong password. Try again or click Forgot password to reset it.'
        );
        return;
      }

      if (data?.session) {
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      setErrorMessage(
        isRtl
          ? 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.'
          : 'An unexpected error occurred. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (newLocale: string) => {
    setIsLangOpen(false);
    router.replace('/login', { locale: newLocale });
  };

  const handleCreateAccount = () => {
    if (onNavigateRegister) onNavigateRegister();
    else router.push('/register');
  };

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="w-full min-h-screen bg-[#F0F4F9] dark:bg-[#0E121A] flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 transition-colors duration-300"
    >
      <div className="w-full max-w-[1040px] bg-white dark:bg-[#1B212D] rounded-[28px] sm:rounded-[36px] p-6 sm:p-8 md:p-12 shadow-[0_1px_3px_0_rgba(60,64,67,0.08),0_4px_8px_3px_rgba(60,64,67,0.04)] dark:shadow-none border border-transparent dark:border-slate-800/80 flex flex-col md:flex-row gap-8 md:gap-14 min-h-[440px] items-start">
        <div className="w-full md:w-1/2 flex flex-col justify-start items-start text-start">
          <div className="w-14 h-14 flex items-center justify-start">
            <Image
              src="/logo.png"
              alt="Politia logo"
              width={56}
              height={56}
              priority
              className="object-contain w-14 h-14"
            />
          </div>

          <div className="mt-6 space-y-2">
            <h1 className="text-[34px] sm:text-[38px] font-normal text-[#1F1F1F] dark:text-[#E3E3E3] tracking-tight leading-[1.15]">
              <bdi>{isRtl ? 'تسجيل الدخول' : 'Sign in'}</bdi>
            </h1>
            <p className="text-[16px] text-[#1F1F1F] dark:text-[#C4C7C5] font-normal leading-relaxed">
              <bdi>{isRtl ? 'استخدم حسابك على بوليتيا' : 'Use your Politia account to continue'}</bdi>
            </p>
          </div>
        </div>

        <div className="w-full md:w-1/2 flex flex-col justify-start pt-8 md:pt-16 lg:pt-20 md:mt-6 lg:mt-8">
          {step === 1 ? (
            <form onSubmit={handleEmailNext} className="w-full space-y-4 md:space-y-5">
              <div>
                <label htmlFor="email-input" className="sr-only">
                  {isRtl ? 'البريد الإلكتروني أو اسم المستخدم أو الهاتف' : 'Email, username, or phone'}
                </label>
                <input
                  id="email-input"
                  type="text"
                  autoFocus
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder={isRtl ? 'البريد الإلكتروني أو اسم المستخدم أو الهاتف' : 'Email, username, or phone'}
                  className={`w-full h-[56px] px-4 text-[16px] text-[#1F1F1F] dark:text-[#E3E3E3] placeholder:text-[#444746] dark:placeholder:text-[#8E918F] bg-transparent rounded-[4px] border focus:outline-none transition-all box-border ${
                    errorMessage
                      ? 'border-[#B3261E] dark:border-[#F2B8B5] border-2'
                      : 'border-[#747775] dark:border-[#8E918F] hover:border-[#1F1F1F] dark:hover:border-white focus:border-2 focus:border-[#0B57D0] dark:focus:border-[#A8C7FA]'
                  }`}
                />
              </div>

              {errorMessage && (
                <p className="flex items-center gap-2 text-xs text-[#B3261E] dark:text-[#F2B8B5]">
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-current text-[10px] font-bold">!</span>
                  <bdi>{errorMessage}</bdi>
                </p>
              )}

              <div className="pt-2">
                <button
                  type="button"
                  className="text-sm font-medium text-[#0B57D0] dark:text-[#A8C7FA] hover:underline cursor-pointer p-0"
                >
                  <bdi>{isRtl ? 'هل نسيت البريد الإلكتروني؟' : 'Forgot email?'}</bdi>
                </button>
              </div>

              <div className="mt-4">
                <p className="text-sm text-[#444746] dark:text-[#C4C7C5] leading-normal">
                  <bdi>
                    {isRtl
                      ? 'هل تستخدم جهازًا مشتركًا؟ حافظ على أمان حساب بوليتيا وسجّل الدخول فقط من خلال بياناتك الشخصية.'
                      : 'Using a shared device? Keep your Politia account secure by signing in only with your own details.'}
                  </bdi>{' '}
                  <button
                    type="button"
                    className="font-medium text-[#0B57D0] dark:text-[#A8C7FA] hover:underline cursor-pointer inline p-0"
                  >
                    <bdi>
                      {isRtl
                        ? 'اعرف المزيد عن أمان حساب بوليتيا'
                        : 'Learn more about Politia account security'}
                    </bdi>
                  </button>
                </p>
              </div>

              <div className="flex justify-between md:justify-end items-center gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleCreateAccount}
                  className="text-sm font-medium text-[#0B57D0] dark:text-[#A8C7FA] hover:bg-[#F2F6FC] dark:hover:bg-[#1E2738] px-4 py-2 rounded-full transition-colors cursor-pointer"
                >
                  <bdi>{isRtl ? 'إنشاء حساب' : 'Create account'}</bdi>
                </button>

                <button
                  type="submit"
                  className="bg-[#0B57D0] hover:bg-[#0842A0] active:bg-[#06337E] text-white text-sm font-medium px-6 py-2.5 rounded-full transition-colors cursor-pointer"
                >
                  <bdi>{isRtl ? 'التالي' : 'Next'}</bdi>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="w-full space-y-4 md:space-y-5">
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
                  <span className="font-mono text-xs sm:text-sm truncate max-w-[220px]">{email}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                </button>
              </div>

              <div>
                <label htmlFor="password-input" className="sr-only">
                  {isRtl ? 'كلمة المرور' : 'Password'}
                </label>
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  autoFocus
                  disabled={loading}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder={isRtl ? 'أدخل كلمة المرور' : 'Enter your password'}
                  className={`w-full h-[56px] px-4 text-[16px] text-[#1F1F1F] dark:text-[#E3E3E3] placeholder:text-[#444746] dark:placeholder:text-[#8E918F] bg-transparent rounded-[4px] border focus:outline-none transition-all disabled:opacity-50 box-border ${
                    errorMessage
                      ? 'border-[#B3261E] dark:border-[#F2B8B5] border-2'
                      : 'border-[#747775] dark:border-[#8E918F] hover:border-[#1F1F1F] dark:hover:border-white focus:border-2 focus:border-[#0B57D0] dark:focus:border-[#A8C7FA]'
                  }`}
                />
              </div>

              {errorMessage && (
                <p className="flex items-center gap-2 text-xs text-[#B3261E] dark:text-[#F2B8B5]">
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-current text-[10px] font-bold">!</span>
                  <bdi>{errorMessage}</bdi>
                </p>
              )}

              <div className="flex items-center justify-between gap-4 text-sm">
                <label className="flex items-center gap-2 cursor-pointer text-[#444746] dark:text-[#C4C7C5]">
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                    className="w-4 h-4 rounded-[2px] border-[#747775] text-[#0B57D0] focus:ring-[#0B57D0] cursor-pointer"
                  />
                  <span><bdi>{isRtl ? 'إظهار كلمة المرور' : 'Show password'}</bdi></span>
                </label>

                <button
                  type="button"
                  className="text-sm font-medium text-[#0B57D0] dark:text-[#A8C7FA] hover:underline cursor-pointer p-0"
                >
                  <bdi>{isRtl ? 'نسيت كلمة المرور؟' : 'Forgot password?'}</bdi>
                </button>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#0B57D0] hover:bg-[#0842A0] active:bg-[#06337E] text-white text-sm font-medium px-6 py-2.5 rounded-full transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span><bdi>{isRtl ? 'جارٍ تسجيل الدخول...' : 'Signing in...'}</bdi></span>
                    </>
                  ) : (
                    <span><bdi>{isRtl ? 'التالي' : 'Next'}</bdi></span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <div className="w-full max-w-[1040px] flex flex-col sm:flex-row items-center justify-between text-xs text-[#444746] dark:text-[#8E918F] px-4 sm:px-6 mt-4 gap-3">
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer text-xs"
          >
            <span>
              {locale === 'en-US'
                ? 'English (United States)'
                : locale === 'ar-EG'
                ? 'العربية (مصر)'
                : locale === 'ar-SA'
                ? 'العربية (السعودية)'
                : locale}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#444746] dark:text-[#8E918F]" />
          </button>

          {isLangOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsLangOpen(false)} />
              <div className="absolute bottom-8 left-0 w-60 max-h-64 overflow-y-auto bg-white dark:bg-[#1B212D] border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg p-1.5 z-50 text-xs">
                {['en-US', 'ar-EG', 'ar-SA', 'fr-FR', 'es-ES', 'de-DE'].map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => handleLanguageChange(loc)}
                    className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                      locale === loc ? 'font-bold text-[#0B57D0]' : ''
                    }`}
                  >
                    {loc === 'en-US'
                      ? 'English (United States)'
                      : loc === 'ar-EG'
                      ? 'العربية (مصر)'
                      : loc === 'ar-SA'
                      ? 'العربية (السعودية)'
                      : loc === 'fr-FR'
                      ? 'Français'
                      : loc === 'es-ES'
                      ? 'Español'
                      : 'Deutsch'}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-7 text-xs">
          <Link href="/help" className="hover:text-[#1F1F1F] dark:hover:text-white transition-colors">
            <bdi>{isRtl ? 'المساعدة' : 'Help'}</bdi>
          </Link>
          <Link href="/privacy" className="hover:text-[#1F1F1F] dark:hover:text-white transition-colors">
            <bdi>{isRtl ? 'الخصوصية' : 'Privacy'}</bdi>
          </Link>
          <Link href="/terms" className="hover:text-[#1F1F1F] dark:hover:text-white transition-colors">
            <bdi>{isRtl ? 'البنود' : 'Terms'}</bdi>
          </Link>

        </div>
      </div>
    </div>
  );
}
