const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Carrega as variáveis direto do .env do seu projeto
const envContent = fs.readFileSync('/var/www/haas-frontend-desk-mobile-oficial/.env', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key) env[key.trim()] = val.join('=').trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log("❌ Variáveis de ambiente não encontradas no .env");
  process.exit(1);
}

// Inicializa desativando o realtime para evitar o erro de WebSocket no ambiente Node puro
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
  realtime: { accessToken: () => null }
});

async function test() {
  console.log("🔍 Buscando agendamentos reais na tabela...");
  const { data, error } = await supabase
    .from('user_agenda_appointments')
    .select('*')
    .limit(3);

  if (error) {
    console.error("❌ Erro ao ler o Supabase:", error.message);
  } else {
    console.log("✅ Dados brutos encontrados no seu banco:");
    console.dir(data, { depth: null });
  }
}

test();
