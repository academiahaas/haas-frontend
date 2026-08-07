import { NextResponse } from 'next/server';

const supabaseUrl = 'https://jdppxfokfhqjudwfwckd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcHB4Zm9rZmhxanVkd2Z3Y2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5Mjk2NzgsImV4cCI6MjA5NTUwNTY3OH0.1zkCP7WUv1QJvWu35jQSRByFp-CSxD-Zfj6yKJysGIU';

const PESO_FALA_LIVE = 1.5;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { agendaId, status, transcricaoBuffer } = body;

    console.log('--- [SIMULADOR LOCAL ATIVADO] ---');
    console.log('Recebido:', { agendaId, status });

    if (!agendaId || status !== 'Concluída') {
      return NextResponse.json({ error: 'Status precisa ser "Concluída"' }, { status: 400 });
    }

    // 1. Busca o agendamento no Supabase
    const response = await fetch(
      `${supabaseUrl}/rest/v1/tabela_master_schedule?id=eq.${agendaId}&select=*`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = await response.json();

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 });
    }

    const aula = data[0];

    // 2. Atualiza o status da aula no Supabase
    await fetch(
      `${supabaseUrl}/rest/v1/tabela_master_schedule?id=eq.${agendaId}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status_aula: 'Concluída' })
      }
    );

    if (!transcricaoBuffer || !transcricaoBuffer.trim()) {
      return NextResponse.json({ success: true, message: 'Aula concluída sem transcrição' });
    }

    // 3. Simulação da resposta de análise (Pula o Google Gemini com segurança)
    const analysis = {
      desvios: [
        {
          tag: "verb_tenses",
          descricao: "Uso incorreto do passado simples na fala espontânea",
          exemplo_aluno: "Yesterday I go to school"
        }
      ]
    };

    // 4. Gravação da telemetria de Peso 1.5 na tabela_performance_360
    const logs = analysis.desvios.map((d: any) => ({
      id_usuario: aula.usuario_id || aula.id_aluno,
      id_agenda: agendaId,
      tipo_origem: 'fala',
      tag_erro: d.tag,
      detalhe_desvio: d.descricao,
      evidencia_contexto: d.exemplo_aluno,
      peso_impacto: PESO_FALA_LIVE,
      created_at: new Date().toISOString()
    }));

    await fetch(`${supabaseUrl}/rest/v1/tabela_performance_360`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(logs)
    });

    return NextResponse.json({ success: true, message: "Processado via simulador local", desvios_identificados: analysis.desvios.length });

  } catch (err: any) {
    console.error('Erro Crítico no Webhook:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}