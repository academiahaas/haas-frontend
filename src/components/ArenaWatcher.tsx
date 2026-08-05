'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import ModalConclusao, { TipoConclusao } from '@/app/portal-aluno/components/ModalConclusao';
import { useAuth } from '@/contexts/AuthContext';

const FALLBACK_USER_ID = "b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1";

export function ArenaWatcher() {
  const [modalAberto, setModalAberto] = useState(false);
  const [tipoModal, setTipoModal] = useState<TipoConclusao>("UNIDADE");
  const [unidadeNome, setUnidadeNome] = useState<string>("Unidade Tática");
  const [moduloNome, setModuloNome] = useState<string>("Módulo Tático");

  const { user } = useAuth();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const verificarBanco = async () => {
      try {
        const targetUid = user?.id || FALLBACK_USER_ID;

        // Se o modal já estiver aberto na tela, aguarda o clique de confirmação
        if (modalAberto) return;

        const { data, error } = await supabase
          .from('users')
          .select('pending_unit_code, pending_module_code, pending_exam_code')
          .eq('id', targetUid)
          .maybeSingle();

        if (error) {
          console.error("[VIGIA GLOBAL] Erro Supabase:", error.message);
          return;
        }

        console.log(`[VIGIA GLOBAL] Status -> unit: ${data?.pending_unit_code} | module: ${data?.pending_module_code} | exam: ${data?.pending_exam_code}`);

        // Prioridade 1: Unidade
        if (data?.pending_unit_code) {
          console.log("[VIGIA GLOBAL] 🚨 Disparando ModalConclusao: UNIDADE");
          setUnidadeNome(typeof data.pending_unit_code === 'string' ? data.pending_unit_code : "Unidade Concluída");
          setTipoModal("UNIDADE");
          setModalAberto(true);
          return;
        }

        // Prioridade 2: Módulo
        if (data?.pending_module_code) {
          console.log("[VIGIA GLOBAL] 🏆 Disparando ModalConclusao: MODULO");
          setModuloNome(typeof data.pending_module_code === 'string' ? data.pending_module_code : "Módulo Concluído");
          setTipoModal("MODULO");
          setModalAberto(true);
          return;
        }

        // Prioridade 3: Exame / Nível
        if (data?.pending_exam_code) {
          console.log("[VIGIA GLOBAL] 🎖️ Disparando ModalConclusao: NIVEL");
          setTipoModal("NIVEL");
          setModalAberto(true);
          return;
        }

      } catch (err) {
        console.error("[VIGIA GLOBAL] Erro na verificação:", err);
      }
    };

    verificarBanco();
    interval = setInterval(verificarBanco, 3000);

    return () => clearInterval(interval);
  }, [user, modalAberto]);

  // Ação ao clicar em continuar no modal
  const handleContinuar = async () => {
    const targetUid = user?.id || FALLBACK_USER_ID;

    if (tipoModal === "UNIDADE") {
      console.log("[VIGIA GLOBAL] Limpando pending_unit_code no banco...");
      await supabase
        .from('users')
        .update({ pending_unit_code: null })
        .eq('id', targetUid);
    } else if (tipoModal === "MODULO") {
      console.log("[VIGIA GLOBAL] Limpando pending_module_code no banco...");
      await supabase
        .from('users')
        .update({ pending_module_code: null })
        .eq('id', targetUid);
    } else if (tipoModal === "NIVEL") {
      console.log("[VIGIA GLOBAL] Limpando pending_exam_code no banco...");
      await supabase
        .from('users')
        .update({ pending_exam_code: null })
        .eq('id', targetUid);
    }

    setModalAberto(false);
  };

  return (
    <ModalConclusao
      isOpen={modalAberto}
      tipo={tipoModal}
      nivel="A1"
      lang="PT"
      unidadeNome={unidadeNome}
      moduloNome={moduloNome}
      onContinuar={handleContinuar}
      onClose={handleContinuar}
    />
  );
}
