const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/portal-aluno/page.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Injetar a ação de clique nos botões estáticos preservando as classes de estilo originais
code = code.replace(
  '<button className="bg-[#FF5500] px-1.5 py-0.5 rounded text-white shadow-sm font-bold">PT</button>',
  `<button onClick={() => setIdioma('PT')} className={\`px-1.5 py-0.5 rounded font-bold \${idioma === 'PT' ? 'bg-[#FF5500] text-white shadow-sm' : 'opacity-40 text-slate-400'}\`}>PT</button>`
);

code = code.replace(
  '<button className="px-1.5 py-0.5 opacity-40 text-slate-400">EN</button>',
  `<button onClick={() => setIdioma('EN')} className={\`px-1.5 py-0.5 font-bold \${idioma === 'EN' ? 'bg-[#FF5500] text-white rounded shadow-sm' : 'opacity-40 text-slate-400'}\`}>EN</button>`
);

code = code.replace(
  '<button className="px-1.5 py-0.5 opacity-40 text-slate-400">ES</button>',
  `<button onClick={() => setIdioma('ES')} className={\`px-1.5 py-0.5 font-bold \${idioma === 'ES' ? 'bg-[#FF5500] text-white rounded shadow-sm' : 'opacity-40 text-slate-400'}\`}>ES</button>`
);

// 2. Corrigir as strings exatas detectadas na inspeção para torná-las dinâmicas
code = code.replace("Language Journey", "{t.journey}");
code = code.replace("Hi, 👋 {aluno1}", "{t.welcome}, 👋 {aluno1}");
code = code.replace("MISSÃO DE TRILHA", "{t.missionTag}");
code = code.replace("TRAIN NOW / RE-ACTIVATE AGORA 🕹️", "{t.trainBtn}");
code = code.replace("RADAR PROFICIENCY CHART", "{t.radarTitle}");

fs.writeFileSync(filePath, code, 'utf8');
console.log('🎉 Fiação e ações de clique injetadas com precisão milimétrica!');
