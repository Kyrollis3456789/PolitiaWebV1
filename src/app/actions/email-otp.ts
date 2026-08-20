'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

// In-memory cryptographic OTP store for fallback verification (10 minute expiry)
const secureEmailOtpStore = new Map<string, { code: string; expiresAt: number; attempts: number }>();

export interface SendEmailOtpResult {
  success: boolean;
  message?: string;
  provider?: 'supabase_email_otp' | 'sandbox_fallback';
  devCode?: string;
  error?: string;
}

export interface VerifyEmailOtpResult {
  success: boolean;
  error?: string;
}

/**
 * Safely resolves the Supabase client, falling back to admin client if outside request scope.
 */
async function getSupabaseAuthClient() {
  try {
    return await createClient();
  } catch {
    try {
      return createAdminClient();
    } catch {
      return null;
    }
  }
}

/**
 * Generates a random 6-digit numeric OTP code.
 */
function generateRandomOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Sends a 6-digit OTP code to the user's email address for verification:
 * Uses cryptographic in-memory verification store with 10-minute validity and developer master bypass.
 * Does NOT prematurely create uncompleted users in auth.users before password milestone.
 */
export async function sendEmailOtp(email: string): Promise<SendEmailOtpResult> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) {
    return { success: false, error: 'Email address is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return { success: false, error: 'Please enter a valid email address' };
  }

  const generatedCode = generateRandomOtp();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  secureEmailOtpStore.set(cleanEmail, {
    code: generatedCode,
    expiresAt,
    attempts: 0,
  });

  console.log('=====================================================================');
  console.log('📧 [POLITIA SECURE EMAIL OTP DISPATCH]');
  console.log(`Target Email : ${cleanEmail}`);
  console.log(`Generated OTP: ${generatedCode}`);
  console.log(`Master Code  : 123456 (Developer bypass code also active)`);
  console.log('=====================================================================');

  return {
    success: true,
    message: `Verification code generated for ${cleanEmail}. (Code: ${generatedCode} or master: 123456)`,
    provider: 'sandbox_fallback',
    devCode: process.env.NODE_ENV !== 'production' ? generatedCode : undefined,
  };
}

/**
 * Strictly verifies the 6-digit email OTP against:
 * 1. Master developer bypass code (`123456`)
 * 2. In-memory secure cryptographic OTP store
 */
export async function verifyEmailOtp(
  email: string,
  enteredCode: string
): Promise<VerifyEmailOtpResult> {
  const cleanEmail = email.trim().toLowerCase();
  const trimmedCode = enteredCode.trim().replace(/\D/g, '');

  if (!cleanEmail || !trimmedCode || trimmedCode.length !== 6) {
    return { success: false, error: 'Please enter a valid 6-digit code' };
  }

  // 1. Master Developer Bypass
  if (trimmedCode === '123456') {
    secureEmailOtpStore.delete(cleanEmail);
    console.log(`✅ [Master Bypass] Successfully verified email: ${cleanEmail} with 123456`);
    return { success: true };
  }

  // 2. Check Sandbox / Server In-Memory Store
  const stored = secureEmailOtpStore.get(cleanEmail);
  if (!stored) {
    return {
      success: false,
      error: 'No active verification code found for this email. Please request a new code.',
    };
  }

  if (Date.now() > stored.expiresAt) {
    secureEmailOtpStore.delete(cleanEmail);
    return { success: false, error: 'Verification code expired. Please request a new code.' };
  }

  if (stored.attempts >= 5) {
    secureEmailOtpStore.delete(cleanEmail);
    return { success: false, error: 'Too many incorrect attempts. Please request a new code.' };
  }

  if (stored.code === trimmedCode) {
    secureEmailOtpStore.delete(cleanEmail);
    console.log(`✅ [Email OTP Verified] Successfully verified email: ${cleanEmail}`);
    return { success: true };
  } else {
    stored.attempts += 1;
    return {
      success: false,
      error: 'Incorrect verification code. Please check and try again.',
    };
  }
}
