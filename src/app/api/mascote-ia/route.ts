import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const GEMINI_KEY = "AQ.Ab8RN6LN8uGNB8qavYTSfVdT-9I10fW_Z7sAC7TkJoexvJyy3Q";
const ai = new GoogleGenerativeAI(GEMINI_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body.message || body.text || body.textoParaEnviar || "";
    const audio = body.audio || null;

    if (!audio && !message.trim()) {
      return NextResponse.json({ response: "Olá! Como posso ajudar?" }, { status: 200 });
    }

    const promptBase = `Você é a Mentora Haas, inteligência artificial da Academia Haas. Responda OBRIGATORIAMENTE no mesmo idioma do aluno. TEXTO PURO SEM MARKDOWN: Proibido usar asteriscos ou hashtags. FORMATO OBRIGATÓRIO: Comece com [pt], [es] ou [en] e quebra de linha.`;

    const modelPro = ai.getGenerativeModel({ model: "gemini-2.5-pro" });
    let resultStream;
    if (audio) {
      const audioPart = { inlineData: { data: audio, mimeType: "audio/mp3" } };
      resultStream = await modelPro.generateContentStream([promptBase, audioPart, message].filter(Boolean));
    } else {
      resultStream = await modelPro.generateContentStream([promptBase, message]);
    }

    let rawText = "";
    for await (const chunk of resultStream.stream) { rawText += chunk.text(); }
    rawText = rawText.trim();

    let idiomaDetectado = 'pt';
    let responseText = rawText;

    if (rawText.startsWith('[es]')) { idiomaDetectado = 'es'; responseText = rawText.replace('[es]', '').trim(); }
    else if (rawText.startsWith('[en]')) { idiomaDetectado = 'en'; responseText = rawText.replace('[en]', '').trim(); }
    else if (rawText.startsWith('[pt]')) { idiomaDetectado = 'pt'; responseText = rawText.replace('[pt]', '').trim(); }

    // FORÇANDO O ACIONAMENTO DO ROBÔ DE ÁUDIO REAL NA PORTA 5050
    try {
      await fetch("http://127.0.0.1:5050/api/chat-arena", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: responseText, lang: idiomaDetectado })
      });
    } catch (ttsErr) { console.error("Erro ao chamar o robô de voz:", ttsErr); }

    // Aguarda um instante para o áudio ser gravado no disco
    await new Promise((resolve) => setTimeout(resolve, 800));

    let audioBase64 = null;
    const caminhoAudio = path.join(process.cwd(), 'public', 'audios', 'resposta_arena.wav');
    try {
      if (fs.existsSync(caminhoAudio)) {
        audioBase64 = fs.readFileSync(caminhoAudio).toString('base64');
      }
    } catch (fsErr) { console.error("Erro ao ler arquivo final:", fsErr); }

    return NextResponse.json({ 
      success: true, response: responseText, reply: responseText, text: responseText,
      audio: audioBase64, audioResponse: audioBase64, audioUrl: `/audios/resposta_arena.wav?update=${Date.now()}`
    });
  } catch (error: any) {
    return NextResponse.json({ response: "Erro interno no servidor." }, { status: 500 });
  }
}
