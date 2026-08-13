import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const GEMINI_MODEL = "gemini-2.5-flash";
const SUPABASE_URL = "https://jdppxfokfhqjudwfwckd.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

async function gerarLoteExercicios(unidade: any, levelTag: string, idiomaAlvo: string, idiomaNativo: string, dificuldade: string, quantidade: number, apiKey: string) {
  if (quantidade <= 0) return [];

  const prompt = `Você é uma especialista em criação de material didático para ensino de idiomas, seguindo o padrão de mercado (tipo Duolingo).

Crie ${quantidade} exercício(s) de MÚLTIPLA ESCOLHA para uma unidade de curso de ${idiomaAlvo}, nível CEFR ${levelTag}.

Contexto pedagógico da unidade (uso interno, pode estar em qualquer idioma):
- Título: ${unidade.unit_title}
- Objetivo: ${unidade.pedagogical_objective}
- Conteúdo situacional: ${unidade.situational_content}
- Estrutura gramatical: ${unidade.hidden_grammatical_structure}

Nível de dificuldade destes exercícios: ${dificuldade}.
Definição pedagógica do nível (siga rigorosamente):
- easy: reconhecimento imediato de vocabulário, associação direta, fixação elementar. Frases curtas e óbvias.
- medium: estruturação sintática correta, amarras gramaticais (preposições, concordância), aplicação de regra em contexto simples e direto.
- hard: análise sob contexto, interpretação de nuances, possíveis duplos sentidos, expressões idiomáticas ou gírias regionais leves, coesão entre frases mais longas. Não é "vocabulário raro", é raciocínio linguístico mais elaborado.

REGRAS OBRIGATÓRIAS:
- A pergunta (reading_text), a resposta correta e as opções alternativas devem estar 100% em ${idiomaAlvo}. NUNCA em ${idiomaNativo}.
- Os textos de feedback e incentivo devem estar 100% em ${idiomaNativo}, motivacionais.
- correct_feedback: explica por que a resposta está certa (1-2 frases)
- incorrect_feedback: explica a regra/erro comum (1-2 frases)
- correct_incentive: frase curta e empolgante
- incorrect_incentive: frase curta e gentil
- alternative_options: array com exatamente 3 opções erradas plausíveis
- Cada exercício deve ser DIFERENTE dos outros (variar vocabulário/situação)

Responda ESTRITAMENTE em um array JSON puro, sem markdown, no formato:
[{"reading_text": "...", "correct_answer": "...", "alternative_options": ["...","...","..."], "correct_feedback": "...", "incorrect_feedback": "...", "correct_incentive": "...", "incorrect_incentive": "..."}]`;

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
    console.error(`Erro na API Gemini (${dificuldade}):`, errText);
    throw new Error(`Falha ao gerar exercícios (${dificuldade}).`);
  }

  const data = await resp.json();
  const textoResposta: string = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const limpo = textoResposta.replace(/```json/g, "").replace(/```/g, "").trim();
  const exercicios = JSON.parse(limpo);

  return exercicios.map((ex: any) => ({ ...ex, difficulty_level: dificuldade }));
}

export async function POST(req: NextRequest) {
  try {
    const { unitId, idiomaAlvo, idiomaNativo, metaEasy, metaMedium, metaHard } = await req.json();

    if (!unitId || !idiomaAlvo || !idiomaNativo) {
      return NextResponse.json({ erro: "Parâmetros ausentes." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ erro: "Serviço de IA indisponível." }, { status: 503 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

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

    // Gera os 3 lotes (fácil, médio, difícil) em sequência
    const todosExercicios = [];
    for (const [dif, qtd] of [["easy", metaEasy], ["medium", metaMedium], ["hard", metaHard]]) {
      if (Number(qtd) > 0) {
        const lote = await gerarLoteExercicios(unidade, levelTag, idiomaAlvo, idiomaNativo, dif as string, Number(qtd), apiKey);
        todosExercicios.push(...lote);
      }
    }

    const registrosRascunho = todosExercicios.map((ex: any) => ({
      unit_id: unitId,
      level_tag: levelTag,
      unit_number: unidade.unit_number,
      module: modulo?.module_title || null,
      activity_type: 1,
      difficulty_level: ex.difficulty_level,
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

    // Marca o progresso como "em_progresso"
    await supabase.from("unit_exercise_progress").upsert(
      { unit_id: unitId, tipo_exercicio: "multipla_escolha", status: "em_progresso" },
      { onConflict: "unit_id,tipo_exercicio" }
    );

    return NextResponse.json({ exercicios: salvos });
  } catch (err: any) {
    console.error("Erro na rota de geração de exercício:", err);
    return NextResponse.json({ erro: err.message || "Erro interno ao gerar exercício." }, { status: 500 });
  }
}
