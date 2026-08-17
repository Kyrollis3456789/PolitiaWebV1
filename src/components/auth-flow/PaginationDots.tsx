'use client';

import React from 'react';

interface PaginationDotsProps {
  activeIndex: 0 | 1 | 2;
  className?: string;
}

export function PaginationDots({ activeIndex, className = '' }: PaginationDotsProps) {
  return (
    <div className={`flex items-center justify-center gap-1.5 py-1 ${className}`}>
      {[0, 1, 2].map((index) => {
        const isActive = activeIndex === index;
        return (
          <span
            key={index}
            className={`transition-all duration-300 rounded-full ${
              isActive
                ? 'w-2.5 h-2.5 bg-[#FDBE34] dark:bg-[#FDBE34] shadow-xs'
                : 'w-1.5 h-1.5 bg-slate-300 dark:bg-slate-700'
            }`}
            aria-label={`Step ${index + 1} of 3`}
          />
        );
      })}
    </div>
  );
}
