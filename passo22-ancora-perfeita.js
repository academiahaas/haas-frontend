const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/portal-aluno/page.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// Remover tentativas parciais antigas para limpar o arquivo antes de aplicar a injeção limpa
code = code.replace(/const \[botPhraseIndex, setBotPhraseIndex\] = useState\(0\);/g, '');
code = code.replace(/const \[isBotWinking, setIsBotWinking\] = useState\(false\);/g, '');

// Âncora universal infalível: a abertura do componente principal
const alvoAncora = 'export default function PortalAluno() {';

const blocoCompletoRobo = `export default function PortalAluno() {
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
        \`🎯 Ya dominas el \${xpPorcentagem}% of de esta unidad. ¿Vamos por la siguiente insignia hoy?\`,
        \`🔥 ¡Buen progreso, \${nomeAluno}! No dejes que tu racha de retención caiga hoy.\`
      ]
    };

    const idiomaSeguro = typeof idioma !== 'undefined' ? idioma : 'PT';
    const listaAtual = bancoConselhos[idiomaSeguro] || bancoConselhos['PT'];
    return listaAtual[botPhraseIndex % listaAtual.length];
  };`;

// Aplicar a substituição estrutural
if (!code.includes('handleBotClick')) {
  code = code.replace(alvoAncora, blocoCompletoRobo);
  console.log('🧠 Estados e inteligência IA ancorados com sucesso na abertura do componente!');
} else {
  console.log('✨ Os estados já constavam no arquivo.');
}

fs.writeFileSync(filePath, code, 'utf8');
