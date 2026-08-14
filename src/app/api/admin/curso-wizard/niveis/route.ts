import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const DISTRIBUICAO_PADRAO: Record<string, number> = { A1: 12, A2: 16, B1: 20, B2: 24, C1: 28 };

async function chamarDeepseek(prompt: string) {
  const resposta = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}` },
    body: JSON.stringify({
      model: "deepseek-v4-flash",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    })
  });
  if (!resposta.ok) throw new Error(await resposta.text());
  const dados = await resposta.json();
  return JSON.parse(dados.choices[0].message.content);
}

export async function POST(req: NextRequest) {
  try {
    const { titulo_curso, idioma_nativo, idioma_alvo, niveis, feedback } = await req.json();
    const niveisAlvo = niveis && niveis.length > 0 ? niveis : ["A1", "A2", "B1", "B2", "C1"];

    const { data: ref } = await supabase
      .from("language_pair_hour_reference")
      .select("horas_minimas, horas_maximas, observacao")
      .eq("idioma_nativo", idioma_nativo)
      .eq("idioma_alvo", idioma_alvo)
      .maybeSingle();

    if (!ref) {
      return NextResponse.json({ error: `Sin referencia de horas para ${idioma_nativo} -> ${idioma_alvo}` }, { status: 400 });
    }

    const horasTotais = Math.round((ref.horas_minimas + ref.horas_maximas) / 2);
    const horasPorNivel: Record<string, number> = {};
    niveisAlvo.forEach((n: string) => {
      const pct = DISTRIBUICAO_PADRAO[n] || (100 / niveisAlvo.length);
      horasPorNivel[n] = Math.round((horasTotais * pct) / 100);
    });
    const refTexto = niveisAlvo.map((n: string) => `${n}: ${horasPorNivel[n]}h`).join(", ");
    const ajuste = feedback ? `\nAJUSTE PEDIDO POR EL USUARIO (ten esto muy en cuenta): ${feedback}` : "";

    const prompt = `IMPORTANTE: responde TODO en espanol, sin mezclar con portugues ni otro idioma.

Curso ya aprobado: "${titulo_curso}" (idioma alvo: ${idioma_alvo}, nativo: ${idioma_nativo}).
Genera SOLO los nombres de los niveles: ${niveisAlvo.join(", ")}.
Carga horaria OBLIGATORIA por nivel (no inventes otros numeros): ${refTexto}.${ajuste}

Genera SOLO un objeto JSON en espanol:
{
  "niveis": [
    { "level_tag": "A1", "level_name": "nombre descriptivo del nivel", "total_hours": 90 }
  ]
}
Un objeto por nivel, en orden, con total_hours usando OBLIGATORIAMENTE los valores dados. NO incluyas objetivo pedagogico todavia.`;

    const resultado = await chamarDeepseek(prompt);
    return NextResponse.json({ sucesso: true, dados: resultado });
  } catch (err: any) {
    return NextResponse.json({ error: "Erro inesperado", detalhe: err.message }, { status: 500 });
  }
}
