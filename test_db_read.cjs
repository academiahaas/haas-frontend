const { createClient } = require('@supabase/supabase-js');

const url = "https://jdppxfokfhqjudwfwckd.supabase.co";
const anon = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcHB4Zm9rZmhxanVkd2Z3Y2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5Mjk2NzgsImV4cCI6MjA5NTUwNTY3OH0.1zkCP7WUv1QJvWu35jQSRByFp-CSxD-Zfj6yKJysGIU";

// Desativa recursos desnecessários para rodar o script isolado no terminal do node
const supabase = createClient(url, anon, {
  auth: { persistSession: false },
  realtime: { createWebSocketConn: () => null }
});

async function run() {
  const { data: mod, error: errMod } = await supabase.from('modules_content').select('*').limit(1);
  const { data: uni, error: errUni } = await supabase.from('units').select('*').limit(1);
  
  console.log("=== EXTRATO DE REGISTROS DO BANCO ===");
  if (errMod) console.log("Erro Módulos:", errMod.message);
  else console.log("Módulo Exemplo:", mod);
  
  if (errUni) console.log("Erro Unidades:", errUni.message);
  else console.log("Unidade Exemplo:", uni);
}
run();
