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
    const { titulo_curso, level_tag, level_name, total_hours, feedback } = await req.json();

    const prompt = `IMPORTANTE: responde TODO en espanol, sin mezclar con portugues ni otro idioma.

Curso: "${titulo_curso}". Nivel: ${level_tag} - ${level_name}. Carga horaria: ${total_hours}h.${feedback ? `\nAJUSTE PEDIDO POR EL USUARIO (ten esto muy en cuenta): ${feedback}` : ""}

Genera SOLO un objeto JSON en espanol:
{ "pedagogical_focus": "foco pedagogico principal de este nivel (2-3 frases en espanol)" }`;

    const resultado = await chamarDeepseek(prompt);
    return NextResponse.json({ sucesso: true, dados: resultado });
  } catch (err: any) {
    return NextResponse.json({ error: "Erro inesperado", detalhe: err.message }, { status: 500 });
  }
}
