'use client';

import React, { useState } from 'react';
import { SocialPlatform } from '@/types/database.types';

export interface PhoneEntry {
  countryCode: string;
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
  landlineAreaCode: string;
  landlineNumber: string;
  socials: Record<
    SocialPlatform,
    {
      url: string;
      displayName?: string;
      avatarUrl?: string;
    }
  >;
}

interface Step2SubstepProps {
  substep: 1 | 2 | 3 | 4;
  data: Step2Data;
  onChange: (updated: Partial<Step2Data>) => void;
  isRtl: boolean;
}

export function Step2Substeps({ substep, data, onChange, isRtl }: Step2SubstepProps) {
  const [showAdvancedSocials, setShowAdvancedSocials] = useState(false);

  // Phone Handlers
  const handlePhoneChange = (index: number, field: 'countryCode' | 'number', val: string) => {
    const nextPhones = [...data.phones];
    nextPhones[index] = { ...nextPhones[index], [field]: val };
    onChange({ phones: nextPhones });
  };

  const addPhone = () => {
    if (data.phones.length < 10) {
      onChange({
        phones: [...data.phones, { countryCode: '+20', number: '', isPrimary: false }],
      });
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

  // Email Handlers
  const handleEmailChange = (index: number, val: string) => {
    const nextEmails = [...data.emails];
    nextEmails[index] = { ...nextEmails[index], email: val };
    onChange({ emails: nextEmails });
  };

  const addEmail = () => {
    if (data.emails.length < 10) {
      onChange({
        emails: [...data.emails, { email: '', isPrimary: data.emails.length === 0 }],
      });
    }
  };

  const removeEmail = (index: number) => {
    onChange({ emails: data.emails.filter((_, i) => i !== index) });
  };

  // Social Handlers
  const handleSocialUrlChange = (platform: SocialPlatform, url: string) => {
    onChange({
      socials: {
        ...data.socials,
        [platform]: {
          ...(data.socials[platform] || {}),
          url,
        },
      },
    });
  };

  const t = {
    // 2.1
    s1Title: isRtl ? 'أرقام الهواتف المحمولة' : 'Mobile Phone Numbers',
    s1Subtitle: isRtl
      ? 'رقم الهاتف الأساسي إلزامي ومؤهل لتسجيل الدخول، ويمكنك إضافة حتى 9 أرقام أخرى'
      : 'Primary phone is mandatory for sign-in; up to 9 secondary numbers allowed',
    primaryLabel: isRtl ? 'الهاتف الأساسي (إلزامي)' : 'Primary Phone (Mandatory)',
    secondaryLabel: isRtl ? 'رقم هاتف إضافي' : 'Secondary Phone',
    eligibleBadge: isRtl ? 'مؤهل لتسجيل الدخول' : 'Eligible for Sign-In',
    addPhoneBtn: isRtl ? '+ إضافة رقم هاتف آخر' : '+ Add another phone number',

    // 2.2
    s2Title: isRtl ? 'عناوين البريد الإلكتروني' : 'Email Addresses',
    s2Subtitle: isRtl
      ? 'البريد الإلكتروني اختياري — يمكنك إضافته وتأهيله لتسجيل الدخول'
      : 'Email is optional — add up to 10 emails eligible for sign-in',
    primaryEmailLabel: isRtl ? 'البريد الإلكتروني الأساسي' : 'Primary Email',
    secondaryEmailLabel: isRtl ? 'بريد إلكتروني إضافي' : 'Secondary Email',
    emailPlaceholder: 'name@example.com',
    addEmailBtn: isRtl ? '+ إضافة بريد إلكتروني آخر' : '+ Add another email',

    // 2.3
    s3Title: isRtl ? 'الهاتف الأرضي / المنزلي' : 'Landline / Home Phone',
    s3Subtitle: isRtl ? 'بيانات الهاتف الأرضي للمنزل (اختياري)' : 'Home landline contact details (Optional)',
    areaCodeLabel: isRtl ? 'كود المحافظة' : 'Area Code',
    landlineNumberLabel: isRtl ? 'رقم الهاتف الأرضي' : 'Landline Number',
    landlineTooltip: isRtl
      ? 'مخصص حصرياً لبيانات الزيارات وسجلات المنازل — غير مؤهل لتسجيل الدخول.'
      : 'Used exclusively for home records and visitation routing — NOT eligible for Sign-In.',

    // 2.4
    s4Title: isRtl ? 'حسابات التواصل الاجتماعي' : 'Social Media Profiles',
    s4Subtitle: isRtl ? 'ربط الحسابات الاجتماعية والمهنية' : 'Connect standard and professional social profiles',
    advancedToggle: isRtl ? 'الحسابات المهنية والتقنية المتقدمة' : 'Advanced Professional Networks',
  };

  const standardSocials: { key: SocialPlatform; label: string; icon: string; placeholder: string }[] = [
    { key: 'facebook', label: 'Facebook', icon: '📘', placeholder: 'https://facebook.com/username' },
    { key: 'instagram', label: 'Instagram', icon: '📸', placeholder: 'https://instagram.com/username' },
    { key: 'tiktok', label: 'TikTok', icon: '🎵', placeholder: 'https://tiktok.com/@username' },
    { key: 'snapchat', label: 'Snapchat', icon: '👻', placeholder: 'https://snapchat.com/add/username' },
    { key: 'threads', label: 'Threads', icon: '🧵', placeholder: 'https://threads.net/@username' },
    { key: 'x', label: 'X (Twitter)', icon: '✖️', placeholder: 'https://x.com/username' },
  ];

  const advancedSocials: { key: SocialPlatform; label: string; icon: string; placeholder: string }[] = [
    { key: 'github', label: 'GitHub', icon: '🐙', placeholder: 'https://github.com/username' },
    { key: 'linkedin', label: 'LinkedIn', icon: '💼', placeholder: 'https://linkedin.com/in/username' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Sub-step 2.1: Phone Numbers */}
      {substep === 1 && (
        <div className="space-y-5">
          <div>
            <h3 className="text-lg font-bold tracking-tight text-[var(--foreground)]">
              <bdi>{t.s1Title}</bdi>
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              <bdi>{t.s1Subtitle}</bdi>
            </p>
          </div>

          <div className="space-y-3">
            {data.phones.map((phone, idx) => (
              <div key={idx} className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                    <bdi>{idx === 0 ? t.primaryLabel : `${t.secondaryLabel} #${idx + 1}`}</bdi>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                      <bdi>{t.eligibleBadge}</bdi>
                    </span>
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={() => removePhone(idx)}
                        className="text-xs text-red-500 hover:bg-red-500/10 p-1 rounded-lg transition cursor-pointer"
                        title="Remove"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={phone.countryCode}
                    onChange={(e) => handlePhoneChange(idx, 'countryCode', e.target.value)}
                    className="w-24 px-3 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm font-mono focus:ring-2 focus:ring-[var(--primary)] focus:outline-none"
                  >
                    <option value="+20">🇪🇬 +20</option>
                    <option value="+966">🇸🇦 +966</option>
                    <option value="+971">🇦🇪 +971</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                  </select>

                  <input
                    type="tel"
                    autoFocus={idx === 0}
                    required={idx === 0}
                    value={phone.number}
                    onChange={(e) => handlePhoneChange(idx, 'number', e.target.value.replace(/[^\d\s-]/g, ''))}
                    placeholder="10 1234 5678"
                    className="flex-1 px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm font-mono placeholder:text-[var(--muted-foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:outline-none transition shadow-sm"
                  />
                </div>
              </div>
            ))}

            {data.phones.length < 10 && (
              <button
                type="button"
                onClick={addPhone}
                className="w-full py-3 rounded-xl border border-dashed border-[var(--border)] text-xs font-semibold text-[var(--primary)] hover:bg-[var(--muted)] transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <bdi>{t.addPhoneBtn} ({data.phones.length}/10)</bdi>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Sub-step 2.2: Email Addresses */}
      {substep === 2 && (
        <div className="space-y-5">
          <div>
            <h3 className="text-lg font-bold tracking-tight text-[var(--foreground)]">
              <bdi>{t.s2Title}</bdi>
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              <bdi>{t.s2Subtitle}</bdi>
            </p>
          </div>

          <div className="space-y-3">
            {data.emails.map((emailEntry, idx) => (
              <div key={idx} className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                    <bdi>{idx === 0 ? t.primaryEmailLabel : `${t.secondaryEmailLabel} #${idx + 1}`}</bdi>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                      <bdi>{t.eligibleBadge}</bdi>
                    </span>
                    <button
                      type="button"
                      onClick={() => removeEmail(idx)}
                      className="text-xs text-red-500 hover:bg-red-500/10 p-1 rounded-lg transition cursor-pointer"
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <input
                  type="email"
                  autoFocus={idx === 0}
                  value={emailEntry.email}
                  onChange={(e) => handleEmailChange(idx, e.target.value)}
                  placeholder={t.emailPlaceholder}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm placeholder:text-[var(--muted-foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:outline-none transition shadow-sm"
                />
              </div>
            ))}

            {data.emails.length < 10 && (
              <button
                type="button"
                onClick={addEmail}
                className="w-full py-3 rounded-xl border border-dashed border-[var(--border)] text-xs font-semibold text-[var(--primary)] hover:bg-[var(--muted)] transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <bdi>{t.addEmailBtn} ({data.emails.length}/10)</bdi>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Sub-step 2.3: Landline / Home Phone */}
      {substep === 3 && (
        <div className="space-y-5">
          <div>
            <h3 className="text-lg font-bold tracking-tight text-[var(--foreground)]">
              <bdi>{t.s3Title}</bdi>
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              <bdi>{t.s3Subtitle}</bdi>
            </p>
          </div>

          <div className="p-5 rounded-3xl border border-[var(--border)] bg-[var(--card)] space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                  <bdi>{t.areaCodeLabel}</bdi>
                </label>
                <input
                  type="text"
                  placeholder="02"
                  value={data.landlineAreaCode}
                  onChange={(e) => onChange({ landlineAreaCode: e.target.value })}
                  className="w-full px-3 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm font-mono focus:ring-2 focus:ring-[var(--primary)] focus:outline-none"
                />
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                  <bdi>{t.landlineNumberLabel}</bdi>
                </label>
                <input
                  type="tel"
                  placeholder="12345678"
                  value={data.landlineNumber}
                  onChange={(e) => onChange({ landlineNumber: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm font-mono focus:ring-2 focus:ring-[var(--primary)] focus:outline-none"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-medium flex items-start gap-2.5">
              <span className="text-base leading-none mt-0.5">ℹ️</span>
              <span className="leading-relaxed text-start"><bdi>{t.landlineTooltip}</bdi></span>
            </div>
          </div>
        </div>
      )}

      {/* Sub-step 2.4: Social Media Profiles */}
      {substep === 4 && (
        <div className="space-y-5">
          <div>
            <h3 className="text-lg font-bold tracking-tight text-[var(--foreground)]">
              <bdi>{t.s4Title}</bdi>
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              <bdi>{t.s4Subtitle}</bdi>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {standardSocials.map((p) => (
              <div key={p.key} className="p-3.5 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-1.5 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{p.icon}</span>
                  <span className="text-xs font-bold text-[var(--foreground)]">{p.label}</span>
                </div>
                <input
                  type="text"
                  value={data.socials[p.key]?.url || ''}
                  onChange={(e) => handleSocialUrlChange(p.key, e.target.value)}
                  placeholder={p.placeholder}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs placeholder:text-[var(--muted-foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:outline-none transition"
                />
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={() => setShowAdvancedSocials(!showAdvancedSocials)}
              className="w-full py-2 px-3 text-xs font-bold text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center justify-between rounded-xl hover:bg-[var(--muted)] transition cursor-pointer"
            >
              <bdi>{t.advancedToggle}</bdi>
              <span>{showAdvancedSocials ? '▲' : '▼'}</span>
            </button>

            {showAdvancedSocials && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-3 animate-fadeIn">
                {advancedSocials.map((p) => (
                  <div key={p.key} className="p-3.5 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-1.5 shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{p.icon}</span>
                      <span className="text-xs font-bold text-[var(--foreground)]">{p.label}</span>
                    </div>
                    <input
                      type="text"
                      value={data.socials[p.key]?.url || ''}
                      onChange={(e) => handleSocialUrlChange(p.key, e.target.value)}
                      placeholder={p.placeholder}
                      className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs placeholder:text-[var(--muted-foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:outline-none transition"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}