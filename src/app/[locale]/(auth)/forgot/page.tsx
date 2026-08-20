import { setRequestLocale } from 'next-intl/server';
import { ForgotScreen } from '@/components/auth/ForgotScreen';

export default async function ForgotPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="min-h-[100dvh] w-full flex flex-col items-center justify-center">
      <ForgotScreen />
    </main>
  );
}
