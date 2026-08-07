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

    // Trava para respostas muito curtas, sem nexo ou testes ("bla bla bla")
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
          erros_portunhol_detectados: [
            "Resposta insuficiente ou sem estrutura linguística adequada para avaliação."
          ],
          ideias_chave_identificadas: [],
          justificativa_nivel: "O candidato forneceu um texto genérico ou muito curto, impossibilitando a validação de vocabulário ou gramática intermediária/avançada."
        }
      });
    }

    let promptSistema = "";

    if (idioma === "portugues") {
      promptSistema = `
Você é um avaliador especialista em proficiência de Português para Hispanofalantes. Sua tarefa é analisar o texto do candidato.

Texto de Referência do Teste:
"Embora o projeto tenha sido aprovado na reunião de ontem, a diretoria exigiu que nós refizéssemos o orçamento até o fim da tarde. Caso a equipe não consiga alinhar os prazos a tempo, haverá necessidade de adiar o lançamento, o que traria prejuízos financeiros significativos para a empresa."

Texto do Candidato: "${textoLimpo}"
Objetivo: "${motivo || "Não informado"}"

Analise a resposta segundo os 3 critérios:
1. COMPREENSÃO DE CONTEÚDO (0 a 40 pontos)
2. CORREÇÃO GRAMATICAL E PORTUNHOL (0 a 30 pontos)
3. FLUÊNCIA E ESTRUTURA (0 a 30 pontos)

Tabela CEFR:
- 0 a 29 pontos: A1
- 30 a 49 pontos: A2
- 50 a 69 pontos: B1
- 70 a 89 pontos: B2
- 90 a 100 pontos: C1

Retorne ESTRITAMENTE em formato JSON puro sem markdown:
{
  "pontuacao_total": 85,
  "nivel_cefr": "B2",
  "detalhamento_pontos": {
    "compreensao_conteudo": 30,
    "correcao_portunhol": 25,
    "fluencia_duracao": 30
  },
  "erros_portunhol_detectados": [],
  "ideias_chave_identificadas": [],
  "justificativa_nivel": "Avaliação pedagógica detalhada."
}
`;
    } else if (idioma === "espanhol") {
      promptSistema = `
Você é um avaliador especialista em proficiência de Espanhol para Brasileiros.
Texto do Candidato: "${textoLimpo}"
Objetivo: "${motivo || "Não informado"}"

Avalie erros de 'portunhol', pronomes, falsos amigos, tempos passados e por/para.
Atribua de 0 a 100 pontos e determine o nível CEFR (A1 a C1).

Retorne ESTRITAMENTE em formato JSON puro sem markdown:
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
  "justificativa_nivel": "Avaliação pedagógica detalhada."
}
`;
    } else {
      promptSistema = `
You are an expert evaluator in English proficiency (CEFR standard).
Candidate Response: "${textoLimpo}"
Goal: "${motivo || "Not specified"}"

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

    return NextResponse.json({ success: true, data: parsed });

  } catch (error: any) {
    console.error("Exceção na rota de diagnóstico:", error);
    return NextResponse.json({
      success: true,
      data: {
        pontuacao_total: 0,
        nivel_cefr: "A1",
        justificativa_nivel: `Erro ao conectar com a IA: ${error.message || "Falha de processamento"}`
      }
    });
  }
}
