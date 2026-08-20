'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

/**
 * Safely resolves the Supabase client, prioritizing admin service role for reliable directory searching.
 */
async function getSupabaseClient() {
  try {
    return createAdminClient();
  } catch {
    try {
      return await createClient();
    } catch {
      return null;
    }
  }
}

import type { SearchedMember } from '@/types/database.types';

export type { SearchedMember };

export interface MemberSearchFilter {
  gender?: 'Male' | 'Female';
  minAge?: number;
}

/**
 * Search members exclusively from the Supabase `profiles` database table by Name (English/Arabic) or Phone.
 */
export async function searchMembersAction(
  query: string,
  preferredGovernorate?: string,
  filter?: MemberSearchFilter
): Promise<{ success: boolean; members: SearchedMember[] }> {
  try {
    const rawTrimmed = query.trim();
    const qLower = rawTrimmed.toLowerCase();
    const cleanDigits = rawTrimmed.replace(/\D/g, '');
    const isPhoneSearch = cleanDigits.length >= 3;

    if (!rawTrimmed || (rawTrimmed.length < 2 && !isPhoneSearch)) {
      return { success: true, members: [] };
    }

    const supabase = await getSupabaseClient();
    if (!supabase) {
      return { success: false, members: [] };
    }

    let orConditions = `full_name_en.ilike.%${qLower}%,full_name_ar.ilike.%${rawTrimmed}%`;
    if (isPhoneSearch) {
      orConditions += `,primary_phone.ilike.%${cleanDigits}%,phone.ilike.%${cleanDigits}%`;
    }

    let dbQuery = supabase
      .from('profiles')
      .select('id, full_name_en, full_name_ar, avatar_url, address_governorate, governorate, primary_church, date_of_birth, birth_date, gender, primary_phone, phone')
      .or(orConditions);

    if (filter?.gender) {
      dbQuery = dbQuery.ilike('gender', filter.gender);
    }

    const { data: dbProfiles, error } = await dbQuery.limit(10);

    if (error || !dbProfiles) {
      console.warn('searchMembersAction database query notice:', error?.message);
      return { success: true, members: [] };
    }

    const mapped: SearchedMember[] = (dbProfiles as Array<{
      id: string;
      full_name_en: string;
      full_name_ar: string;
      avatar_url?: string | null;
      address_governorate?: string | null;
      governorate?: string | null;
      primary_church?: string | null;
      date_of_birth?: string | null;
      birth_date?: string | null;
      gender?: string | null;
      primary_phone?: string | null;
      phone?: string | null;
    }>)
      .map((p) => {
        let age: number | undefined;
        const dob = p.date_of_birth || p.birth_date;
        if (dob) {
          const b = new Date(dob);
          if (!isNaN(b.getTime())) {
            const now = new Date();
            age = now.getFullYear() - b.getFullYear();
          }
        }
        const gNormalized: 'Male' | 'Female' =
          p.gender?.toLowerCase() === 'female' ? 'Female' : 'Male';

        return {
          id: p.id,
          fullNameEn: p.full_name_en,
          fullNameAr: p.full_name_ar,
          avatarUrl: p.avatar_url,
          governorate: p.address_governorate || p.governorate,
          church: p.primary_church,
          phone: p.primary_phone || p.phone || null,
          age,
          gender: gNormalized,
        };
      })
      .filter((m) => {
        if (filter?.gender && m.gender !== filter.gender) return false;
        if (filter?.minAge !== undefined && m.age !== undefined && m.age < filter.minAge) return false;
        return true;
      });

    // Sort matching preferred governorate first
    if (preferredGovernorate) {
      mapped.sort((a, b) => {
        const aPref = a.governorate?.toLowerCase() === preferredGovernorate.toLowerCase() ? -1 : 1;
        const bPref = b.governorate?.toLowerCase() === preferredGovernorate.toLowerCase() ? -1 : 1;
        return aPref - bPref;
      });
    }

    return { success: true, members: mapped };
  } catch (err: unknown) {
    console.error('searchMembersAction error:', err);
    return { success: false, members: [] };
  }
}

export interface MemberFamilyGraphResult {
  success: boolean;
  spouse?: SearchedMember | null;
  children?: SearchedMember[];
}

/**
 * Resolves family graph relationships (spouse and children) directly from the database.
 */
export async function getMemberFamilyGraphAction(memberId: string): Promise<MemberFamilyGraphResult> {
  try {
    if (!memberId) return { success: false, children: [] };

    const supabase = await getSupabaseClient();
    if (!supabase) {
      return { success: false, children: [] };
    }

    // 1. Try Supabase Recursive Family Tree RPC if available
    try {
      const { data: treeRows, error: rpcError } = await supabase.rpc('get_user_full_family_tree', {
        target_user_id: memberId,
      });

      if (!rpcError && treeRows && treeRows.length > 0) {
        let spouse: SearchedMember | null = null;
        const children: SearchedMember[] = [];

        for (const row of treeRows as any[]) {
          let age: number | undefined;
          const dob = row.date_of_birth || row.birth_date;
          if (dob) {
            const b = new Date(dob);
            if (!isNaN(b.getTime())) {
              const now = new Date();
              age = now.getFullYear() - b.getFullYear();
            }
          }

          const memberObj: SearchedMember = {
            id: row.relative_id || row.id,
            fullNameEn: row.full_name_en,
            fullNameAr: row.full_name_ar,
            avatarUrl: row.avatar_url,
            governorate: row.address_governorate || row.governorate,
            church: row.primary_church,
            age,
            phone: row.primary_phone || row.phone,
            gender: row.gender?.toLowerCase() === 'female' ? 'Female' : 'Male',
          };

          if (row.relation_type === 'spouse' || row.relation === 'spouse') {
            spouse = memberObj;
          } else if (row.relation_type === 'child' || row.relation === 'child' || row.relation === 'son' || row.relation === 'daughter') {
            children.push(memberObj);
          }
        }

        return { success: true, spouse, children };
      }
    } catch (rpcErr) {
      console.warn('RPC family tree lookup warning:', rpcErr);
    }

    // 2. Query user_family_relations and profiles tables directly
    try {
      const { data: relations } = await supabase
        .from('user_family_relations')
        .select('relation, related_member_id')
        .eq('user_id', memberId);

      if (relations && relations.length > 0) {
        const relatedIds = relations
          .map((r) => r.related_member_id)
          .filter((id): id is string => Boolean(id));

        if (relatedIds.length > 0) {
          const { data: relatedProfiles } = await supabase
            .from('profiles')
            .select('id, full_name_en, full_name_ar, avatar_url, address_governorate, governorate, primary_church, date_of_birth, birth_date, gender, primary_phone, phone')
            .in('id', relatedIds);

          if (relatedProfiles && relatedProfiles.length > 0) {
            let spouse: SearchedMember | null = null;
            const children: SearchedMember[] = [];

            const profileMap = new Map(relatedProfiles.map((p) => [p.id, p]));

            for (const rel of relations) {
              if (!rel.related_member_id) continue;
              const p = profileMap.get(rel.related_member_id);
              if (!p) continue;

              let age: number | undefined;
              const dob = p.date_of_birth || p.birth_date;
              if (dob) {
                const b = new Date(dob);
                if (!isNaN(b.getTime())) {
                  const now = new Date();
                  age = now.getFullYear() - b.getFullYear();
                }
              }

              const memberObj: SearchedMember = {
                id: p.id,
                fullNameEn: p.full_name_en,
                fullNameAr: p.full_name_ar,
                avatarUrl: p.avatar_url,
                governorate: p.address_governorate || p.governorate,
                church: p.primary_church,
                age,
                phone: p.primary_phone || p.phone,
                gender: p.gender?.toLowerCase() === 'female' ? 'Female' : 'Male',
              };

              if (rel.relation === 'spouse') {
                spouse = memberObj;
              } else if (rel.relation === 'son' || rel.relation === 'daughter') {
                children.push(memberObj);
              }
            }

            return { success: true, spouse, children };
          }
        }
      }
    } catch (relErr) {
      console.warn('user_family_relations lookup warning:', relErr);
    }

    return { success: true, spouse: null, children: [] };
  } catch (err: unknown) {
    console.error('getMemberFamilyGraphAction error:', err);
    return { success: false, children: [] };
  }
}

/**
 * Searches for a registered member by verified phone number directly in Supabase.
 */
export async function findMemberByPhoneAction(
  countryCode: string,
  rawPhone: string
): Promise<{ success: boolean; member: SearchedMember | null }> {
  try {
    if (!rawPhone || rawPhone.trim().length < 8) {
      return { success: true, member: null };
    }

    const cleanDigits = rawPhone.replace(/\D/g, '');
    const cleanCC = countryCode.startsWith('+') ? countryCode : `+${countryCode}`;
    const fullE164 = cleanDigits.startsWith(cleanCC.replace('+', ''))
      ? `+${cleanDigits}`
      : `${cleanCC}${cleanDigits.replace(/^0+/, '')}`;
    const localWithZero = `0${cleanDigits.replace(/^0+/, '')}`;

    const supabase = await getSupabaseClient();
    if (!supabase) {
      return { success: false, member: null };
    }

    // 1. Query profiles table by primary_phone / phone
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name_en, full_name_ar, avatar_url, address_governorate, governorate, primary_church, date_of_birth, birth_date, gender, primary_phone, phone')
      .or(`primary_phone.eq.${fullE164},primary_phone.eq.${cleanDigits},primary_phone.eq.${localWithZero},phone.eq.${fullE164},phone.eq.${cleanDigits},phone.eq.${localWithZero}`)
      .maybeSingle();

    if (profile) {
      let age: number | undefined;
      const dob = profile.date_of_birth || profile.birth_date;
      if (dob) {
        const b = new Date(dob);
        if (!isNaN(b.getTime())) {
          const now = new Date();
          age = now.getFullYear() - b.getFullYear();
        }
      }

      const gNormalized: 'Male' | 'Female' =
        profile.gender?.toLowerCase() === 'female' ? 'Female' : 'Male';

      return {
        success: true,
        member: {
          id: profile.id,
          fullNameEn: profile.full_name_en,
          fullNameAr: profile.full_name_ar,
          avatarUrl: profile.avatar_url,
          governorate: profile.address_governorate || profile.governorate,
          church: profile.primary_church,
          age,
          phone: profile.primary_phone || profile.phone,
          gender: gNormalized,
        },
      };
    }

    // 2. Query user_phones table
    const { data: userPhone } = await supabase
      .from('user_phones')
      .select('user_id, phone_number, profiles:user_id(id, full_name_en, full_name_ar, avatar_url, address_governorate, governorate, primary_church, date_of_birth, birth_date, gender)')
      .or(`phone_number.eq.${fullE164},phone_number.eq.${cleanDigits},phone_number.eq.${localWithZero}`)
      .maybeSingle();

    if (userPhone?.profiles) {
      const p = userPhone.profiles as any;
      let age: number | undefined;
      const dob = p.date_of_birth || p.birth_date;
      if (dob) {
        const b = new Date(dob);
        if (!isNaN(b.getTime())) {
          const now = new Date();
          age = now.getFullYear() - b.getFullYear();
        }
      }

      return {
        success: true,
        member: {
          id: p.id,
          fullNameEn: p.full_name_en,
          fullNameAr: p.full_name_ar,
          avatarUrl: p.avatar_url,
          governorate: p.address_governorate || p.governorate,
          church: p.primary_church,
          age,
          phone: userPhone.phone_number,
          gender: p.gender?.toLowerCase() === 'female' ? 'Female' : 'Male',
        },
      };
    }

    return { success: true, member: null };
  } catch (err: unknown) {
    console.error('findMemberByPhoneAction error:', err);
    return { success: false, member: null };
  }
}
