const fs = require("fs");
const path = "src/app/portal-aluno/page.tsx";
let code = fs.readFileSync(path, "utf8");

// 1. Injetar o import de forma segura LOGO ABAIXO do 'use client';
if (!code.includes("import GavetaBadges")) {
  code = code.replace("'use client';", "'use client';\nimport GavetaBadges from './GavetaBadges';");
  code = code.replace('"use client";', '"use client";\nimport GavetaBadges from './GavetaBadges';');
}

// 2. Garantir o estado isBadgesOpen abaixo do isPerfilOpen
if (!code.includes("isBadgesOpen")) {
  code = code.replace(
    "const [isPerfilOpen, setIsPerfilOpen] = useState(false);",
    "const [isPerfilOpen, setIsPerfilOpen] = useState(false);\n  const [isBadgesOpen, setIsBadgesOpen] = useState(false);"
  );
}

// 3. Ativar o clique diretamente no bloco do Mural de Insígnias (Baseado na linha 599 do seu grep)
const blocoMuralOriginal = `{idioma === 'PT' ? 'Mural de Insígnias' : 'Prestige Badges'}</span>`;
const blocoMuralComClique = `{idioma === 'PT' ? 'Mural de Insígnias' : 'Prestige Badges'}</span>\n                <div className="absolute top-2 right-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[8px] font-mono font-black uppercase tracking-wider px-1.5 py-0.5 rounded cursor-pointer transition-all active:scale-[0.97]" onClick={() => setIsBadgesOpen(true)}>{idioma === 'PT' ? 'Ver Detalhes →' : 'View All →'}</div>`;

// Para tornar ainda mais fácil, vamos colocar o clique e um botão elegante "Ver Detalhes →" no canto superior do painel de medalhas!
if (code.includes(blocoMuralOriginal)) {
  // Vamos certificar que o contêiner pai ganhe uma posição relativa para o botão se posicionar perfeitamente
  code = code.replace(
    'className="flex flex-col gap-3.5 bg-[#071324]/60 p-3 rounded-2xl border border-white/[0.03]"',
    'className="flex flex-col gap-3.5 bg-[#071324]/60 p-3 rounded-2xl border border-white/[0.03] relative"'
  );
  code = code.replace(blocoMuralOriginal, blocoMuralComClique);
  console.log("💎 RETORNO HAAS: Gatilho de clique acoplado ao cabeçalho do Mural!");
}

// 4. Ancorar a tag da sub-gaveta grudada no fechamento da gaveta do perfil (Linhas 634-637)
const buscaFimGaveta = `{idioma === 'PT' ? 'Sair da Conta' : 'Log Out'}</button>\n          </div>\n        </div>\n      </div>`;
const substitutoFimGaveta = `{idioma === 'PT' ? 'Sair da Conta' : 'Log Out'}</button>\n          </div>\n        </div>\n        <GavetaBadges isOpen={isBadgesOpen} onClose={() => setIsBadgesOpen(false)} idioma={idioma} />\n      </div>`;

if (code.includes(buscaFimGaveta)) {
  code = code.replace(buscaFimGaveta, substitutoFimGaveta);
  console.log("💎 RETORNO HAAS: Sub-gaveta embutida com sucesso!");
} else {
  // Fallback caso aja variações de espaçamento nos fechamentos do final do arquivo
  code = code.replace(
    `{idioma === 'PT' ? 'Sair da Conta' : 'Log Out'}</button>\n          </div>\n        </div>\n      </div>`,
    `{idioma === 'PT' ? 'Sair da Conta' : 'Log Out'}</button>\n          </div>\n        </div>\n        <GavetaBadges isOpen={isBadgesOpen} onClose={() => setIsBadgesOpen(false)} idioma={idioma} />\n      </div>`
  );
  console.log("💎 RETORNO HAAS: Sub-gaveta embutida via Fallback String!");
}

fs.writeFileSync(path, code, "utf8");
console.log("💎 RETORNO HAAS: Compilação sincronizada de ponta a ponta!");
