import React from 'react';
import Link from 'next/link';

interface SpatialButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'glass';
  href?: string;
  children: React.ReactNode;
}

export const SpatialButton = ({ variant = 'primary', href, children, className = '', ...props }: SpatialButtonProps) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-300 ease-out";
  
  const variants = {
    primary: "bg-lime-400 text-black hover:bg-lime-300 hover:shadow-[0_0_20px_rgba(163,230,53,0.4)] px-8 py-4 rounded-full text-lg",
    secondary: "bg-transparent text-foreground border border-lime-400/50 hover:bg-lime-400/10 hover:border-lime-400 px-8 py-4 rounded-full text-lg",
    glass: "glass-button px-6 py-3 text-sm text-foreground",
  };

  const classes = `${baseStyles} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};
