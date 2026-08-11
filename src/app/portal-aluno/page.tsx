'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import DashboardDesktop from './DashboardDesktop';
import PortalMobile from './components/PortalMobile';
import { fetchCentralPortalData } from '@/services/centralService';

export default function PortalAluno() {
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isFetchingRealTime, setIsFetchingRealTime] = useState(true);
  
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
          
          // Resgata a data de vencimento e plano retidos na raiz da resposta e acopla ao perfil
          userData.expiration_date = userData.expiration_date || res.expiration_date || res.user_subscriptions?.expiration_date || null;
          userData.next_expiration_es = userData.expiration_date;
          userData.plan_category = userData.plan_category || res.plan_category || res.user_subscriptions?.plan_category || null;
          userData.class_credits_available = userData.class_credits_available ?? res.class_credits_available ?? res.user_subscriptions?.class_credits_available ?? 0;
          
          setAlunoData(userData);
          setIsFetchingRealTime(false);
          if (typeof window !== 'undefined') {
            localStorage.setItem('haas_aluno_cache', JSON.stringify(userData));
          }
        }
      } catch (err) {
        console.error("Erro ao carregar dados do portal:", err);
        setIsFetchingRealTime(false);
      }
    }

    carregarDados();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!mounted || isFetchingRealTime) {
    return (
      <div className="min-h-screen bg-[#030914] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 text-[10px] font-mono uppercase tracking-widest animate-pulse">{(() => {
          const idiomaSalvo = typeof window !== "undefined" ? (localStorage.getItem("haas_idioma") || "").toUpperCase() : "";
          if (idiomaSalvo === "PT") return "Sincronizando acesso seguro...";
          if (idiomaSalvo === "EN") return "Synchronizing secure access...";
          return "Sincronizando acceso seguro...";
        })()}</p>
      </div>
    );
  }

  // PortalMobile desativado (Unificação Desktop-First)
  /* 
  if (isMobileDevice) {
    return <PortalMobile idioma="PT" t={{}} alunoData={alunoData} />;
  }
  */

  return <DashboardDesktop alunoData={alunoData} />;
}
