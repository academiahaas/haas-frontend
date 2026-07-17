import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { prompt, idiomaCurso } = await request.json();
    const lang = (idiomaCurso || 'EN').toUpperCase();
    
    let systemInstruction = `You are Mentora Haas. Speak EXCLUSIVELY in English. Do not use Portuguese. Answer short.`;
    if (lang === 'ES' || lang === 'SPANISH') {
      systemInstruction = `Eres la Mentora Haas. Habla EXCLUSIVAMENTE en español. No uses portugués. Responde corto.`;
    }

    const resOllama = await fetch("http://127.0.0.1:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "deepseek-r1:1.5b",
        system: systemInstruction,
        prompt: prompt,
        stream: false
      })
    });

    const dataOllama = await resOllama.json();
    let textoGerado = dataOllama?.response || "Sem resposta do modelo.";
    
    // Retira apenas a tag de pensamento se ela vier, o resto passa puro
    textoGerado = textoGerado.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

    return NextResponse.json({ success: true, text: textoGerado });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Erro interno: " + error.message }, { status: 500 });
  }
}
