'use client';

import React from 'react';
import { useRouter } from '@/i18n/routing';
import { LoginScreen } from './LoginScreen';

export function LoginView() {
  const router = useRouter();

  return (
    <div className="w-full min-h-screen">
      <LoginScreen
        onNavigateRegister={() => router.push('/register')}
        onNavigateVerify={() => router.push('/verify')}
      />
    </div>
  );
}
