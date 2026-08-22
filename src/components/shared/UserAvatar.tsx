'use client';

import React, { useState } from 'react';

interface UserAvatarProps {
  src?: string | null;
  alt?: string;
  initialLetter: string;
  className?: string;
  fallbackClassName?: string;
}

export function UserAvatar({
  src,
  alt = 'User Avatar',
  initialLetter,
  className = 'w-20 h-20 rounded-2xl object-cover border-2 border-blue-600 shadow-md shrink-0',
  fallbackClassName = 'w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-black text-3xl shadow-md shrink-0 select-none',
}: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);

  if (src && !imageError) {
    return (
      <img
        src={src}
        alt={alt}
        onError={() => setImageError(true)}
        className={className}
      />
    );
  }

  return (
    <div className={fallbackClassName}>
      <bdi>{initialLetter.charAt(0).toUpperCase()}</bdi>
    </div>
  );
}
