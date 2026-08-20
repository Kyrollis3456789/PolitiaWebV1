'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  Eye,
  EyeOff,
  UserCircle2,
  Pencil,
  ArrowRight,
  ArrowLeft,
  Lock,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { useRouter, Link } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import { isRtlLocale } from '@/i18n/locales';
import { createClient } from '@/lib/supabase/client';
import { checkUserAccountExists } from '@/app/actions/auth-check';
import { ThemeLanguageControls } from '@/components/shared/ThemeLanguageControls';
import { pageScaleFade, pageFadeSlide, tapScale } from '@/lib/animations/transitions';

interface LoginScreenProps {
  onNavigateRegister?: () => void;
  onNavigateForgot?: () => void;
  onSubmit?: (e: React.FormEvent) => void;
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
      const targetEmail = (resolvedEmail || email).trim();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password,
      });

      if (error) {
        console.error('Supabase sign-in error:', error);
        setErrorMessage(error.message || t('wrongPasswordError'));
        return;
      }

      if (data?.session || data?.user) {
        window.location.href = '/dashboard';
      }
    } catch (err: unknown) {
      console.error('Sign-in catch error:', err);
      const msg = err instanceof Error ? err.message : t('genericError');
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
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
      className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-zinc-50 dark:bg-[#0c0d12] transition-colors duration-300 overflow-x-hidden"
    >
      {/* Top Header Bar with Theme & Language Controls */}
      <header className="absolute top-4 sm:top-6 start-4 end-4 sm:start-8 sm:end-8 flex items-center justify-between z-30 pointer-events-auto">
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <div className="w-9 h-9 rounded-xl bg-white/90 dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex items-center justify-center p-1.5 transition-transform group-hover:scale-105">
            <Image
              src="/logo.png"
              alt="Politia logo"
              width={28}
              height={28}
              priority
              style={{ height: 'auto' }}
              className="object-contain"
            />
          </div>
          <span className="font-bold text-sm tracking-tight text-zinc-900 dark:text-zinc-100 hidden sm:inline">
            Politia
          </span>
        </Link>

        <ThemeLanguageControls />
      </header>

      {/* Master Floating Glass Card */}
      <motion.div
        variants={pageScaleFade}
        initial="initial"
        animate="animate"
        exit="exit"
        className="relative z-20 w-full max-w-md md:max-w-lg bg-white/95 dark:bg-[#1B212D]/95 backdrop-blur-2xl rounded-[32px] md:rounded-[36px] border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xl shadow-zinc-900/5 dark:shadow-black/50 p-7 md:p-10 flex flex-col gap-6 mt-12 sm:mt-0"
      >
        {/* Brand Emblem & Header Cluster */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-800/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-xs mb-1">
            <Image
              src="/logo.png"
              alt="Politia logo"
              width={40}
              height={40}
              priority
              style={{ height: 'auto' }}
              className="object-contain"
            />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            <bdi>{step === 1 ? t('title') : (isRtl ? 'أدخل كلمة المرور' : 'Enter Password')}</bdi>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium max-w-sm">
            <bdi>{step === 1 ? t('subtitle') : (isRtl ? 'يرجى إدخال كلمة المرور لتسجيل الدخول إلى حسابك' : 'Please enter your password to sign in')}</bdi>
          </p>
        </div>

        {/* Step 1: Identifier Form */}
        {step === 1 ? (
          <form onSubmit={handleEmailNext} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="login-identifier" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                <bdi>{t('identifierLabel')}</bdi>
              </label>

              <div className="relative">
                <Mail className="w-4 h-4 absolute top-1/2 -translate-y-1/2 start-4 text-zinc-400 pointer-events-none" />
                <input
                  id="login-identifier"
                  type="text"
                  autoFocus
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder={isRtl ? 'البريد الإلكتروني أو رقم الهاتف أو الرقم القومي' : 'Email, Phone, or National ID'}
                  className="w-full h-13 md:h-14 rounded-2xl bg-zinc-50/90 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 ps-11 pe-4 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                />
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <motion.div
                variants={pageFadeSlide}
                initial="initial"
                animate="animate"
                className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs text-red-700 dark:text-red-300 font-medium"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                <bdi>{errorMessage}</bdi>
              </motion.div>
            )}

            {/* Security Notice */}
            <div className="p-3 rounded-xl bg-zinc-100/60 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-zinc-700/50 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                <bdi>{t('sharedDeviceNotice')}</bdi>
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-2">
              <motion.button
                whileHover={tapScale.hover}
                whileTap={tapScale.tap}
                type="submit"
                disabled={loading}
                className="h-13 md:h-14 w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-600/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span><bdi>{t('next')}</bdi></span>
                  </>
                ) : (
                  <>
                    <span><bdi>{t('next')}</bdi></span>
                    {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                  </>
                )}
              </motion.button>

              <motion.button
                whileHover={tapScale.hover}
                whileTap={tapScale.tap}
                type="button"
                onClick={handleCreateAccount}
                className="h-12 w-full rounded-2xl bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 font-medium active:scale-[0.98] transition-all border border-zinc-200/80 dark:border-zinc-700/80 flex items-center justify-center cursor-pointer text-sm"
              >
                <bdi>{t('createAccount')}</bdi>
              </motion.button>
            </div>
          </form>
        ) : (
          /* Step 2: Password Form */
          <form onSubmit={handlePasswordSubmit} className="space-y-5">
            {/* Identity Profile Badge */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-100/80 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <UserCircle2 className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                    {displayName || resolvedEmail || email}
                  </div>
                  {displayName && (
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                      {resolvedEmail || email}
                    </div>
                  )}
                </div>
              </div>

              <motion.button
                whileTap={tapScale.tap}
                type="button"
                onClick={() => {
                  setStep(1);
                  setErrorMessage(null);
                }}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer shrink-0 ms-2"
              >
                <Pencil className="w-3 h-3" />
                <span><bdi>{isRtl ? 'تغيير' : 'Change'}</bdi></span>
              </motion.button>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="login-password" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                <bdi>{t('passwordLabel')}</bdi>
              </label>

              <div className="relative">
                <Lock className="w-4 h-4 absolute top-1/2 -translate-y-1/2 start-4 text-zinc-400 pointer-events-none" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoFocus
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="••••••••"
                  className="w-full h-13 md:h-14 rounded-2xl bg-zinc-50/90 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 ps-11 pe-12 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 -translate-y-1/2 end-3.5 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  <bdi>{t('forgotPassword')}</bdi>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <motion.div
                variants={pageFadeSlide}
                initial="initial"
                animate="animate"
                className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs text-red-700 dark:text-red-300 font-medium"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                <bdi>{errorMessage}</bdi>
              </motion.div>
            )}

            {/* Submit CTA */}
            <div className="space-y-3 pt-2">
              <motion.button
                whileHover={tapScale.hover}
                whileTap={tapScale.tap}
                type="submit"
                disabled={loading}
                className="h-13 md:h-14 w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-600/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span><bdi>{t('signingIn')}</bdi></span>
                  </>
                ) : (
                  <bdi>{t('signInButton')}</bdi>
                )}
              </motion.button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
