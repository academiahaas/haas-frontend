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
    const { titulo_curso, level_tag, module_title, thematic_content, estimated_hours, unidades_ja_criadas, feedback } = await req.json();

    const contextoAnterior = (unidades_ja_criadas || []).length > 0
      ? `Unidades ya creadas en modulos anteriores (NO repitas estos temas): ${(unidades_ja_criadas || []).map((u: any) => u.unit_title).join(", ")}.`
      : "";
    const ajuste = feedback ? `\nAJUSTE PEDIDO POR EL USUARIO (ten esto muy en cuenta): ${feedback}` : "";

    const prompt = `IMPORTANTE: responde TODO en espanol, sin mezclar con portugues ni otro idioma.

Curso: "${titulo_curso}". Nivel: ${level_tag}. Modulo actual: "${module_title}". Contenido tematico: "${thematic_content}". Carga horaria del modulo: ${estimated_hours}h.
${contextoAnterior}${ajuste}

CANTIDAD DE UNIDADES: no uses un numero fijo. Decide vos mismo cuantas unidades son necesarias (pueden ser 3, 6, 10, 15 o mas) para cubrir con profundidad TODO el contenido tematico de este modulo, respetando la carga horaria total de ${estimated_hours}h repartida de forma equilibrada entre ellas. Si el tema es amplio, crea mas unidades; si es acotado, crea menos. Nunca dejes contenido importante afuera solo por limitarte a pocas unidades.

Genera SOLO un objeto JSON en espanol:
{
  "unidades": [
    { "unit_number": "1", "unit_title": "titulo de la unidad", "estimated_hours": 0 }
  ]
}
La suma de "estimated_hours" de todas las unidades debe ser igual a ${estimated_hours}.
NO incluyas objetivo pedagogico todavia.`;

    const resultado = await chamarDeepseek(prompt);
    return NextResponse.json({ sucesso: true, dados: resultado });
  } catch (err: any) {
    return NextResponse.json({ error: "Erro inesperado", detalhe: err.message }, { status: 500 });
  }
}
