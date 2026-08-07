import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AQ.Ab8RN6I6ttBs87ZZMIvY2YAtDLXTz8UKzbgLq9UrwVQYzEtPhQ";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { idioma, motivo, textoResposta } = body;

    if (!idioma || !textoResposta) {
      return NextResponse.json({ success: false, error: "Parâmetros ausentes" }, { status: 400 });
    }

    const textoLimpo = textoResposta.trim();

    // Filtro para respostas muito curtas ou testes ("bla bla bla")
    if (textoLimpo.length < 15 || /^(bla\s*)+$/i.test(textoLimpo) || /^(\w)\1+$/i.test(textoLimpo)) {
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
          erros_detectados: [
            "Respuesta insuficiente o sin estructura lingüística adecuada."
          ],
          erros_portunhol_detectados: [
            "Respuesta insuficiente o sin estructura lingüística adecuada."
          ],
          feedback_estudiante: "Tu respuesta es demasiado corta o no tiene sentido. Por favor, intenta responder con oraciones completas para poder evaluar tu nivel real.",
          justificativa_nivel: "Tu respuesta es demasiado corta o no tiene sentido. Por favor, intenta responder con oraciones completas para poder evaluar tu nivel real."
        }
      });
    }

    let promptSistema = "";

    if (idioma === "portugues") {
      promptSistema = `
Você é um avaliador especialista em proficiência de Português para Hispanofalantes. Sua tarefa é analisar a resposta enviada pelo aluno baseando-se nos textos do teste:

[REFERÊNCIA DE ESCUTA E FALA]
"Embora o projeto tenha sido aprovado na reunião de ontem, a diretoria exigiu que nós refizéssemos o orçamento até o fim da tarde. Caso a equipe não consiga alinhar os prazos a tempo, haverá necessidade de adiar o lançamento, o que traria prejuízos financeiros significativos para a empresa."

[REFERÊNCIA DE LEITURA E ESCRITA]
"A contratação do novo gerente gerou grande expectativa, pois seu currículo era tido como impecável. No entanto, ao assumir o departamento, ficou claro que sua conduta destoava do ambiente corporativo sobriedade. Ele costumava se desentender com a equipe por detalhes insignificantes, criando um clima de desconfiança. O ápice do impasse ocorreu quando ele contestou publicamente uma decisão da diretoria, levando a sua posterior exoneração."

Resposta do aluno: "${textoLimpo}"
Objetivo: "${motivo || "Não informado"}"

Critérios (Total: 100 pontos):
1. COMPREENSÃO DE CONTEÚDO (0 a 40 pontos): Aprovação do projeto, exigência do orçamento, prazo final, risco de prejuízo/exoneração.
2. CORREÇÃO GRAMATICAL E PORTUNHOL (0 a 30 pontos): Subtraia 5 por erro de Portunhol (uso de "hasta", "pero", conectores como "sin embargo", "aunque", erro no subjuntivo ou crase).
3. ESTRUTURA E FLUÊNCIA (0 a 30 pontos): Resposta clara, coesa e articulada.

REGRA OBRIGATÓRIA DO FEEDBACK:
O campo "feedback_estudiante" DEVE ser escrito EM ESPANHOL, em SEGUNDA PESSOA ("tú") e ter no MÁXIMO 40 PALAVRAS. Deve ser um conselho direto e amigável ao aluno sobre seus acertos e o que precisa melhorar.

Retorne ESTRITAMENTE em formato JSON puro sem markdown:
{
  "pontuacao_total": 85,
  "nivel_cefr": "B2",
  "detalhamento_pontos": {
    "compreensao_conteudo": 30,
    "correcao_portunhol": 25,
    "fluencia_duracao": 30
  },
  "erros_detectados": ["Uso de 'hasta' em vez de 'até'"],
  "feedback_estudiante": "Comprendiste muy bien el problema planteado. Tu fluidez es buena, pero recuerda usar 'até' en lugar de 'hasta' y repasar la conjugación del subjuntivo."
}
`;
    } else if (idioma === "espanhol") {
      promptSistema = `
Você é um avaliador especialista em proficiência de Espanhol para Brasileiros. Sua tarefa é analisar a resposta enviada pelo aluno baseando-se nos textos do teste:

[REFERÊNCIA DE ESCUTA E FALA]
"Todavía no hemos logrado acordar los términos del contrato con los proveedores. Aunque la propuesta inicial parecía bastante ventajosa, nos dimos cuenta de que los plazos de entrega no eran los adecuados. Por lo tanto, le pediremos al equipo legal que revise las cláusulas antes de tomar una decisión definitiva."

[REFERÊNCIA DE LEITURA E ESCRITA]
"El taller de formación técnica resultó ser muy distinto de lo que los empleados esperaban. Aunque el folleto anunciaba un evento dinámico, la jornada fue larga y pesada. Sin embargo, lo más llamativo no fue la falta de organización, sino el hecho de que el ponente lograra captar la atención de la audiencia en los últimos minutos con una propuesta sumamente novedosa sobre innovación digital."

Resposta do aluno: "${textoLimpo}"
Objetivo: "${motivo || "Não informado"}"

Critérios (Total: 100 pontos):
1. COMPREENSÃO DE CONTEÚDO (0 a 40 pontos): Identificação das ideias centrais do contrato e do evento.
2. CORREÇÃO GRAMATICAL E PORTUNHOL (0 a 30 pontos): Avalie falsos amigos (taller, larga, ponente), uso de "por/para", "lo más" vs "el más", pronúncia/grafia de V/B e "pedir a" em vez de "pedir para".
3. ESTRUTURA E FLUÊNCIA (0 a 30 pontos): Coesão, extensão e clareza.

REGRA OBRIGATÓRIA DO FEEDBACK:
O campo "feedback_estudiante" DEVE ser escrito EM ESPANHOL, em SEGUNDA PESSOA ("tú") e ter no MÁXIMO 40 PALAVRAS.

Retorne ESTRITAMENTE em formato JSON puro sem markdown:
{
  "pontuacao_total": 70,
  "nivel_cefr": "B1",
  "detalhamento_pontos": {
    "compreensao_conteudo": 30,
    "correcao_portunhol": 20,
    "fluencia_duracao": 20
  },
  "erros_detectados": ["Estructura 'pedir para el' en lugar de 'pedir al'"],
  "feedback_estudiante": "Captaste muy bien la situación expuesta. Para seguir mejorando, recuerda usar la estructura 'pedir a' en lugar de 'pedir para' y cuidar los falsos amigos."
}
`;
    } else {
      promptSistema = `
You are an expert English Language Assessment AI. Your task is to evaluate the response submitted by the student based on the test texts:

[LISTENING & SPEAKING REFERENCE]
"Despite the initial setback with the software update, the development team managed to resolve the critical bugs before the official release. Had we not extended the testing phase last week, several major issues would have gone unnoticed, potentially harming our reputation with key clients."

[READING & WRITING REFERENCE]
"The transition to a hybrid work model has required organizations to fundamentally rethink their management strategies. While flexibility is widely praised by employees, managers often struggle to maintain team cohesion and monitor productivity without resorting to micromanagement. Striking the right balance requires clear communication channels, outcome-based evaluation, and a high degree of mutual trust."

Student Response: "${textoLimpo}"
Goal: "${motivo || "Not specified"}"

Criteria (Total: 100 points):
1. CONTENT COMPREHENSION (0 to 40 points): Identification of core ideas.
2. GRAMMAR & VOCABULARY RANGE (0 to 30 points): Tenses, conditionals, business terms (micromanagement, outcome-based, trust).
3. STRUCTURE & LENGTH (0 to 30 points): Cohesion, length, and clarity.

MANDATORY FEEDBACK RULE:
The "feedback_estudiante" field MUST be written IN SPANISH, addressing the student DIRECTLY in SECOND PERSON ("tú"), and be MAXIMUM 40 WORDS long.

Return STRICTLY a JSON object without markdown:
{
  "pontuacao_total": 75,
  "nivel_cefr": "B2",
  "detalhamento_pontos": {
    "compreensao_conteudo": 30,
    "correcao_portunhol": 25,
    "fluencia_duracao": 20
  },
  "erros_detectados": ["Simplified conditional structure used"],
  "feedback_estudiante": "Explicaste muy bien el problema y tu opinión fue clara. Para alcanzar el nivel C1, practica el uso de oraciones condicionales complejas como 'Had we not extended'."
}
`;
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const resGemini = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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

    // Mapeamento automático para manter compatibilidade total com o elemento na UI
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
        feedback_estudiante: `Ocurrió un error al procesar tu prueba con la IA: ${error.message || "Error de conexión"}.`,
        justificativa_nivel: `Ocurrió un error al procesar tu prueba con la IA: ${error.message || "Error de conexión"}.`
      }
    });
  }
}
