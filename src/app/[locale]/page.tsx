import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("common");

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-4 border border-border/40 p-8 rounded-2xl shadow-sm bg-card">
        <h1 className="text-3xl font-bold tracking-tight">
          <bdi>{t("title")}</bdi>
        </h1>
        <p className="text-muted-foreground text-sm font-medium">
          <bdi>{t("welcome")}</bdi>
        </p>
        <div className="pt-4 text-xs space-y-2 border-t border-border/30 text-muted-foreground">
          <p><bdi>{t("systemTheme")}</bdi></p>
          <p><bdi>{t("deviceLanguage")}</bdi> ({t("direction")})</p>
        </div>
      </div>
    </main>
  );
}