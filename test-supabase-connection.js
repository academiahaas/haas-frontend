const { createClient } = require('@supabase/supabase-js');

// Carregar variáveis de ambiente do .env.local
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('📋 URL do Supabase:', supabaseUrl);
console.log('📋 Key length:', supabaseAnonKey?.length);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente não encontradas!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log('🔍 Buscando agendamento...');
  
  const { data, error } = await supabase
    .from('tabela_master_schedule')
    .select('*')
    .eq('id', '123e4567-e89b-12d3-a456-426614174000');
  
  if (error) {
    console.error('❌ Erro:', error);
  } else {
    console.log('✅ Encontrado:', data?.length || 0, 'registros');
    console.log('📊 Dados:', JSON.stringify(data, null, 2));
  }
}

test();
