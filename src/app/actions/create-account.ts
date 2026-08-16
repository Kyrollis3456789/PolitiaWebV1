'use server';

import { createClient } from '@/lib/supabase/server';
import { validateEnglishName, validateArabicName } from '@/lib/validation/name-rules';
import { validateEgyptianNationalId } from '@/lib/validation/national-id';
import { GenderType, SocialPlatform } from '@/types/database.types';

export interface CreateAccountPayload {
  englishName: string;
  hasNameCollision: boolean;
  arabicName: string;
  dob: string;
  gender: GenderType;
  nationalId: string;
  avatarBase64?: string | null;
  avatarFileName?: string | null;
  photoSkippedGracePeriod?: boolean;
  phones: { countryCode: string; number: string; isPrimary: boolean }[];
  emails: { email: string; isPrimary: boolean }[];
  landlineAreaCode?: string;
  landlineNumber?: string;
  socials: Record<SocialPlatform, { url: string; displayName?: string; avatarUrl?: string }>;
  password?: string;
}

export interface ActionResponse {
  success: boolean;
  error?: string;
  userId?: string;
}

export async function createAccountAction(payload: CreateAccountPayload): Promise<ActionResponse> {
  try {
    // 1. Server-side validation guards
    const engValidation = validateEnglishName(payload.englishName, payload.hasNameCollision);
    if (!engValidation.isValid) {
      return { success: false, error: engValidation.error || 'Invalid English name.' };
    }

    const arValidation = validateArabicName(
      payload.arabicName,
      payload.hasNameCollision ? 5 : 4
    );
    if (!arValidation.isValid) {
      return { success: false, error: arValidation.error || 'Invalid Arabic name.' };
    }

    if (!payload.dob) {
      return { success: false, error: 'Date of birth is required.' };
    }

    if (!payload.gender) {
      return { success: false, error: 'Gender is mandatory.' };
    }

    const nidValidation = validateEgyptianNationalId(
      payload.nationalId,
      payload.dob,
      payload.gender
    );
    if (!nidValidation.isValid) {
      return { success: false, error: nidValidation.error || 'Invalid National ID.' };
    }

    const validPhones = payload.phones.filter((p) => p.number.trim().length >= 7);
    if (validPhones.length === 0) {
      return { success: false, error: 'At least one valid phone number is required.' };
    }

    const supabase = await createClient();

    // 2. Resolve or generate authentication credentials
    const primaryEmail =
      payload.emails.find((e) => e.isPrimary && e.email.trim())?.email.trim() ||
      `${payload.nationalId}@politia.internal`;

    const accountPassword = payload.password || `Politia#${payload.nationalId.slice(-6)}`;

    // 3. Register user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: primaryEmail,
      password: accountPassword,
      options: {
        data: {
          english_full_name: payload.englishName,
          arabic_full_name: payload.arabicName,
          national_id: payload.nationalId,
          primary_phone: `${validPhones[0].countryCode}${validPhones[0].number}`,
        },
      },
    });

    if (authError || !authData.user) {
      return {
        success: false,
        error: authError?.message || 'Failed to initialize Supabase Auth user.',
      };
    }

    const userId = authData.user.id;

    // 4. Handle Avatar Storage Upload
    let avatarUrl: string | null = null;
    let photoGracePeriodUntil: string | null = null;

    if (payload.avatarBase64 && payload.avatarFileName) {
      try {
        const buffer = Buffer.from(payload.avatarBase64.split(',')[1] || payload.avatarBase64, 'base64');
        const fileExt = payload.avatarFileName.split('.').pop() || 'jpg';
        const storagePath = `${userId}/${Date.now()}-avatar.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(storagePath, buffer, {
            contentType: `image/${fileExt}`,
            upsert: true,
          });

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(storagePath);
          avatarUrl = publicUrlData.publicUrl;
        }
      } catch (storageErr) {
        console.error('Avatar storage upload warning:', storageErr);
      }
    } else if (payload.photoSkippedGracePeriod) {
      photoGracePeriodUntil = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    }

    // 5. Build Landline format
    const landlineNumber =
      payload.landlineAreaCode && payload.landlineNumber
        ? `${payload.landlineAreaCode} ${payload.landlineNumber}`.trim()
        : null;

    // 6. Insert Profile
    try {
      await supabase.from('profiles').upsert({
        id: userId,
        english_full_name: payload.englishName,
        arabic_full_name: payload.arabicName,
        date_of_birth: payload.dob,
        gender: payload.gender,
        national_id: payload.nationalId,
        avatar_url: avatarUrl,
        photo_grace_period_until: photoGracePeriodUntil,
        landline_number: landlineNumber,
      });
    } catch (profileErr) {
      console.warn('Profile insertion note:', profileErr);
    }

    // 7. Batch-Insert Phone Numbers
    const phoneRecords = validPhones.map((p, idx) => ({
      user_id: userId,
      phone_number: `${p.countryCode}${p.number.trim()}`,
      is_primary: idx === 0 || p.isPrimary,
      is_verified: false,
    }));

    if (phoneRecords.length > 0) {
      try {
        await supabase.from('user_phones').insert(phoneRecords);
      } catch (phoneErr) {
        console.warn('Phones insertion note:', phoneErr);
      }
    }

    // 8. Batch-Insert Emails
    const validEmails = payload.emails
      .filter((e) => e.email && e.email.trim().includes('@'))
      .map((e, idx) => ({
        user_id: userId,
        email: e.email.trim(),
        is_primary: idx === 0 || e.isPrimary,
        is_verified: false,
      }));

    if (validEmails.length > 0) {
      try {
        await supabase.from('user_emails').insert(validEmails);
      } catch (emailErr) {
        console.warn('Emails insertion note:', emailErr);
      }
    }

    // 9. Batch-Insert Social Links
    const socialRecords = Object.entries(payload.socials)
      .filter(([, data]) => data?.url && data.url.trim().length > 0)
      .map(([platform, data]) => ({
        user_id: userId,
        platform: platform as SocialPlatform,
        profile_url: data.url.trim(),
        display_name: data.displayName || null,
        avatar_url: data.avatarUrl || null,
      }));

    if (socialRecords.length > 0) {
      try {
        await supabase.from('user_social_links').insert(socialRecords);
      } catch (socialErr) {
        console.warn('Socials insertion note:', socialErr);
      }
    }

    return {
      success: true,
      userId,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'An unexpected error occurred during account creation.';
    return {
      success: false,
      error: msg,
    };
  }
}