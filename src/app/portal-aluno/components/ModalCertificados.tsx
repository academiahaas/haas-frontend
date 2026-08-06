import { useAuth } from "@/contexts/AuthContext";
import React, { useEffect, useState } from 'react';
import { X, Shield, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface CertificadoItem {
  nivel: string;
  liberado: boolean;
  url_certificado?: string | null;
}

interface ModalCertificadosProps {
  isOpen: boolean;
  onClose: () => void;
  idioma: 'PT' | 'EN' | 'ES';
  userLevel?: string;
}

export const ModalCertificados: React.FC<ModalCertificadosProps> = ({
  isOpen,
  onClose,
  idioma = 'PT',
  userLevel = 'A1'
}) => {
  const [certificados, setCertificados] = useState<Record<string, CertificadoItem>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    async function fetchCertificados() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        console.log('🔍 [Certificados] Usuário logado via Supabase Auth:', user?.id);

        // Busca sem filtro de user por enquanto caso queira debugar generalizado,
        // ou filtrando pelo user.id caso autenticado
        const userIdToQuery = user?.id;

        const { data, error } = await supabase
          .from('certificados_alunos')
          .select('nivel, liberado, url_certificado')
          .eq('user_id', userIdToQuery);

        if (error) {
          console.error('❌ [Certificados] Erro do Supabase:', error);
        } else if (data) {
          console.log('✅ [Certificados] Dados recebidos do banco:', data);
          const map: Record<string, CertificadoItem> = {};
          data.forEach((item) => {
            map[item.nivel] = item;
          });
          setCertificados(map);
        }
      } catch (err) {
        console.error('❌ [Certificados] Erro inesperado:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCertificados();
  }, [isOpen]);

  if (!isOpen) return null;

  const getTitle = () => {
    if (idioma === 'EN') return 'CERTIFICATION CENTER';
    if (idioma === 'ES') return 'CENTRO DE CERTIFICACIÓN';
    return 'CENTRAL DE CERTIFICADOS';
  };

  const getSubtitle = () => {
    if (idioma === 'EN') return 'SELECT LEVEL CERTIFICATE:';
    if (idioma === 'ES') return 'SELECCIONE EL CERTIFICADO DE NIVEL:';
    return 'SELECIONE O CERTIFICADO DE NÍVEL:';
  };

  const levels = ['A1', 'A2', 'B1', 'B2', 'C1'];

  const handleDownload = (cert?: CertificadoItem) => {
    if (cert?.url_certificado) {
      window.open(cert.url_certificado, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn" onClick={onClose}>
      <div className="relative w-full max-w-lg bg-[#040a17] border border-cyan-500/40/30 rounded-[24px] p-6 flex flex-col gap-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <h3 className="text-xs font-mono font-black text-cyan-400 uppercase tracking-wider">
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

        {/* Subtítulo Central */}
        <div className="text-center">
          <p className="text-xs font-mono font-bold text-white tracking-widest uppercase">
            {getSubtitle()}
          </p>
        </div>

        {/* Grid de Níveis */}
        {loading ? (
          <div className="flex items-center justify-center py-8 text-cyan-400 gap-2">
            <Loader2 className="animate-spin" size={20} />
            <span className="text-xs font-mono">Carregando certificados...</span>
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-3 py-2">
            {levels.map((lvl) => {
              const cert = certificados[lvl];
              const isUnlocked = cert ? cert.liberado : false;

              return (
                <div
                  key={lvl}
                  onClick={() => isUnlocked && handleDownload(cert)}
                  className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border transition-all ${
                    isUnlocked
                      ? 'border-cyan-500/40/60 bg-gradient-to-b from-amber-500/10 to-amber-950/30 shadow-lg shadow-amber-500/10 cursor-pointer hover:scale-105'
                      : 'border-white/5 bg-white/[0.02] opacity-30 grayscale cursor-not-allowed'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                    isUnlocked
                      ? 'border-amber-400 bg-amber-500/20 text-purple-300'
                      : 'border-slate-700 bg-slate-900 text-slate-500'
                  }`}>
                    <Shield size={20} />
                  </div>
                  <span className={`text-xs font-mono font-black ${isUnlocked ? 'text-purple-300' : 'text-slate-500'}`}>
                    {lvl}
                  </span>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default ModalCertificados;
