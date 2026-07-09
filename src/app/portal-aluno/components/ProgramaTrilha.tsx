'use client';
import { supabase } from '@/lib/supabase';
import React, { useState, useEffect } from 'react';
import { ChevronDown, Lock, CheckCircle2, PlayCircle } from 'lucide-react';

interface ProgramaTrilhaProps {
  idiomaAtivo: 'PT' | 'EN' | 'ES';
  aoAbrirArena?: () => void;
}

export default function ProgramaTrilha({ idiomaAtivo, aoAbrirArena }: ProgramaTrilhaProps) {
  const moduloAtualId = '3'; 
  const modulosConcluidosIds = ['1', '2']; 

  const [fasesFicticias, setFasesFicticias] = useState([
    { id: '1', numero: '01', titulo_pt: 'Fundamentos de Liderança Executiva', titulo_en: 'Executive Leadership Fundamentals' },
    { id: '2', numero: '02', titulo_pt: 'Gestão de Crise e Tomada de Decisão', titulo_en: 'Crisis Management & Decision Making' },
    { id: '3', numero: '03', titulo_pt: 'Estratégia e Escala de Negócios C-Level', titulo_en: 'C-Level Business Strategy & Scale' },
    { id: '4', numero: '04', titulo_pt: 'Fusões, Aquisições e Governança (M&A)', titulo_en: 'Mergers, Acquisitions & Governance (M&A)' }
  ]);

  const [missoesFicticias, setMissoesFicticias] = useState([
    { id: 'a', fase_id: '1', titulo_pt: 'Alinhamento de Cultura Executiva', titulo_en: 'Executive Culture Alignment', duracao: '15 min' },
    { id: 'b', fase_id: '1', titulo_pt: 'Comunicação de Alto Impacto', titulo_en: 'High-Impact Communication', duracao: '20 min' },
    { id: 'c', fase_id: '1', titulo_pt: 'Simulado Prático: O Primeiro Dia', duracao: '10 min' },
    { id: 'd', fase_id: '2', titulo_pt: 'Mitigação de Riscos Operacionais', titulo_en: 'Operational Risk Mitigation', duracao: '18 min' },
    { id: 'e', fase_id: '2', titulo_pt: 'Análise de Cenários Macroeconômicos', titulo_en: 'Macroeconomic Scenario Analysis', duracao: '25 min' },
    { id: 'f', fase_id: '3', titulo_pt: 'Modelagem de Equity e Partnerships', titulo_en: 'Equity Modeling & Partnerships', duracao: '30 min' },
    { id: 'g', fase_id: '3', titulo_pt: 'Desafio Final Mestre HAAS', duracao: '15 min' },
    { id: 'h', fase_id: '4', titulo_pt: 'Valuation Avançado de Empresas', titulo_en: 'Advanced Corporate Valuation', duracao: '45 min' }
  ]);

  const [moduloAberto, setModuloAberto] = useState<string | null>(moduloAtualId);
  const [realModuloAtual, setRealModuloAtual] = useState<string>(moduloAtualId);
  const [realConcluidos, setRealConcluidos] = useState<string[]>(modulosConcluidosIds);

  useEffect(() => {
    async function synchPedagogicalTrack() {
      try {
        // Busca a sessão ativa do aluno diretamente do cliente global
        const { data: { session } } = await supabase.auth.getSession();
        const currentUserId = session?.user?.id;
        if (!currentUserId) return;

        // 1. Coleta os metadados do aluno para identificar o seu current_level
        const { data: userData } = await supabase.from('users').select('current_level').eq('id', currentUserId).single();
        const levelTag = userData?.current_level || 'A1';

        // 2. Coleta o progresso real de unidades concluídas
        const { data: progressData } = await supabase.from('user_unit_progress').select('unit_id').eq('user_id', currentUserId);
        const concludedUnitIds = progressData?.map(p => String(p.unit_id)) || [];

        // 3. Coleta os módulos reais correspondentes ao nível do aluno
        const { data: dbModules } = await supabase.from('modules_content').select('*').eq('level_tag', levelTag).order('module_number', { ascending: true });
        
        if (dbModules && dbModules.length > 0) {
          const mappedFases = dbModules.map(m => ({
            id: String(m.id),
            numero: String(m.module_number).padStart(2, '0'),
            titulo_pt: m.module_title || '',
            titulo_en: m.module_title || ''
          }));
          setFasesFicticias(mappedFases);

          // 4. Coleta as unidades vinculadas aos módulos carregados
          const moduleIds = dbModules.map(m => m.id);
          const { data: dbUnits } = await supabase.from('units').select('*').in('module_id', moduleIds).order('unit_number', { ascending: true });

          if (dbUnits) {
            const mappedMissoes = dbUnits.map(u => ({
              id: String(u.id),
              fase_id: String(u.module_id),
              titulo_pt: u.unit_title || '',
              titulo_en: u.unit_title || '',
              // A duração em minutos dinâmica simulada em string respeitando o layout padrão fixo
              duracao: `${u.unit_number * 5 + 10} min`
            }));
            setMissoesFicticias(mappedMissoes);

            // 5. Encontra dinamicamente a posição do marcador atual (Amarelo)
            let foundCurrentModuleId = String(dbModules[0].id);
            let finishedModuleIds: string[] = [];

            for (const mod of dbModules) {
              const unitsOfModule = dbUnits.filter(u => u.module_id === mod.id);
              const allDone = unitsOfModule.length > 0 && unitsOfModule.every(u => concludedUnitIds.includes(String(u.id)));
              
              if (allDone) {
                finishedModuleIds.push(String(mod.id));
              } else {
                foundCurrentModuleId = String(mod.id);
                break;
              }
            }

            setRealModuloAtual(foundCurrentModuleId);
            setRealConcluidos(finishedModuleIds);
            setModuloAberto(foundCurrentModuleId);
          }
        }
      } catch (e) {
        console.error("Erro na carga de sincronismo invisível:", e);
      }
    }
    synchPedagogicalTrack();
  }, []);

  const somCliquePremium = () => {
    return; // 🔒 DASHBOARD MUTADO
    if (typeof window === 'undefined') return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine'; osc.frequency.setValueAtTime(160, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.04);
    } catch (e) { console.log(e); }
  };

  const tratarCliqueMissao = (bloqueado: boolean) => {
    if (bloqueado) return;
    somCliquePremium();
    if (aoAbrirArena) aoAbrirArena();
  };

  return (
    <div className="w-full flex flex-col gap-3 font-sans pb-4">
      {fasesFicticias.map((fase) => {
        const isOpen = moduloAberto === fase.id;
        const minhasMissoes = missoesFicticias.filter(m => m.fase_id === fase.id);
        
        const isConcluido = realConcluidos.includes(fase.id);
        const isAtual = fase.id === realModuloAtual;
        const isBloqueado = !isConcluido && !isAtual;

        let cardStyle = "border-white/[0.04] bg-[#07111e]/90";
        let tagColor = "text-slate-500";

        if (isAtual) {
          cardStyle = "border-amber-500/30 bg-[#0a1424] shadow-lg";
          tagColor = "text-amber-500";
        } else if (isConcluido) {
          cardStyle = "border-emerald-500/10 bg-[#050d18] opacity-75";
          tagColor = "text-emerald-500";
        } else if (isBloqueado) {
          cardStyle = "border-white/[0.02] bg-[#030914] opacity-40";
          tagColor = "text-slate-600";
        }

        const textoModulo = idiomaAtivo === 'EN' ? 'MODULE' : 'MÓDULO';

        let statusTag = '';
        if (isConcluido) statusTag = ` • ${idiomaAtivo === 'PT' ? 'CONCLUÍDO' : idiomaAtivo === 'ES' ? 'CONCLUIDO' : 'COMPLETED'}`;
        if (isAtual) statusTag = ` • ${idiomaAtivo === 'PT' ? 'ATUAL' : idiomaAtivo === 'ES' ? 'ACTUAL' : 'CURRENT'}`;

        let textoBotaoLateral = '';
        if (isConcluido) textoBotaoLateral = idiomaAtivo === 'PT' ? 'REVER' : idiomaAtivo === 'ES' ? 'REVISAR' : 'REVIEW';
        else if (isAtual) textoBotaoLateral = idiomaAtivo === 'PT' ? 'INICIAR' : idiomaAtivo === 'ES' ? 'INICIAR' : 'START';
        else textoBotaoLateral = idiomaAtivo === 'PT' ? 'BLOQUEADO' : idiomaAtivo === 'ES' ? 'BLOQUEADO' : 'LOCKED';

        return (
          <div key={fase.id} className={`border transition-all duration-300 rounded-xl overflow-hidden ${cardStyle}`}>
            
            <div 
              onClick={() => setModuloAberto(isOpen ? null : fase.id)}
              className="w-full flex items-center justify-between p-4 text-left select-none cursor-pointer hover:bg-white/[0.01] transition-colors"
            >
              <div className="flex flex-col flex-1">
                <span className={`text-[9px] font-black font-mono uppercase tracking-wider ${tagColor}`}>
                  {textoModulo} {fase.numero}{statusTag}
                </span>
                <h3 className={`text-xs font-bold mt-0.5 ${isBloqueado ? 'text-slate-500' : 'text-slate-200'}`}>
                  {idiomaAtivo === 'PT' ? fase.titulo_pt : fase.titulo_en}
                </h3>
              </div>
              <div className="p-1 ml-2">
                <ChevronDown className={`transition-transform duration-300 ${isAtual ? 'text-amber-500' : isConcluido ? 'text-emerald-500' : 'text-slate-600'} ${isOpen ? 'rotate-180' : ''}`} size={14} />
              </div>
            </div>

            {/* CAIXA DE ROLAGEM INVISÍVEL COM ALTURA DINÂMICA SEGURA PARA ATÉ 50 UNIDADES */}
            <div className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-[380px] overflow-y-auto custom-scrollbar border-t border-white/[0.04] p-3 bg-black/10' : 'max-h-0'}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {minhasMissoes.map((m) => (
                  <div 
                    key={m.id} 
                    onClick={() => tratarCliqueMissao(isBloqueado)}
                    className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                      isBloqueado 
                        ? 'bg-black/20 border-white/[0.01]' 
                        : 'bg-[#111c2e]/50 border-white/[0.04] cursor-pointer hover:bg-[#16253d]/80 hover:border-amber-500/20'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {isConcluido ? (
                        <CheckCircle2 size={11} className="text-emerald-500 shrink-0" />
                      ) : isAtual ? (
                        <PlayCircle size={11} className="text-amber-500 shrink-0" />
                      ) : (
                        <Lock size={10} className="text-slate-600 shrink-0" />
                      )}
                      
                      <div className="min-w-0">
                        <h4 className={`text-[11px] font-bold truncate ${isBloqueado ? 'text-slate-600' : 'text-slate-300'}`}>
                          {idiomaAtivo === 'PT' ? m.titulo_pt : m.titulo_en}
                        </h4>
                        {/* 🌟 APENAS A DURAÇÃO EXIBIDA DE FORMA LIMPA */}
                        <span className="text-[8px] text-slate-500 font-mono block mt-0.5">{m.duracao}</span>
                      </div>
                    </div>

                    <div className={`text-[8px] font-black font-mono border px-1.5 py-0.5 rounded ${
                      isAtual 
                        ? 'text-amber-500 border-amber-500/20 bg-amber-500/[0.02]' 
                        : isConcluido 
                        ? 'text-emerald-500 border-emerald-500/10 bg-emerald-500/[0.01]' 
                        : 'text-slate-600 border-white/5 bg-white/[0.01]'
                    }`}>
                      {textoBotaoLateral}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        );
      })}
    </div>
  );
}
