import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AQ.Ab8RN6I6ttBs87ZZMIvY2YAtDLXTz8UKzbgLq9UrwVQYzEtPhQ";

// Função de requisição com mecanismo de retry automático para contornar instabilidades 503
async function fetchGeminiComRetry(url: string, payload: any, maxTentativas = 3, esperaMs = 1500) {
  for (let tentativa = 1; tentativa <= maxTentativas; tentativa++) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) return res;

    // Se receber 503 (Sobrecarga temporária do Google) e ainda houver tentativas, aguarda e tenta novamente
    if (res.status === 503 && tentativa < maxTentativas) {
      await new Promise((resolve) => setTimeout(resolve, esperaMs * tentativa));
      continue;
    }

    const errText = await res.text();
    throw new Error(`Gemini API Http ${res.status}: ${errText}`);
  }
  throw new Error("Serviço do Gemini indisponível após múltiplas tentativas.");
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { idioma, motivo, textoResposta } = body;

    if (!idioma || !textoResposta) {
      return NextResponse.json({ success: false, error: "Parâmetros ausentes" }, { status: 400 });
    }

    const textoLimpo = textoResposta.trim();

    // Trava para respostas muito curtas, sem nexo ou testes ("bla bla bla")
    if (textoLimpo.length < 10 || /^(bla\s*)+$/i.test(textoLimpo) || /^(\w)\1+$/i.test(textoLimpo)) {
      return NextResponse.json({
        success: true,
        data: {
          pontuacao_total: 10,
          nivel_cefr: "A1",
          detalhamento_pontos: {
            compreensao_conteudo: 0,
            correcao_portunhol: 5,
            fluencia_duracao: 5
          },
          erros_detectados: ["Respuesta insuficiente o sin contenido evaluable."],
          erros_portunhol_detectados: ["Respuesta insuficiente."],
          feedback_estudiante: "Tu respuesta es muy corta o no contiene texto evaluable. Por favor, escribe una respuesta completa para determinar tu nivel real.",
          justificativa_nivel: "Tu respuesta es muy corta o no contiene texto evaluable. Por favor, escribe una respuesta completa para determinar tu nivel real."
        }
      });
    }

    let promptSistema = "";

    if (idioma === "portugues") {
      promptSistema = `
Você é um avaliador especialista em proficiência de Português (padrão CEFR). Sua função é avaliar a REAL PROFICIÊNCIA LINGUÍSTICA e FLUÊNCIA do candidato, de forma holística e sem engessamentos.

Texto do Candidato: "${textoLimpo}"
Objetivo do Candidato: "${motivo || "Não informado"}"

REGRAS CRÍTICAS DE AVALIAÇÃO:
1. Se o candidato escreveu em português natural, fluido, correto e sem erros gramaticais/portunhol graves, ele DEVE ser classificado entre B2, C1 ou C2 (70 a 100 pontos). Atribua C1/C2 (90-100 pts) para textos com domínio nativo ou avançado.
2. Atribua A1 ou A2 (0 a 49 pontos) APENAS se houver portunhol travado, erros gramaticais graves/frequentes ou incapacidade de se comunicar no idioma.
3. Avalie a coesão, vocabulário, estrutura sintática e gramática de forma fluida.

Tabela CEFR:
- 0 a 29: A1 (Iniciante)
- 30 a 49: A2 (Básico)
- 50 a 69: B1 (Intermediário)
- 70 a 89: B2 (Avançado)
- 90 a 100: C1/C2 (Proficiente / Nativo)

REGRA OBRIGATÓRIA DO FEEDBACK:
O campo "feedback_estudiante" DEVE ser escrito EM ESPANHOL, em SEGUNDA PESSOA ("tú") e ter no MÁXIMO 40 PALAVRAS.

Retorne ESTRITAMENTE o JSON puro:
{
  "pontuacao_total": 95,
  "nivel_cefr": "C1",
  "detalhamento_pontos": {
    "compreensao_conteudo": 35,
    "correcao_portunhol": 30,
    "fluencia_duracao": 30
  },
  "erros_detectados": [],
  "feedback_estudiante": "Demostraste un dominio fluido y natural del idioma portugués, con excelente estructura gramatical y vocabulario preciso. ¡Excelente trabajo!"
}
`;
    } else if (idioma === "espanhol") {
      promptSistema = `
Você é um avaliador especialista em proficiência de Espanhol (padrão CEFR). Sua função é avaliar a REAL PROFICIÊNCIA LINGUÍSTICA do candidato.

Texto do Candidato: "${textoLimpo}"
Objetivo do Candidato: "${motivo || "Não informado"}"

REGRAS CRÍTICAS DE AVALIAÇÃO:
1. Se o texto for escrito em espanhol correto, natural e bem estruturado, atribua nota alta (B2, C1 ou C2 - 70 a 100 pontos).
2. Atribua A1 ou A2 (0 a 49 pontos) APENAS se houver forte interferência de portunhol, erros graves de tempos verbais/pronomes ou falta de estrutura.

Tabela CEFR:
- 0 a 29: A1 | 30 a 49: A2 | 50 a 69: B1 | 70 a 89: B2 | 90 a 100: C1/C2

REGRA OBRIGATÓRIA DO FEEDBACK:
O campo "feedback_estudiante" DEVE ser escrito EM ESPANHOL, em SEGUNDA PESSOA ("tú") e ter no MÁXIMO 40 PALAVRAS.

Retorne ESTRITAMENTE o JSON puro:
{
  "pontuacao_total": 85,
  "nivel_cefr": "B2",
  "detalhamento_pontos": {
    "compreensao_conteudo": 30,
    "correcao_portunhol": 25,
    "fluencia_duracao": 30
  },
  "erros_detectados": [],
  "feedback_estudiante": "Demostraste un buen manejo del español con redacción clara y fluida. Sigue practicando para perfeccionar las estructuras más complejas."
}
`;
    } else {
      promptSistema = `
You are an expert English Language Assessment AI (CEFR Standard). Evaluate the candidate's REAL LINGUISTIC PROFICIENCY holistically.

Candidate Response: "${textoLimpo}"
Candidate Goal: "${motivo || "Not specified"}"

EVALUATION RULES:
1. Evaluate grammar, vocabulary richness, sentence complexity, and natural expression in English.
2. If the text is natural, fluent, and grammatically sound, assign a high score (B2, C1, or C2 - 70 to 100 points).
3. Assign A1 or A2 (0 to 49 points) ONLY if there are severe grammatical breakdowns or inability to communicate.

CEFR Scale:
- 0-29: A1 | 30-49: A2 | 50-69: B1 | 70-89: B2 | 90-100: C1/C2

MANDATORY FEEDBACK RULE:
The "feedback_estudiante" field MUST be written IN SPANISH, addressing the student DIRECTLY in SECOND PERSON ("tú"), and be MAXIMUM 40 WORDS long.

Return STRICTLY JSON format:
{
  "pontuacao_total": 85,
  "nivel_cefr": "B2",
  "detalhamento_pontos": {
    "compreensao_conteudo": 30,
    "correcao_portunhol": 25,
    "fluencia_duracao": 30
  },
  "erros_detectados": [],
  "feedback_estudiante": "Tu nivel de inglés es fluido y bien estructurado. Tienes buen vocabulario y coherencia en tus ideas. ¡Sigue así!"
}
`;
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    // Executa a requisição resiliente com retry
    const resGemini = await fetchGeminiComRetry(geminiUrl, {
      contents: [{ parts: [{ text: promptSistema }] }],
      generationConfig: { responseMimeType: "application/json" }
    });

    const dataGemini = await resGemini.json();
    const textRaw = dataGemini?.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(textRaw);

    if (parsed.feedback_estudiante) {
      parsed.justificativa_nivel = parsed.feedback_estudiante;
    }
    if (parsed.erros_detectados) {
      parsed.erros_portunhol_detectados = parsed.erros_detectados;
    }

    return NextResponse.json({ success: true, data: parsed });

  } catch (error: any) {
    console.error("Exceção na rota de diagnóstico:", error);
    return NextResponse.json({
      success: true,
      data: {
        pontuacao_total: 0,
        nivel_cefr: "A1",
        feedback_estudiante: "El servidor de IA experimentó una alta demanda temporal. Por favor, intenta enviar tu respuesta de nuevo en unos segundos.",
        justificativa_nivel: "El servidor de IA experimentó una alta demanda temporal. Por favor, intenta enviar tu respuesta de nuevo en unos segundos."
      }
    });
  }
}
