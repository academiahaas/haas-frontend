import { NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AQ.Ab8RN6I6ttBs87ZZMIvY2YAtDLXTz8UKzbgLq9UrwVQYzEtPhQ";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { idioma, motivo, textoResposta } = body;

    if (!idioma || !textoResposta) {
      return NextResponse.json({ success: false, error: "Parâmetros ausentes" }, { status: 400 });
    }

    const textoLimpo = textoResposta.trim();

    // Filtro estrito para respostas irrelevantes, curtas ou testes
    if (textoLimpo.length < 15 || /^(bla\s*)+$/i.test(textoLimpo) || /^(\w)\1+$/i.test(textoLimpo)) {
      return NextResponse.json({
        success: true,
        data: {
          score_fala: 0,
          score_escrita: 0,
          pontuacao_total: 0,
          nivel_cefr: "A1",
          detalhamento_pontos: {
            compreensao_conteudo: 0,
            correcao_portunhol: 0,
            fluencia_duracao: 0
          },
          erros_detectados: [
            "Respuesta insuficiente ou sem estrutura linguística adequada ao tema."
          ],
          erros_portunhol_detectados: [
            "Respuesta insuficiente ou sem estrutura linguística adequada ao tema."
          ],
          feedback_estudiante: "Tu respuesta es demasiado corta o no aborda la prueba planteada. Para evaluar tu nivel real, intenta responder con oraciones completas demostrando comprensión del texto.",
          justificativa_nivel: "Tu respuesta es demasiado corta o no aborda la prueba planteada. Para evaluar tu nivel real, intenta responder con oraciones completas demostrando comprensión del texto."
        }
      });
    }

    let promptSistema = "";

    if (idioma === "portugues") {
      promptSistema = `
Você é um avaliador EXTREMAMENTE RÍGIDO e EXIGENTE de proficiência em Português para Hispanofalantes (Nivelamento Institucional HAAS). Sua missão é avaliar com rigor de autoridade policial.

TEXTO DE REFERÊNCIA (O aluno DEVE demonstrar que entendeu esta situação):
"Embora o projeto tenha sido aprovado na reunião de ontem, a diretoria exigiu que nós refizéssemos o orçamento até o fim da tarde. Caso a equipe não consiga alinhar os prazos a tempo, haverá necessidade de adiar o lançamento, o que traria prejuízos financeiros significativos para a empresa."

Resposta do aluno: "${textoLimpo}"
Objetivo: "${motivo || "Não informado"}"

REGRAS DE PONTUAÇÃO RÍGIDA (MÁXIMO 100 PONTOS TOTAL):
1. COMPREENSÃO DE CONTEÚDO E RELEVÂNCIA (0 a 40 pontos):
   - CRÍTICO: Se o aluno escreveu uma frase gramaticalmente bonita, mas que NÃO ABORDA o tema (projeto, orçamento, prazos, prejuízo, diretoria), ATRIBUA 0 NESTE QUESITO.
   - Se o aluno não entendeu o texto de referência, a pontuação total em ambas as habilidades NÃO PODE ULTRAPASSAR 20 PONTOS (Nível A1).
2. CORREÇÃO GRAMATICAL E ZERO PORTUNHOL (0 a 30 pontos):
   - Subtraia 10 PONTOS por QUALQUER erro de Portunhol (ex: uso de "hasta", "pero", "sin embargo", "aunque", regência inadequada ou confusão de falso cognato).
3. ESTRUTURA E COERÊNCIA (0 a 30 pontos):
   - Avalie se a resposta é completa, articulada e coerente.

PONTUAÇÃO SEPARADA E ESCALA CEFR:
- "score_fala": Pontuação real da habilidade Oral/Auditiva (0 a 100). Se não entendeu o tema, MÁXIMO 20.
- "score_escrita": Pontuação real da habilidade de Leitura/Escrita e Gramática (0 a 100). Se não entendeu o tema, MÁXIMO 20.
- "pontuacao_total": Média exata entre as duas notas.
- Tabela CEFR: 0-20 = A1 | 21-40 = A2 | 41-60 = B1 | 61-80 = B2 | 81-100 = C1.

REGRA OBRIGATÓRIA DO FEEDBACK ALUNO:
O campo "feedback_estudiante" DEVE ser escrito EM ESPANHOL, de forma AMIGÁVEL e ENCORAJADORA, em SEGUNDA PESSOA ("tú") e ter no MÁXIMO 40 PALAVRAS. Explique o motivo da pontuação sem ser agressivo no texto.

Retorne ESTRITAMENTE em formato JSON puro sem markdown:
{
  "score_fala": 15,
  "score_escrita": 20,
  "pontuacao_total": 18,
  "nivel_cefr": "A1",
  "detalhamento_pontos": {
    "compreensao_conteudo": 0,
    "correcao_portunhol": 10,
    "fluencia_duracao": 8
  },
  "erros_detectados": ["Respuesta fuera del tema principal y presencia de Portuñol"],
  "feedback_estudiante": "Tu redacción es clara, pero no lograste responder sobre el tema del presupuesto y los plazos. ¡Sigue practicando para responder con precisión el contenido del texto!"
}
`;
    } else if (idioma === "espanhol") {
      promptSistema = `
Você é um avaliador EXTREMAMENTE RÍGIDO e EXIGENTE de proficiência em Espanhol para Brasileiros (Nivelamento Institucional HAAS).

TEXTO DE REFERÊNCIA:
"Todavía no hemos logrado acordar los términos del contrato con los proveedores. Aunque la propuesta inicial parecía bastante ventajosa, nos dimos cuenta de que los plazos de entrega no eran los adecuados. Por lo tanto, le pediremos al equipo legal que revise las cláusulas antes de tomar una decisión definitiva."

Resposta do aluno: "${textoLimpo}"
Objetivo: "${motivo || "Não informado"}"

REGRAS DE PONTUAÇÃO RÍGIDA:
1. COMPREENSÃO DE CONTEÚDO E RELEVÂNCIA (0 a 40 pontos):
   - Se a resposta não tratar do contrato, prazos de entrega ou revisão legal, ATRIBUA 0 NESTE QUESITO e limite a nota final a NO MÁXIMO 20 PONTOS (Nível A1).
2. CORREÇÃO GRAMATICAL E PORTUNHOL (0 a 30 pontos):
   - Desconte 10 pontos por mistura com português (ex: "pedir para", falsos amigos, erros em por/para ou uso inapropriado de pronomes).
3. ESTRUTURA E COERÊNCIA (0 a 30 pontos).

PONTUAÇÃO SEPARADA E ESCALA CEFR:
- "score_fala": 0 a 100 (Máximo 20 se não abordou o tema).
- "score_escrita": 0 a 100 (Máximo 20 se não abordou o tema).
- "pontuacao_total": Média exata.
- Tabela CEFR: 0-20 = A1 | 21-40 = A2 | 41-60 = B1 | 61-80 = B2 | 81-100 = C1.

REGRA OBRIGATÓRIA DO FEEDBACK ALUNO:
O campo "feedback_estudiante" DEVE ser escrito EM ESPANHOL, de forma AMIGÁVEL, em SEGUNDA PESSOA ("tú") e ter no MÁXIMO 40 PALAVRAS.

Retorne ESTRITAMENTE em formato JSON puro sem markdown:
{
  "score_fala": 15,
  "score_escrita": 20,
  "pontuacao_total": 18,
  "nivel_cefr": "A1",
  "detalhamento_pontos": {
    "compreensao_conteudo": 0,
    "correcao_portunhol": 10,
    "fluencia_duracao": 8
  },
  "erros_detectados": ["Respuesta desalineada con el tema del contrato"],
  "feedback_estudiante": "Expresaste buenas estructuras, pero tu respuesta no abordó los puntos clave del contrato y proveedores. ¡Continúa practicando para mejorar tu comprensión!"
}
`;
    } else {
      promptSistema = `
You are an EXTREMELY STRICT and RIGOROUS English Language Assessment AI (HAAS Placement Test).

REFERENCE TEXT:
"Despite the initial setback with the software update, the development team managed to resolve the critical bugs before the official release. Had we not extended the testing phase last week, several major issues would have gone unnoticed, potentially harming our reputation with key clients."

Student Response: "${textoLimpo}"
Goal: "${motivo || "Not specified"}"

STRICT SCORING RULES:
1. CONTENT COMPREHENSION & RELEVANCE (0 to 40 points):
   - If the response is off-topic or fails to mention software updates, bugs, or testing, ASSIGN 0 POINTS in this section. Limit total score to MAXIMUM 20 POINTS (CEFR A1).
2. GRAMMAR & VOCABULARY ACCURACY (0 to 30 points):
   - Deduct 10 points for native language interference or basic grammatical errors.
3. STRUCTURE & COHESION (0 to 30 points).

SEPARATE EVALUATION & CEFR LEVEL:
- "score_fala": 0 to 100 (Max 20 if off-topic).
- "score_escrita": 0 to 100 (Max 20 if off-topic).
- "pontuacao_total": Average of both scores.
- CEFR Table: 0-20 = A1 | 21-40 = A2 | 41-60 = B1 | 61-80 = B2 | 81-100 = C1.

MANDATORY FEEDBACK RULE:
"feedback_estudiante" MUST be in SPANISH, FRIENDLY, ENCOURAGING, SECOND PERSON ("tú"), MAXIMUM 40 WORDS.

Return STRICTLY a JSON object without markdown:
{
  "score_fala": 15,
  "score_escrita": 20,
  "pontuacao_total": 18,
  "nivel_cefr": "A1",
  "detalhamento_pontos": {
    "compreensao_conteudo": 0,
    "correcao_portunhol": 10,
    "fluencia_duracao": 8
  },
  "erros_detectados": ["Off-topic response"],
  "feedback_estudiante": "Tus oraciones son claras, pero la respuesta no abordó el tema del software y la prueba. ¡Sigue adelante para afinar tu comprensión auditiva y lectora!"
}
`;
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const resGemini = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptSistema }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    if (!resGemini.ok) {
      const errBody = await resGemini.text();
      console.error("Erro na resposta HTTP do Gemini:", resGemini.status, errBody);
      throw new Error(`Gemini API Http ${resGemini.status}: ${errBody}`);
    }

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
        score_fala: 0,
        score_escrita: 0,
        pontuacao_total: 0,
        nivel_cefr: "A1",
        feedback_estudiante: `Ocurrió un error al procesar tu prueba con la IA: ${error.message || "Error de conexión"}.`,
        justificativa_nivel: `Ocurrió un error al procesar tu prueba con la IA: ${error.message || "Error de conexión"}.`
      }
    });
  }
}
