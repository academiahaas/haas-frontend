const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jdppxfokfhqjudwfwckd.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcHB4Zm9rZmhxanVkd2Z3Y2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5Mjk2NzgsImV4cCI6MjA5NTUwNTY3OH0.1zkCP7WUv1QJvWu35jQSRByFp-CSxD-Zfj6yKJysGIU';

// Desativando realtime para rodar no Node sem erro de WebSocket
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
  realtime: { transport: null }
});

async function inspecionar() {
  console.log("🚀 TENTANDO INVESTIGAR CONSTRAINT...");
  
  const { data, error } = await supabase
    .from('user_agenda_appointments')
    .update({ 
      status: 'cancelada',
      canceled_at: new Date().toISOString()
    })
    .eq('id', '4d4a588b-94ad-4230-82df-386905a2f147')
    .select();

  if (error) {
    console.log("❌ ERRO DETALHADO DO POSTGRES:", error.message);
    console.log("💡 DETALHES DA CONSTRAINT:", error.details || "Sem detalhes");
  } else {
    console.log("✅ VIA SERVICE ROLE PASSOU (Inesperado):", data);
  }
}

inspecionar();
