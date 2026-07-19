import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const traduzirIdioma = (sigla: string): string => {
  if (!sigla) return "Portugués";
  const s = sigla.toLowerCase().trim();
  if (s === 'es' || s === 'espanhol' || s === 'español') return "Español";
  if (s === 'pt' || s === 'portugues' || s === 'português') return "Portugués";
  if (s === 'en' || s === 'ingles' || s === 'inglês' || s === 'english') return "Inglés";
  return sigla;
};

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const prompt = body?.prompt;
    const userId = body?.userId;
    const chatHistory = body?.chatHistory;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcHB4Zm9rZmhxanVkd2Z3Y2tkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTkyOTY3OCwiZXhwIjoyMDk1NTA1Njc4fQ.G5o3SANhFRmsvi_RSdoIkXvaVwfxFUHc-OVxBPtnMt4"; 

    if (!userId) return NextResponse.json({ success: false, error: "Falta o userId" }, { status: 400 });

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: userData } = await supabase.from('users').select('name, native_language, course_language').eq('id', userId).single();
    const { data: snapshot } = await supabase.from('user_ai_pedagogic_snapshot').select('foco_erros_recentes').eq('user_id', userId).single();

    const IDIOMA_NATIVO = traduzirIdioma(userData?.native_language);
    const IDIOMA_ALVO = traduzirIdioma(userData?.course_language);
    
    let focoErrosTexto = "";
    if (snapshot?.foco_erros_recentes) {
      if (typeof snapshot.foco_erros_recentes === 'object' && !Array.isArray(snapshot.foco_erros_recentes)) {
        focoErrosTexto = Object.keys(snapshot.foco_erros_recentes).slice(0, 2).join(" e ");
      } else if (Array.isArray(snapshot.foco_erros_recentes)) {
        focoErrosTexto = snapshot.foco_erros_recentes.slice(0, 2).join(" e ");
      } else if (typeof snapshot.foco_erros_recentes === 'string') {
        focoErrosTexto = snapshot.foco_erros_recentes;
      }
    }
    const DEBILIDADES_SEMANA = focoErrosTexto.trim() || "Revisión general de estructuras de conversación";

    const textoPrompt = prompt ? prompt.toString() : "";
    const temHistorico = Array.isArray(chatHistory) && chatHistory.length > 0;

    const instrucaoSistema = `
Eres la Mentora Haas. Tu alumno habla ${IDIOMA_NATIVO} y está aprendiendo ${IDIOMA_ALVO}. Debilidades: ${DEBILIDADES_SEMANA}.

[REGLAS CRÍTICAS DE SALIDA - SÉ ESTRICTO]
Tu respuesta en pantalla debe contener única y exclusivamente dos párrafos limpios sin etiquetas, separados por una línea en blanco:

PÁRRAFO 1 (100% en ${IDIOMA_NATIVO}):
- SI EL HISTORIAL ESTÁ VACÍO: Saluda cordialmente al alumno, dile que eres la Mentora Haas y menciona de forma motivadora que hoy van a enfocarse en practicar y mejorar: "${DEBILIDADES_SEMANA}". No agregues nada más.
- SI EL HISTORIAL YA TIENE MENSAJES: Prohibido saludar o dar la bienvenida. Comenta de forma muy fluida sobre lo que dijo el alumno o corrige constructivamente sus errores gramaticales.

PÁRRAFO 2 (100% en ${IDIOMA_ALVO}):
- Escribe una única pregunta directa, corta y muy natural formulada exclusivamente en ${IDIOMA_ALVO} para que el alumno continúe la práctica. 
- PROHIBIDO repetir saludos como "Olá", "Bienvenido" o frases introductorias en este segundo párrafo. Ve directo a la pregunta de práctica.
`;

    let stringHistorico = "";
    if (temHistorico) {
      stringHistorico = "\n\n[HISTORIAL RECIENTE DEL CHAT]\n" + chatHistory.slice(-5).map((h: any) => {
        const remitente = h.tipo === 'user' ? 'Alumno' : 'Mentora Haas';
        return `${remitente}: ${h.texto || h.content || ""}`;
      }).join("\n");
    } else {
      stringHistorico = "\n\n[HISTORIAL RECIENTE DEL CHAT]\n(Historial vacío. Esta es la primera interacción del alumno. Genera obligatoriamente el saludo pedagógico inicial mencionando las debilidades).";
    }

    const apiKeyGemini = "AQ.Ab8RN6I6ttBs87ZZMIvY2YAtDLXTz8UKzbgLq9UrwVQYzEtPhQ";
    const urlGemini = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKeyGemini}`;

    const resGemini = await fetch(urlGemini, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: `${instrucaoSistema}\n\n${stringHistorico}\n\nÚltimo mensaje recibido: "${textoPrompt}"\n\nGenera la respuesta perfecta de 2 párrafos:` }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1, // Temperatura baixa fixa a IA nas regras exatas
          topP: 0.8,
          maxOutputTokens: 800
        }
      })
    });

    if (!resGemini.ok) {
      const errTexto = await resGemini.text();
      return new Response(`Erro na API do Gemini: ${errTexto}`, { status: 500 });
    }

    const resultadoJson = await resGemini.json();
    const textoResposta = resultadoJson?.candidates?.[0]?.content?.parts?.[0]?.text || "Desculpe, tive um problema ao gerar a resposta.";

    return new Response(textoResposta, {
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });

  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  }
}
