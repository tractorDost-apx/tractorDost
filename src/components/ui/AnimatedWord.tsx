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
    <span className="relative inline-flex items-center justify-start text-left">
      <span className="pointer-events-none opacity-0 select-none">{words[index]}</span>
      <span
        key={key}
        className="text-gradient-brand animate-word-flip absolute inset-y-0 left-0 flex items-center text-left whitespace-nowrap will-change-[transform,opacity]"
      >
        {words[index]}
      </span>
    </span>
  );
}
