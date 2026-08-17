import { setRequestLocale } from 'next-intl/server';
import { RegisterView } from '@/components/auth-flow/RegisterView';

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
