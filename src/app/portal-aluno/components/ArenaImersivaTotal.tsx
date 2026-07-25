"use client";

import React, { useState } from "react";
import ArenaHeaderMobile from "./ArenaHeaderMobile";
import ArenaFeedbackDrawerMobile from "./ArenaFeedbackDrawerMobile";

interface ArenaImersivaProps {
  onFechar: () => void;
  idiomaSelecionado?: string;
  statusRespostaMobile?: "IDLE" | "CORRECT" | "WRONG";
  setStatusRespostaMobile?: (status: "IDLE" | "CORRECT" | "WRONG") => void;
}

export default function ArenaImersivaTotal({
  onFechar,
  idiomaSelecionado = "PT",
  statusRespostaMobile = "IDLE",
  setStatusRespostaMobile
}: ArenaImersivaProps) {
  const [capaAtiva, setCapaAtiva] = useState(true);
  const [contador, setContador] = useState<number | string | null>(null);

  const iniciarContagem = () => {
    if (contador !== null) return;
    let tempo = 3;
    setContador(tempo);
    const intervalo = setInterval(() => {
      tempo -= 1;
      if (tempo > 0) {
        setContador(tempo);
      } else {
        setContador(idiomaSelecionado === "PT" ? "¡BORA!" : idiomaSelecionado === "ES" ? "¡VAMOS!" : "GO!");
        clearInterval(intervalo);
        setTimeout(() => {
          setCapaAtiva(false);
          setContador(null);
        }, 600);
      }
    }, 1000);
  };

  return (
    /* CONTAINER IMERSIVO TOTAL: Renders direto no topo sem herdar nada do pai */
    <div className="fixed inset-0 z-[999999] w-screen h-screen bg-[#030712] text-white flex flex-col justify-between overflow-hidden font-sans select-none">
      
      {/* 1. GAVETA / HEADER SUPERIOR DO JOGO */}
      <div className="w-full shrink-0 z-20">
        <ArenaHeaderMobile
          precisao={77}
          streak={1}
          unidadeAtual="1/5"
          nivelText="A1 • 77%"
          pts={3}
          creditosIA={499461}
          statusRobo={statusRespostaMobile === "CORRECT" ? "CORRETO" : statusRespostaMobile === "WRONG" ? "ERRADO" : "IDLE"}
          onOpenLeitura={() => console.log("Abrir leitura")}
          onOpenVideo={() => console.log("Abrir video")}
          onOpenChatIA={() => console.log("Abrir chat IA")}
        />
      </div>

      {/* 2. ÁREA CENTRAL DE IMERSÃO DOS JOGOS (MIGRAÇÃO DOS JOGOS) */}
      <main className="flex-1 flex flex-col justify-center items-center px-4 relative z-10 overflow-y-auto">
        {capaAtiva ? (
          /* CAPA DE CONTAGEM REGRESSIVA */
          <div 
            onClick={iniciarContagem}
            className="w-full h-full flex flex-col items-center justify-center text-center cursor-pointer"
          >
            {contador === null ? (
              <div className="flex flex-col items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-mono font-black tracking-widest text-white uppercase">
                  {idiomaSelecionado === "PT" ? "TREINO PRONTIFICADO" : idiomaSelecionado === "ES" ? "ENTRENAMIENTO LISTO" : "TRAINING READY"}
                </h1>
                <p className="text-sm font-sans font-medium text-slate-400">
                  {idiomaSelecionado === "PT" ? "Toque em qualquer lugar da tela para iniciar" : "Tap anywhere to start"}
                </p>
              </div>
            ) : (
              <div className="text-7xl md:text-9xl font-mono font-black text-amber-500 animate-pulse">
                {contador}
              </div>
            )}
          </div>
        ) : (
          /* MIOLO DO JOGO (ONDE OS EXERCÍCIOS FICAM) */
          <div className="w-full max-w-md flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
                EXERCÍCIO PRÁTICO
              </span>
              <button 
                onClick={onFechar}
                className="bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 border border-rose-500/30 rounded-lg px-2.5 py-1 text-[10px] font-bold cursor-pointer transition-all"
              >
                ✕ SAIR
              </button>
            </div>

            {/* Espaço reservado para carregar as questões A, B, C, D */}
            <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-5 text-center">
              <p className="text-slate-200 text-sm font-medium mb-4">
                Selecione a resposta correta para prosseguir no treino:
              </p>
              
              <div className="grid grid-cols-1 gap-2.5 text-left">
                <button 
                  onClick={() => setStatusRespostaMobile && setStatusRespostaMobile("CORRECT")}
                  className="p-3 bg-white/5 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-500/40 rounded-xl text-xs font-bold transition-all"
                >
                  A) Opção Correta (Teste de Sucesso)
                </button>
                <button 
                  onClick={() => setStatusRespostaMobile && setStatusRespostaMobile("WRONG")}
                  className="p-3 bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/40 rounded-xl text-xs font-bold transition-all"
                >
                  B) Opção Incorreta (Teste de Erro)
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 3. GAVETA INFERIOR DE FEEDBACK */}
      <div className="w-full shrink-0 z-20">
        <ArenaFeedbackDrawerMobile
          isOpen={statusRespostaMobile !== "IDLE" && statusRespostaMobile !== undefined}
          isCorreto={statusRespostaMobile === "CORRECT"}
          respostaCorreta="Exemplo de Resposta Correta"
          feedbackPedagogico="Excelente progresso nesta unidade!"
          onAvancar={() => setStatusRespostaMobile && setStatusRespostaMobile("IDLE")}
        />
      </div>

    </div>
  );
}
