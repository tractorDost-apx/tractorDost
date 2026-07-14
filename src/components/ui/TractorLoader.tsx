import React from 'react';

interface TractorLoaderProps {
  size?: number;
  className?: string;
}

export function TractorLoader({ size = 32, className = '' }: TractorLoaderProps) {
  return (
    <div 
      className={`inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <style>
        {`
          .tractor-bounce {
            animation: bounce-engine 0.35s infinite alternate ease-in-out;
            transform-origin: center bottom;
          }
          .spin-wheel {
            animation: spin 1.2s linear infinite;
          }
          @keyframes bounce-engine {
            from { transform: translateY(0px); }
            to { transform: translateY(-3px); }
          }
          @keyframes spin {
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        <defs>
          <mask id="tractor-loader-cutouts">
            <rect width="100" height="100" fill="white" />
            <path d="M 50 47 L 65 47 C 75 47, 85 49, 90 55 L 88 57 C 83 51, 75 50, 65 50 L 50 50 Z" fill="black" />
            <path d="M 94 50 C 97 50, 98 53, 97 58 L 92 58 C 91 55, 92 52, 94 50 Z" fill="black" />
            <rect x="45" y="71" width="12" height="4" fill="black" />
            <rect x="45" y="65" width="12" height="2" fill="black" />
            <circle cx="30" cy="65" r="23" fill="black" />
            <circle cx="76" cy="75" r="18" fill="black" />
          </mask>
        </defs>

        {/* Bouncing Solid Tractor Body */}
        <g className="tractor-bounce" fill="currentColor">
          {/* Masked Body */}
          <g mask="url(#tractor-loader-cutouts)">
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

          {/* Front Fender (inside the transparent cutout) */}
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

        {/* Spinning Wheels */}
        <g className="spin-wheel" style={{ transformOrigin: '30px 65px' }} fill="currentColor">
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
        
        <g className="spin-wheel" style={{ transformOrigin: '76px 75px' }} fill="currentColor">
          <circle cx="76" cy="75" r="12" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="4 3" />
          <circle cx="76" cy="75" r="8" fill="none" stroke="currentColor" strokeWidth="6" />
          <circle cx="76" cy="75" r="2.5" />
        </g>
      </svg>
    </div>
  );
}
