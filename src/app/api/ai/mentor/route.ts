import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

class RequestQueue {
  private queue: (() => Promise<void>)[] = [];
  private activeCount = 0;
  private maxConcurrent = 1;

  async enqueue(fn: () => Promise<void>, onPositionCalculated: (pos: number) => void): Promise<void> {
    let position = this.queue.length + (this.activeCount > 0 ? 1 : 0);
    if (position === 0) position = 1;
    onPositionCalculated(position);

    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          await fn();
          resolve();
        } catch (err) {
          reject(err);
        }
      });
      this.next();
    });
  }

  private async next() {
    if (this.activeCount >= this.maxConcurrent || this.queue.length === 0) return;
    this.activeCount++;
    const nextFn = this.queue.shift();
    if (nextFn) {
      try {
        await nextFn();
      } finally {
        this.activeCount--;
        this.next();
      }
    }
  }
}

const globalSymbol = Symbol.for('haas.mentor.queue');
if (!(globalThis as any)[globalSymbol]) {
  (globalThis as any)[globalSymbol] = new RequestQueue();
}
const globalQueue = (globalThis as any)[globalSymbol];

const traduzirIdioma = (sigla: string): string => {
  if (!sigla) return "Portugués";
  const s = sigla.toLowerCase().trim();
  if (s === 'es' || s === 'espanhol' || s === 'español') return "Español";
  if (s === 'pt' || s === 'portugues' || s === 'português') return "Portugués";
  if (s === 'en' || s === 'ingles' || s === 'inglês' || s === 'english') return "Inglés";
  if (s === 'fr' || s === 'frances' || s === 'francês') return "Francés";
  if (s === 'it' || s === 'italiano') return "Italiano";
  return sigla;
};

export async function POST(request: Request) {
  try {
    const { prompt, userId } = await request.json();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcHB4Zm9rZmhxanVkd2Z3Y2tkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTkyOTY3OCwiZXhwIjoyMDk1NTA1Njc4fQ.G5o3SANhFRmsvi_RSdoIkXvaVwfxFUHc-OVxBPtnMt4"; 

    if (!userId) return NextResponse.json({ success: false, error: "Falta o userId" }, { status: 400 });

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: userData } = await supabase.from('users').select('name, native_language, course_language').eq('id', userId).single();
    const { data: snapshot } = await supabase.from('user_ai_pedagogic_snapshot').select('competencias_atuais, foco_erros_recentes').eq('user_id', userId).single();

    const IDIOMA_NATIVO = traduzirIdioma(userData?.native_language);
    const IDIOMA_ALVO = traduzirIdioma(userData?.course_language);
    const DEBILIDADES_SEMANA = snapshot?.foco_erros_recentes || "Revisão geral";

    const instrucaoSistema = `
[ROL Y OBJETIVO]
Eres un tutor de idiomas de IA altamente pedagógico, paciente y amigable. Tu objetivo es ayudar al usuario a practicar el "Idioma de Aprendizaje" (${IDIOMA_ALVO}), teniendo en cuenta que su idioma nativo es ${IDIOMA_NATIVO}.

[DATOS REALES DEL ALUMNO]
- native_language (Idioma Nativo): ${IDIOMA_NATIVO}
- course_language (Idioma que está Aprendiendo): ${IDIOMA_ALVO}
- Historial de debilidades de la semana: ${DEBILIDADES_SEMANA}

[REGLAS ESTRICTAS DE COMPORTAMIENTO]
1. Mensaje de Bienvenida: Tu saludo cordial y el comentario sobre sus debilidades (${DEBILIDADES_SEMANA}) DEBEN escribirse en ${IDIOMA_NATIVO}. Inmediatamente después de ese saludo, debes formular una pregunta sencilla de práctica redactada enteramente en ${IDIOMA_ALVO}. No mezcles palabras de ${IDIOMA_NATIVO} en la pregunta.
2. Tono General: Sé muy motivador y amigable. Usa frases de apoyo en ${IDIOMA_NATIVO}.

[CONTROL DE FLUJO]
- ESCENARIO A (El alumno responde bien en ${IDIOMA_ALVO}): Continúa en ${IDIOMA_ALVO} de forma natural y haz una única pregunta corta de seguimiento en ${IDIOMA_ALVO}.
- ESCENARIO B (El alumno comete un error gramatical en ${IDIOMA_ALVO}): Explícale el error amigablemente en ${IDIOMA_NATIVO}. Muéstrale la corrección en ${IDIOMA_ALVO}. Luego, hazle una pregunta en ${IDIOMA_ALVO} para que intente usar la forma correcta.
- ESCENARIO C (El alumno hace una duda directa en ${IDIOMA_NATIVO}): Pausa la práctica. Responde la duda detalladamente en ${IDIOMA_NATIVO}. Cierra con una pregunta en ${IDIOMA_ALVO}.

[REGLA DE ORO DE SALIDA - MANDATORIA]
Cualquiera que sea el escenario, tu última frase en pantalla DEBE ser única y exclusivamente una pregunta clara formulada al 100% en el idioma que está aprendiendo (${IDIOMA_ALVO}). Queda prohibido usar palabras de ${IDIOMA_NATIVO} dentro de la pregunta final.
`;

    const promptFinalOllama = prompt && prompt.trim().length > 0 ? prompt : "Hola";

    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    globalQueue.enqueue(async () => {
      try {
        const resOllama = await fetch("http://127.0.0.1:11434/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "qwen2.5:7b",
            system: instrucaoSistema,
            prompt: promptFinalOllama,
            stream: true,
            options: { temperature: 0.5 }
          })
        });

        if (!resOllama.ok) {
          try { await writer.write(encoder.encode("Erro no motor local")); } catch (e) {}
          return;
        }

        const reader = resOllama.body?.getReader();
        if (!reader) return;

        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += new TextDecoder().decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const parsed = JSON.parse(line);
              if (parsed.response) {
                try { await writer.write(encoder.encode(parsed.response)); } catch (e) {}
              }
            } catch (e) {}
          }
        }
      } catch (err) {
        try { await writer.write(encoder.encode("Instabilidade no processamento.")); } catch (e) {}
      } finally {
        try { await writer.close(); } catch (e) {}
      }
    }, async (position) => {
      try { await writer.write(encoder.encode(`QUEUE:${position}`)); } catch (e) {}
    }).catch(() => {});

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });

  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  }
}
