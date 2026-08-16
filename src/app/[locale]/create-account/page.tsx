import { setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from '@/i18n/routing';
import { CreateAccountWizard } from '@/components/auth/CreateAccountWizard';

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
    <main className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center p-4 sm:p-8 py-12">
      <CreateAccountWizard />
    </main>
  );
}