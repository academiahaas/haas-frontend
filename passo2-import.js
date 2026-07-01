const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/portal-aluno/page.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Injetar o import na linha 2, logo após o 'use client'; se já não existir
if (!code.includes("import { translations } from './idiomas';")) {
  code = code.replace("'use client';", "'use client';\nimport { translations } from './idiomas';");
}

// 2. Injetar o estado da variável t que o dicionário vai usar
if (!code.includes("const t = translations[idioma];")) {
  code = code.replace(
    "const [activeTab, setActiveTab] = useState<string>('inicio');",
    "const [activeTab, setActiveTab] = useState<string>('inicio');\n  const t = translations[idioma];"
  );
}

fs.writeFileSync(filePath, code, 'utf8');
console.log('🎉 Passo 2 aplicado: Cabeçalho e fiação de imports configurados com precisão!');
