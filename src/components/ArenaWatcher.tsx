'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { UnitCompletionScreen } from './UnitCompletionScreen';
import { useAuth } from '@/contexts/AuthContext';

const FALLBACK_USER_ID = "b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1";

export function ArenaWatcher() {
  const [mostrarTela, setMostrarTela] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const verificarBanco = async () => {
      try {
        // Resolve o ID usando o AuthContext ou o mesmo fallback fixo da Central
        const targetUid = user?.id || FALLBACK_USER_ID;

        console.log(`[VIGIA GLOBAL] Checando pending_unit_code para o aluno: ${targetUid}`);

        const { data, error } = await supabase
          .from('users')
          .select('pending_unit_code')
          .eq('id', targetUid)
          .maybeSingle();

        if (error) {
          console.error("[VIGIA GLOBAL] Erro Supabase:", error.message);
          return;
        }

        console.log(`[VIGIA GLOBAL] Status no banco -> pending_unit_code:`, data?.pending_unit_code);

        if (data?.pending_unit_code && !mostrarTela) {
          console.log("[VIGIA GLOBAL] 🚨 Disparando modal de conclusão!");
          setMostrarTela(true);
        }
      } catch (err) {
        console.error("[VIGIA GLOBAL] Erro na verificação:", err);
      }
    };

    verificarBanco();
    interval = setInterval(verificarBanco, 3000);

    return () => clearInterval(interval);
  }, [user, mostrarTela]);

  const fecharELimparBanco = async () => {
    const targetUid = user?.id || FALLBACK_USER_ID;
    console.log("[VIGIA GLOBAL] Fechando modal e limpando banco para ID:", targetUid);

    await supabase
      .from('users')
      .update({ pending_unit_code: null })
      .eq('id', targetUid);

    setMostrarTela(false);
  };

  if (!mostrarTela) return null;

  return (
    <UnitCompletionScreen 
      mostrar={mostrarTela}
      onAvancarUnidade={fecharELimparBanco} 
    />
  );
}
