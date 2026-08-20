import { GenderType, SocialPlatform } from './database.types';

export interface AuthSessionUser {
  id: string;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
  fullNameEn?: string | null;
  fullNameAr?: string | null;
  createdAt?: string | null;
  lastSignInAt?: string | null;
}

export interface UserContactInput {
  id: string;
  countryIso: string;
  countryCode: string;
  phone: string;
  isVerified: boolean;
}

export interface UserEmailInput {
  id: string;
  email: string;
  isVerified: boolean;
}

export type AuthFlowStep = 
  | 'personal_info'
  | 'contact_social'
  | 'family_relations'
  | 'education_work'
  | 'locations'
  | 'church_commitment'
  | 'additional_info'
  | 'password_setup';
