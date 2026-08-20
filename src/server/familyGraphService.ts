import { createClient } from '@/lib/supabase/server';
import { validateFamilyNameLineage } from '@/lib/validation/nameLineageValidation';

export type FamilyRelationCategory = 'core' | 'grandparent' | 'uncle_aunt' | 'in_law' | 'cousin' | 'extended';

export interface FamilyTreeNode {
  relativeId: string;
  relationType: string;
  relationCategory: FamilyRelationCategory;
  depth: number;
  fullNameAr: string;
  fullNameEn: string;
  gender: string;
  dateOfBirth?: string | null;
  primaryPhone?: string | null;
  avatarUrl?: string | null;
  isDeceased: boolean;
  verificationStatus: 'auto_approved' | 'pending' | 'disputed';
}

export interface CategorizedFamilyTree {
  parents: FamilyTreeNode[];
  spouse: FamilyTreeNode | null;
  children: FamilyTreeNode[];
  siblings: FamilyTreeNode[];
  grandparents: FamilyTreeNode[];
  unclesAndAunts: FamilyTreeNode[];
  cousins: FamilyTreeNode[];
  inLaws: FamilyTreeNode[];
  all: FamilyTreeNode[];
}

export interface LinkFamilyMemberPayload {
  relationType: 'father' | 'mother' | 'spouse' | 'child' | 'sibling' | 'other';
  relativeId?: string | null;
  manualName?: string | null;
  manualPhone?: string | null;
  isDeceased?: boolean;
  userFullNameEn: string;
  userFullNameAr?: string;
}

export interface LinkFamilyMemberResult {
  success: boolean;
  message?: string;
  verificationStatus?: 'auto_approved' | 'pending' | 'disputed';
  error?: string;
}

/**
 * Fetch the complete recursive family tree for a given user from Supabase.
 */
export async function getFullFamilyTree(userId: string): Promise<CategorizedFamilyTree> {
  const emptyTree: CategorizedFamilyTree = {
    parents: [],
    spouse: null,
    children: [],
    siblings: [],
    grandparents: [],
    unclesAndAunts: [],
    cousins: [],
    inLaws: [],
    all: [],
  };

  if (!userId) return emptyTree;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc('get_user_full_family_tree', {
      target_user_id: userId,
    });

    if (error || !data) {
      console.warn('RPC get_user_full_family_tree note:', error?.message);
      return emptyTree;
    }

    const allNodes: FamilyTreeNode[] = (data as any[]).map((row) => ({
      relativeId: row.relative_id,
      relationType: row.relation_type,
      relationCategory: (row.relation_category as FamilyRelationCategory) || 'core',
      depth: row.depth,
      fullNameAr: row.full_name_ar || '',
      fullNameEn: row.full_name_en || '',
      gender: row.gender || 'male',
      dateOfBirth: row.date_of_birth || null,
      primaryPhone: row.primary_phone || null,
      avatarUrl: row.avatar_url || null,
      isDeceased: Boolean(row.is_deceased),
      verificationStatus: row.verification_status || 'auto_approved',
    }));

    const result: CategorizedFamilyTree = {
      parents: allNodes.filter((n) => n.relationType === 'father' || n.relationType === 'mother'),
      spouse: allNodes.find((n) => n.relationType === 'spouse') || null,
      children: allNodes.filter((n) => n.relationType === 'child'),
      siblings: allNodes.filter((n) => n.relationType === 'sibling'),
      grandparents: allNodes.filter((n) => n.relationCategory === 'grandparent'),
      unclesAndAunts: allNodes.filter((n) => n.relationCategory === 'uncle_aunt'),
      cousins: allNodes.filter((n) => n.relationCategory === 'cousin'),
      inLaws: allNodes.filter((n) => n.relationCategory === 'in_law'),
      all: allNodes,
    };

    return result;
  } catch (err: any) {
    console.error('Error in getFullFamilyTree:', err?.message);
    return emptyTree;
  }
}

/**
 * Link or upsert a family relationship with server-side validation and name heuristics.
 */
export async function linkFamilyMember(
  userId: string,
  payload: LinkFamilyMemberPayload
): Promise<LinkFamilyMemberResult> {
  try {
    const supabase = await createClient();

    // 0. Prevent linking the user themselves as a relative
    if (payload.relativeId && payload.relativeId === userId) {
      return {
        success: false,
        verificationStatus: 'disputed',
        error: 'Cannot link yourself as a family member',
      };
    }

    // 0.1 Cross-Role Unique Entity Guard (prevent linking same profile under different roles)
    if (payload.relativeId) {
      const { data: existingRoles } = await supabase
        .from('family_relationships')
        .select('id, relation_type')
        .eq('user_id', userId)
        .eq('relative_id', payload.relativeId);

      if (existingRoles && existingRoles.length > 0) {
        const otherRole = existingRoles.find((r) => r.relation_type !== payload.relationType);
        if (otherRole) {
          return {
            success: false,
            verificationStatus: 'disputed',
            error: `This person is already linked as your ${otherRole.relation_type}. An individual cannot occupy multiple family roles.`,
          };
        }
      }
    }

    // 1. Anti-Contradiction Rule for Deceased Status
    if (payload.isDeceased) {
      if (payload.relationType === 'mother') {
        // Check if Father is already linked with an active living spouse
        const { data: fatherRel } = await supabase
          .from('family_relationships')
          .select('relative_id')
          .eq('user_id', userId)
          .eq('relation_type', 'father')
          .single();

        if (fatherRel?.relative_id) {
          const { data: fSpouseRel } = await supabase
            .from('family_relationships')
            .select('relative_id, is_deceased')
            .eq('user_id', fatherRel.relative_id)
            .eq('relation_type', 'spouse')
            .single();

          if (fSpouseRel?.relative_id && !fSpouseRel.is_deceased) {
            return {
              success: false,
              verificationStatus: 'disputed',
              error: "Conflict: Linked father's spouse record is active and alive in the directory.",
            };
          }
        }
      }
    }

    // 2. If relativeId provided, fetch candidate profile for heuristic validation
    let verificationStatus: 'auto_approved' | 'pending' | 'disputed' = 'auto_approved';

    if (payload.relativeId) {
      const { data: relativeProfile } = await supabase
        .from('profiles')
        .select('id, full_name_en, full_name_ar')
        .eq('id', payload.relativeId)
        .single();

      if (relativeProfile) {
        let boundSpouseId: string | null = null;

        // Check if Father is already linked and has a bound spouse
        if (payload.relationType === 'mother') {
          const { data: fatherRel } = await supabase
            .from('family_relationships')
            .select('relative_id')
            .eq('user_id', userId)
            .eq('relation_type', 'father')
            .single();

          if (fatherRel?.relative_id) {
            const { data: fSpouse } = await supabase
              .from('family_relationships')
              .select('relative_id')
              .eq('user_id', fatherRel.relative_id)
              .eq('relation_type', 'spouse')
              .single();

            if (fSpouse?.relative_id) {
              boundSpouseId = fSpouse.relative_id;
            }
          }
        }

        const heuristic = validateFamilyNameLineage({
          userFullNameEn: payload.userFullNameEn,
          userFullNameAr: payload.userFullNameAr,
          relativeFullNameEn: relativeProfile.full_name_en || '',
          relativeFullNameAr: relativeProfile.full_name_ar || '',
          relationType: payload.relationType as any,
          boundSpouseId,
          candidateRelativeId: payload.relativeId,
        });

        if (!heuristic.isValid) {
          return {
            success: false,
            verificationStatus: 'disputed',
            error: heuristic.errorAr || heuristic.errorEn || 'Lineage name mismatch',
          };
        }

        verificationStatus = heuristic.linkStatus === 'pending_review' ? 'pending' : 'auto_approved';
      }
    }

    // 2. Upsert into public.family_relationships
    const { error: relError } = await supabase
      .from('family_relationships')
      .upsert(
        {
          user_id: userId,
          relative_id: payload.relativeId || null,
          manual_name: payload.manualName || null,
          manual_phone: payload.manualPhone || null,
          relation_type: payload.relationType,
          is_deceased: Boolean(payload.isDeceased),
          verification_status: verificationStatus,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,relative_id,relation_type' }
      );

    if (relError) {
      console.warn('family_relationships upsert note:', relError.message);
    }

    // 3. Keep public.user_family_relations in sync
    await supabase.from('user_family_relations').upsert({
      user_id: userId,
      relation: payload.relationType,
      related_member_id: payload.relativeId || null,
      full_name: payload.manualName || null,
      phone_number: payload.manualPhone || null,
      is_deceased: Boolean(payload.isDeceased),
      link_status: verificationStatus === 'auto_approved' ? 'auto_approved' : 'pending_review',
      verification_method: payload.relativeId ? 'heuristic_name_match' : 'manual_phone',
    });

    return {
      success: true,
      verificationStatus,
      message: 'Family relation linked successfully',
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Failed to link family member',
    };
  }
}

/**
 * Search/discover an active directory member by phone number.
 */
export async function findMemberByPhone(
  countryCode: string,
  rawPhone: string
): Promise<FamilyTreeNode | null> {
  try {
    if (!rawPhone || rawPhone.trim().length < 8) return null;

    const cleanDigits = rawPhone.replace(/\D/g, '');
    const cleanCC = countryCode.startsWith('+') ? countryCode : `+${countryCode}`;
    const fullE164 = cleanDigits.startsWith(cleanCC.replace('+', ''))
      ? `+${cleanDigits}`
      : `${cleanCC}${cleanDigits.replace(/^0+/, '')}`;
    const localWithZero = `0${cleanDigits.replace(/^0+/, '')}`;

    const supabase = await createClient();
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name_en, full_name_ar, gender, date_of_birth, primary_phone, avatar_url')
      .or(`primary_phone.eq.${fullE164},primary_phone.eq.${cleanDigits},primary_phone.eq.${localWithZero}`)
      .maybeSingle();

    if (profile) {
      return {
        relativeId: profile.id,
        relationType: 'other',
        relationCategory: 'core',
        depth: 1,
        fullNameAr: profile.full_name_ar || '',
        fullNameEn: profile.full_name_en || '',
        gender: profile.gender || 'male',
        dateOfBirth: profile.date_of_birth || null,
        primaryPhone: profile.primary_phone || null,
        avatarUrl: profile.avatar_url || null,
        isDeceased: false,
        verificationStatus: 'auto_approved',
      };
    }

    return null;
  } catch (err) {
    console.error('findMemberByPhone error:', err);
    return null;
  }
}

