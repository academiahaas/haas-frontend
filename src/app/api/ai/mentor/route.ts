import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Fila global na memória do Node para gerenciar as requisições sequencialmente
class RequestQueue {
  private queue: (() => Promise<void>)[] = [];
  private activeCount = 0;
  private maxConcurrent = 1; // Processa 1 por vez para blindar a CPU do servidor

  async enqueue(fn: () => Promise<void>): Promise<number> {
    return new Promise((resolve, reject) => {
      const position = this.queue.length + 1;
      
      this.queue.push(async () => {
        try {
          await fn();
        } catch (err) {
          reject(err);
        }
      });
      
      resolve(position);
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

  getQueueLength() {
    return this.queue.length;
  }
}

// Instância única global da fila
const globalQueue = ((global as any)._mentorQueue) || (((global as any)._mentorQueue) = new RequestQueue());

export async function POST(request: Request) {
  try {
    const { prompt, userId, unitId } = await request.json();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcHB4Zm9rZmhxanVkd2Z3Y2tkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTkyOTY3OCwiZXhwIjoyMDk1NTA1Njc4fQ.G5o3SANhFRmsvi_RSdoIkXvaVwfxFUHc-OVxBPtnMt4";
    
    if (!userId) return NextResponse.json({ success: false, error: "Falta o userId" }, { status: 400 });

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: userData } = await supabase.from('users').select('course_language, learning_motivation').eq('id', userId).single();
    
    // REDUZIDO DE 10 PARA OS 3 ERROS MAIS RECENTES
    const { data: errorLogs } = await supabase.from('user_error_logs').select('conteudo').eq('user_id', userId).order('id', { ascending: false }).limit(3);

    const idiomaRealCurso = userData?.course_language?.trim() || "PORTUGUESE";
    const motivacaoAluno = userData?.learning_motivation?.trim() || "Geral";
    const errosRecentesTexto = errorLogs ? errorLogs.map((e: any) => e.conteudo).join(', ') : "";

    // INSTRUÇÃO PEDAGÓGICA SUTIL E NATURAL
    const instrucaoSistema = `Você é a Mentora Haas, uma IA coach de idiomas humana e acolhedora da Academia Haas. 
Responda estritamente no idioma em que o aluno falar com você. 
Curso: ${idiomaRealCurso}. Motivação: ${motivacaoAluno}. 

DIRETRIZ CRÍTICA DE ERROS: 
O sistema identificou que o aluno cometeu recentemente estes deslizes: [${errosRecentesTexto}]. 
NUNCA diga expressões robóticas como "verifiquei seus 3 erros no banco". Em vez disso, use abordagens naturais em suas explicações se oportuno, como: "Notei que você pode se beneficiar de um reforço em...", "Lembre-se de praticar a estrutura X...", ou incorpore a correção sutilmente em seus exemplos cotidianos.

Responda em no máximo 2 frases curtas, diretas e fluidas.`;

    // Retorna uma Stream que aguarda na fila de execução sem derrubar a conexão
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    // Enfileira a requisição do Ollama
    globalQueue.enqueue(async () => {
      try {
        const resOllama = await fetch("http://127.0.0.1:11434/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "qwen2.5:3b", // MODELO DE 3 BILHÕES MAIS RÁPIDO
            system: instrucaoSistema,
            prompt: prompt,
            stream: true,
            options: { temperature: 0.3, num_predict: 80 }
          })
        });

        if (!resOllama.ok) {
          writer.write(encoder.encode("Erro temporário no motor de IA. Aguarde um instante..."));
          writer.close();
          return;
        }

        const reader = resOllama.body?.getReader();
        if (!reader) {
          writer.close();
          return;
        }

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
      } catch (err: any) {
        writer.write(encoder.encode("Instabilidade na fila. Processando sua resposta..."));
      } finally {
        writer.close();
      }
    });

    return new Response(readable, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  }
}