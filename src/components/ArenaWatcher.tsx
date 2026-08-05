'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { UnitCompletionScreen } from './UnitCompletionScreen';
import { ModuleCompletionScreen } from './ModuleCompletionScreen';
import { useAuth } from '@/contexts/AuthContext';

const FALLBACK_USER_ID = "b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1";

export function ArenaWatcher() {
  const [mostrarUnit, setMostrarUnit] = useState(false);
  const [mostrarModule, setMostrarModule] = useState(false);
  
  // Valores padrão/estáticos para os indicadores visuais do modal de módulo
  const [moedasGanhas, setMoedasGanhas] = useState(50);
  const [precisaoFinal, setPrecisaoFinal] = useState(100);

  const { user } = useAuth();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const verificarBanco = async () => {
      try {
        const targetUid = user?.id || FALLBACK_USER_ID;

        // Se algum modal já estiver aberto, aguarda o usuário fechar antes de reconsultar
        if (mostrarUnit || mostrarModule) return;

        const { data, error } = await supabase
          .from('users')
          .select('pending_unit_code, pending_module_code')
          .eq('id', targetUid)
          .maybeSingle();

        if (error) {
          console.error("[VIGIA GLOBAL] Erro Supabase:", error.message);
          return;
        }

        console.log(`[VIGIA GLOBAL] Status -> pending_unit: ${data?.pending_unit_code} | pending_module: ${data?.pending_module_code}`);

        // Prioridade 1: Unidade
        if (data?.pending_unit_code) {
          console.log("[VIGIA GLOBAL] 🚨 Disparando modal de UNIDADE!");
          setMostrarUnit(true);
          return;
        }

        // Prioridade 2: Módulo (só entra se não houver unidade pendente)
        if (data?.pending_module_code) {
          console.log("[VIGIA GLOBAL] 🏆 Disparando modal de MÓDULO!");
          setMostrarModule(true);
          return;
        }

      } catch (err) {
        console.error("[VIGIA GLOBAL] Erro na verificação:", err);
      }
    };

    verificarBanco();
    interval = setInterval(verificarBanco, 3000);

    return () => clearInterval(interval);
  }, [user, mostrarUnit, mostrarModule]);

  // Limpeza da Unidade
  const fecharUnitELimpar = async () => {
    const targetUid = user?.id || FALLBACK_USER_ID;
    console.log("[VIGIA GLOBAL] Fechando modal de Unidade e limpando banco para ID:", targetUid);

    await supabase
      .from('users')
      .update({ pending_unit_code: null })
      .eq('id', targetUid);

    setMostrarUnit(false);
  };

  // Limpeza do Módulo
  const fecharModuleELimpar = async () => {
    const targetUid = user?.id || FALLBACK_USER_ID;
    console.log("[VIGIA GLOBAL] Fechando modal de Módulo e limpando banco para ID:", targetUid);

    await supabase
      .from('users')
      .update({ pending_module_code: null })
      .eq('id', targetUid);

    setMostrarModule(false);
  };

  return (
    <>
      <UnitCompletionScreen 
        mostrar={mostrarUnit}
        onAvancarUnidade={fecharUnitELimpar} 
      />

      <ModuleCompletionScreen
        mostrar={mostrarModule}
        moedasGanhas={moedasGanhas}
        precisaoFinal={precisaoFinal}
        onAvancar={fecharModuleELimpar}
      />
    </>
  );
}
