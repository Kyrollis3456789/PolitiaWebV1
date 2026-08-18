export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type GenderType = 'Male' | 'Female';

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
  | 'linkedin';

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
    };
  };
}