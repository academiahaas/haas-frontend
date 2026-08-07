// src/app/api/automation/build-slides/route.ts
import { NextResponse } from 'next/server';
import { gerarLoteSlides24h } from '../../../../utils/cronSlides';

export async function POST(request: Request) {
  try {
    console.log('--- [TRIGGER HTTP INVOCADO] Disparando compilação manual de slides ---');
    
    // Executa a rotina de automação em background sob demanda via terminal
    const relatorioLote = await gerarLoteSlides24h();

    return NextResponse.json({
      success: true,
      message: "Sistema de geração em lote ativo e executado com sucesso.",
      timestamp: new Date().toISOString(),
      loteProcessado: relatorioLote
    });

  } catch (err: any) {
    console.error('Erro Crítico na Rota de Automação de Slides:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}