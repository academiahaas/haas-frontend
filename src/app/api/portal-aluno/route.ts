import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { pergunta, audio, moduloActual, idioma } = body;

    const payloadRobo: any = {};
    
    // Constrói uma instrução de contexto sutil baseado na tela que o aluno está vendo
    const contextoSupabase = moduloActual 
      ? `[Contexto da Aula: O aluno está no módulo/lição "${moduloActual}". Idioma preferencial: ${idioma || 'ES'}. Ajude-o focado nessa temática de forma natural.]\n`
      : "";

    if (audio) {
      payloadRobo.audio = audio;
      // Passamos a instrução de contexto mesmo se for áudio! O robô concatena isso com a transcrição do Whisper
      payloadRobo.message = contextoSupabase; 
    } else {
      payloadRobo.message = contextoSupabase + pergunta;
      payloadRobo.text = contextoSupabase + pergunta;
    }

    // Consome o robô Flask da porta 5050
    const response = await fetch('http://127.0.0.1:5050/api/chat-arena', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloadRobo),
    });

    const data = await response.json();

    const textoFinal = data.response || data.reply || data.resposta || data.content || data.text;
    const audioPremium = data.audioResponse || data.audio || data.audioBase64 || null;

    if (!textoFinal) {
      return NextResponse.json({ response: "Nenhuma resposta foi gerada pelo robô." });
    }

    return NextResponse.json({ response: textoFinal, audio: audioPremium });

  } catch (error) {
    console.error("Erro no túnel de áudio do mobile:", error);
    return NextResponse.json({ response: "Tive um soluço na rede de áudio. Pode repetir?" });
  }
}
