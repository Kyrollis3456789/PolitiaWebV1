import { setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { SplashScreen } from '@/components/splash/SplashScreen';
import { routing } from '@/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Check if session exists to show personalized greeting or dashboard shortcut
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <SplashScreen userEmail={user?.email} />;
}

