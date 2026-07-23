const fs = require('fs');
const file = 'src/app/portal-aluno/components/PortalMobile.tsx';

let content = fs.readFileSync(file, 'utf8');

// Backup interno
fs.writeFileSync(file + '.bak_ranking_dinamico', content);

// 1. Injeta a consulta do ranking ao Supabase se ainda não existir
if (!content.includes('const [topRanking, setTopRanking]')) {
    const estadoCode = `
  const [topRanking, setTopRanking] = React.useState<any[]>([]);

  React.useEffect(() => {
    async function carregarRankingMobile() {
      try {
        const sUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hnqylikpzhvymvbdvujg.supabase.co';
        const sKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!sKey) return;

        const res = await fetch(\`\${sUrl}/rest/v1/users?select=id,full_name,name,nickname,total_xp&order=total_xp.desc&limit=10\`, {
          headers: { 'apikey': sKey, 'Authorization': \`Bearer \${sKey}\` }
        });
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setTopRanking(data);
        }
      } catch (err) {
        console.error("Erro ao carregar ranking no mobile:", err);
      }
    }
    carregarRankingMobile();
  }, []);
`;
    content = content.replace(
        'const [gavetaRankingAberta, setGavetaRankingAberta] = React.useState(false);',
        'const [gavetaRankingAberta, setGavetaRankingAberta] = React.useState(false);\n' + estadoCode
    );
}

// 2. Substitui o bloco fixo de HTML do ranking por um map dinâmico
// Encontra do 1º LUGAR até a fechada do container de itens do ranking
const regexBlocoFixo = /\{\/\*\s*1º\s*LUGAR\s*\*\/\}[\s\S]*?(?=\s*<\/div>\s*<\/div>\s*<\/div>\s*\{|\s*<\/div>\s*<\/div>\s*<button)/i;

const blocoDinamico = `{topRanking.length > 0 ? (
  topRanking.map((aluno, index) => {
    const posicao = index + 1;
    const isPrimeiro = posicao === 1;
    const nomeExibicao = aluno.nickname || aluno.full_name || aluno.name || 'Aluno Haas';
    const pontos = Number(aluno.total_xp || 0).toLocaleString('pt-BR') + ' PTS';

    return (
      <div 
        key={aluno.id || index}
        className={\`flex items-center justify-between p-3 rounded-xl \${
          isPrimeiro 
            ? 'bg-amber-500/10 border border-amber-500/30' 
            : 'bg-slate-950/20 border border-white/[0.02]'
        }\`}
      >
        <div className="flex items-center gap-3">
          <span className={\`font-bold w-4 \${isPrimeiro ? 'text-amber-400' : 'text-slate-400 text-sm'}\`}>
            {posicao}
          </span>
          <span className={\`font-bold \${isPrimeiro ? 'text-amber-300 font-mono tracking-wide' : 'text-slate-200'}\`}>
            {nomeExibicao}
          </span>
        </div>
        <span className={\`font-mono \${isPrimeiro ? 'text-amber-400 font-black' : 'text-slate-400'}\`}>
          {pontos}
        </span>
      </div>
    );
  })
) : (
  <div className="text-center py-6 text-slate-400 text-xs font-mono">
    Carregando classificação...
  </div>
)}`;

if (regexBlocoFixo.test(content)) {
    content = content.replace(regexBlocoFixo, blocoDinamico);
    fs.writeFileSync(file, content);
    console.log("✅ Substituto dinâmico do ranking aplicado com sucesso no PortalMobile.tsx!");
} else {
    console.error("❌ Não foi possível mapear a regex exata do bloco fixo. Inspecione a estrutura.");
}
