'use client';

import React, { useEffect, useState } from 'react';

export function SplashScreen() {
  const [loading, setLoading] = useState(true);
  const [fading, setFading] = useState(false);
  const [assembled, setAssembled] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasSeenSplash = sessionStorage.getItem('tractorDost_splash_shown');
      if (hasSeenSplash) {
        setLoading(false);
        return;
      }
      sessionStorage.setItem('tractorDost_splash_shown', 'true');
    }

    // Stage 1: The Assembly Animation (0 - 2500ms)
    // Stage 2: Assembled & Text Reveal (2500ms)
    const assembleTimer = setTimeout(() => {
      setAssembled(true);
    }, 2500);

    // Stage 3: Fade out splash screen (4500ms total to admire the animation)
    const fadeTimer = setTimeout(() => {
      setFading(true);
      setTimeout(() => {
        setLoading(false);
      }, 500); // 500ms fade out duration
    }, 4500);
    
    return () => {
      clearTimeout(assembleTimer);
      clearTimeout(fadeTimer);
    };
  }, []);

  if (!loading) return null;

  return (
    <div 
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[var(--background)] transition-opacity duration-500 ease-in-out ${fading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
    >
      <style>
        {`
          .spin-fast {
            animation: spin 0.6s linear infinite;
          }
          .spin-normal {
            animation: spin 1.2s linear infinite;
          }
          
          /* Intro animations */
          .intro-rear-wheel {
            animation: reveal-rear 2.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          }
          @keyframes reveal-rear {
            0% { transform: translate(50px, 50px) scale(3); opacity: 0; }
            10% { transform: translate(50px, 50px) scale(3); opacity: 1; }
            35% { transform: translate(50px, 50px) scale(3); }
            65%, 100% { transform: translate(0px, 0px) scale(1); opacity: 1; }
          }
          
          .intro-body {
            animation: reveal-body 2.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          }
          @keyframes reveal-body {
            0%, 60% { transform: translateY(-75px); opacity: 0; }
            85%, 100% { transform: translateY(0); opacity: 1; }
          }
          
          .intro-front-wheel {
            animation: reveal-front 2.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          }
          @keyframes reveal-front {
            0%, 75% { transform: translate(0px, -75px); opacity: 0; }
            95%, 100% { transform: translate(0px, 0px); opacity: 1; }
          }
          
          /* Assembled Bounce */
          .assembled-bounce {
            animation: bounce-engine 0.35s infinite alternate ease-in-out;
            transform-origin: center bottom;
          }
          
          /* Text Fade */
          .text-reveal {
            animation: text-fade 1s ease-out forwards;
            opacity: 0;
            transform: translateY(20px);
          }
          @keyframes text-fade {
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes spin {
            100% { transform: rotate(360deg); }
          }
          @keyframes bounce-engine {
            from { transform: translateY(0px); }
            to { transform: translateY(-3px); }
          }
        `}
      </style>

      <div className="flex flex-col items-center gap-10 transform scale-125 md:scale-150">
        <div className="relative w-[200px] h-[200px]">
          {/* Glowing aura */}
          <div className={`absolute inset-0 bg-foreground/5 blur-3xl rounded-full transition-all duration-1000 ${assembled ? 'scale-125 opacity-100' : 'scale-50 opacity-0'}`}></div>
          
          <svg 
            width="100%" 
            height="100%" 
            viewBox="0 0 100 100" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="text-foreground relative z-10 overflow-visible"
          >
            <defs>
              <mask id="splash-tractor-cutouts">
                <rect width="100" height="100" fill="white" />
                <path d="M 50 47 L 65 47 C 75 47, 85 49, 90 55 L 88 57 C 83 51, 75 50, 65 50 L 50 50 Z" fill="black" />
                <path d="M 94 50 C 97 50, 98 53, 97 58 L 92 58 C 91 55, 92 52, 94 50 Z" fill="black" />
                <rect x="45" y="71" width="12" height="4" fill="black" />
                <rect x="45" y="65" width="12" height="2" fill="black" />
                <circle cx="30" cy="65" r="23" fill="black" />
                <circle cx="76" cy="75" r="18" fill="black" />
              </mask>
              <g id="splash-rear-wheel" fill="currentColor">
                <circle cx="30" cy="65" r="19" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="6 4" />
                <circle cx="30" cy="65" r="14.5" fill="none" stroke="currentColor" strokeWidth="7" />
                <circle cx="30" cy="65" r="4" />
                <circle cx="30" cy="57" r="1.5" />
                <circle cx="30" cy="73" r="1.5" />
                <circle cx="22" cy="65" r="1.5" />
                <circle cx="38" cy="65" r="1.5" />
                <circle cx="24.5" cy="59.5" r="1.5" />
                <circle cx="35.5" cy="59.5" r="1.5" />
                <circle cx="24.5" cy="70.5" r="1.5" />
                <circle cx="35.5" cy="70.5" r="1.5" />
              </g>
              <g id="splash-front-wheel" fill="currentColor">
                <circle cx="76" cy="75" r="12" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="4 3" />
                <circle cx="76" cy="75" r="8" fill="none" stroke="currentColor" strokeWidth="6" />
                <circle cx="76" cy="75" r="2.5" />
              </g>
            </defs>

            {/* Assembled Tractor Group (applies bounce once assembled) */}
            <g className={assembled ? "assembled-bounce" : ""}>
              
              {/* Rear Wheel Sequence */}
              <g className="intro-rear-wheel">
                <g className={assembled ? "spin-normal" : "spin-fast"} style={{ transformOrigin: '30px 65px' }}>
                  <use href="#splash-rear-wheel" />
                </g>
              </g>

              {/* Body Sequence */}
              <g className="intro-body" fill="currentColor">
                {/* Masked Solid Body */}
                <g mask="url(#splash-tractor-cutouts)">
                  <path d="
                    M 4 60
                    C 4 40, 15 36, 30 36
                    L 50 36
                    C 60 36, 85 36, 95 45
                    C 98 48, 98 55, 98 70
                    L 4 70
                    Z
                  " />
                </g>

                {/* Front Fender (inside transparent cutout) */}
                <path d="M 61 75 A 15 15 0 0 1 91 75" fill="none" stroke="currentColor" strokeWidth="2.5" />

                {/* Cabin Roof */}
                <rect x="18" y="12" width="32" height="5" rx="2.5" />
                {/* Cabin Pillars */}
                <polygon points="22,17 17,40 23,40 28,17" />
                <polygon points="44,17 52,40 46,40 38,17" />
                
                {/* Seat & Steering */}
                <path d="M 23 45 L 30 45 L 30 42 L 26 42 L 26 35 L 23 35 Z" />
                <line x1="47" y1="42" x2="38" y2="35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="36" y1="33" x2="41" y2="38" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                
                {/* Exhaust */}
                <rect x="62" y="22" width="7" height="15" rx="1" />
                <path d="M 65 22 L 65 12 C 65 8, 69 8, 72 5" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
                
                {/* Back Fender Bump */}
                <path d="M 12 36 L 16 32 L 20 36 Z" />
              </g>

              {/* Front Wheel Sequence */}
              <g className="intro-front-wheel">
                <g className={assembled ? "spin-normal" : "spin-fast"} style={{ transformOrigin: '76px 75px' }}>
                  <use href="#splash-front-wheel" />
                </g>
              </g>

            </g>
          </svg>
        </div>
        
        {/* Reveal Text only after assembly is near complete */}
        <div className={`flex flex-col items-center gap-3 ${assembled ? 'text-reveal' : 'opacity-0'}`}>
          <h1 className="text-5xl font-black tracking-tighter flex items-center">
            <span className="text-foreground">Tractor</span>
            <span className="text-[var(--color-brand-green)]">Dost</span>
          </h1>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="w-2 h-2 rounded-full bg-[var(--color-brand-green)] animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 rounded-full bg-[var(--color-brand-orange)] animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 rounded-full bg-[var(--color-brand-green)] animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
