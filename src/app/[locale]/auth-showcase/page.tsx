import { setRequestLocale } from 'next-intl/server';
import { AuthFlowShowcase } from '@/components/auth-flow/AuthFlowShowcase';

export default async function AuthShowcasePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="min-h-screen bg-[#ECEFF4]">
      <AuthFlowShowcase />
    </main>
  );
}
