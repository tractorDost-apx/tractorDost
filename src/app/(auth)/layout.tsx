import React from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-[calc(100vh-70px)] w-full items-center justify-center px-3.5 pt-[68px] sm:pt-[76px] pb-12 sm:px-6">
      {children}
    </div>
  );
}
