// src/app/api/intelligence/predict/route.ts
import { NextResponse } from 'next/server';
// CORREÇÃO AQUI: Trocado o alias '@/' por caminho relativo direto para evitar quebra na VPS
import { calcularMapaPreditivo } from '../../../../utils/intelligenceCore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id_usuario, proximo_tema } = body;

    if (!id_usuario || !proximo_tema) {
      return NextResponse.json(
        { error: 'Parâmetros obrigatórios ausentes: id_usuario e proximo_tema' }, 
        { status: 400 }
      );
    }

    // Executa a query matemática e o bypass de contingência do Dia 5
    const mapaPreditivo = await calcularMapaPreditivo(id_usuario, proximo_tema);

    // Retorna o payload estruturado em JSON para alimentar os slides automatizados do Dia 6
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      mapaMentalPreditivo: mapaPreditivo
    });

  } catch (err: any) {
    console.error('Erro Crítico no Endpoint Preditivo:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}