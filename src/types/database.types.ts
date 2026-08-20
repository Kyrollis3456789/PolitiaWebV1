export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type GenderType = 'Male' | 'Female';

export interface Country {
  id: string;
  code: string;
  name_en: string;
  name_ar: string;
}

export interface Governorate {
  id: string;
  country_id: string;
  name_en: string;
  name_ar: string;
}

export interface City {
  id: string;
  governorate_id: string;
  name_en: string;
  name_ar: string;
}

export interface Street {
  id: string;
  city_id?: string;
  governorate_id?: string;
  name_en: string;
  name_ar: string;
}

export interface WorldLocationRecord {
  country_id: string;
  country_code: string;
  country_name_en: string;
  country_name_ar: string;
  governorate_id?: string;
  governorate_name_en?: string;
  governorate_name_ar?: string;
  city_id?: string;
  city_name_en?: string;
  city_name_ar?: string;
  street_id?: string;
  street_name_en?: string;
  street_name_ar?: string;
}

export interface Step5LocationPayload {
  country_id: string;
  governorate_id: string;
  city_id: string;
  street_address: string;
  building_no?: string;
  floor_no?: string;
  apartment?: string;
}

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

export interface Profile {
  id: string; // references auth.users.id
  username?: string | null;
  full_name_en: string;
  full_name_ar: string;
  date_of_birth: string; // YYYY-MM-DD
  gender: GenderType;
  national_id: string; // 14 digits
  birth_province_code?: string | null;
  avatar_url?: string | null;
  avatar_skipped_at?: string | null;
  landline_phone?: string | null;
  primary_email?: string | null;
  primary_phone?: string | null;
  facebook_url?: string | null;
  instagram_url?: string | null;
  linkedin_url?: string | null;
  marital_status?: string | null;
  guardian_name?: string | null;
  guardian_phone?: string | null;
  education_stage?: string | null;
  faculty_or_school?: string | null;
  profession?: string | null;
  address_governorate?: string | null;
  address_city?: string | null;
  address_street?: string | null;
  address_building?: string | null;
  address_floor?: string | null;
  address_apartment?: string | null;
  secondary_address?: string | null;
  diocese?: string | null;
  primary_church?: string | null;
  secondary_church?: string | null;
  priest_name?: string | null;
  hobbies?: string[] | null;
  languages?: string[] | null;
  created_at?: string;
  updated_at?: string;
}

export interface UserPhone {
  id: string;
  user_id: string;
  phone_number: string;
  is_primary: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UserEmail {
  id: string;
  user_id: string;
  email: string;
  is_primary: boolean;
  created_at?: string;
  updated_at?: string;
}

export type SocialPlatform =
  | 'facebook'
  | 'instagram'
  | 'tiktok'
  | 'snapchat'
  | 'threads'
  | 'x'
  | 'github'
  | 'linkedin'
  | 'whatsapp'
  | 'messenger';

export interface UserSocialLink {
  id: string;
  user_id: string;
  platform: SocialPlatform;
  profile_url: string;
  display_name?: string | null;
  bio_snippet?: string | null;
  avatar_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type FamilyRelationType =
  | 'father'
  | 'mother'
  | 'spouse'
  | 'brother'
  | 'sister'
  | 'son'
  | 'daughter'
  | 'paternal_uncle'
  | 'paternal_aunt'
  | 'maternal_uncle'
  | 'maternal_aunt'
  | 'uncle_aunt_spouse'
  | 'cousin'
  | 'grandfather'
  | 'grandmother'
  | 'uncle'
  | 'aunt'
  | 'grandparent'
  | 'other';
export type FamilyLinkStatus = 'auto_approved' | 'pending_review' | 'disputed';
export type FamilyVerificationMethod = 'heuristic_name_match' | 'manual_phone' | 'graph_resolution' | 'manual_override';

export interface FamilyMemberEntry {
  id: string; // unique local client key
  relation: FamilyRelationType;
  fullName?: string;
  memberId?: string | null;
  countryCode?: string;
  phone?: string;
  isDeceased: boolean;
  mode: 'search' | 'manual' | 'deceased';
  autoLinkedFrom?: 'father' | 'mother';
  isAutoDiscovered?: boolean;
  linkStatus?: FamilyLinkStatus;
  verificationMethod?: FamilyVerificationMethod;
  requiresAuditNotice?: boolean;
}

export interface UserFamilyRelation {
  id: string;
  user_id: string;
  relation: FamilyRelationType;
  related_member_id?: string | null;
  full_name?: string | null;
  phone_number?: string | null;
  is_deceased: boolean;
  link_status?: FamilyLinkStatus | null;
  verification_method?: FamilyVerificationMethod | null;
  requires_audit_notice?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & Pick<Profile, 'id' | 'full_name_en' | 'full_name_ar' | 'date_of_birth' | 'gender' | 'national_id'>;
        Update: Partial<Profile>;
      };
      user_phones: {
        Row: UserPhone;
        Insert: Partial<UserPhone> & Pick<UserPhone, 'user_id' | 'phone_number'>;
        Update: Partial<UserPhone>;
      };
      user_emails: {
        Row: UserEmail;
        Insert: Partial<UserEmail> & Pick<UserEmail, 'user_id' | 'email'>;
        Update: Partial<UserEmail>;
      };
      user_social_links: {
        Row: UserSocialLink;
        Insert: Partial<UserSocialLink> & Pick<UserSocialLink, 'user_id' | 'platform' | 'profile_url'>;
        Update: Partial<UserSocialLink>;
      };
      user_family_relations: {
        Row: UserFamilyRelation;
        Insert: Partial<UserFamilyRelation> & Pick<UserFamilyRelation, 'user_id' | 'relation'>;
        Update: Partial<UserFamilyRelation>;
      };
    };
  };
}