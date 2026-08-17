'use client';

import React, { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { useLocale } from 'next-intl';
import { isRtlLocale } from '@/i18n/locales';
import { PaginationDots } from './PaginationDots';
import { getAuthTranslations } from './translations';

interface RegisterScreenProps {
  onNavigateLogin?: () => void;
  onNavigateVerify?: () => void;
  onSubmit?: (e: React.FormEvent) => void;
  isStandaloneMobile?: boolean;
}

export function RegisterScreen({
  onNavigateLogin,
  onNavigateVerify,
  onSubmit,
  isStandaloneMobile = false,
}: RegisterScreenProps) {
  const locale = useLocale();
  const isRtl = isRtlLocale(locale);
  const t = getAuthTranslations(locale);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    } else if (onNavigateVerify) {
      onNavigateVerify();
    }
  };

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className={`w-full mx-auto bg-[#F4F6F9] dark:bg-[#0B0F19] text-gray-900 dark:text-gray-100 flex flex-col justify-end relative overflow-hidden select-none transition-colors duration-300 ${
        isStandaloneMobile
          ? 'min-h-[100dvh] rounded-none shadow-none border-0'
          : 'min-h-[100dvh] sm:min-h-[720px] md:min-h-[760px] max-w-full sm:max-w-md md:max-w-lg sm:rounded-[36px] sm:shadow-2xl sm:border sm:border-slate-200/80 dark:sm:border-slate-800'
      }`}
    >
      {/* Top Background subtle bar */}
      <div className="h-8 sm:h-12 w-full flex items-center justify-center">
        <div className="w-12 h-1 bg-gray-300/40 dark:bg-slate-700/60 rounded-full" />
      </div>

      {/* White Bottom Sheet / Card */}
      <div className="bg-white dark:bg-[#151D2C] rounded-t-[32px] sm:rounded-t-[36px] px-6 sm:px-8 md:px-10 pt-4 sm:pt-6 pb-8 sm:pb-10 shadow-[0_-10px_30px_-5px_rgba(0,0,0,0.06)] dark:shadow-[0_-10px_30px_-5px_rgba(0,0,0,0.4)] flex-1 flex flex-col justify-between transition-colors duration-300">
        <div className="space-y-3.5 sm:space-y-4">
          {/* Pagination Indicator */}
          <PaginationDots activeIndex={1} />

          {/* Header */}
          <div className="text-center space-y-1 pt-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              <bdi>{t.registerTitle}</bdi>
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-400 max-w-xs sm:max-w-sm mx-auto leading-relaxed">
              <bdi>{t.registerSubtitle}</bdi>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-3.5 pt-1">
            {/* First Name & Last Name */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="reg-fname" className="sr-only">{t.firstNamePlaceholder}</label>
                <input
                  id="reg-fname"
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder={t.firstNamePlaceholder}
                  className="w-full px-4 py-3 sm:py-3.5 bg-[#F8FAFC] dark:bg-[#0B0F19]/80 border-0 dark:border dark:border-slate-800 rounded-xl text-sm sm:text-base text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:bg-white dark:focus:bg-[#0B0F19] focus:ring-2 focus:ring-[#4A72B2] focus:outline-none transition-all text-start"
                />
              </div>
              <div>
                <label htmlFor="reg-lname" className="sr-only">{t.lastNamePlaceholder}</label>
                <input
                  id="reg-lname"
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder={t.lastNamePlaceholder}
                  className="w-full px-4 py-3 sm:py-3.5 bg-[#F8FAFC] dark:bg-[#0B0F19]/80 border-0 dark:border dark:border-slate-800 rounded-xl text-sm sm:text-base text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:bg-white dark:focus:bg-[#0B0F19] focus:ring-2 focus:ring-[#4A72B2] focus:outline-none transition-all text-start"
                />
              </div>
            </div>

            {/* Email Account */}
            <div>
              <label htmlFor="reg-email" className="sr-only">{t.emailPlaceholder}</label>
              <input
                id="reg-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                className="w-full px-4 py-3 sm:py-3.5 bg-[#F8FAFC] dark:bg-[#0B0F19]/80 border-0 dark:border dark:border-slate-800 rounded-xl text-sm sm:text-base text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:bg-white dark:focus:bg-[#0B0F19] focus:ring-2 focus:ring-[#4A72B2] focus:outline-none transition-all text-start"
              />
            </div>

            {/* Username with checkmark */}
            <div className="relative flex items-center">
              <label htmlFor="reg-username" className="sr-only">{t.usernamePlaceholder}</label>
              <input
                id="reg-username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t.usernamePlaceholder}
                className={`w-full ${isRtl ? 'pr-4 pl-10' : 'pl-4 pr-10'} py-3 sm:py-3.5 bg-[#F8FAFC] dark:bg-[#0B0F19]/80 border-0 dark:border dark:border-slate-800 rounded-xl text-sm sm:text-base text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:bg-white dark:focus:bg-[#0B0F19] focus:ring-2 focus:ring-[#4A72B2] focus:outline-none transition-all text-start`}
              />
              <div className={`absolute ${isRtl ? 'left-3.5' : 'right-3.5'} w-4 h-4 rounded-full bg-gray-300 dark:bg-slate-600 text-white flex items-center justify-center pointer-events-none`}>
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
            </div>

            {/* Birthday Selects */}
            <div className="flex items-center gap-2 pt-0.5">
              <span className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 min-w-[56px] sm:min-w-[64px] text-start">
                <bdi>{t.birthdayLabel}</bdi>
              </span>
              <div className="flex-1 grid grid-cols-3 gap-2">
                <div className="relative">
                  <select
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    className={`w-full appearance-none bg-[#F8FAFC] dark:bg-[#0B0F19]/80 dark:border dark:border-slate-800 text-gray-600 dark:text-gray-300 text-xs sm:text-sm py-2.5 sm:py-3 ${isRtl ? 'pr-3 pl-6' : 'pl-3 pr-6'} rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4A72B2] cursor-pointer`}
                  >
                    <option value="">{t.day}</option>
                    {Array.from({ length: 31 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 absolute ${isRtl ? 'left-2' : 'right-2'} top-3 sm:top-3.5 pointer-events-none`} />
                </div>

                <div className="relative">
                  <select
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className={`w-full appearance-none bg-[#F8FAFC] dark:bg-[#0B0F19]/80 dark:border dark:border-slate-800 text-gray-600 dark:text-gray-300 text-xs sm:text-sm py-2.5 sm:py-3 ${isRtl ? 'pr-3 pl-6' : 'pl-3 pr-6'} rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4A72B2] cursor-pointer`}
                  >
                    <option value="">{t.month}</option>
                    {[
                      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
                    ].map((m, idx) => (
                      <option key={m} value={idx + 1}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 absolute ${isRtl ? 'left-2' : 'right-2'} top-3 sm:top-3.5 pointer-events-none`} />
                </div>

                <div className="relative">
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className={`w-full appearance-none bg-[#F8FAFC] dark:bg-[#0B0F19]/80 dark:border dark:border-slate-800 text-gray-600 dark:text-gray-300 text-xs sm:text-sm py-2.5 sm:py-3 ${isRtl ? 'pr-3 pl-6' : 'pl-3 pr-6'} rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4A72B2] cursor-pointer`}
                  >
                    <option value="">{t.year}</option>
                    {Array.from({ length: 70 }, (_, i) => 2026 - i).map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 absolute ${isRtl ? 'left-2' : 'right-2'} top-3 sm:top-3.5 pointer-events-none`} />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-password" className="sr-only">{t.passwordPlaceholder}</label>
              <input
                id="reg-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.passwordPlaceholder}
                className="w-full px-4 py-3 sm:py-3.5 bg-[#F8FAFC] dark:bg-[#0B0F19]/80 border-0 dark:border dark:border-slate-800 rounded-xl text-sm sm:text-base text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:bg-white dark:focus:bg-[#0B0F19] focus:ring-2 focus:ring-[#4A72B2] focus:outline-none transition-all text-start"
              />
            </div>

            {/* Terms & Conditions Checkbox */}
            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <button
                  type="button"
                  onClick={() => setAgreeTerms(!agreeTerms)}
                  className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                    agreeTerms ? 'bg-[#85C249] text-white' : 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0B0F19]'
                  }`}
                  aria-checked={agreeTerms}
                  role="checkbox"
                >
                  {agreeTerms && <Check className="w-3 h-3 stroke-[3]" />}
                </button>
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  <bdi>{t.termsAndConditions1}</bdi>{' '}
                  <span className="font-bold underline text-gray-900 dark:text-white">
                    <bdi>{t.termsAndConditions2}</bdi>
                  </span>
                </span>
              </label>
            </div>

            {/* Actions */}
            <div className="space-y-2.5 pt-2 sm:pt-3">
              <button
                type="submit"
                className="w-full bg-[#4A72B2] hover:bg-[#3E6199] active:bg-[#345384] text-white font-bold text-xs sm:text-sm tracking-wider uppercase py-3.5 sm:py-4 px-4 rounded-xl shadow-md transition-all active:scale-[0.99] cursor-pointer"
              >
                <bdi>{t.createAccountButton}</bdi>
              </button>

              <div className="text-center text-[10px] sm:text-xs font-bold text-gray-400 dark:text-gray-500 tracking-widest">
                <bdi>{t.or}</bdi>
              </div>

              <button
                type="button"
                onClick={onNavigateLogin}
                className="w-full text-center text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 hover:text-gray-950 dark:hover:text-white uppercase tracking-wider py-1 cursor-pointer transition-colors"
              >
                <bdi>{t.backToLogin}</bdi>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
