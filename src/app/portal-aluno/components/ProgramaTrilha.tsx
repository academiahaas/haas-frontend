'use client';
import React, { useState, useEffect } from 'react';
import { fetchCentralPortalData } from '@/services/centralService';
import { ChevronDown, Lock, CheckCircle2, PlayCircle } from 'lucide-react';

interface ProgramaTrilhaProps {
  idiomaAtivo: 'PT' | 'EN' | 'ES';
  aoAbrirArena?: () => void;
}

export default function ProgramaTrilha({ idiomaAtivo, aoAbrirArena }: ProgramaTrilhaProps) {
  const [fasesFicticias, setFasesFicticias] = useState([]);
  const [missoesFicticias, setMissoesFicticias] = useState([]);
  const [moduloAberto, setModuloAberto] = useState(null);
  const [realModuloAtual, setRealModuloAtual] = useState('');
  const [realConcluidos, setRealConcluidos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function sincronizarTrilha() {
      try {
        const dadosCentral = await fetchCentralPortalData();
        if (!dadosCentral) return;

        const { modules_content, units, unit_progress, user } = dadosCentral;
        const nivelAtualUsuario = user?.current_level ? String(user.current_level).trim().toUpperCase() : 'A1';

        if (modules_content) {
          const modulosMapeados = modules_content.map((m) => {
            const mid = m.id || '';
            return {
              id: String(mid).trim().toLowerCase(),
              numero: String(m.module_number || '').padStart(2, '0'),
              nivel: String(m.level_tag || '').trim().toUpperCase(),
              titulo_pt: m.module_title || '',
              titulo_en: m.module_title || ''
            };
          });

          const missoesMapeadas = (units || []).map((u) => {
            const rawId = u.module_id || u.module_content_id || '';
            return {
              id: String(u.id),
              modulo_id: String(rawId).trim().toLowerCase(),
              titulo_pt: u.unit_title || '',
              titulo_en: u.unit_title || '',
              duracao: u.estimated_hours ? (Number(u.estimated_hours) * 60) + ' min' : '15 min'
            };
          });

          setFasesFicticias(modulosMapeados);
          setMissoesFicticias(missoesMapeadas);

          const listagemUnidadesConcluidas = (unit_progress || []).map((p) => String(p.unit_id));
          let moduloAtivoIdentificado = '';
          let concluidosLista = [];
          let encontrouAtual = false;

          const ordemNiveis = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
          const idxNivelUsuario = ordemNiveis.indexOf(nivelAtualUsuario);

          modulosMapeados.forEach((mod) => {
            const idxNivelMod = ordemNiveis.indexOf(mod.nivel);
            const licoesDesteModulo = missoesMapeadas.filter((u) => u.modulo_id === mod.id);

            if (idxNivelMod < idxNivelUsuario) {
              concluidosLista.push(mod.id);
            } else if (idxNivelMod === idxNivelUsuario) {
              const todasConcluidas = licoesDesteModulo.length > 0 && 
                                      licoesDesteModulo.every((u) => listagemUnidadesConcluidas.includes(u.id));

              if (todasConcluidas) {
                concluidosLista.push(mod.id);
              } else if (!encontrouAtual) {
                moduloAtivoIdentificado = mod.id;
                encontrouAtual = true;
              }
            }
          });

          if (!moduloAtivoIdentificado && modulosMapeados.length > 0) {
            const modsNivel = modulosMapeados.filter((m) => m.nivel === nivelAtualUsuario);
            moduloAtivoIdentificado = modsNivel.length > 0 ? modsNivel[0].id : modulosMapeados[0].id;
          }

          setRealModuloAtual(moduloAtivoIdentificado);
          setRealConcluidos(concluidosLista);
          setModuloAberto(moduloAtivoIdentificado);
        }
      } catch (erro) {
        console.error('Erro na trilha:', erro);
      } finally {
        setCarregando(false);
      }
    }
    sincronizarTrilha();
  }, []);

  if (carregando) {
    return <div className="text-center py-10 text-amber-500 font-mono animate-pulse text-xs">SINCRONIZANDO MAPA PEDAGÓGICO...</div>;
  }

  return (
    <div className="w-full flex flex-col gap-3 pb-6">
      {fasesFicticias.map((fase) => {
        const isOpen = moduloAberto === fase.id;
        const licoesVisiveis = missoesFicticias.filter((u) => u.modulo_id === fase.id);

        const isConcluido = realConcluidos.includes(fase.id);
        const isAtual = fase.id === realModuloAtual;
        const isBloqueado = !isConcluido && !isAtual;

        let cardStyle = "border-white/[0.04] bg-[#07111e]/90";
        let tagColor = "text-slate-500";
        let badgeStyle = "border-slate-800 bg-slate-900/40 text-slate-400";

        if (isAtual) { 
          cardStyle = "border-amber-500/30 bg-[#0a1424] shadow-lg"; 
          tagColor = "text-amber-500";
          badgeStyle = "border-amber-500/20 bg-amber-500/10 text-amber-400";
        } else if (isConcluido) { 
          cardStyle = "border-emerald-500/10 bg-[#050d18] opacity-75"; 
          tagColor = "text-emerald-500";
          badgeStyle = "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
        }

        return (
          <div key={fase.id} className={"border rounded-xl transition-all duration-300 " + cardStyle}>
            <div onClick={() => setModuloAberto(isOpen ? null : fase.id)} className="p-4 flex justify-between items-center cursor-pointer select-none">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className={"text-[9px] font-black font-mono tracking-widest transition-colors duration-300 " + tagColor}>
                    MÓDULO {fase.numero} {isConcluido ? '• CONCLUÍDO' : isAtual ? '• ATUAL' : ''}
                  </span>
                  <span className={"text-[9px] font-bold px-1.5 py-0.5 rounded border transition-all duration-300 font-mono scale-[0.95] " + badgeStyle}>
                    {fase.nivel}
                  </span>
                </div>
                <h3 className={"text-xs font-bold transition-colors duration-300 " + (isBloqueado ? 'text-slate-500' : 'text-slate-200')}>
                  {idiomaAtivo === 'PT' ? fase.titulo_pt : fase.titulo_en}
                </h3>
              </div>
              <ChevronDown className={"transition-transform duration-500 ease-in-out " + (isOpen ? 'rotate-180 text-amber-500' : 'text-slate-400')} size={16} />
            </div>

            <div className={"transition-all duration-500 ease-in-out overflow-hidden " + (isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0')}>
              <div className="p-3 border-t border-white/[0.05] bg-black/20">
                <div className="flex flex-col gap-2">
                  {licoesVisiveis.length > 0 ? (
                    licoesVisiveis.map((m) => (
                      <div key={m.id} onClick={() => !isBloqueado && aoAbrirArena?.()} className={"p-4 rounded-xl border flex justify-between items-center transition-all duration-300 transform " + (isBloqueado ? 'border-white/[0.02] opacity-40 bg-black/10 select-none' : 'border-white/[0.05] bg-[#111c2e] hover:bg-[#16253d] hover:scale-[1.005] cursor-pointer')}>
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0">
                            {isConcluido ? <CheckCircle2 size={14} className="text-emerald-500" /> : isAtual ? <PlayCircle size={14} className="text-amber-500 animate-pulse" /> : <Lock size={14} className="text-slate-500" />}
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <h4 className="text-xs font-bold text-slate-200 tracking-wide">{idiomaAtivo === 'PT' ? m.titulo_pt : m.titulo_en}</h4>
                            <p className="text-[10px] text-slate-500 font-medium font-mono">{m.duracao}</p>
                          </div>
                        </div>
                        <button disabled={isBloqueado} className={"text-[9px] font-bold border px-3 py-1.5 rounded-lg font-mono tracking-wider transition-all duration-300 " + (isBloqueado ? 'border-slate-700 text-slate-500 bg-transparent' : 'border-amber-500/30 text-amber-500 bg-amber-500/[0.02] hover:bg-amber-500/10 shadow-sm')}>
                          {isBloqueado ? 'LOCK' : 'INICIAR'}
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-[10px] text-slate-500 p-2 font-mono text-center">NENHUMA UNIDADE CADASTRADA NESTE MÓDULO.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}