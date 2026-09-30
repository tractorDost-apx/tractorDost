import React from 'react';

export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="animate-pulse text-xl font-bold tracking-widest text-lime-400">
        LOADING...
      </div>
    </div>
  );
}
