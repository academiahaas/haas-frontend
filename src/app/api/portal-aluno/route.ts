import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { pergunta, idioma } = body;

    if (!pergunta) {
      return NextResponse.json({ error: "Pergunta não fornecida" }, { status: 400 });
    }

    // Monta o payload exatamente como o robo_audio_5050.py espera
    const payloadRobo = {
      text: pergunta,
      message: pergunta,
      idioma: idioma || "PT"
    };

    // Consome o robô Flask da porta 5050 que gera a voz "nova" da OpenAI
    const response = await fetch('http://127.0.0.1:5050/api/chat-arena', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloadRobo),
    });

    const data = await response.json();

    // Captura o texto gerado pelo robô
    const textoFinal = data.response || data.reply || data.resposta || data.content || data.text;
    
    // Captura o áudio premium em Base64 gerado pela OpenAI
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
