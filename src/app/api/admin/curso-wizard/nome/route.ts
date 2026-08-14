import { NextRequest, NextResponse } from "next/server";

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
    const { idioma_nativo, idioma_alvo, tipo_curso, publico, feedback } = await req.json();

    const TIPOS_CURSO: Record<string, string> = {
      standard: "curso general de idioma, cubriendo situaciones cotidianas variadas",
      estudio: "curso enfocado en preparacion academica y vida universitaria",
      viaje: "curso enfocado en situaciones de viaje y turismo",
      trabajo: "curso corporativo/de negocios, enfocado en ambiente profesional"
    };
    const PUBLICOS: Record<string, string> = {
      adultos: "adultos",
      jovenes: "jovenes y adolescentes",
      ninos: "ninos"
    };

    const prompt = `IMPORTANTE: responde TODO en espanol, sin mezclar con portugues ni ningun otro idioma.

Eres un experto en diseno curricular de idiomas.
Curso: idioma alvo ${idioma_alvo}, para hablantes nativos de ${idioma_nativo}, publico ${PUBLICOS[publico] || publico}, tipo: ${TIPOS_CURSO[tipo_curso] || tipo_curso}.${feedback ? `\nAJUSTE PEDIDO POR EL USUARIO (ten esto muy en cuenta): ${feedback}` : ""}

Genera SOLO un objeto JSON (sin markdown, sin texto extra), en espanol:
{
  "title": "titulo corto y atractivo del curso",
  "objective_autonomy": "objetivo de autonomia del alumno al finalizar el curso (2-3 frases, en espanol)",
  "operational_objective": "objetivo operacional practico (2-3 frases, en espanol)"
}`;

    const resultado = await chamarDeepseek(prompt);
    return NextResponse.json({ sucesso: true, dados: resultado });
  } catch (err: any) {
    console.error("Erro ao gerar nome do curso:", err);
    return NextResponse.json({ error: "Erro inesperado", detalhe: err.message }, { status: 500 });
  }
}
