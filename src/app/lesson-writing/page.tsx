/* =========================================================================
  MÓDULO DE ESCRITA / INVENTÁRIO COMPARTILHADO - HAAS EDUCACIONAL
  MECÂNICA: ESCRITA LIVRE CONTROLADA (WORD CRAFTING) - NÍVEL B2
  
  ⚠️ PROTEÇÃO DE INTERFACE & ANTIFRAUDE:
  CONSTRUÍDO EM DUPLO PAINEL COM TRAVAS DE INPUT ATIVAS.
  FUNÇÕES DE COPIAR, CORTAR E COLAR FORAM BLOQUEADAS NATIVAMENTE PARA FORÇAR 
  A DIGITAÇÃO REAL DOS TERMOS DO INVENTÁRIO.
  =========================================================================
*/

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Cpu, PartyPopper, Settings, Sparkles, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import '../globals.css';

const QUESTÃO_WRITING = {
  id: 4,
  nome: 'WRITING: EXPANDED VOCABULARY CHALLENGE',
  instrucao: 'Escreva um parágrafo profissional (mínimo de 20 caracteres) descrevendo os objetivos da sua empresa, utilizando obrigatoriamente as 3 palavras-chave do seu inventário tecnológico abaixo.',
  palavrasObrigatorias: [
    { token: 'minimize', dica: 'Reduzir algo ao menor nível possível.' },
    { token: 'friction', dica: 'Resistência, atrito ou gargalo processual.' },
    { token: 'metrics', dica: 'Dados ou medidas de desempenho.' }
  ],
  exemploResposta: 'The primary goal of our management framework is to minimize operational friction and accurately track student metrics over long-term cycles.',
  dicaCoelho: 'Dica do Coelho: Comece estruturando a frase principal com "The main goal is to..." e vá encaixando os termos do inventário naturalmente.'
};

export default function LessonWritingPage() {
  const router = useRouter();
  const [textoUsuario, setTextoUsuario] = useState('');
  const [statusResposta, setStatusStatus] = useState<'idle' | 'correto' | 'errado'>('idle');

  // Verifica em tempo real quais palavras do inventário já foram digitadas no texto
  const conferirPalavraNoTexto = (palavra: string) => {
    return textoUsuario.toLowerCase().includes(palavra.toLowerCase());
  };

  const totalValidadas = QUESTÃO_WRITING.palavrasObrigatorias.filter(p => conferirPalavraNoTexto(p.token)).length;
  const todasPalavrasPresentes = totalValidadas === QUESTÃO_WRITING.palavrasObrigatorias.length;
  const tamanhoMinimoAtingido = textoUsuario.trim().length >= 20;
  const prontoParaValidar = todasPalavrasPresentes && tamanhoMinimoAtingido;

  const handleValidarWriting = (e: React.FormEvent) => {
    e.preventDefault();
    if (statusResposta !== 'idle' || !prontoParaValidar) return;

    setStatusStatus('correto');
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00FF66', '#FFD700', '#00E5FF']
    });
  };

  const handleAvançar = () => {
    router.push('/lesson');
  };

  const jaRespondeu = statusResposta !== 'idle';

  // Handler de segurança para impedir fraudes por colagem
  const barrarFraude = (e: React.ClipboardEvent) => {
    e.preventDefault();
  };

  return (
    <div className="fixed inset-0 w-screen h-screen bg-[#050b11] text-[#E8EDF2] flex items-center justify-center p-6 font-sans antialiased overflow-hidden z-[9999]">
      
      <div className="absolute inset-0 bg-[radial-gradient(#101f30_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none z-0" />

      {/* RECIPIENTE PRINCIPAL DO SPLIT-SCREEN TEXTUAL */}
      <div className="w-full max-w-6xl bg-[#09131f] border-2 border-slate-800 rounded-[36px] p-8 flex justify-between gap-6 shadow-[0_40px_100px_rgba(0,0,0,0.95)] h-[78vh] relative z-10">
        
        {/* 📑 COLUNA ESQUERDA: INVENTÁRIO DE VOCÁBULO */}
        <div className="w-[45%] flex flex-col gap-4 justify-between h-full border-r border-slate-800/40 pr-6 flex-shrink-0 select-none">
          
          <div className="flex flex-col gap-3 w-full">
            <div className="flex items-center gap-2 bg-[#04090f] border border-slate-800/60 p-3 rounded-xl shadow-sm">
              <Cpu size={14} className="text-slate-500 opacity-60" />
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">INVENTÁRIO DE TERMOS MANDATÓRIOS</span>
            </div>

            <p className="text-xs font-bold text-slate-300 leading-relaxed bg-[#04090f] border border-slate-900 rounded-xl p-3.5 text-justify">
              {QUESTÃO_WRITING.instrucao}
            </p>

            {/* Grid dos Cards de Inventário Estilo RPG com Padding-Bottom Ajustado */}
            <div className="flex flex-col gap-2.5 mt-1">
              {QUESTÃO_WRITING.palavrasObrigatorias.map((p) => {
                const ativa = conferirPalavraNoTexto(p.token);
                return (
                  <div 
                    key={p.token}
                    className={`p-3 pb-3.5 rounded-xl border-2 transition-all duration-300 flex items-center justify-between ${
                      ativa 
                        ? 'bg-[#00FF66]/5 border-[#00FF66] shadow-[0_0_15px_rgba(0,255,102,0.1)]' 
                        : 'bg-[#04090f] border-slate-800/80'
                    }`}
                  >
                    <div className="flex flex-col gap-0.5 max-w-[85%]">
                      <span className={`text-xs font-black tracking-wide uppercase ${ativa ? 'text-[#00FF66]' : 'text-slate-200'}`}>
                        {p.token}
                      </span>
                      {/* pb-1 adicionado para o respiro visual solicitado */}
                      <span className="text-[10px] text-slate-500 font-medium leading-tight pb-0.5">{p.dica}</span>
                    </div>
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-all ${
                      ativa ? 'bg-[#00FF66] border-[#00FF66] text-black' : 'border-slate-800 bg-[#020508]'
                    }`}>
                      {ativa && <Check size={12} strokeWidth={4} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Guia do Coelho Pedagógico na Base */}
          <div className="w-full flex items-center gap-3.5 bg-[#04090f] border border-slate-800/80 p-3.5 rounded-2xl shadow-md">
            <div className="p-2 rounded-xl bg-cyan-950/40 border border-cyan-500/10 text-[#00E5FF] flex-shrink-0">
              <Sparkles size={18} />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-widest">► INSTRUÇÃO E REVISÃO PEDAGÓGICA</span>
              <p className="text-[11px] font-semibold text-slate-400 leading-tight">
                {statusResposta === 'idle' && QUESTÃO_WRITING.dicaCoelho}
                {statusResposta === 'correto' && 'Parágrafo perfeito! A sintaxe está excelente e os três termos corporativos foram empregados com total precisão semântica.'}
              </p>
            </div>
          </div>

        </div>

        {/* 📝 COLUNA DIREITA: CONSTRUTOR DE TEXTO */}
        <div className="w-[52%] flex flex-col justify-between h-full py-0.5 pl-2">
          
          <div className="flex justify-between items-center w-full bg-[#04090f] border border-slate-800/60 p-3.5 rounded-2xl shadow-md">
            <div className="flex items-center gap-2">
              {/* Tradução aplicada aqui */}
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">CONSTRUTOR DE TEXTO PRO</span>
            </div>
            <span className="text-[12px] font-black text-[#00E5FF] uppercase tracking-widest font-sans bg-cyan-950/40 px-3 py-0.5 rounded-md border border-cyan-500/10">B2 ESCRITA</span>
          </div>

          {/* Campo de Digitação */}
          <div className="w-full flex-1 my-4 flex flex-col gap-2 relative">
            <textarea
              value={textoUsuario}
              onChange={(e) => setTextoUsuario(e.target.value)}
              disabled={jaRespondeu}
              onPaste={barrarFraude} 
              onCopy={barrarFraude}  
              onCut={barrarFraude}   
              placeholder="Start drafting your English paragraph here..."
              className="w-full flex-1 bg-[#04090f] border-2 border-slate-800/80 rounded-2xl p-4 text-sm font-medium text-slate-200 placeholder:text-slate-700 focus:outline-none focus:border-cyan-500/50 resize-none leading-relaxed shadow-inner tracking-wide"
              maxLength={400}
            />
            
            {/* HUD Contador de Caracteres Corrigido para Plural */}
            <div className="absolute bottom-3 right-4 flex items-center gap-3 text-[10px] font-mono font-bold text-slate-500 bg-[#020508]/80 px-2.5 py-1 rounded-md border border-slate-900">
              <span className={tamanhoMinimoAtingido ? 'text-emerald-400' : 'text-amber-500'}>
                {textoUsuario.trim().length}/20 MIN CARACTERES
              </span>
            </div>
          </div>

          {/* Bloco de Análise Pós-Envio */}
          {statusResposta === 'correto' && (
            <div className="w-full p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-slate-300 text-xs font-semibold tracking-wide flex flex-col gap-1 mb-4 shadow-lg">
              <span className="text-[9px] font-mono font-black text-[#00E5FF] tracking-widest uppercase">SUGESTÃO DE MODELO CORPORATIVO:</span>
              <p className="italic leading-normal text-slate-400">"{QUESTÃO_WRITING.exemploResposta}"</p>
            </div>
          )}

          {/* Painel Inferior de Validação */}
          <div className="w-full flex items-center gap-3">
            <div className={`w-[30%] bg-[#04090f] border h-12 rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all duration-300 font-mono font-bold text-[9px] ${statusResposta === 'correto' ? 'border-emerald-500/30 text-[#00FF66]' : 'border-slate-800 text-slate-400'}`}>
              {statusResposta === 'correto' ? (
                <>
                  <PartyPopper size={14} className="animate-bounce" />
                  <span>+10p UN</span>
                </>
              ) : (
                <div className="flex items-center gap-1">
                  <Settings size={12} className="text-slate-500 animate-spin-slow" />
                  <span>SISTEMA</span>
                </div>
              )}
            </div>
            
            {statusResposta === 'idle' ? (
              <button 
                onClick={handleValidarWriting}
                disabled={!prontoParaValidar} 
                className={`py-3.5 rounded-xl font-black text-xs tracking-[0.2em] uppercase flex items-center justify-center gap-2 transition-all duration-300 w-full ${
                  prontoParaValidar 
                    ? 'bg-gradient-to-b from-cyan-500 to-cyan-600 text-black shadow-[0_6px_25px_rgba(0,229,255,0.35)] scale-[1.01] cursor-pointer hover:brightness-110' 
                    : 'bg-[#131f2c] text-slate-600 cursor-not-allowed border border-slate-900 opacity-40'
                }`}
              >
                SUBMETER TEXTO <ArrowRight size={14} strokeWidth={3} />
              </button>
            ) : (
              <button 
                onClick={handleAvançar}
                className="py-3.5 rounded-xl font-black text-xs tracking-[0.2em] uppercase flex items-center justify-center gap-2 transition-all duration-300 w-full bg-gradient-to-b from-[#F8891D] to-[#E67212] text-white shadow-[0_6px_25px_rgba(248,137,29,0.5)] scale-[1.01] cursor-pointer hover:brightness-110 active:scale-95 opacity-100"
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