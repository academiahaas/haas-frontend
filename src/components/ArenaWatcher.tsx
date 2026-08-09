'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import ModalConclusao, { TipoConclusao, IdiomaPlataforma, NivelCurso } from '@/app/portal-aluno/components/ModalConclusao';
// useAuth removido: este projeto nao usa supabase.auth de fato, o login grava o ID no localStorage
import { 
  checkPendingFlagsCentral, 
  clearPendingUnitCentral, 
  clearPendingModuleCentral, 
  clearPendingExamCentral 
} from '@/services/centralService';

export function ArenaWatcher() {
  const pathname = usePathname();
  const [user, setUser] = useState<{ id: string } | null>(null);

  useEffect(() => {
    const uid = typeof window !== "undefined" ? localStorage.getItem("haas_user_id") : null;
    setUser(uid ? { id: uid } : null);
  }, []);

  const [modalAberto, setModalAberto] = useState(false);
  const [tipoModal, setTipoModal] = useState<TipoConclusao>("UNIDADE");
  const [unidadeNome, setUnidadeNome] = useState<string>("");
  const [moduloNome, setModuloNome] = useState<string>("");
  const [nivelCodigo, setNivelCodigo] = useState<NivelCurso>("A1");
  const [idiomaUi, setIdiomaUi] = useState<IdiomaPlataforma>("PT");

  // BLINDAGEM DE ROTA: Executa EXCLUSIVAMENTE dentro das rotas internas do aluno logado
  const isAreaLogadaAluno = Boolean(
    pathname && (
      pathname.startsWith("/portal-aluno") || 
      pathname.startsWith("/lesson") || 
      pathname.startsWith("/dashboard")
    )
  );

  const obterIdiomaDashboard = (): IdiomaPlataforma => {
    if (typeof window !== "undefined") {
      const salvo = localStorage.getItem("haas_idioma");
      if (salvo && ["PT", "EN", "ES"].includes(salvo.toUpperCase())) {
        return salvo.toUpperCase() as IdiomaPlataforma;
      }
    }
    return "PT";
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const verificar = async () => {
      try {
        // Se estiver na página de vendas, no diagnóstico ou deslogado, aborta e fecha qualquer modal
        if (!isAreaLogadaAluno || !user?.id) {
          setModalAberto(false);
          return;
        }

        if (modalAberto) return;

        const langAtual = obterIdiomaDashboard();
        setIdiomaUi(langAtual);

        const flags = await checkPendingFlagsCentral(user.id);
        if (!flags) return;

        if (flags.pending_unit_code) {
          setUnidadeNome(typeof flags.pending_unit_code === "string" ? flags.pending_unit_code : "");
          setModuloNome("");
          setTipoModal("UNIDADE");
          setModalAberto(true);
          return;
        }

        if (flags.pending_module_code) {
          setModuloNome(typeof flags.pending_module_code === "string" ? flags.pending_module_code : "");
          setUnidadeNome("");
          setTipoModal("MODULO");
          setModalAberto(true);
          return;
        }

        if (flags.pending_exam_code) {
          const rawExam = typeof flags.pending_exam_code === "string" ? flags.pending_exam_code.toUpperCase() : "A1";
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

    if (isAreaLogadaAluno && user?.id) {
      verificar();
      interval = setInterval(verificar, 3000);
    } else {
      setModalAberto(false);
    }

    return () => clearInterval(interval);
  }, [user, modalAberto, pathname, isAreaLogadaAluno]);

  const handleContinuar = async () => {
    if (!user?.id) return;

    if (tipoModal === "UNIDADE") {
      await clearPendingUnitCentral(user.id);
    } else if (tipoModal === "MODULO") {
      await clearPendingModuleCentral(user.id);
    } else if (tipoModal === "NIVEL") {
      await clearPendingExamCentral(user.id);
    }

    setModalAberto(false);
  };

  // Se não estiver dentro da área logada do aluno, não renderiza absolutamente nada no DOM
  if (!isAreaLogadaAluno || !user?.id || !modalAberto) {
    return null;
  }

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
