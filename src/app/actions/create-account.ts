'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { validateEnglishName, validateArabicName } from '@/lib/validation/name-rules';
import { validateEgyptianNationalId } from '@/lib/validation/national-id';
import { GenderType, SocialPlatform, FamilyMemberEntry } from '@/types/database.types';

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
  // Step 3: Relations
  maritalStatus?: string;
  guardianName?: string;
  guardianPhone?: string;
  familyRelationType?: string;
  familyMembers?: FamilyMemberEntry[];
  // Step 4: Education & Work
  education_path?: string | null;
  school_stage?: string | null;
  education_system?: string | null;
  grade_level?: string | null;
  school_name?: string | null;
  university_id?: string | null;
  faculty_id?: string | null;
  academic_year?: string | null;
  is_working?: boolean | null;
  job_title?: string | null;
  company_name?: string | null;
  is_postgrad?: boolean;
  postgrad_details?: string | null;
  // Step 5: Locations
  governorate?: string;
  city?: string;
  streetAddress?: string;
  buildingNumber?: string;
  floorNumber?: string;
  apartmentNumber?: string;
  secondaryAddress?: string;
  // Step 6: Church Commitment
  diocese?: string;
  primaryChurch?: string;
  secondaryChurch?: string;
  priestName?: string;
  // Step 7: Additional Info
  hobbies?: string[];
  languages?: string[];
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

    // Calculate age for age-gated validations
    const birthDate = new Date(payload.dob);
    const today = new Date();
    let userAge = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      userAge--;
    }

    if (userAge >= 16) {
      const nidValidation = validateEgyptianNationalId(
        payload.nationalId,
        payload.dob,
        payload.gender
      );
      if (!nidValidation.isValid) {
        return { success: false, error: nidValidation.error || 'Invalid National ID.' };
      }
    } else if (payload.nationalId?.trim()) {
      const nidValidation = validateEgyptianNationalId(
        payload.nationalId,
        payload.dob,
        payload.gender
      );
      if (!nidValidation.isValid) {
        return { success: false, error: nidValidation.error || 'Invalid National ID.' };
      }
    }

    const validPhones = payload.phones.filter((p) => p.number.trim().length >= 7);
    if (userAge >= 13 && validPhones.length === 0) {
      return { success: false, error: 'At least one valid phone number is required.' };
    }

    const supabase = await createClient();

    // 2. Resolve or generate authentication credentials
    const primaryEmail =
      payload.emails.find((e) => e.isPrimary && e.email.trim())?.email.trim() ||
      `${payload.nationalId || `user_${Date.now()}`}@politia.internal`;

    const accountPassword = payload.password || `Politia#${(payload.nationalId || '123456').slice(-6)}`;

    // 3. Create Auth User via Admin Client (or standard client fallback)
    let authUser: any = null;
    let authError: any = null;

    try {
      const adminClient = createAdminClient();
      if (adminClient) {
        const { data: adminAuthData, error: adminAuthError } = await adminClient.auth.admin.createUser({
          email: primaryEmail,
          password: accountPassword,
          email_confirm: true,
          user_metadata: {
            full_name_en: payload.englishName,
            full_name_ar: payload.arabicName,
          },
        });
        authUser = adminAuthData?.user;
        authError = adminAuthError;
      }
    } catch {
      // Fallback to client signup
      const { data: clientAuthData, error: clientAuthError } = await supabase.auth.signUp({
        email: primaryEmail,
        password: accountPassword,
        options: {
          data: {
            full_name_en: payload.englishName,
            full_name_ar: payload.arabicName,
          },
        },
      });
      authUser = clientAuthData?.user;
      authError = clientAuthError;
    }

    if (authError && !authUser) {
      return { success: false, error: authError.message || 'Failed to create auth user account.' };
    }

    const userId = authUser?.id || `usr_${Date.now()}`;

    // 4. Upload Avatar if provided
    let avatarUrl: string | null = null;
    if (payload.avatarBase64) {
      try {
        const base64Data = payload.avatarBase64.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        const fileName = `${userId}/${Date.now()}_avatar.jpg`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, buffer, {
            contentType: 'image/jpeg',
            upsert: true,
          });

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);
          avatarUrl = publicUrlData.publicUrl;
        }
      } catch (uploadErr) {
        console.warn('Avatar upload warning (non-fatal):', uploadErr);
      }
    }

    // 5. Compute photo grace period timestamp
    const photoGracePeriodUntil = payload.photoSkippedGracePeriod
      ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      : null;

    // Helper to extract clean handle from url
    const extractHandle = (url?: string | null): string | null => {
      if (!url) return null;
      const clean = url.trim().replace(/^https?:\/\/(www\.)?(facebook|instagram|tiktok|twitter|x)\.com\//i, '').replace(/^[@\/]+|\/$/g, '');
      return clean || null;
    };

    // 6. Insert Profile
    try {
      let db = supabase;
      try {
        const admin = createAdminClient();
        if (admin) db = admin;
      } catch (adminErr) {
        console.warn('Admin client init note, using user supabase client:', adminErr);
      }

      const primaryPhoneStr = validPhones.length > 0 ? `${validPhones[0].countryCode}${validPhones[0].number}` : null;

      const { error: profileError } = await db.from('profiles').upsert({
        id: userId,
        full_name_en: payload.englishName,
        full_name_ar: payload.arabicName,
        date_of_birth: payload.dob,
        gender: payload.gender,
        national_id: payload.nationalId || null,
        birth_province_code: payload.governorate || null,
        avatar_url: avatarUrl,
        avatar_skipped_at: photoGracePeriodUntil,
        landline_phone: payload.landlineNumber || null,
        // Contact & Social
        primary_email: primaryEmail,
        primary_phone: primaryPhoneStr,
        phone: primaryPhoneStr,
        email: primaryEmail,
        facebook_url: payload.socials?.facebook?.url || null,
        instagram_url: payload.socials?.instagram?.url || null,
        linkedin_url: payload.socials?.linkedin?.url || null,
        facebook_handle: extractHandle(payload.socials?.facebook?.url),
        instagram_handle: extractHandle(payload.socials?.instagram?.url),
        tiktok_handle: extractHandle(payload.socials?.tiktok?.url),
        x_handle: extractHandle(payload.socials?.x?.url),
        // Family Relations
        marital_status: payload.maritalStatus || null,
        guardian_name: payload.guardianName || null,
        guardian_phone: payload.guardianPhone || null,
        // Education & Work
        education_path: payload.education_path || null,
        school_stage: payload.school_stage || null,
        education_system: payload.education_system || null,
        grade_level: payload.grade_level || null,
        school_name: payload.school_name || null,
        university_id: payload.university_id || null,
        faculty_id: payload.faculty_id || null,
        academic_year: payload.academic_year || null,
        is_working: payload.is_working !== undefined ? payload.is_working : null,
        job_title: payload.job_title || null,
        company_name: payload.company_name || null,
        is_postgrad: payload.is_postgrad || false,
        postgrad_details: payload.postgrad_details || null,
        // Locations & Addresses
        address_governorate: payload.governorate || null,
        address_city: payload.city || null,
        address_street: payload.streetAddress || null,
        address_building: payload.buildingNumber || null,
        address_floor: payload.floorNumber || null,
        address_apartment: payload.apartmentNumber || null,
        secondary_address: payload.secondaryAddress || null,
        // Church Commitment
        diocese: payload.diocese || null,
        primary_church: payload.primaryChurch || null,
        secondary_church: payload.secondaryChurch || null,
        priest_name: payload.priestName || null,
        // Additional Info
        hobbies: payload.hobbies || [],
        languages: payload.languages || [],
      });

      if (profileError) {
        console.warn('Profile upsert warning:', profileError);
      }

      // Persist all phones into user_phones
      if (validPhones.length > 0) {
        const phoneInserts = validPhones.map((p, idx) => ({
          user_id: userId,
          phone: `${p.countryCode}${p.number}`,
          is_primary: idx === 0,
          is_verified: true,
        }));
        await db.from('user_phones').upsert(phoneInserts, { onConflict: 'phone' });
      }

      // Persist all emails into user_emails
      const validEmails = (payload.emails || []).filter((e) => e.email && e.email.includes('@'));
      if (validEmails.length > 0) {
        const emailInserts = validEmails.map((e, idx) => ({
          user_id: userId,
          email: e.email.trim().toLowerCase(),
          is_primary: idx === 0,
          is_verified: true,
        }));
        await db.from('user_emails').upsert(emailInserts, { onConflict: 'email' });
      }

      // Persist modular social links to user_social_links table
      if (payload.socials) {
        const socialEntries = Object.entries(payload.socials)
          .filter(([_, data]) => Boolean(data?.url?.trim()))
          .map(([platform, data]) => ({
            user_id: userId,
            platform: platform as SocialPlatform,
            profile_url: data.url.trim(),
            display_name: data.displayName || null,
            avatar_url: data.avatarUrl || null,
          }));

        if (socialEntries.length > 0) {
          const { error: socialError } = await db
            .from('user_social_links')
            .upsert(socialEntries);
          if (socialError) {
            console.warn('Social links upsert note:', socialError);
          }
        }
      }

      // Persist family relations to user_family_relations table
      if (payload.familyMembers && payload.familyMembers.length > 0) {
        const familyEntries = payload.familyMembers
          .filter((m) => Boolean(m.isDeceased || m.memberId || m.phone?.trim() || m.fullName?.trim()))
          .map((m) => ({
            user_id: userId,
            relation: m.relation,
            related_member_id: m.memberId || null,
            full_name: m.fullName || null,
            phone_number: m.phone ? `${m.countryCode || '+20'}${m.phone.replace(/[^\d]/g, '')}` : null,
            is_deceased: Boolean(m.isDeceased),
            link_status: m.linkStatus || (m.memberId ? 'auto_approved' : 'pending_review'),
            verification_method: m.verificationMethod || (m.memberId ? 'heuristic_name_match' : 'manual_phone'),
            requires_audit_notice: Boolean(m.requiresAuditNotice ?? Boolean(m.memberId)),
          }));

        if (familyEntries.length > 0) {
          const { error: familyError } = await db
            .from('user_family_relations')
            .upsert(familyEntries);
          if (familyError) {
            console.warn('Family relations upsert note:', familyError);
          }
        }
      }
    } catch (profileErr) {
      console.warn('Profile insertion note:', profileErr);
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