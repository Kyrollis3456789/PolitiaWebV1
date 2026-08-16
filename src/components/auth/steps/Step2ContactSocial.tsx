'use client';

import React, { useState } from 'react';
import { SocialPlatform } from '@/types/database.types';

export interface PhoneEntry {
  number: string;
  isPrimary: boolean;
}

export interface EmailEntry {
  email: string;
  isPrimary: boolean;
}

export interface Step2Data {
  phones: PhoneEntry[];
  emails: EmailEntry[];
  landline: string;
  socials: Record<SocialPlatform, string>;
}

interface Step2Props {
  data: Step2Data;
  onChange: (updated: Partial<Step2Data>) => void;
  isRtl: boolean;
}

export function Step2ContactSocial({ data, onChange, isRtl }: Step2Props) {
  const [showAdvancedSocials, setShowAdvancedSocials] = useState(false);

  const handlePhoneChange = (index: number, val: string) => {
    const nextPhones = [...data.phones];
    nextPhones[index] = { ...nextPhones[index], number: val };
    onChange({ phones: nextPhones });
  };

  const addPhone = () => {
    if (data.phones.length < 10) {
      onChange({ phones: [...data.phones, { number: '', isPrimary: false }] });
    }
  };

  const removePhone = (index: number) => {
    if (data.phones.length > 1) {
      const nextPhones = data.phones.filter((_, i) => i !== index);
      if (!nextPhones.some((p) => p.isPrimary)) {
        nextPhones[0].isPrimary = true;
      }
      onChange({ phones: nextPhones });
    }
  };

  const handleEmailChange = (index: number, val: string) => {
    const nextEmails = [...data.emails];
    nextEmails[index] = { ...nextEmails[index], email: val };
    onChange({ emails: nextEmails });
  };

  const addEmail = () => {
    if (data.emails.length < 10) {
      onChange({ emails: [...data.emails, { email: '', isPrimary: data.emails.length === 0 }] });
    }
  };

  const removeEmail = (index: number) => {
    onChange({ emails: data.emails.filter((_, i) => i !== index) });
  };

  const handleSocialChange = (platform: SocialPlatform, url: string) => {
    onChange({
      socials: {
        ...data.socials,
        [platform]: url,
      },
    });
  };

  const t = {
    step2Title: isRtl ? 'بيانات الاتصال والتواصل' : 'Contact & Social Media',
    step2Subtitle: isRtl
      ? 'أرقام الهاتف، البريد الإلكتروني، وحسابات التواصل الاجتماعي'
      : 'Phone numbers, email addresses, and verified social profiles',
    phoneSectionTitle: isRtl ? 'أرقام الهواتف المحمولة' : 'Mobile Phone Numbers',
    primaryPhoneLabel: isRtl ? 'رقم الهاتف الأساسي' : 'Primary Phone (Required)',
    secondaryPhoneLabel: isRtl ? 'رقم إضافي' : 'Secondary Phone',
    eligibleSignInBadge: isRtl ? 'مؤهل لتسجيل الدخول' : 'Eligible for Sign-In',
    addPhoneBtn: isRtl ? '+ إضافة رقم هاتف آخر' : '+ Add Secondary Phone',
    emailSectionTitle: isRtl ? 'عناوين البريد الإلكتروني' : 'Email Addresses',
    emailPlaceholder: isRtl ? 'name@example.com (اختياري)' : 'name@example.com (Optional)',
    addEmailBtn: isRtl ? '+ إضافة بريد إلكتروني آخر' : '+ Add Secondary Email',
    landlineTitle: isRtl ? 'الهاتف الأرضي (اختياري)' : 'Landline Telephone (Optional)',
    landlinePlaceholder: '02 12345678',
    landlineTooltip: isRtl
      ? 'مخصص لبيانات الزيارات وسجلات المنازل فقط — لا يمكن استخدامه لتسجيل الدخول.'
      : 'For visitation and home records only — cannot be used for Sign-In.',
    socialSectionTitle: isRtl ? 'حسابات التواصل الاجتماعي' : 'Social Media Links',
    advancedSocialsToggle: isRtl ? 'الحسابات المهنية والتقنية المتقدمة' : 'Advanced & Professional Networks',
  };

  const standardPlatforms: { key: SocialPlatform; label: string; icon: string }[] = [
    { key: 'facebook', label: 'Facebook', icon: '📘' },
    { key: 'instagram', label: 'Instagram', icon: '📸' },
    { key: 'tiktok', label: 'TikTok', icon: '🎵' },
    { key: 'snapchat', label: 'Snapchat', icon: '👻' },
    { key: 'threads', label: 'Threads', icon: '🧵' },
    { key: 'x', label: 'X (Twitter)', icon: '✖️' },
  ];

  const advancedPlatforms: { key: SocialPlatform; label: string; icon: string; helper: string }[] = [
    { key: 'github', label: 'GitHub', icon: '🐙', helper: 'Username or profile link' },
    { key: 'linkedin', label: 'LinkedIn', icon: '💼', helper: 'Public profile URL' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="border-b border-[var(--border)] pb-4">
        <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)]">
          <bdi>{t.step2Title}</bdi>
        </h2>
        <p className="text-xs text-[var(--muted-foreground)] mt-1">
          <bdi>{t.step2Subtitle}</bdi>
        </p>
      </div>

      {/* 1. Phone Numbers Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            <bdi>{t.phoneSectionTitle}</bdi> <span className="text-red-500">*</span>
          </label>
          <span className="text-xs text-[var(--muted-foreground)]">
            {data.phones.length}/10
          </span>
        </div>

        <div className="space-y-3">
          {data.phones.map((phone, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="flex-1 space-y-1">
                <input
                  type="tel"
                  required={idx === 0}
                  value={phone.number}
                  onChange={(e) => handlePhoneChange(idx, e.target.value)}
                  placeholder={idx === 0 ? '+20 10 1234 5678' : '+20 11 9876 5432'}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm font-mono placeholder:text-[var(--muted-foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:outline-none transition"
                />
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium shrink-0">
                <bdi>{t.eligibleSignInBadge}</bdi>
              </span>
              {idx > 0 && (
                <button
                  type="button"
                  onClick={() => removePhone(idx)}
                  className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition cursor-pointer"
                  title="Remove"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        {data.phones.length < 10 && (
          <button
            type="button"
            onClick={addPhone}
            className="text-xs font-semibold text-[var(--primary)] hover:underline flex items-center gap-1 cursor-pointer pt-1"
          >
            <bdi>{t.addPhoneBtn}</bdi>
          </button>
        )}
      </div>

      {/* 2. Emails Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            <bdi>{t.emailSectionTitle}</bdi>
          </label>
          <span className="text-xs text-[var(--muted-foreground)]">
            {data.emails.length}/10
          </span>
        </div>

        <div className="space-y-3">
          {data.emails.map((emailEntry, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <input
                type="email"
                value={emailEntry.email}
                onChange={(e) => handleEmailChange(idx, e.target.value)}
                placeholder={t.emailPlaceholder}
                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm placeholder:text-[var(--muted-foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:outline-none transition"
              />
              <button
                type="button"
                onClick={() => removeEmail(idx)}
                className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition cursor-pointer"
                title="Remove"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {data.emails.length < 10 && (
          <button
            type="button"
            onClick={addEmail}
            className="text-xs font-semibold text-[var(--primary)] hover:underline flex items-center gap-1 cursor-pointer pt-1"
          >
            <bdi>{t.addEmailBtn}</bdi>
          </button>
        )}
      </div>

      {/* 3. Landline Telephone */}
      <div className="space-y-2 pt-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] block">
          <bdi>{t.landlineTitle}</bdi>
        </label>
        <input
          type="tel"
          value={data.landline}
          onChange={(e) => onChange({ landline: e.target.value })}
          placeholder={t.landlinePlaceholder}
          className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm font-mono placeholder:text-[var(--muted-foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:outline-none transition"
        />
        <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
          <bdi>ℹ️ {t.landlineTooltip}</bdi>
        </p>
      </div>

      {/* 4. Social Links */}
      <div className="space-y-4 pt-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] block">
          <bdi>{t.socialSectionTitle}</bdi>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {standardPlatforms.map((p) => (
            <div key={p.key} className="space-y-1">
              <label className="text-xs font-medium text-[var(--foreground)] flex items-center gap-2">
                <span>{p.icon}</span>
                <span>{p.label}</span>
              </label>
              <input
                type="text"
                value={data.socials[p.key] || ''}
                onChange={(e) => handleSocialChange(p.key, e.target.value)}
                placeholder={`https://${p.key}.com/...`}
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs placeholder:text-[var(--muted-foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:outline-none transition"
              />
            </div>
          ))}
        </div>

        {/* Collapsible Advanced Socials */}
        <div className="pt-3 border-t border-[var(--border)]">
          <button
            type="button"
            onClick={() => setShowAdvancedSocials(!showAdvancedSocials)}
            className="text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center justify-between w-full cursor-pointer py-1"
          >
            <bdi>{t.advancedSocialsToggle}</bdi>
            <span>{showAdvancedSocials ? '▲' : '▼'}</span>
          </button>

          {showAdvancedSocials && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 animate-fadeIn">
              {advancedPlatforms.map((p) => (
                <div key={p.key} className="space-y-1">
                  <label className="text-xs font-medium text-[var(--foreground)] flex items-center gap-2">
                    <span>{p.icon}</span>
                    <span>{p.label}</span>
                  </label>
                  <input
                    type="text"
                    value={data.socials[p.key] || ''}
                    onChange={(e) => handleSocialChange(p.key, e.target.value)}
                    placeholder={p.helper}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs placeholder:text-[var(--muted-foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:outline-none transition"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}