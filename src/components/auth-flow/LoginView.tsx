'use client';

import React from 'react';
import { useRouter } from '@/i18n/routing';
import { LoginScreen } from './LoginScreen';

export function LoginView() {
  const router = useRouter();

  return (
    <LoginScreen
      onNavigateRegister={() => router.push('/register')}
    />
  );
}
