import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Envia os dados direto para o motor consertado na porta 5000 (onde está o Gemini)
    const response = await fetch('http://localhost:5000/api/mascote-ia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Erro de conexão con el motor Gemini' }, { status: 500 });
  }
}