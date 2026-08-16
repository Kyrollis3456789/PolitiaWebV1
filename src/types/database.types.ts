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
  english_full_name: string;
  arabic_full_name: string;
  date_of_birth: string; // YYYY-MM-DD
  gender: GenderType;
  national_id: string; // 14 digits
  avatar_url?: string | null;
  photo_grace_period_until?: string | null;
  landline_number?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface UserPhone {
  id: string;
  user_id: string;
  phone_number: string;
  is_primary: boolean;
  is_verified: boolean;
  created_at?: string;
}

export interface UserEmail {
  id: string;
  user_id: string;
  email: string;
  is_primary: boolean;
  is_verified: boolean;
  created_at?: string;
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
  username?: string | null;
  display_name?: string | null;
  avatar_url?: string | null;
  created_at?: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Profile>;
      };
      user_phones: {
        Row: UserPhone;
        Insert: Omit<UserPhone, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<UserPhone>;
      };
      user_emails: {
        Row: UserEmail;
        Insert: Omit<UserEmail, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<UserEmail>;
      };
      user_social_links: {
        Row: UserSocialLink;
        Insert: Omit<UserSocialLink, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<UserSocialLink>;
      };
    };
  };
}