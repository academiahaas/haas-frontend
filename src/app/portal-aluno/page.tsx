/* =========================================================================
  PORTAL DO ALUNO - HAAS ACADEMY (DESIGN OFICIAL APROVADO - COMPACTADO 100%)
  =========================================================================
*/
'use client';
import React, { useState, useEffect } from 'react';
import { 
  Settings, Home, MapPin, Gift, BookOpen, Trophy, Shield, Box, 
  Flame, Sparkles, Target, GraduationCap, Swords
} from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const traducoes = {
  PT: {
    inicio: 'Início', trilha: 'Trilha', recompensas: 'Recompensas', recursos: 'Recursos', desafios: 'Desafios', ligas: 'Ligas', bau: 'Baú',
    objetivo: 'OBJETIVO', proximaConquista: 'PRÓXIMA CONQUISTA', recorde: 'Recorde', nivel: 'Nível', intermediario: 'Nível B1 Intermediário',
    restante: 'Restante', para: 'para', trilhaCompetencias: 'TRILHA DE COMPETÊNCIAS', completo: 'Completo', modulo: 'Módulo',
    treinarReativar: 'TREINAR / REATIVAR AGORA', dominioAtual: 'Domínio atual', ultimoTreino: 'Último treino: --. Vértice: --%',
    painelEvolucao: 'GAMIFICATION CENTER', graficoProficiencia: 'RADAR PROFICIENCY CHART', ligasPopulares: 'LIGAS POPULARES B2C',
    metasDiarias: 'DAILY GOAL / STREAK TRACKER', atividadesConcluidas: 'Atividades Concluídas', mediaFluencia: 'Média de Fluência',
    faturamentoCenter: 'Faturamento Center', historicoDia: 'Histórico em dia', sequenciaAtual: 'Sequência Atual',
    melhorSequencia: 'Melhor sequência', bauErros: 'BAÚ DE ERROS RECORRENTES', oficinaReuniao: 'Ofirina / Escritório', emReuniao: 'em reunião',
    limparBau: 'LIMPAR BAÚ', fala: 'Fala', escuta: 'Escuta', gramatica: 'Gramática', escrita: 'Escrita', leitura: 'Leitura', proximoNivel: 'Próximo nível',
    msgMascote: "Você está a apenas 1 atividade de completar sua meta diária! 👀"
  },
  ES: {
    inicio: 'Inicio', trilha: 'Ruta', recompensas: 'Premios', recursos: 'Recursos', desafios: 'Desafios', ligas: 'Ligas', bau: 'Cofre',
    objetivo: 'OBJETIVO', proximaConquista: 'PRÓXIMO LOGRO', recorde: 'Récord', nivel: 'Nivel', intermediario: 'Nivel B1 Intermedio',
    restante: 'Restante', para: 'para', trilhaCompetencias: 'RUTA DE COMPETENCIAS', completo: 'Completado', modulo: 'Módulo',
    treinarReativar: 'ENTRENAR / REACTIVAR AHORA', dominioAtual: 'Dominio actual', ultimoTreino: 'Último entreno: hace 3 días. El vértice disminuyó 12%.',
    painelEvolucao: 'GAMIFICATION CENTER', graficoProficiencia: 'RADAR PROFICIENCY CHART', ligasPopulares: 'LIGAS POPULARES B2C',
    metasDiarias: 'DAILY GOAL / STREAK TRACKER', atividadesConcluidas: 'Actividades Completadas', mediaFluencia: 'Promedio de Fluidez',
    faturamentoCenter: 'Centro de Facturación', historicoDia: 'Historial al día', sequenciaAtual: 'Racha Actual',
    melhorSequencia: 'Mejor racha', bauErros: 'COFRE DE ERRORES FRECUENTES', oficinaReuniao: 'Taller / Oficina', emReuniao: 'en reunión',
    limparBau: 'LIMPIAR COFRE', fala: 'Habla', escuta: 'Escucha', gramatica: 'Gramática', escrita: 'Escritura', leitura: 'Lectura', proximoNivel: 'Próximo nivel',
    msgMascote: "¡Estás a solo 1 actividad de completar tu meta diaria! 👀"
  },
  EN: {
    inicio: 'Home', trilha: 'Path', recompensas: 'Rewards', recursos: 'Resources', desafios: 'Quests', ligas: 'Leagues', bau: 'Chest',
    objetivo: 'OBJECTIVE', proximaConquista: 'NEXT ACHIEVEMENT', recorde: 'Record', nivel: 'Level', intermediario: 'Level B1 Intermediate',
    restante: 'Remaining', para: 'to', trilhaCompetencias: 'SKILLS PATH', completo: 'Completed', modulo: 'Module',
    treinarReativar: 'TRAIN / REACTIVATE NOW', dominioAtual: 'Current mastery', ultimoTreino: 'Last practice: 3 days ago. Vertex dropped 12%.',
    painelEvolucao: 'GAMIFICATION CENTER', graficoProficiencia: 'RADAR PROFICIENCY CHART', ligasPopulares: 'POPULAR B2C LEAGUES',
    metasDiarias: 'DAILY GOAL / STREAK TRACKER', atividadesConcluidas: 'Activities Completed', mediaFluencia: 'Fluency Average',
    faturamentoCenter: 'Billing Center', historicoDia: 'History updated', sequenciaAtual: 'Current Streak',
    melhorSequencia: 'Best streak', bauErros: 'RECURRING ERRORS CHEST', oficinaReuniao: 'Workshop / Office', emReuniao: 'in meeting',
    limparBau: 'CLEAR CHEST', fala: 'Speaking', escuta: 'Listening', gramatica: 'Grammar', escrita: 'Writing', leitura: 'Reading', proximoNivel: 'Next level',
    msgMascote: "You are just 1 activity away from completing your daily goal! 👀"
  }
};

export default function PortalAluno() {
  const [idioma, setIdioma] = useState<'PT' | 'ES' | 'EN'>('PT');
  const t = traducoes[idioma];
  const blocosXP = Array.from({ length: 10 }, (_, i) => i < 8);
  const [dadosRadar] = useState([
    { competenca: 'Fala', nota: 95 }, { competenca: 'Escuta', nota: 88 }, { competenca: 'Gramática', nota: 90 }, { competenca: 'Escrita', nota: 62 }, { competenca: 'Leitura', nota: 78 },
  ]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const salvo = localStorage.getItem('haas_idioma_auxiliar');
    if (salvo && (salvo === 'PT' || salvo === 'ES' || salvo === 'EN')) {
      setIdioma(salvo);
    }
  }, []);

  const mudarIdioma = (lang: 'PT' | 'ES' | 'EN') => {
    setIdioma(lang);
    localStorage.setItem('haas_idioma_auxiliar', lang);
  };

  const formatarCOP = (valor: number) => {
    if (!mounted) return '$ ---';
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(valor);
  };

  return (
    <div className="flex bg-[#12202C] h-screen max-h-screen text-slate-200 antialiased overflow-hidden p-2 gap-2 select-none">
      
      {/* 1. BARRA LATERAL ESQUERDA COMPACTADA */}
      <div className="w-[19.20%] bg-[#0A131C] border border-[#1C2C39] rounded-2xl p-4 flex flex-col shrink-0 min-w-[250px] relative shadow-2xl justify-between h-full">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2.5 px-0.5 pt-0.5">
            <div className="h-10 w-10 bg-gradient-to-tr from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shrink-0">
              <span className="text-xl font-black text-[#0A131C]">🤖</span>
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-lg font-black text-[#3CD070] tracking-tight leading-none uppercase">Haas</h1>
              <span className="text-[9px] text-slate-400 font-bold tracking-[0.32em] uppercase mt-0.5 leading-none">Idiomas</span>
            </div>
          </div>

          {/* SELETORES DE IDIOMA */}
          <div className="flex gap-1 bg-[#12202C] p-0.5 rounded-xl border border-[#1C2C39] shadow-inner">
            <button onClick={() => mudarIdioma('PT')} className={`flex-1 text-[9px] font-black py-1 rounded transition-all ${idioma === 'PT' ? 'bg-[#3CD070] text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white'}`}>PT BR</button>
            <button onClick={() => mudarIdioma('ES')} className={`flex-1 text-[9px] font-black py-1 rounded transition-all ${idioma === 'ES' ? 'bg-[#3CD070] text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white'}`}>ES CO</button>
            <button onClick={() => mudarIdioma('EN')} className={`flex-1 text-[9px] font-black py-1 rounded transition-all ${idioma === 'EN' ? 'bg-[#3CD070] text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white'}`}>EN US</button>
          </div>

          {/* CARD DO ALUNO */}
          <div className="bg-[#101D28] border border-[#1C2C39] rounded-2xl py-3 px-3 flex flex-col items-center justify-center text-center relative w-full overflow-hidden shadow-md">
            <button className="absolute top-2 right-2 text-slate-500 hover:text-slate-300">
              <Settings size={12} />
            </button>
            <div className="relative">
              <div className="h-13 w-13 rounded-full bg-cyan-200 border-2 border-[#0A131C] flex items-center justify-center overflow-hidden shadow">
                <span className="text-2xl">👦🏽</span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 bg-[#00E5FF] text-[#0A131C] font-mono text-[11px] font-black h-5 w-5 rounded-full flex items-center justify-center border border-[#101D28] shadow">B2</div>
            </div>
            <h2 className="text-base font-black text-white mt-2 tracking-wide leading-none">Aluno Teste</h2>
            <p className="text-xs text-slate-400 leading-none mt-1">{t.intermediario}</p>
            <div className="w-full mt-3 space-y-1">
              <div className="flex justify-between text-[9px] font-mono text-slate-400 font-bold">
                <span>XP: -- / --</span>
                <span className="text-orange-400 font-black">(--% {t.para} B2)</span>
              </div>
              <div className="flex gap-0.5 h-1.5 w-full">
                {blocosXP.map((ativo, index) => (
                  <div key={index} className={`flex-1 rounded-sm ${ativo ? 'bg-orange-500 shadow-sm' : 'bg-[#12202C]'}`} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* MEDALHAS OFICIAIS FLUTUANTES NA BASE */}
        <div className="flex flex-col items-center justify-center gap-1 mt-auto mb-1 pt-3 border-t border-[#1C2C39]/30 w-full">
          <div className="text-[9px] font-black tracking-widest uppercase text-slate-500 font-mono">Elite Badges</div>
          <div className="flex justify-center items-center gap-3.5 bg-gradient-to-t from-cyan-500/10 to-transparent px-4 py-2 rounded-xl border border-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.12)] backdrop-blur-sm">
            <span className="text-3xl cursor-pointer select-none filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.7)] hover:scale-110 transition-transform">🔮</span>
            <span className="text-3xl cursor-pointer select-none filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.7)] hover:scale-110 transition-transform">🏅</span>
            <span className="text-3xl cursor-pointer select-none filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.7)] hover:scale-110 transition-transform">👑</span>
          </div>
        </div>
      </div>

      {/* PAINEL DE CONTEÚDO PRINCIPAL COMPACTADO */}
      <div className="flex-1 flex flex-col gap-2 h-full justify-between">
        
        {/* MENU SUPERIOR COMPACTO */}
        <div className="bg-[#0A131C] border border-[#1C2C39] rounded-2xl p-2 flex justify-between items-center shadow-2xl shrink-0">
          <nav className="flex gap-4 text-[9px] font-black uppercase tracking-wider font-sans items-center pl-1">
            <button className="flex flex-col items-center justify-center gap-0.5 text-orange-400 font-black border-b-2 border-orange-400 pb-0.5 transition-all">
              <Home size={14} className="text-orange-400 fill-orange-400/20" /> <span>{t.inicio}</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-0.5 text-[#3CD070] hover:text-white font-bold transition-all">
              <MapPin size={14} className="text-[#3CD070]" /> <span>{t.trilha}</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-0.5 text-rose-400 hover:text-white font-bold transition-all">
              <Gift size={14} className="text-rose-400" /> <span>{t.recompensas}</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-0.5 text-purple-400 hover:text-white font-bold transition-all">
              <BookOpen size={14} className="text-purple-400" /> <span>{t.recursos}</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-0.5 text-amber-400 hover:text-white font-bold transition-all">
              <Trophy size={14} className="text-amber-400" /> <span>{t.desafios}</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-0.5 text-blue-400 hover:text-white font-bold transition-all">
              <Shield size={14} className="text-blue-400" /> <span>{t.ligas}</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-0.5 text-amber-600 hover:text-white font-bold transition-all">
              <Box size={14} className="text-amber-600" /> <span>{t.bau}</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-0.5 text-cyan-400 hover:text-white font-bold transition-all">
              <Sparkles size={14} className="text-cyan-400" /> <span>Online</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-0.5 text-emerald-400 hover:text-white font-bold transition-all">
              <GraduationCap size={14} className="text-emerald-400" /> <span>Classroom</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-0.5 text-indigo-400 hover:text-white font-bold transition-all">
              <Swords size={14} className="text-indigo-400" /> <span>Praticar</span>
            </button>
          </nav>
          
          <div className="flex items-center gap-2 pr-1">
            <div className="flex items-center bg-[#101D28] border border-[#1C2C39] px-2.5 py-1 rounded-xl shadow-md font-mono text-[9px] font-black text-white">
              <span className="text-[#3CD070] mr-1">🎯</span>
              <span className="text-slate-400 mr-1">{t.objetivo}:</span>
              <span>--- XP</span>
            </div>
            
            <div className="flex items-center gap-2 bg-[#101D28] border border-cyan-500/40 rounded-xl px-3 py-1 shadow-xl font-mono">
              <div className="text-right">
                <div className="text-[7px] text-slate-400 font-bold uppercase leading-none">PRÓXIMA CONQUISTA</div>
                <div className="text-xs font-black text-[#00E5FF] tracking-wide mt-0.5 filter drop-shadow-[0_0_4px_rgba(0,229,255,0.6)]">
                  Recorde: -- dias
                </div>
              </div>
              <Trophy size={14} className="text-[#00E5FF] filter drop-shadow-[0_0_6px_rgba(6,182,212,0.6)]" />
            </div>
          </div>
        </div>

        {/* GRIDS INTERNOS COM MAX-HEIGHT TRANCADO CONTRA SUPORTE DE TELA */}
        <div className="flex-1 grid grid-cols-3 gap-2 min-h-0">
          
          {/* TRILHA CENTRAL COM MAX-HEIGHT DINÂMICO PARA EVITAR ROLAGEM GERAL */}
          <div className="col-span-2 bg-[#0A131C] border border-[#1C2C39] rounded-2xl p-4 flex flex-col gap-3 shadow-2xl overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-slate-700/60 scrollbar-track-transparent h-full max-h-[calc(100vh-160px)]">
            <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-wider font-mono">{t.trilhaCompetencias}</h2>
            
            <div className="border border-[#1C2C39] rounded-xl p-3 bg-[#101D28] flex items-center gap-3 shadow-sm opacity-60 shrink-0">
              <div className="h-6 w-6 rounded-full bg-orange-500/10 border border-orange-500 flex items-center justify-center text-orange-400 text-xs font-bold">✓</div>
              <div className="flex-1 min-w-0">
                <span className="block text-[10px] text-slate-500 font-bold">{t.modulo} 1</span>
                <p className="font-bold text-xs text-slate-400 truncate">Verb Tenses (CEFR B1)</p>
              </div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t.completo}</span>
            </div>

            <div className="border border-[#1C2C39] rounded-xl p-3 bg-[#101D28] flex items-center gap-3 shadow-sm opacity-60 shrink-0">
              <div className="h-6 w-6 rounded-full bg-orange-500/10 border border-orange-500 flex items-center justify-center text-orange-400 text-xs font-bold">✓</div>
              <div className="flex-1 min-w-0">
                <span className="block text-[10px] text-slate-500 font-bold">{t.modulo} 2</span>
                <p className="font-bold text-xs text-slate-400 truncate">Prepositions (CEFR B2)</p>
              </div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t.completo}</span>
            </div>

            {/* Módulo 3 UNIFICADO COM CIANO NEON */}
            <div className="border-2 border-[#00E5FF] rounded-xl p-4 bg-gradient-to-br from-[#132637] via-[#0E1A26] to-[#0A131C] flex flex-col gap-2 shadow-[0_0_12px_rgba(0,229,255,0.15)] relative overflow-hidden shrink-0">
              <div className="flex justify-between items-start">
                <div>
                  <span className="block text-[9px] text-[#00E5FF] font-black uppercase tracking-wide font-mono">{t.modulo} 3</span>
                  <h3 className="font-black text-xs text-white tracking-wide">If Clauses (CEFR B2)</h3>
                </div>
                <span className="text-[8px] bg-orange-500 text-slate-950 font-black px-1.5 py-0.5 rounded uppercase tracking-wider shadow-lg">MISSION</span>
              </div>
              <p className="text-[11px] text-cyan-300/90 font-bold leading-tight">⚠️ Domínio atual: --% • Último treino: --. Vértice: --%</p>
              <button className="w-full bg-orange-500 hover:bg-orange-400 text-slate-950 font-black text-xs py-2 rounded-lg uppercase tracking-widest transition-colors shadow-lg shadow-orange-500/20">
                TREINAR / REATIVAR AGORA
              </button>
            </div>

            <div className="border border-[#1C2C39] rounded-xl p-3 bg-[#101D28]/40 flex items-center gap-3 opacity-20 shrink-0">
              <div className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 text-xs font-bold">💬</div>
              <div className="flex-1 min-w-0">
                <span className="block text-[10px] text-slate-600 font-bold">{t.modulo} 4</span>
                <p className="font-bold text-xs text-slate-500 truncate">Intermediate Prepositions (CEFR B2)</p>
              </div>
              <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Concluído</span>
            </div>
          </div>

          {/* PAINÉIS DA DIREITA COMPACTADOS */}
          <div className="flex flex-col gap-2 h-full max-h-[calc(100vh-160px)]">
            <div className="bg-[#0A131C] border border-[#1C2C39] rounded-2xl p-3 flex flex-col gap-1.5 shadow-2xl shrink-0">
              <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-wider font-mono">GAMIFICATION CENTER</h2>
              <div className="flex justify-between items-center gap-1">
                <div className="text-xs font-mono font-bold text-slate-300 space-y-1 flex-1">
                  <p><span className="text-slate-500 uppercase font-sans text-[8px] font-bold w-[65px] inline-block">Nível</span>: B1</p>
                  <p><span className="text-slate-500 uppercase font-sans text-[8px] font-bold w-[65px] inline-block">Próximo</span>: B2</p>
                  <p><span className="text-slate-500 uppercase font-sans text-[8px] font-bold w-[65px] inline-block">Restante</span>: --- XP</p>
                  <p><span className="text-orange-400 uppercase font-sans text-[8px] font-bold w-[65px] inline-block">Bônus</span>: +50 XP</p>
                </div>
                <div className="p-2 bg-gradient-to-br from-[#1F3347] to-[#101D28] border border-[#2C3E50]/40 rounded-xl flex items-center justify-center shadow-inner shrink-0">
                  <span className="text-3xl filter drop-shadow-[0_0_6px_rgba(234,179,8,0.4)]">🏆</span>
                </div>
              </div>
            </div>

            {/* RADAR */}
            <div className="bg-[#0A131C] border border-[#1C2C39] rounded-2xl p-3 flex flex-col shadow-2xl flex-1 min-h-0 justify-between">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-wider font-mono">RADAR PROFICIENCY CHART</h3>
              <div className="flex-1 bg-[#101D28]/10 rounded-xl flex items-center justify-center overflow-hidden p-1 my-1 border border-[#1C2C39]/20 shadow-inner max-h-[140px]">
                {mounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="55%" data={dadosRadar}>
                      <PolarGrid stroke="#1C2C39" />
                      <PolarAngleAxis dataKey="competenca" tick={{ fill: '#94A3B8', fontSize: 7, fontWeight: 'bold' }} />
                      <PolarRadiusAxis tick={false} domain={[0, 100]} />
                      <Radar name="Proficiência" dataKey="nota" stroke="#00E5FF" fill="#00E5FF" fillOpacity={0.2} />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest animate-pulse">Sincronizando...</div>
                )}
              </div>
              <div className="text-center shrink-0">
                <p className="text-[8px] font-mono text-emerald-400 font-bold uppercase tracking-wider">Fala ↑ +8% | Escrita ↑ +12% (últimos 14 dias)</p>
              </div>
            </div>

            {/* TRACKER */}
            <div className="bg-[#0A131C] border border-[#1C2C39] rounded-2xl p-3 flex flex-col gap-1 shadow-2xl shrink-0">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-wider font-mono">DAILY GOAL / STREAK TRACKER</h3>
              <div className="flex items-center gap-3 bg-[#101D28] p-2 rounded-xl border border-[#1C2C39] shadow-inner">
                <span className="text-orange-500 text-lg">🔥</span>
                <div className="flex flex-col font-mono text-xs">
                  <span className="font-black text-white">Sequência Atual: -- dias</span>
                  <span className="text-[9px] text-slate-500 font-bold">Melhor sequência: -- dias</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* METRICAS INFERIORES */}
        <div className="grid grid-cols-3 gap-2 shrink-0">
          <div className="bg-[#0A131C] border border-[#1C2C39] rounded-2xl p-3 flex flex-col justify-between shadow-2xl">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider font-mono">{t.metasDiarias}</span>
            <div className="flex flex-col gap-0.5 mt-1">
              <span className="text-xl font-black text-cyan-400 font-mono leading-none">-- / --</span>
              <span className="text-[9px] text-slate-400 font-bold">{t.metasDiarias}</span>
            </div>
            <div className="w-full bg-[#12202C] h-1.5 rounded-full overflow-hidden mt-2">
              <div className="bg-cyan-400 h-full w-[0%]" />
            </div>
          </div>

          <div className="bg-[#0A131C] border border-[#1C2C39] rounded-2xl p-4 flex flex-col justify-between shadow-2xl">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider font-mono">CLASSROOM CORE</span>
            <div className="flex flex-col gap-0.5 mt-1">
              <span className="text-xl font-black text-purple-400 font-mono leading-none">--</span>
              <span className="text-[9px] text-slate-400 font-bold">{t.mediaFluencia}</span>
            </div>
            <div className="w-full bg-[#12202C] h-1.5 rounded-full overflow-hidden mt-2">
              <div className="bg-purple-400 h-full w-[98%]" />
            </div>
          </div>

          <div className="bg-[#0A131C] border border-[#1C2C39] border-l-4 border-l-emerald-500 rounded-2xl p-3 flex flex-col justify-between shadow-2xl">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider font-mono">FINANCIAL</span>
              <span className="text-[8px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-black px-1.5 py-0.5 rounded shadow-sm">Ok</span>
            </div>
            <div className="flex flex-col mt-1 font-mono">
              <span className="text-xs font-black text-white">{formatarCOP(0)}</span>
              <span className="text-[8px] text-slate-400 font-semibold">Faturamento Center</span>
              <span className="text-[7px] text-slate-500">Histórico em dia</span>
            </div>
          </div>
        </div>
      </div>

      {/* SIDEBAR DIREITA COMPACTA */}
      <div className="w-[17.60%] bg-[#0A131C] border border-[#1C2C39] rounded-2xl p-3 flex flex-col shadow-2xl gap-3 shrink-0 min-w-[210px] h-full justify-between">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center border-b border-[#1C2C39] pb-1">
              <h2 className="text-[9px] font-black text-slate-300 uppercase tracking-wider font-mono">LIGAS POPULARES B2C</h2>
              <span className="text-[7px] bg-red-500/10 border border-red-500/30 text-red-400 font-black px-1 rounded uppercase font-sans">DEMOTION</span>
            </div>
            <div className="space-y-1 text-xs font-mono">
              <div className="flex items-center gap-1.5 bg-[#101D28] p-1.5 rounded-xl border border-[#1C2C39] shadow-inner">
                <span className="text-[8px] font-black text-amber-400">1</span>
                <span>🥇</span>
                <span className="font-bold text-slate-200 text-[10px] truncate max-w-[100px]">Aluno Teste</span>
              </div>
              <div className="flex items-center gap-1.5 p-1.5 rounded-xl">
                <span className="text-[8px] font-black text-slate-500">2</span>
                <span>👨🏽‍💼</span>
                <span className="font-bold text-slate-400 text-[10px] truncate max-w-[100px]">Aluno Teste</span>
              </div>
              <div className="flex items-center gap-1.5 p-1.5 rounded-xl">
                <span className="text-[8px] font-black text-slate-500">3</span>
                <span>👨🏽‍💼</span>
                <span className="font-bold text-slate-400 text-[10px] truncate max-w-[100px]">Aluno Teste (20+)</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center border-b border-[#1C2C39] pb-1">
              <h2 className="text-[9px] font-black text-slate-300 uppercase tracking-wider font-mono">RECURSOS</h2>
            </div>
            <div className="flex flex-col gap-1.5 text-[10px] text-slate-200 font-semibold font-mono">
              <div className="bg-[#101D28]/40 p-1.5 rounded-lg border border-[#1C2C39]/40">
                <p className="font-bold text-white leading-none font-sans text-[10px]">Avaliação de Class</p>
                <span className="text-cyan-400 text-[8px] truncate block mt-0.5 underline cursor-pointer">docs.google.com/forms/...</span>
              </div>
              <div className="bg-[#101D28]/40 p-1.5 rounded-lg border border-[#1C2C39]/40">
                <p className="font-bold text-white leading-none font-sans text-[10px]">Reprogramação de Classes</p>
                <span className="text-cyan-400 text-[8px] truncate block mt-0.5 underline cursor-pointer">calendar.app.google/...</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1 border-t border-[#1C2C39] pt-2 mt-auto">
          <h2 className="text-[9px] font-black text-slate-300 uppercase tracking-wider font-mono">BAÚ DE ERROS RECORRENTES</h2>
          <div className="text-[10px] font-mono font-bold text-orange-400 space-y-1.5 bg-[#101D28] p-2.5 rounded-xl border border-[#1C2C39] shadow-inner">
            <div className="flex justify-between"><span>Ofirina / Escritório</span><span className="text-slate-200 font-black">0.8</span></div>
            <div className="flex justify-between"><span>em reunião</span><span className="text-slate-200 font-black">1.0</span></div>
            <div className="flex justify-between"><span>fizera</span><span className="text-slate-200 font-black">1.5</span></div>
          </div>
          <button className="w-full bg-[#E2E8F0] hover:bg-white text-[#0A131C] font-black text-[10px] py-2.5 uppercase tracking-widest rounded-xl mt-2 transition-colors shadow shadow-white/10 cursor-pointer font-mono">
            {t.limparBau}
          </button>
        </div>
      </div>

    </div>
  );
}
