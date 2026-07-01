import React from 'react';
import { X, Trophy } from 'lucide-react';
// Importando o dicionário completo de ícones para renderização dinâmica
import * as LucideIcons from 'lucide-react';

interface InsigniaDinamica {
  id: string;
  titulo: { PT: string; EN: string; ES: string };
  requisito: { PT: string; EN: string; ES: string };
  iconeNome: string; // Ex: 'Target', 'Flame', 'Shield', 'Zap', 'Crown', 'Award'
  corSimbolo: string; // Ex: 'text-amber-500', 'text-orange-500'
  bgSimbolo: string; // Ex: 'bg-amber-500/10', 'bg-orange-500/10'
  sombra: string; // Ex: 'shadow-[0_0_10px_rgba(245,158,11,0.1)]'
  ativa: boolean;
}

interface GavetaBadgesProps {
  isOpen: boolean;
  onClose: () => void;
  idioma: string;
}

export default function GavetaBadges({ isOpen, onClose, idioma }: GavetaBadgesProps) {
  
  // 🔮 ESTE ARRAY SIMULA EXATAMENTE O QUE VAI VINDOS DO SUPABASE DEPOIS!
  // Você pode adicionar 100 itens aqui que a gaveta vai renderizar todos perfeitamente com scroll.
  const listaInsignias: InsigniaDinamica[] = [
    {
      id: "1",
      titulo: { PT: "Coesão Absoluta", EN: "Absolute Cohesion", ES: "Cohesión Absoluta" },
      requisito: { PT: "Desbloqueada recentemente", EN: "Unlocked recently", ES: "Desbloqueado recientemente" },
      iconeNome: "Target",
      corSimbolo: "text-amber-500",
      bgSimbolo: "bg-amber-500/10",
      sombra: "shadow-[0_0_10px_rgba(245,158,11,0.1)]",
      ativa: true
    },
    {
      id: "2",
      titulo: { PT: "Constância 12D", EN: "12D Streak", ES: "Constancia 12D" },
      requisito: { PT: "Ritmo tático impecável", EN: "Tactical pace", ES: "Ritmo táctico impecable" },
      iconeNome: "Flame",
      corSimbolo: "text-orange-500",
      bgSimbolo: "bg-orange-500/10",
      sombra: "shadow-[0_0_10px_rgba(249,115,22,0.1)]",
      ativa: true
    },
    {
      id: "3",
      titulo: { PT: "Audit Specialist", EN: "Audit Specialist", ES: "Audit Specialist" },
      requisito: { PT: "Banca examinadora superada", EN: "Exam cleared", ES: "Examen superado" },
      iconeNome: "Shield",
      corSimbolo: "text-sky-400",
      bgSimbolo: "bg-sky-500/10",
      sombra: "shadow-[0_0_10px_rgba(56,189,248,0.1)]",
      ativa: true
    },
    {
      id: "4",
      titulo: { PT: "Vanguard Master", EN: "Vanguard Master", ES: "Vanguard Master" },
      requisito: { PT: "Falta: Alcançar Nível B2", EN: "Requires Level B2", ES: "Falta: Alcanzar Nivel B2" },
      iconeNome: "Crown",
      corSimbolo: "text-slate-500",
      bgSimbolo: "bg-slate-800",
      sombra: "border-white/5",
      ativa: false
    },
    {
      id: "5",
      titulo: { PT: "Arena Dominator", EN: "Arena Dominator", ES: "Arena Dominator" },
      requisito: { PT: "Falta: 50 Acertos Seguidos", EN: "Requires 50 win streak", ES: "Falta: 50 Aciertos Seguidos" },
      iconeNome: "Zap",
      corSimbolo: "text-slate-500",
      bgSimbolo: "bg-slate-800",
      sombra: "border-white/5",
      ativa: false
    },
    {
      id: "6",
      titulo: { PT: "Gênio Textual", EN: "Textual Genius", ES: "Genio Textual" },
      requisito: { PT: "Falta: Escrever 5000 palavras", EN: "Requires 5000 words", ES: "Falta: Escribir 5000 palabras" },
      iconeNome: "BookOpen",
      corSimbolo: "text-slate-500",
      bgSimbolo: "bg-slate-800",
      sombra: "border-white/5",
      ativa: false
    }
  ];

  return (
    <div className={`fixed inset-0 z-50 transition-all duration-300 flex justify-start ${isOpen ? 'visible' : 'invisible'}`}>
      <div onClick={onClose} className={`absolute inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} />
      <div className={`relative w-[340px] h-full bg-[#03080f] border-r border-white/5 p-5 flex flex-col justify-between shadow-2xl transition-transform duration-300 font-sans ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        <div className="flex flex-col gap-4 overflow-hidden w-full">
          {/* Header */}
          <div className="flex flex-row justify-between items-center border-b border-white/5 pb-2">
            <div className="flex items-center gap-2 text-amber-500 font-mono text-[9px] font-black uppercase tracking-widest">
              <Trophy size={12} className="text-amber-500" />
              <span>{idioma === 'PT' ? 'REPOSITÓRIO DE CERTIFICAÇÕES' : idioma === 'ES' ? 'REPOSITORIO DE CERTIFICACIONES' : 'CERTIFICATION REPOSITORY'}</span>
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><X size={16} /></button>
          </div>

          <div className="text-[10px] text-slate-400 leading-normal font-sans">
            {idioma === 'PT' ? 'Validações e auditorias aplicadas ao seu perfil' : idioma === 'ES' ? 'Validaciones y auditorías aplicadas a su perfil' : 'Validations and audits applied to your profile'}
          </div>

          {/* LISTA RENDERIZADA AUTOMATICAMENTE (LOOP INTELIGENTE) */}
          <div className="flex flex-col gap-2 overflow-y-auto no-scrollbar max-h-[72vh] pr-1 mt-1">
            {listaInsignias.map((badge) => {
              // Resolvendo o componente de ícone dinamicamente pelo nome string
              const IconeComponente = (LucideIcons as any)[badge.iconeNome] || Trophy;
              
              const txtTitulo = (badge.titulo as any)[idioma] || badge.titulo.PT;
              const txtRequisito = (badge.requisito as any)[idioma] || badge.requisito.PT;

              return badge.ativa ? (
                /* CARD ATIVO AUTOMÁTICO */
                <div key={badge.id} className="bg-[#071324] border border-amber-500/20 p-2.5 rounded-xl flex items-center justify-between shadow-sm transition-all hover:bg-[#09182d]">
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-lg ${badge.bgSimbolo} flex items-center justify-center ${badge.corSimbolo} ${badge.sombra}`}>
                      <IconeComponente size={14} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-white font-bold">{txtTitulo}</span>
                      <span className="text-[8px] text-slate-500 font-sans">{txtRequisito}</span>
                    </div>
                  </div>
                  <span className="text-[7px] font-mono text-amber-400 font-black uppercase bg-amber-500/10 px-1 py-0.5 rounded tracking-wider">
                    {idioma === 'PT' ? 'Ativa' : 'Active'}
                  </span>
                </div>
              ) : (
                /* CARD BLOQUEADO AUTOMÁTICO (Aluno tem que suar para ganhar) */
                <div key={badge.id} className="bg-[#040a12]/30 border border-white/[0.02] p-2.5 rounded-xl flex items-center justify-between opacity-25 select-none grayscale relative group overflow-hidden">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-600 border border-white/5">
                      <IconeComponente size={14} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 font-bold tracking-wide">{txtTitulo}</span>
                      <span className="text-[8px] text-red-500/70 font-mono font-black uppercase tracking-tight mt-0.5">{txtRequisito}</span>
                    </div>
                  </div>
                  <span className="text-[7px] font-mono text-slate-600 font-black uppercase bg-white/[0.02] px-1 py-0.5 rounded border border-white/5">
                    {idioma === 'PT' ? 'Bloqueada' : 'Locked'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rodapé */}
        <button onClick={onClose} className="w-full bg-[#071324] hover:bg-[#0c1e36] text-slate-300 font-mono text-[9px] font-black py-2.5 uppercase tracking-widest rounded-xl border border-white/5 transition-all text-center mt-3 active:scale-[0.98]">{idioma === 'PT' ? 'Voltar ao Perfil' : idioma === 'ES' ? 'Volver al Perfil' : 'Back to Profile'}</button>
      </div>
    </div>
  );
}