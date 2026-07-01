"use client";

interface RobozinhoMascoteArenaProps {
  comboCount: number; // Quantos acertos seguidos o aluno tem agora
}

export default function RobozinhoMascoteArena({ comboCount = 0 }: RobozinhoMascoteArenaProps) {
  const isComboAtivo = comboCount >= 5;

  return (
    <div className={`w-full rounded-2xl p-5 border transition-all duration-500 relative overflow-hidden ${
      isComboAtivo 
        ? "bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-orange-500/40 shadow-[0_0_25px_rgba(245,158,11,0.15)] animate-pulse" 
        : "bg-slate-900/40 border-white/5"
    }`}>
      
      {/* Efeito de linhas de energia se o Combo estiver ativo */}
      {isComboAtivo && (
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(245,158,11,0.05)_1px,transparent_1px)] bg-[size:16px] opacity-30" />
      )}

      <div className="flex items-center gap-4 relative z-10">
        {/* AVATAR DO ROBOZINHO COMBO */}
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl transition-transform duration-300 ${
          isComboAtivo ? "bg-orange-500 text-black scale-110 rotate-3" : "bg-white/5 text-slate-400"
        }`}>
          {isComboAtivo ? "🤖🔥" : "🤖"}
        </div>

        {/* CONTEÚDO E REGRAS DO ROBOZINHO */}
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[9px] font-mono tracking-widest text-slate-500 uppercase font-bold">
              // Assistente Haas Arena
            </span>

            {/* Contador de sequência de fogo */}
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
              comboCount > 0 ? "bg-orange-500/10 text-orange-400" : "bg-white/5 text-slate-600"
            }`}>
              🔥 {comboCount} {comboCount === 1 ? "acerto" : "acertos"}
            </span>
          </div>

          {/* Anúncio Dinâmico do Robozinho */}
          {isComboAtivo ? (
            <div>
              <h4 className="text-xs font-mono font-bold text-orange-400 uppercase tracking-wider animate-bounce mb-0.5">
                ⚡ COMBO ATIVADO! ⚡
              </h4>
              <p className="text-xs text-slate-200 leading-relaxed">
                "Sensacional, Alpha! Você desbloqueou o modo de ultra performance. Cada acerto agora concede <span className="text-amber-400 font-bold">+5 XP Bônus</span> diretamente para o seu saldo!"
              </p>
            </div>
          ) : (
            <div>
              <h4 className="text-xs font-bold text-slate-300 tracking-tight mb-0.5">
                Mantendo o Ritmo Clínica
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {comboCount === 0 
                  ? '"Pronto para a rodada? Acerte 5 questões seguidas para ativar o multiplicador de Combo do robô e disparar no ranking!"'
                  : `"Muito bem! Mais ${5 - comboCount} acertos consecutivos e eu ativo o seu bônus de Combo corporativo."`
                }
              </p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
