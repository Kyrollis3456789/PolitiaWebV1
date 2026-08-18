import { setRequestLocale } from 'next-intl/server';
import { RegisterView } from '@/components/auth-flow/RegisterView';
import { routing } from '@/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="min-h-[100dvh] w-full flex flex-col items-center justify-center">
      <RegisterView />
    </main>
  );
}

