'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import DashboardDesktop from './DashboardDesktop';
import PortalMobile from './components/PortalMobile';
import { fetchCentralPortalData } from '@/services/centralService';

export default function PortalAluno() {
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [alunoData, setAlunoData] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    setMounted(true);

    if (typeof window !== 'undefined' && navigator) {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const tstMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      setIsMobileDevice(tstMobile);
    }

    async function carregarDados() {
      try {
        const res = await fetchCentralPortalData("b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1");
        if (isMounted && res && res.user) {
          setAlunoData(res.user);
        }
      } catch (err) {
        console.error("Erro ao carregar dados do portal:", err);
      }
    }

    carregarDados();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-[#030914]" />;
  }

  if (isMobileDevice) {
    return (
      <PortalMobile 
        idioma="PT" 
        t={{}} 
        alunoData={alunoData}
      />
    );
  }

  return <DashboardDesktop />;
}
