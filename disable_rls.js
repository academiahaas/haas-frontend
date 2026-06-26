const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');

// Usando a chave que você já tem no servidor
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
  realtime: { transport: ws }
});

async function disable() {
  console.log("Tentando desativar as travas do banco...");
  // Como a anon_key não altera tabelas por padrão, vamos tentar rodar um rpc se você tiver, 
  // ou simplesmente avisar que o caminho mais curto no servidor é usar o psql.
}
