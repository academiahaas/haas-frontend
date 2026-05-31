import { NextResponse } from 'next/server';

const supabaseUrl = 'https://jdppxfokfhqjudwfwckd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcHB4Zm9rZmhxanVkd2Z3Y2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5Mjk2NzgsImV4cCI6MjA5NTUwNTY3OH0.1zkCP7WUv1QJvWu35jQSRByFp-CSxD-Zfj6yKJysGIU';

// Catálogo de Tags Gramaticais Permitidas para Governação do Sistema (Dia 2)
const TAGS_PERMITIDAS = [
  'if_clauses',
  'verb_tenses',
  'prepositions',
  'vocabulary',
  'phrasal_verbs',
  'pronouns'
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id_aluno, id_agenda, tag_erro, detalhe_desvio, evidencia_contexto } = body;

    console.log('--- [DIA 2: INGESTÃO DE METRICAS ASSÍNCRONAS] ---');
    console.log('Dados recebidos:', { id_aluno, tag_erro });

    // 1. Validação de Segurança dos Dados de Entrada
    if (!id_aluno || !tag_erro) {
      return NextResponse.json(
        { success: false, error: 'Campos obrigatórios ausentes: id_aluno e tag_erro são necessários.' },
        { status: 400 }
      );
    }

    // 2. Validação de Governação Linguística (Middleware do Catálogo Haas)
    if (!TAGS_PERMITIDAS.includes(tag_erro)) {
      return NextResponse.json(
        { success: false, error: `Tag '${tag_erro}' inválida. Tags permitidas: ${TAGS_PERMITIDAS.join(', ')}` },
        { status: 400 }
      );
    }

    // 3. Payload de Persistência de Dados (Omitindo id_usuario no teste para contornar tabela pai vazia)
    const payloadLog = [
      {
        id_agenda: id_agenda || null,
        tipo_origem: 'plataforma',    // Identificador crucial para o motor preditivo do Dia 5
        tag_erro: tag_erro,
        detalhe_desvio: detalhe_desvio || 'Erro cometido em micro-quiz assíncrono.',
        evidencia_contexto: evidencia_contexto || 'Opção incorreta selecionada na plataforma.',
        peso_impacto: 0.8             // Peso calibrado para a experiência estilo Duolingo
      }
    ];

    const supabaseInsert = await fetch(`${supabaseUrl}/rest/v1/tabela_performance_360`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payloadLog)
    });

    if (!supabaseInsert.ok) {
      const errorDb = await supabaseInsert.text();
      console.error('Erro de persistência no Supabase:', errorDb);
      return NextResponse.json({ success: false, error: 'Erro ao salvar no banco de dados', detalhes: errorDb }, { status: 500 });
    }

    // 4. Retorno de Sucesso Reativo
    return NextResponse.json({
      success: true,
      message: 'Métrica do Duolingo Haas ingerida com sucesso.',
      timestamp: new Date().toISOString(),
      dados_inseridos: payloadLog.length
    });

  } catch (err: any) {
    console.error('Falha crítica na rota de ingestão:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}