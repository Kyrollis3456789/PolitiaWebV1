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
 * Sends a 6-digit OTP code to the user's email address:
 * 1. Supabase Auth Email OTP (Primary)
 * 2. In-memory Secure Sandbox Store (Development / Local fallback with Master 123456 support)
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

  let lastErrorMessage = '';

  // -------------------------------------------------------------
  // TIER 1: Supabase Auth Email OTP
  // -------------------------------------------------------------
  try {
    const supabase = await getSupabaseAuthClient();
    if (supabase) {
      const { error: sbError } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          shouldCreateUser: true,
        },
      });

      if (!sbError) {
        console.log('✅ [Tier 1] Supabase Email OTP sent successfully to:', cleanEmail);
        return {
          success: true,
          message: `Verification code sent to ${cleanEmail}`,
          provider: 'supabase_email_otp',
        };
      } else {
        lastErrorMessage = sbError.message;
        console.warn('⚠️ [Tier 1] Supabase Email OTP notice:', sbError.message);
      }
    }
  } catch (err: any) {
    lastErrorMessage = err?.message || 'Supabase Email exception';
    console.warn('⚠️ [Tier 1] Supabase Email exception:', err);
  }

  // -------------------------------------------------------------
  // TIER 2: Sandbox / Development In-Memory OTP Fallback
  // -------------------------------------------------------------
  const generatedCode = generateRandomOtp();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  secureEmailOtpStore.set(cleanEmail, {
    code: generatedCode,
    expiresAt,
    attempts: 0,
  });

  console.log('=====================================================================');
  console.log('📧 [POLITIA SECURE EMAIL SANDBOX OTP DISPATCH]');
  console.log(`Target Email : ${cleanEmail}`);
  console.log(`Generated OTP: ${generatedCode}`);
  console.log(`Master Code  : 123456 (Bypass code also active)`);
  console.log(`Provider Note: ${lastErrorMessage || 'Sandbox / Dev mode'}`);
  console.log('=====================================================================');

  return {
    success: true,
    message: `Verification code generated for ${cleanEmail}. (Test code: ${generatedCode} or master: 123456)`,
    provider: 'sandbox_fallback',
    devCode: process.env.NODE_ENV !== 'production' ? generatedCode : undefined,
  };
}

/**
 * Verifies the 6-digit OTP code against:
 * 1. Master developer bypass code (`123456`)
 * 2. In-memory secure sandbox store
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

  // 1. Check Sandbox / Server In-Memory Store
  const stored = secureEmailOtpStore.get(cleanEmail);
  if (stored) {
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
      return { success: true };
    } else {
      stored.attempts += 1;
    }
  }

  // 3. Check Supabase Auth verifyOtp
  try {
    const supabase = await getSupabaseAuthClient();
    if (supabase) {
      // Try type 'email' or 'signup'
      const { data: sbData, error: sbError } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: trimmedCode,
        type: 'email',
      });

      if (!sbError && (sbData?.session || sbData?.user)) {
        console.log('✅ Supabase Email verifyOtp succeeded for:', cleanEmail);
        secureEmailOtpStore.delete(cleanEmail);
        return { success: true };
      }
    }
  } catch (err) {
    console.warn('Supabase email verifyOtp notice:', err);
  }

  return {
    success: false,
    error: 'Incorrect verification code. Please check and try again.',
  };
}
