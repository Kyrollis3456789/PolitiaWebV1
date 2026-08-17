'use client';

import React from 'react';
import { useRouter } from '@/i18n/routing';
import { RegisterScreen } from './RegisterScreen';
import { ThemeLanguageControls } from './ThemeLanguageControls';

export function RegisterView() {
  const router = useRouter();

  return (
    <div className="w-full min-h-[100dvh] bg-[#F4F6F9] dark:bg-[#0B0F19] sm:bg-[#E9EDF4] sm:dark:bg-[#070A10] flex flex-col items-center justify-center p-0 sm:p-6 md:p-10 transition-colors duration-300 relative">
      {/* Top Floating Controls */}
      <div className="absolute top-3 sm:top-5 right-3 sm:right-6 z-30">
        <ThemeLanguageControls />
      </div>

      <div className="w-full sm:max-w-md md:max-w-lg mt-12 sm:mt-0">
        <RegisterScreen
          onNavigateLogin={() => router.push('/login')}
          onNavigateVerify={() => router.push('/verify')}
        />
      </div>
    </div>
  );
}
