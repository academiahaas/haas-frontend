import { useEffect, useState } from 'react';
import React from 'react';
import { X, FileText, Loader2, CheckCircle2 } from 'lucide-react';
import { checkPendingFlagsCentral } from '@/services/centralService';

interface ModalProvaProps {
  isOpen: boolean;
  onClose: () => void;
  idioma: 'PT' | 'EN' | 'ES';
  userId?: string;
}

export const ModalProva: React.FC<ModalProvaProps> = ({
  isOpen,
  onClose,
  idioma = 'PT',
  userId,
}) => {
  const [loading, setLoading] = useState(false);
  const [examCode, setExamCode] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    async function fetchFlags() {
      setLoading(true);
      try {
        const uid = userId || (typeof window !== "undefined" && (localStorage.getItem("haas_user_id") || (window as any).activeUserId)) || undefined;
        if (!uid) { setExamCode(null); return; }
        const flags = await checkPendingFlagsCentral(uid);
        setExamCode(flags?.exame_disponivel ? "PROVA_DISPONIVEL" : null);
      } catch (err) {
        console.error('❌ [ModalProva] Erro ao buscar status de prova:', err);
        setExamCode(null);
      } finally {
        setLoading(false);
      }
    }

    fetchFlags();
  }, [isOpen, userId]);

  if (!isOpen) return null;

  const getTitle = () => {
    if (idioma === 'EN') return 'EXAM CENTER';
    if (idioma === 'ES') return 'CENTRO DE PRUEBAS';
    return 'CENTRAL DE PROVAS';
  };

  const getEmptyMessage = () => {
    if (idioma === 'EN') return 'No exam available at the moment.';
    if (idioma === 'ES') return 'Ninguna prueba disponible en este momento.';
    return 'Nenhuma prova disponível no momento.';
  };

  const getEmptySubtext = () => {
    if (idioma === 'EN') return 'Keep studying to unlock your next level exam.';
    if (idioma === 'ES') return 'Sigue estudiando para desbloquear la prueba del próximo nivel.';
    return 'Continue estudando para liberar a prova do próximo nível.';
  };

  const getReadyMessage = () => {
    if (idioma === 'EN') return 'You have a pending exam!';
    if (idioma === 'ES') return '¡Tienes una prueba pendiente!';
    return 'Você tem uma prova pendente!';
  };

  const getButtonText = () => {
    if (idioma === 'EN') return 'GO TO EXAM';
    if (idioma === 'ES') return 'IR A LA PRUEBA';
    return 'IR PARA A PROVA';
  };

  const handleGoToExam = () => {
    if (typeof window !== "undefined") {
      window.location.href = "/prova-escrita?uid=" + (userId || (typeof window !== "undefined" ? localStorage.getItem("haas_user_id") : ""));
    }
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn" onClick={onClose}>
      <div className="relative w-full max-w-lg bg-[#040a17] border border-violet-500/30 rounded-[24px] p-6 flex flex-col gap-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>

        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
            <h3 className="text-xs font-mono font-black text-violet-400 uppercase tracking-wider">
              {getTitle()}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Conteúdo */}
        {loading ? (
          <div className="flex items-center justify-center py-8 text-violet-400 gap-2">
            <Loader2 className="animate-spin" size={20} />
            <span className="text-xs font-mono">
              {idioma === 'EN' ? 'Checking exams...' : idioma === 'ES' ? 'Verificando pruebas...' : 'Verificando provas...'}
            </span>
          </div>
        ) : examCode ? (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center border border-violet-400/60 bg-gradient-to-b from-violet-400/20 to-violet-950/30 shadow-lg shadow-violet-400/10">
              <FileText size={28} className="text-violet-300" />
            </div>
            <div className="text-center">
              <p className="text-sm font-mono font-black text-white tracking-wide uppercase">
                {getReadyMessage()}
              </p>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">{examCode}</p>
            </div>
            <button
              onClick={handleGoToExam}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 text-white text-xs font-mono font-black uppercase tracking-widest transition-all active:scale-95"
            >
              {getButtonText()}
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-6 opacity-80">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center border border-slate-700 bg-slate-900 text-slate-500">
              <CheckCircle2 size={24} />
            </div>
            <div className="text-center">
              <p className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wide">
                {getEmptyMessage()}
              </p>
              <p className="text-[11px] text-slate-500 mt-1.5">{getEmptySubtext()}</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ModalProva;
