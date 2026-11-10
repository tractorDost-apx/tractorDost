import React from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full overflow-x-clip pt-[70px] sm:pt-[82px] lg:pt-[94px] pb-14">
      {children}
    </div>
  );
}

