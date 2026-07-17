import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { prompt, userId } = await request.json();
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const cm = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcHB4Zm9rZmhxanVkd2Z3Y2tkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTkyOTY3OCwiZXhwIjoyMDk1NTA1Njc4fQ.G5o3SANhFRmsvi_RSdoIkXvaVwfxFUHc-OVxBPtnMt4";
    
    const userIdAlvo = userId || "b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1";
    let idiomaRealCurso = "PORTUGUESE";

    try {
      const resUser = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${userIdAlvo}&select=course_language`, {
        method: "GET",
        headers: {
          "apikey": cm,
          "Authorization": `Bearer ${cm}`,
          "Content-Type": "application/json"
        }
      });
      if (resUser.ok) {
        const dadosUser = await resUser.json();
        if (dadosUser && dadosUser.length > 0 && dadosUser[0].course_language) {
          idiomaRealCurso = dadosUser[0].course_language.trim();
        }
      }
    } catch (e) {
      console.error("Erro na busca do Supabase:", e);
    }

    let instrucaoSistema = "";
    const langUpper = idiomaRealCurso.toUpperCase();

    if (langUpper === 'ENGLISH' || langUpper === 'EN') {
      instrucaoSistema = `You are Mentora Haas, an expert AI language coach. The student's current course language is ENGLISH. You must communicate, guide, and respond ENTIRELY IN ENGLISH. Ignore the interface language of the website. Keep your response very short, friendly, and natural (maximum 1 or 2 sentences).`;
    } else if (langUpper === 'SPANISH' || langUpper === 'ES') {
      instrucaoSistema = `Você é a Mentora Haas, uma IA especialista e coach de idiomas. O idioma do curso do aluno é ESPANHOL. Você deve responder e ensinar INTEIRAMENTE EM ESPANHOL. Ignore o idioma atual da página ou botões. Seja curta, direta e amigável (no máximo 1 ou 2 frases).`;
    } else {
      instrucaoSistema = `Você é a Mentora Haas, uma IA especialista e coach de idiomas. O idioma do curso do aluno é PORTUGUÊS. Você deve responder, guiar e conversar INTEIRAMENTE EM PORTUGUÊS. Ignore completamente se o aluno mudar o idioma dos botões ou da página para espanhol ou inglês. Seja muito curta, direta e amigável (no máximo 1 ou 2 frases).`; 
    }

    const resOllama = await fetch("http://127.0.0.1:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "qwen2.5:7b",
        system: instrucaoSistema,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.2,
          num_predict: 80
        }
      })
    });

    if (!resOllama.ok) {
      return NextResponse.json({ success: false, error: "Falha no motor local" }, { status: 500 });
    }

    const dataOllama = await resOllama.json();
    return NextResponse.json({ success: true, text: (dataOllama?.response || "").trim() });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
