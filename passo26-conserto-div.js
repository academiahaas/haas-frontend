const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/portal-aluno/page.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// O bloco exato que está quebrado hoje no seu arquivo
const blocoQuebrado = `              <div className="flex justify-between items-center text-[10px] font-mono font-black text-slate-950 mb-2.5 px-0.5 opacity-90">
                <span>{t.mastery}</span>
                <span className="text-[#A13400] tracking-wide">{t.toNext || \'35% PARA O PRÓXIMO BADGE\'}</span>
              </div>
              </div>`;

// O bloco limpo sem a div intrusa que fecha antes da hora
const blocoConsertado = `              <div className="flex justify-between items-center text-[10px] font-mono font-black text-slate-950 mb-2.5 px-0.5 opacity-90">
                <span>{t.mastery}</span>
                <span className="text-[#A13400] tracking-wide">{t.toNext || '35% PARA O PRÓXIMO BADGE'}</span>
              </div>`;

// Substituição direta tolerante a variações de espaços
code = code.replace(blocoQuebrado, blocoConsertado);
// Fallback caso os espaços invisíveis do terminal mudem ligeiramente
code = code.replace(/<\/div>\s*<\/div>\s*<button onClick=\{\(\) => setIsArenaOpen\(true\)\}/, '</div>\n              <button onClick={() => setIsArenaOpen(true)}');

fs.writeFileSync(filePath, code, 'utf8');
console.log('🧼 Tag Div intrusa pulverizada com sucesso!');
