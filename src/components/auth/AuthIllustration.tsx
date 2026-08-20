'use client';

import React from 'react';
import { User, Phone } from 'lucide-react';

interface AuthIllustrationProps {
  type: 'login' | 'verify';
  className?: string;
}

export function AuthIllustration({ type, className = '' }: AuthIllustrationProps) {
  if (type === 'login') {
    return (
      <div className={`relative w-full h-40 sm:h-44 md:h-48 flex items-center justify-center overflow-visible ${className}`}>
        {/* Soft Organic Backdrop Blob */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg
            viewBox="0 0 240 180"
            className="w-52 sm:w-60 md:w-64 h-36 sm:h-40 md:h-44 text-[#EDE7DB]/80 transition-transform duration-500 hover:scale-105"
            fill="currentColor"
          >
            <path d="M42.8,137.6 C14.3,115.7 8.2,74.5 28.5,43.2 C48.8,11.9 95.5,-9.5 137.4,4.2 C179.3,17.9 216.4,66.7 207.2,106.8 C198,146.9 142.5,178.3 98.9,178.6 C55.3,178.9 71.3,159.5 42.8,137.6 Z" />
          </svg>
        </div>

        {/* Smartphone Graphic */}
        <div className="relative z-10 w-22 sm:w-24 md:w-26 h-32 sm:h-36 md:h-40 bg-[#5B9BD5] rounded-2xl p-1.5 shadow-lg border-2 border-white flex flex-col items-center justify-between transition-transform duration-300 hover:-translate-y-1">
          {/* Phone Top Notch/Speaker */}
          <div className="w-6 h-1 bg-white/70 rounded-full mt-0.5" />

          {/* Phone Screen */}
          <div className="w-full flex-1 bg-white rounded-lg my-1 flex items-center justify-center relative overflow-hidden">
            {/* Padlock Icon */}
            <div className="relative flex flex-col items-center">
              {/* Shackle */}
              <div className="w-6 sm:w-7 h-6 sm:h-7 border-4 border-[#FBBF24] rounded-t-full -mb-2 z-0" />
              {/* Lock Body */}
              <div className="w-8 sm:w-9 h-7 sm:h-8 bg-[#FBBF24] rounded-xl shadow-md flex items-center justify-center z-10">
                <div className="w-2 h-2.5 bg-[#92400E] rounded-full" />
              </div>
            </div>
          </div>

          {/* Phone Home Button */}
          <div className="w-3.5 sm:w-4 h-3.5 sm:h-4 rounded-full border border-white/60 bg-white/30 mb-0.5" />

          {/* Floating Blue User Bubble */}
          <div className="absolute -top-1 -right-3 w-9 sm:w-10 h-9 sm:h-10 bg-[#4A72B2] rounded-full shadow-md border-2 border-white flex items-center justify-center">
            <User className="w-4 sm:w-5 h-4 sm:h-5 text-white fill-white" />
            {/* Bubble Tail */}
            <div className="absolute -bottom-1 left-2 w-2 h-2 bg-[#4A72B2] rotate-45" />
          </div>
        </div>
      </div>
    );
  }

  // Verify Illustration
  return (
    <div className={`relative w-full h-40 sm:h-44 md:h-48 flex items-center justify-center overflow-visible ${className}`}>
      {/* Soft Organic Backdrop Blob */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <svg
          viewBox="0 0 240 180"
          className="w-52 sm:w-60 md:w-64 h-36 sm:h-40 md:h-44 text-[#EDE7DB]/80 transition-transform duration-500 hover:scale-105"
          fill="currentColor"
        >
          <path d="M50.4,142.1 C18.1,123.6 7.4,81.3 25.6,48.2 C43.8,15.1 90.9,-8.8 135.2,3.1 C179.5,15 221.0,62.7 214.3,103.8 C207.6,144.9 152.7,179.4 107.5,180.0 C62.3,180.6 82.7,160.6 50.4,142.1 Z" />
        </svg>
      </div>

      {/* Smartphone Graphic */}
      <div className="relative z-10 w-22 sm:w-24 md:w-26 h-32 sm:h-36 md:h-40 bg-[#5B9BD5] rounded-2xl p-1.5 shadow-lg border-2 border-white flex flex-col items-center justify-between transition-transform duration-300 hover:-translate-y-1">
        {/* Phone Top Notch */}
        <div className="w-6 h-1 bg-white/70 rounded-full mt-0.5" />

        {/* Phone Screen */}
        <div className="w-full flex-1 bg-white rounded-lg my-1 flex items-center justify-center relative overflow-hidden" />

        {/* Phone Home Button */}
        <div className="w-3.5 sm:w-4 h-3.5 sm:h-4 rounded-full border border-white/60 bg-white/30 mb-0.5" />

        {/* Floating Orange Phone Call Bubble (Left) */}
        <div className="absolute top-1 -left-4 w-10 sm:w-12 h-10 sm:h-12 bg-[#F97316] rounded-full shadow-md border-2 border-white flex items-center justify-center z-20">
          <Phone className="w-5 sm:w-6 h-5 sm:h-6 text-white fill-white rotate-[15deg]" />
        </div>

        {/* Floating Orange Password Mask Bubble (Right) */}
        <div className="absolute top-8 sm:top-10 -right-7 sm:-right-8 bg-[#F97316] px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl shadow-md border-2 border-white flex items-center gap-1 z-20">
          <div className="flex gap-0.5 text-white font-bold text-xs sm:text-sm tracking-widest leading-none select-none">
            ••••••••
          </div>
          {/* Bubble Tail */}
          <div className="absolute -bottom-1 left-2 w-2 h-2 bg-[#F97316] rotate-45" />
        </div>
      </div>
    </div>
  );
}
