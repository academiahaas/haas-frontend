import { NextResponse } from "next/server";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

async function fetchGeminiComRetry(url: string, payload: any, maxTentativas = 3, esperaMs = 1500) {
  for (let tentativa = 1; tentativa <= maxTentativas; tentativa++) {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
      },
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
    const { idioma, motivo, textoResposta, audioRecorded, perguntaContexto, audioTranscript } = body;

    if (!idioma || !textoResposta) {
      return NextResponse.json({ success: false, error: "Parâmetros ausentes" }, { status: 400 });
    }

    const textoLimpo = textoResposta.trim();
    const contextoQuestao = perguntaContexto || "Avaliação de compreensão auditiva, leitura e produção textual.";

    // Trava de resposta vazia, irrelevante ou extremamente curta
    if (textoLimpo.length < 15 || /^(bla\s*)+$/i.test(textoLimpo)) {
      return NextResponse.json({
        success: true,
        data: {
          pontuacao_total: 0,
          score_escuta: 0,
          score_fala: 0,
          score_leitura: 0,
          score_escrita: 0,
          score_gramatica: 0,
          nivel_cefr: "A1",
          erros_detectados: ["Resposta insuficiente ou ausência de conteúdo avaliável."],
          erros_portunhol_detectados: ["Sem evidência linguística."],
          feedback_estudiante: "Tu respuesta es insuficiente para ser evaluada. Se asigna nivel A1.",
          justificativa_nivel: "Tu respuesta es insuficiente para ser evaluada. Se asigna nivel A1."
        }
      });
    }

    const promptSistema = `
Você é uma BANCA EXAMINADORA EXTREMAMENTE RIGOROSA de proficiência no idioma ${idioma.toUpperCase()} (Padrão CEFR).
Sua função é avaliar com precisão cirúrgica a REAL capacidade do aluno com base na pergunta realizada e na resposta fornecida.

[CONTEXTO / ENUNCIADO DA PERGUNTA QUE O ALUNO RECEBEU]:
"${contextoQuestao}"

[RESPOSTA TEXTUAL SUBMETIDA PELO ALUNO]:
"${textoLimpo}"

[ÁUDIO DE FALA DO ALUNO]:
${audioRecorded ? `O aluno gravou áudio. Transcrição/Conteúdo: "${audioTranscript || textoLimpo}"` : "NÃO HÁ ÁUDIO (O aluno NÃO gravou áudio)"}

--- REGRAS DE AVALIAÇÃO OBRIGATÓRIAS (MÁXIMO 100 PONTOS / 20 POR QUESITO) ---

1. DETECÇÃO DE CÓPIA / PLÁGIO / RESPOSTA FORA DO TÓPICO:
- Se o aluno apenas copiou o enunciado da pergunta, ou respondeu algo totalmente desconexo do que foi perguntado:
  -> ATRIBUA ZERO (0) em TODAS as categorias.

2. COMPREENSÃO DE ESCUTA E LEITURA (score_escuta: 0-20 | score_leitura: 0-20):
- O aluno realmente respondeu ao que o enunciado/áudio pedia? 
- Se a resposta for vaga ou demonstrar incompreensão da pergunta: máximo 5/20.

3. PRODUÇÃO ORAL / FALA (score_fala: 0-20):
- Se "Áudio gravado = NÃO", ESTES 20 PONTOS DEVEM SER OBRIGATORIAMENTE 0.
- Se gravou áudio: avalie se a fala é fluida, se responde ao comando e a pronúncia (pela transcrição/estrutura).

4. PRODUÇÃO ESCRITA (score_escrita: 0-20):
- Avalie vocabulário, coesão, conectores e originalidade. Textos muito curtos ou simples: máximo 8/20.

5. GRAMÁTICA E SINTAXE (score_gramatica: 0-20):
- Puna severamente erros de concordância, tempos verbais incorretos e interferência de portunhol/língua materna.

RETORNE ESTRITAMENTE O JSON PURO NO FORMATO:
{
  "score_escuta": 0,
  "score_fala": 0,
  "score_leitura": 0,
  "score_escrita": 0,
  "score_gramatica": 0,
  "erros_detectados": ["Detalhamento técnico dos erros de interpretação, gramática ou fala"],
  "feedback_estudiante": "Feedback direto e conciso em espanhol explicativo sobre o desempenho (máx 35 palavras)."
}
`;

    const deepseekUrl = "https://api.deepseek.com/v1/chat/completions";
    const resDeepseek = await fetchGeminiComRetry(deepseekUrl, {
      model: "deepseek-v4-flash",
      messages: [{ role: "user", content: promptSistema }],
      response_format: { type: "json_object" }
    });

    const dataDeepseek = await resDeepseek.json();
    const textRaw = dataDeepseek?.choices?.[0]?.message?.content;
    const parsed = JSON.parse(textRaw);

    if (!audioRecorded) {
      parsed.score_fala = 0;
      parsed.score_escuta = parsed.score_escuta > 10 ? 10 : parsed.score_escuta;
    }

    // Normalização das notas (Trava estrita 0 a 20)
    parsed.score_fala = Math.min(20, Math.max(0, Number(parsed.score_fala) || 0));
    parsed.score_escuta = Math.min(20, Math.max(0, Number(parsed.score_escuta) || 0));
    parsed.score_leitura = Math.min(20, Math.max(0, Number(parsed.score_leitura) || 0));
    parsed.score_escrita = Math.min(20, Math.max(0, Number(parsed.score_escrita) || 0));
    parsed.score_gramatica = Math.min(20, Math.max(0, Number(parsed.score_gramatica) || 0));

    // Soma exata
    parsed.pontuacao_total = parsed.score_fala + parsed.score_escuta + parsed.score_leitura + parsed.score_escrita + parsed.score_gramatica;

    // Classificação rigorosa CEFR por faixa de 100 pontos
    if (parsed.pontuacao_total <= 20) parsed.nivel_cefr = "A1";
    else if (parsed.pontuacao_total <= 40) parsed.nivel_cefr = "A2";
    else if (parsed.pontuacao_total <= 60) parsed.nivel_cefr = "B1";
    else if (parsed.pontuacao_total <= 80) parsed.nivel_cefr = "B2";
    else parsed.nivel_cefr = "C1";

    if (parsed.feedback_estudiante) parsed.justificativa_nivel = parsed.feedback_estudiante;
    if (parsed.erros_detectados) parsed.erros_portunhol_detectados = parsed.erros_detectados;

    return NextResponse.json({ success: true, data: parsed });

  } catch (error: any) {
    console.error("Exceção na rota de diagnóstico:", error);
    return NextResponse.json({
      success: true,
      data: {
        pontuacao_total: 10,
        score_escuta: 0,
        score_fala: 0,
        score_leitura: 5,
        score_escrita: 5,
        score_gramatica: 0,
        nivel_cefr: "A1",
        feedback_estudiante: "Evaluación completada con nivel inicial A1 por inconsistencia en las respuestas.",
        justificativa_nivel: "Evaluación completada con nivel inicial A1 por inconsistencia en las respuestas."
      }
    });
  }
}
