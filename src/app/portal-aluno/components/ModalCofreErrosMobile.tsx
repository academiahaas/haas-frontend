"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface UserErrorLog {
  id: string;
  user_id: string;
  conteudo: string;
  frequencia?: number;
  created_at?: string;
}

interface ModalCofreErrosMobileProps {
  isOpen: boolean;
  onClose: () => void;
  idiomaSelecionado: "PT" | "EN" | "ES";
  userId?: any;
  alunoDataRaw?: any;
}

export const ModalCofreErrosMobile: React.FC<ModalCofreErrosMobileProps> = ({
  isOpen,
  onClose,
  idiomaSelecionado,
  userId,
  alunoDataRaw,
}) => {
  const [erros, setErros] = useState<UserErrorLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchErros = async () => {
      setLoading(true);
      try {
        console.log("🔍 [CofreErros] Prop userId recebida:", userId);
        console.log("🔍 [CofreErros] Prop alunoDataRaw recebida:", alunoDataRaw);

        // 1. Tentar extrair ID de todas as variações possíveis
        let activeUserId = null;

        if (typeof userId === "string" && userId.trim() !== "") {
          activeUserId = userId;
        } else if (typeof userId === "object" && userId !== null) {
          activeUserId = userId.id || userId.user_id || userId.uid || userId.id_aluno || userId.usuario_id;
        }

        if (!activeUserId && alunoDataRaw) {
          activeUserId = alunoDataRaw.id || alunoDataRaw.user_id || alunoDataRaw.uid || alunoDataRaw.id_aluno;
        }

        // 2. Tentar via Supabase Auth
        if (!activeUserId) {
          const { data: authData } = await supabase.auth.getUser();
          activeUserId = authData?.user?.id;
        }

        if (!activeUserId) {
          const { data: sessionData } = await supabase.auth.getSession();
          activeUserId = sessionData?.session?.user?.id;
        }

        console.log("🎯 [CofreErros] ID do usuário resolvido:", activeUserId);

        let query = supabase.from("user_error_logs").select("*");

        if (activeUserId) {
          query = query.eq("user_id", activeUserId);
        } else {
          console.warn("⚠️ Nenhum user_id específico encontrado. Carregando registros gerais como fallback.");
        }

        const { data, error } = await query.order("frequencia", { ascending: false }).limit(20);

        if (error) {
          console.error("❌ Erro ao buscar user_error_logs no Supabase:", error);
        } else {
          console.log("✅ [CofreErros] Registros retornados do banco:", data);
          setErros(data || []);
        }
      } catch (err) {
        console.error("💥 Exceção no Cofre de Erros:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchErros();
  }, [isOpen, userId, alunoDataRaw]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[130] flex flex-col justify-end">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="w-full bg-[#070d19] border-t border-white/[0.08] rounded-t-2xl max-h-[80vh] min-h-[50vh] flex flex-col relative z-10 animate-slide-up">
        {/* CABEÇALHO DA GAVETA */}
        <div className="p-4 border-b border-white/[0.04] flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <h3 className="font-mono font-black uppercase text-sm md:text-lg tracking-wider text-slate-200">
              {idiomaSelecionado === "PT"
                ? "Cofre de Erros Críticos"
                : idiomaSelecionado === "ES"
                ? "Cofre de Errores Críticos"
                : "Critical Error Vault"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="py-1 px-3 md:py-2 md:px-5 bg-slate-900 text-slate-400 border border-white/[0.03] rounded-lg font-mono font-black text-[10px] md:text-sm uppercase tracking-wider active:scale-[0.97]"
          >
            {idiomaSelecionado === "PT"
              ? "Fechar"
              : idiomaSelecionado === "ES"
              ? "Cerrar"
              : "Close"}
          </button>
        </div>

        {/* LISTA DINÂMICA DE ERROS */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 scrollbar-none pb-8 text-left">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-amber-400 font-mono text-xs">
              <span className="animate-pulse">
                {idiomaSelecionado === "PT"
                  ? "CARREGANDO COFRE..."
                  : idiomaSelecionado === "ES"
                  ? "CARGANDO COFRE..."
                  : "LOADING VAULT..."}
              </span>
            </div>
          ) : erros.length === 0 ? (
            <div className="text-center py-12 text-slate-500 font-mono text-xs">
              {idiomaSelecionado === "PT"
                ? "Nenhum erro crítico registrado até o momento."
                : idiomaSelecionado === "ES"
                ? "No hay errores críticos registrados hasta el momento."
                : "No critical errors recorded so far."}
            </div>
          ) : (
            erros.map((item, index) => {
              const formattedNum = String(index + 1).padStart(2, "0");
              return (
                <div
                  key={item.id || index}
                  className="bg-slate-900/40 border border-amber-500/10 hover:border-amber-500/30 rounded-xl p-3 flex justify-between items-center transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-amber-500 text-xs md:text-sm">
                      #{formattedNum}
                    </span>
                    <span className="text-slate-200 font-mono font-bold text-xs md:text-base">
                      {item.conteudo}
                    </span>
                  </div>
                  <button className="text-[10px] md:text-xs font-mono font-black uppercase text-amber-400 border border-amber-500/20 px-3 md:px-4 py-1 md:py-1.5 rounded bg-amber-500/5 hover:bg-amber-500/10 transition-all shrink-0">
                    {idiomaSelecionado === "PT"
                      ? "REVISAR"
                      : idiomaSelecionado === "ES"
                      ? "REVISAR"
                      : "REVIEW"}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
