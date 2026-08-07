const fs = require('fs');
const caminho = 'src/app/portal-aluno/components/ArenaQuiz.tsx';

if (fs.existsSync(caminho)) {
  let conteudo = fs.readFileSync(caminho, 'utf8');

  // Isolamos o arquivo até o final do formulário da Mentora
  const marcadorCorte = '</form>';
  const partes = conteudo.split(marcadorCorte);
  
  if (partes.length > 1) {
    // Pegamos a primeira parte (tudo até o fim do form da mentora)
    let novaEstrutura = partes[0] + marcadorCorte + '\n\n';

    // Injetamos apenas UM par de botões novos, limpos e sem lixo comercial
    novaEstrutura += `      {/* 🚀 NOVOS BOTÕES DE SUPORTE TOTALMENTE RECONSTRUÍDOS */}
      <div className="grid grid-cols-2 gap-3 w-full shrink-0 mt-3 relative z-[10]">
        <button 
          type="button"
          onClick={() => setModalPedagogo({ aberto: true, tipo: 'TEXTO' })}
          className="w-full py-2.5 px-3 bg-[#162235] hover:bg-[#1D2D44] text-white border border-[#48627D]/30 text-[10px] font-black rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 uppercase tracking-wider select-none"
        >
          <BookOpen size={11} className="text-[#00D4FF]" />
          <span>Diretrizes Textuais</span>
        </button>

        <button 
          type="button"
          onClick={() => setModalPedagogo({ aberto: true, tipo: 'VIDEO' })}
          className="w-full py-2.5 px-3 bg-[#162235] hover:bg-[#1D2D44] text-white border border-[#48627D]/30 text-[10px] font-black rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 uppercase tracking-wider select-none"
        >
          <Video size={11} className="text-[#00D4FF]" />
          <span>Conteúdo Audiovisual</span>
        </button>
      </div>\n\n`;

    // Injetamos o rodapé padrão da Haas
    novaEstrutura += `      {/* 🚀 RODAPÉ INTEGRADO DA ARENA QUIZ PARA EQUILÍBRIO GEOMÉTRICO */}
      <div className="w-full px-8 py-3 flex justify-between items-center border-t border-amber-500/15 bg-[#0B1528] text-[10px] font-mono text-slate-500 flex-shrink-0 select-none mt-auto">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-[#22C55E] rounded-full animate-pulse" />
          <span>HAAS ENGINE V2.5.0 • SECURE REWARD SYSTEM GAMEPLAY</span>
        </div>
        <span>© 2026 HAAS LANGUAGE ACADEMY • PREMIUM GAMIFIED PLATFORM</span>
      </div>\n\n`;

    // Injetamos as tags de estilo CSS originais
    novaEstrutura += `      {/* 🚀 ESTILOS EM CSS GLOBAL INTERNO PARA ANIMAÇÕES DE COMPORTAMENTO */}
      <style jsx global>{\`
        .animate-fade-in { animation: fadeIn 200ms cubic-bezier(.2,.9,.2,1) forwards; }
        .animate-scale-up { animation: scaleUp 250ms cubic-bezier(.34,1.56,.64,1) forwards; }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUp { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      \`}</style>\n\n`;

    // Injetamos o Modal com correção definitiva de Blur (usando uma div fixa solta na raiz da tela)
    novaEstrutura += `      {/* 🚀 NOVO MODAL ABSOLUTO ANTI-CORTE DE BLUR */}
      {modalPedagogo.aberto && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setModalPedagogo({ aberto: false, tipo: null }); }} 
          className="fixed inset-0 bg-[#060E1A]/80 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in"
          style={{ zIndex: 2147483647, position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}
        >
          <div className="bg-[#162235] border border-[#48627D]/40 rounded-2xl w-full max-w-xl p-6 relative shadow-2xl text-left animate-scale-up cursor-default">
            <button 
              onClick={() => setModalPedagogo({ aberto: false, tipo: null })}
              className="absolute top-4 right-4 text-slate-400 hover:text-white bg-[#1D2D44] p-1.5 rounded-full border border-white/5 cursor-pointer"
            >
              <X size={14} />
            </button>
            
            {modalPedagogo.tipo === 'VIDEO' ? (
              <div className="w-full flex flex-col gap-3">
                <h3 className="text-base font-bold text-white font-sans flex items-center gap-2">
                  <Video size={16} className="text-[#00D4FF]" /> Media & Practice Content
                </h3>
                <div className="w-full aspect-video bg-[#0B1528] rounded-xl border border-white/5 flex flex-col items-center justify-center text-slate-400 text-xs font-mono shadow-inner">
                  [ PLAYER DE VÍDEO HAAS ]
                </div>
              </div>
            ) : (
              <div className="w-full flex flex-col gap-3">
                <span className="text-[10px] font-black text-[#FF8A2B] tracking-widest uppercase flex items-center gap-1.5">
                  <BookOpen size={12} /> CONTEÚDO ESCRITO DE FIXAÇÃO
                </span>
                <h3 className="text-base font-bold text-white font-sans">A Regra dos Clusters de Réplica</h3>
                <p className="text-xs text-slate-300 leading-relaxed font-sans select-text bg-[#0B1528]/50 p-3 rounded-xl border border-white/[0.02]">
                  Em arquiteturas de banco de dados, as alterações de esquema estrutural (schema migrations) devem ser executadas com validações prévias nos clusters secundários (réplicas) antes de impactarem a tabela master de produção.
                </p>
              </div>
            )}
          </div>
        </div>
      )}\n\n`;

    // Fecha as tags do próprio componente React originais
    novaEstrutura += `    </div>\n  );\n}\n`;

    fs.writeFileSync(caminho, novaEstrutura, 'utf8');
    console.log("🎯 Arquivo reconstruído e higienizado com sucesso!");
  }
}
