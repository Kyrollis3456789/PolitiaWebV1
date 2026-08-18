'use client';

import React from 'react';
import { useRouter } from '@/i18n/routing';
import { RegisterScreen } from './RegisterScreen';

export function RegisterView() {
  const router = useRouter();

  return (
    <RegisterScreen
      onNavigateLogin={() => router.push('/login')}
    />
  );
}
