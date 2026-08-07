const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/portal-aluno/components/ArenaQuiz.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// Alvo exato do container antigo que esmagava o miolo do jogo
const containerAntigo = `<div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {todosOsJogos.find((j) => j.id === jogoSelecionado)?.component}
      </div>`;

// Novo chassi robusto que dá altura fixa de computador (min-height de 380px) para o jogo respirar
const containerNovo = `<div className="w-full max-w-2xl bg-[#04111C]/60 border border-cyan-500/20 rounded-[32px] p-6 shadow-2xl min-h-[380px] flex flex-col justify-center mx-auto mt-4">
        {todosOsJogos.find((j) => j.id === jogoSelecionado)?.component}
      </div>`;

code = code.replace(containerAntigo, containerNovo);

fs.writeFileSync(filePath, code, 'utf8');
console.log('🧼 Chassi da Arena ajustado cirurgicamente sem quebrar strings!');
