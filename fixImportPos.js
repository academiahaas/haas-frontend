const fs = require("fs");
const path = "src/app/portal-aluno/page.tsx";

if (fs.existsSync(path)) {
  let code = fs.readFileSync(path, "utf8");

  // Remove qualquer import duplicado ou errado que tenha subido
  code = code.replace("import InjetorSomPremium from './components/InjetorSomPremium';\n", "");
  
  // Injeta o nosso import exatamente ABAIXO da diretiva 'use client'
  if (code.includes("'use client';")) {
    code = code.replace("'use client';", "'use client';\nimport InjetorSomPremium from './components/InjetorSomPremium';");
  } else if (code.includes('"use client";')) {
    code = code.replace('"use client";', '"use client";\nimport InjetorSomPremium from './components/InjetorSomPremium';');
  }

  // Ativa a tag do injetor logo no início do return para o som funcionar
  if (code.includes('<div className="w-full h-screen text-white/90 select-none flex flex-col overflow-hidden bg-[#030914] relative font-sans isolate">')) {
    code = code.replace(
      '<div className="w-full h-screen text-white/90 select-none flex flex-col overflow-hidden bg-[#030914] relative font-sans isolate">',
      '<div className="w-full h-screen text-white/90 select-none flex flex-col overflow-hidden bg-[#030914] relative font-sans isolate">\n        <InjetorSomPremium />'
    );
  }

  fs.writeFileSync(path, code, "utf8");
  console.log("💎 RETORNO HAAS: Alinhamento de código corrigido mantendo o 'use client' no topo!");
}
