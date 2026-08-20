'use client';

import React, { useState, useEffect, useMemo, useRef, useTransition } from 'react';
import {
  Heart,
  Search,
  Phone,
  UserCheck,
  Plus,
  Trash2,
  AlertCircle,
  Sparkles,
  User,
  Users,
  ShieldCheck,
  Check,
  Info,
  X,
  Loader2,
} from 'lucide-react';
import { GenderType, FamilyRelationType, FamilyMemberEntry } from '@/types/database.types';
import {
  searchMembersAction,
  getMemberFamilyGraphAction,
  findMemberByPhoneAction,
  SearchedMember,
} from '@/app/actions/member-search';
import { validateFamilyNameLineage } from '@/lib/validation/nameLineageValidation';

export interface FamilyRelationsStepProps {
  isRtl: boolean;
  userDob: string;
  userGender: GenderType;
  userFullNameEn: string;
  userFullNameAr?: string;
  userGovernorate?: string;
  registeredPhone?: string;
  maritalStatus: string;
  setMaritalStatus: (val: string) => void;
  familyMembers: FamilyMemberEntry[];
  setFamilyMembers: React.Dispatch<React.SetStateAction<FamilyMemberEntry[]>>;
  subStepIndex: number; // 1: Marital status, 2: Family mapping
  shakeMissingCards?: boolean;
}

export function calculateAge(dobString: string): number {
  if (!dobString) return 0;
  const birthDate = new Date(dobString);
  if (isNaN(birthDate.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return Math.max(0, age);
}

export const MARITAL_OPTIONS = [
  {
    id: 'single',
    labelEn: 'Single',
    labelAr: 'أعزب',
    descEn: 'Never married',
    descAr: 'لم يسبق لي الزواج',
    iconType: 'user',
  },
  {
    id: 'engaged',
    labelEn: 'Engaged',
    labelAr: 'مخطوب',
    descEn: 'Formally engaged',
    descAr: 'فترة خطوبة رسمية',
    iconType: 'sparkles',
  },
  {
    id: 'married',
    labelEn: 'Married',
    labelAr: 'متزوج',
    descEn: 'Currently married',
    descAr: 'زواج كنسي / مدني قائم',
    iconType: 'heart',
  },
];

export const EXTRA_RELATION_OPTIONS: {
  id: FamilyRelationType;
  labelEn: string;
  labelAr: string;
  minAge?: number;
}[] = [
  { id: 'brother', labelEn: 'Brother', labelAr: 'أخ' },
  { id: 'sister', labelEn: 'Sister', labelAr: 'أخت' },
  { id: 'paternal_uncle', labelEn: 'Paternal Uncle', labelAr: 'عم' },
  { id: 'paternal_aunt', labelEn: 'Paternal Aunt', labelAr: 'عمة' },
  { id: 'maternal_uncle', labelEn: 'Maternal Uncle', labelAr: 'خال' },
  { id: 'maternal_aunt', labelEn: 'Maternal Aunt', labelAr: 'خالة' },
  { id: 'uncle_aunt_spouse', labelEn: 'Uncle / Aunt In-Law', labelAr: 'زوج/زوجة العم أو الخال' },
  { id: 'cousin', labelEn: 'Cousin', labelAr: 'ابن/ابنة عم أو خال' },
  { id: 'grandfather', labelEn: 'Grandfather', labelAr: 'جد' },
  { id: 'grandmother', labelEn: 'Grandmother', labelAr: 'جدة' },
  { id: 'son', labelEn: 'Son', labelAr: 'ابن', minAge: 18 },
  { id: 'daughter', labelEn: 'Daughter', labelAr: 'ابنة', minAge: 18 },
];

export function getRelationLabel(relation: FamilyRelationType, isRtl: boolean): string {
  if (relation === 'father') return isRtl ? 'الأب' : 'Father';
  if (relation === 'mother') return isRtl ? 'الأم' : 'Mother';
  if (relation === 'spouse') return isRtl ? 'شريك الحياة' : 'Spouse';
  const opt = EXTRA_RELATION_OPTIONS.find((o) => o.id === relation);
  if (opt) return isRtl ? opt.labelAr : opt.labelEn;
  return relation;
}

export const FamilyRelationsStep: React.FC<FamilyRelationsStepProps> = ({
  isRtl,
  userDob,
  userGender,
  userFullNameEn,
  userFullNameAr,
  userGovernorate,
  registeredPhone,
  maritalStatus,
  setMaritalStatus,
  familyMembers,
  setFamilyMembers,
  subStepIndex,
  shakeMissingCards,
}) => {
  const userAge = useMemo(() => calculateAge(userDob), [userDob]);
  const isAdult = userAge >= 18;

  // Auto-sync single status if under 18
  useEffect(() => {
    if (!isAdult && maritalStatus !== 'single') {
      setMaritalStatus('single');
    }
  }, [isAdult, maritalStatus, setMaritalStatus]);

  // Ensure baseline family slots: Father, Mother, and Spouse (if Married)
  // No empty "Other Relative" card on initial load
  useEffect(() => {
    setFamilyMembers((prev) => {
      let updated = [...prev];

      // Ensure father entry
      if (!updated.some((m) => m.relation === 'father')) {
        updated.unshift({
          id: 'father_default',
          relation: 'father',
          mode: 'search',
          isDeceased: false,
          countryCode: '+20',
        });
      }

      // Ensure mother entry
      if (!updated.some((m) => m.relation === 'mother')) {
        const fatherIdx = updated.findIndex((m) => m.relation === 'father');
        updated.splice(fatherIdx + 1, 0, {
          id: 'mother_default',
          relation: 'mother',
          mode: 'search',
          isDeceased: false,
          countryCode: '+20',
        });
      }

      // Ensure spouse entry if married
      if (maritalStatus === 'married' && !updated.some((m) => m.relation === 'spouse')) {
        const motherIdx = updated.findIndex((m) => m.relation === 'mother');
        updated.splice(motherIdx + 1, 0, {
          id: 'spouse_default',
          relation: 'spouse',
          mode: 'search',
          isDeceased: false,
          countryCode: '+20',
        });
      } else if (maritalStatus !== 'married') {
        // Remove spouse if not married
        updated = updated.filter((m) => m.relation !== 'spouse');
      }

      return updated;
    });
  }, [maritalStatus, setFamilyMembers]);

  // Member Search State per card
  const [activeSearchId, setActiveSearchId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchedMember[]>([]);
  const [isSearching, startSearching] = useTransition();

  // Search trigger with gender and age constraints
  const handleSearchMembers = (query: string, cardId: string) => {
    setActiveSearchId(cardId);
    setSearchQuery(query);
    if (lineageError?.cardId === cardId) {
      setLineageError(null);
    }
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const targetMember = familyMembers.find((m) => m.id === cardId);
    let filter: { gender?: 'Male' | 'Female'; minAge?: number } | undefined;

    if (targetMember?.relation === 'father') {
      filter = { gender: 'Male', minAge: userAge + 12 };
    } else if (targetMember?.relation === 'mother') {
      filter = { gender: 'Female', minAge: userAge + 12 };
    } else if (targetMember?.relation === 'spouse') {
      filter = { gender: userGender === 'Male' ? 'Female' : 'Male' };
    }

    startSearching(async () => {
      const res = await searchMembersAction(query, userGovernorate, filter);
      if (res.success) {
        // Exclude members already assigned in any card in Step 3
        const assignedProfileIds = new Set(
          familyMembers
            .map((m) => m.memberId)
            .filter((id): id is string => Boolean(id))
        );
        const filtered = res.members.filter((m) => !assignedProfileIds.has(m.id));
        setSearchResults(filtered);
      }
    });
  };

  // Duplicate phone validation helper
  const getPhoneDuplicateError = (cardId: string, phoneStr?: string): string | null => {
    if (!phoneStr || phoneStr.trim().length < 7) return null;
    const cleanPhone = phoneStr.trim().replace(/\D/g, '');
    const cleanRegistered = registeredPhone ? registeredPhone.trim().replace(/\D/g, '') : '';

    if (cleanRegistered && cleanPhone === cleanRegistered) {
      return isRtl
        ? 'لا يمكن استخدام رقم هاتفك الشخصي المسجل به الحساب'
        : 'This phone number is already assigned in your registration.';
    }

    // Check against other family members
    for (const other of familyMembers) {
      if (other.id !== cardId && other.phone) {
        const cleanOther = other.phone.trim().replace(/\D/g, '');
        if (cleanOther && cleanOther === cleanPhone) {
          return isRtl
            ? 'رقم الهاتف مكرر ومستخدم لفرد عائلة آخر'
            : 'This phone number is already assigned in your registration.';
        }
      }
    }
    return null;
  };

  const [autoFillNotice, setAutoFillNotice] = useState<string | null>(null);
  const [lineageError, setLineageError] = useState<{ cardId: string; code?: string; message: string } | null>(null);

  // Anti-Contradiction Deceased Handler
  const handleToggleDeceased = async (cardId: string) => {
    const target = familyMembers.find((m) => m.id === cardId);
    if (!target) return;

    if (!target.isDeceased) {
      // 1. If user attempts to mark Mother as deceased while Father is linked
      if (target.relation === 'mother') {
        const father = familyMembers.find((m) => m.relation === 'father');
        if (father?.memberId && !father.isDeceased) {
          try {
            const fGraph = await getMemberFamilyGraphAction(father.memberId);
            if (fGraph.spouse) {
              setLineageError({
                cardId,
                code: 'ERR_DECEASED_CONFLICT',
                message: isRtl
                  ? 'تعارض: شريك الحياة المسجل في الدليل نشط وحي.'
                  : 'Conflict: The verified spouse record in directory is active and living.',
              });
              return;
            }
          } catch {}
        }
      }

      // 2. If user attempts to mark Father as deceased while Mother is linked
      if (target.relation === 'father') {
        const mother = familyMembers.find((m) => m.relation === 'mother');
        if (mother?.memberId && !mother.isDeceased) {
          try {
            const mGraph = await getMemberFamilyGraphAction(mother.memberId);
            if (mGraph.spouse) {
              setLineageError({
                cardId,
                code: 'ERR_DECEASED_CONFLICT',
                message: isRtl
                  ? 'تعارض: شريك الحياة المسجل في الدليل نشط وحي.'
                  : 'Conflict: The verified spouse record in directory is active and living.',
              });
              return;
            }
          } catch {}
        }
      }
    }

    setLineageError(null);
    handleUpdateCard(cardId, {
      isDeceased: !target.isDeceased,
      mode: !target.isDeceased ? 'deceased' : 'search',
      memberId: null,
      autoLinkedFrom: undefined,
      isAutoDiscovered: false,
    });
  };

  // Select searched member for a card with relational graph resolution & comprehensive validation
  const handleSelectMember = async (cardId: string, member: SearchedMember) => {
    const target = familyMembers.find((m) => m.id === cardId);
    const targetRelation = target?.relation;

    // 0. ERR_DUPLICATE_ENTITY_ROLE: Check if member is already assigned in another family role
    const existingDuplicate = familyMembers.find(
      (m) => m.id !== cardId && m.memberId === member.id
    );
    if (existingDuplicate) {
      const existingRoleLabel = getRelationLabel(existingDuplicate.relation, isRtl);
      setLineageError({
        cardId,
        code: 'ERR_DUPLICATE_ENTITY_ROLE',
        message: isRtl
          ? `هذا الشخص مسجل بالفعل كـ ${existingRoleLabel}. لا يمكن لنفس الفرد أن يشغل أكثر من صلة قرابة.`
          : `This person is already assigned as your ${existingRoleLabel}. An individual cannot occupy multiple family roles.`,
      });
      return;
    }

    // 1. ERR_SELF_LINK Check
    const cleanRegistered = registeredPhone ? registeredPhone.trim().replace(/\D/g, '') : '';
    const cleanMemberPhone = member.phone ? member.phone.trim().replace(/\D/g, '') : '';
    if (cleanRegistered && cleanMemberPhone && cleanRegistered === cleanMemberPhone) {
      setLineageError({
        cardId,
        code: 'ERR_SELF_LINK',
        message: isRtl
          ? 'لا يمكنك اختيار حسابك الشخصي كفرد من العائلة.'
          : 'You cannot select your own account as a family member.',
      });
      return;
    }

    // 2. ERR_GENDER_MISMATCH Check
    if (targetRelation === 'father' && member.gender && member.gender.toLowerCase() !== 'male') {
      setLineageError({
        cardId,
        code: 'ERR_GENDER_MISMATCH',
        message: isRtl
          ? 'نوع الجنس لا يتطابق مع صلة القرابة المحددة (الأب يجب أن يكون ذكر).'
          : 'Gender does not match the required relation.',
      });
      return;
    }
    if (targetRelation === 'mother' && member.gender && member.gender.toLowerCase() !== 'female') {
      setLineageError({
        cardId,
        code: 'ERR_GENDER_MISMATCH',
        message: isRtl
          ? 'نوع الجنس لا يتطابق مع صلة القرابة المحددة (الأم يجب أن تكون أنثى).'
          : 'Gender does not match the required relation.',
      });
      return;
    }

    // 3. ERR_INVALID_AGE_GAP Check
    if (
      (targetRelation === 'father' || targetRelation === 'mother') &&
      member.age &&
      member.age < userAge + 12
    ) {
      setLineageError({
        cardId,
        code: 'ERR_INVALID_AGE_GAP',
        message: isRtl
          ? 'فارق العمر غير صالح لصلة القرابة (يجب أن يكون الوالد/الوالدة أكبر بـ 12 عاماً على الأقل).'
          : 'Invalid age gap for this parent/child relationship.',
      });
      return;
    }
    if (
      (targetRelation === 'son' || targetRelation === 'daughter') &&
      member.age &&
      userAge < member.age + 12
    ) {
      setLineageError({
        cardId,
        code: 'ERR_INVALID_AGE_GAP',
        message: isRtl
          ? 'فارق العمر غير صالح لصلة القرابة (يجب أن تكون أكبر من الابن/الابنة بـ 12 عاماً على الأقل).'
          : 'Invalid age gap for this parent/child relationship.',
      });
      return;
    }

    let graphSpouse: SearchedMember | null = null;
    let graphChildren: SearchedMember[] = [];
    let boundSpouseId: string | null = null;

    // Check if Father is already linked and has a bound spouse in directory
    if (targetRelation === 'mother') {
      const father = familyMembers.find((m) => m.relation === 'father');
      if (father?.memberId) {
        try {
          const fGraph = await getMemberFamilyGraphAction(father.memberId);
          if (fGraph.spouse?.id) {
            boundSpouseId = fGraph.spouse.id;
          }
        } catch {}
      }
    } else if (targetRelation === 'father') {
      const mother = familyMembers.find((m) => m.relation === 'mother');
      if (mother?.memberId) {
        try {
          const mGraph = await getMemberFamilyGraphAction(mother.memberId);
          if (mGraph.spouse?.id) {
            boundSpouseId = mGraph.spouse.id;
          }
        } catch {}
      }
    }

    // Query graph if parent
    if (targetRelation === 'father' || targetRelation === 'mother') {
      try {
        const graph = await getMemberFamilyGraphAction(member.id);
        if (graph.success) {
          graphSpouse = graph.spouse || null;
          graphChildren = graph.children || [];
        }
      } catch {}
    }

    // 4. Lineage Heuristic & Anti-Contradiction Validation
    const validation = validateFamilyNameLineage({
      userFullNameEn,
      userFullNameAr,
      relativeFullNameEn: member.fullNameEn,
      relativeFullNameAr: member.fullNameAr,
      relationType: targetRelation || 'other',
      relativeSpouseNameEn: graphSpouse?.fullNameEn,
      relativeSpouseNameAr: graphSpouse?.fullNameAr,
      boundSpouseId,
      candidateRelativeId: member.id,
    });

    if (!validation.isValid) {
      const err = isRtl
        ? validation.errorAr || 'اسم العضو المختار لا يتطابق مع شجرة العائلة.'
        : validation.errorEn || "The selected member's lineage does not correlate with your account.";
      setLineageError({ cardId, code: validation.errorCode, message: err });
      return;
    }

    setLineageError(null);

    // 5. Update the clicked card with audit status
    setFamilyMembers((prev) =>
      prev.map((m) => {
        if (m.id === cardId) {
          return {
            ...m,
            memberId: member.id,
            fullName: isRtl ? member.fullNameAr : member.fullNameEn,
            isDeceased: false,
            mode: 'search',
            linkStatus: validation.linkStatus,
            verificationMethod: validation.verificationMethod,
            requiresAuditNotice: true,
            autoLinkedFrom: undefined,
          };
        }
        return m;
      })
    );

    setActiveSearchId(null);
    setSearchQuery('');
    setSearchResults([]);

    // 6. Relational Graph Resolution on Parent Selection
    if (targetRelation === 'father' || targetRelation === 'mother') {
      let autoPopulatedCount = 0;

      setFamilyMembers((currentList) => {
        let updatedList = [...currentList];

        // A. Auto-Fill the other parent (Spouse of the selected parent)
        if (graphSpouse) {
          const spouseObj = graphSpouse;
          if (targetRelation === 'father') {
            const motherIdx = updatedList.findIndex((m) => m.relation === 'mother');
            if (motherIdx !== -1) {
              const motherEntry = updatedList[motherIdx];
              if (!motherEntry.memberId && !motherEntry.isDeceased) {
                updatedList[motherIdx] = {
                  ...motherEntry,
                  memberId: spouseObj.id,
                  fullName: isRtl ? spouseObj.fullNameAr : spouseObj.fullNameEn,
                  mode: 'search',
                  isDeceased: false,
                  autoLinkedFrom: 'father',
                  linkStatus: 'auto_approved',
                  verificationMethod: 'graph_resolution',
                  requiresAuditNotice: true,
                };
                autoPopulatedCount++;
              }
            }
          } else if (targetRelation === 'mother') {
            const fatherIdx = updatedList.findIndex((m) => m.relation === 'father');
            if (fatherIdx !== -1) {
              const fatherEntry = updatedList[fatherIdx];
              if (!fatherEntry.memberId && !fatherEntry.isDeceased) {
                updatedList[fatherIdx] = {
                  ...fatherEntry,
                  memberId: spouseObj.id,
                  fullName: isRtl ? spouseObj.fullNameAr : spouseObj.fullNameEn,
                  mode: 'search',
                  isDeceased: false,
                  autoLinkedFrom: 'mother',
                  linkStatus: 'auto_approved',
                  verificationMethod: 'graph_resolution',
                  requiresAuditNotice: true,
                };
                autoPopulatedCount++;
              }
            }
          }
        }

        // B. Auto-Fill Siblings (Children of the selected parent)
        if (graphChildren && graphChildren.length > 0) {
          for (const child of graphChildren) {
            const alreadyExists = updatedList.some(
              (m) =>
                m.memberId === child.id ||
                (m.fullName && m.fullName.trim().toLowerCase() === (isRtl ? child.fullNameAr : child.fullNameEn).trim().toLowerCase())
            );
            if (!alreadyExists) {
              const siblingRelation: FamilyRelationType = child.gender === 'Female' ? 'sister' : 'brother';
              updatedList.push({
                id: `sibling_auto_${child.id}_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
                relation: siblingRelation,
                memberId: child.id,
                fullName: isRtl ? child.fullNameAr : child.fullNameEn,
                isDeceased: false,
                mode: 'search',
                countryCode: '+20',
                autoLinkedFrom: targetRelation === 'father' ? 'father' : 'mother',
                isAutoDiscovered: true,
                linkStatus: 'auto_approved',
                verificationMethod: 'graph_resolution',
                requiresAuditNotice: true,
              });
              autoPopulatedCount++;
            }
          }
        }

        return updatedList;
      });

      if (autoPopulatedCount > 0) {
        const msg = isRtl
          ? `⚡ تم التحقق من النسب واكتشاف ${autoPopulatedCount} من أفراد العائلة تلقائياً عبر شجرة العائلة!`
          : `⚡ Name lineage verified & mapped ${autoPopulatedCount} family member(s) via relational graph!`;
        setAutoFillNotice(msg);
        setTimeout(() => setAutoFillNotice(null), 6000);
      }
    }
  };

  // Isolated Removal: Clicking X removes ONLY this member's link. Others remain in state.
  const handleClearSelectedMember = (cardId: string) => {
    setLineageError(null);

    setFamilyMembers((prev) =>
      prev.map((m) => {
        if (m.id === cardId) {
          return {
            ...m,
            memberId: null,
            fullName: '',
            phone: '',
            isDeceased: false,
            mode: 'search' as const,
            autoLinkedFrom: undefined,
            isAutoDiscovered: false,
            linkStatus: undefined,
            verificationMethod: undefined,
            requiresAuditNotice: false,
          };
        }
        return m;
      })
    );
  };

  // Add extra family member
  const handleAddExtraMember = (relation: FamilyRelationType) => {
    if (lineageError) setLineageError(null);
    const newEntry: FamilyMemberEntry = {
      id: `member_${relation}_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      relation,
      fullName: '',
      phone: '',
      isDeceased: false,
      mode: 'search',
      countryCode: '+20',
    };
    setFamilyMembers((prev) => [...prev, newEntry]);
  };

  // Remove optional family member card
  const handleRemoveMember = (cardId: string) => {
    if (lineageError?.cardId === cardId) setLineageError(null);
    setFamilyMembers((prev) => prev.filter((m) => m.id !== cardId));
  };

  // Update card state & auto-clear error on input
  const handleUpdateCard = (cardId: string, updates: Partial<FamilyMemberEntry>) => {
    if (lineageError?.cardId === cardId) {
      setLineageError(null);
    }
    setFamilyMembers((prev) =>
      prev.map((m) => (m.id === cardId ? { ...m, ...updates } : m))
    );
  };

  // Phone auto-discovery lookup ref & debounced handler
  const phoneLookupTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});

  const handlePhoneInputChange = (cardId: string, rawDigits: string, countryCode?: string) => {
    const cleanDigits = rawDigits.replace(/\D/g, '');
    handleUpdateCard(cardId, { phone: cleanDigits });

    if (phoneLookupTimeoutRef.current[cardId]) {
      clearTimeout(phoneLookupTimeoutRef.current[cardId]);
    }

    if (cleanDigits.length >= 8) {
      phoneLookupTimeoutRef.current[cardId] = setTimeout(async () => {
        const cc = countryCode || '+20';
        try {
          const res = await findMemberByPhoneAction(cc, cleanDigits);
          if (res.success && res.member) {
            // Auto-resolve as linked verified member and trigger relational graph
            handleSelectMember(cardId, res.member);
          }
        } catch {}
      }, 300);
    }
  };

  // Helper validation checkers
  const isFatherFulfilled = useMemo(() => {
    const f = familyMembers.find((m) => m.relation === 'father');
    if (!f) return false;
    const hasDup = getPhoneDuplicateError(f.id, f.phone);
    return Boolean(f.isDeceased || f.memberId || (!hasDup && f.phone?.trim() && f.phone.trim().length >= 8));
  }, [familyMembers, registeredPhone]);

  const isMotherFulfilled = useMemo(() => {
    const m = familyMembers.find((m) => m.relation === 'mother');
    if (!m) return false;
    const hasDup = getPhoneDuplicateError(m.id, m.phone);
    return Boolean(m.isDeceased || m.memberId || (!hasDup && m.phone?.trim() && m.phone.trim().length >= 8));
  }, [familyMembers, registeredPhone]);

  const isSpouseFulfilled = useMemo(() => {
    if (maritalStatus !== 'married') return true;
    const s = familyMembers.find((m) => m.relation === 'spouse');
    if (!s) return false;
    const hasDup = getPhoneDuplicateError(s.id, s.phone);
    return Boolean(s.isDeceased || s.memberId || (!hasDup && s.phone?.trim() && s.phone.trim().length >= 8));
  }, [familyMembers, maritalStatus, registeredPhone]);

  // Render Part 1: Marital Status (For 18+)
  if (subStepIndex === 1 && isAdult) {
    return (
      <div className="space-y-4 animate-fadeIn py-1">
        {/* Header Indicator */}
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            <bdi>{isRtl ? 'اختر حالتك الاجتماعية الحالية:' : 'Select your current marital status:'}</bdi>
          </span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            <bdi>{isRtl ? `العمر: ${userAge} سنة` : `Age: ${userAge} yrs`}</bdi>
          </span>
        </div>

        {/* Marital Status Grid Options with Clean Lucide Icons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {MARITAL_OPTIONS.map((opt) => {
            const isSelected = maritalStatus === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setMaritalStatus(opt.id)}
                className={`group relative flex items-center gap-3.5 p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer text-start select-none ${
                  isSelected
                    ? 'border-[#0B57D0] dark:border-[#A8C7FA] bg-blue-50/80 dark:bg-blue-950/40 shadow-sm ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs'
                }`}
              >
                {/* Clean Vector Icon Container */}
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                    isSelected
                      ? 'bg-blue-100 dark:bg-blue-900/60 text-[#0B57D0] dark:text-[#93C5FD]'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {opt.iconType === 'user' && <User className="w-5 h-5" />}
                  {opt.iconType === 'sparkles' && <Sparkles className="w-5 h-5 text-amber-500" />}
                  {opt.iconType === 'heart' && <Heart className="w-5 h-5 text-rose-500" />}
                </div>

                {/* Text & Description */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      <bdi>{isRtl ? opt.labelAr : opt.labelEn}</bdi>
                    </span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-[#06337E] flex items-center justify-center animate-scaleIn">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    <bdi>{isRtl ? opt.descAr : opt.descEn}</bdi>
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Info Callout */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-800/50 text-xs text-blue-900 dark:text-blue-200 mt-2">
          <Info className="w-4 h-4 shrink-0 text-[#0B57D0] dark:text-[#93C5FD] mt-0.5" />
          <p className="leading-relaxed">
            <bdi>
              {isRtl
                ? 'تساعد الحالة الاجتماعية في ربط العائلات بالأنشطة الرعوية والاجتماعية المناسبة لكل مرحلة.'
                : 'Marital status helps connect family units to pastoral and community activities appropriate for each stage.'}
            </bdi>
          </p>
        </div>
      </div>
    );
  }

  // Render Part 2: Mandatory Parents & Family Relations Mapping
  return (
    <div className="space-y-4 animate-fadeIn py-1">
      {/* Real-time Status Fulfillment Checklist with Clean Icons */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
          <ShieldCheck className="w-4 h-4 text-[#0B57D0] dark:text-[#93C5FD]" />
          <span><bdi>{isRtl ? 'اكتمال بيانات الوالدين:' : 'Parents Mapping Status:'}</bdi></span>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-medium">
          {/* Father Status Chip */}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border ${
              isFatherFulfilled
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700'
            }`}
          >
            <User className="w-3 h-3 text-blue-500" />
            <span><bdi>{isRtl ? 'الأب' : 'Father'}</bdi></span>
            {isFatherFulfilled ? <Check className="w-3 h-3 stroke-[2.5]" /> : <span>*</span>}
          </span>

          {/* Mother Status Chip */}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border ${
              isMotherFulfilled
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700'
            }`}
          >
            <UserCheck className="w-3 h-3 text-rose-500" />
            <span><bdi>{isRtl ? 'الأم' : 'Mother'}</bdi></span>
            {isMotherFulfilled ? <Check className="w-3 h-3 stroke-[2.5]" /> : <span>*</span>}
          </span>

          {/* Spouse Status Chip (if Married) */}
          {maritalStatus === 'married' && (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border ${
                isSpouseFulfilled
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                  : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700'
              }`}
            >
              <Heart className="w-3 h-3 text-rose-500" />
              <span><bdi>{userGender === 'Female' ? (isRtl ? 'الزوج' : 'Husband') : (isRtl ? 'الزوجة' : 'Wife')}</bdi></span>
              {isSpouseFulfilled ? <Check className="w-3 h-3 stroke-[2.5]" /> : <span>*</span>}
            </span>
          )}
        </div>
      </div>

      {/* Auto-population Success Toast Notice */}
      {autoFillNotice && (
        <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 border border-purple-500/30 dark:border-purple-500/40 text-xs text-purple-900 dark:text-purple-200 animate-fadeIn shadow-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 animate-pulse" />
            <span className="font-semibold"><bdi>{autoFillNotice}</bdi></span>
          </div>
          <button
            type="button"
            onClick={() => setAutoFillNotice(null)}
            className="text-purple-600 dark:text-purple-400 hover:text-purple-800 p-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Family Member Cards List */}
      <div className="space-y-3.5">
        {familyMembers.map((member) => {
          const isFather = member.relation === 'father';
          const isMother = member.relation === 'mother';
          const isSpouse = member.relation === 'spouse';
          const isMandatory = isFather || isMother || (isSpouse && maritalStatus === 'married');

          // Localized relation labels & vector icons
          let titleEn = 'Family Member';
          let titleAr = 'فرد من العائلة';
          let IconComponent = Users;
          let iconColorClass = 'text-slate-600 dark:text-slate-400';

          if (isFather) {
            titleEn = 'Father (Required)';
            titleAr = 'الأب (إلزامي)';
            IconComponent = User;
            iconColorClass = 'text-blue-600 dark:text-blue-400';
          } else if (isMother) {
            titleEn = 'Mother (Required)';
            titleAr = 'الأم (إلزامي)';
            IconComponent = UserCheck;
            iconColorClass = 'text-rose-500 dark:text-rose-400';
          } else if (isSpouse) {
            titleEn = userGender === 'Female' ? 'Husband (Required)' : 'Wife (Required)';
            titleAr = userGender === 'Female' ? 'الزوج (إلزامي)' : 'الزوجة (إلزامي)';
            IconComponent = Heart;
            iconColorClass = 'text-rose-500 dark:text-rose-400';
          } else {
            const extra = EXTRA_RELATION_OPTIONS.find((e) => e.id === member.relation);
            if (extra) {
              titleEn = extra.labelEn;
              titleAr = extra.labelAr;
              IconComponent =
                extra.id === 'brother' ||
                extra.id === 'son' ||
                extra.id === 'paternal_uncle' ||
                extra.id === 'maternal_uncle' ||
                extra.id === 'grandfather'
                  ? User
                  : extra.id === 'sister' ||
                    extra.id === 'daughter' ||
                    extra.id === 'paternal_aunt' ||
                    extra.id === 'maternal_aunt' ||
                    extra.id === 'grandmother'
                  ? UserCheck
                  : Users;
              iconColorClass = 'text-indigo-600 dark:text-indigo-400';
            }
          }

          const isCardFulfilled =
            member.isDeceased ||
            member.memberId ||
            (member.phone?.trim() && member.phone.trim().length >= 8);

          const hasCardError =
            lineageError?.cardId === member.id ||
            (Boolean(shakeMissingCards) && isMandatory && !isCardFulfilled);

          return (
            <div
              key={member.id}
              className={`rounded-2xl border p-3.5 transition-all duration-200 ${
                hasCardError
                  ? 'animate-card-error bg-red-50/30 dark:bg-red-950/20 border-red-500 shadow-sm'
                  : member.isDeceased
                  ? 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                  : member.memberId
                  ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-500/40 dark:border-emerald-500/50 shadow-xs'
                  : isCardFulfilled
                  ? 'bg-white dark:bg-slate-800/60 border-emerald-500/40 dark:border-emerald-500/50 shadow-xs'
                  : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800 gap-2">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700/60 ${iconColorClass}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <bdi>{isRtl ? titleAr : titleEn}</bdi>
                      {isMandatory && !member.isDeceased && !isCardFulfilled && (
                        <span className="text-[10px] text-rose-500 font-semibold">*</span>
                      )}
                    </h3>
                  </div>
                </div>

                {/* Header Action: Remove button for optional extra members */}
                {!isMandatory && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(member.id)}
                    className="p-1 text-slate-400 hover:text-red-500 transition cursor-pointer"
                    title={isRtl ? 'حذف' : 'Remove'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Card Body */}
              <div className="pt-3">
                {/* 1. Verified Linked Member State (Clean Profile Card, Switcher is Hidden) */}
                {member.memberId ? (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 animate-fadeIn">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                        {member.fullName?.charAt(0) || '✓'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {member.fullName}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                            <bdi>{isRtl ? 'تم الربط بحساب العضو ✓' : 'Linked to Verified Member ✓'}</bdi>
                          </span>
                          {member.autoLinkedFrom && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/70 px-1.5 py-0.5 rounded border border-purple-200 dark:border-purple-800">
                              <Sparkles className="w-2.5 h-2.5 text-purple-500" />
                              <bdi>
                                {member.autoLinkedFrom === 'father'
                                  ? isRtl
                                    ? 'تلقائي عبر الوالد'
                                    : 'Auto via Father'
                                  : isRtl
                                  ? 'تلقائي عبر الوالدة'
                                  : 'Auto via Mother'}
                              </bdi>
                            </span>
                          )}
                          {member.isAutoDiscovered && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-950/70 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                              <Sparkles className="w-2.5 h-2.5 text-indigo-500" />
                              <bdi>{isRtl ? 'شقيق مكتشف' : 'Auto Sibling'}</bdi>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleClearSelectedMember(member.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
                      title={isRtl ? 'إلغاء الربط' : 'Disconnect'}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : member.isDeceased ? (
                  /* 2. Deceased State (Clean Banner with Undo button, Switcher is Hidden) */
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 animate-fadeIn">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <span className="text-sm">🕊️</span>
                      <span>
                        <bdi>{isRtl ? 'تم تحديد الحالة: متوفى (معفى من الربط)' : 'Marked as Deceased (Linking Waived)'}</bdi>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleUpdateCard(member.id, { isDeceased: false, mode: 'search' })}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition cursor-pointer"
                      title={isRtl ? 'تغيير' : 'Change'}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  /* 3. Unlinked State: Show Switcher + Inputs + Deceased Option */
                  <div className="space-y-3">
                    {/* Strategy Tabs: Search vs Manual Phone Input */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleUpdateCard(member.id, { mode: 'search' })}
                        className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer border ${
                          member.mode === 'search'
                            ? 'bg-[#0B57D0] text-white border-[#0B57D0] shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 border-transparent hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span><bdi>{isRtl ? 'بحث في دليل الأعضاء' : 'Search Member'}</bdi></span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleUpdateCard(member.id, { mode: 'manual' })}
                        className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer border ${
                          member.mode === 'manual'
                            ? 'bg-[#0B57D0] text-white border-[#0B57D0] shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 border-transparent hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span><bdi>{isRtl ? 'غير مسجل / إدخال الهاتف' : 'Enter Phone'}</bdi></span>
                      </button>
                    </div>

                    {/* Mode: Search View */}
                    {member.mode === 'search' && (
                      <div className="space-y-1 relative">
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            dir={isRtl ? 'rtl' : 'ltr'}
                            placeholder={
                              isRtl
                                ? `ابحث بالاسم (عربي / إنجليزي) أو برقم الهاتف...`
                                : `Search by name (English / Arabic) or phone...`
                            }
                            value={activeSearchId === member.id ? searchQuery : ''}
                            onChange={(e) => handleSearchMembers(e.target.value, member.id)}
                            onFocus={() => setActiveSearchId(member.id)}
                            className="w-full h-[46px] ps-9 pe-8 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-[#1F1F1F] dark:text-[#E3E3E3] placeholder:text-slate-400 focus:border-[#0B57D0] dark:focus:border-[#A8C7FA] focus:outline-none transition-all"
                          />
                          <Search className="w-4 h-4 text-slate-400 absolute start-3 pointer-events-none" />
                          {isSearching && activeSearchId === member.id && (
                            <Loader2 className="w-4 h-4 text-[#0B57D0] animate-spin absolute end-3" />
                          )}
                        </div>

                        {/* Auto-suggest Dropdown with Embedded Deceased Option */}
                        {activeSearchId === member.id && searchResults.length > 0 && (
                          <div className="absolute z-30 start-0 end-0 mt-1 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden max-h-[260px] overflow-y-auto animate-fadeIn">
                            {searchResults.map((sr) => (
                              <button
                                key={sr.id}
                                type="button"
                                onClick={() => handleSelectMember(member.id, sr)}
                                className="w-full flex items-center justify-between p-2.5 hover:bg-blue-50 dark:hover:bg-slate-800 transition cursor-pointer text-start border-b border-slate-100 dark:border-slate-800 last:border-0"
                              >
                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                  <div className="w-8 h-8 rounded-full bg-[#0B57D0] text-white flex items-center justify-center font-bold text-xs shrink-0">
                                    {sr.fullNameAr.charAt(0) || sr.fullNameEn.charAt(0)}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                        {sr.fullNameAr}
                                      </p>
                                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                        • {sr.fullNameEn}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400 flex-wrap">
                                      {sr.phone && (
                                        <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-mono font-medium">
                                          <Phone className="w-2.5 h-2.5" />
                                          {sr.phone}
                                        </span>
                                      )}
                                      {sr.church && <span>{sr.church}</span>}
                                      {sr.governorate && <span>({sr.governorate})</span>}
                                    </div>
                                  </div>
                                </div>

                                {sr.age && (
                                  <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 shrink-0 ms-2">
                                    <bdi>{sr.age} {isRtl ? 'سنة' : 'yrs'}</bdi>
                                  </span>
                                )}
                              </button>
                            ))}

                            {/* Embedded Deceased Option in Search Dropdown */}
                            <button
                              type="button"
                              onClick={() => {
                                handleToggleDeceased(member.id);
                                setActiveSearchId(null);
                              }}
                              className="w-full p-2.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-start flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 font-medium transition cursor-pointer"
                            >
                              <span>🕊️</span>
                              <span><bdi>{isRtl ? 'تحديد هذا الفرد كـ متوفى' : 'Mark this person as Deceased'}</bdi></span>
                            </button>
                          </div>
                        )}

                        {/* Lineage Mismatch Error Banner */}
                        {lineageError && lineageError.cardId === member.id && (
                          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-700 dark:text-rose-300 animate-fadeIn mt-1.5">
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                            <div className="leading-snug">
                              <bdi>{lineageError.message}</bdi>
                            </div>
                          </div>
                        )}

                        {/* Deceased Quick Action Button */}
                        <div className="flex items-center justify-between pt-1">
                          <p className="text-[10px] text-slate-400 dark:text-slate-500">
                            <bdi>
                              {isRtl
                                ? 'إذا لم تجد حسابه بالبحث، يمكنك اختيار "إدخال الهاتف".'
                                : 'If not found in directory, choose "Enter Phone".'}
                            </bdi>
                          </p>
                          <button
                            type="button"
                            onClick={() => handleToggleDeceased(member.id)}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition cursor-pointer"
                          >
                            <span>🕊️</span>
                            <span><bdi>{isRtl ? 'تحديد كـ متوفى؟' : 'Mark as Deceased?'}</bdi></span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Mode: Manual Phone Input View */}
                    {member.mode === 'manual' && (
                      <div className="space-y-2 animate-fadeIn">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {/* Name Input */}
                          <input
                            type="text"
                            placeholder={isRtl ? 'الاسم بالكامل' : 'Full Name'}
                            value={member.fullName || ''}
                            onChange={(e) => handleUpdateCard(member.id, { fullName: e.target.value })}
                            className="h-[46px] px-3 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-[#1F1F1F] dark:text-[#E3E3E3] placeholder:text-slate-400 focus:border-[#0B57D0] dark:focus:border-[#A8C7FA] focus:outline-none"
                          />

                          {/* Phone Input with Country Code */}
                          <div
                            className={`flex items-center h-[46px] rounded-xl border bg-transparent ${
                              getPhoneDuplicateError(member.id, member.phone)
                                ? 'border-rose-400 dark:border-rose-600 focus-within:border-rose-500 ring-1 ring-rose-500/20'
                                : 'border-slate-300 dark:border-slate-700 focus-within:border-[#0B57D0] dark:focus-within:border-[#A8C7FA]'
                            }`}
                          >
                            <span className="text-xs font-mono px-2.5 text-slate-500 select-none border-e border-slate-200 dark:border-slate-700">
                              {member.countryCode || '+20'}
                            </span>
                              <input
                                type="tel"
                                dir="ltr"
                                placeholder="01012345678"
                                value={member.phone || ''}
                                onChange={(e) =>
                                  handlePhoneInputChange(member.id, e.target.value, member.countryCode)
                                }
                                className="w-full h-full px-2 text-xs bg-transparent text-[#1F1F1F] dark:text-[#E3E3E3] placeholder:text-slate-400 focus:outline-none font-mono"
                              />
                          </div>
                        </div>

                        {/* Lineage / Conflict Error Banner in Manual View */}
                        {lineageError && lineageError.cardId === member.id && (
                          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-700 dark:text-rose-300 animate-fadeIn">
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                            <div className="leading-snug">
                              <bdi>{lineageError.message}</bdi>
                            </div>
                          </div>
                        )}

                        {/* Phone Duplicate Warning */}
                        {getPhoneDuplicateError(member.id, member.phone) && (
                          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-[11px] text-rose-700 dark:text-rose-300 animate-fadeIn">
                            <span className="w-3.5 h-3.5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[9px] font-bold shrink-0">
                              !
                            </span>
                            <span><bdi>{getPhoneDuplicateError(member.id, member.phone)}</bdi></span>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-1">
                          <p className="text-[10px] text-slate-400 dark:text-slate-500">
                            <bdi>
                              {isRtl
                                ? 'سيتم ربط الحساب تلقائياً عند انضمامه للمنصة.'
                                : 'Will be automatically linked once they register.'}
                            </bdi>
                          </p>
                          <button
                            type="button"
                            onClick={() => handleToggleDeceased(member.id)}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition cursor-pointer"
                          >
                            <span>🕊️</span>
                            <span><bdi>{isRtl ? 'تحديد كـ متوفى؟' : 'Mark as Deceased?'}</bdi></span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dynamic Family Member Add Badges (+ Add Member, Filtered by Age) */}
      <div className="pt-2">
        <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <Plus className="w-3.5 h-3.5 text-[#0B57D0] dark:text-[#93C5FD]" />
          <span><bdi>{isRtl ? 'إضافة أفراد آخرين من العائلة:' : 'Add Other Family Members:'}</bdi></span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {EXTRA_RELATION_OPTIONS.filter((opt) => !opt.minAge || userAge >= opt.minAge).map(
            (opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleAddExtraMember(opt.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-[#0B57D0] dark:hover:text-[#93C5FD] border border-slate-200 dark:border-slate-700 transition cursor-pointer shadow-xs"
              >
                <Plus className="w-3 h-3" />
                <span><bdi>{isRtl ? opt.labelAr : opt.labelEn}</bdi></span>
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};
