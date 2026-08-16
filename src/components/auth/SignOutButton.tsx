'use client';

import React, { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { useLocale } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { isRtlLocale } from '@/i18n/locales';

export function SignOutButton() {
  const router = useRouter();
  const locale = useLocale();
  const isRtl = isRtlLocale(locale);
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Sign out error:', err);
      setLoading(false);
    }
  };

  const label = isRtl ? 'تسجيل الخروج' : 'Sign Out';

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className="px-4 py-2 rounded-xl text-xs font-semibold border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:bg-red-500/10 hover:text-red-600 hover:border-red-500/30 active:scale-95 transition disabled:opacity-50 cursor-pointer flex items-center gap-2"
    >
      {loading ? (
        <span>...</span>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span><bdi>{label}</bdi></span>
        </>
      )}
    </button>
  );
}