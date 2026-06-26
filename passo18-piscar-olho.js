const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/portal-aluno/page.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Reescrever a função MascoteRoboAI para aceitar e reagir à propriedade 'devePiscar'
const funcaoMascoteAntiga = `function MascoteRoboAI() {
  return (
    <div className="relative flex flex-col items-center justify-center p-2 bg-[#1A1C1E] rounded-2xl border border-cyan-500/20 shadow-md animate-ai-mascot-pulse w-20 h-20 shrink-0">
      <svg viewBox="0 0 64 64" className="w-12 h-12 text-slate-400" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Orelhas de Coelho Tecnológico */}
        <path d="M18 22C18 12 22 6 22 6C22 6 26 12 26 22" stroke="#64748B" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M38 22C38 12 42 6 42 6C42 6 46 12 46 22" stroke="#64748B" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
        {/* Interior das Orelhas Brilhando em Ciano */}
        <path d="M22 18C22 14 23 10 23 10" stroke="#00D4FF" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M42 18C42 14 43 10 43 10" stroke="#00D4FF" strokeWidth="1.5" strokeLinecap="round"/>
        {/* Cabeça do Robô */}
        <rect x="14" y="22" width="36" height="30" rx="10" fill="#2E3238" stroke="#475569" strokeWidth="3"/>
        {/* Olhos Ciano Neon */}
        <circle cx="25" cy="34" r="3.5" fill="#00D4FF" className="animate-pulse"/>
        <circle cx="39" cy="34" r="3.5" fill="#00D4FF" className="animate-pulse"/>
        {/* Headset/Fones Laterais */}
        <path d="M11 30V40C11 41.5 12 43 13.5 43" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round"/>
        <path d="M53 30V40C53 41.5 52 43 50.5 43" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round"/>
        {/* Grelha de Voz / Detalhe na Boca */}
        <path d="M28 42H36" stroke="#64748B" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      <span className="text-[7px] font-black font-mono text-cyan-400 mt-1 tracking-wider">AI CO-PILOT</span>
    </div>
  );
}`;

const funcaoMascoteNova = `function MascoteRoboAI({ devePiscar = false }) {
  return (
    <div className="relative flex flex-col items-center justify-center p-2 bg-[#1A1C1E] rounded-2xl border border-cyan-500/20 shadow-md animate-ai-mascot-pulse w-20 h-20 shrink-0">
      <svg viewBox="0 0 64 64" className="w-12 h-12 text-slate-400" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Orelhas de Coelho Tecnológico */}
        <path d="M18 22C18 12 22 6 22 6C22 6 26 12 26 22" stroke="#64748B" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M38 22C38 12 42 6 42 6C42 6 46 12 46 22" stroke="#64748B" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
        {/* Interior das Orelhas Brilhando em Ciano */}
        <path d="M22 18C22 14 23 10 23 10" stroke="#00D4FF" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M42 18C42 14 43 10 43 10" stroke="#00D4FF" strokeWidth="1.5" strokeLinecap="round"/>
        {/* Cabeça do Robô */}
        <rect x="14" y="22" width="36" height="30" rx="10" fill="#2E3238" stroke="#475569" strokeWidth="3"/>
        {/* Olho Esquerdo: Sempre Aberto */}
        <circle cx="25" cy="34" r="3.5" fill="#00D4FF" />
        {/* Olho Direito: Abre e Fecha dinamicamente no clique */}
        {devePiscar ? (
          <path d="M35.5 34H42.5" stroke="#00D4FF" strokeWidth="2.5" strokeLinecap="round" />
        ) : (
          <circle cx="39" cy="34" r="3.5" fill="#00D4FF" />
        )}
        {/* Headset/Fones Laterais */}
        <path d="M11 30V40C11 41.5 12 43 13.5 43" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round"/>
        <path d="M53 30V40C53 41.5 52 43 50.5 43" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round"/>
        {/* Grelha de Voz / Detalhe na Boca */}
        <path d="M28 42H36" stroke="#64748B" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      <span className="text-[7px] font-black font-mono text-cyan-400 mt-1 tracking-wider">AI CO-PILOT</span>
    </div>
  );
}`;

code = code.replace(funcaoMascoteAntiga, funcaoMascoteNova);

// 2. Renomear o estado antigo de "isBotJumping" para "isBotWinking" e mudar o temporizador
code = code.replace("const [isBotJumping, setIsBotJumping] = useState(false);", "const [isBotWinking, setIsBotWinking] = useState(false);");
code = code.replace("if (isBotJumping) return;", "if (isBotWinking) return;");
code = code.replace("setIsBotJumping(true);", "setIsBotWinking(true);");
code = code.replace("setTimeout(() => setIsBotJumping(false), 300);", "setTimeout(() => setIsBotWinking(false), 300);");

// 3. Atualizar a tag de exibição do robô para remover classes de pulo e passar a prop "devePiscar"
const renderizacaoRoboAntiga = `className={\`flex items-center gap-3 cursor-pointer select-none transition-transform duration-300 active:scale-95 \${isBotJumping ? '-translate-y-2' : ''}\`}
                  title="Clique para falar com o Co-Pilot"
                >
                  {/* Balão de fala com animação de escala suave na entrada */}
                  <div className="relative bg-slate-900 text-cyan-400 font-mono text-[10px] font-bold p-3 rounded-2xl border border-cyan-500/30 shadow-lg max-w-[240px] leading-relaxed transition-all duration-300 scale-100 hover:border-cyan-400/50">
                    {obterConselhoIA()}
                    {/* Seta indicativa perfeita */}
                    <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[6px] border-l-slate-900"></div>
                  </div>
                  
                  {/* Container do Mascote */}
                  <div className="transition-transform duration-200">
                    <MascoteRoboAI />
                  </div>`;

const renderizacaoRoboNova = `className="flex items-center gap-3 cursor-pointer select-none transition-all duration-200 active:scale-98"
                  title="Clique para falar com o Co-Pilot"
                >
                  {/* Balão de fala - Fixo, confortável, sem piscar e com animação suave de entrada */}
                  <div className="relative bg-slate-900 text-cyan-400 font-mono text-[10px] font-bold p-3 rounded-2xl border border-cyan-500/30 shadow-lg max-w-[240px] leading-relaxed transition-all duration-300 scale-100 hover:border-cyan-400/50 animate-fade-in">
                    {obterConselhoIA()}
                    {/* Seta indicativa perfeita */}
                    <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[6px] border-l-slate-900"></div>
                  </div>
                  
                  {/* Container do Mascote com controle de piscar de olhos */}
                  <div className="transition-transform duration-200">
                    <MascoteRoboAI devePiscar={isBotWinking} />
                  </div>`;

code = code.replace(renderizacaoRoboAntiga, renderizacaoRoboNova);

fs.writeFileSync(filePath, code, 'utf8');
console.log('🎉 Microanimação do piscar de olhos configurada com sucesso!');
