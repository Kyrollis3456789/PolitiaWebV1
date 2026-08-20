import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Parse .env.local file directly
try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    for (const line of envContent.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.substring(0, eqIdx).trim();
        const val = trimmed.substring(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
} catch (e) {
  console.warn('Note reading .env.local:', e);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cqmkxrftxhgyixwtkuyf.supabase.co';
const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

if (!supabaseUrl || !secretKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, secretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const FATHER_ID = '11111111-1111-4111-8111-111111111111';
const MOTHER_ID = '22222222-2222-4222-8222-222222222222';
const SIBLING_ID = '33333333-3333-4333-8333-333333333333';

async function seedFamily() {
  console.log('🌱 Starting family seeding for live name-matching test...');
  console.log(`Connecting to: ${supabaseUrl}`);

  // 1. Seed Profiles
  const profiles = [
    {
      id: FATHER_ID,
      full_name_en: 'Maikel Nabih Malak Girgis',
      full_name_ar: 'مايكل نبيه ملك جرجس',
      gender: 'male',
      date_of_birth: '1976-01-01',
      national_id: '27601012500111',
      primary_phone: '+201011112222',
      address_governorate: 'Asyut',
      primary_church: 'مطرانية أسيوط للأقباط الأرثوذكس',
      marital_status: 'married',
    },
    {
      id: MOTHER_ID,
      full_name_en: 'Mariam Shokry Sourial Gourgy',
      full_name_ar: 'مريم شكري سوريال جورجي',
      gender: 'female',
      date_of_birth: '1980-05-15',
      national_id: '28005152500222',
      primary_phone: '+201033334444',
      address_governorate: 'Asyut',
      primary_church: 'مطرانية أسيوط للأقباط الأرثوذكس',
      marital_status: 'married',
    },
    {
      id: SIBLING_ID,
      full_name_en: 'Karas Maikel Nabih Malak Girgis',
      full_name_ar: 'كراس مايكل نبيه ملك جرجس',
      gender: 'male',
      date_of_birth: '2010-03-20',
      national_id: '31003202500333',
      primary_phone: '+201055556666',
      address_governorate: 'Asyut',
      primary_church: 'مطرانية أسيوط للأقباط الأرثوذكس',
      marital_status: 'single',
    },
  ];

  console.log('Inserting / Upserting Profiles...');
  const { data: profData, error: profError } = await supabase
    .from('profiles')
    .upsert(profiles, { onConflict: 'id' })
    .select('id, full_name_ar, full_name_en');

  if (profError) {
    console.warn('⚠️ Note during profiles upsert:', profError.message);
  } else {
    console.log('✅ Profiles inserted successfully:', profData);
  }

  // 2. Seed User Phones
  const phones = [
    { user_id: FATHER_ID, phone_number: '+201011112222', is_primary: true },
    { user_id: MOTHER_ID, phone_number: '+201033334444', is_primary: true },
    { user_id: SIBLING_ID, phone_number: '+201055556666', is_primary: true },
  ];

  const { error: phoneError } = await supabase
    .from('user_phones')
    .upsert(phones, { onConflict: 'user_id,phone_number' });

  if (phoneError) {
    console.warn('⚠️ Note during phones upsert:', phoneError.message);
  } else {
    console.log('✅ Phone numbers inserted successfully.');
  }

  // 3. Seed Family Relationships
  const familyRelations = [
    // Father's links
    {
      user_id: FATHER_ID,
      relation: 'spouse',
      related_member_id: MOTHER_ID,
      full_name: 'مريم شكري سوريال جورجي',
      phone_number: '+201033334444',
      is_deceased: false,
      link_status: 'auto_approved',
      verification_method: 'heuristic_name_match',
      requires_audit_notice: false,
    },
    {
      user_id: FATHER_ID,
      relation: 'son',
      related_member_id: SIBLING_ID,
      full_name: 'كراس مايكل نبيه ملك جرجس',
      phone_number: '+201055556666',
      is_deceased: false,
      link_status: 'auto_approved',
      verification_method: 'heuristic_name_match',
      requires_audit_notice: false,
    },

    // Mother's links
    {
      user_id: MOTHER_ID,
      relation: 'spouse',
      related_member_id: FATHER_ID,
      full_name: 'مايكل نبيه ملك جرجس',
      phone_number: '+201011112222',
      is_deceased: false,
      link_status: 'auto_approved',
      verification_method: 'heuristic_name_match',
      requires_audit_notice: false,
    },
    {
      user_id: MOTHER_ID,
      relation: 'son',
      related_member_id: SIBLING_ID,
      full_name: 'كراس مايكل نبيه ملك جرجس',
      phone_number: '+201055556666',
      is_deceased: false,
      link_status: 'auto_approved',
      verification_method: 'heuristic_name_match',
      requires_audit_notice: false,
    },

    // Sibling Karas's links
    {
      user_id: SIBLING_ID,
      relation: 'father',
      related_member_id: FATHER_ID,
      full_name: 'مايكل نبيه ملك جرجس',
      phone_number: '+201011112222',
      is_deceased: false,
      link_status: 'auto_approved',
      verification_method: 'heuristic_name_match',
      requires_audit_notice: false,
    },
    {
      user_id: SIBLING_ID,
      relation: 'mother',
      related_member_id: MOTHER_ID,
      full_name: 'مريم شكري سوريال جورجي',
      phone_number: '+201033334444',
      is_deceased: false,
      link_status: 'auto_approved',
      verification_method: 'heuristic_name_match',
      requires_audit_notice: false,
    },
  ];

  console.log('Inserting Family Relations...');
  const { error: relError } = await supabase
    .from('user_family_relations')
    .upsert(familyRelations);

  if (relError) {
    console.warn('⚠️ Note during family relations upsert:', relError.message);
  } else {
    console.log('✅ Family relations mapped and inserted successfully.');
  }

  console.log('\n🎉 Family Dataset Seeding Complete:');
  console.log('👨 Father:  مايكل نبيه ملك جرجس (Maikel Nabih Malak Girgis) - 1976-01-01 - +201011112222 (Asyut)');
  console.log('👩 Mother:  مريم شكري سوريال جورجي (Mariam Shokry Sourial Gourgy) - 1980-05-15 - +201033334444 (Asyut)');
  console.log('👦 Sibling: كراس مايكل نبيه ملك جرجس (Karas Maikel Nabih Malak Girgis) - 2010-03-20 - +201055556666 (Asyut)');
}

seedFamily().catch((e) => {
  console.error('Fatal seed error:', e);
  process.exit(1);
});
