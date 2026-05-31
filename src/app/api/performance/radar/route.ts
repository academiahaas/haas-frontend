// src/app/api/performance/radar/route.ts
import { NextResponse } from 'next/server';

const supabaseUrl = 'https://jdppxfokfhqjudwfwckd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcHB4Zm9rZmhxanVkd2Z3Y2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5Mjk2NzgsImV4cCI6MjA5NTUwNTY3OH0.1zkCP7WUv1QJvWu35jQSRByFp-CSxD-Zfj6yKJysGIU';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id_usuario = searchParams.get('id_usuario');

    if (!id_usuario) {
      return NextResponse.json({ error: 'Parâmetro id_usuario é obrigatório' }, { status: 400 });
    }

    console.log(`--- [DIA 7: DASHBOARD UI COUPLING] ---`);
    console.log(`Calculando métricas do Gráfico de Radar para o aluno: ${id_usuario}`);

    // 1. Puxa o histórico de performance do aluno para calcular as proficiências
    const response = await fetch(
      `${supabaseUrl}/rest/v1/tabela_performance_360?id_usuario=eq.${id_usuario}&order=created_at.desc`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const logs = await response.json() || [];

    // 2. Pontuações Base de Proficiência (Mock Inicial do Aluno de 0 a 100)
    let proficiencias = {
      Grammar: 85,
      Vocabulary: 90,
      Fluency: 75,
      Writing: 80,
      Listening: 88
    };

    // 3. IMPLEMENTAÇÃO DO ALGORITMO DE DECAIMENTO TEMPORAL (HALF-LIFE)
    // Se o aluno não tiver logs recentes ou a data do último log passar de 7 dias, aplica penalidade de encolhimento
    const DIAS_LIMITE_INATIVIDADE = 7;
    let diasInativo = 0;
    let aplicouDecaimento = false;

    if (logs.length > 0) {
      const ultimoLogDate = new Date(logs[0].created_at).getTime();
      const agora = new Date().getTime();
      diasInativo = Math.floor((agora - ultimoLogDate) / (1000 * 60 * 60 * 24));
    } else {
      // Caso o banco esteja zerado de logs, simulamos uma inatividade de 10 dias para demonstrar o comportamento reativo
      diasInativo = 10;
    }

    if (diasInativo > DIAS_LIMITE_INATIVIDADE) {
      aplicouDecaimento = true;
      console.log(`[HALF-LIFE] Aluno inativo por ${diasInativo} dias. Encolhendo vértices do radar...`);
      
      // Fator de decaimento matemático: reduz as notas baseado no tempo longe da prática física ou falada
      const penalidade = Math.min(25, (diasInativo - DIAS_LIMITE_INATIVIDADE) * 3);
      proficiencias.Grammar = Math.max(30, proficiencias.Grammar - penalidade);
      proficiencias.Vocabulary = Math.max(30, proficiencias.Vocabulary - penalidade);
      proficiencias.Fluency = Math.max(30, proficiencias.Fluency - penalidade);
      proficiencias.Writing = Math.max(30, proficiencias.Writing - penalidade);
    }

    // 4. Formatação dos dados estruturados nativos para o componente Recharts Radar
    const dadosRadarRecharts = [
      { subject: 'Grammar', A: proficiencias.Grammar, fullMark: 100 },
      { subject: 'Vocabulary', A: proficiencias.Vocabulary, fullMark: 100 },
      { subject: 'Fluency', A: proficiencias.Fluency, fullMark: 100 },
      { subject: 'Writing', A: proficiencias.Writing, fullMark: 100 },
      { subject: 'Listening', A: proficiencias.Listening, fullMark: 100 }
    ];

    // 5. Retorno do payload JSONB completo contendo os feedbacks expansíveis
    return NextResponse.json({
      success: true,
      alunoId: id_usuario,
      decaimentoAplicado: aplicouDecaimento,
      diasEmInatividade: diasInativo,
      radarData: dadosRadarRecharts,
      feedbacksNativosJSONB: {
        statusGeral: aplicouDecaimento ? "Alerta de Amnésia Muscular" : "Ritmo de Fluência Estável",
        notaCritica: "Seu vértice de vocabulário e escrita encolheu devido ao tempo sem enviar cadernos físicos."
      }
    });

  } catch (err: any) {
    console.error('Erro Crítico no Endpoint do Radar UI:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}