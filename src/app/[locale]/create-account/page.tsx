import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { isRtlLocale } from '@/i18n/locales';

export default async function CreateAccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isRtl = isRtlLocale(locale);

  const t = {
    badge: isRtl ? 'المرحلة القادمة' : 'Onboarding Wizard',
    title: isRtl ? 'إنشاء حساب جديد' : 'Create Account',
    description: isRtl
      ? 'جاري إعداد معالج التسجيل المتكامل (الخطوة 1: المعلومات الأساسية والخطوة 2: بيانات الاتصال).'
      : 'The multi-step onboarding wizard (Step 1: Basic Info & Step 2: Contact Details) is currently staged for implementation.',
    backToSignIn: isRtl ? 'العودة لتسجيل الدخول' : 'Back to Sign In',
  };

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full p-8 rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-xl space-y-6">
        <div className="w-12 h-12 rounded-2xl bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center font-bold text-xl mx-auto shadow">
          P
        </div>

        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-full bg-[var(--muted)] text-[var(--muted-foreground)] text-xs font-semibold uppercase tracking-wider">
            <bdi>{t.badge}</bdi>
          </span>
          <h1 className="text-2xl font-bold tracking-tight">
            <bdi>{t.title}</bdi>
          </h1>
          <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
            <bdi>{t.description}</bdi>
          </p>
        </div>

        <div className="pt-4 border-t border-[var(--border)]">
          <Link
            href="/login"
            className="w-full inline-flex items-center justify-center py-3 px-4 rounded-xl text-sm font-medium bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 active:scale-95 transition shadow cursor-pointer"
          >
            <bdi>{t.backToSignIn}</bdi>
          </Link>
        </div>
      </div>
    </main>
  );
}