import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface ModalHorariosProps {
  isOpen: boolean;
  onClose: () => void;
  dia: string | number;
  mes: number;
  ano: number;
  modalidadeAluno: string;
  tipoFluxo: 'REGULAR' | 'REPOSICAO';
  alunoId: string;
  onSuccess: () => void;
}

interface SlotHorario {
  id: string;
  data_hora_inicio: string;
  vagas_ocupadas: number;
  vagas_maximas: number;
}

export const ModalHorariosDisponiveis: React.FC<ModalHorariosProps> = ({
  isOpen,
  onClose,
  dia,
  mes,
  ano,
  modalidadeAluno,
  tipoFluxo,
  alunoId,
  onSuccess,
}) => {
  const [horarios, setHorarios] = useState<SlotHorario[]>([]);
  const [carregando, setCarregando] = useState<boolean>(false);
  const [selecionado, setSelecionado] = useState<string | null>(null);
  const [processando, setProcessando] = useState<boolean>(false);
  const [erro, setErro] = useState<string | null>(null);

    // 1. Inscrição em Tempo Real (Realtime) + Carga Inicial
  useEffect(() => {
    console.log("=== TESTE MODAL ===", { isOpen, dia, mes, ano, modalidadeAluno });
    if (isOpen && dia && mes && ano) {
      console.log("[REALTIME] Evento recebido do banco! Recarregando horários...");
            carregarHorariosDoBanco();

      // Escuta mudanças na tabela aulas_disponiveis em tempo real
      console.log("[REALTIME] Tentando conectar ao canal aulas_disponiveis...");
      const channel = supabase
        .channel(`rt-aulas-${dia}-${mes}-${ano}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "aulas_disponiveis" },
          (payload) => {
            console.log("[REALTIME] Alteração detectada no banco:", payload);
            carregarHorariosDoBanco();
          }
        )
        .subscribe((status) => console.log("[REALTIME] Status da conexão:", status));

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isOpen, dia, mes, ano, modalidadeAluno]);

  const carregarHorariosDoBanco = async () => {
    setCarregando(true);
    setErro(null);
    try {
      const diaStr = String(dia).padStart(2, "0");
      const mesStr = String(mes).padStart(2, "0");
      
      const inicioDia = `${ano}-${mesStr}-${diaStr}T00:00:00.000Z`;
      const fimDia = `${ano}-${mesStr}-${diaStr}T23:59:59.999Z`;

      const tipoAulaBanco = (modalidadeAluno || "").toLowerCase().includes("vip") || 
                            (modalidadeAluno || "").toLowerCase().includes("particular") 
                            ? "PARTICULAR" : "GRUPO";

      const { data, error } = await supabase
        .from("aulas_disponiveis")
        .select("*")
        .gte("data_hora_inicio", inicioDia)
        .lte("data_hora_inicio", fimDia)
        .eq("tipo_aula", tipoAulaBanco)
        .eq("status", "DISPONIVEL")
        .order("data_hora_inicio", { ascending: true });

      if (error) throw error;

      const limite = tipoAulaBanco === "GRUPO" ? 8 : 1;
      const validos = (data || []).filter((h) => h.vagas_ocupadas < limite);

      setHorarios(validos);
    } catch (e: any) {
      setErro("Erro ao carregar horários disponíveis.");
    } finally {
      setCarregando(false);
    }
  };

  const handleConfirmarAgendamento = async () => {
    if (!selecionado) return;
    setProcessando(true);
    setErro(null);

    try {
      // O banco de dados cuida da trava e da alteração do status via TRIGGER no INSERT
      const { error: errAgendamento } = await supabase
        .from("agendamentos")
        .insert({
          aluno_id: alunoId,
          aula_id: selecionado,
          tipo_fluxo: tipoFluxo,
        });

      if (errAgendamento) {
        throw new Error("Este horário acabou de ser preenchido por outro aluno.");
      }

      onSuccess();
      onClose();
    } catch (e: any) {
      setErro(e.message || "Falha ao confirmar o agendamento.");
      carregarHorariosDoBanco();
    } finally {
      setProcessando(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#06b6d4' }}>
            HORARIOS DISPONIBLES ({dia}/{mes}/{ano})
          </h3>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        {erro && <div style={styles.erroBox}>{erro}</div>}

        {carregando ? (
          <p style={styles.textoInfo}>Buscando horários reais no banco...</p>
        ) : horarios.length === 0 ? (
          <p style={styles.textoInfo}>Nenhum horário disponível para esta data.</p>
        ) : (
          <div style={styles.gridHorarios}>
            {horarios.map((slot) => {
              const hora = new Date(slot.data_hora_inicio).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });
              const isSelected = selecionado === slot.id;

              return (
                <button
                  key={slot.id}
                  onClick={() => setSelecionado(slot.id)}
                  style={{
                    ...styles.slotCard,
                    ...(isSelected ? styles.slotCardActive : {}),
                  }}
                >
                  <span style={styles.horaTexto}>{hora}</span>
                  <small style={styles.vagasTexto}>
                    {slot.vagas_maximas > 1
                      ? `${slot.vagas_maximas - slot.vagas_ocupadas} vagas`
                      : 'Disponível'}
                  </small>
                </button>
              );
            })}
          </div>
        )}

        <div style={styles.footer}>
          <button
            onClick={handleConfirmarAgendamento}
            disabled={!selecionado || processando}
            style={{
              ...styles.btnConfirmar,
              ...(!selecionado || processando ? styles.btnDisabled : {}),
            }}
          >
            {processando ? 'PROCESSANDO...' : 'CONFIRMAR AGENDAMENTO'}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999,
  },
  modal: {
    backgroundColor: '#070d19',
    color: '#ffffff',
    borderRadius: '16px',
    padding: '20px',
    width: '90%',
    maxWidth: '400px',
    border: '1px solid rgba(6, 182, 212, 0.3)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    fontSize: '20px',
    cursor: 'pointer',
  },
  erroBox: {
    backgroundColor: '#7f1d1d',
    color: '#fca5a5',
    padding: '8px 12px',
    borderRadius: '8px',
    marginBottom: '12px',
    fontSize: '13px',
  },
  textoInfo: {
    textAlign: 'center',
    color: '#94a3b8',
    margin: '20px 0',
    fontSize: '14px',
  },
  gridHorarios: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
    maxHeight: '260px',
    overflowY: 'auto',
    marginBottom: '16px',
  },
  slotCard: {
    backgroundColor: '#0f172a',
    border: '1px solid #1e293b',
    borderRadius: '10px',
    padding: '10px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    cursor: 'pointer',
    color: '#ffffff',
  },
  slotCardActive: {
    borderColor: '#06b6d4',
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
  },
  horaTexto: {
    fontWeight: 'bold',
    fontSize: '15px',
  },
  vagasTexto: {
    fontSize: '11px',
    color: '#94a3b8',
  },
  footer: {
    display: 'flex',
    justifyContent: 'center',
  },
  btnConfirmar: {
    width: '100%',
    backgroundColor: '#06b6d4',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    padding: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  btnDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
};
