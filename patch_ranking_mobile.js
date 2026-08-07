const fs = require('fs');
const file = 'src/app/portal-aluno/components/PortalMobile.tsx';

if (!fs.existsSync(file)) {
    console.error("❌ Arquivo não encontrado:", file);
    process.exit(1);
}

let content = fs.readFileSync(file, 'utf8');

// Cria backup interno de segurança
fs.writeFileSync(file + '.bak_ranking', content);

// 1. Garante o estado 'topTenUsers' ou similar se não existir
if (!content.includes('const [topTenUsers, setTopTenUsers]')) {
    content = content.replace(
        'const [gavetaRankingAberta, setGavetaRankingAberta] = React.useState(false);',
        'const [gavetaRankingAberta, setGavetaRankingAberta] = React.useState(false);\n  const [topTenUsers, setTopTenUsers] = React.useState<any[]>([]);'
    );
}

// 2. Injeta o useEffect para carregar os usuários reais do Supabase ordenados por total_xp
const fetchRankingCode = `
  React.useEffect(() => {
    async function fetchRankingGlobal() {
      try {
        const sUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hnqylikpzhvymvbdvujg.supabase.co';
        const sKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!sKey) return;
        
        const res = await fetch(\`\${sUrl}/rest/v1/users?select=id,full_name,name,nickname,total_xp&order=total_xp.desc&limit=10\`, {
          headers: { 'apikey': sKey, 'Authorization': \`Bearer \${sKey}\` }
        });
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setTopTenUsers(data);
        }
      } catch (err) {
        console.error("Erro ao buscar ranking global:", err);
      }
    }
    fetchRankingGlobal();
  }, []);
`;

if (!content.includes('fetchRankingGlobal')) {
  content = content.replace(
      'const [topTenUsers, setTopTenUsers] = React.useState<any[]>([]);',
      'const [topTenUsers, setTopTenUsers] = React.useState<any[]>([]);\n' + fetchRankingCode
  );
}

// 3. Substitui os dados mockados dentro do map do ranking para usarem 'topTenUsers' se disponível
// Mapeando a lista do modal para intercalar/usar topTenUsers
content = content.replace(
    /(\[\s*\{\s*id:\s*["']1["'][\s\S]*?\}\s*\])/g,
    "(topTenUsers.length > 0 ? topTenUsers.map((u, idx) => ({ id: u.id || idx, nome: u.nickname || u.full_name || u.name || 'Aluno', xp: (u.total_xp || 0).toLocaleString('pt-BR') + ' PTS' })) : $1)"
);

fs.writeFileSync(file, content);
console.log("✅ Patch de ranking cirúrgico aplicado no PortalMobile.tsx com sucesso!");
