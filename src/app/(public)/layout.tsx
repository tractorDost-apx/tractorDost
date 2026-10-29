import React from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className="relative w-full pt-[64px] sm:pt-[72px] lg:pt-[80px] pb-12">{children}</div>;
}
