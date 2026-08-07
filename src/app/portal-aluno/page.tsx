'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import DashboardDesktop from './DashboardDesktop';
import PortalMobile from './components/PortalMobile';
import { fetchCentralPortalData } from '@/services/centralService';

export default function PortalAluno() {
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Cache Imediato via localStorage (Stale-While-Revalidate)
  const [alunoData, setAlunoData] = useState<any>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('haas_aluno_cache');
        return cached ? JSON.parse(cached) : null;
      } catch (e) {
        return null;
      }
    }
    return null;
  });

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
        const uid = (typeof window !== 'undefined' && (localStorage.getItem('haas_user_id') || localStorage.getItem('haas_uid') || localStorage.getItem('supabase_uid'))) || undefined;
        const res = await fetchCentralPortalData(uid);
        if (isMounted && res) {
          const userData = res.user || res.profile || res;
          setAlunoData(userData);
          if (typeof window !== 'undefined') {
            localStorage.setItem('haas_aluno_cache', JSON.stringify(userData));
          }
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

  // PortalMobile desativado (Unificação Desktop-First)
  /* 
  if (isMobileDevice) {
    return <PortalMobile idioma="PT" t={{}} alunoData={alunoData} />;
  }
  */

  return <DashboardDesktop alunoData={alunoData} />;
}
