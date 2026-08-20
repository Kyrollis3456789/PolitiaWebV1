import React, { SVGProps } from 'react';

/**
 * Geometric, minimalist Male icon (Mars symbol / Vector style)
 */
export function MaleIcon({
  className = 'w-6 h-6',
  strokeWidth = 1.75,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Modern Geometric Mars Symbol */}
      <circle cx="10" cy="14" r="5" />
      <path d="M19 5l-5.4 5.4" />
      <path d="M14 5h5v5" />
    </svg>
  );
}

/**
 * Geometric, minimalist Female icon (Venus symbol / Vector style)
 */
export function FemaleIcon({
  className = 'w-6 h-6',
  strokeWidth = 1.75,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Modern Geometric Venus Symbol */}
      <circle cx="12" cy="9" r="5" />
      <path d="M12 14v7" />
      <path d="M8.5 18h7" />
    </svg>
  );
}

/**
 * Minimalist Modern Abstract Male Avatar Silhouette
 */
export function MaleAvatarIcon({
  className = 'w-6 h-6',
  strokeWidth = 1.75,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <circle cx="12" cy="7" r="3.75" />
      <path d="M5.5 20.5c0-3.3 2.9-6 6.5-6s6.5 2.7 6.5 6" />
      <path d="M9.5 14.5l2.5 2.5 2.5-2.5" />
    </svg>
  );
}

/**
 * Minimalist Modern Abstract Female Avatar Silhouette
 */
export function FemaleAvatarIcon({
  className = 'w-6 h-6',
  strokeWidth = 1.75,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <circle cx="12" cy="7" r="3.75" />
      <path d="M5 20.5c0-3.6 3.1-6.5 7-6.5s7 2.9 7 6.5" />
      <path d="M8.5 7.5c.8 3.5 2 4.5 3.5 4.5s2.7-1 3.5-4.5" />
    </svg>
  );
}
