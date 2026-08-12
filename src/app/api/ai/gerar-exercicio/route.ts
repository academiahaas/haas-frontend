import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const GEMINI_MODEL = "gemini-2.5-flash";
const SUPABASE_URL = "https://jdppxfokfhqjudwfwckd.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export async function POST(req: NextRequest) {
  try {
    const { unitId, idiomaAlvo, idiomaNativo, quantidade, dificuldade } = await req.json();

    if (!unitId || !idiomaAlvo || !idiomaNativo) {
      return NextResponse.json({ erro: "Parâmetros ausentes." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ erro: "Serviço de IA indisponível." }, { status: 503 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Busca o contexto real da unidade, direto do banco (sem digitar manualmente)
    const { data: unidade, error: erroUnidade } = await supabase
      .from("units")
      .select("id, unit_number, unit_title, pedagogical_objective, situational_content, hidden_grammatical_structure, module_content_id")
      .eq("id", unitId)
      .maybeSingle();

    if (erroUnidade || !unidade) {
      return NextResponse.json({ erro: "Unidade não encontrada." }, { status: 404 });
    }

    const { data: modulo } = await supabase
      .from("modules_content")
      .select("level_id, module_title")
      .eq("id", unidade.module_content_id)
      .maybeSingle();

    const { data: nivel } = await supabase
      .from("levels")
      .select("level_tag")
      .eq("id", modulo?.level_id)
      .maybeSingle();

    const levelTag = nivel?.level_tag || "A1";
    const qtd = Math.min(Number(quantidade) || 1, 10);

    const prompt = `Você é uma especialista em criação de material didático para ensino de idiomas, seguindo o padrão de mercado (tipo Duolingo).

Crie ${qtd} exercício(s) de MÚLTIPLA ESCOLHA para uma unidade de curso de ${idiomaAlvo}, nível CEFR ${levelTag}.

Nível de dificuldade destes exercícios especificamente: ${dificuldade || 'medium'} (easy = mais simples e direto, medium = padrão, hard = exige mais domínio da estrutura, pode incluir nuances ou pegadinhas comuns).

Contexto pedagógico da unidade (uso interno, pode estar em qualquer idioma):
- Título: ${unidade.unit_title}
- Objetivo: ${unidade.pedagogical_objective}
- Conteúdo situacional: ${unidade.situational_content}
- Estrutura gramatical: ${unidade.hidden_grammatical_structure}

REGRAS OBRIGATÓRIAS:
- A pergunta (reading_text), a resposta correta e as opções alternativas devem estar 100% em ${idiomaAlvo} (o idioma que o aluno está aprendendo). NUNCA em ${idiomaNativo}.
- Os textos de feedback e incentivo devem estar 100% em ${idiomaNativo} (idioma nativo do aluno), sendo motivacionais e adequados ao contexto de aprendizado de idiomas.
- correct_feedback: explica por que a resposta está certa (1-2 frases)
- incorrect_feedback: explica a regra/erro comum (1-2 frases)
- correct_incentive: frase curta e empolgante de parabéns (tipo gíria animada)
- incorrect_incentive: frase curta e gentil de encorajamento
- alternative_options: array com exatamente 3 opções erradas plausíveis (não incluir a correta)

Responda ESTRITAMENTE em um array JSON puro, sem markdown, sem texto antes ou depois, no formato:
[
  {
    "reading_text": "pergunta em ${idiomaAlvo}",
    "correct_answer": "resposta correta em ${idiomaAlvo}",
    "alternative_options": ["errada1", "errada2", "errada3"],
    "correct_feedback": "explicação em ${idiomaNativo}",
    "incorrect_feedback": "explicação em ${idiomaNativo}",
    "correct_incentive": "frase animada em ${idiomaNativo}",
    "incorrect_incentive": "frase gentil em ${idiomaNativo}"
  }
]`;

    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );

    if (!resp.ok) {
      const errText = await resp.text();
      console.error("Erro na API Gemini:", errText);
      return NextResponse.json({ erro: "Falha ao gerar exercícios." }, { status: 502 });
    }

    const data = await resp.json();
    const textoResposta: string = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    let exercicios;
    try {
      const limpo = textoResposta.replace(/```json/g, "").replace(/```/g, "").trim();
      exercicios = JSON.parse(limpo);
    } catch (e) {
      console.error("Falha ao parsear resposta da IA:", textoResposta);
      return NextResponse.json({ erro: "Resposta inválida da IA." }, { status: 502 });
    }

    // Salva como RASCUNHO, nunca direto na tabela real
    const registrosRascunho = exercicios.map((ex: any) => ({
      unit_id: unitId,
      level_tag: levelTag,
      unit_number: unidade.unit_number,
      module: modulo?.module_title || null,
      activity_type: 1,
      difficulty_level: dificuldade || 'medium',
      reading_text: ex.reading_text,
      correct_answer: ex.correct_answer,
      alternative_options: ex.alternative_options,
      correct_feedback: ex.correct_feedback,
      incorrect_feedback: ex.incorrect_feedback,
      correct_incentive: ex.correct_incentive,
      incorrect_incentive: ex.incorrect_incentive,
      status: "pendente",
    }));

    const { data: salvos, error: erroSalvar } = await supabase
      .from("exercises_rascunho")
      .insert(registrosRascunho)
      .select();

    if (erroSalvar) {
      console.error("Erro ao salvar rascunho:", erroSalvar);
      return NextResponse.json({ erro: "Exercícios gerados, mas falha ao salvar rascunho." }, { status: 500 });
    }

    return NextResponse.json({ exercicios: salvos });
  } catch (err) {
    console.error("Erro na rota de geração de exercício:", err);
    return NextResponse.json({ erro: "Erro interno ao gerar exercício." }, { status: 500 });
  }
}
