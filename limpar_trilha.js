const fs = require('fs');
const caminho = 'src/app/portal-aluno/components/ProgramaTrilha.tsx';
if (fs.existsSync(caminho)) {
  let conteudo = fs.readFileSync(caminho, 'utf8');
  
  // Se houver algum useEffect de clique com AudioContext, nós removemos ou isolamos.
  // Vamos apenas comentar ou remover o bloco de áudio que está solto nele.
  // Para ser 100% seguro, vamos ver o que tem na linha 37 antes ou neutralizar o escutador dele.
}
