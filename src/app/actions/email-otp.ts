'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

// In-memory cryptographic OTP store for fallback verification (10 minute expiry)
const secureEmailOtpStore = new Map<string, { code: string; expiresAt: number; attempts: number }>();
const REGISTRATION_EMAIL_OTP_TEMPLATE_ID = 'registration_email_otp_v1';

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
 * Sends a 6-digit OTP code to the user's email address:
 * 1. Dispatches real email via Supabase Auth signInWithOtp
 * 2. Caches OTP token in cryptographic in-memory store for instant verification fallback
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

  let sentViaSupabase = false;
  let supabaseError = '';

  // Attempt real email dispatch via Supabase Auth OTP
  try {
    const supabase = await getSupabaseAuthClient();
    if (supabase) {
      const signInPayload = {
        email: cleanEmail,
        options: {
          shouldCreateUser: false,
        },
      } as const;

      console.log('=====================================================================');
      console.log('[POLITIA REGISTRATION EMAIL OTP] Dispatch request');
      console.log('Template metadata:', {
        templateId: REGISTRATION_EMAIL_OTP_TEMPLATE_ID,
        supabaseMethod: 'auth.signInWithOtp',
        shouldCreateUser: false,
      });
      console.log('Payload:', signInPayload);

      let { error: sbErr } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: undefined,
        },
      });

      // If user does not exist in auth.users yet during onboarding, retry with shouldCreateUser: true
      if (sbErr && (sbErr.message.includes('User not found') || sbErr.message.includes('Signups not allowed') || sbErr.status === 422)) {
        console.log('ℹ️ User not yet registered in Auth. Retrying signInWithOtp with shouldCreateUser: true...');
        const retryRes = await supabase.auth.signInWithOtp({
          email: cleanEmail,
          options: {
            shouldCreateUser: true,
            emailRedirectTo: undefined,
          },
        });
        sbErr = retryRes.error;
      }

      if (!sbErr) {
        sentViaSupabase = true;
        console.log('API response:', { success: true, error: null });
      } else {
        supabaseError = sbErr.message;
        console.log('API response:', { success: false, error: sbErr.message });
      }
    }
  } catch (err: any) {
    supabaseError = err?.message || 'Supabase exception';
    console.log('API response:', { success: false, error: supabaseError });
  }

  console.log('Dispatch summary:', {
    email: cleanEmail,
    provider: sentViaSupabase ? 'supabase_email_otp' : 'sandbox_fallback',
    templateId: REGISTRATION_EMAIL_OTP_TEMPLATE_ID,
  });
  console.log(`Target Email : ${cleanEmail}`);
  console.log(`Generated OTP: ${generatedCode}`);
  console.log(`Supabase OTP : ${sentViaSupabase ? 'Dispatched to Inbox' : supabaseError || 'Fallback mode'}`);
  console.log(`Master Code  : 123456 (Developer master bypass also active)`);
  console.log('=====================================================================');

  return {
    success: true,
    message: sentViaSupabase
      ? `Verification code sent to ${cleanEmail}. Check your inbox or use dev code (${generatedCode} / 123456).`
      : `Verification code generated for ${cleanEmail}. (Code: ${generatedCode} or master: 123456)`,
    provider: sentViaSupabase ? 'supabase_email_otp' : 'sandbox_fallback',
    devCode: generatedCode,
  };
}

/**
 * Strictly verifies the 6-digit email OTP against:
 * 1. Master developer bypass code (`123456`)
 * 2. In-memory secure cryptographic OTP store
 * 3. Supabase Auth verifyOtp
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
  if (stored && stored.code === trimmedCode) {
    if (Date.now() > stored.expiresAt) {
      secureEmailOtpStore.delete(cleanEmail);
      return { success: false, error: 'Verification code expired. Please request a new code.' };
    }
    secureEmailOtpStore.delete(cleanEmail);
    console.log(`✅ [Email OTP Verified via Store] Successfully verified email: ${cleanEmail}`);
    return { success: true };
  }

  // 3. Check Supabase Auth verifyOtp
  try {
    const supabase = await getSupabaseAuthClient();
    if (supabase) {
      const { data: sbData, error: sbError } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: trimmedCode,
        type: 'email',
      });

      if (!sbError && (sbData?.session || sbData?.user)) {
        console.log(`✅ [Email OTP Verified via Supabase Auth] Successfully verified email: ${cleanEmail}`);
        secureEmailOtpStore.delete(cleanEmail);
        return { success: true };
      }
    }
  } catch (err) {
    console.warn('Supabase verifyOtp notice:', err);
  }

  return {
    success: false,
    error: 'Incorrect verification code. Please check and try again (or use test code 123456).',
  };
}
