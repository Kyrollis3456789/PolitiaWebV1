import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/server';
import { isRtlLocale } from '@/i18n/locales';

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isRtl = isRtlLocale(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const t = {
    title: isRtl ? 'بوليتيا آب' : 'PolitiaApp',
    subtitle: isRtl
      ? 'منصة بوابة رقمية موحدة مع مصادقة Supabase ودعم 131 لغة'
      : 'Unified digital portal platform with Supabase auth and 131 locales support',
    goToDashboard: isRtl ? 'الانتقال إلى لوحة التحكم' : 'Go to dashboard',
    loggedInAs: isRtl ? 'تم تسجيل الدخول كـ' : 'Signed in as',
  };

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full space-y-6 border border-[var(--border)] p-8 rounded-3xl shadow-xl bg-[var(--card)]">
        <div className="w-14 h-14 rounded-2xl bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center font-bold text-2xl mx-auto shadow-md">
          P
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            <bdi>{t.title}</bdi>
          </h1>
          <p className="text-[var(--muted-foreground)] text-sm leading-relaxed">
            <bdi>{t.subtitle}</bdi>
          </p>
        </div>

        <div className="pt-4 border-t border-[var(--border)]">
          {user ? (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                <span>{t.loggedInAs}: </span>
                <span className="font-mono">{user.email}</span>
              </div>
              <Link
                href="/dashboard"
                className="w-full py-3 px-4 rounded-xl font-medium text-sm bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 active:scale-95 transition shadow flex items-center justify-center gap-2 cursor-pointer"
              >
                <span><bdi>{t.goToDashboard}</bdi></span>
                <span className="text-base">→</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              <Link
                href="/auth-showcase"
                className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-[#4A72B2] text-white hover:bg-[#3E6199] active:scale-95 transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Preview auth flow</span>
                <span className="text-base">📱</span>
              </Link>
              <div className="grid grid-cols-3 gap-2 pt-1">
                <Link
                  href="/login"
                  className="py-2.5 px-2 rounded-xl text-xs font-semibold border border-[var(--border)] hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="py-2.5 px-2 rounded-xl text-xs font-semibold border border-[var(--border)] hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Register
                </Link>
                <Link
                  href="/verify"
                  className="py-2.5 px-2 rounded-xl text-xs font-semibold border border-[var(--border)] hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Verify
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
