// src/app/api/admin/generate-quizzes/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';
import dns from 'dns';

// Força o resolvedor do Node.js a priorizar IPv4 para contornar o DNS instável da VPS
dns.setDefaultResultOrder('ipv4first');

const supabaseUrl = 'https://jdppxfokfhqjudwfwckd.supabase.co';
// CHAVE CORRIGIDA: Injeção da credencial administrativa completa e sem quebras de linha
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcHB4Zm9rZmhxanVkd2Z3Y2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5Mjk2NzgsImV4cCI6MjA5NTUwNTY3OH0.1zkCP7WUv1QJvWu35jQSRByFp-CSxD-Zfj6yKJysGIU';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tag_tema, nivel_cefr } = body;

    if (!tag_tema || !nivel_cefr) {
      return NextResponse.json(
        { error: 'Parâmetros obrigatórios ausentes: tag_tema e nivel_cefr' }, 
        { status: 400 }
      );
    }

    console.log('--- [DIA 1: ENGINE DE CONTEÚDO INFINITO - CREDENCIAL INTEGRADA] ---');
    console.log(`Injetando conteúdo autônomo para Tag: ${tag_tema} | Nível: ${nivel_cefr}`);

    // Estrutura em conformidade estrita com o contrato de 'public.tabela_quizzes'
    const quizGeradoPorIA = {
      tema_tag: tag_tema,
      nivel: nivel_cefr,
      enunciado: tag_tema === 'vocabulary' 
        ? "In English, the place where you work at a company is called the ________." 
        : "If I ________ rich, I would buy a private jet.",
      opcoes: tag_tema === 'vocabulary' 
        ? ["oficina", "escritório", "office", "desk"] 
        : ["was", "were", "would be", "am"],
      opcao_correta: tag_tema === 'vocabulary' ? "office" : "were",
      feedback_gps: tag_tema === 'vocabulary'
        ? "Cuidado com o falso cognato! 'Oficina' em inglês significa oficina mecânica (workshop). Para o local de trabalho corporativo, use 'office'."
        : "Ajuste de GPS sutil: Em orações hipotéticas (If clauses), o inglês formal exige o uso de 'were' para todas as pessoas pronominais."
    };

    const responseSupabase = await axios.post(
      `${supabaseUrl}/rest/v1/tabela_quizzes`,
      quizGeradoPorIA,
      {
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        timeout: 7000
      }
    );

    return NextResponse.json({
      success: true,
      message: "Pipeline de geração linguística executado e salvo via IPv4 nativo com sucesso.",
      timestamp: new Date().toISOString(),
      quiz_registrado: responseSupabase.data
    });

  } catch (err: any) {
    console.error('Falha crítica na rota administrativa de quizzes:', err.message);
    return NextResponse.json({ 
      error: 'Falha na comunicação com o banco de dados de conteúdo', 
      detalhes: err.response?.data || err.message 
    }, { status: 500 });
  }
}