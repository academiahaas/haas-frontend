const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/portal-aluno/page.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Cabeçalho (Top Bar)
code = code.replace("Language Journey", "{t.journey}");
code = code.replace("Communicator", "{t.level}");
code = code.replace(">Home</button>", ">{idioma === 'PT' ? 'Início' : idioma === 'ES' ? 'Inicio' : 'Home'}</button>");
code = code.replace(">Path</button>", ">{idioma === 'PT' ? 'Trilha' : idioma === 'ES' ? 'Ruta' : 'Path'}</button>");

// 2. Card Coral Central (Missão)
code = code.replace("MODULE 01", "{t.module}");
code = code.replace("REWARD: +50 XP", "{t.reward || 'RECOMPENSA: +50 XP'}");
code = code.replace("TIME: 15 MIN", "{t.time || 'TEMPO: 15 MIN'}");
code = code.replace("BADGE: EXPLORER", "{t.badge || 'BADGE: EXPLORER'}");
code = code.replace("PROGRESS MASTERY: 65%", "{t.mastery || 'PROGRESSO MASTERY: 65%'}");
code = code.replace("35% TO NEXT BADGE", "{t.toNext || '35% PARA O PRÓXIMO BADGE'}");

// 3. Cards do Rodapé (Métricas)
code = code.replace("DON'T LOSE YOUR HABITS TODAY!", "{t.streakSub}");
code = code.replace("RANKING POSITION", "{t.ranking}");
code = code.replace("NEXT REWARD BOX", "{t.nextReward}");
code = code.replace("Explorer Badge", "{idioma === 'PT' ? 'Emblema Explorer' : idioma === 'ES' ? 'Insignia Explorer' : 'Explorer Badge'}");

// 4. Painel Lateral Direito
code = code.replace("LEADERBOARD TOP 10", "{t.leaderboard}");
code = code.replace("EVALUATION FORM", "{t.evalBtn}");
code = code.replace("CALENDAR", "{t.calBtn}");
code = code.replace("RECURRING ERRORS CHEST", "{t.chestTitle}");
code = code.replace("CLEAR CHEST", "{t.clearBtn}");

fs.writeFileSync(filePath, code, 'utf8');
console.log('🎉 Tudo mapeado! Dicionário visual 100% interligado.');
