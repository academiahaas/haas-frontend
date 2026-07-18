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

export async function POST(request: Request) {
  try {
    const { prompt, userId } = await request.json();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcHB4Zm9rZmhxanVkd2Z3Y2tkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTkyOTY3OCwiZXhwIjoyMDk1NTA1Njc4fQ.G5o3SANhFRmsvi_RSdoIkXvaVwfxFUHc-OVxBPtnMt4";
    
    if (!userId) return NextResponse.json({ success: false, error: "Falta o userId" }, { status: 400 });

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Captura native_language (como ela fala) e course_language (o que ela estuda/ensina)
    const { data: userData } = await supabase.from('users').select('name, native_language, course_language').eq('id', userId).single();
    const { data: snapshot } = await supabase.from('user_ai_pedagogic_snapshot').select('competencias_atuais').eq('user_id', userId).single();

    const nomeAluno = userData?.name?.split(' ')[0] || "";
    
    // Idioma nativo/resposta
    const dbLang = (userData?.native_language || "").toUpperCase().trim();
    let langKey = "PORTUGUESE";
    if (dbLang === "SPANISH" || dbLang === "ESPAÑOL" || dbLang === "ES") langKey = "SPANISH";
    else if (dbLang === "ENGLISH" || dbLang === "EN") langKey = "ENGLISH";

    // Mapeamento do Idioma que a IA está ensinando (Course Language)
    const targetLangRaw = (userData?.course_language || "").toUpperCase().trim();
    let idiomaLecionado = "Inglês";
    let idiomaLecionadoES = "Inglés";
    let idiomaLecionadoEN = "English";

    if (targetLangRaw === "PORTUGUESE" || targetLangRaw === "PT" || targetLangRaw === "PORTUGUÊS") {
      idiomaLecionado = "Português";
      idiomaLecionadoES = "Portugués";
      idiomaLecionadoEN = "Portuguese";
    } else if (targetLangRaw === "SPANISH" || targetLangRaw === "ES" || targetLangRaw === "ESPAÑOL") {
      idiomaLecionado = "Espanhol";
      idiomaLecionadoES = "Español";
      idiomaLecionadoEN = "Spanish";
    }

    let dadosPedagogicosContexto = "";
    if (snapshot && snapshot.competencias_atuais) {
      const competencies = Object.entries(snapshot.competencias_atuais)
        .map(([key, val]) => ({ nome: key, nota: Number(val) }))
        .sort((a, b) => b.nota - a.nota);
        
      if (competencies.length >= 2) {
        const fortes = [competencies[0].nome, competencies[1].nome].join(', ');
        const fracos = competencies.length >= 4 
          ? [competencies[competencies.length - 1].nome, competencies[competencies.length - 2].nome].join(', ')
          : "";
        
        if (langKey === "SPANISH") {
          dadosPedagogicosContexto = `Perfil pedagógico del alumno - Puntos fuertes: ${fortes}. Áreas de oportunidad: ${fracos}.`;
        } else if (langKey === "ENGLISH") {
          dadosPedagogicosContexto = `Pedagogical profile - Strengths: ${fortes}. Growth areas: ${fracos}.`;
        } else {
          dadosPedagogicosContexto = `Perfil pedagógico - Pontos fortes: ${fortes}. Áreas de oportunidade: ${fracos}.`;
        }
      }
    }

    let instrucaoSistema = "";
    let promptFinalOllama = prompt;

    if (langKey === "SPANISH") {
      if (!promptFinalOllama) {
        promptFinalOllama = `Analiza mi rendimiento pedagógico actual basándote en mi perfil de forma directa.`;
      }
      instrucaoSistema = `Eres la Mentora Haas, una profesora de idiomas experta y coach psicopedagógica de la Academia Haas. Tu rol absoluto es actuar y responder como especialista e instructora en la enseñanza de ${idiomaLecionadoES}. Responde obligatoria y exclusivamente en ESPAÑOL nativo.
      
      REGLAS DE RESPUESTA:
      1. Si el alumno hace una pregunta o interacción directa, respóndela con prioridad absoluta enfocada en su aprendizaje de ${idiomaLecionadoES}.
      2. Utiliza los siguientes datos reales del alumno como contexto estratégico: Nombre del alumno: ${nomeAluno}. ${dadosPedagogicosContexto}
      3. Prohibido saludar formalmente, presentarte o usar listas y viñetas. Escribe en prosa fluida, continua y profesional.
      4. REGLA DE ORO: La respuesta completa no puede superar los 500 caracteres bajo ninguna circunstancia. Sé directa y concisa.`;
    } else if (langKey === "ENGLISH") {
      if (!promptFinalOllama) {
        promptFinalOllama = `Analyze my current pedagogical performance based on my profile directly.`;
      }
      instrucaoSistema = `You are Mentora Haas, an expert language teacher and pedagogical coach from Academia Haas. Your definitive role is to act and respond as a specialist instructor teaching ${idiomaLecionadoEN}. You must respond strictly and exclusively in NATIVE ENGLISH.
      
      RESPONSE RULES:
      1. If the student asks a direct question, prioritize answering it clearly in English, focused on their development in ${idiomaLecionadoEN}.
      2. Use the following real data as context: Student Name: ${nomeAluno}. ${dadosPedagogicosContexto}
      3. Do NOT greet, introduce yourself, or use bullet points. Write in smooth, continuous prose.
      4. GOLDEN RULE: The entire response must not exceed 500 characters under any circumstances. Be direct and concise.`;
    } else {
      if (!promptFinalOllama) {
        promptFinalOllama = `Analise meu desempenho pedagógico atual com base no meu perfil de forma direta.`;
      }
      instrucaoSistema = `Você é a Mentora Haas, professora de idiomas e coach psicopedagógica da Academia Haas. Seu papel fundamental é agir e responder como instrutora especialista no ensino de ${idiomaLecionado}. Responda estritamente em PORTUGUÊS.
      
      REGRAS DE RESPOSTA:
      1. Se o aluno interagir ou perguntar algo diretamente, responda com prioridade absoluta focada no domínio de ${idiomaLecionado}.
      2. Use os dados reais como contexto: Nome do aluno: ${nomeAluno}. ${dadosPedagogicosContexto}
      3. Não use saudações formais, não se apresente e não use listas. Escreva em fluxo contínuo de texto.
      4. REGRA DE OURO: A resposta inteira não pode ultrapassar 500 caracteres de jeito nenhum.`;
    }

    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    globalQueue.enqueue(async () => {
      try {
        const resOllama = await fetch("http://127.0.0.1:11434/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "qwen2.5:3b",
            system: instrucaoSistema,
            prompt: promptFinalOllama,
            stream: true,
            options: { temperature: 0.6, num_predict: 160 }
          })
        });

        if (!resOllama.ok) {
          writer.write(encoder.encode("Erro no motor local"));
          writer.close();
          return;
        }

        const reader = resOllama.body?.getReader();
        if (!reader) { writer.close(); return; }

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
                await writer.write(encoder.encode(parsed.response));
              }
            } catch (e) {}
          }
        }
      } catch (err) {
        writer.write(encoder.encode("Instabilidade no processamento."));
      } finally {
        writer.close();
      }
    }, (position) => {
      writer.write(encoder.encode(`QUEUE:${position}`));
    });

    return new Response(readable, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  }
}
