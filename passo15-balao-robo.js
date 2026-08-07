const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/portal-aluno/page.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// Alvo exato da linha 144 que vimos no seu grep
const alvoAntigo = '   {/* INJEÇÃO DO COMPONENTE SVG SEGURO */}\n                <MascoteRoboAI />';

// Substituição mantendo o robô no lugar e adicionando o balão de fala na esquerda dele
const alvoNovo = `   {/* INJEÇÃO DO COMPONENTE SVG SEGURO + BALÃO STYLE DUOLINGO */}
                <div className="flex items-center gap-3">
                  {/* Balão de Fala Dinâmico */}
                  <div className="relative bg-slate-900/90 text-cyan-400 font-mono text-[10px] font-bold p-2.5 rounded-xl border border-cyan-500/30 shadow-md max-w-[220px] leading-relaxed animate-pulse">
                    {t.botSpeech || '⚡ Você está indo muito bem!'}
                    {/* Seta do balão apontando para o robô */}
                    <div className="absolute right-[-5px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[5px] border-l-slate-900"></div>
                  </div>
                  <MascoteRoboAI />
                </div>`;

code = code.replace(alvoAntigo, alvoNovo);

fs.writeFileSync(filePath, code, 'utf8');
console.log('🎉 Balão estilo Duolingo acoplado ao Robô com sucesso!');
