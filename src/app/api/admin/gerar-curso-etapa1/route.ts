import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DISTRIBUICAO_PADRAO: Record<string, number> = {
  A1: 12,
  A2: 16,
  B1: 20,
  B2: 24,
  C1: 28
};

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
    const { descricao_curso, idioma_nativo, idioma_alvo, niveis, distribuicao_customizada } = await req.json();

    if (!descricao_curso || !idioma_nativo || !idioma_alvo) {
      return NextResponse.json({ error: "descricao_curso, idioma_nativo e idioma_alvo sao obrigatorios" }, { status: 400 });
    }

    const niveisAlvo = niveis && Array.isArray(niveis) && niveis.length > 0
      ? niveis
      : ["A1", "A2", "B1", "B2", "C1"];

    const { data: referenciaHoras, error: erroRef } = await supabase
      .from("language_pair_hour_reference")
      .select("horas_minimas, horas_maximas, observacao")
      .eq("idioma_nativo", idioma_nativo)
      .eq("idioma_alvo", idioma_alvo)
      .maybeSingle();

    if (erroRef || !referenciaHoras) {
      return NextResponse.json({
        error: `Nao existe referencia de horas cadastrada para ${idioma_nativo} -> ${idioma_alvo}. Cadastre em language_pair_hour_reference primeiro.`
      }, { status: 400 });
    }

    const horasTotais = Math.round((referenciaHoras.horas_minimas + referenciaHoras.horas_maximas) / 2);

    const distribuicao = distribuicao_customizada || DISTRIBUICAO_PADRAO;

    const horasPorNivel: Record<string, number> = {};
    niveisAlvo.forEach((n: string) => {
      const pct = distribuicao[n] || (100 / niveisAlvo.length);
      horasPorNivel[n] = Math.round((horasTotais * pct) / 100);
    });

    const referenciaTexto = niveisAlvo
      .map((n: string) => `${n}: ${horasPorNivel[n]} horas`)
      .join(", ");

    const prompt = `Voce e um especialista em desenho curricular de idiomas seguindo o Marco Comum Europeu de Referencia (CEFR).
Curso solicitado: "${descricao_curso}"
Idioma nativo do aluno: ${idioma_nativo}
Idioma alvo (que sera ensinado): ${idioma_alvo}
Niveis a criar: ${niveisAlvo.join(", ")}

REGRA OBRIGATORIA DE CARGA HORARIA (baseada em ${horasTotais}h totais, distancia linguistica: "${referenciaHoras.observacao}"): use exatamente estes valores de horas totais por nivel, sem inventar outros numeros: ${referenciaTexto}.

IMPORTANTE: todo o conteudo pedagogico (nomes, focos, descricoes) deve ser pensado pensando em um falante nativo de ${idioma_nativo} aprendendo ${idioma_alvo}.

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
      "pedagogical_focus": "foco pedagogico principal desse nivel, adequado ao objetivo do curso e ao par de idiomas (2-3 frases)",
      "total_hours": 90
    }
  ]
}

Um objeto por nivel solicitado, na ordem certa, com total_hours usando OBRIGATORIAMENTE os valores da regra acima.`;

    const resultado = await chamarDeepseek(prompt);

    return NextResponse.json({
      sucesso: true,
      dados: resultado,
      horas_totais_curso: horasTotais,
      referencia_usada: referenciaHoras
    });
  } catch (err: any) {
    console.error("Erro ao gerar curso etapa 1:", err);
    return NextResponse.json({ error: "Erro inesperado", detalhe: err.message }, { status: 500 });
  }
}
