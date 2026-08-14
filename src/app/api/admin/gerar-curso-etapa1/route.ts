import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function chamarDeepseek(prompt: string) {
  const resposta = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      model: "deepseek-v4-flash",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    })
  });
  if (!resposta.ok) {
    const erro = await resposta.text();
    throw new Error(`Erro DeepSeek: ${erro}`);
  }
  const dados = await resposta.json();
  return JSON.parse(dados.choices[0].message.content);
}

export async function POST(req: NextRequest) {
  try {
    const { descricao_curso, niveis } = await req.json();

    if (!descricao_curso) {
      return NextResponse.json({ error: "descricao_curso obrigatorio" }, { status: 400 });
    }

    const niveisAlvo = niveis && Array.isArray(niveis) && niveis.length > 0
      ? niveis
      : ["A1", "A2", "B1", "B2", "C1"];

    const prompt = `Voce e um especialista em desenho curricular de idiomas (CEFR).
Curso solicitado: "${descricao_curso}"
Niveis a criar: ${niveisAlvo.join(", ")}

Gere APENAS um objeto JSON (sem markdown, sem texto extra) no seguinte formato exato:
{
  "curso": {
    "title": "titulo curto do curso",
    "objective_autonomy": "objetivo de autonomia do aluno ao final do curso (2-3 frases)",
    "operational_objective": "objetivo operacional pratico (2-3 frases)"
  },
  "niveis": [
    {
      "level_tag": "A1",
      "level_name": "nome descritivo do nivel",
      "pedagogical_focus": "foco pedagogico principal desse nivel (2-3 frases)",
      "total_hours": 80
    }
  ]
}

Um objeto por nivel solicitado, na ordem certa. Seja especifico e pedagogicamente solido, nao generico.`;

    const resultado = await chamarDeepseek(prompt);

    return NextResponse.json({ sucesso: true, dados: resultado });
  } catch (err: any) {
    console.error("Erro ao gerar curso etapa 1:", err);
    return NextResponse.json({ error: "Erro inesperado", detalhe: err.message }, { status: 500 });
  }
}
