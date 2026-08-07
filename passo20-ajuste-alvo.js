const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/portal-aluno/page.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// Alvo exato detectado pelo seu grep nas linhas 151-157
const blocoAntigo = `                  <div className="relative bg-slate-900/90 text-cyan-400 font-mono text-[10px] font-bold p-2.5 rounded-xl border border-cyan-500/30 shadow-md max-w-[220px] leading-relaxed animate-pulse">
                    {t.botSpeech || '⚡ Você está indo muito bem!'}
                    {/* Seta do balão apontando para o robô */}
                    <div className="absolute right-[-5px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[5px] border-l-slate-900"></div>
                  </div>
                  <MascoteRoboAI />`;

// Substituição aplicando a mecânica Duolingo completa (conselho IA + piscar de olho no clique)
const blocoNovo = `                  {/* BALÃO FIXO CONFORTÁVEL + PISCAR DE OLHO NO CLIQUE */}
                  <div 
                    onClick={handleBotClick} 
                    className="flex items-center gap-3 cursor-pointer select-none active:scale-98"
                    title="Clique para falar com o Co-Pilot"
                  >
                    <div className="relative bg-slate-900 text-cyan-400 font-mono text-[10px] font-bold p-3 rounded-2xl border border-cyan-500/30 shadow-lg max-w-[240px] leading-relaxed animate-fade-in">
                      {obterConselhoIA()}
                      <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[6px] border-l-slate-900"></div>
                    </div>
                    <MascoteRoboAI devePiscar={isBotWinking} />
                  </div>`;

code = code.replace(blocoAntigo, blocoNovo);

fs.writeFileSync(filePath, code, 'utf8');
console.log('🔗 Fiação de comportamento do robô conectada com sucesso!');
