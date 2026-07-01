/* =========================================================================
  MÓDULO DE SINTAXE TEXTUAL / REORDENAÇÃO - HAAS EDUCACIONAL
  MECÂNICA: REORDENAÇÃO DE PARÁGRAFOS (PARAGRAPH ORDERING) - NÍVEL B2
  
  ⚠️ TRAVA DE SEGURANÇA PÓS-SUBMISSÃO:
  APÓS O ENVIO DA RESPOSTA, OS CONTROLES SÃO CONGELADOS, O BOTÃO DE RESET 
  É ELIMINADO E APENAS A OPÇÃO "CONTINUAR" FICA DISPONÍVEL JUNTO AO FEEDBACK.
  =========================================================================
*/

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Cpu, PartyPopper, Sparkles, ChevronUp, ChevronDown } from 'lucide-react';
import confetti from 'canvas-confetti';
import '../globals.css';

const PARAGRAFOS_ORIGINAIS = [
  { id: '1', texto: 'First, the board analyzed recent corporate research regarding 21st-century inter-institutional frameworks.', ordemCorreta: 0 },
  { id: '2', texto: 'Consequently, they suggested implementing a new strategy to minimize operational friction during deployment.', ordemCorreta: 1 },
  { id: '3', texto: 'Ultimately, this modern adjustment completely restructured active student engagement metrics over long-term cycles.', ordemCorreta: 2 }
];

export default function LessonParagraphsPage() {
  const router = useRouter();
  
  const [paragrafos, setParagrafos] = useState([
    PARAGRAFOS_ORIGINAIS[1], 
    PARAGRAFOS_ORIGINAIS[2], 
    PARAGRAFOS_ORIGINAIS[0]  
  ]);
  
  const [statusResposta, setStatusStatus] = useState<'idle' | 'correto' | 'errado'>('idle');

  const gerenciarMovimento = (indexAtual: number, novoIndex: number) => {
    if (statusResposta !== 'idle') return;

    const novosBlocos = [...paragrafos];
    const temp = novosBlocos[indexAtual];
    novosBlocos[indexAtual] = novosBlocos[novoIndex];
    novosBlocos[novoIndex] = temp;
    setParagrafos(novosBlocos);
  };

  const handleValidarOrdem = (e: React.FormEvent) => {
    e.preventDefault();
    if (statusResposta !== 'idle') return;

    const acertouTudo = paragrafos.every((p, idx) => p.ordemCorreta === idx);

    if (acertouTudo) {
      setStatusStatus('correto');
      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#00FF66', '#FFD700', '#FFFFFF']
      });
    } else {
      setStatusStatus('errado');
    }
  };

  const handleAvançar = () => {
    router.push('/lesson');
  };

  const jaRespondeu = statusResposta !== 'idle';

  return (
    <div className="fixed inset-0 w-screen h-screen bg-[#050b11] text-[#E8EDF2] flex flex-col font-sans antialiased overflow-hidden z-[9999]">
      
      <div className="absolute inset-0 bg-[radial-gradient(#101f30_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none z-0" />

      {/* PAINEL DE LEITURA COMPLETO EM LARGURA MÁXIMA */}
      <div className="w-full max-w-4xl mx-auto flex flex-col justify-between p-6 pb-8 z-10 mt-24 mb-4 bg-[#09131f] border-2 border-slate-800 rounded-[36px] shadow-[0_40px_100px_rgba(0,0,0,0.95)] max-h-[92vh]">
        
        {/* HUD de Competência */}
        <div className="flex justify-between items-center w-full bg-[#04090f] border border-slate-800/60 p-3.5 rounded-2xl shadow-md flex-shrink-0">
          <div className="flex items-center gap-2">
            <Cpu size={14} className="text-slate-500 opacity-60" />
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">HUD LINHA DO TEMPO TEXTUAL</span>
          </div>
          <span className="text-[12px] font-black text-[#00E5FF] uppercase tracking-widest font-sans bg-cyan-950/40 px-3 py-0.5 rounded-md border border-cyan-500/10">B2 READING</span>
        </div>

        {/* ÁREA CENTRAL: Lista Vertical de Parágrafos */}
        <div className="w-full flex flex-col gap-3 my-auto overflow-y-auto max-h-[50vh] pr-1.5 scrollbar-thin select-none">
          
          {statusResposta === 'idle' && (
            <p className="text-[13px] font-extrabold text-slate-100 mb-1 leading-tight text-center">
              Utilize os seletores laterais para organizar os parágrafos do relatório na ordem cronológica correta:
            </p>
          )}

          {paragrafos.map((p, index) => {
            let borderStyle = "border-slate-800 bg-[#04090f] text-slate-300";
            let setaCimaStyle = "text-cyan-400 border-slate-700 hover:border-cyan-500 hover:bg-[#0c1622]";
            let setaBaixoStyle = "text-cyan-400 border-slate-700 hover:border-cyan-500 hover:bg-[#0c1622]";
            
            if (statusResposta === 'correto') {
              borderStyle = "border-[#00FF66] bg-[#00FF66]/5 text-white shadow-[0_0_15px_rgba(0,255,102,0.1)]";
              setaCimaStyle = "text-slate-700 border-transparent opacity-10 cursor-not-allowed";
              setaBaixoStyle = "text-slate-700 border-transparent opacity-10 cursor-not-allowed";
            } else if (statusResposta === 'errado') {
              borderStyle = "border-[#D85A74] bg-[#D85A74]/5 text-slate-200 shadow-[0_0_15px_rgba(216,90,116,0.1)]";
              setaCimaStyle = "text-slate-700 border-transparent opacity-10 cursor-not-allowed";
              setaBaixoStyle = "text-slate-700 border-transparent opacity-10 cursor-not-allowed";
            }

            return (
              <div 
                key={p.id}
                className={`w-full p-4 rounded-xl border-2 flex items-center justify-between gap-4 transition-all duration-300 ${borderStyle}`}
              >
                <p className="text-xs font-bold leading-relaxed tracking-wide text-justify flex-1">
                  {p.texto}
                </p>

                {/* Controladores Laterais Fixos */}
                <div className="flex flex-col gap-1 flex-shrink-0">
                  <button
                    type="button"
                    disabled={jaRespondeu || index === 0}
                    onClick={() => gerenciarMovimento(index, index - 1)}
                    className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${
                      index === 0 || jaRespondeu
                        ? 'bg-slate-900/30 border-transparent text-slate-700 opacity-10 cursor-not-allowed'
                        : `bg-[#09131f] ${setaCimaStyle} active:scale-95`
                    }`}
                  >
                    <ChevronUp size={16} strokeWidth={3} />
                  </button>
                  <button
                    type="button"
                    disabled={jaRespondeu || index === paragrafos.length - 1}
                    onClick={() => gerenciarMovimento(index, index + 1)}
                    className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${
                      index === paragrafos.length - 1 || jaRespondeu
                        ? 'bg-slate-900/30 border-transparent text-slate-700 opacity-10 cursor-not-allowed'
                        : `bg-[#09131f] ${setaBaixoStyle} active:scale-95`
                    }`}
                  >
                    <ChevronDown size={16} strokeWidth={3} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* BASE COGNITIVA: ORIENTAÇÃO PEDAGÓGICA + BOTÃO UNIFICADO */}
        <div className="w-full flex flex-col gap-4 flex-shrink-0">
          
          <div className="w-full flex items-center gap-3.5 bg-[#04090f] border border-slate-800/80 p-3.5 rounded-2xl shadow-md">
            <div className="p-2 rounded-xl bg-cyan-950/40 border border-cyan-500/10 text-[#00E5FF] flex-shrink-0">
              <Sparkles size={18} />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-widest">► INSTRUÇÃO E REVISÃO PEDAGÓGICA</span>
              <p className="text-[11px] font-semibold text-slate-400 leading-tight">
                {statusResposta === 'idle' && 'Preste atenção nos conectores de sequência cronológica implícitos na oração (First, Consequently, Ultimately).'}
                {statusResposta === 'correto' && 'Ordenação cronológica perfeita! A sequência lógica dos conectores mapeia perfeitamente as fases de implementação da estratégia.'}
                {statusResposta === 'errado' && 'A linha do tempo quebrou. Veja a lógica: "First" obrigatoriamente introduz o tema. "Consequently" apresenta o desdobramento direto e "Ultimately" conclui avaliando os impactos de longo prazo.'}
              </p>
            </div>
          </div>

          {/* Painel Inferior Corrigido com Layout de Marca e Cores Evolutivas */}
          <div className="w-full flex items-center gap-3">
            <div className={`w-[35%] bg-[#04090f] border h-12 rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all duration-300 font-mono font-bold text-[9px] ${
              statusResposta === 'correto' 
                ? 'border-emerald-500/30 text-[#00FF66]' 
                : statusResposta === 'errado'
                ? 'border-cyan-500/30 bg-cyan-950/20 text-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.08)]' // ◄ Visual otimizado no erro!
                : 'border-slate-800 text-slate-400'
            }`}>
              {statusResposta === 'correto' ? (
                <>
                  <PartyPopper size={14} className="animate-bounce" />
                  <span>+10p UN</span>
                </>
              ) : statusResposta === 'errado' ? (
                // 💡 CORREÇÃO CRÍTICA: Cor mudada para Ciano Neon Motivacional (Coisas boas/foco ativo)
                <span className="text-[#00E5FF] font-black tracking-widest uppercase text-[8px]">REVISÃO ATIVA</span>
              ) : (
                // 💡 CORREÇÃO CRÍTICA: Engrenagem removida e espaçamento limpo
                <div className="flex items-center justify-center text-[9px] font-black tracking-widest text-slate-300">
                  <span>HAAS ACADEMY</span>
                </div>
              )}
            </div>
            
            {statusResposta === 'idle' ? (
              <button 
                onClick={handleValidarOrdem}
                className="py-3.5 rounded-xl font-black text-xs tracking-[0.2em] uppercase flex items-center justify-center gap-2 transition-all duration-300 w-full bg-gradient-to-b from-cyan-500 to-cyan-600 text-black shadow-[0_6px_25px_rgba(0,229,255,0.35)] scale-[1.01] cursor-pointer hover:brightness-110"
              >
                SUBMETER ORDEM <ArrowRight size={14} strokeWidth={3} />
              </button>
            ) : (
              <button 
                onClick={handleAvançar}
                className="py-3.5 rounded-xl font-black text-xs tracking-[0.2em] uppercase flex items-center justify-center gap-2 transition-all duration-300 w-full bg-gradient-to-b from-[#F8891D] to-[#E67212] text-white shadow-[0_6px_25px_rgba(248,137,29,0.5)] scale-[1.01] cursor-pointer hover:brightness-110 active:scale-95"
              >
                CONTINUAR <ArrowRight size={14} strokeWidth={3} />
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}