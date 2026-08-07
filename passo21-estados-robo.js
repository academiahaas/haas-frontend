const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/portal-aluno/page.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Injetar os estados e a função de clique se eles não existirem
const alvoEstado = "const [mounted, setMounted] = useState(false);";

const logicaFaltante = `const [mounted, setMounted] = useState(false);
  const [botPhraseIndex, setBotPhraseIndex] = useState(0);
  const [isBotWinking, setIsBotWinking] = useState(false);

  // Alterna as frases de IA no clique e ativa o piscar de olhos por 300ms
  const handleBotClick = () => {
    if (isBotWinking) return;
    setIsBotWinking(true);
    setBotPhraseIndex(prev => prev + 1);
    setTimeout(() => setIsBotWinking(false), 300);
  };`;

if (!code.includes('handleBotClick')) {
  code = code.replace(alvoEstado, logicaFaltante);
  console.log('🧠 Função handleBotClick e estados injetados com sucesso!');
}

// 2. Injetar a função obterConselhoIA se ela também tiver ficado de fora
const logicaIA = `  // Função Geradora de Análise de IA em tempo real baseada nas necessidades do aluno
  const obterConselhoIA = () => {
    const traduzirErro = (err) => {
      if (err === 'Prepositions') return { PT: 'Preposições', EN: 'Prepositions', ES: 'Preposiciones' }[idioma];
      if (err === 'Phrasal Verbs') return { PT: 'Phrasal Verbs', EN: 'Phrasal Verbs', ES: 'Phrasal Verbs' }[idioma];
      return err;
    };

    const erroTraduzido = traduzirErro(erro1);

    const bancoConselhos = {
      PT: [
        \`⚡ Notei que o seu ponto fraco atual é ${'erro1' ? '${erroTraduzido}' : 'Preposições'}. Clique para reforçar esse conteúdo!\`,
        \`🎯 Você já domina ${'porcentagemXp' ? '${porcentagemXp}' : '65'}% desta unidade. Vamos buscar o próximo badge hoje?\`,
        \`🔥 Ótimo progresso, ${'aluno1' ? '${aluno1}' : 'Alpha'}! Não deixe seu Racha de Retenção cair hoje.\`
      ],
      EN: [
        \`⚡ I noticed your current weak spot is ${'erro1' ? '${erroTraduzido}' : 'Prepositions'}. Click to reinforce this content!\`,
        \`🎯 You have mastered ${'porcentagemXp' ? '${porcentagemXp}' : '65'}% of this unit. Let's aim for the next badge today?\`,
        \`🚀 Great momentum, ${'aluno1' ? '${aluno1}' : 'Alpha'}! Keep your Retention Streak safe today.\`
      ],
      ES: [
        \`⚡ Noté que tu punto débil actual es ${'erro1' ? '${erroTraduzido}' : 'Preposiciones'}. ¡Haz clic para reforzar este contenido!\`,
        \`🎯 Ya dominas el ${'porcentagemXp' ? '${porcentagemXp}' : '65'}% de esta unidad. ¿Vamos por la siguiente insignia hoy?\`,
        \`🔥 ¡Buen progreso, ${'aluno1' ? '${aluno1}' : 'Alpha'}! No dejes que tu racha de retención caiga hoy.\`
      ]
    };

    const listaAtual = bancoConselhos[idioma] || bancoConselhos['PT'];
    return listaAtual[botPhraseIndex % listaAtual.length];
  };`;

if (!code.includes('obterConselhoIA')) {
  // Injeta logo após o bloco do handleBotClick que acabamos de colocar
  code = code.replace('setTimeout(() => setIsBotWinking(false), 300);\n  };', 'setTimeout(() => setIsBotWinking(false), 300);\n  };\n\n' + logicaIA);
  console.log('🤖 Cérebro de IA do robô acoplado com sucesso!');
}

fs.writeFileSync(filePath, code, 'utf8');
