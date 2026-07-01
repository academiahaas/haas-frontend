"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function MotorSubmissaoEVideo() {
  // Estados do Bloco de Vídeo Audiovisual
  const [videoConcluido, setVideoConcluido] = useState(false);
  const [assistindo, setAssistindo] = useState(false);

  // Estados do Bloco de Submissão da Arena
  const [opcaoSelecionada, setOpcaoSelecionada] = useState("");
  const [statusResposta, setStatusResposta] = useState<"correto" | "errado" | null>(null);

  // 1. GATILHO DO CONTEÚDO AUDIOVISUAL (Simulando o fim do vídeo de 15 minutos)
  function simularFimDoVideo() {
    setAssistindo(true);
    // Simulando que o player chegou ao fim (onEnded)
    setTimeout(() => {
      setVideoConcluido(true);
      setAssistindo(false);
      console.log("🎥 Player: Vídeo assistido por completo! Liberando acesso para a Arena.");
    }, 3000); // 3 segundos para teste rápido seu
  }

  // 2. GATILHO DO BOTÃO SUBMETER NA ARENA
  async function tratarSubmissao() {
    if (!opcaoSelecionada) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Cenário de teste: Vamos fingir que a Opção B é o erro por "Falso Cognato"
    const acertou = opcaoSelecionada === "A";
    setStatusResposta(acertou ? "correto" : "errado");

    try {
      // Envia o raio-x completo do erro/acerto para o Supabase
      await supabase.from("student_engagement_logs").insert({
        student_id: user.id,
        skill_type: "Vocabulário",
        is_correct: acertou,
        origin_source: "arena_app",
        specific_vocabulary: "Actual vs. Currently",
        specific_grammar: "False Cognates",
        student_selected_option: opcaoSelecionada,
        error_reason_tag: acertou ? null : "Confundiu Falso Cognato em reunião com CEO"
      });

      console.log("⚡ Submeter: Log detalhado enviado para o Supabase com sucesso!");
    } catch (err) {
      console.error("Erro ao salvar submissão:", err);
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 p-4">
      
      {/* SEÇÃO 1: BLOCO AUDIOVISUAL */}
      <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-5">
        <h4 className="text-xs font-mono tracking-widest text-slate-400 uppercase mb-3">// 1. Briefing Audiovisual</h4>
        <div className="bg-black/40 h-32 rounded-xl flex flex-col items-center justify-center border border-dashed border-white/5 p-4 text-center">
          {videoConcluido ? (
            <p className="text-xs text-emerald-400 font-mono">✓ Conteúdo concluído! Botão de progresso liberado.</p>
          ) : assistindo ? (
            <p className="text-xs text-amber-400 font-mono animate-pulse">🎥 Monitorando player... Assista até o final.</p>
          ) : (
            <button 
              onClick={simularFimDoVideo}
              className="text-xs font-mono bg-white/5 border border-white/10 hover:bg-white/10 px-4 py-2 rounded-lg text-slate-200 transition-all"
            >
              ▶ Simular Assistir Vídeo Completo
            </button>
          )}
        </div>
      </div>

      {/* SEÇÃO 2: SIMULADOR DE CLIQUE NO SUBMETER */}
      <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-5">
        <h4 className="text-xs font-mono tracking-widest text-slate-400 uppercase mb-4">// 2. Painel de Submissão da Arena</h4>
        
        <div className="space-y-2 mb-4">
          <label className="flex items-center gap-3 p-3 bg-black/20 border border-white/5 rounded-xl cursor-pointer hover:border-white/10">
            <input type="radio" name="quiz" value="A" onChange={(e) => setOpcaoSelecionada(e.target.value)} className="accent-amber-500" />
            <span className="text-xs text-slate-300 font-mono">Opção A (Alternativa Correta)</span>
          </label>
          <label className="flex items-center gap-3 p-3 bg-black/20 border border-white/5 rounded-xl cursor-pointer hover:border-white/10">
            <input type="radio" name="quiz" value="B" onChange={(e) => setOpcaoSelecionada(e.target.value)} className="accent-amber-500" />
            <span className="text-xs text-slate-300 font-mono">Opção B (Gatilho: Erro de Falso Cognato)</span>
          </label>
        </div>

        <button
          onClick={tratarSubmissao}
          disabled={!opcaoSelecionada}
          className={`w-full py-3 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
            !opcaoSelecionada 
              ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" 
              : "bg-amber-500 text-black hover:bg-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
          }`}
        >
          {statusResposta === "correto" ? "✓ Resposta Correta!" : statusResposta === "errado" ? "⚠️ Resposta Incorreta!" : "Submeter Resposta"}
        </button>
      </div>

    </div>
  );
}
