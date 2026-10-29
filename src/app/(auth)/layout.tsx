import React from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className="relative w-full px-4 pt-24 pb-12 sm:px-6">{children}</div>;
}
