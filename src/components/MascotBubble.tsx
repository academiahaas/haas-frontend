/* =========================================================================
  COMPONENTE: MASCOTE INTELIGENTE (ROBÔ HAAS BUBBLE - VERSÃO COELHO GENTIL)
  =========================================================================
*/

'use client';

import React, { useState, useEffect } from 'react';
import { Bot, AlertTriangle, Zap, MessageSquareCode } from 'lucide-react';

interface MascotBubbleProps {
  statusResposta: 'idle' | 'correto' | 'errado' | 'timeout';
  explicacaoIA?: string; 
}

// 🌍 DICIONÁRIO DE MENSAGENS PADRÃO - CALIBRADO COM AMABILIDADE E ALMA DE COELHO
const mensagensBaseRobo = {
  PT: {
    correto: "Excelente escolha, Bruna! Sua linha de raciocínio faz todo sentido para o ambiente corporativo atual. Continue com essa energia!",
    errado: "Atenção ao ponto, Bruna. Essa alternativa quebra a precisão que precisamos em reuniões importantes. Vamos revisar essa estrutura juntos?",
    timeout: "O tempo de reação corporativa expirou! Mas não se preocupe, Bruna, no próximo cenário nós lideramos a mesa com agilidade.",
    idle: "Olá, Bruna! Que alegria te ver por aqui para mais um treino de alta performance. Qual desses cenários de mercado vamos conquistar hoje? Estou pronto!"
  },
  ES: {
    correto: "¡Excelente elección, Bruna! Tu línea de razonamiento tiene todo el sentido para el entorno corporativo actual. ¡Sigue con esa energía!",
    errado: "Atención al punto, Bruna. Esta alternativa rompe la precisión que necesitamos en reuniones importantes. ¿Revisamos esta estructura juntos?",
    timeout: "¡El tiempo de reacción ha expirado! Pero no te preocupes, Bruna, en el próximo escenario lideraremos la mesa con agilidad.",
    idle: "¡Hola, Bruna! Qué alegría verte por aquí para otro entrenamiento de alto rendimiento. ¿Cuál de estos escenarios conquistaremos hoy?"
  },
  EN: {
    correto: "Excellent choice, Bruna! Your line of reasoning makes total sense for today's corporate environment. Keep up the great energy!",
    errado: "Pay attention to this point, Bruna. This alternative breaks the precision we need in important meetings. Let's review this structure together.",
    timeout: "Corporate reaction time has expired! But don't worry, Bruna, in the next scenario we will lead the table with speed.",
    idle: "Hello, Bruna! Such a pleasure to see you here for another high-performance session. Which of these market scenarios are we conquering today?"
  }
};

export function MascotBubble({ statusResposta, explicacaoIA }: MascotBubbleProps) {
  const [textoExibido, setTextoExibido] = useState('');
  const [idioma, setIdioma] = useState<'PT' | 'ES' | 'EN'>('PT');

  // Sincroniza o idioma do robô com a escolha do portal
  useEffect(() => {
    const idiomaSalvo = localStorage.getItem('haas_idioma_auxiliar');
    if (idiomaSalvo === 'PT' || idiomaSalvo === 'ES' || idiomaSalvo === 'EN') {
      setIdioma(idiomaSalvo);
    }
  }, [statusResposta, explicacaoIA]);

const obterMensagemBase = () => {
    // 🌟 SE A IA ENTREGOU UM TEXTO REAL, IMPRIME ELE
    if (explicacaoIA && explicacaoIA.trim() !== '') {
      return explicacaoIA
        .replace('Aerta', 'Alerta')
        .replace('Sitemas', 'Sistemas')
        .replace('Oerational', 'Operational')
        .replace('antástico', 'Fantástico');
    }
    
    // ⏳ SE VOCÊ CLICOU MAS A IA AINDA ESTÁ EM SILÊNCIO (OU DEU ERRO), MOSTRA O STATUS CORRETO
    const m = mensagensBaseRobo[idioma] || mensagensBaseRobo.PT;
    switch (statusResposta) {
      case 'correto': 
        return "Analisando sua resposta correta... Buscando relatório estratégico da IA.";
      case 'errado': 
        return "Avaliando o impacto dessa escolha... Aguardando feedback tático do servidor.";
      case 'timeout': 
        return m.timeout;
      default: 
        return m.idle;
    }
  };
  
  const textoCompleto = obterMensagemBase();

  // ⚡ MOTOR TYPING DETERMINÍSTICO BLINDADO
  useEffect(() => {
    setTextoExibido(''); 
    
    let currentText = '';
    let i = 0;
    const velocidade = 12; 

    const timer = setInterval(() => {
      if (i < textoCompleto.length) {
        currentText += textoCompleto[i];
        setTextoExibido(currentText);
        i++;
      } else {
        clearInterval(timer);
      }
    }, velocidade);

    return () => clearInterval(timer);
  }, [textoCompleto]);

  const obterConfiguracaoModo = () => {
    switch (statusResposta) {
      case 'correto':
        return {
          titulo: idioma === 'EN' ? "HAAS MENTOR" : "MENTOR HAAS",
          subtitulo: idioma === 'EN' ? "CORPORATE INSIGHT" : "INSIGHT CORPORATIVO",
          estiloBorda: "border-emerald-500/30 bg-[#0d1f1a]/95 shadow-[0_0_25px_rgba(0,255,102,0.05)]",
          estiloIcone: "bg-emerald-500/10 text-[#00FF66] shadow-[0_0_15px_rgba(0,255,102,0.2)]",
          icone: <Zap size={14} className="animate-bounce" />,
        };
      case 'errado':
        return {
          titulo: idioma === 'EN' ? "TACTICAL AUDITOR" : "AUDITOR TÁTICO",
          subtitulo: idioma === 'EN' ? "ERROR ENGINEERING" : "ENGENHARIA DO ERRO",
          estiloBorda: "border-rose-500/30 bg-[#1f1115]/95 shadow-[0_0_25px_rgba(255,113,143,0.05)]",
          estiloIcone: "bg-rose-500/10 text-[#FF718F] shadow-[0_0_15px_rgba(255,113,143,0.2)]",
          icone: <AlertTriangle size={14} className="animate-pulse" />,
        };
      case 'timeout':
        return {
          titulo: "AUDITOR TÁTICO",
          subtitulo: "TIMEOUT",
          estiloBorda: "border-amber-500/30 bg-[#1f1a11]/95",
          estiloIcone: "bg-amber-500/10 text-[#FFB84D]",
          icone: <AlertTriangle size={14} />,
        };
      default:
        return {
          titulo: "HAAS COACH",
          subtitulo: idioma === 'EN' ? "EXECUTIVE COACHING" : "COACHING EXECUTIVO",
          estiloBorda: "border-slate-800/80 bg-[#122234]/95 shadow-xl",
          estiloIcone: "bg-slate-800 text-cyan-400",
          icone: <MessageSquareCode size={14} />,
        };
    }
  };

  const modo = obterConfiguracaoModo();

  return (
    <div className="w-[21%] flex flex-col items-center justify-center gap-4 relative select-none animate-[fadeIn_0.5s_ease-out]">
      <div className="relative group">
        <div className={`absolute inset-0 rounded-full blur-2xl opacity-20 transition-all duration-500 ${
          statusResposta === 'correto' ? 'bg-[#00FF66]' : statusResposta === 'errado' ? 'bg-[#FF718F]' : 'bg-cyan-400'
        }`} />
        <div className={`p-4 md:p-5 rounded-full border-2 transition-all duration-300 relative z-10 ${
          statusResposta === 'correto' ? 'border-emerald-500 bg-[#0d1f1a] text-[#00FF66] shadow-[0_0_30px_rgba(0,255,102,0.15)]' : statusResposta === 'errado' ? 'border-rose-500 bg-[#1f1115] text-[#FF718F] shadow-[0_0_30px_rgba(255,113,143,0.15)]' : 'border-slate-700 bg-[#101f30] text-cyan-400'
        }`}>
          <Bot size={40} className="md:size-12" />
        </div>
      </div>

      <div className={`w-full border rounded-2xl p-4 flex flex-col gap-2 shadow-2xl backdrop-blur-sm relative transition-all duration-300 h-auto min-h-[140px] pb-5 ${modo.estiloBorda}`}>
        <div className={`absolute left-1/2 -translate-x-1/2 -top-1.5 w-3 h-3 rotate-45 border-t border-l transition-all duration-300 ${
          statusResposta === 'correto' ? 'bg-[#0d1f1a] border-emerald-500/30' : statusResposta === 'errado' ? 'bg-[#1f1115] border-rose-500/30' : 'bg-[#122234] border-slate-800/80'
        }`} />
        <div className="flex items-center justify-between w-full border-b border-slate-800/60 pb-1.5 mb-1">
          <div className="flex flex-col items-start">
            <span className="text-[9px] font-black tracking-wider text-white uppercase">{modo.titulo}</span>
            <span className="text-[7.5px] font-mono font-black text-slate-500 uppercase tracking-widest">{modo.subtitulo}</span>
          </div>
          <div className={`p-1 rounded-md text-xs transition-all ${modo.estiloIcone}`}>{modo.icone}</div>
        </div>
        <p className="text-[11px] font-bold text-slate-300 leading-relaxed text-left whitespace-pre-line break-words after:content-['▋'] after:ml-0.5 after:text-cyan-400 after:animate-pulse">
          {textoExibido}
        </p>
      </div>
    </div>
  );
}