'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Check,
  ChevronDown,
  ExternalLink,
  ArrowLeft,
  ArrowRight,
  Link as LinkIcon,
  AtSign,
  Trash2,
  Sparkles,
  Phone,
  CheckCircle2,
  AlertCircle,
  Globe,
} from 'lucide-react';
import { SocialPlatform } from '@/types/database.types';
import { checkSocialHandleCollision } from '@/app/actions/auth-check';

export interface SocialMediaStepProps {
  isRtl: boolean;
  socials: Record<SocialPlatform, { url: string }>;
  setSocials: React.Dispatch<React.SetStateAction<Record<SocialPlatform, { url: string }>>>;
  registeredPhone?: string; // from countryCode + phoneNumber
  registeredEmail?: string;
  fullName?: string;
}

interface PlatformConfig {
  id: SocialPlatform;
  name: string;
  nameAr: string;
  category: 'primary' | 'advanced';
  bgGradient: string;
  activeColor: string;
  badgeBg: string;
  urlBase: string;
  placeholderHandle: string;
  placeholderUrl: string;
  handlePrefix: string;
  isPhoneBased?: boolean;
  icon: (props: { className?: string }) => React.ReactNode;
}

/* Official Crisp Vector Icons */
const WhatsAppIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-5.705 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
  </svg>
);

const FacebookIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const InstagramIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const ThreadsIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.186 24h-.007C5.463 23.978 0 18.579 0 12 0 5.373 5.463 0 12.186 0c6.643 0 12.023 5.281 12.186 11.884v.232c0 4.148-2.67 7.728-6.644 8.906-3.834 1.137-7.876-.444-9.988-3.905l2.091-1.265c1.55 2.54 4.516 3.702 7.33 2.868 2.87-.85 4.795-3.435 4.795-6.425v-.194C21.79 6.55 17.485 2.414 12.186 2.414 6.8 2.414 2.414 6.708 2.414 12c0 5.291 4.386 9.586 9.772 9.586.002 0 .004 0 .007 0 2.924-.01 5.61-1.309 7.425-3.593l1.884 1.498C19.262 22.378 15.864 24 12.186 24zm-1.042-8.083c-1.892 0-3.328-.802-4.043-2.259-.808-1.644-.654-3.816.398-5.613 1.115-1.905 3.076-2.99 5.381-2.977 2.43.013 4.417 1.258 5.449 3.415.421.879.626 1.831.608 2.828l-2.412.043c.01-.643-.122-1.263-.393-1.831-.637-1.332-1.86-2.072-3.266-2.08-1.407-.008-2.603.659-3.278 1.815-.658 1.127-.754 2.493-.244 3.531.442.899 1.334 1.396 2.51 1.396 1.237 0 2.217-.552 2.83-1.597l2.091 1.23c-.991 1.688-2.584 2.599-4.631 2.599z" />
  </svg>
);

const MessengerIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.077.298 2.221.464 3.443.464 6.627 0 12-4.975 12-11.111C24 4.974 18.627 0 12 0zm1.191 14.963l-3.056-3.26-5.963 3.26 6.559-6.963 3.13 3.26 5.889-3.26-6.559 6.963z" />
  </svg>
);

const TikTokIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.89 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.3 0 .59.04.86.13V9.43a6.37 6.37 0 0 0-.86-.06A6.34 6.34 0 0 0 3 15.71a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34v-7a8.16 8.16 0 0 0 4.91 1.63V6.89c-.33-.04-.67-.11-1-.2z" />
  </svg>
);

const XIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedInIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

const GitHubIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

/* Exported Dedicated Resolvers */
export function resolveFacebookUrl(input: string): string {
  const clean = input.trim();
  if (!clean) return '';
  if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;
  // If numeric ID
  if (/^\d+$/.test(clean)) {
    return `https://facebook.com/profile.php?id=${clean}`;
  }
  // Strip '@' if present and treat as standard vanity username
  const username = clean.replace(/^@/, '');
  return `https://facebook.com/${username}`;
}

export function resolveWhatsAppUrl(input: string): string {
  const clean = input.trim();
  if (!clean) return '';
  if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;

  // If alphanumeric or starts with @ -> treat as WhatsApp username/handle
  if (clean.startsWith('@') || /[a-zA-Z]/.test(clean)) {
    const handle = clean.replace(/^@/, '');
    return `https://wa.me/${encodeURIComponent(handle)}`;
  }

  // Strip non-digits for standard phone number
  const cleanDigits = clean.replace(/[^\d]/g, '');
  return cleanDigits ? `https://wa.me/${cleanDigits}` : '';
}

/* Platforms Master Registry */
const PLATFORMS: PlatformConfig[] = [
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    nameAr: 'واتساب',
    category: 'primary',
    bgGradient: 'from-[#25D366] to-[#128C7E]',
    activeColor: '#25D366',
    badgeBg: 'bg-[#25D366]',
    urlBase: 'https://wa.me/',
    placeholderHandle: '+20 10... / @username',
    placeholderUrl: 'https://wa.me/201012345678',
    handlePrefix: 'wa.me/',
    isPhoneBased: true,
    icon: WhatsAppIcon,
  },
  {
    id: 'facebook',
    name: 'Facebook',
    nameAr: 'فيسبوك',
    category: 'primary',
    bgGradient: 'from-[#1877F2] to-[#0D5EC9]',
    activeColor: '#1877F2',
    badgeBg: 'bg-[#1877F2]',
    urlBase: 'https://facebook.com/',
    placeholderHandle: 'username or ID (e.g. 1000...)',
    placeholderUrl: 'https://facebook.com/username',
    handlePrefix: 'fb.com/',
    icon: FacebookIcon,
  },
  {
    id: 'instagram',
    name: 'Instagram',
    nameAr: 'إنستغرام',
    category: 'primary',
    bgGradient: 'from-[#f09433] via-[#dc2743] to-[#bc1888]',
    activeColor: '#E1306C',
    badgeBg: 'bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]',
    urlBase: 'https://instagram.com/',
    placeholderHandle: 'username',
    placeholderUrl: 'https://instagram.com/username',
    handlePrefix: '@',
    icon: InstagramIcon,
  },
  {
    id: 'threads',
    name: 'Threads',
    nameAr: 'ثريدز',
    category: 'primary',
    bgGradient: 'from-[#1C1C1E] to-[#000000]',
    activeColor: '#000000',
    badgeBg: 'bg-black dark:bg-slate-800',
    urlBase: 'https://threads.net/@',
    placeholderHandle: 'username',
    placeholderUrl: 'https://threads.net/@username',
    handlePrefix: '@',
    icon: ThreadsIcon,
  },
  {
    id: 'messenger',
    name: 'Messenger',
    nameAr: 'ماسنجر',
    category: 'primary',
    bgGradient: 'from-[#00B2FE] via-[#006AFF] to-[#A033FF]',
    activeColor: '#006AFF',
    badgeBg: 'bg-gradient-to-r from-[#00B2FE] to-[#A033FF]',
    urlBase: 'https://m.me/',
    placeholderHandle: 'username',
    placeholderUrl: 'https://m.me/username',
    handlePrefix: 'm.me/',
    icon: MessengerIcon,
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    nameAr: 'تيك توك',
    category: 'primary',
    bgGradient: 'from-[#000000] to-[#121212]',
    activeColor: '#00F2FE',
    badgeBg: 'bg-black border border-cyan-500/50',
    urlBase: 'https://tiktok.com/@',
    placeholderHandle: 'username',
    placeholderUrl: 'https://tiktok.com/@username',
    handlePrefix: '@',
    icon: TikTokIcon,
  },
  {
    id: 'x',
    name: 'X / Twitter',
    nameAr: 'إكس (تويتر)',
    category: 'primary',
    bgGradient: 'from-[#000000] to-[#1a1a1a]',
    activeColor: '#000000',
    badgeBg: 'bg-black dark:bg-slate-900',
    urlBase: 'https://x.com/',
    placeholderHandle: 'username',
    placeholderUrl: 'https://x.com/username',
    handlePrefix: '@',
    icon: XIcon,
  },
  /* Advanced Professional Platforms */
  {
    id: 'linkedin',
    name: 'LinkedIn',
    nameAr: 'لينكد إن',
    category: 'advanced',
    bgGradient: 'from-[#0A66C2] to-[#004182]',
    activeColor: '#0A66C2',
    badgeBg: 'bg-[#0A66C2]',
    urlBase: 'https://linkedin.com/in/',
    placeholderHandle: 'username',
    placeholderUrl: 'https://linkedin.com/in/username',
    handlePrefix: 'in/',
    icon: LinkedInIcon,
  },
  {
    id: 'github',
    name: 'GitHub',
    nameAr: 'جيت هاب',
    category: 'advanced',
    bgGradient: 'from-[#24292e] to-[#0f1115]',
    activeColor: '#24292e',
    badgeBg: 'bg-[#24292e] dark:bg-[#161b22]',
    urlBase: 'https://github.com/',
    placeholderHandle: 'username',
    placeholderUrl: 'https://github.com/username',
    handlePrefix: 'github.com/',
    icon: GitHubIcon,
  },
];

export const SocialMediaStep: React.FC<SocialMediaStepProps> = ({
  isRtl,
  socials,
  setSocials,
  registeredPhone = '',
  registeredEmail = '',
  fullName = '',
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformConfig | null>(null);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState<boolean>(() => {
    // Auto expand if user already has linkedin or github linked
    return Boolean(socials.linkedin?.url?.trim() || socials.github?.url?.trim());
  });

  // Modal / Subscreen editing state
  const [inputMode, setInputMode] = useState<'username' | 'link'>('username');
  const [inputValue, setInputValue] = useState<string>('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [isSuccessFeedback, setIsSuccessFeedback] = useState<boolean>(false);

  // Helper to extract clean handle or url when opening platform
  const openPlatformEditor = (platform: PlatformConfig) => {
    const existingUrl = socials[platform.id]?.url || '';
    setSelectedPlatform(platform);
    setInputError(null);
    setIsSuccessFeedback(false);

    if (existingUrl) {
      // Check if it matches base url prefix
      if (existingUrl.startsWith(platform.urlBase)) {
        setInputMode('username');
        setInputValue(existingUrl.replace(platform.urlBase, ''));
      } else {
        setInputMode('link');
        setInputValue(existingUrl);
      }
    } else {
      setInputMode('username');
      // For WhatsApp: if user has a registered phone, suggest it
      if (platform.id === 'whatsapp' && registeredPhone) {
        setInputValue(registeredPhone.replace(/[^\d+]/g, ''));
      } else {
        setInputValue('');
      }
    }
  };

  // Resolved URL calculation
  const resolvedUrl = useMemo(() => {
    if (!selectedPlatform) return '';
    const clean = inputValue.trim();
    if (!clean) return '';

    if (inputMode === 'link') {
      if (clean.startsWith('http://') || clean.startsWith('https://')) {
        return clean;
      }
      return `https://${clean}`;
    }

    // Facebook custom resolution
    if (selectedPlatform.id === 'facebook') {
      return resolveFacebookUrl(clean);
    }

    // WhatsApp dual-mode resolution (Phone Number or @Username)
    if (selectedPlatform.id === 'whatsapp') {
      return resolveWhatsAppUrl(clean);
    }

    // Clean @ or prefixes if user accidentally included them
    let cleanHandle = clean;
    if (cleanHandle.startsWith('@')) cleanHandle = cleanHandle.slice(1);
    if (cleanHandle.startsWith('https://') || cleanHandle.startsWith('http://')) {
      return cleanHandle; // User pasted full url in handle mode
    }

    return `${selectedPlatform.urlBase}${encodeURIComponent(cleanHandle)}`;
  }, [selectedPlatform, inputValue, inputMode]);

  // Display handle preview
  const displayHandle = useMemo(() => {
    if (!selectedPlatform) return '';
    const clean = inputValue.trim();
    if (!clean) return '';

    if (inputMode === 'link') {
      try {
        const u = new URL(resolvedUrl);
        return u.pathname.replace(/^\//, '') || u.hostname;
      } catch {
        return clean;
      }
    }

    if (selectedPlatform.id === 'facebook') {
      if (/^\d+$/.test(clean)) return `ID: ${clean}`;
      const user = clean.replace(/^@/, '');
      return `@${user}`;
    }

    if (selectedPlatform.id === 'whatsapp') {
      if (clean.startsWith('@') || /[a-zA-Z]/.test(clean)) {
        const user = clean.replace(/^@/, '');
        return `@${user}`;
      }
      return clean.startsWith('+') ? clean : `+${clean.replace(/[^\d]/g, '')}`;
    }

    const cleanHandle = clean.startsWith('@') ? clean.slice(1) : clean;
    return `@${cleanHandle}`;
  }, [selectedPlatform, inputValue, inputMode, resolvedUrl]);

  // Handle Save
  const [isCheckingCollision, setIsCheckingCollision] = useState<boolean>(false);

  const handleSavePlatform = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedPlatform) return;

    const trimmed = inputValue.trim();
    if (!trimmed) {
      setInputError(isRtl ? 'يرجى إدخال اسم المستخدم أو الرابط' : 'Please enter a username or link');
      return;
    }

    // Basic URL validation
    if (!resolvedUrl) {
      setInputError(isRtl ? 'صيغة الحساب غير صالحة' : 'Invalid account format');
      return;
    }

    try {
      new URL(resolvedUrl);
    } catch {
      setInputError(isRtl ? 'الرابط غير صالح، يرجى التحقق منه' : 'Invalid URL format, please check');
      return;
    }

    // Real-time Social Handle Collision Check
    const checkablePlatforms: ('facebook' | 'instagram' | 'tiktok' | 'x')[] = ['facebook', 'instagram', 'tiktok', 'x'];
    if (checkablePlatforms.includes(selectedPlatform.id as any)) {
      setIsCheckingCollision(true);
      try {
        const isCollision = await checkSocialHandleCollision(selectedPlatform.id as any, trimmed);
        if (isCollision) {
          setInputError(
            isRtl
              ? 'هذا الحساب مرتبط بالفعل بمستخدم آخر.'
              : 'This social handle is already linked to another account.'
          );
          return;
        }
      } catch {
        // Fallback silently if network check fails
      } finally {
        setIsCheckingCollision(false);
      }
    }

    // Update global socials state
    setSocials((prev) => ({
      ...prev,
      [selectedPlatform.id]: { url: resolvedUrl },
    }));

    setIsSuccessFeedback(true);
    setTimeout(() => {
      setSelectedPlatform(null);
      setIsSuccessFeedback(false);
    }, 450);
  };

  // Handle Remove / Clear
  const handleRemovePlatform = () => {
    if (!selectedPlatform) return;
    setSocials((prev) => ({
      ...prev,
      [selectedPlatform.id]: { url: '' },
    }));
    setSelectedPlatform(null);
  };

  // Connected count
  const connectedCount = useMemo(() => {
    return Object.values(socials).filter((s) => Boolean(s?.url?.trim())).length;
  }, [socials]);

  const primaryPlatforms = PLATFORMS.filter((p) => p.category === 'primary');
  const advancedPlatforms = PLATFORMS.filter((p) => p.category === 'advanced');

  return (
    <div className="w-full flex flex-col justify-center py-1">
      {/* ─────────────────────────────────────────────────────────────
          1. MAIN VIEW: Platform Grid & Advanced Accordion
          ───────────────────────────────────────────────────────────── */}
      {!selectedPlatform ? (
        <div className="space-y-4 animate-fadeIn">
          {/* Header Badge & Counters Bar */}
          <div className="flex items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2">
              {/* Prominent Recommended Badge */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-semibold shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                <span><bdi>{isRtl ? 'مُوصى به' : 'Recommended'}</bdi></span>
              </span>
            </div>

            {/* Connected Counter Status Pill */}
            {connectedCount > 0 ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#0B57D0] dark:text-[#93C5FD] border border-blue-200 dark:border-blue-800 text-[11px] font-medium">
                <CheckCircle2 className="w-3 h-3 text-[#0B57D0] dark:text-[#60A5FA]" />
                <bdi>
                  {isRtl
                    ? `${connectedCount} ${connectedCount === 1 ? 'منصة متصلة' : 'منصات متصلة'}`
                    : `${connectedCount} Connected`}
                </bdi>
              </span>
            ) : (
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                <bdi>{isRtl ? 'اختياري ويمكن ربطها لاحقاً' : 'Optional · Link anytime'}</bdi>
              </span>
            )}
          </div>

          {/* Primary Platforms Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {primaryPlatforms.map((platform) => {
              const isConnected = Boolean(socials[platform.id]?.url?.trim());
              const IconComp = platform.icon;

              return (
                <button
                  key={platform.id}
                  type="button"
                  onClick={() => openPlatformEditor(platform)}
                  className={`group relative flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-200 cursor-pointer text-center select-none overflow-hidden ${
                    isConnected
                      ? 'bg-slate-50/90 dark:bg-slate-800/80 border-emerald-500/60 dark:border-emerald-500/70 shadow-sm ring-2 ring-emerald-500/20'
                      : 'bg-white dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/70 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md hover:-translate-y-0.5'
                  }`}
                >
                  {/* Verified Checkmark Badge on Top-Right/Top-Left */}
                  {isConnected && (
                    <div
                      className={`absolute top-2 ${
                        isRtl ? 'left-2' : 'right-2'
                      } z-10 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm animate-scaleIn`}
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}

                  {/* Brand Styled Icon Circle */}
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md transition-transform duration-200 group-hover:scale-105 ${
                      platform.id === 'instagram'
                        ? 'bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]'
                        : platform.id === 'messenger'
                        ? 'bg-gradient-to-r from-[#00B2FE] via-[#006AFF] to-[#A033FF]'
                        : platform.id === 'facebook'
                        ? 'bg-[#1877F2]'
                        : platform.id === 'whatsapp'
                        ? 'bg-[#25D366]'
                        : platform.id === 'tiktok'
                        ? 'bg-black ring-1 ring-cyan-400/40'
                        : platform.id === 'threads'
                        ? 'bg-black dark:bg-[#121212] ring-1 ring-slate-700'
                        : 'bg-black dark:bg-[#151515]'
                    }`}
                  >
                    <IconComp className="w-5 h-5" />
                  </div>

                  {/* Platform Label */}
                  <span className="mt-2 text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-[#0B57D0] dark:group-hover:text-[#93C5FD] transition-colors">
                    <bdi>{isRtl ? platform.nameAr : platform.name}</bdi>
                  </span>

                  {/* Connection Subtext */}
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 truncate max-w-[90%]">
                    {isConnected ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        {isRtl ? 'تم الربط ✓' : 'Connected ✓'}
                      </span>
                    ) : (
                      <span className="opacity-70 group-hover:opacity-100">
                        {isRtl ? 'اضغط للربط' : 'Click to link'}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ─────────────────────────────────────────────────────────────
              Expandable Advanced Section Divider
              ───────────────────────────────────────────────────────────── */}
          <div className="pt-2">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700/80" />
              </div>
              <button
                type="button"
                onClick={() => setIsAdvancedOpen((prev) => !prev)}
                className="relative z-10 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium transition cursor-pointer border border-slate-200 dark:border-slate-700 shadow-xs"
              >
                <span><bdi>{isRtl ? 'الحسابات المتقدمة والمهنية' : 'Advanced Accounts'}</bdi></span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isAdvancedOpen ? 'rotate-180 text-[#0B57D0] dark:text-[#93C5FD]' : 'text-slate-400'
                  }`}
                />
              </button>
            </div>

            {/* Expandable Advanced Platform Grid (Animated) */}
            {isAdvancedOpen && (
              <div className="mt-3.5 grid grid-cols-2 gap-2.5 animate-fadeIn">
                {advancedPlatforms.map((platform) => {
                  const isConnected = Boolean(socials[platform.id]?.url?.trim());
                  const IconComp = platform.icon;

                  return (
                    <button
                      key={platform.id}
                      type="button"
                      onClick={() => openPlatformEditor(platform)}
                      className={`group relative flex items-center gap-3 p-3 rounded-2xl border transition-all duration-200 cursor-pointer text-start select-none ${
                        isConnected
                          ? 'bg-slate-50/90 dark:bg-slate-800/80 border-emerald-500/60 dark:border-emerald-500/70 shadow-sm ring-2 ring-emerald-500/20'
                          : 'bg-white dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/70 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md'
                      }`}
                    >
                      {/* Icon */}
                      <div
                        className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-white shadow-sm transition-transform duration-200 group-hover:scale-105 ${
                          platform.id === 'linkedin'
                            ? 'bg-[#0A66C2]'
                            : 'bg-[#24292e] dark:bg-[#161b22] border border-slate-700'
                        }`}
                      >
                        <IconComp className="w-5 h-5" />
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            <bdi>{isRtl ? platform.nameAr : platform.name}</bdi>
                          </span>
                          {isConnected && (
                            <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                          {isConnected ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                              {isRtl ? 'تم الربط ✓' : 'Connected ✓'}
                            </span>
                          ) : (
                            <bdi>{isRtl ? 'للمحترفين والمطورين' : 'Professional Profile'}</bdi>
                          )}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ─────────────────────────────────────────────────────────────
            2. DEDICATED PLATFORM SUB-SCREEN (Dynamic Input & Preview)
           ───────────────────────────────────────────────────────────── */
        <div className="space-y-4 animate-fadeIn">
          {/* Sub-Screen Header */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <button
              type="button"
              onClick={() => setSelectedPlatform(null)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-[#0B57D0] dark:hover:text-[#93C5FD] transition cursor-pointer p-1 -m-1"
            >
              {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
              <span><bdi>{isRtl ? 'الرجوع للقائمة' : 'Back to Grid'}</bdi></span>
            </button>

            {/* Platform Brand Pill */}
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs ${selectedPlatform.badgeBg}`}
              >
                {selectedPlatform.icon({ className: 'w-3.5 h-3.5' })}
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                <bdi>{isRtl ? selectedPlatform.nameAr : selectedPlatform.name}</bdi>
              </span>
            </div>
          </div>

          {/* Form Input Area */}
          <div className="space-y-3.5">
            {/* Input Strategy Selector Tabs */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                <bdi>
                  {inputMode === 'username'
                    ? selectedPlatform.id === 'whatsapp'
                      ? isRtl ? 'رقم الهاتف أو المعرف (@)' : 'Phone Number or @Username'
                      : isRtl ? 'اسم المستخدم / المعرف' : 'Username / Handle'
                    : isRtl ? 'الرابط المباشر الكامل' : 'Direct Full URL'}
                </bdi>
              </span>

              {/* Mode Toggle Button */}
              <button
                type="button"
                onClick={() => {
                  setInputMode((prev) => (prev === 'username' ? 'link' : 'username'));
                  setInputError(null);
                }}
                className="text-[11px] font-semibold text-[#0B57D0] dark:text-[#93C5FD] hover:underline cursor-pointer flex items-center gap-1"
              >
                {inputMode === 'username' ? (
                  <>
                    <LinkIcon className="w-3 h-3" />
                    <span><bdi>{isRtl ? 'التبديل إلى رابط كامل' : 'Switch to Full URL'}</bdi></span>
                  </>
                ) : (
                  <>
                    <AtSign className="w-3 h-3" />
                    <span><bdi>{isRtl ? 'التبديل إلى اسم المستخدم' : 'Switch to Handle'}</bdi></span>
                  </>
                )}
              </button>
            </div>

            {/* Input Field with integrated prefix */}
            <div className="relative">
              <div
                className={`flex items-center w-full h-[52px] px-3 bg-transparent rounded-xl border transition-all ${
                  inputError
                    ? 'border-[#B3261E] dark:border-[#F2B8B5] ring-2 ring-[#B3261E]/20'
                    : 'border-slate-300 dark:border-slate-700 focus-within:border-[#0B57D0] dark:focus-within:border-[#A8C7FA] focus-within:ring-2 focus-within:ring-blue-500/20'
                }`}
              >
                {/* Prefix Badge */}
                <span className="shrink-0 text-xs font-mono text-slate-400 dark:text-slate-500 select-none pe-2 flex items-center gap-1">
                  {inputMode === 'username' ? (
                    selectedPlatform.id === 'whatsapp' ? (
                      inputValue.startsWith('@') || /[a-zA-Z]/.test(inputValue) ? (
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">@</span>
                      ) : (
                        <Phone className="w-3.5 h-3.5 text-emerald-500" />
                      )
                    ) : (
                      <span className="font-semibold text-slate-500 dark:text-slate-400">
                        {selectedPlatform.handlePrefix}
                      </span>
                    )
                  ) : (
                    <Globe className="w-3.5 h-3.5 text-blue-500" />
                  )}
                </span>

                {/* Main Input */}
                <input
                  id="reg-social-modal-input"
                  type={inputMode === 'link' ? 'url' : 'text'}
                  dir="ltr"
                  autoFocus
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    if (inputError) setInputError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSavePlatform();
                    }
                  }}
                  placeholder={
                    inputMode === 'username'
                      ? selectedPlatform.id === 'whatsapp'
                        ? isRtl ? '+20 101 234 5678 أو @username' : '+20 101 234 5678 or @username'
                        : selectedPlatform.placeholderHandle
                      : selectedPlatform.placeholderUrl
                  }
                  className="w-full h-full bg-transparent text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
                />

                {/* Clear Input Button */}
                {inputValue && (
                  <button
                    type="button"
                    onClick={() => setInputValue('')}
                    className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs p-1 cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Error Message */}
              {inputError && (
                <div className="flex items-center gap-1.5 text-xs text-[#B3261E] dark:text-[#F2B8B5] mt-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <bdi>{inputError}</bdi>
                </div>
              )}
            </div>

            {/* WhatsApp Quick Helper Banner (if phone available) */}
            {selectedPlatform.id === 'whatsapp' && registeredPhone && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 text-xs">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200">
                  <WhatsAppIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <bdi>
                      {isRtl ? 'رقمك المسجل:' : 'Registered Phone:'}{' '}
                      <strong className="font-mono">{registeredPhone}</strong>
                    </bdi>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setInputValue(registeredPhone.replace(/[^\d]/g, ''));
                    if (inputError) setInputError(null);
                  }}
                  className="text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:underline cursor-pointer"
                >
                  <bdi>{isRtl ? 'استخدام هذا الرقم' : 'Use this number'}</bdi>
                </button>
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────────
                Confirmation Preview Card
                ───────────────────────────────────────────────────────────── */}
            {resolvedUrl ? (
              <div className="rounded-2xl p-4 bg-gradient-to-br from-slate-50 to-slate-100/70 dark:from-slate-800/80 dark:to-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <bdi>{isRtl ? 'معاينة الحساب' : 'Account Preview'}</bdi>
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full">
                    {isRtl ? 'جاهز للتأكيد' : 'Ready to verify'}
                  </span>
                </div>

                <div className="flex items-center gap-3.5">
                  {/* Avatar / Brand Badge */}
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0 ${selectedPlatform.badgeBg}`}
                  >
                    {selectedPlatform.icon({ className: 'w-6 h-6' })}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                        {displayHandle || (fullName ? fullName : selectedPlatform.name)}
                      </span>
                    </div>
                    <a
                      href={resolvedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#0B57D0] dark:text-[#93C5FD] hover:underline truncate flex items-center gap-1 mt-0.5"
                    >
                      <span className="truncate">{resolvedUrl}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>
                </div>

                {/* Confirmation Question */}
                <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-2">
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    <bdi>{isRtl ? 'هل هذا هو حسابك الصحيح؟' : 'Is this your account?'}</bdi>
                  </p>
                </div>
              </div>
            ) : null}

            {/* Sub-Screen Action Buttons */}
            <div className="flex items-center justify-between gap-2.5 pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPlatform(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition cursor-pointer"
                >
                  <bdi>{isRtl ? 'إلغاء' : 'Cancel'}</bdi>
                </button>

                {/* Remove / Clear if currently saved */}
                {socials[selectedPlatform.id]?.url && (
                  <button
                    type="button"
                    onClick={handleRemovePlatform}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-full transition cursor-pointer text-xs flex items-center gap-1"
                    title={isRtl ? 'حذف الحساب' : 'Remove account'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline"><bdi>{isRtl ? 'إزالة' : 'Remove'}</bdi></span>
                  </button>
                )}
              </div>

              {/* Confirm & Save Button */}
              <button
                type="button"
                onClick={handleSavePlatform}
                disabled={!inputValue.trim()}
                className={`px-6 py-2.5 text-xs font-bold rounded-full transition-all cursor-pointer flex items-center gap-2 shadow-sm ${
                  isSuccessFeedback
                    ? 'bg-emerald-600 text-white'
                    : inputValue.trim()
                    ? 'bg-[#0B57D0] hover:bg-[#0842A0] active:bg-[#06337E] text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                }`}
              >
                {isSuccessFeedback ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span><bdi>{isRtl ? 'تم الحفظ بنجاح!' : 'Saved!'}</bdi></span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span><bdi>{isRtl ? 'تأكيد وحفظ' : 'Confirm & Save'}</bdi></span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
