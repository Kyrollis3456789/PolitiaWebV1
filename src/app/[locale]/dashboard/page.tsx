import { setRequestLocale } from 'next-intl/server';
import { redirect } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/server';
import { SignOutButton } from '@/components/auth/SignOutButton';
import { isRtlLocale } from '@/i18n/locales';

interface UserProfile {
  full_name?: string | null;
  username?: string | null;
  phone?: string | null;
  secondary_number?: string | null;
  [key: string]: unknown;
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isRtl = isRtlLocale(locale);

  // Retrieve authenticated Supabase user
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect({ href: '/login', locale });
    return null;
  }

  // Attempt to fetch profile record if table exists
  let profile: UserProfile | null = null;
  try {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    profile = data as UserProfile | null;
  } catch {
    // Graceful fallback if profiles table is not yet provisioned in schema
  }

  const formatTimestamp = (ts?: string | null) => {
    if (!ts) return '—';
    try {
      return new Date(ts).toLocaleString(locale, {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return ts;
    }
  };

  const t = {
    dashboardTitle: isRtl ? 'لوحة التحكم' : 'PolitiaApp Dashboard',
    authenticatedBadge: isRtl ? 'مستخدم موثق' : 'Authenticated User',
    sessionActive: isRtl ? 'جلسة نشطة' : 'Active Supabase Session',
    identitySection: isRtl ? 'بيانات الحساب والمصادقة' : 'Account & Authentication Details',
    profileSection: isRtl ? 'الملف الشخصي' : 'User Profile Attributes',
    userId: isRtl ? 'معرف المستخدم (UUID)' : 'User ID (UUID)',
    email: isRtl ? 'البريد الإلكتروني' : 'Email Address',
    role: isRtl ? 'نوع الصلاحية' : 'Role',
    createdAt: isRtl ? 'تاريخ إنشاء الحساب' : 'Account Created',
    lastSignIn: isRtl ? 'آخر تسجيل دخول' : 'Last Sign In',
    fullName: isRtl ? 'الاسم الكامل' : 'Full Name',
    username: isRtl ? 'اسم المستخدم' : 'Username',
    phone: isRtl ? 'رقم الهاتف' : 'Phone Number',
    secondaryNumber: isRtl ? 'الرقم الإضافي' : 'Secondary Number',
  };

  const userMeta = user.user_metadata as Record<string, unknown> | undefined;
  const displayName =
    profile?.full_name ||
    (typeof userMeta?.full_name === 'string' ? userMeta.full_name : null) ||
    user.email?.split('@')[0] ||
    'User';

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Top Navigation */}
      <header className="border-b border-[var(--border)] bg-[var(--card)]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center font-bold text-sm">
              P
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight leading-tight">
                <bdi>{t.dashboardTitle}</bdi>
              </h1>
              <p className="text-xs text-[var(--muted-foreground)]">
                <bdi>{locale.toUpperCase()}</bdi>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span><bdi>{t.sessionActive}</bdi></span>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        {/* User Hero Card */}
        <section className="p-8 rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-[var(--muted)] border border-[var(--border)] flex items-center justify-center font-bold text-2xl text-[var(--foreground)] shrink-0">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold tracking-tight">
                  <bdi>{displayName}</bdi>
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-[var(--muted)] text-[var(--muted-foreground)] text-xs font-semibold uppercase">
                  <bdi>{user.role || 'authenticated'}</bdi>
                </span>
              </div>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">
                <bdi>{user.email || '—'}</bdi>
              </p>
            </div>
          </div>

          <div className="text-start sm:text-end text-xs text-[var(--muted-foreground)]">
            <p className="font-semibold text-[var(--foreground)]">{t.authenticatedBadge}</p>
            <p className="mt-1">{formatTimestamp(user.last_sign_in_at)}</p>
          </div>
        </section>

        {/* Real Data Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Supabase Auth Identity Card */}
          <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--muted-foreground)] pb-2 border-b border-[var(--border)]">
              <bdi>{t.identitySection}</bdi>
            </h3>

            <div className="space-y-4 text-sm">
              <div>
                <span className="text-xs text-[var(--muted-foreground)] block mb-1">
                  <bdi>{t.userId}</bdi>
                </span>
                <code className="px-2.5 py-1 rounded bg-[var(--muted)] text-xs font-mono break-all inline-block select-all">
                  {user.id}
                </code>
              </div>

              <div>
                <span className="text-xs text-[var(--muted-foreground)] block mb-1">
                  <bdi>{t.email}</bdi>
                </span>
                <p className="font-medium text-[var(--foreground)]">
                  <bdi>{user.email || '—'}</bdi>
                </p>
              </div>

              <div>
                <span className="text-xs text-[var(--muted-foreground)] block mb-1">
                  <bdi>{t.role}</bdi>
                </span>
                <p className="font-medium text-[var(--foreground)]">
                  <bdi>{user.role || '—'}</bdi>
                </p>
              </div>

              <div>
                <span className="text-xs text-[var(--muted-foreground)] block mb-1">
                  <bdi>{t.createdAt}</bdi>
                </span>
                <p className="font-medium text-[var(--foreground)]">
                  <bdi>{formatTimestamp(user.created_at)}</bdi>
                </p>
              </div>

              <div>
                <span className="text-xs text-[var(--muted-foreground)] block mb-1">
                  <bdi>{t.lastSignIn}</bdi>
                </span>
                <p className="font-medium text-[var(--foreground)]">
                  <bdi>{formatTimestamp(user.last_sign_in_at)}</bdi>
                </p>
              </div>
            </div>
          </div>

          {/* Database Profile Card */}
          <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--muted-foreground)] pb-2 border-b border-[var(--border)]">
              <bdi>{t.profileSection}</bdi>
            </h3>

            <div className="space-y-4 text-sm">
              <div>
                <span className="text-xs text-[var(--muted-foreground)] block mb-1">
                  <bdi>{t.fullName}</bdi>
                </span>
                <p className="font-medium text-[var(--foreground)]">
                  <bdi>
                    {profile?.full_name ||
                      (typeof userMeta?.full_name === 'string' ? userMeta.full_name : null) ||
                      '—'}
                  </bdi>
                </p>
              </div>

              <div>
                <span className="text-xs text-[var(--muted-foreground)] block mb-1">
                  <bdi>{t.username}</bdi>
                </span>
                <p className="font-medium text-[var(--foreground)]">
                  <bdi>
                    {profile?.username ||
                      (typeof userMeta?.username === 'string' ? userMeta.username : null) ||
                      '—'}
                  </bdi>
                </p>
              </div>

              <div>
                <span className="text-xs text-[var(--muted-foreground)] block mb-1">
                  <bdi>{t.phone}</bdi>
                </span>
                <p className="font-medium text-[var(--foreground)]">
                  <bdi>{user.phone || profile?.phone || '—'}</bdi>
                </p>
              </div>

              <div>
                <span className="text-xs text-[var(--muted-foreground)] block mb-1">
                  <bdi>{t.secondaryNumber}</bdi>
                </span>
                <p className="font-medium text-[var(--foreground)]">
                  <bdi>{profile?.secondary_number || '—'}</bdi>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}