const fs = require('fs');
const caminho = 'src/app/portal-aluno/components/ArenaQuiz.tsx';

if (fs.existsSync(caminho)) {
  let conteudo = fs.readFileSync(caminho, 'utf8');

  // Localiza a linha exata que capturamos no sed
  const linhaModalAntiga = 'className="fixed inset-0 w-screen h-screen z-[100000] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in cursor-default"';
  
  // Nova estratégia: Mudamos para fixed com estilo inline de garantia absoluta ou classes de viewport isoladas do Tailwind
  const linhaModalNova = 'style={{ position: '\''fixed'\'', top: 0, left: 0, width: '\''100vw'\'', height: '\''100vh'\'', display: '\''flex'\'', alignItems: '\''center'\'', justifyContent: '\''center'\'' }} className="z-[100000] bg-black/60 backdrop-blur-md p-4 animate-fade-in cursor-default"';

  if (conteudo.includes(linhaModalAntiga)) {
    conteudo = conteudo.replace(linhaModalAntiga, linhaModalNova);
    fs.writeFileSync(caminho, conteudo, 'utf8');
    console.log("🎯 Modal blindado contra contexto de empilhamento do CSS!");
  } else {
    console.log("⚠️ String do modal não localizada exatamente. Verifique alterações anteriores.");
  }
}
