/**
 * Intelligent Name Heuristics Matcher and Lineage Cross-Verification Engine
 * for Politia Family Relations Mapping.
 */

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
  ['guirguis', 'girgis', 'george', 'giorgis', 'gerges', 'gurgus', 'girguis'],
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

import { FamilyRelationType } from '@/types/database.types';

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
    // If she is the verified bound spouse of the father in the graph
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
    // If he is the verified bound spouse of the mother in the graph
    return {
      isValid: true,
      confidence: 'high',
      linkStatus: 'auto_approved',
      verificationMethod: 'graph_resolution',
    };
  }

  // 1. Father Validation
  if (relationType === 'father') {
    const userTokensEn = extractNameTokens(userFullNameEn);
    const userTokensAr = extractNameTokens(userFullNameAr || '');
    const fatherTokensEn = extractNameTokens(relativeFullNameEn);
    const fatherTokensAr = extractNameTokens(relativeFullNameAr || '');

    let isFatherFirstMatch = false;
    let isGrandfatherMatch = false;

    // Check English
    if (userTokensEn.length >= 2 && fatherTokensEn.length >= 1) {
      const userFatherNameEn = userTokensEn[1];
      const fatherFirstEn = fatherTokensEn[0];
      if (areNameTokensMatching(userFatherNameEn, fatherFirstEn)) {
        isFatherFirstMatch = true;
      }
      if (userTokensEn.length >= 3 && fatherTokensEn.length >= 2) {
        const userGrandfatherEn = userTokensEn[2];
        const fatherFatherEn = fatherTokensEn[1];
        if (areNameTokensMatching(userGrandfatherEn, fatherFatherEn)) {
          isGrandfatherMatch = true;
        }
      }
    }

    // Check Arabic
    if (userTokensAr.length >= 2 && fatherTokensAr.length >= 1) {
      const userFatherNameAr = userTokensAr[1];
      const fatherFirstAr = fatherTokensAr[0];
      if (areNameTokensMatching(userFatherNameAr, fatherFirstAr)) {
        isFatherFirstMatch = true;
      }
      if (userTokensAr.length >= 3 && fatherTokensAr.length >= 2) {
        const userGrandfatherAr = userTokensAr[2];
        const fatherFatherAr = fatherTokensAr[1];
        if (areNameTokensMatching(userGrandfatherAr, fatherFatherAr)) {
          isGrandfatherMatch = true;
        }
      }
    }

    if (isFatherFirstMatch) {
      return {
        isValid: true,
        confidence: isGrandfatherMatch ? 'high' : 'medium',
        linkStatus: 'auto_approved',
        verificationMethod: 'heuristic_name_match',
      };
    }

    return {
      isValid: false,
      confidence: 'low',
      linkStatus: 'disputed',
      verificationMethod: 'heuristic_name_match',
      errorCode: 'ERR_FATHER_LINEAGE_MISMATCH',
      errorEn: 'Lineage mismatch: The selected father does not match your patronymic names.',
      errorAr: 'عدم تطابق في النسب: اسم الأب المختار لا يتطابق مع الاسم المسجل في هويتك.',
    };
  }

  // 2. Mother Validation
  if (relationType === 'mother') {
    const userTokensEn = extractNameTokens(userFullNameEn);
    const userTokensAr = extractNameTokens(userFullNameAr || '');

    // If mother has a registered spouse name, check against user's father name
    if (relativeSpouseNameEn || relativeSpouseNameAr) {
      let isSpouseFatherMatch = false;
      const spouseTokensEn = extractNameTokens(relativeSpouseNameEn || '');
      const spouseTokensAr = extractNameTokens(relativeSpouseNameAr || '');

      if (userTokensEn.length >= 2 && spouseTokensEn.length >= 1) {
        if (areNameTokensMatching(userTokensEn[1], spouseTokensEn[0])) {
          isSpouseFatherMatch = true;
        }
      }

      if (userTokensAr.length >= 2 && spouseTokensAr.length >= 1) {
        if (areNameTokensMatching(userTokensAr[1], spouseTokensAr[0])) {
          isSpouseFatherMatch = true;
        }
      }

      if (isSpouseFatherMatch) {
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

  // 3. Siblings Validation
  if (relationType === 'brother' || relationType === 'sister') {
    const userTokensEn = extractNameTokens(userFullNameEn);
    const userTokensAr = extractNameTokens(userFullNameAr || '');
    const siblingTokensEn = extractNameTokens(relativeFullNameEn);
    const siblingTokensAr = extractNameTokens(relativeFullNameAr || '');

    let isSiblingFatherMatch = false;
    if (userTokensEn.length >= 2 && siblingTokensEn.length >= 2) {
      if (areNameTokensMatching(userTokensEn[1], siblingTokensEn[1])) {
        isSiblingFatherMatch = true;
      }
    }
    if (userTokensAr.length >= 2 && siblingTokensAr.length >= 2) {
      if (areNameTokensMatching(userTokensAr[1], siblingTokensAr[1])) {
        isSiblingFatherMatch = true;
      }
    }

    if (isSiblingFatherMatch) {
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
      errorCode: 'ERR_SIBLING_LINEAGE_MISMATCH',
      errorEn: 'Selected sibling does not share the same father/grandfather lineage.',
      errorAr: 'الشقيق المختار لا يشترك في نفس نسب الأب أو الجد.',
    };
  }

  // 4. Paternal Uncle / Aunt Validation
  if (
    relationType === 'uncle' ||
    relationType === 'aunt' ||
    relationType === 'paternal_uncle' ||
    relationType === 'paternal_aunt'
  ) {
    const userTokensEn = extractNameTokens(userFullNameEn);
    const userTokensAr = extractNameTokens(userFullNameAr || '');
    const uncleTokensEn = extractNameTokens(relativeFullNameEn);
    const uncleTokensAr = extractNameTokens(relativeFullNameAr || '');

    let isGrandfatherMatch = false;
    // User Grandfather is token 2, Uncle's Father is token 1
    if (userTokensEn.length >= 3 && uncleTokensEn.length >= 2) {
      if (areNameTokensMatching(userTokensEn[2], uncleTokensEn[1])) {
        isGrandfatherMatch = true;
      }
    }
    if (userTokensAr.length >= 3 && uncleTokensAr.length >= 2) {
      if (areNameTokensMatching(userTokensAr[2], uncleTokensAr[1])) {
        isGrandfatherMatch = true;
      }
    }

    if (isGrandfatherMatch) {
      return {
        isValid: true,
        confidence: 'high',
        linkStatus: 'auto_approved',
        verificationMethod: 'heuristic_name_match',
      };
    }

    if (userTokensEn.length < 3 && userTokensAr.length < 3) {
      // If user provided only 2 name tokens, allow as pending review
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
      errorEn: "Paternal uncle/aunt must share your grandfather's name.",
      errorAr: 'اسم والد العم/العمة يجب أن يتطابق مع اسم جدك المسجل.',
    };
  }

  // 5. Grandfather Validation
  if (relationType === 'grandfather') {
    const userTokensEn = extractNameTokens(userFullNameEn);
    const userTokensAr = extractNameTokens(userFullNameAr || '');
    const gfTokensEn = extractNameTokens(relativeFullNameEn);
    const gfTokensAr = extractNameTokens(relativeFullNameAr || '');

    let isGfMatch = false;
    if (userTokensEn.length >= 3 && gfTokensEn.length >= 1) {
      if (areNameTokensMatching(userTokensEn[2], gfTokensEn[0])) {
        isGfMatch = true;
      }
    }
    if (userTokensAr.length >= 3 && gfTokensAr.length >= 1) {
      if (areNameTokensMatching(userTokensAr[2], gfTokensAr[0])) {
        isGfMatch = true;
      }
    }

    if (isGfMatch) {
      return {
        isValid: true,
        confidence: 'high',
        linkStatus: 'auto_approved',
        verificationMethod: 'heuristic_name_match',
      };
    }
  }

  // Default fallback for Spouse, Grandmother, Maternal Uncle/Aunt, Cousin, etc.
  return {
    isValid: true,
    confidence: 'high',
    linkStatus: 'auto_approved',
    verificationMethod: 'heuristic_name_match',
  };
}
