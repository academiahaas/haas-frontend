const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/portal-aluno/page.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// O bloco exato da barra intrusa que o seu sed capturou
const blocoBarraIntrusa = `              {/* BARRA DE PROGRESSO FÍSICA PREMIUM ESTILO DUOLINGO */}
              <div className="w-full h-3.5 bg-slate-950/10 rounded-full overflow-hidden p-[2px] border border-black/5 shadow-inner mb-4">
                <div 
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.2)] transition-all duration-1000 relative overflow-hidden"
                  style={{ width: '65%' }}
                >
                  {/* Brilho reflexivo premium para efeito 3D real */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent h-[40%]"></div>
                </div>
              </div>`;

// Fallback flexível com regex cobrindo possíveis variações de espaços invisíveis na quebra de linha
const regexFlexivel = /\s*\{\/\* BARRA DE PROGRESSO FÍSICA PREMIUM ESTILO DUOLINGO \*\/\}[\s\S]*?<\/div>\s*<\/div>/;

if (regexFlexivel.test(code)) {
  code = code.replace(regexFlexivel, '');
  console.log('🧼 Barra de progresso extra removida com sucesso!');
} else {
  // Substituição direta caso os caracteres batam exatos
  code = code.replace(blocoBarraIntrusa, '');
  console.log('🧼 Limpeza direta executada!');
}

fs.writeFileSync(filePath, code, 'utf8');
