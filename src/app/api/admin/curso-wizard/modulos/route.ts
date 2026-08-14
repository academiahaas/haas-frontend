import { NextRequest, NextResponse } from "next/server";

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
    const { titulo_curso, level_tag, level_name, pedagogical_focus, total_hours, modulos_ja_criados, quantidade_modulos, feedback } = await req.json();

    const qtd = quantidade_modulos || 4;
    const horasPorModulo = Math.round(total_hours / qtd);

    const contextoAnterior = (modulos_ja_criados || []).length > 0
      ? `Modulos ya creados en niveles anteriores (NO repitas estos temas): ${(modulos_ja_criados || []).map((m: any) => m.module_title).join(", ")}.`
      : "";
    const ajuste = feedback ? `\nAJUSTE PEDIDO POR EL USUARIO (ten esto muy en cuenta): ${feedback}` : "";

    const prompt = `IMPORTANTE: responde TODO en espanol, sin mezclar con portugues ni otro idioma.

Curso: "${titulo_curso}". Nivel actual: ${level_tag} - ${level_name}. Foco pedagogico del nivel: "${pedagogical_focus}". Carga horaria total del nivel: ${total_hours}h.
${contextoAnterior}${ajuste}

Genera SOLO los nombres de ${qtd} modulos para este nivel, cada uno con aproximadamente ${horasPorModulo}h, cubriendo progresivamente el foco pedagogico del nivel, sin repetir temas de otros niveles.

Genera SOLO un objeto JSON en espanol:
{
  "modulos": [
    { "module_number": 1, "module_title": "titulo del modulo", "estimated_hours": ${horasPorModulo} }
  ]
}
NO incluyas objetivo pedagogico ni contenido tematico todavia.`;

    const resultado = await chamarDeepseek(prompt);
    return NextResponse.json({ sucesso: true, dados: resultado });
  } catch (err: any) {
    return NextResponse.json({ error: "Erro inesperado", detalhe: err.message }, { status: 500 });
  }
}
