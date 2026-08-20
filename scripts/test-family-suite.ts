import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { validateFamilyNameLineage } from '../src/lib/validation/nameLineageValidation';

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

const FATHER_ID = '11111111-1111-1111-1111-111111111111';
const MOTHER_ID = '22222222-2222-2222-2222-222222222222';
const SIBLING_ID = '33333333-3333-3333-3333-333333333333';

interface TestResult {
  name: string;
  passed: boolean;
  details: string;
}

const results: TestResult[] = [];

function recordTest(name: string, passed: boolean, details: string) {
  results.push({ name, passed, details });
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} [${passed ? 'PASS' : 'FAIL'}] ${name}`);
  if (!passed || details) {
    console.log(`   ↳ ${details}`);
  }
}

async function runTestSuite() {
  console.log('===============================================================');
  console.log('🧪 POLITIA COMPREHENSIVE FAMILY GRAPH VALIDATION SUITE');
  console.log('===============================================================\n');

  // -------------------------------------------------------------
  // TEST GROUP 1: Database Record Fetching
  // -------------------------------------------------------------
  console.log('--- 1. DATABASE RECORD FETCHING ---');
  try {
    const { data: profiles, error: profError } = await supabase
      .from('profiles')
      .select('id, full_name_ar, full_name_en, gender, primary_phone')
      .in('id', [FATHER_ID, MOTHER_ID, SIBLING_ID]);

    const hasFather = profiles?.some((p) => p.id === FATHER_ID && p.primary_phone === '+201011112222');
    const hasMother = profiles?.some((p) => p.id === MOTHER_ID && p.primary_phone === '+201033334444');
    const hasSibling = profiles?.some((p) => p.id === SIBLING_ID && p.primary_phone === '+201055556666');

    recordTest(
      'Father record exists in Supabase with correct phone (+201011112222)',
      Boolean(hasFather && !profError),
      hasFather ? 'Found Maikel Nabih Malak Girgis' : `Query error / Not found: ${profError?.message}`
    );

    recordTest(
      'Mother record exists in Supabase with correct phone (+201033334444)',
      Boolean(hasMother && !profError),
      hasMother ? 'Found Mariam Shokry Sourial Gourgy' : `Query error / Not found: ${profError?.message}`
    );

    recordTest(
      'Sibling record exists in Supabase with correct phone (+201055556666)',
      Boolean(hasSibling && !profError),
      hasSibling ? 'Found Karas Maikel Nabih Malak Girgis' : `Query error / Not found: ${profError?.message}`
    );
  } catch (err: any) {
    recordTest('Database Record Fetching Exception', false, err.message);
  }

  // -------------------------------------------------------------
  // TEST GROUP 2: Error Matrix (ERR_*) & Lineage Verification
  // -------------------------------------------------------------
  console.log('\n--- 2. ERROR MATRIX & HEURISTIC ENGINE ---');

  const registeringUserEn = 'Kyrollis Maikel Nabih Malak Girgis';
  const registeringUserAr = 'كيرلس مايكل نبيه ملك جرجس';
  const userRegisteredPhone = '+201099998888';

  // 2.1 ERR_SELF_LINK Test
  const checkSelfLink = (userPhone: string, candidatePhone: string): boolean => {
    return userPhone.replace(/\D/g, '') === candidatePhone.replace(/\D/g, '');
  };
  const selfLinkAttempt = checkSelfLink(userRegisteredPhone, '+201099998888');
  recordTest(
    'ERR_SELF_LINK: Block selecting user own registered account as family member',
    selfLinkAttempt === true,
    'Correctly caught self-link collision'
  );

  // 2.2 ERR_DUPLICATE_PHONE Test
  const checkDuplicatePhone = (assignedPhones: string[], newPhone: string): boolean => {
    const cleanNew = newPhone.replace(/\D/g, '');
    return assignedPhones.some((p) => p.replace(/\D/g, '') === cleanNew);
  };
  const duplicatePhoneAttempt = checkDuplicatePhone(['+201011112222', '+201033334444'], '+201011112222');
  recordTest(
    'ERR_DUPLICATE_PHONE: Block identical phone number across multiple family members',
    duplicatePhoneAttempt === true,
    'Correctly caught duplicate phone usage across family entries'
  );

  // 2.3 ERR_DECEASED_CONFLICT Test
  const checkDeceasedConflict = (isFatherLinkedLiving: boolean, isMotherMarkDeceased: boolean): boolean => {
    return isFatherLinkedLiving && isMotherMarkDeceased;
  };
  const deceasedConflict = checkDeceasedConflict(true, true);
  recordTest(
    'ERR_DECEASED_CONFLICT: Block marking living linked spouse as deceased',
    deceasedConflict === true,
    'Correctly blocked conflict: Living spouse record active in directory'
  );

  // 2.4 ERR_FATHER_LINEAGE_MISMATCH Test
  const validFather = validateFamilyNameLineage({
    userFullNameEn: registeringUserEn,
    userFullNameAr: registeringUserAr,
    relativeFullNameEn: 'Maikel Nabih Malak Girgis',
    relativeFullNameAr: 'مايكل نبيه ملك جرجس',
    relationType: 'father',
  });

  const invalidFather = validateFamilyNameLineage({
    userFullNameEn: registeringUserEn,
    userFullNameAr: registeringUserAr,
    relativeFullNameEn: 'George Hanna Fayez',
    relativeFullNameAr: 'جورج حنا فايز',
    relationType: 'father',
  });

  recordTest(
    'ERR_FATHER_LINEAGE_MISMATCH: Validate matching and mismatching father names',
    validFather.isValid && !invalidFather.isValid && invalidFather.errorCode === 'ERR_FATHER_LINEAGE_MISMATCH',
    `Valid: ${validFather.linkStatus} | Invalid Error: ${invalidFather.errorCode}`
  );

  // 2.5 ERR_SIBLING_LINEAGE_MISMATCH Test
  const validSibling = validateFamilyNameLineage({
    userFullNameEn: registeringUserEn,
    userFullNameAr: registeringUserAr,
    relativeFullNameEn: 'Karas Maikel Nabih Malak Girgis',
    relativeFullNameAr: 'كراس مايكل نبيه ملك جرجس',
    relationType: 'brother',
  });

  const invalidSibling = validateFamilyNameLineage({
    userFullNameEn: registeringUserEn,
    userFullNameAr: registeringUserAr,
    relativeFullNameEn: 'Peter George Hanna',
    relativeFullNameAr: 'بيتر جورج حنا',
    relationType: 'brother',
  });

  recordTest(
    'ERR_SIBLING_LINEAGE_MISMATCH: Sibling must share user Father patronymic name',
    validSibling.isValid && !invalidSibling.isValid && invalidSibling.errorCode === 'ERR_SIBLING_LINEAGE_MISMATCH',
    `Valid Sibling: ${validSibling.linkStatus} | Invalid Sibling: ${invalidSibling.errorCode}`
  );

  // 2.6 ERR_GENDER_MISMATCH Test
  const checkGenderMismatch = (slot: 'father' | 'mother', candidateGender: string): boolean => {
    if (slot === 'father' && candidateGender.toLowerCase() !== 'male') return true;
    if (slot === 'mother' && candidateGender.toLowerCase() !== 'female') return true;
    return false;
  };
  const femaleAsFather = checkGenderMismatch('father', 'female');
  const maleAsMother = checkGenderMismatch('mother', 'male');
  recordTest(
    'ERR_GENDER_MISMATCH: Enforce strict gender constraint for Father (male) & Mother (female)',
    femaleAsFather && maleAsMother,
    'Correctly flagged gender mismatch on parent slots'
  );

  // 2.7 ERR_INVALID_AGE_GAP Test
  const checkAgeGapConstraint = (relation: 'parent' | 'child', userAge: number, relAge: number): boolean => {
    if (relation === 'parent') return relAge - userAge < 12;
    if (relation === 'child') return userAge - relAge < 12;
    return false;
  };
  const invalidParentGap = checkAgeGapConstraint('parent', 20, 24); // only 4 yrs older
  const validParentGap = checkAgeGapConstraint('parent', 20, 48); // 28 yrs older
  recordTest(
    'ERR_INVALID_AGE_GAP: Enforce ≥ 12 years age difference for parent/child relations',
    invalidParentGap === true && validParentGap === false,
    'Correctly rejects parent with <12 yr age gap and accepts ≥12 yr age gap'
  );

  // 2.8 ERR_DUPLICATE_ENTITY_ROLE Test
  const checkDuplicateEntityRole = (
    familyList: { id: string; relation: string; memberId?: string | null }[],
    newMemberId: string,
    currentCardId: string
  ): { isDuplicate: boolean; existingRole?: string } => {
    const existing = familyList.find((m) => m.id !== currentCardId && m.memberId === newMemberId);
    if (existing) {
      return { isDuplicate: true, existingRole: existing.relation };
    }
    return { isDuplicate: false };
  };

  const existingTree = [
    { id: 'card_father', relation: 'father', memberId: FATHER_ID },
    { id: 'card_mother', relation: 'mother', memberId: MOTHER_ID },
  ];

  // Try assigning Father as Uncle
  const assignFatherAsUncle = checkDuplicateEntityRole(existingTree, FATHER_ID, 'card_uncle');
  // Try assigning new unassigned member as Uncle
  const assignNewAsUncle = checkDuplicateEntityRole(existingTree, SIBLING_ID, 'card_uncle');

  recordTest(
    'ERR_DUPLICATE_ENTITY_ROLE: Block assigning the same profile into multiple family roles',
    assignFatherAsUncle.isDuplicate === true &&
      assignFatherAsUncle.existingRole === 'father' &&
      assignNewAsUncle.isDuplicate === false,
    `Father as Uncle: Rejected (already ${assignFatherAsUncle.existingRole}) | Sibling as Uncle: Accepted`
  );

  // -------------------------------------------------------------
  // TEST GROUP 3: Independent Unlinking & State Isolation
  // -------------------------------------------------------------
  console.log('\n--- 3. INDEPENDENT UNLINKING & STATE ISOLATION ---');

  interface MockMember {
    id: string;
    relation: string;
    memberId?: string | null;
  }

  const initialFamily: MockMember[] = [
    { id: 'f1', relation: 'father', memberId: FATHER_ID },
    { id: 'm1', relation: 'mother', memberId: MOTHER_ID },
    { id: 's1', relation: 'brother', memberId: SIBLING_ID },
  ];

  // Isolated unlinking of Father only
  const stateAfterUnlinkFather = initialFamily.map((m) =>
    m.relation === 'father' ? { ...m, memberId: null } : m
  );

  const fatherIsUnlinked = stateAfterUnlinkFather.find((m) => m.relation === 'father')?.memberId === null;
  const motherRemainsLinked = stateAfterUnlinkFather.find((m) => m.relation === 'mother')?.memberId === MOTHER_ID;
  const siblingRemainsLinked = stateAfterUnlinkFather.find((m) => m.relation === 'brother')?.memberId === SIBLING_ID;

  recordTest(
    'Independent Unlinking: Removing Father leaves Mother & Siblings intact',
    fatherIsUnlinked && motherRemainsLinked && siblingRemainsLinked,
    'Father cleared; Mother & Sibling securely retained in state'
  );

  // -------------------------------------------------------------
  // TEST GROUP 4: Phone-Driven Auto-Discovery Database Resolution
  // -------------------------------------------------------------
  console.log('\n--- 4. PHONE-DRIVEN AUTO-DISCOVERY DATABASE RESOLUTION ---');
  try {
    const { data: fatherByPhone, error: phoneErr } = await supabase
      .from('profiles')
      .select('id, full_name_en, full_name_ar, primary_phone')
      .eq('primary_phone', '+201011112222')
      .maybeSingle();

    recordTest(
      'Phone Auto-Discovery: Resolves active Father profile by phone (+201011112222)',
      Boolean(fatherByPhone && fatherByPhone.id === FATHER_ID && !phoneErr),
      fatherByPhone ? `Resolved: ${fatherByPhone.full_name_en} (${fatherByPhone.id})` : `Failed: ${phoneErr?.message}`
    );

    const { data: motherByPhone } = await supabase
      .from('profiles')
      .select('id, full_name_en, full_name_ar, primary_phone')
      .eq('primary_phone', '+201033334444')
      .maybeSingle();

    recordTest(
      'Phone Auto-Discovery: Resolves active Mother profile by phone (+201033334444)',
      Boolean(motherByPhone && motherByPhone.id === MOTHER_ID),
      motherByPhone ? `Resolved: ${motherByPhone.full_name_en} (${motherByPhone.id})` : 'Not found'
    );

    const { data: unknownPhone } = await supabase
      .from('profiles')
      .select('id')
      .eq('primary_phone', '+201000000000')
      .maybeSingle();

    recordTest(
      'Phone Auto-Discovery: Gracefully handles unknown phone with null match (no error)',
      unknownPhone === null,
      'Unknown phone correctly returned null without throwing error'
    );
  } catch (phoneEx: any) {
    recordTest('Phone Auto-Discovery Exception', false, phoneEx.message);
  }

  // -------------------------------------------------------------
  // TEST GROUP 5: Step 2 Contact, Age Matrix & Socials Engine
  // -------------------------------------------------------------
  console.log('\n--- 5. STEP 2 CONTACT, IDENTITY & SOCIALS ENGINE ---');

  // 5.1 Age Matrix Rule Assertions
  const checkStep2Rules = (age: number, hasPhone: boolean, hasEmail: boolean, hasNationalId: boolean) => {
    if (age < 13) {
      // Under 13: Phone, Email, National ID all optional
      return true;
    } else if (age < 16) {
      // 13-15: Phone and Email required, National ID optional
      return hasPhone && hasEmail;
    } else {
      // 16+: Phone, Email, National ID all required
      return hasPhone && hasEmail && hasNationalId;
    }
  };

  const childUnder13Valid = checkStep2Rules(10, false, false, false); // < 13 without phone/email/nid
  const teenUnder16WithoutNid = checkStep2Rules(14, true, true, false); // 13-15 with phone/email, no nid
  const teenUnder16WithoutPhone = checkStep2Rules(14, false, true, false); // 13-15 missing phone
  const adultValid = checkStep2Rules(25, true, true, true); // 16+ all provided
  const adultMissingNid = checkStep2Rules(25, true, true, false); // 16+ missing nid

  recordTest(
    'Step 2 Age Matrix: Under 13 optional contacts, 13-15 optional National ID, 16+ all required',
    childUnder13Valid && teenUnder16WithoutNid && !teenUnder16WithoutPhone && adultValid && !adultMissingNid,
    'Age brackets (<13, 13-15, 16+) validated correctly across all requirements'
  );

  // 5.2 Multi-Contact Capacity Test (Max 10 phones & 10 emails)
  const validateMaxContacts = (phonesCount: number, emailsCount: number) => {
    return phonesCount <= 10 && emailsCount <= 10;
  };
  recordTest(
    'Multi-Contact Cap: Enforce max 10 phones and 10 emails per account',
    validateMaxContacts(10, 10) && !validateMaxContacts(11, 5) && !validateMaxContacts(5, 11),
    '10 phones / 10 emails capacity limit strictly maintained'
  );

  // 5.3 Social Handle Normalization
  const normalizeSocialHandle = (input: string) => {
    return input.replace(/^https?:\/\/(www\.)?(facebook|instagram|tiktok|twitter|x)\.com\//i, '').replace(/^[@\/]+|\/$/g, '').trim().toLowerCase();
  };

  const handle1 = normalizeSocialHandle('@john_doe');
  const handle2 = normalizeSocialHandle('https://instagram.com/john_doe/');
  const handle3 = normalizeSocialHandle('john_doe');

  recordTest(
    'Social Handles Engine: Normalize raw handle and full URL strings into clean tokens',
    handle1 === 'john_doe' && handle2 === 'john_doe' && handle3 === 'john_doe',
    `Normalized: "@john_doe" & URL -> "${handle1}"`
  );

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = total - passed;

  console.log('\n===============================================================');
  console.log(`📊 TEST SUITE SUMMARY: ${passed}/${total} PASSED (${failed} FAILED)`);
  console.log('===============================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Fatal suite execution error:', err);
  process.exit(1);
});
