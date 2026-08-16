'use client';

import React, { useState } from 'react';
import { useRouter, Link } from '@/i18n/routing';
import { useLocale } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { isRtlLocale } from '@/i18n/locales';

export function LoginForm() {
  const router = useRouter();
  const locale = useLocale();
  const isRtl = isRtlLocale(locale);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      if (data?.session) {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : isRtl
          ? 'حدث خطأ أثناء الاتصال بالخادم'
          : 'An unexpected connection error occurred.';
      setErrorMessage(msg);
      setLoading(false);
    }
  };

  const t = {
    title: isRtl ? 'تسجيل الدخول' : 'Sign In',
    subtitle: isRtl
      ? 'أدخل بريدك الإلكتروني وكلمة المرور للمتابعة'
      : 'Enter your email and password to access the portal',
    emailLabel: isRtl ? 'البريد الإلكتروني' : 'Email Address',
    emailPlaceholder: 'name@example.com',
    passwordLabel: isRtl ? 'كلمة المرور' : 'Password',
    passwordPlaceholder: '••••••••',
    signInButton: isRtl ? 'تسجيل الدخول' : 'Sign In',
    signingIn: isRtl ? 'جاري التحقق...' : 'Signing in...',
    noAccount: isRtl ? 'ليس لديك حساب؟' : "Don't have an account?",
    createAccount: isRtl ? 'إنشاء حساب جديد' : 'Create Account',
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 rounded-2xl border border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)] shadow-xl transition-all">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--muted)] text-[var(--foreground)] mb-4 font-bold text-xl">
          P
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          <bdi>{t.title}</bdi>
        </h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-2">
          <bdi>{t.subtitle}</bdi>
        </p>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm font-medium flex items-start gap-3"
        >
          <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="flex-1 text-start">
            <bdi>{errorMessage}</bdi>
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-2 text-start">
            <bdi>{t.emailLabel}</bdi>
          </label>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.emailPlaceholder}
            disabled={loading}
            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition disabled:opacity-50 text-start"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-2 text-start">
            <bdi>{t.passwordLabel}</bdi>
          </label>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t.passwordPlaceholder}
            disabled={loading}
            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition disabled:opacity-50 text-start"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl font-medium text-sm bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 active:scale-[0.99] transition shadow flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span><bdi>{t.signingIn}</bdi></span>
            </>
          ) : (
            <span><bdi>{t.signInButton}</bdi></span>
          )}
        </button>
      </form>

      {/* Create Account Action */}
      <div className="mt-8 pt-6 border-t border-[var(--border)] text-center space-y-3">
        <p className="text-xs text-[var(--muted-foreground)]">
          <bdi>{t.noAccount}</bdi>
        </p>
        <Link
          href="/create-account"
          className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl text-sm font-semibold border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--muted)] active:scale-[0.99] transition cursor-pointer"
        >
          <bdi>{t.createAccount}</bdi>
        </Link>
      </div>
    </div>
  );
}