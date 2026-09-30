'use client';

import React, { useState, useEffect } from 'react';

const words = ['Tractor', 'Implement', 'Harvester', 'Finance'];

export function AnimatedWord() {
  const [index, setIndex] = useState(0);
  const [key, setKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((current) => (current + 1) % words.length);
      setKey((prev) => prev + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="relative inline-flex min-w-[220px] items-center justify-center md:min-w-[320px]">
      <span className="pointer-events-none opacity-0 select-none">Implement</span>
      <span
        key={key}
        className="text-gradient-brand animate-word-flip absolute inset-x-0 mx-auto text-center drop-shadow-[0_0_15px_rgba(74,118,53,0.3)] will-change-[transform,opacity]"
      >
        {words[index]}
      </span>
    </span>
  );
}
