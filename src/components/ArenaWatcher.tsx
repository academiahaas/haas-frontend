'use client';

import React, { useEffect, useState } from 'react';
import ModalConclusao, { TipoConclusao, IdiomaPlataforma, NivelCurso } from '@/app/portal-aluno/components/ModalConclusao';
import { useAuth } from '@/contexts/AuthContext';
import { 
  checkPendingFlagsCentral, 
  clearPendingUnitCentral, 
  clearPendingModuleCentral, 
  clearPendingExamCentral 
} from '@/services/centralService';

const FALLBACK_USER_ID = (typeof window !== "undefined" ? (localStorage.getItem("haas_user_id") || undefined) : undefined);

export function ArenaWatcher() {
  console.log("🚀 [VIGIA CENTRAL] Componente ArenaWatcher montado no DOM.");

  const [modalAberto, setModalAberto] = useState(false);
  const [tipoModal, setTipoModal] = useState<TipoConclusao>("UNIDADE");
  const [unidadeNome, setUnidadeNome] = useState<string>("");
  const [moduloNome, setModuloNome] = useState<string>("");
  const [nivelCodigo, setNivelCodigo] = useState<NivelCurso>("A1");
  const [idiomaUi, setIdiomaUi] = useState<IdiomaPlataforma>("PT");

  const { user } = useAuth();

  // Captura o idioma selecionado no Dashboard do Aluno via localStorage
  const obterIdiomaDashboard = (): IdiomaPlataforma => {
    if (typeof window !== 'undefined') {
      const salvo = localStorage.getItem('haas_idioma');
      if (salvo && ['PT', 'EN', 'ES'].includes(salvo.toUpperCase())) {
        return salvo.toUpperCase() as IdiomaPlataforma;
      }
    }
    return 'PT';
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const verificar = async () => {
      try {
        const targetUid = user?.id || FALLBACK_USER_ID;
        console.log(`[VIGIA CENTRAL] Checando flags via CentralService para ID: ${targetUid}`);

        if (modalAberto) return;

        // Atualiza idioma da UI do Dashboard a cada ciclo
        const langAtual = obterIdiomaDashboard();
        setIdiomaUi(langAtual);

        const flags = await checkPendingFlagsCentral(targetUid);
        if (!flags) return;

        console.log(`[VIGIA CENTRAL] Flags -> unit: ${flags.pending_unit_code} | module: ${flags.pending_module_code} | exam: ${flags.pending_exam_code}`);

        if (flags.pending_unit_code) {
          setUnidadeNome(typeof flags.pending_unit_code === 'string' ? flags.pending_unit_code : "");
          setModuloNome("");
          setTipoModal("UNIDADE");
          setModalAberto(true);
          return;
        }

        if (flags.pending_module_code) {
          setModuloNome(typeof flags.pending_module_code === 'string' ? flags.pending_module_code : "");
          setUnidadeNome("");
          setTipoModal("MODULO");
          setModalAberto(true);
          return;
        }

        if (flags.pending_exam_code) {
          const rawExam = typeof flags.pending_exam_code === 'string' ? flags.pending_exam_code.toUpperCase() : "A1";
          const valids: NivelCurso[] = ["A1", "A2", "B1", "B2", "C1"];
          const matched = valids.find(v => rawExam.includes(v)) || (rawExam as NivelCurso);
          setNivelCodigo(matched as NivelCurso);
          setUnidadeNome("");
          setModuloNome("");
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
      nivel={nivelCodigo}
      lang={idiomaUi}
      unidadeNome={unidadeNome || undefined}
      moduloNome={moduloNome || undefined}
      onContinuar={handleContinuar}
      onClose={handleContinuar}
    />
  );
}
