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
    
    const { data: userData } = await supabase.from('users').select('name, native_language, course_language').eq('id', userId).single();
    const { data: snapshot } = await supabase.from('user_ai_pedagogic_snapshot').select('competencias_atuais').eq('user_id', userId).single();

    const nomeAluno = userData?.name?.split(' ')[0] || "Estudante";
    
    // Idioma de Comunicação (Native Language)
    const dbLang = (userData?.native_language || "").toUpperCase().trim();
    let langKey = "PORTUGUESE";
    if (dbLang === "SPANISH" || dbLang === "ESPAÑOL" || dbLang === "ES") langKey = "SPANISH";
    else if (dbLang === "ENGLISH" || dbLang === "EN") langKey = "ENGLISH";

    // Idioma de Ensino (Course Language)
    const targetLangRaw = (userData?.course_language || "").toUpperCase().trim();
    let idiomaLecionadoPT = "Inglês";
    let idiomaLecionadoES = "Inglés";
    let idiomaLecionadoEN = "English";

    if (targetLangRaw === "PORTUGUESE" || targetLangRaw === "PT" || targetLangRaw === "PORTUGUÊS") {
      idiomaLecionadoPT = "Português";
      idiomaLecionadoES = "Portugués";
      idiomaLecionadoEN = "Portuguese";
    } else if (targetLangRaw === "SPANISH" || targetLangRaw === "ES" || targetLangRaw === "ESPAÑOL") {
      idiomaLecionadoPT = "Espanhol";
      idiomaLecionadoES = "Español";
      idiomaLecionadoEN = "Spanish";
    }

    // Extração estritamente dinâmica das competências
    let fortes = "";
    let fracos = "";
    if (snapshot && snapshot.competencias_atuais) {
      const competencies = Object.entries(snapshot.competencias_atuais)
        .map(([key, val]) => ({ nome: key, nota: Number(val) }))
        .sort((a, b) => b.nota - a.nota);
        
      if (competencies.length >= 2) {
        fortes = [competencies[0].nome, competencies[1].nome].join(', ');
        fracos = competencies.length >= 4 
          ? [competencies[competencies.length - 1].nome, competencies[competencies.length - 2].nome].join(', ')
          : "";
      }
    }

    let instrucaoSistema = "";
    const prefixoTrava = "[REGLA CRÍTICA DE LONGITUD: Responde de forma extremadamente directa y concisa. Está PROHIBIDO extenderse. Tu respuesta completa DEBE tener menos de 80 palabras totales. Corta el texto de inmediato al cumplir el objetivo. No uses introducciones largas.] ";
    let promptFinalOllama = prompt;
    const esDuvidaDireta = !!(prompt && prompt.trim().length > 0 && !prompt.toLowerCase().includes("feedback") && !prompt.toLowerCase().includes("analiza"));
    if (!esDuvidaDireta) { promptFinalOllama = ""; }

        // ==========================================
    // ADIÇÃO: MODO PROFESSORA ATIVA (DÚVIDAS)
    // ==========================================
    if (esDuvidaDireta) {
      if (langKey === "SPANISH") {
        instrucaoSistema = "Eres la Mentora Haas, profesora experta de " + idiomaLecionadoES + ". El alumno está aprendiendo EXCLUSIVAMENTE el idioma " + idiomaLecionadoES + " y te hace una pregunta en este contexto. Comunícate 100% en ESPAÑOL. Responde con prioridad absoluta explicando su duda gramatical o de vocabulario sobre " + idiomaLecionadoES + ". Jamás confundas esto con estructuras de otros idiomas. Para explicarlo de forma redonda, conecta de manera sutil e integrada el contenido de sus errores o debilidades recientes en el curso (" + (fracos || "gramática") + ") junto con la nueva duda que te acaba de plantear. Escribe en prosa fluida, sin viñetas ni listas. Máximo 600 caracteres.";
      } else if (langKey === "ENGLISH") {
        instrucaoSistema = "You are Mentora Haas, an expert teacher of " + idiomaLecionadoEN + ". The student is EXCLUSIVELY learning " + idiomaLecionadoEN + " and is asking a question within this context. Respond 100% in ENGLISH. Directly explain their grammatical or vocabulary doubt regarding " + idiomaLecionadoEN + ", never confusing it with other languages. To make the explanation powerful, seamlessly weave into your response parts of their recent mistakes or language weaknesses (" + (fracos || "grammar") + "), explaining them together with this new doubt. Write in smooth paragraphs without bullet points. Maximum 600 caracteres.";
      } else {
        instrucaoSistema = "Você é a Mentora Haas, professora especialista em " + idiomaLecionadoPT + ". O aluno está aprendendo EXCLUSIVAMENTE o idioma " + idiomaLecionadoPT + " e está te fazendo uma pergunta dentro desse contexto. Responda 100% em PORTUGUÊS com prioridade absoluta. Explique a dúvida gramatical ou de vocabulário sobre " + idiomaLecionadoPT + ", sem jamais confundir com regras de outros idiomas. Para enriquecer a explicação, conecte de forma sutil e orgânica elementos dos erros e pontos fracos recentes dele (" + (fracos || "sintaxe") + ") junto com a nova dúvida apresentada. Escreva em fluxo de texto corrido, sem tópicos ou listas. Máximo 600 caracteres.";
      }
    } else {
    if (langKey === "SPANISH") {
      if (!promptFinalOllama) {
        promptFinalOllama = `Analiza mi rendimiento y guíame en mi aprendizaje de ${idiomaLecionadoES}.`;
      }
      instrucaoSistema = `Eres la Mentora Haas, una profesora experta nativa del idioma ${idiomaLecionadoES} y coach psicopedagógica de la Academia Haas. Tu objetivo absoluto es dar consejos tácticos para que el alumno aprenda y domine el ${idiomaLecionadoES}, comunicándote en ESPAÑOL. No te confundas: el idioma que enseñas es ${idiomaLecionadoES}.
      
      MATRIZ DE EJERCICIOS HAAS DISPONIBLES (Debes recomendar los adecuados para sus debilidades):
      - Si falla en Gramática/Sintaxis/Errores: Recomienda usar "Corrección Sintática", "Bloques de Gramática" o "Ordenación de Frases".
      - Si falla en Comprensión/Lectura: Recomienda usar "Análisis de Contexto", "Lectura Veloz" o "Lectura Progressiva".
      - Si falla en Escritura/Vocabulario/Escucha: Recomienda usar "Dictado Práctico", "Spelling Bee" o "Traducción Inversa".
      - Si falla en Habla/Fluidez: Recomienda usar "Conversación IA" o "Lab. de Pronunciación".

      REGLAS DE MENTORÍA:
      1. Da un saludo humano y natural a ${nomeAluno}.
      2. Basándote en sus debilidades (${fracos || 'progreso general'}), recomiéndale imperativamente entrenar usando los nomes exactos de los ejercicios Haas listados arriba. Eres libre de complementar con consejos del mundo real (libros, series, inmersión), pero los ejercicios de la plataforma son la base obligatoria.
      3. Contexto: Alumno: ${nomeAluno}. Puntos fuertes: ${fortes}. Áreas débiles: ${fracos}.
      4. Redacta en prosa corrida y fluida. Prohibido usar listas, viñetas o guiones.
      5. LÍMITE: Máximo 500 caracteres totales. Sé precisa y concisa.`;
    } else if (langKey === "ENGLISH") {
      if (!promptFinalOllama) {
        promptFinalOllama = `Analyze my performance and guide me in my learning journey of ${idiomaLecionadoEN}.`;
      }
      instrucaoSistema = `You are Mentora Haas, an expert language teacher and coach specializing in teaching ${idiomaLecionadoEN}. Your sole purpose is to instruct the student to excel in ${idiomaLecionadoEN}, communicating strictly in ENGLISH. Remember: the target language you are teaching is ${idiomaLecionadoEN}.
      
      HAAS AVAILABLE EXERCISES MATRIX (You must prescribe the right ones based on weaknesses):
      - For Grammar/Syntax/Errors: Prescribe "Syntactic Correction", "Grammar Blocks", or "Sentence Ordering".
      - For Reading/Context: Prescribe "Context Analysis", "Speed Reading", or "Progressive Reading".
      - For Listening/Vocabulary/Writing: Prescribe "Practical Dictation", "Spelling Bee", or "Reverse Translation".
      - For Speaking/Fluency: Prescribe "AI Conversation" or "Pronunciation Lab".

      COACHING RULES:
      1. Greet ${nomeAluno} warmly and naturally.
      2. Target their growth areas (${fracos || 'general course metrics'}) by explicitly telling them to use the specific Haas platform exercises listed above. You can mention external immersive habits (reading, media) as complementary tips, but always anchoring them to our system modules.
      3. Context: Student: ${nomeAluno}. Strengths: ${fortes}. Growth Areas: ${fracos}.
      4. Write in continuous, smooth paragraphs. Do not use bullets or markdown lists.
      5. LIMIT: Maximum 500 characters. Keep it brief and high-impact.`;
    } else {
      // Bloco nativo em Português ensinando o idioma-alvo (Ex: Inglês/Espanhol)
      if (!promptFinalOllama) {
        promptFinalOllama = `Analise meu desempenho e me guie no aprendizado de ${idiomaLecionadoPT}.`;
      }
      instrucaoSistema = `Você é a Mentora Haas, professora de idiomas e coach psicopedagógica especialista no ensino de ${idiomaLecionadoPT}. Seu papel principal é instruir o aluno a evoluir no ${idiomaLecionadoPT}, comunicando-se em PORTUGUÊS. Lembre-se: o idioma que você ensina é o ${idiomaLecionadoPT}.
      
      MATRIZ DE EXERCÍCIOS HAAS (Você deve recomendar os ideais para corrigir as fraquezas dele):
      - Se a falha for em Gramática/Sintaxe/Erros: Recomende "Caça Erro", "Blocos de Gramática", "Ordenação de Frases" ou "Reordenação de Parágrafos".
      - Se a falha for em Compreensão/Leitura: Recomende "Múltipla Escolha", "Leitura Veloz" ou "Marchas de Áudio".
      - Se a falha for em Escrita/Vocabulário/Escuta: Recomende "Palavra Oculta", "Spelling Bee" ou "Tradução Inversa".
      - Se a falha for em Fala/Fluidez: Recomende "Prática de Conversação" ou "Treino de Fala".

      REGRAS DE MENTORIA:
      1. Cumprimente ${nomeAluno} de forma calorosa e humana no início.
      2. Aponte os pontos fortes (${fortes || 'desempenho geral'}) e áreas de oportunidade (${fracos || 'desempenho geral'}), direcionando o aluno explicitamente para os exercícios correspondentes na nossa plataforma usando os nomes exatos mapeados acima. Sinta-se livre para somar dicas do cotidiano (músicas, livros, rotina), mas os treinos do Haas devem ser citados como prioridade de evolução.
      3. Contexto real: Aluno: ${nomeAluno}. Fortes: ${fortes}. Áreas de oportunidade: ${fracos}.
      4. Escreva em fluxo de texto corrido e amigável. Não use listas ou tópicos.
      5. LIMITE: Máximo de 500 caracteres totais.`;
    }

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
            model: "qwen2.5:7b",
            system: prefixoTrava + instrucaoSistema,
            prompt: promptFinalOllama,
            stream: true,
            options: { temperature: esDuvidaDireta ? 0.55 : 0.7, num_predict: esDuvidaDireta ? 130 : 180 } // Token limit perfeitamente calibrado para o teto real de 500 caracteres com pontuação
          })
        });

        if (!resOllama.ok) {
          writer.write(encoder.encode("Erro no motor local"));
          return;
        }

        const reader = resOllama.body?.getReader();
        if (!reader) { return; }

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
