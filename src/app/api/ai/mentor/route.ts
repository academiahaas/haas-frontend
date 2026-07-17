import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const { prompt, userId, unitId } = await request.json();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcHB4Zm9rZmhxanVkd2Z3Y2tkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTkyOTY3OCwiZXhwIjoyMDk1NTA1Njc4fQ.G5o3SANhFRmsvi_RSdoIkXvaVwfxFUHc-OVxBPtnMt4";
    
    if (!userId) return NextResponse.json({ success: false, error: "Identificador do aluno ausente." }, { status: 400 });

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: userData, error: userError } = await supabase.from('users').select('course_language, learning_motivation').eq('id', userId).single();
    
    if (userError) return NextResponse.json({ success: false, error: userError.message }, { status: 500 });

    const { data: errorLogs, error: logsError } = await supabase.from('user_error_logs').select('conteudo').eq('user_id', userId).order('id', { ascending: false }).limit(10);
    
    if (logsError) return NextResponse.json({ success: false, error: logsError.message }, { status: 500 });

    const idiomaRealCurso = userData?.course_language?.trim() || "";
    const motivacaoAluno = userData?.learning_motivation?.trim() || "";
    const errosRecentesTexto = errorLogs ? errorLogs.map((e: any) => e.conteudo).join(', ') : "";

    const instrucaoSistema = `Você é a Mentora Haas, uma IA mentora pedagógica especialista da Academia Haas. Responda estritamente no mesmo idioma utilizado pelo aluno na última interação.
Dados Reais extraídos do banco de dados:
- Idioma do Curso: ${idiomaRealCurso}
- Foco/Motivação de Estudo: ${motivacaoAluno}
- Histórico de erros recentes (Arena): ${errosRecentesTexto}

Instrução pedagógica: Baseie suas correções e feedbacks sutilmente nas falhas reais listadas acima.
REGRA CRÍTICA: Responda em no máximo 2 frases curtas, diretas e naturais.`;

    const resOllama = await fetch("http://127.0.0.1:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "qwen2.5:7b",
        system: instrucaoSistema,
        prompt: prompt,
        stream: true,
        options: { temperature: 0.3, num_predict: 80 }
      })
    });

    if (!resOllama.ok) return new Response("Erro de comunicação com o motor local.", { status: 500 });

    const encoder = new TextEncoder();
    const customStream = new ReadableStream({
      async start(controller) {
        const reader = resOllama.body?.getReader();
        if (!reader) { controller.close(); return; }
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
              if (parsed.response) controller.enqueue(encoder.encode(parsed.response));
            } catch (e) {}
          }
        }
        controller.close();
      }
    });

    return new Response(customStream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  }
}