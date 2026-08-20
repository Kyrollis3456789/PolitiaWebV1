'use client';

import React, { useMemo } from 'react';
import { clsx } from 'clsx';
import { Check, X, ShieldAlert, ShieldCheck, Shield } from 'lucide-react';

export interface PasswordCriteria {
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export function checkPasswordStrength(password: string): {
  score: number; // 0 to 5
  criteria: PasswordCriteria;
  isStrong: boolean;
  labelEn: string;
  labelAr: string;
  colorClass: string;
  barColor: string;
} {
  const criteria: PasswordCriteria = {
    hasMinLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[^A-Za-z0-9]/.test(password),
  };

  let score = 0;
  if (criteria.hasMinLength) score++;
  if (criteria.hasUppercase) score++;
  if (criteria.hasLowercase) score++;
  if (criteria.hasNumber) score++;
  if (criteria.hasSpecialChar) score++;

  const isStrong = score === 5 && password.length >= 8;

  let labelEn = 'Very Weak';
  let labelAr = 'ضعيفة جداً';
  let colorClass = 'text-rose-500';
  let barColor = 'bg-rose-500';

  if (!password) {
    labelEn = 'Not entered';
    labelAr = 'لم يتم الإدخال';
    colorClass = 'text-slate-400';
    barColor = 'bg-slate-300 dark:bg-slate-700';
  } else if (score <= 2) {
    labelEn = 'Weak (Must be Strong)';
    labelAr = 'ضعيفة (يجب أن تكون قوية)';
    colorClass = 'text-rose-500';
    barColor = 'bg-rose-500';
  } else if (score === 3 || score === 4) {
    labelEn = 'Medium (Almost there)';
    labelAr = 'متوسطة (أوشكت على الاكتمال)';
    colorClass = 'text-amber-500';
    barColor = 'bg-amber-500';
  } else if (isStrong) {
    labelEn = 'Strong & Secure';
    labelAr = 'قوية وآمنة ومحمية';
    colorClass = 'text-emerald-500';
    barColor = 'bg-emerald-500';
  }

  return { score, criteria, isStrong, labelEn, labelAr, colorClass, barColor };
}

interface PasswordStrengthMeterProps {
  password: string;
  isRtl?: boolean;
}

export default function PasswordStrengthMeter({
  password,
  isRtl = false,
}: PasswordStrengthMeterProps) {
  const { score, criteria, isStrong, labelEn, labelAr, colorClass, barColor } = useMemo(
    () => checkPasswordStrength(password),
    [password]
  );

  const criteriaList = [
    { key: 'hasMinLength', satisfied: criteria.hasMinLength, ar: '8 أحرف على الأقل', en: 'At least 8 characters' },
    { key: 'hasUppercase', satisfied: criteria.hasUppercase, ar: 'حرف كبير واحد على الأقل (A-Z)', en: 'At least one uppercase letter (A-Z)' },
    { key: 'hasLowercase', satisfied: criteria.hasLowercase, ar: 'حرف صغير واحد على الأقل (a-z)', en: 'At least one lowercase letter (a-z)' },
    { key: 'hasNumber', satisfied: criteria.hasNumber, ar: 'رقم واحد على الأقل (0-9)', en: 'At least one number (0-9)' },
    { key: 'hasSpecialChar', satisfied: criteria.hasSpecialChar, ar: 'رمز خاص واحد على الأقل (!@#$%^&*)', en: 'At least one special symbol (!@#$%^&*)' },
  ];

  return (
    <div className="w-full space-y-2.5 pt-1">
      {/* Strength Bar & Rating Label */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
            {isStrong ? (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            ) : score >= 3 ? (
              <Shield className="w-3.5 h-3.5 text-amber-500" />
            ) : (
              <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
            )}
            <span>{isRtl ? 'قوة كلمة المرور:' : 'Password Strength:'}</span>
          </span>
          <span className={clsx('font-bold transition-colors', colorClass)}>
            {isRtl ? labelAr : labelEn}
          </span>
        </div>

        {/* 5-segment Strength Bar */}
        <div className="grid grid-cols-5 gap-1 h-1.5 w-full">
          {[1, 2, 3, 4, 5].map((seg) => (
            <div
              key={seg}
              className={clsx(
                'h-full rounded-full transition-all duration-300',
                score >= seg ? barColor : 'bg-slate-200 dark:bg-slate-800'
              )}
            />
          ))}
        </div>
      </div>

      {/* Real-time Interactive Checklist */}
      <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 space-y-1.5 text-[11px]">
        <div className="font-semibold text-slate-700 dark:text-slate-300 mb-1">
          {isRtl ? 'شروط كلمة المرور القوية (مطلوبة بالكامل):' : 'Password requirements (All required):'}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {criteriaList.map((item) => (
            <div
              key={item.key}
              className={clsx(
                'flex items-center gap-1.5 transition-colors',
                item.satisfied
                  ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                  : 'text-slate-400 dark:text-slate-500'
              )}
            >
              <div
                className={clsx(
                  'w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] shrink-0 transition-colors',
                  item.satisfied
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                )}
              >
                {item.satisfied ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : <X className="w-2 h-2" />}
              </div>
              <span className="truncate">{isRtl ? item.ar : item.en}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
