import { NextResponse } from 'next/server';

const supabaseUrl = 'https://jdppxfokfhqjudwfwckd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcHB4Zm9rZmhxanVkd2Z3Y2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5Mjk2NzgsImV4cCI6MjA5NTUwNTY3OH0.1zkCP7WUv1QJvWu35jQSRByFp-CSxD-Zfj6yKJysGIU';

const ORIGEM_ESCRITA = 'escrita'; 
const PESO_ESCRITA = 1.0;         

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id_aluno, id_agenda } = body;

    console.log('--- [DIA 4: MÓDULO DE ESCRITA ATIVADO] ---');
    console.log('Processando caderno do ID:', id_aluno);

    if (!id_aluno || !id_agenda) {
      return NextResponse.json({ error: 'Parâmetros obrigatórios ausentes: id_aluno e id_agenda' }, { status: 400 });
    }

    // Simulador do Gemini Vision adaptando a caligrafia à padronização de tags
    const visionAnalysis = {
      desvios: [
        {
          tag: "vocabulary",
          descricao: "Erro de ortografia/ortografia incorreta identificada na escrita manuscrita",
          evidencia_aluno: "I need to choice the best option (ortografia correta: choose)"
        }
      ]
    };

    // Mapeamento e Persistência de Dados (id_usuario removido temporariamente para ignorar tabela vazia)
    const logs = visionAnalysis.desvios.map((d: any) => ({
      id_agenda: id_agenda,
      tipo_origem: ORIGEM_ESCRITA,
      tag_erro: d.tag,
      detalhe_desvio: d.descricao,
      evidencia_contexto: d.evidencia_aluno,
      peso_impacto: PESO_ESCRITA,
      created_at: new Date().toISOString()
    }));

    const supabaseInsert = await fetch(`${supabaseUrl}/rest/v1/tabela_performance_360`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(logs)
    });

    if (!supabaseInsert.ok) {
      const errorDb = await supabaseInsert.text();
      return NextResponse.json({ error: 'Erro ao salvar telemetria de escrita no banco', detalhes: errorDb }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Fluxo do Caderno Haas integrado à fiação centralizada com sucesso.",
      dados_ingeridos: logs.length
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}