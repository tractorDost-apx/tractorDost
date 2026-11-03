import React from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className="relative w-full pt-[88px] sm:pt-[96px] lg:pt-[108px] pb-12">{children}</div>;
}
