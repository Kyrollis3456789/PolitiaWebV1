import { setRequestLocale } from 'next-intl/server';
import { VerifyView } from '@/components/auth-flow/VerifyView';

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="min-h-[100dvh] w-full flex flex-col items-center justify-center">
      <VerifyView />
    </main>
  );
}
