'use client';

import React, { useState } from 'react';
import { LoginScreen } from './LoginScreen';
import { RegisterScreen } from './RegisterScreen';
import { VerifyScreen } from './VerifyScreen';
import { PhoneMockup } from './PhoneMockup';
import { ThemeLanguageControls } from './ThemeLanguageControls';
import { Smartphone, Tablet, Monitor, LayoutGrid, ArrowRight } from 'lucide-react';

export function AuthFlowShowcase() {
  const [viewMode, setViewMode] = useState<'all' | 'device'>('all');
  const [deviceSize, setDeviceSize] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [activeStep, setActiveStep] = useState<'login' | 'register' | 'verify'>('login');

  const getContainerWidth = () => {
    switch (deviceSize) {
      case 'mobile':
        return 'w-full max-w-[375px]';
      case 'tablet':
        return 'w-full max-w-[540px]';
      case 'desktop':
        return 'w-full max-w-[620px]';
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-100/80 dark:bg-slate-950 text-gray-900 dark:text-gray-100 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      {/* Top Banner & Controls */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-[#4A72B2] dark:text-blue-400 text-xs font-semibold mb-1">
              <span className="w-2 h-2 rounded-full bg-[#4A72B2] animate-pulse" />
              Responsive UI Showcase
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Adaptive Authentication Flow
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Theme &amp; Language Integrated • Phone, Tablet, and PC Responsive
            </p>
          </div>

          {/* Controls: Mode Switcher & Theme/Language Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode('all')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'all'
                    ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-xs'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                3 Phones
              </button>
              <button
                onClick={() => setViewMode('device')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'device'
                    ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-xs'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                Device Tester
              </button>
            </div>

            <ThemeLanguageControls />
          </div>
        </div>

        {/* Device & Step Switchers when in Device Tester mode */}
        {viewMode === 'device' && (
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
            {/* Device Size Toggles */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setDeviceSize('mobile')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  deviceSize === 'mobile'
                    ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-xs'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                Phone
              </button>
              <button
                onClick={() => setDeviceSize('tablet')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  deviceSize === 'tablet'
                    ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-xs'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Tablet className="w-3.5 h-3.5" />
                Tablet
              </button>
              <button
                onClick={() => setDeviceSize('desktop')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  deviceSize === 'desktop'
                    ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-xs'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                PC / Laptop
              </button>
            </div>

            {/* Screen Step Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveStep('login')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeStep === 'login'
                    ? 'bg-[#4A72B2] text-white shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                Login
              </button>
              <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
              <button
                onClick={() => setActiveStep('register')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeStep === 'register'
                    ? 'bg-[#4A72B2] text-white shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                Register
              </button>
              <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
              <button
                onClick={() => setActiveStep('verify')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeStep === 'verify'
                    ? 'bg-[#4A72B2] text-white shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                Verify
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {viewMode === 'all' ? (
        /* Triple Side-by-Side Presentation */
        <div className="max-w-[1340px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start justify-center">
          <div className="flex flex-col items-center">
            <div className="mb-3 text-xs font-bold tracking-wider uppercase text-gray-400">
              Screen 1 • Login
            </div>
            <PhoneMockup>
              <LoginScreen isStandaloneMobile={false} />
            </PhoneMockup>
          </div>

          <div className="flex flex-col items-center">
            <div className="mb-3 text-xs font-bold tracking-wider uppercase text-gray-400">
              Screen 2 • Create Account
            </div>
            <PhoneMockup>
              <RegisterScreen isStandaloneMobile={false} />
            </PhoneMockup>
          </div>

          <div className="flex flex-col items-center">
            <div className="mb-3 text-xs font-bold tracking-wider uppercase text-gray-400">
              Screen 3 • Verify Account
            </div>
            <PhoneMockup>
              <VerifyScreen isStandaloneMobile={false} />
            </PhoneMockup>
          </div>
        </div>
      ) : (
        /* Responsive Tester */
        <div className="w-full flex justify-center py-4 transition-all duration-300">
          <div className={`${getContainerWidth()} transition-all duration-300`}>
            {activeStep === 'login' && (
              <LoginScreen
                onNavigateRegister={() => setActiveStep('register')}
                onNavigateVerify={() => setActiveStep('verify')}
              />
            )}
            {activeStep === 'register' && (
              <RegisterScreen
                onNavigateLogin={() => setActiveStep('login')}
                onNavigateVerify={() => setActiveStep('verify')}
              />
            )}
            {activeStep === 'verify' && (
              <VerifyScreen
                onNavigateLogin={() => setActiveStep('login')}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
