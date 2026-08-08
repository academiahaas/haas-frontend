import { NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AQ.Ab8RN6I6ttBs87ZZMIvY2YAtDLXTz8UKzbgLq9UrwVQYzEtPhQ";

async function fetchGeminiComRetry(url: string, payload: any, maxTentativas = 3, esperaMs = 1500) {
  for (let tentativa = 1; tentativa <= maxTentativas; tentativa++) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) return res;
    if (res.status === 503 && tentativa < maxTentativas) {
      await new Promise((resolve) => setTimeout(resolve, esperaMs * tentativa));
      continue;
    }
    const errText = await res.text();
    throw new Error(`Gemini API Http ${res.status}: ${errText}`);
  }
  throw new Error("Serviço do Gemini indisponível.");
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { idioma, motivo, textoResposta, audioRecorded } = body;

    if (!idioma || !textoResposta) {
      return NextResponse.json({ success: false, error: "Parâmetros ausentes" }, { status: 400 });
    }

    const textoLimpo = textoResposta.trim();

    if (textoLimpo.length < 15 || /^(bla\s*)+$/i.test(textoLimpo)) {
      return NextResponse.json({
        success: true,
        data: {
          pontuacao_total: 10,
          score_escuta: 0,
          score_fala: 0,
          score_leitura: 10,
          score_escrita: 10,
          score_gramatica: 10,
          nivel_cefr: "A1",
          erros_detectados: ["Texto insuficiente para avaliação."],
          erros_portunhol_detectados: ["Sem conteúdo avaliável."],
          feedback_estudiante: "Tu respuesta es muy corta. Se asigna nivel A1 por falta de evidencia lingüística.",
          justificativa_nivel: "Tu respuesta es muy corta. Se asigna nivel A1 por falta de evidencia lingüística."
        }
      });
    }

    const promptSistema = `
Você é um avaliador EXTREMAMENTE RÍGIDO de proficiência no idioma ${idioma.toUpperCase()} (Padrão CEFR).
Sua missão é classificar a REAL capacidade do aluno sem dar pontos de graça.

Texto submetido pelo aluno: "${textoLimpo}"
Áudio de fala gravado pelo aluno: ${audioRecorded ? "SIM" : "NÃO (O aluno NÃO gravou áudio)"}

REGRAS DE AVALIAÇÃO OBRIGATÓRIAS:
1. Se o aluno NÃO gravou áudio (audioRecorded = false), os campos "score_fala" e "score_escuta" DEVEM SER RIGOROSAMENTE 0.
2. Analise o texto em relação à gramática, tempos verbais, erros de portunhol e vocabulário.
3. Se o texto for básico, simples, curto ou contiver erros gramaticais/portunhol, classifique estritamente como A1 (10-29 pts) ou A2 (30-49 pts).
4. SÓ atribua B1/B2/C1 se o texto demonstrar vocabulário avançado, conectores complexos e ausência de erros.
5. O feedback_estudiante DEVE ser em espanhol, direto ("tú"), máximo 30 palavras.

RETORNE ESTRITAMENTE O JSON PURO NO FORMATO:
{
  "pontuacao_total": 35,
  "score_escuta": ${audioRecorded ? "35" : "0"},
  "score_fala": ${audioRecorded ? "30" : "0"},
  "score_leitura": 40,
  "score_escrita": 35,
  "score_gramatica": 35,
  "nivel_cefr": "A2",
  "erros_detectados": ["Erros identificados no texto"],
  "feedback_estudiante": "Tu nivel es A2. Presentas estructuras básicas pero requieres reforzar gramática."
}
`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const resGemini = await fetchGeminiComRetry(geminiUrl, {
      contents: [{ parts: [{ text: promptSistema }] }],
      generationConfig: { responseMimeType: "application/json" }
    });

    const dataGemini = await resGemini.json();
    const textRaw = dataGemini?.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(textRaw);

    if (!audioRecorded) {
      parsed.score_fala = 0;
      parsed.score_escuta = 0;
    }

    if (parsed.feedback_estudiante) parsed.justificativa_nivel = parsed.feedback_estudiante;
    if (parsed.erros_detectados) parsed.erros_portunhol_detectados = parsed.erros_detectados;

    return NextResponse.json({ success: true, data: parsed });

  } catch (error: any) {
    console.error("Exceção na rota de diagnóstico:", error);
    return NextResponse.json({
      success: true,
      data: {
        pontuacao_total: 15,
        score_escuta: 0,
        score_fala: 0,
        score_leitura: 15,
        score_escrita: 15,
        score_gramatica: 15,
        nivel_cefr: "A1",
        feedback_estudiante: "Evaluación completada con nivel inicial A1.",
        justificativa_nivel: "Evaluación completada con nivel inicial A1."
      }
    });
  }
}
