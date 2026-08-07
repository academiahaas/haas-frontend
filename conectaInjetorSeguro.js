const fs = require("fs");
const path = "src/app/portal-aluno/page.tsx";
let code = fs.readFileSync(path, "utf8");

// 1. Injetar a variável de controle [isBadgesOpen] no topo
const alvoEstado = "const [isPerfilOpen, setIsPerfilOpen] = useState(false);";
const novoEstado = "const [isPerfilOpen, setIsPerfilOpen] = useState(false);\n  const [isBadgesOpen, setIsBadgesOpen] = useState(false);";

if (code.includes(alvoEstado) && !code.includes("isBadgesOpen")) {
  code = code.replace(alvoEstado, novoEstado);
}

// 2. Injetar o Import e a Tag da sub-gaveta acoplada na base da gaveta perfil
const alvoCauda = 'Logout'}</button>\n          </div>\n        </div>\n      </div>';
const caudaComGavetaEmbutida = 'Logout'}</button>\n          </div>\n        </div>\n        <GavetaBadges isOpen={isBadgesOpen} onClose={() => setIsBadgesOpen(false)} idioma={idioma} />\n      </div>';

// Se o arquivo usar aspas normais para o botão
const alvoCaudaAlternativo = 'Sair da Conta\' : \'Log Out\'}</button>\n          </div>\n        </div>\n      </div>';

// Importar no início do arquivo de forma limpa
if (!code.includes("import GavetaBadges")) {
  code = "import GavetaBadges from './GavetaBadges';\n" + code;
}

// Substituição direta baseada na assinatura mapeada no grep da linha 634/637
code = code.replace("Log Out'}</button>\n          </div>\n        </div>\n      </div>", "Log Out'}</button>\n          </div>\n        </div>\n        <GavetaBadges isOpen={isBadgesOpen} onClose={() => setIsBadgesOpen(false)} idioma={idioma} />\n      </div>");

fs.writeFileSync(path, code, "utf8");
console.log("💎 RETORNO HAAS: Fiação atômica conectada com sucesso!");
