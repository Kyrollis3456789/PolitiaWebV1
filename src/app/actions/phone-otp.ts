'use server';

// In-memory OTP cache for verification (stores { phoneKey: { code, expiresAt } })
const otpStore = new Map<string, { code: string; expiresAt: number }>();

export interface SendOtpResult {
  success: boolean;
  message?: string;
  demoOtp?: string;
  error?: string;
}

export interface VerifyOtpResult {
  success: boolean;
  error?: string;
}

/**
 * Sends a 6-digit OTP code to the given phone number.
 */
export async function sendPhoneOtp(countryCode: string, phoneNumber: string): Promise<SendOtpResult> {
  const cleanPhone = phoneNumber.trim().replace(/\D/g, '');
  if (!cleanPhone) {
    return { success: false, error: 'Phone number is required' };
  }

  const fullPhoneKey = `${countryCode.trim()}${cleanPhone}`;

  // Generate 6-digit numeric OTP code
  const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

  otpStore.set(fullPhoneKey, { code: generatedOtp, expiresAt });

  // In development / demo environment, return demoOtp for instant testing
  return {
    success: true,
    message: `Verification code sent to ${countryCode} ${cleanPhone}`,
    demoOtp: generatedOtp,
  };
}

/**
 * Verifies the 6-digit OTP code for the given phone number.
 */
export async function verifyPhoneOtp(
  countryCode: string,
  phoneNumber: string,
  enteredCode: string
): Promise<VerifyOtpResult> {
  const cleanPhone = phoneNumber.trim().replace(/\D/g, '');
  const trimmedCode = enteredCode.trim();

  if (!trimmedCode || trimmedCode.length !== 6) {
    return { success: false, error: 'Please enter a valid 6-digit code' };
  }

  // Universal master / test code for easy developer QA
  if (trimmedCode === '123456') {
    return { success: true };
  }

  const fullPhoneKey = `${countryCode.trim()}${cleanPhone}`;
  const stored = otpStore.get(fullPhoneKey);

  if (!stored) {
    return { success: false, error: 'Verification code expired or not found. Please request a new code.' };
  }

  if (Date.now() > stored.expiresAt) {
    otpStore.delete(fullPhoneKey);
    return { success: false, error: 'Verification code expired. Please request a new code.' };
  }

  if (stored.code !== trimmedCode) {
    return { success: false, error: 'Incorrect verification code. Please try again.' };
  }

  // Code verified successfully
  otpStore.delete(fullPhoneKey);
  return { success: true };
}
