export interface SubStepConfig {
  id: string;
  titleKey: string;
  labelEn: string;
  labelAr: string;
  component: string;
  isOptional?: boolean;
}

export interface MainStepConfig {
  stepIndex: number;
  id: string;
  titleKey: string;
  titleEn: string;
  titleAr: string;
  subSteps: SubStepConfig[];
}

export const REGISTRATION_SCHEMA: MainStepConfig[] = [
  {
    stepIndex: 1,
    id: 'personal_info',
    titleKey: 'auth.register.steps.personal_info',
    titleEn: 'Personal Info',
    titleAr: 'البيانات الشخصية',
    subSteps: [
      {
        id: 'full_name_en',
        titleKey: 'auth.fields.name_en',
        labelEn: 'Full Name (English)',
        labelAr: 'الاسم بالإنجليزية',
        component: 'FullNameEnInput',
      },
      {
        id: 'full_name_ar',
        titleKey: 'auth.fields.name_ar',
        labelEn: 'Full Name (Arabic)',
        labelAr: 'الاسم بالعربية',
        component: 'FullNameArInput',
      },
      {
        id: 'gender',
        titleKey: 'auth.fields.gender',
        labelEn: 'Gender',
        labelAr: 'النوع',
        component: 'GenderSelector',
      },
      {
        id: 'dob',
        titleKey: 'auth.fields.dob',
        labelEn: 'Date of Birth',
        labelAr: 'تاريخ الميلاد',
        component: 'DatePicker',
      },
      {
        id: 'national_id',
        titleKey: 'auth.fields.national_id',
        labelEn: 'National ID',
        labelAr: 'الرقم القومي',
        component: 'NationalIdInput',
      },
      {
        id: 'avatar',
        titleKey: 'auth.fields.avatar',
        labelEn: 'Profile Picture',
        labelAr: 'الصورة الشخصية',
        component: 'AvatarUpload',
        isOptional: true,
      },
    ],
  },
  {
    stepIndex: 2,
    id: 'contact_social',
    titleKey: 'auth.register.steps.contact_social',
    titleEn: 'Contact & Social',
    titleAr: 'بيانات التواصل',
    subSteps: [
      {
        id: 'phone',
        titleKey: 'auth.fields.phone',
        labelEn: 'Phone Number',
        labelAr: 'رقم الموبايل',
        component: 'PhoneInput',
      },
      {
        id: 'email',
        titleKey: 'auth.fields.email',
        labelEn: 'Email Address',
        labelAr: 'البريد الإلكتروني',
        component: 'EmailInput',
      },
      {
        id: 'landline',
        titleKey: 'auth.fields.landline',
        labelEn: 'Home Phone',
        labelAr: 'التليفون الأرضي',
        component: 'LandlineInput',
        isOptional: true,
      },
      {
        id: 'social_links',
        titleKey: 'auth.fields.social_links',
        labelEn: 'Social Media Accounts',
        labelAr: 'وسائل التواصل',
        component: 'SocialLinksInputs',
        isOptional: true,
      },
    ],
  },
  {
    stepIndex: 3,
    id: 'relations',
    titleKey: 'auth.register.steps.relations',
    titleEn: 'Family Relations',
    titleAr: 'شبكة العلاقات الأسرية',
    subSteps: [
      {
        id: 'guardian_links',
        titleKey: 'auth.fields.guardian_links',
        labelEn: 'Family Links & Guardian Mapping',
        labelAr: 'الربط العائلي وولي الأمر',
        component: 'FamilyLinksStep',
      },
    ],
  },
  {
    stepIndex: 4,
    id: 'education_work',
    titleKey: 'auth.register.steps.education_work',
    titleEn: 'Education & Work',
    titleAr: 'الدراسة والعمل',
    subSteps: [
      {
        id: 'study_work_details',
        titleKey: 'auth.fields.study_work',
        labelEn: 'Educational Stage / Career',
        labelAr: 'المسار التعليمي / الوظيفة',
        component: 'EducationWorkStep',
      },
    ],
  },
  {
    stepIndex: 5,
    id: 'locations',
    titleKey: 'auth.register.steps.locations',
    titleEn: 'Locations & Addresses',
    titleAr: 'العناوين السكنية',
    subSteps: [
      {
        id: 'primary_address',
        titleKey: 'auth.fields.primary_address',
        labelEn: 'Primary Home Address',
        labelAr: 'العنوان الرئيسي',
        component: 'PrimaryAddressInput',
      },
      {
        id: 'secondary_address',
        titleKey: 'auth.fields.secondary_address',
        labelEn: 'Secondary Addresses',
        labelAr: 'عناوين إضافية',
        component: 'SecondaryAddressInput',
        isOptional: true,
      },
    ],
  },
  {
    stepIndex: 6,
    id: 'church_commitment',
    titleKey: 'auth.register.steps.church_commitment',
    titleEn: 'Church Commitment',
    titleAr: 'الالتزام الكنسي',
    subSteps: [
      {
        id: 'churches_selection',
        titleKey: 'auth.fields.churches',
        labelEn: 'Primary & Secondary Churches',
        labelAr: 'الكنيسة الأساسية والفرعية',
        component: 'ChurchesSelector',
      },
      {
        id: 'priest_selection',
        titleKey: 'auth.fields.priest',
        labelEn: 'Confession Father / Priest',
        labelAr: 'أب الاعتراف / الكاهن المسؤول',
        component: 'PriestSelector',
      },
    ],
  },
  {
    stepIndex: 7,
    id: 'additional_info',
    titleKey: 'auth.register.steps.additional_info',
    titleEn: 'Additional Info',
    titleAr: 'بيانات وأنشطة إضافية',
    subSteps: [
      {
        id: 'hobbies_activities',
        titleKey: 'auth.fields.hobbies',
        labelEn: 'Hobbies & Activities',
        labelAr: 'الهوايات والأنشطة',
        component: 'HobbiesInput',
        isOptional: true,
      },
      {
        id: 'languages',
        titleKey: 'auth.fields.languages',
        labelEn: 'Languages Spoken',
        labelAr: 'اللغات المتقنة',
        component: 'LanguagesInput',
        isOptional: true,
      },
    ],
  },
];

export interface FlattenedStep {
  flatIndex: number; // 1-based index
  mainStepIndex: number; // 1 to 7
  mainStep: MainStepConfig;
  subStepIndex: number; // 1-based index inside main step
  totalSubStepsInMain: number;
  subStep: SubStepConfig;
}

// Helper to get flattened step list
export function getFlattenedRegistrationSteps(): FlattenedStep[] {
  const flattened: FlattenedStep[] = [];
  let flatCounter = 1;

  for (const mainStep of REGISTRATION_SCHEMA) {
    const totalSubStepsInMain = mainStep.subSteps.length;
    mainStep.subSteps.forEach((subStep, idx) => {
      flattened.push({
        flatIndex: flatCounter++,
        mainStepIndex: mainStep.stepIndex,
        mainStep,
        subStepIndex: idx + 1,
        totalSubStepsInMain,
        subStep,
      });
    });
  }

  return flattened;
}

export const FLATTENED_REGISTRATION_STEPS = getFlattenedRegistrationSteps();
export const TOTAL_REGISTRATION_SUBSTEPS = FLATTENED_REGISTRATION_STEPS.length;
export const TOTAL_REGISTRATION_MAIN_STEPS = REGISTRATION_SCHEMA.length;
