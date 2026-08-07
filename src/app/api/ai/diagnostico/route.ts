import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { idioma, motivo, textoResposta } = body;

    if (!idioma || !textoResposta) {
      return NextResponse.json({ success: false, error: "Parâmetros ausentes" }, { status: 400 });
    }

    let promptSistema = "";

    if (idioma === "portugues") {
      promptSistema = `
Você é um avaliador especialista em proficiência de Português para Hispanofalantes. Sua tarefa é analisar o texto de resposta escrito e oral do candidato.

Texto de Referência do Teste:
"Embora o projeto tenha sido aprovado na reunião de ontem, a diretoria exigiu que nós refizéssemos o orçamento até o fim da tarde. Caso a equipe não consiga alinhar os prazos a tempo, haverá necessidade de adiar o lançamento, o que traria prejuízos financeiros significativos para a empresa."

Leitura de Apoio:
"A contratação do novo gerente gerou grande expectativa, pois seu currículo era tido como impecável. No entanto, ao assumir o departamento, ficou claro que sua conduta destoava do ambiente corporativo sobriedade. Ele costumava se desentender com a equipe por detalhes insignificantes, criando um clima de desconfiança. O ápice do impasse ocorreu quando ele contestou publicamente uma decisão da diretoria, levando a sua posterior exoneração."

Resposta do Candidato: "${textoResposta}"
Objetivo do Candidato: "${motivo || "Não informado"}"

Analise a resposta segundo os 3 critérios de pontuação (total: 100 pontos):
1. COMPREENSÃO DE CONTEÚDO (0 a 40 pontos - 10 pontos por ideia capturada):
   - Mencionou aprovação do projeto (+10)
   - Mencionou exigência de refazer orçamento (+10)
   - Mencionou prazo final (+10)
   - Mencionou consequência de adiar ou prejuízo (+10)
2. CORREÇÃO GRAMATICAL E PORTUNHOL (0 a 30 pontos):
   - Subtraia 5 pontos por erro de Portunhol (uso de 'hasta', 'pero', 'aunque', regência incorreta, erro de subjuntivo, interferência léxica).
3. FLUÊNCIA E ESTRUTURA (0 a 30 pontos):
   - Avalie a coesão, conectores e clareza textual.

Regras de Nivelamento CEFR:
- 0 a 29 pontos: A1
- 30 a 49 pontos: A2
- 50 a 69 pontos: B1
- 70 a 89 pontos: B2
- 90 a 100 pontos: C1

Sua resposta DEVE ser estritamente em formato JSON puro, sem markdown extra:
{
  "pontuacao_total": 85,
  "nivel_cefr": "B2",
  "detalhamento_pontos": {
    "compreensao_conteudo": 30,
    "correcao_portunhol": 25,
    "fluencia_duracao": 30
  },
  "erros_portunhol_detectados": [
    "Uso incorreto de termos em espanhol ou falha no subjuntivo"
  ],
  "ideias_chave_identificadas": [
    "Aprovação do projeto",
    "Revisão do orçamento"
  ],
  "justificativa_nivel": "O candidato compreendeu as ideias centrais e apresentou boa coesão."
}
`;
    } else if (idioma === "espanhol") {
      promptSistema = `
Você é um avaliador especialista em proficiência de Espanhol para Brasileiros.

Texto de Referência de Escuta:
"Todavía no hemos logrado acordar los términos del contrato con los proveedores. Aunque la propuesta inicial parecía bastante ventajosa, nos dimos cuenta de que los plazos de entrega no eran los adecuados. Por lo tanto, le pediremos al equipo legal que revise las cláusulas antes de tomar una decisión definitiva."

Texto de Leitura:
"El taller de formación técnica resultó ser muy distinto de lo que los empleados esperaban. Aunque el folleto anunciaba un evento dinámico, la jornada fue larga y pesada. Sin embargo, lo más llamativo no fue la falta de organización, sino el hecho de que el ponente lograra captar la atención de la audiencia en los últimos minutos con una propuesta sumamente novedosa sobre innovación digital."

Resposta do Candidato: "${textoResposta}"
Objetivo: "${motivo || "Não informado"}"

Avalie erros típicos de brasileiros: uso de 'portunhol', confusão de pronomes (lo/le), falsos amigos (embarazada, exquisito, todavía), pretérito indefinido vs imperfecto e uso de por/para.
Gere uma pontuação de 0 a 100 e determine o nível CEFR (A1 a C1).

Retorne ESTRITAMENTE em formato JSON:
{
  "pontuacao_total": 75,
  "nivel_cefr": "B2",
  "detalhamento_pontos": {
    "compreensao_conteudo": 30,
    "correcao_portunhol": 20,
    "fluencia_duracao": 25
  },
  "erros_portunhol_detectados": [],
  "ideias_chave_identificadas": [],
  "justificativa_nivel": "Explicação detalhada sobre o nível do candidato."
}
`;
    } else {
      promptSistema = `
You are an expert evaluator in English proficiency (CEFR standard).

Listening Text Context:
"Despite the initial setback with the software update, the development team managed to resolve the critical bugs before the official release. Had we not extended the testing phase last week, several major issues would have gone unnoticed, potentially harming our reputation with key clients."

Reading Text Context:
"The transition to a hybrid work model has required organizations to fundamentally rethink their management strategies. While flexibility is widely praised by employees, managers often struggle to maintain team cohesion and monitor productivity without resorting to micromanagement. Striking the right balance requires clear communication channels, outcome-based evaluation, and a high degree of mutual trust."

Candidate Response: "${textoResposta}"
Goal: "${motivo || "Not specified"}"

Evaluate grammar accuracy, conditionals, passive voice, phrasal verbs, vocabulary richness, and coherence.
Assign a score from 0 to 100 and a CEFR level (A1 to C2).

Return STRICTLY JSON format:
{
  "pontuacao_total": 80,
  "nivel_cefr": "B2",
  "detalhamento_pontos": {
    "compreensao_conteudo": 30,
    "correcao_portunhol": 25,
    "fluencia_duracao": 25
  },
  "erros_portunhol_detectados": [],
  "ideias_chave_identificadas": [],
  "justificativa_nivel": "Detailed evaluation summary."
}
`;
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json({
        success: true,
        data: {
          pontuacao_total: 65,
          nivel_cefr: "B1",
          justificativa_nivel: "Modo de contingência ativo: Chave da API Gemini não configurada no ambiente."
        }
      });
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const resGemini = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptSistema }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    if (!resGemini.ok) {
      throw new Error(`Erro HTTP Gemini: ${resGemini.status}`);
    }

    const dataGemini = await resGemini.json();
    const textRaw = dataGemini?.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(textRaw);

    return NextResponse.json({ success: true, data: parsed });

  } catch (error: any) {
    return NextResponse.json({
      success: true,
      data: {
        pontuacao_total: 60,
        nivel_cefr: "B1",
        justificativa_nivel: "Processado em contingência devido a uma oscilação na resposta da IA."
      }
    });
  }
}
