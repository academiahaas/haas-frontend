'use client';

import React from 'react';

export default function CoelhoRobot({ devePiscar = true }: { devePiscar?: boolean }) {
  return (
    <div className="relative flex flex-col items-center justify-center p-4">
      <svg viewBox="0 0 64 64" className="w-24 h-24 drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 22C18 12 22 6 22 6C22 6 26 12 26 22" stroke="#E2E8F0" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M38 22C38 12 42 6 42 6C42 6 46 12 46 22" stroke="#E2E8F0" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="14" y="22" width="36" height="30" rx="12" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
        <rect x="18" y="26" width="28" height="22" rx="8" fill="#0F172A" />
        <circle cx="24" cy="35" r="3" fill="#A855F7" />
        {devePiscar ? (
          <path d="M34 35H40" stroke="#00D4FF" strokeWidth="2.5" strokeLinecap="round" />
        ) : (
          <circle cx="39" cy="35" r="3" fill="#00D4FF" />
        )}
        <circle cx="21" cy="42" r="1" fill="#A855F7" opacity="0.6" />
        <circle cx="40" cy="42" r="1" fill="#00D4FF" opacity="0.6" />
        <path d="M28 41C28 42.5 29 43.5 30.5 43.5C32 43.5 33 42.5 33 41" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </div>
  );
}
