import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning';
}

export function Badge({ className = '', variant = 'default', children, ...props }: BadgeProps) {
  const base =
    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold tracking-wide uppercase transition-colors';

  const variants = {
    default: 'bg-primary/15 text-primary border border-primary/30',
    secondary: 'bg-secondary text-secondary-foreground border border-border/50',
    outline: 'border border-border/60 text-foreground bg-transparent',
    destructive: 'bg-rose-500/15 text-rose-500 border border-rose-500/30',
    success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  }[variant];

  return (
    <div className={`${base} ${variants} ${className}`} {...props}>
      {children}
    </div>
  );
}

export default Badge;
