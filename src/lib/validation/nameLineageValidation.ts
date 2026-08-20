/**
 * Intelligent Name Heuristics Matcher and Full-Lineage Cross-Verification Engine
 * for Politia Family Relations Mapping.
 *
 * Compares the full sequential name tokens across entire patronymic lineages
 * in both Arabic and English with phonetic equivalence and fuzzy matching.
 */

import { FamilyRelationType } from '@/types/database.types';

export interface LineageValidationResult {
  isValid: boolean;
  confidence: 'high' | 'medium' | 'low';
  linkStatus: 'auto_approved' | 'pending_review' | 'disputed';
  verificationMethod: 'heuristic_name_match' | 'graph_resolution' | 'manual_override';
  errorCode?: string;
  errorEn?: string;
  errorAr?: string;
}

/**
 * Normalizes Arabic text by standardizing alefs, yaas, taa marboutas,
 * removing tatweel, tashkeel, and unifying compound name prefixes.
 */
export function normalizeArabicName(name: string): string {
  if (!name) return '';
  return name
    .trim()
    // Remove diacritics (tashkeel)
    .replace(/[\u064B-\u065F\u0670]/g, '')
    // Remove tatweel
    .replace(/\u0640/g, '')
    // Unify Alefs (أ, إ, آ, ٱ -> ا)
    .replace(/[أإآٱ]/g, 'ا')
    // Unify Yaa / Alef Maksura (ى -> ي)
    .replace(/ى/g, 'ي')
    // Unify Taa Marbouta / Haa (ة -> ه)
    .replace(/ة/g, 'ه')
    // Normalize compound prefixes: عبد الرحمن -> عبدالرحمن
    .replace(/عبد\s+/g, 'عبد')
    .replace(/ابو\s+/g, 'ابو')
    .replace(/مار\s+/g, 'مار')
    .toLowerCase();
}

/**
 * Normalizes English name tokens and strips punctuation.
 */
export function normalizeEnglishName(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

/**
 * Egyptian Christian / Arabic Common Transliteration & Phonetic Dictionary
 */
const PHONETIC_EQUIVALENCE_GROUPS: string[][] = [
  ['guirguis', 'girgis', 'george', 'giorgis', 'gerges', 'gurgus', 'girguis', 'gourgy', 'gourgi'],
  ['youssef', 'yousef', 'yosef', 'joseph', 'yossef'],
  ['mina', 'meena'],
  ['bishoy', 'beshoy', 'bishoi', 'beshoy', 'peshoy'],
  ['shenouda', 'shinoda', 'chenouda', 'shenoudeh'],
  ['mona', 'mouna'],
  ['samir', 'sameer'],
  ['adel', 'adil', 'adeel'],
  ['ashraf', 'ashrf'],
  ['magdy', 'magdi', 'magdee', 'magdey'],
  ['peter', 'botros', 'boutros', 'petros'],
  ['mark', 'marcus', 'morcos', 'morkos', 'marcos'],
  ['fawzy', 'fawzi'],
  ['tharwat', 'sarwat'],
  ['kamal', 'kemal'],
  ['hanna', 'hana'],
  ['aziz', 'azeez'],
  ['ibrahim', 'abrahim', 'abraham'],
  ['samuel', 'samy', 'sami'],
  ['farag', 'faraj', 'farrag'],
  ['nabil', 'nabeel'],
  ['rafik', 'rafeek', 'rafeeq'],
  ['nader', 'nadir'],
  ['fakhry', 'fakhri'],
  ['tawadros', 'todros', 'theodore'],
  ['sobhy', 'sobhi', 'subhi'],
  ['maikel', 'michael', 'micheal', 'mechael'],
  ['malak', 'malek'],
  ['karas', 'karras'],
  ['shokry', 'shoukry', 'shokri'],
  ['sourial', 'surial', 'soryal'],
  ['abdel', 'abdul'],
];

/**
 * Calculate Levenshtein Distance for fuzzy matching.
 */
function getLevenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

/**
 * Compares two single name tokens in Arabic or English with phonetic & fuzzy tolerances.
 */
export function areNameTokensMatching(tokenA: string, tokenB: string): boolean {
  if (!tokenA || !tokenB) return false;

  const cleanA = tokenA.trim().toLowerCase();
  const cleanB = tokenB.trim().toLowerCase();

  if (cleanA === cleanB) return true;

  // Check Arabic exact match
  const normArA = normalizeArabicName(tokenA);
  const normArB = normalizeArabicName(tokenB);
  if (normArA && normArB && normArA === normArB) return true;

  // Check English phonetic dictionary groups
  const normEnA = normalizeEnglishName(tokenA);
  const normEnB = normalizeEnglishName(tokenB);

  for (const group of PHONETIC_EQUIVALENCE_GROUPS) {
    if (group.includes(normEnA) && group.includes(normEnB)) {
      return true;
    }
  }

  // Check substring / prefix (e.g. Yousef / Youssef)
  if (normEnA.length >= 4 && normEnB.length >= 4) {
    if (normEnA.startsWith(normEnB) || normEnB.startsWith(normEnA)) {
      return true;
    }
    const dist = getLevenshteinDistance(normEnA, normEnB);
    const maxLen = Math.max(normEnA.length, normEnB.length);
    if (dist <= 2 && dist / maxLen <= 0.35) {
      return true;
    }
  }

  // Arabic fuzzy distance
  if (normArA.length >= 3 && normArB.length >= 3) {
    const distAr = getLevenshteinDistance(normArA, normArB);
    if (distAr <= 1) {
      return true;
    }
  }

  return false;
}

/**
 * Extracts normalized tokens from a full name string.
 */
export function extractNameTokens(fullName: string): string[] {
  if (!fullName) return [];
  return fullName
    .trim()
    .split(/\s+/)
    .filter((t) => t.length > 0);
}

/**
 * Compares two token arrays sequentially across ALL positions.
 * Ensures that EVERY overlapping name in the full name matches in sequential order.
 */
export function compareTokenSequences(
  seqA: string[],
  seqB: string[]
): { matchedCount: number; totalComparable: number; isFullMatch: boolean; hasMismatch: boolean } {
  if (!seqA || !seqB || seqA.length === 0 || seqB.length === 0) {
    return { matchedCount: 0, totalComparable: 0, isFullMatch: false, hasMismatch: false };
  }

  const totalComparable = Math.min(seqA.length, seqB.length);
  let matchedCount = 0;
  let hasMismatch = false;

  for (let i = 0; i < totalComparable; i++) {
    if (areNameTokensMatching(seqA[i], seqB[i])) {
      matchedCount++;
    } else {
      hasMismatch = true;
      break; // Sequential lineage must match in order
    }
  }

  const isFullMatch = matchedCount === totalComparable && !hasMismatch && totalComparable > 0;
  return { matchedCount, totalComparable, isFullMatch, hasMismatch };
}

/**
 * Validates family lineage by checking all full name tokens sequentially.
 */
export function validateFamilyNameLineage(params: {
  userFullNameEn: string;
  userFullNameAr?: string;
  relativeFullNameEn: string;
  relativeFullNameAr?: string;
  relationType: FamilyRelationType;
  relativeSpouseNameEn?: string | null;
  relativeSpouseNameAr?: string | null;
  boundSpouseId?: string | null;
  candidateRelativeId?: string | null;
}): LineageValidationResult {
  const {
    userFullNameEn,
    userFullNameAr,
    relativeFullNameEn,
    relativeFullNameAr,
    relationType,
    relativeSpouseNameEn,
    relativeSpouseNameAr,
    boundSpouseId,
    candidateRelativeId,
  } = params;

  // 0. Anti-Contradiction / Bound Spouse Constraint
  if (relationType === 'mother' && boundSpouseId && candidateRelativeId) {
    if (boundSpouseId !== candidateRelativeId) {
      return {
        isValid: false,
        confidence: 'low',
        linkStatus: 'disputed',
        verificationMethod: 'heuristic_name_match',
        errorCode: 'ERR_DECEASED_CONFLICT',
        errorEn: 'Conflict: The verified spouse record in directory is active and living. Please unlink your father first.',
        errorAr: 'تعارض: شريك الحياة المسجل في الدليل نشط وحي. يرجى إلغاء ربط الوالد أولاً لتغيير الحساب.',
      };
    }
    return {
      isValid: true,
      confidence: 'high',
      linkStatus: 'auto_approved',
      verificationMethod: 'graph_resolution',
    };
  }

  if (relationType === 'father' && boundSpouseId && candidateRelativeId) {
    if (boundSpouseId !== candidateRelativeId) {
      return {
        isValid: false,
        confidence: 'low',
        linkStatus: 'disputed',
        verificationMethod: 'heuristic_name_match',
        errorCode: 'ERR_DECEASED_CONFLICT',
        errorEn: 'Conflict: The verified spouse record in directory is active and living. Please unlink your mother first.',
        errorAr: 'تعارض: شريك الحياة المسجل في الدليل نشط وحي. يرجى إلغاء ربط الوالدة أولاً لتغيير الحساب.',
      };
    }
    return {
      isValid: true,
      confidence: 'high',
      linkStatus: 'auto_approved',
      verificationMethod: 'graph_resolution',
    };
  }

  const userTokensEn = extractNameTokens(userFullNameEn);
  const userTokensAr = extractNameTokens(userFullNameAr || '');
  const relativeTokensEn = extractNameTokens(relativeFullNameEn);
  const relativeTokensAr = extractNameTokens(relativeFullNameAr || '');

  // 1. Father Validation: Compare all tokens of Father's full name with User's patronymic lineage (tokens starting from index 1)
  if (relationType === 'father') {
    const userAncestryEn = userTokensEn.slice(1);
    const userAncestryAr = userTokensAr.slice(1);

    const matchEn = compareTokenSequences(userAncestryEn, relativeTokensEn);
    const matchAr = compareTokenSequences(userAncestryAr, relativeTokensAr);

    const isMatch = (matchEn.isFullMatch && matchEn.matchedCount >= 1) || (matchAr.isFullMatch && matchAr.matchedCount >= 1);
    const hasAnyMismatch = (matchEn.hasMismatch && matchAr.hasMismatch) || (matchEn.matchedCount === 0 && matchAr.matchedCount === 0);

    if (isMatch) {
      const bestMatchCount = Math.max(matchEn.matchedCount, matchAr.matchedCount);
      return {
        isValid: true,
        confidence: bestMatchCount >= 2 ? 'high' : 'medium',
        linkStatus: 'auto_approved',
        verificationMethod: 'heuristic_name_match',
      };
    }

    if (hasAnyMismatch) {
      return {
        isValid: false,
        confidence: 'low',
        linkStatus: 'disputed',
        verificationMethod: 'heuristic_name_match',
        errorCode: 'ERR_FATHER_LINEAGE_MISMATCH',
        errorEn: 'Lineage mismatch: The selected father does not match your patronymic names.',
        errorAr: 'عدم تطابق في النسب: اسم الأب المختار لا يتطابق مع الاسم الكامل المسجل في هويتك.',
      };
    }

    return {
      isValid: true,
      confidence: 'medium',
      linkStatus: 'pending_review',
      verificationMethod: 'heuristic_name_match',
    };
  }

  // 2. Mother Validation: Compare spouse's full name with user's father/ancestry if spouse is registered
  if (relationType === 'mother') {
    if (relativeSpouseNameEn || relativeSpouseNameAr) {
      const spouseTokensEn = extractNameTokens(relativeSpouseNameEn || '');
      const spouseTokensAr = extractNameTokens(relativeSpouseNameAr || '');
      const userAncestryEn = userTokensEn.slice(1);
      const userAncestryAr = userTokensAr.slice(1);

      const matchEn = compareTokenSequences(userAncestryEn, spouseTokensEn);
      const matchAr = compareTokenSequences(userAncestryAr, spouseTokensAr);

      if (matchEn.isFullMatch || matchAr.isFullMatch) {
        return {
          isValid: true,
          confidence: 'high',
          linkStatus: 'auto_approved',
          verificationMethod: 'heuristic_name_match',
        };
      }

      return {
        isValid: false,
        confidence: 'low',
        linkStatus: 'disputed',
        verificationMethod: 'heuristic_name_match',
        errorCode: 'ERR_DECEASED_CONFLICT',
        errorEn: 'Family lineage names do not correlate with this account.',
        errorAr: 'بيانات شجرة العائلة وشريك الحياة لا تتطابق مع اسم والدك المسجل.',
      };
    }

    return {
      isValid: true,
      confidence: 'medium',
      linkStatus: 'pending_review',
      verificationMethod: 'heuristic_name_match',
    };
  }

  // 3. Siblings (Brother / Sister): Compare all patronymic tokens starting from index 1
  if (relationType === 'brother' || relationType === 'sister') {
    const userAncestryEn = userTokensEn.slice(1);
    const userAncestryAr = userTokensAr.slice(1);
    const siblingAncestryEn = relativeTokensEn.slice(1);
    const siblingAncestryAr = relativeTokensAr.slice(1);

    const matchEn = compareTokenSequences(userAncestryEn, siblingAncestryEn);
    const matchAr = compareTokenSequences(userAncestryAr, siblingAncestryAr);

    const isMatch = (matchEn.isFullMatch && matchEn.matchedCount >= 1) || (matchAr.isFullMatch && matchAr.matchedCount >= 1);

    if (isMatch) {
      const bestMatchCount = Math.max(matchEn.matchedCount, matchAr.matchedCount);
      return {
        isValid: true,
        confidence: bestMatchCount >= 2 ? 'high' : 'medium',
        linkStatus: 'auto_approved',
        verificationMethod: 'heuristic_name_match',
      };
    }

    return {
      isValid: false,
      confidence: 'low',
      linkStatus: 'disputed',
      verificationMethod: 'heuristic_name_match',
      errorCode: 'ERR_SIBLING_LINEAGE_MISMATCH',
      errorEn: 'Selected sibling does not share the same father/grandfather lineage.',
      errorAr: 'الشقيق المختار لا يشترك في نفس نسب الأب أو الجد عبر الاسم بالكامل.',
    };
  }

  // 4. Son / Daughter: Compare child's ancestry (index 1+) against user's full name
  if (relationType === 'son' || relationType === 'daughter') {
    const childAncestryEn = relativeTokensEn.slice(1);
    const childAncestryAr = relativeTokensAr.slice(1);

    const matchEn = compareTokenSequences(userTokensEn, childAncestryEn);
    const matchAr = compareTokenSequences(userTokensAr, childAncestryAr);

    const isMatch = (matchEn.isFullMatch && matchEn.matchedCount >= 1) || (matchAr.isFullMatch && matchAr.matchedCount >= 1);

    if (isMatch) {
      return {
        isValid: true,
        confidence: 'high',
        linkStatus: 'auto_approved',
        verificationMethod: 'heuristic_name_match',
      };
    }

    return {
      isValid: false,
      confidence: 'low',
      linkStatus: 'disputed',
      verificationMethod: 'heuristic_name_match',
      errorCode: 'ERR_CHILD_LINEAGE_MISMATCH',
      errorEn: 'Selected child lineage does not match your full name.',
      errorAr: 'نسب الابن/الابنة لا يتطابق مع اسمك الكامل.',
    };
  }

  // 5. Paternal Uncle / Aunt: Compare uncle's ancestry (index 1+) against user's grandfather lineage (index 2+)
  if (
    relationType === 'uncle' ||
    relationType === 'aunt' ||
    relationType === 'paternal_uncle' ||
    relationType === 'paternal_aunt'
  ) {
    const userGfAncestryEn = userTokensEn.slice(2);
    const userGfAncestryAr = userTokensAr.slice(2);
    const uncleAncestryEn = relativeTokensEn.slice(1);
    const uncleAncestryAr = relativeTokensAr.slice(1);

    const matchEn = compareTokenSequences(userGfAncestryEn, uncleAncestryEn);
    const matchAr = compareTokenSequences(userGfAncestryAr, uncleAncestryAr);

    if (matchEn.isFullMatch || matchAr.isFullMatch) {
      return {
        isValid: true,
        confidence: 'high',
        linkStatus: 'auto_approved',
        verificationMethod: 'heuristic_name_match',
      };
    }

    if (userTokensEn.length < 3 && userTokensAr.length < 3) {
      return {
        isValid: true,
        confidence: 'medium',
        linkStatus: 'pending_review',
        verificationMethod: 'heuristic_name_match',
      };
    }

    return {
      isValid: false,
      confidence: 'low',
      linkStatus: 'disputed',
      verificationMethod: 'heuristic_name_match',
      errorCode: 'ERR_SIBLING_LINEAGE_MISMATCH',
      errorEn: "Paternal uncle/aunt must share your grandfather's lineage.",
      errorAr: 'نسب العم/العمة يجب أن يتطابق مع نسب جدك المسجل.',
    };
  }

  // 6. Grandfather: Compare Grandfather's full name against user's grandfather lineage (index 2+)
  if (relationType === 'grandfather') {
    const userGfAncestryEn = userTokensEn.slice(2);
    const userGfAncestryAr = userTokensAr.slice(2);

    const matchEn = compareTokenSequences(userGfAncestryEn, relativeTokensEn);
    const matchAr = compareTokenSequences(userGfAncestryAr, relativeTokensAr);

    if (matchEn.isFullMatch || matchAr.isFullMatch) {
      return {
        isValid: true,
        confidence: 'high',
        linkStatus: 'auto_approved',
        verificationMethod: 'heuristic_name_match',
      };
    }

    return {
      isValid: false,
      confidence: 'low',
      linkStatus: 'disputed',
      verificationMethod: 'heuristic_name_match',
      errorCode: 'ERR_GRANDFATHER_LINEAGE_MISMATCH',
      errorEn: 'Grandfather name does not match your grandfather lineage.',
      errorAr: 'اسم الجد المختار لا يتطابق مع نسب جدك المسجل في هويتك.',
    };
  }

  // Default fallback for Spouse, Grandmother, Maternal Uncle/Aunt, Cousin, etc.
  return {
    isValid: true,
    confidence: 'high',
    linkStatus: 'auto_approved',
    verificationMethod: 'heuristic_name_match',
  };
}
