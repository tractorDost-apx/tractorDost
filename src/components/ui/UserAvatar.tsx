import React from 'react';
import { User as UserIcon } from 'lucide-react';

interface UserAvatarProps {
  photoUrl?: string | null;
  name?: string | null;
  size?: number;
  className?: string;
}

export function UserAvatar({ photoUrl, name, size = 40, className = '' }: UserAvatarProps) {
  // If we have a photo, display it
  if (photoUrl) {
    return (
      <div
        className={`bg-foreground/10 flex items-center justify-center overflow-hidden rounded-full border-2 border-[var(--border-subtle)] transition-all hover:border-[var(--color-brand-green)] ${className}`}
        style={{ width: size, height: size, minWidth: size, minHeight: size }}
      >
        <img src={photoUrl} alt={name || 'Profile'} className="h-full w-full object-cover" />
      </div>
    );
  }

  // Calculate initials if we have a name
  let initials = '';
  if (name) {
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length > 0) {
      initials = parts[0][0].toUpperCase();
      if (parts.length > 1) {
        initials += parts[parts.length - 1][0].toUpperCase();
      }
    }
  }

  // Background color based on name length to give a deterministic pseudorandom color
  const bgColors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-orange-500',
    'bg-teal-500',
  ];

  const isFallback = !name && !photoUrl;

  const bgColor = name ? bgColors[name.length % bgColors.length] : 'bg-transparent'; // No background for outline mode

  return (
    <div
      className={`flex items-center justify-center rounded-full font-bold transition-all ${bgColor} ${isFallback ? 'text-foreground/80 hover:text-foreground hover:bg-foreground/5 border-2 border-[var(--border-subtle)]' : 'border-2 border-transparent text-white hover:border-[var(--color-brand-green)]'} ${className}`}
      style={{ width: size, height: size, minWidth: size, minHeight: size, fontSize: size * 0.4 }}
    >
      {initials ? (
        initials
      ) : (
        <UserIcon
          size={size * 0.5}
          strokeWidth={isFallback ? 2 : 2}
          className={isFallback ? 'text-foreground/80' : 'text-white/80'}
        />
      )}
    </div>
  );
}
