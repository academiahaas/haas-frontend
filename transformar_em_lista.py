import os

path = "./src/app/portal-aluno/components/PortalMobile.tsx"
conteudo = open(path, "r", encoding="utf-8").read()

# Bloco completo da Etapa 2 antigo que vamos substituir
# Vamos mirar desde a abertura do bloco mensal até o final dele
estrutura_antiga_calendario = """                  {/* GRADE MENSAL DINÂMICA */} 
                  <div className="w-full max-w-md mx-auto bg-slate-900/40 border border-white/[0.03] p-2.5 rounded-xl flex flex-col gap-1.5 mt-0.5">"""

# Como mudamos o cabeçalho e a div para max-w-md nas rodadas anteriores,
# vamos reescrever o miolo transformando-o em uma lista rolável elegante.

# Vamos buscar a renderização dos dias e injetar a lista limpa
# baseada nos dias de Junho disponíveis (do dia 18 ao 25)

lista_cards_html = """                  {/* LISTA VERTICAL DE DIAS (ESTILO GOOGLE CALENDAR) */}
                  <div className="w-full flex-1 overflow-y-auto pr-1 flex flex-col gap-2 mt-2 max-h-[340px]">
                    {mesAgendamento === 6 ? (
                      # Filtrando apenas dias válidos de junho para exibição em lista (Ex: 18 a 30)
                      ['18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30'].map((d) => {
                        const isSelected = diaSelecionado === d;
                        const numDia = parseInt(d);
                        
                        # Descobrir o dia da semana de forma simples para o layout
                        # Junho de 2026 começa numa segunda-feira (1=SEG, 18=QUI)
                        dias_semana = {18: 'QUI', 19: 'SEX', 20: 'SÁB', 21: 'DOM', 22: 'SEG', 23: 'TER', 24: 'QUA', 25: 'QUI', 26: 'SEX', 27: 'SÁB', 28: 'DOM', 29: 'SEG', 30: 'TER'}
                        const diaSemana = dias_semana[numDia] || 'SESSÃO';

                        return (
                          <div 
                            key={d}
                            onClick={() => setDiaSelecionado(d)}
                            className={`w-full p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer active:scale-[0.99] ${
                              isSelected 
                                ? 'bg-cyan-500/10 border-cyan-500 shadow-lg shadow-cyan-500/5 text-white' 
                                : 'bg-slate-900/40 border-white/[0.04] hover:bg-slate-900/60 text-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center font-mono ${isSelected ? 'bg-cyan-500 text-black font-black' : 'bg-slate-800 text-slate-300'}`}>
                                <span className="text-xs font-bold leading-none">{d}</span>
                                <span className="text-[8px] uppercase tracking-wider opacity-80 mt-0.5">{diaSemana}</span>
                              </div>
                              <div>
                                <p className="text-xs font-bold font-mono">Junho 2026</p>
                                <p className="text-[10px] text-slate-400">Vagas disponíveis para este dia</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {isSelected && (
                                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                              )}
                              <span className={`text-[10px] font-mono uppercase font-bold tracking-wider ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`}>
                                {isSelected ? 'Selecionado' : 'Selecionar'}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      # Julho
                      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'].map((d) => {
                        const isSelected = diaSelecionado === d;
                        return (
                          <div 
                            key={d}
                            onClick={() => setDiaSelecionado(d)}
                            className={`w-full p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                              isSelected ? 'bg-cyan-500/10 border-cyan-500 text-white' : 'bg-slate-900/40 border-white/[0.04] text-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center font-mono ${isSelected ? 'bg-cyan-500 text-black font-black' : 'bg-slate-800 text-slate-300'}`}>
                                <span className="text-xs font-bold leading-none">{d}</span>
                                <span className="text-[8px] uppercase mt-0.5">MÊS</span>
                              </div>
                              <div>
                                <p className="text-xs font-bold font-mono">Julho 2026</p>
                              </div>
                            </div>
                            <span className="text-[10px] font-mono text-slate-500">Selecionar</span>
                          </div>
                        );
                      })
                    )}
                  </div>"""

# Nota: Como o arquivo original tem uma lógica de mapeamento complexa, 
# vamos rodar uma substituição direta e simplificada do miolo para você ver o comportamento na tela.
