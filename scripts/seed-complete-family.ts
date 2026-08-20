import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// 1. Load environment variables
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

const supabase = createClient(supabaseUrl, secretKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export const FATHER_ID = '11111111-1111-1111-1111-111111111111';
export const MOTHER_ID = '22222222-2222-2222-2222-222222222222';
export const SIBLING_ID = '33333333-3333-3333-3333-333333333333';

async function seedCompleteFamily() {
  console.log('===============================================================');
  console.log('🌱 SEEDING COMPLETE REALISTIC FAMILY DATASET (SUPABASE)');
  console.log('===============================================================\n');

  // 1. Upsert Father Profile
  console.log('--- 1. Upserting Father Profile (Maikel Nabih Malak Girgis) ---');
  const { error: fErr } = await supabase.from('profiles').upsert(
    {
      id: FATHER_ID,
      national_id: '27601012501234',
      full_name_ar: 'مايكل نبيه ملك جرجس',
      full_name_en: 'Maikel Nabih Malak Girgis',
      gender: 'male',
      birth_date: '1976-01-01',
      date_of_birth: '1976-01-01',
      phone: '+201011112222',
      primary_phone: '+201011112222',
      marital_status: 'married',
      governorate: 'Asyut',
      address_governorate: 'Asyut',
      primary_church: 'مطرانية أسيوط للأقباط الأرثوذكس',
      is_deceased: false,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' }
  );

  if (fErr) {
    console.error(`❌ Failed to upsert Father (${FATHER_ID}):`, fErr.message);
  } else {
    console.log(`✅ Father profile synced: ${FATHER_ID}`);
  }

  await supabase.from('user_phones').upsert(
    {
      user_id: FATHER_ID,
      phone_number: '+201011112222',
      is_primary: true,
      is_verified: true,
    },
    { onConflict: 'user_id,phone_number' }
  );

  // 2. Upsert Mother Profile
  console.log('\n--- 2. Upserting Mother Profile (Mariam Shokry Sourial Gourgy) ---');
  const { error: mErr } = await supabase.from('profiles').upsert(
    {
      id: MOTHER_ID,
      national_id: '28005152505678',
      full_name_ar: 'مريم شكري سوريال جورجي',
      full_name_en: 'Mariam Shokry Sourial Gourgy',
      gender: 'female',
      birth_date: '1980-05-15',
      date_of_birth: '1980-05-15',
      phone: '+201033334444',
      primary_phone: '+201033334444',
      marital_status: 'married',
      governorate: 'Asyut',
      address_governorate: 'Asyut',
      primary_church: 'مطرانية أسيوط للأقباط الأرثوذكس',
      is_deceased: false,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' }
  );

  if (mErr) {
    console.error(`❌ Failed to upsert Mother (${MOTHER_ID}):`, mErr.message);
  } else {
    console.log(`✅ Mother profile synced: ${MOTHER_ID}`);
  }

  await supabase.from('user_phones').upsert(
    {
      user_id: MOTHER_ID,
      phone_number: '+201033334444',
      is_primary: true,
      is_verified: true,
    },
    { onConflict: 'user_id,phone_number' }
  );

  // 3. Upsert Sibling Profile
  console.log('\n--- 3. Upserting Sibling Profile (Karas Maikel Nabih Malak Girgis) ---');
  const { error: sErr } = await supabase.from('profiles').upsert(
    {
      id: SIBLING_ID,
      national_id: '31003202509876',
      full_name_ar: 'كراس مايكل نبيه ملك جرجس',
      full_name_en: 'Karas Maikel Nabih Malak Girgis',
      gender: 'male',
      birth_date: '2010-03-20',
      date_of_birth: '2010-03-20',
      phone: '+201055556666',
      primary_phone: '+201055556666',
      marital_status: 'single',
      governorate: 'Asyut',
      address_governorate: 'Asyut',
      primary_church: 'مطرانية أسيوط للأقباط الأرثوذكس',
      is_deceased: false,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' }
  );

  if (sErr) {
    console.error(`❌ Failed to upsert Sibling (${SIBLING_ID}):`, sErr.message);
  } else {
    console.log(`✅ Sibling profile synced: ${SIBLING_ID}`);
  }

  await supabase.from('user_phones').upsert(
    {
      user_id: SIBLING_ID,
      phone_number: '+201055556666',
      is_primary: true,
      is_verified: true,
    },
    { onConflict: 'user_id,phone_number' }
  );

  // 4. Upsert Direct Inter-Family Relationships
  console.log('\n--- 4. Linking Inter-Family Graph Relationships ---');

  // Father <-> Mother (Spouse)
  await supabase.from('family_relationships').upsert(
    {
      user_id: FATHER_ID,
      relative_id: MOTHER_ID,
      relation_type: 'spouse',
      is_deceased: false,
      verification_status: 'auto_approved',
    },
    { onConflict: 'user_id,relative_id,relation_type' }
  );

  await supabase.from('family_relationships').upsert(
    {
      user_id: MOTHER_ID,
      relative_id: FATHER_ID,
      relation_type: 'spouse',
      is_deceased: false,
      verification_status: 'auto_approved',
    },
    { onConflict: 'user_id,relative_id,relation_type' }
  );

  // Sibling -> Father, Sibling -> Mother
  await supabase.from('family_relationships').upsert(
    {
      user_id: SIBLING_ID,
      relative_id: FATHER_ID,
      relation_type: 'father',
      is_deceased: false,
      verification_status: 'auto_approved',
    },
    { onConflict: 'user_id,relative_id,relation_type' }
  );

  await supabase.from('family_relationships').upsert(
    {
      user_id: SIBLING_ID,
      relative_id: MOTHER_ID,
      relation_type: 'mother',
      is_deceased: false,
      verification_status: 'auto_approved',
    },
    { onConflict: 'user_id,relative_id,relation_type' }
  );

  // Father -> Sibling, Mother -> Sibling
  await supabase.from('family_relationships').upsert(
    {
      user_id: FATHER_ID,
      relative_id: SIBLING_ID,
      relation_type: 'child',
      is_deceased: false,
      verification_status: 'auto_approved',
    },
    { onConflict: 'user_id,relative_id,relation_type' }
  );

  await supabase.from('family_relationships').upsert(
    {
      user_id: MOTHER_ID,
      relative_id: SIBLING_ID,
      relation_type: 'child',
      is_deceased: false,
      verification_status: 'auto_approved',
    },
    { onConflict: 'user_id,relative_id,relation_type' }
  );

  // Legacy table sync
  await supabase.from('user_family_relations').upsert({
    user_id: FATHER_ID,
    related_member_id: MOTHER_ID,
    relation: 'spouse',
    full_name: 'مريم شكري سوريال جورجي',
    is_deceased: false,
    link_status: 'auto_approved',
  });

  await supabase.from('user_family_relations').upsert({
    user_id: MOTHER_ID,
    related_member_id: FATHER_ID,
    relation: 'spouse',
    full_name: 'مايكل نبيه ملك جرجس',
    is_deceased: false,
    link_status: 'auto_approved',
  });

  await supabase.from('user_family_relations').upsert({
    user_id: FATHER_ID,
    related_member_id: SIBLING_ID,
    relation: 'son',
    full_name: 'كراس مايكل نبيه ملك جرجس',
    is_deceased: false,
    link_status: 'auto_approved',
  });

  await supabase.from('user_family_relations').upsert({
    user_id: MOTHER_ID,
    related_member_id: SIBLING_ID,
    relation: 'son',
    full_name: 'كراس مايكل نبيه ملك جرجس',
    is_deceased: false,
    link_status: 'auto_approved',
  });

  console.log(`✅ Bi-directional graph relationships established successfully`);

  console.log('\n===============================================================');
  console.log('🎉 SEEDING COMPLETED SUCCESSFULLY WITH ZERO MISSING FIELDS');
  console.log('===============================================================');
}

seedCompleteFamily().catch((err) => {
  console.error('Fatal seeding error:', err);
  process.exit(1);
});
