"use client";

import React, { useState, useEffect } from 'react';

const words = [
  "Tractor",
  "Implement",
  "Harvester",
  "Finance",
];

export function AnimatedWord() {
  const [index, setIndex] = useState(0);
  const [key, setKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((current) => (current + 1) % words.length);
      setKey(prev => prev + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="relative inline-flex items-center justify-center min-w-[220px] md:min-w-[320px]">
      <span className="opacity-0 pointer-events-none select-none">Implement</span>
      <span 
        key={key} 
        className="absolute inset-x-0 mx-auto text-center text-gradient-brand animate-word-flip will-change-[transform,opacity] drop-shadow-[0_0_15px_rgba(74,118,53,0.3)]"
      >
        {words[index]}
      </span>
    </span>
  );
}
