'use client';

import React, { useEffect, useState } from 'react';
import ModalConclusao, { TipoConclusao } from '@/app/portal-aluno/components/ModalConclusao';
import { useAuth } from '@/contexts/AuthContext';
import { 
  checkPendingFlagsCentral, 
  clearPendingUnitCentral, 
  clearPendingModuleCentral, 
  clearPendingExamCentral 
} from '@/services/centralService';

const FALLBACK_USER_ID = "b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1";

export function ArenaWatcher() {
  console.log("🚀 [VIGIA CENTRAL] Componente ArenaWatcher montado no DOM.");

  const [modalAberto, setModalAberto] = useState(false);
  const [tipoModal, setTipoModal] = useState<TipoConclusao>("UNIDADE");
  const [unidadeNome, setUnidadeNome] = useState<string>("Unidade Concluída");
  const [moduloNome, setModuloNome] = useState<string>("Módulo Concluído");

  const { user } = useAuth();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const verificar = async () => {
      try {
        const targetUid = user?.id || FALLBACK_USER_ID;
        console.log(`[VIGIA CENTRAL] Checando flags via CentralService para ID: ${targetUid}`);

        if (modalAberto) return;

        const flags = await checkPendingFlagsCentral(targetUid);
        if (!flags) return;

        console.log(`[VIGIA CENTRAL] Flags -> unit: ${flags.pending_unit_code} | module: ${flags.pending_module_code} | exam: ${flags.pending_exam_code}`);

        if (flags.pending_unit_code) {
          setUnidadeNome(typeof flags.pending_unit_code === 'string' ? flags.pending_unit_code : "Unidade Concluída");
          setTipoModal("UNIDADE");
          setModalAberto(true);
          return;
        }

        if (flags.pending_module_code) {
          setModuloNome(typeof flags.pending_module_code === 'string' ? flags.pending_module_code : "Módulo Concluído");
          setTipoModal("MODULO");
          setModalAberto(true);
          return;
        }

        if (flags.pending_exam_code) {
          setTipoModal("NIVEL");
          setModalAberto(true);
          return;
        }

      } catch (err) {
        console.error("[VIGIA CENTRAL] Erro no ciclo de monitoramento:", err);
      }
    };

    verificar();
    interval = setInterval(verificar, 3000);

    return () => clearInterval(interval);
  }, [user, modalAberto]);

  const handleContinuar = async () => {
    const targetUid = user?.id || FALLBACK_USER_ID;

    if (tipoModal === "UNIDADE") {
      await clearPendingUnitCentral(targetUid);
    } else if (tipoModal === "MODULO") {
      await clearPendingModuleCentral(targetUid);
    } else if (tipoModal === "NIVEL") {
      await clearPendingExamCentral(targetUid);
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
