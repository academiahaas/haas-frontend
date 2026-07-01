const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/portal-aluno/page.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// Âncora perfeita baseada no seu grep real (linha 48)
const alvoAncora = '  const t = translations[idioma];';

const blocoLgicoNovo = `  const t = translations[idioma];

  // ==========================================
  // CÉREBRO DO ROBÔ IA (MECÂNICA ESTILO DUOLINGO)
  // ==========================================
  const [botPhraseIndex, setBotPhraseIndex] = useState(0);
  const [isBotWinking, setIsBotWinking] = useState(false);

  const handleBotClick = () => {
    if (isBotWinking) return;
    setIsBotWinking(true);
    setBotPhraseIndex(prev => prev + 1);
    setTimeout(() => setIsBotWinking(false), 300);
  };

  const obterConselhoIA = () => {
    const traduzirErro = (err) => {
      if (err === 'Prepositions') return { PT: 'Preposições', EN: 'Prepositions', ES: 'Preposiciones' }[idioma];
      if (err === 'Phrasal Verbs') return { PT: 'Phrasal Verbs', EN: 'Phrasal Verbs', ES: 'Phrasal Verbs' }[idioma];
      return err;
    };

    const erroTraduzido = typeof erro1 !== 'undefined' ? traduzirErro(erro1) : 'Preposições';
    const xpPorcentagem = typeof porcentagemXp !== 'undefined' ? porcentagemXp : '65';
    const nomeAluno = typeof aluno1 !== 'undefined' ? aluno1 : 'Alpha';

    const bancoConselhos = {
      PT: [
        \`⚡ Notei que o seu ponto fraco atual é \${erroTraduzido}. Clique para reforçar esse conteúdo!\`,
        \`🎯 Você já domina \${xpPorcentagem}% desta unidade. Vamos buscar o próximo badge hoje?\`,
        \`🔥 Ótimo progresso, \${nomeAluno}! Não deixe seu Racha de Retenção cair hoje.\`
      ],
      EN: [
        \`⚡ I noticed your current weak spot is \${erroTraduzido}. Click to reinforce this content!\`,
        \`🎯 You have mastered \${xpPorcentagem}% of this unit. Let's aim for the next badge today?\`,
        \`🚀 Great momentum, \${nomeAluno}! Keep your Retention Streak safe today.\`
      ],
      ES: [
        \`⚡ Noté que tu punto débil actual es \${erroTraduzido}. ¡Haz clic para reforzar este contenido!\`,
        \`🎯 Ya dominas el \${xpPorcentagem}% de esta unidad. ¿Vamos por la siguiente insignia hoy?\`,
        \`🔥 ¡Buen progreso, \${nomeAluno}! No dejes que tu racha de retención caiga hoy.\`
      ]
    };

    const listaAtual = bancoConselhos[idioma] || bancoConselhos['PT'];
    return listaAtual[botPhraseIndex % listaAtual.length];
  };
  // ==========================================`;

// Faz o replace ignorando validações falhas anteriores
code = code.replace(alvoAncora, blocoLgicoNovo);

fs.writeFileSync(filePath, code, 'utf8');
console.log('🎉 Funções do robô acopladas diretamente na linha 48!');
