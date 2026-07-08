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
        className={`rounded-full overflow-hidden flex items-center justify-center bg-foreground/10 border-2 border-[var(--border-subtle)] hover:border-[var(--color-brand-green)] transition-all ${className}`}
        style={{ width: size, height: size, minWidth: size, minHeight: size }}
      >
        <img src={photoUrl} alt={name || 'Profile'} className="w-full h-full object-cover" />
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
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500', 'bg-teal-500'
  ];
  
  const isFallback = !name && !photoUrl;

  const bgColor = name 
    ? bgColors[name.length % bgColors.length] 
    : 'bg-transparent'; // No background for outline mode

  return (
    <div 
      className={`rounded-full flex items-center justify-center font-bold transition-all ${bgColor} ${isFallback ? 'border-2 border-[var(--border-subtle)] text-foreground/80 hover:text-foreground hover:bg-foreground/5' : 'border-2 border-transparent text-white hover:border-[var(--color-brand-green)]'} ${className}`}
      style={{ width: size, height: size, minWidth: size, minHeight: size, fontSize: size * 0.4 }}
    >
      {initials ? initials : <UserIcon size={size * 0.5} strokeWidth={isFallback ? 2 : 2} className={isFallback ? 'text-foreground/80' : 'text-white/80'} />}
    </div>
  );
}
