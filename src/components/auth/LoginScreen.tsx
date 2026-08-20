'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
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
      className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-zinc-50 dark:bg-[#0c0d12] transition-colors duration-300 overflow-x-hidden"
    >
      {/* Theme & Language Controls — Fixed Top-End */}
      <div className="absolute top-6 end-6 z-20">
        <ThemeLanguageControls />
      </div>

      {/* Master Floating Glass Card */}
      <motion.div
        variants={pageScaleFade}
        initial="initial"
        animate="animate"
        exit="exit"
        className="relative z-10 w-full max-w-md md:max-w-lg bg-white/95 dark:bg-[#1B212D]/95 backdrop-blur-2xl rounded-[32px] md:rounded-[36px] border border-zinc-200/80 dark:border-slate-800/80 shadow-2xl shadow-zinc-900/5 dark:shadow-black/50 p-8 sm:p-10 flex flex-col gap-6"
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          {/* Brand Logo with Pulse */}
          <div className="relative w-16 h-16 rounded-2xl bg-white dark:bg-zinc-800/90 border border-zinc-200/60 dark:border-zinc-700/80 shadow-sm flex items-center justify-center p-2.5 transition-all">
            <div className="absolute inset-0 rounded-2xl bg-blue-500/10 dark:bg-blue-400/5 animate-pulse" />
            <Image
              src="/logo.png"
              alt="Politia logo"
              width={48}
              height={48}
              priority
              style={{ height: 'auto' }}
              className="object-contain relative z-10"
            />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
              <bdi>{step === 1 ? t('title') : (isRtl ? 'أدخل كلمة المرور' : 'Enter Password')}</bdi>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed max-w-sm mx-auto">
              <bdi>{step === 1 ? t('subtitle') : (isRtl ? 'يرجى إدخال كلمة المرور لتسجيل الدخول إلى حسابك' : 'Please enter your password to sign in to your account')}</bdi>
            </p>
          </div>
        </div>

        {/* Step 1: Identifier Form */}
        {step === 1 ? (
          <form onSubmit={handleEmailNext} className="space-y-5">
            {/* Identifier Input */}
            <div className="space-y-1.5">
              <label htmlFor="login-identifier" className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                <bdi>{t('identifierLabel')}</bdi>
              </label>

              <div className="relative">
                <Mail className="w-4 h-4 absolute top-1/2 -translate-y-1/2 start-5 text-zinc-400 pointer-events-none" />
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
                  className="w-full h-14 rounded-2xl bg-zinc-50/90 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 ps-12 pe-5 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                />
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <motion.div
                variants={pageFadeSlide}
                initial="initial"
                animate="animate"
                className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200/80 dark:border-red-900/50 text-xs text-red-700 dark:text-red-300 font-medium"
              >
                <span className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/60 flex items-center justify-center shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                </span>
                <bdi>{errorMessage}</bdi>
              </motion.div>
            )}

            {/* Security Notice */}
            <div className="p-3.5 rounded-2xl bg-zinc-100/60 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-zinc-700/50 flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                <bdi>{t('sharedDeviceNotice')}</bdi>
              </p>
            </div>

            {/* Primary CTA: Next */}
            <div className="space-y-3 pt-1">
              <motion.button
                whileHover={tapScale.hover}
                whileTap={tapScale.tap}
                type="submit"
                disabled={loading}
                className="h-14 w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-600/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
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

              {/* Divider: OR */}
              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700/80" />
                <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest select-none">
                  {isRtl ? 'أو' : 'OR'}
                </span>
                <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700/80" />
              </div>

              {/* Secondary CTA: Create Account */}
              <motion.button
                whileHover={tapScale.hover}
                whileTap={tapScale.tap}
                type="button"
                onClick={handleCreateAccount}
                className="h-13 w-full rounded-2xl bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 font-medium active:scale-[0.98] transition-all border border-zinc-200/80 dark:border-zinc-700/80 flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <bdi>{t('createAccount')}</bdi>
              </motion.button>
            </div>
          </form>
        ) : (
          /* Step 2: Password Form */
          <form onSubmit={handlePasswordSubmit} className="space-y-5">
            {/* Identity Profile Badge */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-100/80 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <UserCircle2 className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
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
                  setPassword('');
                  setErrorMessage(null);
                }}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer shrink-0 ms-3"
              >
                <Pencil className="w-3 h-3" />
                <span><bdi>{isRtl ? 'تغيير' : 'Change'}</bdi></span>
              </motion.button>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="login-password" className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                <bdi>{t('passwordLabel')}</bdi>
              </label>

              <div className="relative">
                <Lock className="w-4 h-4 absolute top-1/2 -translate-y-1/2 start-5 text-zinc-400 pointer-events-none" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  dir="ltr"
                  autoFocus
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="••••••••"
                  className="w-full h-14 rounded-2xl bg-zinc-50/90 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 ps-12 pe-14 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                />

                {/* Eye Icon Toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1.5 rounded-lg cursor-pointer transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end pt-0.5">
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
                className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200/80 dark:border-red-900/50 text-xs text-red-700 dark:text-red-300 font-medium"
              >
                <span className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/60 flex items-center justify-center shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                </span>
                <bdi>{errorMessage}</bdi>
              </motion.div>
            )}

            {/* Primary CTA: Sign In */}
            <div className="pt-1">
              <motion.button
                whileHover={tapScale.hover}
                whileTap={tapScale.tap}
                type="submit"
                disabled={loading}
                className="h-14 w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-600/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
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
