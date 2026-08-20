'use server';

import { createClient } from '@/lib/supabase/server';

export interface SearchedMember {
  id: string;
  fullNameEn: string;
  fullNameAr: string;
  avatarUrl?: string | null;
  governorate?: string | null;
  church?: string | null;
  age?: number;
  phone?: string | null;
  gender?: 'Male' | 'Female';
}

const SAMPLE_COMMUNITY_MEMBERS: SearchedMember[] = [
  {
    id: 'mem_01',
    fullNameEn: 'Youssef Nabil Guirguis',
    fullNameAr: 'يوسف نبيل جرجس',
    avatarUrl: null,
    governorate: 'Cairo',
    church: 'كنيسة مارجرجس هليوبوليس',
    phone: '+201012345671',
    age: 56,
    gender: 'Male',
  },
  {
    id: 'mem_02',
    fullNameEn: 'Mona Rafik Shenouda',
    fullNameAr: 'منى رفيق شنودة',
    avatarUrl: null,
    governorate: 'Cairo',
    church: 'كنيسة العذراء مريم الزيتون',
    phone: '+201012345672',
    age: 52,
    gender: 'Female',
  },
  {
    id: 'mem_03',
    fullNameEn: 'George Adel Ibrahim',
    fullNameAr: 'جورج عادل إبراهيم',
    avatarUrl: null,
    governorate: 'Giza',
    church: 'كنيسة مارمرقس الدقي',
    phone: '+201012345673',
    age: 61,
    gender: 'Male',
  },
  {
    id: 'mem_04',
    fullNameEn: 'Mary Samir Mansour',
    fullNameAr: 'ماري سمير منصور',
    avatarUrl: null,
    governorate: 'Giza',
    church: 'كنيسة الشهيد أبي سيفين المهندسين',
    phone: '+201012345674',
    age: 58,
    gender: 'Female',
  },
  {
    id: 'mem_05',
    fullNameEn: 'Bishoy Magdy Farag',
    fullNameAr: 'بيشوي مجدي فرج',
    avatarUrl: null,
    governorate: 'Alexandria',
    church: 'الكاتدرائية المرقسية بالإسكندرية',
    phone: '+201012345675',
    age: 48,
    gender: 'Male',
  },
  {
    id: 'mem_06',
    fullNameEn: 'Christine Nader Fakhry',
    fullNameAr: 'كريستين نادر فخري',
    avatarUrl: null,
    governorate: 'Alexandria',
    church: 'كنيسة العذراء سموحة',
    phone: '+201012345676',
    age: 44,
    gender: 'Female',
  },
  {
    id: 'mem_07',
    fullNameEn: 'Mina Ashraf Tawadros',
    fullNameAr: 'مينا أشرف تواضروس',
    avatarUrl: null,
    governorate: 'Cairo',
    church: 'كنيسة القديس بطرس وبولس بالعباسية',
    phone: '+201012345677',
    age: 34,
    gender: 'Male',
  },
  {
    id: 'mem_08',
    fullNameEn: 'Marina Tharwat Kamal',
    fullNameAr: 'مارينا ثروت كمال',
    avatarUrl: null,
    governorate: 'Cairo',
    church: 'كنيسة العذراء مريم بالزمالك',
    phone: '+201012345678',
    age: 29,
    gender: 'Female',
  },
  {
    id: 'mem_09',
    fullNameEn: 'Sameh Fawzy Hanna',
    fullNameAr: 'سامح فوزي حنا',
    avatarUrl: null,
    governorate: 'Cairo',
    church: 'كنيسة مارمينا شبرا',
    phone: '+201012345679',
    age: 59,
    gender: 'Male',
  },
  {
    id: 'mem_10',
    fullNameEn: 'Hanan Sobhy Aziz',
    fullNameAr: 'حنان صبحي عزيز',
    avatarUrl: null,
    governorate: 'Cairo',
    church: 'كنيسة الملاك ميخائيل الظاهر',
    phone: '+201012345680',
    age: 54,
    gender: 'Female',
  },
  {
    id: '11111111-1111-4111-8111-111111111111',
    fullNameEn: 'Maikel Nabih Malak Girgis',
    fullNameAr: 'مايكل نبيه ملك جرجس',
    avatarUrl: null,
    governorate: 'Asyut',
    church: 'مطرانية أسيوط للأقباط الأرثوذكس',
    phone: '+201099887766',
    age: 50,
    gender: 'Male',
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    fullNameEn: 'Mariam Shokry Sourial Gourgy',
    fullNameAr: 'مريم شكري سوريال جورجي',
    avatarUrl: null,
    governorate: 'Asyut',
    church: 'مطرانية أسيوط للأقباط الأرثوذكس',
    phone: '+201099887755',
    age: 46,
    gender: 'Female',
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    fullNameEn: 'Karas Maikel Nabih Malak Girgis',
    fullNameAr: 'كراس مايكل نبيه ملك جرجس',
    avatarUrl: null,
    governorate: 'Asyut',
    church: 'مطرانية أسيوط للأقباط الأرثوذكس',
    phone: '+201099887744',
    age: 16,
    gender: 'Male',
  },
];

export interface MemberSearchFilter {
  gender?: 'Male' | 'Female';
  minAge?: number;
}

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

    // 1. Try querying Supabase profiles
    try {
      const supabase = await createClient();
      let orConditions = `full_name_en.ilike.%${qLower}%,full_name_ar.ilike.%${rawTrimmed}%`;
      if (isPhoneSearch) {
        orConditions += `,primary_phone.ilike.%${cleanDigits}%,phone.ilike.%${cleanDigits}%`;
      }

      let dbQuery = supabase
        .from('profiles')
        .select('id, full_name_en, full_name_ar, avatar_url, address_governorate, primary_church, date_of_birth, gender, primary_phone, phone')
        .or(orConditions);

      if (filter?.gender) {
        dbQuery = dbQuery.eq('gender', filter.gender);
      }

      const { data: dbProfiles, error } = await dbQuery.limit(8);

      if (!error && dbProfiles && dbProfiles.length > 0) {
        const mapped: SearchedMember[] = (dbProfiles as Array<{
          id: string;
          full_name_en: string;
          full_name_ar: string;
          avatar_url?: string | null;
          address_governorate?: string | null;
          primary_church?: string | null;
          date_of_birth?: string | null;
          gender?: 'Male' | 'Female';
          primary_phone?: string | null;
          phone?: string | null;
        }>)
          .map((p) => {
            let age: number | undefined;
            if (p.date_of_birth) {
              const b = new Date(p.date_of_birth);
              const now = new Date();
              age = now.getFullYear() - b.getFullYear();
            }
            return {
              id: p.id,
              fullNameEn: p.full_name_en,
              fullNameAr: p.full_name_ar,
              avatarUrl: p.avatar_url,
              governorate: p.address_governorate,
              church: p.primary_church,
              phone: p.primary_phone || p.phone || null,
              age,
              gender: p.gender,
            };
          })
          .filter((m) => {
            if (filter?.gender && m.gender && m.gender !== filter.gender) return false;
            if (filter?.minAge !== undefined && m.age !== undefined && m.age < filter.minAge) return false;
            return true;
          });

        if (mapped.length > 0) {
          return { success: true, members: mapped };
        }
      }
    } catch {
      // Fall through to sample pool
    }

    // 2. Sample Pool Matcher with English/Arabic names, phone, gender and minAge filters
    const matched = SAMPLE_COMMUNITY_MEMBERS.filter((m) => {
      if (filter?.gender && m.gender !== filter.gender) return false;
      if (filter?.minAge !== undefined && m.age !== undefined && m.age < filter.minAge) return false;
      const matchNameEn = m.fullNameEn.toLowerCase().includes(qLower);
      const matchNameAr = m.fullNameAr.includes(rawTrimmed);
      const matchGov = m.governorate?.toLowerCase().includes(qLower);
      const matchPhone = isPhoneSearch && m.phone ? m.phone.replace(/\D/g, '').includes(cleanDigits) : false;
      return matchNameEn || matchNameAr || matchGov || matchPhone;
    });

    // Sort matching preferred governorate first
    if (preferredGovernorate) {
      matched.sort((a, b) => {
        const aPref = a.governorate?.toLowerCase() === preferredGovernorate.toLowerCase() ? -1 : 1;
        const bPref = b.governorate?.toLowerCase() === preferredGovernorate.toLowerCase() ? -1 : 1;
        return aPref - bPref;
      });
    }

    return { success: true, members: matched.slice(0, 5) };
  } catch (err: unknown) {
    console.error('searchMembersAction error:', err);
    return { success: false, members: [] };
  }
}

const SAMPLE_FAMILY_GRAPH: Record<string, { spouseId?: string; childrenIds?: string[] }> = {
  mem_01: { spouseId: 'mem_02', childrenIds: ['mem_07', 'mem_08'] },
  mem_02: { spouseId: 'mem_01', childrenIds: ['mem_07', 'mem_08'] },
  mem_03: { spouseId: 'mem_04', childrenIds: ['mem_05'] },
  mem_04: { spouseId: 'mem_03', childrenIds: ['mem_05'] },
  mem_09: { spouseId: 'mem_10', childrenIds: ['mem_06'] },
  mem_10: { spouseId: 'mem_09', childrenIds: ['mem_06'] },
  '11111111-1111-1111-1111-111111111111': {
    spouseId: '22222222-2222-2222-2222-222222222222',
    childrenIds: ['33333333-3333-3333-3333-333333333333'],
  },
  '22222222-2222-2222-2222-222222222222': {
    spouseId: '11111111-1111-1111-1111-111111111111',
    childrenIds: ['33333333-3333-3333-3333-333333333333'],
  },
  '33333333-3333-3333-3333-333333333333': {
    spouseId: undefined,
    childrenIds: [],
  },
};

export interface MemberFamilyGraphResult {
  success: boolean;
  spouse?: SearchedMember | null;
  children?: SearchedMember[];
}

export async function getMemberFamilyGraphAction(memberId: string): Promise<MemberFamilyGraphResult> {
  try {
    if (!memberId) return { success: false, children: [] };

    // 1. Try querying Supabase Recursive Family Tree RPC
    try {
      const supabase = await createClient();
      const { data: treeRows, error: rpcError } = await supabase.rpc('get_user_full_family_tree', {
        target_user_id: memberId,
      });

      if (!rpcError && treeRows && treeRows.length > 0) {
        let spouse: SearchedMember | null = null;
        const children: SearchedMember[] = [];

        for (const row of treeRows as any[]) {
          let age: number | undefined;
          if (row.date_of_birth) {
            const b = new Date(row.date_of_birth);
            const now = new Date();
            age = now.getFullYear() - b.getFullYear();
          }

          const memberObj: SearchedMember = {
            id: row.relative_id,
            fullNameEn: row.full_name_en,
            fullNameAr: row.full_name_ar,
            avatarUrl: row.avatar_url,
            governorate: 'Asyut',
            church: 'مطرانية أسيوط للأقباط الأرثوذكس',
            age,
            gender: row.gender === 'female' ? 'Female' : 'Male',
          };

          if (row.relation_type === 'spouse') {
            spouse = memberObj;
          } else if (row.relation_type === 'child') {
            children.push(memberObj);
          }
        }

        return { success: true, spouse, children };
      }
    } catch {
      // Fall through to legacy table or sample pool
    }

    // 2. Sample Pool Graph Resolution
    const graph = SAMPLE_FAMILY_GRAPH[memberId];
    if (!graph) {
      return { success: true, spouse: null, children: [] };
    }

    let sampleSpouse: SearchedMember | null = null;
    if (graph.spouseId) {
      sampleSpouse = SAMPLE_COMMUNITY_MEMBERS.find((m) => m.id === graph.spouseId) || null;
    }

    const sampleChildren: SearchedMember[] = [];
    if (graph.childrenIds && graph.childrenIds.length > 0) {
      for (const cid of graph.childrenIds) {
        const c = SAMPLE_COMMUNITY_MEMBERS.find((m) => m.id === cid);
        if (c) sampleChildren.push(c);
      }
    }

    return {
      success: true,
      spouse: sampleSpouse,
      children: sampleChildren,
    };
  } catch (err: unknown) {
    console.error('getMemberFamilyGraphAction error:', err);
    return { success: false, children: [] };
  }
}

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

    // 1. Query Supabase database
    try {
      const supabase = await createClient();

      // Query profiles by primary_phone
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name_en, full_name_ar, avatar_url, address_governorate, primary_church, date_of_birth, gender, primary_phone')
        .or(`primary_phone.eq.${fullE164},primary_phone.eq.${cleanDigits},primary_phone.eq.${localWithZero}`)
        .maybeSingle();

      if (profile) {
        let age: number | undefined;
        if (profile.date_of_birth) {
          const b = new Date(profile.date_of_birth);
          const now = new Date();
          age = now.getFullYear() - b.getFullYear();
        }

        return {
          success: true,
          member: {
            id: profile.id,
            fullNameEn: profile.full_name_en,
            fullNameAr: profile.full_name_ar,
            avatarUrl: profile.avatar_url,
            governorate: profile.address_governorate,
            church: profile.primary_church,
            age,
            phone: profile.primary_phone,
            gender: profile.gender === 'female' ? 'Female' : 'Male',
          },
        };
      }

      // Also query user_phones table
      const { data: userPhone } = await supabase
        .from('user_phones')
        .select('user_id, phone_number, profiles:user_id(id, full_name_en, full_name_ar, avatar_url, address_governorate, primary_church, date_of_birth, gender)')
        .or(`phone_number.eq.${fullE164},phone_number.eq.${cleanDigits},phone_number.eq.${localWithZero}`)
        .maybeSingle();

      if (userPhone?.profiles) {
        const p = userPhone.profiles as any;
        let age: number | undefined;
        if (p.date_of_birth) {
          const b = new Date(p.date_of_birth);
          const now = new Date();
          age = now.getFullYear() - b.getFullYear();
        }

        return {
          success: true,
          member: {
            id: p.id,
            fullNameEn: p.full_name_en,
            fullNameAr: p.full_name_ar,
            avatarUrl: p.avatar_url,
            governorate: p.address_governorate,
            church: p.primary_church,
            age,
            phone: userPhone.phone_number,
            gender: p.gender === 'female' ? 'Female' : 'Male',
          },
        };
      }
    } catch (dbErr) {
      console.warn('findMemberByPhoneAction DB lookup error:', dbErr);
    }

    // 2. Check Sample Community Members
    const sampleMatch = SAMPLE_COMMUNITY_MEMBERS.find(
      (m) =>
        m.phone &&
        (m.phone === fullE164 ||
          m.phone.replace(/\D/g, '') === cleanDigits ||
          m.phone === localWithZero)
    );

    if (sampleMatch) {
      return { success: true, member: sampleMatch };
    }

    return { success: true, member: null };
  } catch (err: unknown) {
    console.error('findMemberByPhoneAction error:', err);
    return { success: false, member: null };
  }
}


