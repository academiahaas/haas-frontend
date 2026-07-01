"use client";

interface ErroItem {
  topico: string;
  categoria: "Gramática" | "Vocabulário";
  frequencia: number;
}

interface ErrosFrequentesProps {
  erroAlto?: ErroItem;
  erroMedio?: ErroItem;
}

export default function ErrosFrequentes({ erroAlto, erroMedio }: ErrosFrequentesProps) {
  // Dados padrão dinâmicos caso o aluno ainda não tenha histórico de erros no banco
  const defaultAlto: ErroItem = erroAlto || {
    topico: "Voz Passiva para Logs de Erro",
    categoria: "Gramática",
    frequencia: 8
  };

  const defaultMedio: ErroItem = erroMedio || {
    topico: "Gerenciamento de Threads Paralelas",
    categoria: "Vocabulário",
    frequencia: 4
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 mt-6">
      <h3 className="text-xs font-mono tracking-widest text-slate-400 uppercase mb-4">
        // Diagnóstico de Falhas Recorrentes
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* CARD DA ESQUERDA: ERRO FREQUENTE ALTO */}
        <div className="bg-black/20 border border-rose-500/10 rounded-xl p-5 flex flex-col justify-between hover:border-rose-500/30 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 px-2.5 py-1 rounded">
              ⚠️ Frequência: Alta
            </span>
            <span className="text-[10px] font-mono text-slate-500 uppercase">
              {defaultAlto.categoria}
            </span>
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-100 tracking-tight mb-1">
              {defaultAlto.topico}
            </h4>
            <p className="text-xs text-slate-400 font-mono">
              Detectado em {defaultAlto.frequencia} submissões com falha nesta semana.
            </p>
          </div>
        </div>

        {/* CARD DA DIREITA: ERRO FREQUENTE MÉDIO */}
        <div className="bg-black/20 border border-amber-500/10 rounded-xl p-5 flex flex-col justify-between hover:border-amber-500/30 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded">
              ⚡ Frequência: Média
            </span>
            <span className="text-[10px] font-mono text-slate-500 uppercase">
              {defaultMedio.categoria}
            </span>
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-100 tracking-tight mb-1">
              {defaultMedio.topico}
            </h4>
            <p className="text-xs text-slate-400 font-mono">
              Detectado em {defaultMedio.frequencia} submissões com falha nesta semana.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
