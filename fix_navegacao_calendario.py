import os

path = "./src/app/portal-aluno/components/PortalMobile.tsx"
conteudo = open(path, "r", encoding="utf-8").read()

# 1. Ajusta o componente no topo para aceitar qualquer tipo na prop e limpa erros de build
assinatura_velha = "function MiniCalendarioSemanal({ setAbaAtiva }: { setAbaAtiva: (aba: string) => void }) {"
assinatura_velha_js = "function MiniCalendarioSemanal({ setAbaAtiva }) {"

componente_correto = """function MiniCalendarioSemanal({ setAbaAtiva, setEtapaAgendamento }: { setAbaAtiva: any, setEtapaAgendamento: any }) {
  const diasDaSemana = [
    { id: 1, label: 'S' },
    { id: 2, label: 'T' },
    { id: 3, label: 'Q' },
    { id: 4, label: 'Q' },
    { id: 5, label: 'S' },
    { id: 6, label: 'S' },
    { id: 7, label: 'D' }
  ];

  const diasComAula = [2, 4]; 
  const hoje = new Date();
  const diaSemanaAtual = hoje.getDay() === 0 ? 7 : hoje.getDay();
  
  return (
    <div className="w-full bg-[#070d19]/40 border border-white/[0.03] pt-1.5 pb-2 px-2.5 rounded-xl flex flex-col gap-1 shrink-0">
      <span className="text-[8px] font-mono font-black uppercase text-slate-400 tracking-wider">📅 Aulas Confirmadas na Semana</span>
      <div className="flex justify-between items-center gap-1.5">
        {diasDaSemana.map((dia) => {
          const temAula = diasComAula.includes(dia.id);
          const diferenca = dia.id - diaSemanaAtual;
          const dataAlvo = new Date(hoje);
          dataAlvo.setDate(hoje.getDate() + diferenca);
          const numeroDia = dataAlvo.getDate();

          return (
            <div 
              key={dia.id} 
              onClick={() => { setEtapaAgendamento(0); setAbaAtiva('agenda'); }}
              className="flex flex-col items-center flex-1 min-w-0 cursor-pointer active:scale-95 select-none transition-all hover:opacity-80"
            >
              <span className="text-[7px] font-bold text-slate-500 mb-0.5">{dia.label}</span>
              <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-mono font-black transition-all ${
                temAula 
                  ? 'bg-cyan-500/10 border border-cyan-400/40 text-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.1)]' 
                  : 'bg-black/20 border border-white/[0.02] text-slate-400'
              }`}>
                {numeroDia}
              </div>
              {temAula && <div className="w-1 h-1 bg-cyan-400 rounded-full mt-0.5 opacity-80" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}"""

# Substitui o bloco de declaração antigo pelo correto com reset de etapa e tipagem flexível
if assinatura_velha in conteudo:
    conteudo = conteudo.split("function MiniCalendarioSemanal")[0] + componente_correto + conteudo.split("function MiniCalendarioSemanal")[1].split("function MascoteRoboAI")[1]
    conteudo = "function MascoteRoboAI" + conteudo.split("function MascoteRoboAI")[1]
elif assinatura_velha_js in conteudo:
    # Caso estivesse na versão JS sem o tipo explícito
    partes = conteudo.split("function MiniCalendarioSemanal")
    resto_do_arquivo = partes[1].split("function MascoteRoboAI")
    conteudo = partes[0] + componente_correto + "\n\nfunction MascoteRoboAI" + resto_do_arquivo[1]

# 2. Atualiza a chamada do componente passando também a função setEtapaAgendamento
chamada_antiga = "<MiniCalendarioSemanal setAbaAtiva={setAbaAtiva} />"
chamada_nova   = "<MiniCalendarioSemanal setAbaAtiva={setAbaAtiva} setEtapaAgendamento={setEtapaAgendamento} />"
conteudo = conteudo.replace(chamada_antiga, llamada_nova)

open(path, "w", encoding="utf-8").write(conteudo)
print("✅ Chamada e evento corrigidos com injeção de estados.")
