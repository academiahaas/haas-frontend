'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import DashboardDesktop from './DashboardDesktop';
import PortalMobile from './components/PortalMobile';

export default function PortalAluno() {
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined' && navigator) {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const tstMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      setIsMobileDevice(tstMobile);
    }
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-[#030914]" />;
  }

  if (isMobileDevice) {
    return (
      <PortalMobile 
        idioma="PT" 
        t={{}} 
      />
    );
  }

  return <DashboardDesktop />;
}
