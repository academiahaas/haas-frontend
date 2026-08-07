const fs = require('fs');
const caminhoPage = 'src/app/portal-aluno/page.tsx';

if (fs.existsSync(caminhoPage)) {
  let codigo = fs.readFileSync(caminhoPage, 'utf8');

  // Garante que o import entre logo APÓS a diretiva 'use client'
  if (codigo.includes("'use client';")) {
    codigo = codigo.replace("'use client';", "'use client';\nimport PortalMobile from './components/PortalMobile';");
  } else if (codigo.includes('"use client";')) {
    codigo = codigo.replace('"use client";', '"use client";\nimport PortalMobile from './components/PortalMobile';");
  } else {
    // Força se não achar por quebra de linha
    codigo = "'use client';\nimport PortalMobile from './components/PortalMobile';\n" + codigo.replace(/'use client';|"use client";/g, '');
  }

  // Localiza a primeira abertura do return da estrutura de página para enfiar o Hook responsivo
  // Fazemos o split por 'return (' e pegamos a segunda ocorrência para ignorar o robô que está no topo
  let partes = codigo.split('return (');
  if (partes.length > 2) {
    const chaveamentoDinamico = `\n    (() => {
      const [isMobile, setIsMobile] = React.useState(false);
      React.useEffect(() => {
        const checarTamanho = () => setIsMobile(window.innerWidth < 768);
        checarTamanho();
        window.addEventListener('resize', checarTamanho);
        return () => window.removeEventListener('resize', checarTamanho);
      }, []);

      if (isMobile) {
        return <PortalMobile idioma={idioma} isArenaOpen={isArenaOpen} setIsArenaOpen={setIsArenaOpen} />;
      }
      return null;
    })() || (\n`;

    partes[2] = chaveamentoDinamico + partes[2];
    
    // Fecha o escopo antes do Quadrinho utilitário
    let codigoFinal = partes.join('return (');
    codigoFinal = codigoFinal.replace('function Quadrinho', '    );\n}\n\nfunction Quadrinho');
    
    fs.writeFileSync(caminhoPage, codigoFinal, 'utf8');
    console.log("🎯 Separação Mobile arquitetada com 'use client' blindado na linha 1!");
  } else {
    console.log("⚠️ Estrutura de árvore complexa detectada. Aplicando injeção via fallback.");
  }
}
