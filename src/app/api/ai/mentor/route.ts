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

export async function POST(request: Request) {
  try {
    const { prompt, userId } = await request.json();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcHB4Zm9rZmhxanVkd2Z3Y2tkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTkyOTY3OCwiZXhwIjoyMDk1NTA1Njc4fQ.G5o3SANhFRmsvi_RSdoIkXvaVwfxFUHc-OVxBPtnMt4";
    
    if (!userId) return NextResponse.json({ success: false, error: "Falta o userId" }, { status: 400 });

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: userData } = await supabase.from('users').select('course_language, learning_motivation').eq('id', userId).single();
    const { data: errorLogs } = await supabase.from('user_error_logs').select('conteudo').eq('user_id', userId).order('id', { ascending: false }).limit(3);
    
    // 1. Busca a tabela de snapshot pedagógico criada para o feedback personalizado
    const { data: snapshot } = await supabase.from('user_ai_pedagogic_snapshot').select('competencias_atuais, foco_erros_recentes').eq('user_id', userId).single();
    let dadosPedagogicosPrompt = "";
    
    if (snapshot && snapshot.competencias_atuais) {
      const competencias = Object.entries(snapshot.competencias_atuais)
        .map(([key, val]) => ({ nome: key, nota: Number(val) }))
        .sort((a, b) => b.nota - a.nota);
        
      if (competencias.length >= 4) {
        const forte1 = competencias[0].nome.toUpperCase();
        const forte2 = competencias[1].nome.toUpperCase();
        const fraco1 = competencias[competencias.length - 1].nome.toUpperCase();
        const fraco2 = competencias[competencias.length - 2].nome.toUpperCase();
        
        const errosLista = snapshot.foco_erros_recentes 
          ? Object.entries(snapshot.foco_erros_recentes).map(([k, v]) => `${k} (${v} erros)`).join(', ')
          : '';
          
        dadosPedagogicosPrompt = ` Perfil dinâmico do aluno: 2 maiores pontos fortes dele são ${forte1} e ${forte2}. Os 2 pontos críticos que ele precisa melhorar e focar agora são ${fraco1} e ${fraco2}. Erros específicos cometidos: ${errosLista}.`;
      }
    }

    const idiomaRealCurso = userData?.course_language?.trim() || "PORTUGUESE";
    const motivacaoAluno = userData?.learning_motivation?.trim() || "Geral";
    const errosRecentesTexto = errorLogs ? errorLogs.map((e: any) => e.conteudo).join(', ') : "";

    const instrucaoSistema = `Você é a Mentora Haas, uma IA coach de idiomas da Academia Haas. Responda estritamente no idioma em que o aluno falar com você. Curso: ${idiomaRealCurso}. Motivação: ${motivacaoAluno}.${dadosPedagogicosPrompt} Erros gerais do aluno para corrigir sutilmente: ${errosRecentesTexto}. Com base nas forças e fraquezas citadas, crie um feedback estruturado e contínuo, elogiando sutilmente os 2 pontos fortes e trazendo uma orientação prática sobre os 2 pontos a melhorar. Seja extremamente concisa e direta. Sua resposta inteira não pode ultrapassar o limite máximo de 300 caracteres de jeito nenhum.`;

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
            prompt: prompt,
            stream: true,
            options: { temperature: 0.3, num_predict: 80 }
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
      // Envia imediatamente a posição da fila para o front-end ler
      writer.write(encoder.encode(`QUEUE:${position}`));
    });

    return new Response(readable, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  }
}