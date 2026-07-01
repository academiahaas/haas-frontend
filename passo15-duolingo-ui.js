const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/portal-aluno/page.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Encontrar o MascoteRoboAI antigo e embutir o Balão de Fala Dinâmico Estilo Duolingo
const layoutMascoteAntigo = '{"\\/* INJEÇÃO DO COMPONENTE SVG SEGURO *\\/"}\\s*<MascoteRoboAI \\/>';
const layoutMascoteNovo = `{/* MÓDULO MASCOTE + BALÃO DE FALA ESTILO DUOLINGO */}
                <div className="flex items-center gap-3 max-w-[60%] sm:max-w-[50%] self-end">
                  {/* Balão de diálogo inteligente */}
                  <div className="relative bg-slate-900 text-cyan-400 font-mono text-[10px] font-bold p-3 rounded-2xl border border-cyan-500/30 shadow-lg animate-fade-in leading-relaxed">
                    {t.botSpeech}
                    {/* Seta do balão apontando para o robô */}
                    <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[6px] border-l-slate-900"></div>
                  </div>
                  <MascoteRoboAI />
                </div>`;

// Fazer a substituição usando regex resiliente a espaços e quebras de linha
code = code.replace(new RegExp(layoutMascoteAntigo, 'g'), layoutMascoteNovo);

// 2. Localizar o cabeçalho da maestria e embutir a BARRA DE PROGRESSO FÍSICA REAL embaixo
const blocoMaestriaAntigo = `<span>{t.mastery}</span>
                <span className="text-[#A13400] tracking-wide">{t.toNext || '35% PARA O PRÓXIMO BADGE'}</span>
              </div>`;

const blocoMaestriaNovo = `<span>{t.mastery}</span>
                <span className="text-[#A13400] tracking-wide">{t.toNext || '35% PARA O PRÓXIMO BADGE'}</span>
              </div>
              {/* BARRA DE PROGRESSO FÍSICA PREMIUM ESTILO DUOLINGO */}
              <div className="w-full h-3.5 bg-slate-950/10 rounded-full overflow-hidden p-[2px] border border-black/5 shadow-inner mb-4">
                <div 
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.2)] transition-all duration-1000 relative overflow-hidden"
                  style={{ width: '65%' }}
                >
                  {/* Brilho reflexivo premium para efeito 3D real */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent h-[40%]"></div>
                </div>
              </div>`;

code = code.replace(blocoMaestriaAntigo, blocoMaestriaNovo);

fs.writeFileSync(filePath, code, 'utf8');
console.log('🎉 Interface Duolingo (Balão do Robô + Barra Física) aplicada com sucesso!');
