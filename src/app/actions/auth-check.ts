'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export interface AccountCheckResult {
  exists: boolean;
  resolvedEmail?: string;
  displayName?: string;
  error?: string;
}

function getSupabaseClient() {
  try {
    return createAdminClient();
  } catch {
    return null;
  }
}

/**
 * Checks whether an English full name already exists in the profiles database (case-insensitive).
 */
export async function checkEnglishNameCollision(name: string): Promise<boolean> {
  const trimmed = name.trim();
  if (!trimmed) return false;

  try {
    const admin = getSupabaseClient();
    const supabase = admin || (await createClient());
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .ilike('full_name_en', trimmed)
      .limit(1);

    if (error) {
      return false;
    }

    return (data && data.length > 0) || false;
  } catch {
    return false;
  }
}

/**
 * Checks on the server whether an account exists with the given email, phone, username, or national ID before proceeding to password.
 * Returns exists: false and triggers an error if no account matches.
 */
export async function checkUserAccountExists(identifier: string): Promise<AccountCheckResult> {
  const trimmed = identifier.trim();
  if (!trimmed) {
    return { exists: false, error: 'empty' };
  }

  try {
    const admin = getSupabaseClient();
    const supabase = admin || (await createClient());

    // 1. Check if identifier is an email
    if (trimmed.includes('@')) {
      // 1.1 Check profiles table first
      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, primary_email, full_name_en, full_name_ar')
          .ilike('primary_email', trimmed)
          .limit(1);

        if (profileData && profileData.length > 0) {
          return {
            exists: true,
            resolvedEmail: profileData[0].primary_email || trimmed,
            displayName: profileData[0].full_name_en || profileData[0].full_name_ar || undefined,
          };
        }
      } catch (e) {
        console.warn('profiles primary_email lookup warning:', e);
      }

      // 1.2 Check user_emails table
      try {
        const { data: emailData, error: emailError } = await supabase
          .from('user_emails')
          .select('user_id, email')
          .ilike('email', trimmed)
          .limit(1);

        if (!emailError && emailData && emailData.length > 0) {
          return {
            exists: true,
            resolvedEmail: emailData[0].email,
          };
        }
      } catch (e) {
        console.warn('user_emails lookup warning:', e);
      }

      // 1.3 Check auth.admin users if admin client is available
      if (admin) {
        try {
          const { data: authUsers } = await admin.auth.admin.listUsers();
          const matchedUser = authUsers?.users?.find(
            (u) => u.email?.toLowerCase() === trimmed.toLowerCase()
          );
          if (matchedUser) {
            return {
              exists: true,
              resolvedEmail: matchedUser.email || trimmed,
              displayName:
                matchedUser.user_metadata?.english_full_name ||
                matchedUser.user_metadata?.arabic_full_name,
            };
          }
        } catch (adminErr) {
          console.warn('Auth admin listUsers warning:', adminErr);
        }
      }

      // If email has standard format, allow proceeding to password entry for Supabase Auth to verify
      const isValidEmailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
      if (isValidEmailFormat) {
        return { exists: true, resolvedEmail: trimmed };
      }

      return { exists: false, error: 'notFound' };
    }

    // 2. Check if identifier is a phone number or national ID
    const cleanPhone = trimmed.replace(/[\s\-\(\)]/g, '');
    const isPhoneCandidate = /^\+?\d{6,15}$/.test(cleanPhone);

    if (isPhoneCandidate) {
      // 2.0 Check profiles table first by primary_phone
      try {
        const { data: profilePhoneData } = await supabase
          .from('profiles')
          .select('id, primary_email, primary_phone, full_name_en, full_name_ar')
          .eq('primary_phone', cleanPhone)
          .limit(1);

        if (profilePhoneData && profilePhoneData.length > 0) {
          return {
            exists: true,
            resolvedEmail: profilePhoneData[0].primary_email || `${cleanPhone}@politia.internal`,
            displayName:
              profilePhoneData[0].full_name_en || profilePhoneData[0].full_name_ar || undefined,
          };
        }
      } catch (e) {
        console.warn('profiles primary_phone lookup warning:', e);
      }

      // 2.1 Check user_phones table
      try {
        const { data: phoneData } = await supabase
          .from('user_phones')
          .select('user_id, phone_number')
          .or(`phone_number.eq.${cleanPhone},phone_number.ilike.%${cleanPhone}%`)
          .limit(1);

        if (phoneData && phoneData.length > 0) {
          const userId = phoneData[0].user_id;
          const { data: userEmailData } = await supabase
            .from('user_emails')
            .select('email')
            .eq('user_id', userId)
            .order('is_primary', { ascending: false })
            .limit(1);

          return {
            exists: true,
            resolvedEmail: userEmailData?.[0]?.email || trimmed,
          };
        }
      } catch (e) {
        console.warn('user_phones lookup warning:', e);
      }

      // 2.2 Check in profiles by national_id
      try {
        const { data: nationalIdData } = await supabase
          .from('profiles')
          .select('id, primary_email, full_name_en, full_name_ar')
          .eq('national_id', cleanPhone)
          .limit(1);

        if (nationalIdData && nationalIdData.length > 0) {
          return {
            exists: true,
            resolvedEmail: nationalIdData[0].primary_email || `${cleanPhone}@politia.internal`,
            displayName:
              nationalIdData[0].full_name_en || nationalIdData[0].full_name_ar,
          };
        }
      } catch (e) {
        console.warn('profiles national_id lookup warning:', e);
      }

      // 2.3 Check auth admin user metadata for primary_phone / national_id
      if (admin) {
        try {
          const { data: authUsers } = await admin.auth.admin.listUsers();
          const matchedUser = authUsers?.users?.find(
            (u) =>
              u.user_metadata?.primary_phone === cleanPhone ||
              u.user_metadata?.national_id === cleanPhone
          );
          if (matchedUser) {
            return {
              exists: true,
              resolvedEmail: matchedUser.email,
              displayName:
                matchedUser.user_metadata?.english_full_name ||
                matchedUser.user_metadata?.arabic_full_name,
            };
          }
        } catch (adminErr) {
          console.warn('Auth admin listUsers warning:', adminErr);
        }
      }
    }

    // 3. Check by username or full name in profiles
    try {
      const { data: nameData } = await supabase
        .from('profiles')
        .select('id, primary_email, full_name_en, full_name_ar')
        .or(`full_name_en.ilike.${trimmed},full_name_ar.ilike.${trimmed}`)
        .limit(1);

      if (nameData && nameData.length > 0) {
        return {
          exists: true,
          resolvedEmail: nameData[0].primary_email || trimmed,
          displayName: nameData[0].full_name_en || nameData[0].full_name_ar,
        };
      }
    } catch (e) {
      console.warn('profiles name lookup warning:', e);
    }

    // 4. Check auth admin user metadata for name
    if (admin) {
      try {
        const { data: authUsers } = await admin.auth.admin.listUsers();
        const matchedUser = authUsers?.users?.find((u) => {
          const eng = u.user_metadata?.english_full_name?.toLowerCase();
          const arb = u.user_metadata?.arabic_full_name?.toLowerCase();
          const t = trimmed.toLowerCase();
          return eng === t || arb === t;
        });
        if (matchedUser) {
          return {
            exists: true,
            resolvedEmail: matchedUser.email,
            displayName:
              matchedUser.user_metadata?.english_full_name ||
              matchedUser.user_metadata?.arabic_full_name,
          };
        }
      } catch (adminErr) {
        console.warn('Auth admin listUsers warning:', adminErr);
      }
    }

    // If nothing matched, account is NOT found -> return exists: false
    return { exists: false, error: 'notFound' };
  } catch (err) {
    console.error('Error checking user account on server:', err);
    return { exists: false, error: 'notFound' };
  }
}

/**
 * Sends a one-time passcode (OTP) to the user's email address for account recovery.
 */
export async function sendRecoveryEmailOtp(
  email: string
): Promise<{ success: boolean; error?: string }> {
  const trimmed = email.trim();
  if (!trimmed) {
    return { success: false, error: 'Email address is required.' };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: {
        shouldCreateUser: false,
      },
    });

    if (error) {
      console.warn('Supabase signInWithOtp notice:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Error sending OTP:', err);
    return { success: false, error: err.message || 'Failed to send OTP.' };
  }
}

/**
 * Verifies the 6-digit OTP code entered by the user.
 */
export async function verifyRecoveryEmailOtp(
  email: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  const cleanEmail = email.trim();
  const cleanToken = token.trim();

  if (!cleanEmail || !cleanToken) {
    return { success: false, error: 'Email and code are required.' };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.verifyOtp({
      email: cleanEmail,
      token: cleanToken,
      type: 'email',
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Verification failed.' };
  }
}