import React from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className="relative w-full px-4 pt-28 pb-12 sm:px-8 lg:px-12">{children}</div>;
}
