import { NextRequest, NextResponse } from "next/server";

const GEMINI_MODEL = "gemini-2.5-flash";

export async function POST(req: NextRequest) {
  try {
    const { texto, promptTema, minWords, maxWords, idioma } = await req.json();

    if (!texto || typeof texto !== "string" || texto.trim().length < 10) {
      return NextResponse.json({ erro: "Texto muito curto ou ausente." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY não configurada no servidor.");
      return NextResponse.json({ erro: "Serviço de correção indisponível no momento." }, { status: 503 });
    }

    const idiomaInstrucao =
      idioma === "pt" ? "Responda em português." :
      idioma === "en" ? "Respond in English." :
      "Responde en español.";

    const prompt = `Você é um corretor de provas de idioma, rigoroso e justo, no padrão de exames internacionais de proficiência (tipo Cambridge, DELE, CELPE-Bras).

Tema da redação proposto ao aluno: "${promptTema}"
Extensão esperada: entre ${minWords} e ${maxWords} palavras.

Texto do aluno:
"""
${texto}
"""

Avalie o texto considerando: adequação ao tema, coerência e coesão, correção gramatical, riqueza de vocabulário, e adequação à extensão pedida.

${idiomaInstrucao}

Responda ESTRITAMENTE em JSON puro, sem markdown, sem blocos de código, no formato:
{"nota": <número de 0 a 10, pode ter uma casa decimal>, "feedback": "<comentário construtivo de 2 a 4 frases, apontando pontos fortes e o que pode melhorar>"}`;

    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!resp.ok) {
      const errText = await resp.text();
      console.error("Erro na API Gemini:", errText);
      return NextResponse.json({ erro: "Falha ao processar correção." }, { status: 502 });
    }

    const data = await resp.json();
    const textoResposta: string = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    let resultado: { nota: number; feedback: string };
    try {
      const limpo = textoResposta.replace(/```json/g, "").replace(/```/g, "").trim();
      resultado = JSON.parse(limpo);
    } catch (e) {
      console.error("Falha ao parsear resposta da IA:", textoResposta);
      return NextResponse.json({ erro: "Resposta inválida da IA." }, { status: 502 });
    }

    const notaFinal = Math.max(0, Math.min(10, Number(resultado.nota) || 0));

    return NextResponse.json({
      nota: notaFinal,
      feedback: resultado.feedback || "",
    });
  } catch (err) {
    console.error("Erro na rota de correção de redação:", err);
    return NextResponse.json({ erro: "Erro interno ao corrigir redação." }, { status: 500 });
  }
}
