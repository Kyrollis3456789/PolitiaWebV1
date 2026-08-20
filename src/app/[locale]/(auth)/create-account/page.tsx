import { setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from '@/i18n/routing';
import { RegisterView } from '@/components/auth/RegisterView';

export default async function CreateAccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // If user is already authenticated, redirect to dashboard
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect({ href: '/dashboard', locale });
  }

  return (
    <main className="min-h-[100dvh] w-full flex flex-col items-center justify-center">
      <RegisterView />
    </main>
  );
}