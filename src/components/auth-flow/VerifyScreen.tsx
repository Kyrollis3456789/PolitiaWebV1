'use client';

import React, { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { useLocale } from 'next-intl';
import { isRtlLocale } from '@/i18n/locales';
import { AuthIllustration } from './AuthIllustration';
import { PaginationDots } from './PaginationDots';
import { getAuthTranslations } from './translations';

interface VerifyScreenProps {
  onNavigateLogin?: () => void;
  onSubmit?: (e: React.FormEvent) => void;
  isStandaloneMobile?: boolean;
}

export function VerifyScreen({
  onNavigateLogin,
  onSubmit,
  isStandaloneMobile = false,
}: VerifyScreenProps) {
  const locale = useLocale();
  const isRtl = isRtlLocale(locale);
  const t = getAuthTranslations(locale);

  const [method, setMethod] = useState<'phone' | 'email'>('phone');
  const [countryCode, setCountryCode] = useState('123');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    } else if (onNavigateLogin) {
      onNavigateLogin();
    }
  };

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className={`w-full mx-auto bg-[#F4F6F9] dark:bg-[#0B0F19] text-gray-900 dark:text-gray-100 flex flex-col justify-between relative overflow-hidden select-none transition-colors duration-300 ${
        isStandaloneMobile
          ? 'min-h-[100dvh] rounded-none shadow-none border-0'
          : 'min-h-[100dvh] sm:min-h-[720px] md:min-h-[760px] max-w-full sm:max-w-md md:max-w-lg sm:rounded-[36px] sm:shadow-2xl sm:border sm:border-slate-200/80 dark:sm:border-slate-800'
      }`}
    >
      {/* Top Background / Illustration Area */}
      <div className="pt-6 sm:pt-8 md:pt-10 pb-3 sm:pb-4 px-4 sm:px-6 flex flex-col items-center justify-center">
        <AuthIllustration type="verify" />
      </div>

      {/* White Bottom Sheet / Card */}
      <div className="bg-white dark:bg-[#151D2C] rounded-t-[32px] sm:rounded-t-[36px] px-6 sm:px-8 md:px-10 pt-4 sm:pt-6 pb-8 sm:pb-10 shadow-[0_-10px_30px_-5px_rgba(0,0,0,0.06)] dark:shadow-[0_-10px_30px_-5px_rgba(0,0,0,0.4)] flex-1 flex flex-col justify-between transition-colors duration-300">
        <div className="space-y-4 sm:space-y-5">
          {/* Pagination Indicator */}
          <PaginationDots activeIndex={2} />

          {/* Header */}
          <div className="text-center space-y-1.5 pt-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              <bdi>{t.verifyTitle}</bdi>
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-400 max-w-xs sm:max-w-sm mx-auto leading-relaxed">
              <bdi>{t.verifySubtitle}</bdi>
            </p>
          </div>

          {/* Method Toggles */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* Phone Option */}
            <button
              type="button"
              onClick={() => setMethod('phone')}
              className={`flex items-center justify-center gap-1.5 py-2.5 sm:py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                method === 'phone'
                  ? 'bg-[#85C249] text-white shadow-sm'
                  : 'bg-[#F8FAFC] dark:bg-[#0B0F19]/80 text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
              }`}
            >
              <div
                className={`w-3.5 sm:w-4 h-3.5 sm:h-4 rounded-full flex items-center justify-center ${
                  method === 'phone' ? 'bg-white/20 text-white' : 'bg-gray-300 dark:bg-slate-600 text-white'
                }`}
              >
                <Check className="w-2.5 sm:w-3 h-2.5 sm:h-3 stroke-[3]" />
              </div>
              <span className="uppercase tracking-wider"><bdi>{t.phoneTab}</bdi></span>
            </button>

            {/* Email Option */}
            <button
              type="button"
              onClick={() => setMethod('email')}
              className={`flex items-center justify-center gap-1.5 py-2.5 sm:py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                method === 'email'
                  ? 'bg-[#85C249] text-white shadow-sm'
                  : 'bg-[#F8FAFC] dark:bg-[#0B0F19]/80 text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
              }`}
            >
              <div
                className={`w-3.5 sm:w-4 h-3.5 sm:h-4 rounded-full flex items-center justify-center ${
                  method === 'email' ? 'bg-white/20 text-white' : 'bg-gray-300 dark:bg-slate-600 text-white'
                }`}
              >
                <Check className="w-2.5 sm:w-3 h-2.5 sm:h-3 stroke-[3]" />
              </div>
              <span><bdi>{t.emailTab}</bdi></span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4 pt-1">
            {method === 'phone' ? (
              /* Phone Number row */
              <div className="flex gap-2.5">
                {/* Country Code Selector */}
                <div className="relative flex items-center bg-[#F8FAFC] dark:bg-[#0B0F19]/80 dark:border dark:border-slate-800 rounded-xl px-3 py-3.5 sm:py-4 gap-1.5 shrink-0">
                  <div className="w-5 h-3.5 rounded-sm overflow-hidden flex flex-col shadow-xs border border-gray-200/50">
                    <div className="h-1/3 bg-[#ED2939]" />
                    <div className="h-1/3 bg-white" />
                    <div className="h-1/3 bg-[#00A3E0]" />
                  </div>
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="bg-transparent text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 appearance-none pr-4 focus:outline-none cursor-pointer"
                  >
                    <option value="123" className="dark:bg-slate-900">123</option>
                    <option value="+1" className="dark:bg-slate-900">+1</option>
                    <option value="+20" className="dark:bg-slate-900">+20</option>
                    <option value="+44" className="dark:bg-slate-900">+44</option>
                    <option value="+49" className="dark:bg-slate-900">+49</option>
                    <option value="+33" className="dark:bg-slate-900">+33</option>
                    <option value="+966" className="dark:bg-slate-900">+966</option>
                    <option value="+971" className="dark:bg-slate-900">+971</option>
                  </select>
                  <ChevronDown className={`w-3 h-3 text-gray-400 absolute ${isRtl ? 'left-2' : 'right-2'} pointer-events-none`} />
                </div>

                {/* Phone Number Input */}
                <div className="flex-1">
                  <label htmlFor="verify-phone" className="sr-only">{t.phoneNumberPlaceholder}</label>
                  <input
                    id="verify-phone"
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder={t.phoneNumberPlaceholder}
                    className="w-full px-4 py-3.5 sm:py-4 bg-[#F8FAFC] dark:bg-[#0B0F19]/80 border-0 dark:border dark:border-slate-800 rounded-xl text-sm sm:text-base text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:bg-white dark:focus:bg-[#0B0F19] focus:ring-2 focus:ring-[#4A72B2] focus:outline-none transition-all text-start"
                  />
                </div>
              </div>
            ) : (
              /* Email Input */
              <div>
                <label htmlFor="verify-email" className="sr-only">{t.emailPlaceholder}</label>
                <input
                  id="verify-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  className="w-full px-4 py-3.5 sm:py-4 bg-[#F8FAFC] dark:bg-[#0B0F19]/80 border-0 dark:border dark:border-slate-800 rounded-xl text-sm sm:text-base text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:bg-white dark:focus:bg-[#0B0F19] focus:ring-2 focus:ring-[#4A72B2] focus:outline-none transition-all text-start"
                />
              </div>
            )}

            {/* Account Password */}
            <div>
              <label htmlFor="verify-password" className="sr-only">{t.accountPasswordPlaceholder}</label>
              <input
                id="verify-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.accountPasswordPlaceholder}
                className="w-full px-4 py-3.5 sm:py-4 bg-[#F8FAFC] dark:bg-[#0B0F19]/80 border-0 dark:border dark:border-slate-800 rounded-xl text-sm sm:text-base text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:bg-white dark:focus:bg-[#0B0F19] focus:ring-2 focus:ring-[#4A72B2] focus:outline-none transition-all text-start"
              />
            </div>

            {/* Actions */}
            <div className="pt-2 sm:pt-3">
              <button
                type="submit"
                className="w-full bg-[#4A72B2] hover:bg-[#3E6199] active:bg-[#345384] text-white font-bold text-xs sm:text-sm tracking-wider uppercase py-3.5 sm:py-4 px-4 rounded-xl shadow-md transition-all active:scale-[0.99] cursor-pointer"
              >
                <bdi>{method === 'phone' ? t.verifyPhoneButton : t.verifyEmailButton}</bdi>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
