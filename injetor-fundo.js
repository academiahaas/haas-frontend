const fs = require('fs');
const caminho = '/var/www/haas-frontend/src/app/lesson/page.tsx';

if (fs.existsSync(caminho)) {
  let codigo = fs.readFileSync(caminho, 'utf8');
  // Remove o fundo preto e prepara para o portal vivo
  codigo = codigo.replace("bg-[#070d14]/85", "bg-[#070d14]/40");
  codigo = codigo.replace("backgroundImage: \"url('/dashboard-aluno.png')\"", "backgroundImage: 'none'");
  fs.writeFileSync(caminho, codigo, 'utf8');
  console.log('Fundo liberado com sucesso no servidor!');
}
