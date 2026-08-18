'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { isRtlLocale } from '@/i18n/locales';
import { createClient } from '@/lib/supabase/client';

export function SplashScreen() {
  const locale = useLocale();
  const router = useRouter();
  const isRtl = isRtlLocale(locale);

  const [isExiting, setIsExiting] = useState(false);
  const [targetPage, setTargetPage] = useState<string>('/login');

  const handleSkip = () => {
    setIsExiting(true);
    setTimeout(() => {
      router.push(targetPage);
    }, 300);
  };

  useEffect(() => {
    // Client-side session check (identical to At Church index.html auth check)
    try {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user) {
          setTargetPage('/dashboard');
        }
      });
    } catch (e) {}

    // Wait for 2.5 seconds to show the entrance animation and logo
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 2500);

    // Redirect right after the exit animation completes (3.3 seconds)
    const navTimer = setTimeout(() => {
      router.push(targetPage);
    }, 3300);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(navTimer);
    };
  }, [router, targetPage]);

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      onClick={handleSkip}
      className="flex h-screen w-screen items-center justify-center relative shared-bg select-none cursor-pointer overflow-hidden"
      id="splash-body"
    >
      <div
        className={`flex flex-col items-center justify-center logo-container ${
          isExiting ? 'exit-animation' : ''
        }`}
        id="splash-content"
      >
        <Image
          src="/logo.png"
          alt="At Church Logo"
          width={192}
          height={192}
          priority
          className="logo-icon h-48 w-48 object-contain mb-6 drop-shadow-2xl"
        />
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100 tracking-tight text-center">
          <bdi>At Church - Coptic Orthodox</bdi>
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-2 mb-8 tracking-widest uppercase font-medium text-center">
          <bdi>Anchored in Faith, Connected in Love</bdi>
        </p>
        <div className="spinner" />
      </div>
    </div>
  );
}
