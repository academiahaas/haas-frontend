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

const globalQueue = ((global as any)._mentorQueue) || (((global as any)._mentorQueue) = new RequestQueue());

function traduzirTermo(termo: string, idioma: string): string {
  const t = termo.toUpperCase().trim();
  if (idioma === "SPANISH") {
    if (t === "ESCUTAR" || t === "LISTEN" || t === "LISTENING") return "Comprensión auditiva";
    if (t === "LER" || t === "READ" || t === "READING") return "Lectura";
    if (t === "ESCRITAR" || t === "ESCRITA" || t === "WRITE" || t === "WRITING") return "Escritura";
    if (t === "GRAMÁTICA" || t === "GRAMATICA" || t === "GRAMMAR") return "Gramática";
    if (t === "FALAR" || t === "SPEAK" || t === "SPEAKING") return "Expresión oral";
  }
  if (idioma === "ENGLISH") {
    if (t === "ESCUTAR") return "Listening";
    if (t === "LER") return "Reading";
    if (t === "ESCRITAR" || t === "ESCRITA") return "Writing";
    if (t === "GRAMÁTICA" || t === "GRAMATICA") return "Grammar";
    if (t === "FALAR") return "Speaking";
  }
  return termo;
}

export async function POST(request: Request) {
  try {
    const { prompt, userId } = await request.json();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcHB4Zm9rZmhxanVkd2Z3Y2tkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTkyOTY3OCwiZXhwIjoyMDk1NTA1Njc4fQ.G5o3SANhFRmsvi_RSdoIkXvaVwfxFUHc-OVxBPtnMt4";
    
    if (!userId) return NextResponse.json({ success: false, error: "Falta o userId" }, { status: 400 });

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // EXATAMENTE AQUI: Buscando a coluna native_language da tabela users do Supabase
    const { data: userData } = await supabase.from('users').select('native_language').eq('id', userId).single();
    const { data: snapshot } = await supabase.from('user_ai_pedagogic_snapshot').select('competencias_atuais').eq('user_id', userId).single();
    
    // Normalização baseada estritamente no dado original do banco de dados do aluno
    let langKey = "PORTUGUESE";
    if (userData && userData.native_language) {
      const dbLang = userData.native_language.toUpperCase().trim();
      if (dbLang === "SPANISH" || dbLang === "ESPAÑOL" || dbLang === "ES") langKey = "SPANISH";
      else if (dbLang === "ENGLISH" || dbLang === "EN") langKey = "ENGLISH";
    }

    let dadosPedagogicosPrompt = "";
    if (snapshot && snapshot.competencias_atuais) {
      const competencies = Object.entries(snapshot.competencias_atuais)
        .map(([key, val]) => ({ nome: key, nota: Number(val) }))
        .sort((a, b) => b.nota - a.nota);
        
      if (competencies.length >= 4) {
        const forte1 = traduzirTermo(competencies[0].nome, langKey);
        const forte2 = traduzirTermo(competencies[1].nome, langKey);
        const fraco1 = traduzirTermo(competencies[competencies.length - 1].nome, langKey);
        const fraco2 = traduzirTermo(competencies[competencies.length - 2].nome, langKey);
        
        if (langKey === "SPANISH") {
          dadosPedagogicosPrompt = ` Datos del perfil: Puntos fuertes actuales: ${forte1} y ${forte2}. Áreas críticas a mejorar: ${fraco1} y ${fraco2}.`;
        } else if (langKey === "ENGLISH") {
          dadosPedagogicosPrompt = ` Profile data: Current strengths: ${forte1} and ${forte2}. Critical areas to improve: ${fraco1} and ${fraco2}.`;
        } else {
          dadosPedagogicosPrompt = ` Perfil: Pontos fortes: ${forte1} e ${forte2}. Pontos a melhorar: ${fraco1} e ${fraco2}.`;
        }
      }
    }

    let promptFinalOllama = "";
    let instrucaoSistema = "";

    if (langKey === "SPANISH") {
      promptFinalOllama = `Analiza mi perfil pedagógico de forma cualitativa y continua en español nativo.`;
      instrucaoSistema = `Eres la Mentora Haas, una coach de idiomas experta. Tu objetivo es dar feedback pedagógico.
      REGLAS DE IDIOMA Y FORMATO EXTREMAS:
      - Responde COMPLETAMENTE en español nativo. No uses palabras en portugués como "fortes" ou "parabéns". Usa "fuertes" o "felicidades".
      - NUNCA uses números, porcentajes o listas de errores.
      - NO saludes ni des la bienvenida. Inicia directamente con la frase: "He revisado tu perfil..." o "Analizando tus avances...".
      - Menciona de forma fluida y cualitativa los dos puntos fortes y los dos puntos a mejorar que recibes aquí:${dadosPedagogicosPrompt}
      - Sé extremadamente breve, máximo 240 caracteres.`;
    } else if (langKey === "ENGLISH") {
      promptFinalOllama = `Please analyze my pedagogical profile and give me direct qualitative feedback in native English.`;
      instrucaoSistema = `You are Mentora Haas, an expert language coach. Your goal is to provide pedagogical feedback.
      LANGUAGE AND FORMAT RULES:
      - Respond COMPLETELY in native English. Do not use Portuguese words.
      - NEVER use numbers, percentages, or error logs.
      - DO NOT greet or welcome at the beginning. Start directly with: "I have reviewed your profile..." or "Analyzing your progress...".
      - Mention the two strengths and two areas to improve qualitatively from the data here:${dadosPedagogicosPrompt}
      - Be extremely brief, maximum 240 characters.`;
    } else {
      promptFinalOllama = `Por favor, analise meu perfil pedagógico de forma qualitativa e direta.`;
      instrucaoSistema = `Você é a Mentora Haas, uma coach de idiomas experta. Escreva a sua resposta inteiramente em português.
      REGRAS:
      - Não use números, contadores de erros ou porcentagens.
      - Mencione de forma sutil e qualitativa os 2 pontos fortes e os 2 pontos a melhorar trazidos aqui:${dadosPedagogicosPrompt}
      - Não use saudações no início. Comece diretamente com a análise de forma contínua (ex: "Revisei seu perfil...", "Analisando seu desempenho...").
      - Máximo de 240 caracteres.`;
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
            options: { temperature: 0.1, num_predict: 65 }
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
