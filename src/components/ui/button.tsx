import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'emerald';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'md', children, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center rounded-xl font-bold transition-all active:scale-95 disabled:pointer-events-none disabled:opacity-50 cursor-pointer';

    const variants = {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      outline: 'border border-border/60 bg-transparent hover:bg-muted/30 text-foreground',
      ghost: 'bg-transparent hover:bg-muted/30 text-foreground',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      emerald: 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/20',
    }[variant];

    const sizes = {
      sm: 'h-8 px-3 text-xs gap-1.5',
      md: 'h-10 px-4 text-sm gap-2',
      lg: 'h-12 px-6 text-base gap-2.5',
      icon: 'h-9 w-9 p-0',
    }[size];

    return (
      <button
        ref={ref}
        type="button"
        className={`${base} ${variants} ${sizes} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
