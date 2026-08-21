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
    const { titulo_curso, level_tag, module_title, module_focus, unit_title, estimated_hours, feedback } = await req.json();

    const ajuste = feedback ? `\nAJUSTE PEDIDO POR EL USUARIO (ten esto muy en cuenta): ${feedback}` : "";

    const prompt = `IMPORTANTE: responde TODO en espanol, sin mezclar con portugues ni otro idioma.

Curso: "${titulo_curso}". Nivel: ${level_tag}. Modulo: "${module_title}" (foco: "${module_focus}"). Unidad: "${unit_title}". Carga horaria: ${estimated_hours}h.${ajuste}

IMPORTANTE SOBRE EL TONO: el "pedagogical_objective" debe ser escrito en tono neutro/impersonal, tipo ficha tecnica de catalogo. NO uses "el alumno", "el estudiante", "tu", "usted" ni ninguna referencia directa a una persona. Usa construcciones nominales o infinitivas.

"success_code": codigo corto que resuma el tema central de la unidad. maximo 10 caracteres, SOLO LETRAS MAYUSCULAS, sin espacios, sin tildes ni enies. Ejemplo: si la unidad es sobre falsos amigos, el codigo podria ser "FALSOAMIGO".

"skill_label": una etiqueta corta en formato "Categoria: tema especifico", en espanol. Ejemplo: "Lexico: falsos amigos", "Gramatica: preterito perfecto", "Pronunciacion: entonacion interrogativa".

"practical_phonetic_focus" debe describir en 1-2 frases el foco fonetico/de pronunciacion practico de esta unidad.

Genera SOLO un objeto JSON en espanol:
{
  "pedagogical_objective": "objetivo pedagogico de esta unidad, en tono neutro/impersonal (2-3 frases)",
  "situational_content": "contenido situacional/practico (2-3 frases)",
  "hidden_grammatical_structure": "estructura gramatical trabajada",
  "practical_phonetic_focus": "foco fonetico practico de esta unidad",
  "skill_label": "Categoria: tema especifico",
  "success_code": "CODIGOCORTO"
}`;

    const resultado = await chamarDeepseek(prompt);
    return NextResponse.json({ sucesso: true, dados: resultado });
  } catch (err: any) {
    return NextResponse.json({ error: "Erro inesperado", detalhe: err.message }, { status: 500 });
  }
}
