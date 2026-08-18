import { setRequestLocale } from 'next-intl/server';
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

  return <SplashScreen />;
}
