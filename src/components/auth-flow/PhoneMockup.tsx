'use client';

import React from 'react';

interface PhoneMockupProps {
  children: React.ReactNode;
  className?: string;
}

export function PhoneMockup({ children, className = '' }: PhoneMockupProps) {
  return (
    <div className={`relative mx-auto flex flex-col items-center ${className}`}>
      {/* Outer Phone Bezel */}
      <div className="relative w-[340px] sm:w-[370px] min-h-[760px] bg-black p-[14px] rounded-[52px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35),0_0_0_1px_rgba(0,0,0,0.1)] ring-1 ring-white/20 transition-all duration-300 hover:shadow-[0_30px_70px_-15px_rgba(0,0,0,0.45)]">
        {/* Dynamic Island / Notch Speaker Bar */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-full z-30 flex items-center justify-center gap-2 pointer-events-none">
          <div className="w-10 h-1 bg-[#1c1c1e] rounded-full" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#1c1c1e]" />
        </div>

        {/* Screen Bezel / Inner Content */}
        <div className="relative w-full h-full bg-[#F4F6F9] rounded-[40px] overflow-hidden flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
}
