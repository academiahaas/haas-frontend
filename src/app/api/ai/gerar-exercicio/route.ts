import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const GEMINI_MODEL = "gemini-2.5-flash";
const SUPABASE_URL = "https://jdppxfokfhqjudwfwckd.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const DEFINICAO_DIFICULDADE = `Definição pedagógica do nível (siga rigorosamente):
- easy: reconhecimento imediato de vocabulário, associação direta, fixação elementar. Frases curtas e óbvias.
- medium: estruturação sintática correta, amarras gramaticais (preposições, concordância), aplicação de regra em contexto simples e direto.
- hard: análise sob contexto, interpretação de nuances, possíveis duplos sentidos, expressões idiomáticas ou gírias regionais leves, coesão entre frases mais longas. Não é "vocabulário raro", é raciocínio linguístico mais elaborado.`;

function montarPrompt(activityType: number, quantidade: number, unidade: any, levelTag: string, idiomaAlvo: string, idiomaNativo: string, dificuldade: string) {
  const contexto = `Contexto pedagógico da unidade (uso interno, pode estar em qualquer idioma):
- Título: ${unidade.unit_title}
- Objetivo: ${unidade.pedagogical_objective}
- Conteúdo situacional: ${unidade.situational_content}
- Estrutura gramatical: ${unidade.hidden_grammatical_structure}`;

  const regrasComuns = `
REGRAS OBRIGATÓRIAS:
- Todo o conteúdo do exercício (pergunta, resposta, opções) deve estar 100% em ${idiomaAlvo}. NUNCA em ${idiomaNativo}.
- Os textos de feedback e incentivo devem estar 100% em ${idiomaNativo}, motivacionais.
- ATENÇÃO ESPECIAL: correct_feedback e incorrect_feedback são os campos que mais erram o idioma, porque explicam gramática de ${idiomaAlvo}. Mesmo assim, TODO o texto explicativo deve estar em ${idiomaNativo} — você pode citar palavras isoladas de ${idiomaAlvo} entre aspas, mas a explicação inteira (frases, conectivos, tudo) tem que estar 100% em ${idiomaNativo}. NUNCA escreva a explicação inteira em ${idiomaAlvo}.
- correct_feedback: explica por que a resposta está certa, em ${idiomaNativo} (1-2 frases)
- incorrect_feedback: explica a regra/erro comum, em ${idiomaNativo} (1-2 frases)
- correct_incentive: frase curta e empolgante
- incorrect_incentive: frase curta e gentil
- Cada exercício deve ser DIFERENTE dos outros (variar vocabulário/situação)
- REGRA ABSOLUTA E DEFINITIVA sobre reading_text: NUNCA, em NENHUMA circunstância, coloque instrução, comando, ou texto explicando o que o aluno deve fazer (como "Complete a frase", "Selecione a opção", "Ordene os blocos", "Escute e escreva", etc.). O reading_text é SEMPRE só o conteúdo real do exercício (a frase, a pergunta, o texto com lacuna) — NUNCA um texto dizendo o que fazer com ele. Se o tipo de exercício não precisar de nenhum texto real (só blocos ou só áudio), reading_text deve ser uma string vazia "".`;

  if (activityType === 1) {
    return `Você é uma especialista em criação de material didático para ensino de idiomas, seguindo o padrão de mercado (tipo Duolingo).

Crie ${quantidade} exercício(s) de MÚLTIPLA ESCOLHA para uma unidade de curso de ${idiomaAlvo}, nível CEFR ${levelTag}.

${contexto}

Nível de dificuldade destes exercícios: ${dificuldade}.
${DEFINICAO_DIFICULDADE}
${regrasComuns}
- alternative_options: array com exatamente 3 opções erradas plausíveis (a resposta certa NÃO deve estar aqui)

Responda ESTRITAMENTE em um array JSON puro, sem markdown, no formato:
[{"reading_text": "pergunta ou frase com lacuna", "correct_answer": "resposta correta", "alternative_options": ["errada1","errada2","errada3"], "correct_feedback": "...", "incorrect_feedback": "...", "correct_incentive": "...", "incorrect_incentive": "..."}]`;
  }

  if (activityType === 2) {
    return `Você é uma especialista em criação de material didático para ensino de idiomas.

Crie ${quantidade} exercício(s) do tipo CAÇA-ERRO para uma unidade de curso de ${idiomaAlvo}, nível CEFR ${levelTag}.

Neste tipo, o aluno vê 4 frases e precisa identificar QUAL DELAS tem um erro gramatical. As outras 3 devem estar corretas.

${contexto}

Nível de dificuldade destes exercícios: ${dificuldade}.
${DEFINICAO_DIFICULDADE}
${regrasComuns}
- reading_text: use EXATAMENTE este texto fixo em espanhol: "Selecciona la opción con el error."
- correct_answer: a frase ERRADA (a que tem o erro gramatical que o aluno deve identificar)
- alternative_options: array com exatamente 3 frases CORRETAS (sem erro nenhum), plausíveis e do mesmo nível de complexidade
- O erro na frase errada deve ser sutil mas real (concordância, tempo verbal, regência, etc — apropriado ao nível ${dificuldade})

Responda ESTRITAMENTE em um array JSON puro, sem markdown, no formato:
[{"reading_text": "Selecciona la opción con el error.", "correct_answer": "frase com erro gramatical", "alternative_options": ["frase correta 1","frase correta 2","frase correta 3"], "correct_feedback": "...", "incorrect_feedback": "...", "correct_incentive": "...", "incorrect_incentive": "..."}]`;
  }

  if (activityType === 3) {
    return `Você é uma especialista em criação de material didático para ensino de idiomas.

Crie ${quantidade} exercício(s) do tipo DESAFIO BLITZ para uma unidade de curso de ${idiomaAlvo}, nível CEFR ${levelTag}.

Neste tipo, o aluno vê uma frase com uma lacuna, exatamente sobre o tema gramatical da unidade, e precisa escolher a opção correta entre 4. A diferença para a Múltipla Escolha comum é que as 3 opções erradas NÃO são erros óbvios — são armadilhas sutis e plausíveis, do tipo que só quem realmente domina o tema consegue distinguir rapidamente (confusões gramaticais reais e comuns entre falantes de ${idiomaNativo} aprendendo ${idiomaAlvo}, como tempo verbal parecido, conjugação vizinha, ou confusão clássica tipo ser/estar).

${contexto}

Nível de dificuldade destes exercícios: ${dificuldade}.
${DEFINICAO_DIFICULDADE}
${regrasComuns}
- reading_text: comece SEMPRE com a instrução fixa em espanhol "Completa la frase:" seguida de dois pontos e da frase com a lacuna
- correct_answer: a opção certa, coerente com o tema gramatical da unidade
- alternative_options: array com exatamente 3 opções erradas, mas GRAMATICALMENTE PLAUSÍVEIS e sutis — nunca erros óbvios de grafia ou digitação, sempre confusões reais de quem está aprendendo o tema desta unidade
- NÃO repita o formato da Múltipla Escolha comum: aqui o foco é testar se o aluno realmente entende a regra, não só reconhece vocabulário

Responda ESTRITAMENTE em um array JSON puro, sem markdown, no formato:
[{"reading_text": "Completa la frase: frase com lacuna aqui", "correct_answer": "opção correta", "alternative_options": ["armadilha1","armadilha2","armadilha3"], "correct_feedback": "...", "incorrect_feedback": "...", "correct_incentive": "...", "incorrect_incentive": "..."}]`;
  }

  if (activityType === 4) {
    return `Você é uma especialista em criação de material didático para ensino de idiomas.

Crie ${quantidade} exercício(s) do tipo PALAVRA OCULTA para uma unidade de curso de ${idiomaAlvo}, nível CEFR ${levelTag}.

Neste tipo, o aluno vê uma frase com uma palavra faltando, marcada como [lacuna], e precisa DIGITAR a palavra certa (não há opções pra escolher).

${contexto}

Nível de dificuldade destes exercícios: ${dificuldade}.
${DEFINICAO_DIFICULDADE}
${regrasComuns}
- reading_text: uma frase completa em ${idiomaAlvo}, com a palavra a ser adivinhada substituída EXATAMENTE por "[lacuna]"
- correct_answer: a palavra exata que deve preencher a lacuna, relacionada ao tema da unidade
- alternative_options: sempre um array vazio [] (não há opções neste tipo)
- texto_audio: a MESMA frase de reading_text, só que COMPLETA e NATURAL — sem "[lacuna]", com a palavra certa (correct_answer) já no lugar, e sem nenhuma instrução extra. É o texto que será falado em voz alta pro aluno, então tem que soar como uma frase real, fluida, do jeito que alguém falaria.
- A palavra oculta deve ser clara pelo contexto da frase, sem ambiguidade

Responda ESTRITAMENTE em um array JSON puro, sem markdown, no formato:
[{"reading_text": "Frase com [lacuna] no meio.", "correct_answer": "palavra", "alternative_options": [], "texto_audio": "Frase completa e natural com a palavra certa.", "correct_feedback": "...", "incorrect_feedback": "...", "correct_incentive": "...", "incorrect_incentive": "..."}]`;
  }

  if (activityType === 9) {
    return `Você é uma especialista em criação de material didático para ensino de idiomas.
Crie ${quantidade} exercício(s) do tipo PRÁTICA DE CONVERSAÇÃO para uma unidade de curso de ${idiomaAlvo}, nível CEFR ${levelTag}.
${contexto}
Nível de dificuldade destes exercícios: ${dificuldade}.
${DEFINICAO_DIFICULDADE}
${regrasComuns}
- reading_text e audio_transcript: os dois DEVEM SER EXATAMENTE IGUAIS, palavra por palavra. Uma única frase em ${idiomaAlvo}, natural, direta, sem nenhuma instrução, contexto, cenário, ou pergunta sobre o que fazer. É a frase que o interlocutor fictício diz pro aluno.
- correct_answer: uma lista de 5 a 8 palavras-chave em ${idiomaAlvo}, separadas por vírgula
- alternative_options: sempre um array vazio []
Responda ESTRITAMENTE em um array JSON puro, sem markdown, no formato:
[{"reading_text": "Oi! Tudo bem? O que você fez no fim de semana?", "audio_transcript": "Oi! Tudo bem? O que você fez no fim de semana?", "correct_answer": "palavra1, palavra2, palavra3", "alternative_options": [], "correct_feedback": "...", "incorrect_feedback": "...", "correct_incentive": "...", "incorrect_incentive": "..."}]`;
  }

  if (activityType === 10) {
    return `Você é uma especialista em criação de material didático para ensino de idiomas.
Crie ${quantidade} exercício(s) do tipo TREINO DE FALA para uma unidade de curso de ${idiomaAlvo}, nível CEFR ${levelTag}.
Neste tipo, o aluno ouve uma frase e precisa repeti-la em voz alta, praticando pronúncia.
${contexto}
Nível de dificuldade destes exercícios: ${dificuldade}.
${DEFINICAO_DIFICULDADE}
${regrasComuns}
- reading_text e audio_transcript: OS DOIS EXATAMENTE IGUAIS, palavra por palavra. Uma única frase natural e completa em ${idiomaAlvo}, sobre o tema da unidade, sem NENHUMA instrução ou texto adicional — é só a frase que o aluno vai ouvir e repetir.
- correct_answer: as palavras-chave da frase (as palavras de conteúdo, sem artigos/preposições soltas), em ${idiomaAlvo}, separadas por vírgula — usadas pelo sistema pra avaliar se o aluno disse os elementos certos ao repetir
- alternative_options: sempre um array vazio []
- correct_feedback e incorrect_feedback: MUITO CURTOS (máximo 1 frase simples, sem jargão técnico de linguística ou fonética). Fale como alguém animando um amigo, não como um professor de fonética.
Responda ESTRITAMENTE em um array JSON puro, sem markdown, no formato:
[{"reading_text": "Bom dia, tudo bem com você?", "audio_transcript": "Bom dia, tudo bem com você?", "correct_answer": "bom dia, tudo bem, você", "alternative_options": [], "correct_feedback": "...", "incorrect_feedback": "...", "correct_incentive": "...", "incorrect_incentive": "..."}]`;
  }

  if (activityType === 13) {
    return `Você é uma especialista em criação de material didático para ensino de idiomas.
Crie ${quantidade} exercício(s) do tipo MARCHAS DE ÁUDIO para uma unidade de curso de ${idiomaAlvo}, nível CEFR ${levelTag}.
Neste tipo, o aluno ouve uma frase completa e vê a mesma frase escrita com 1 a 3 lacunas (marcadas como "______"). Ele escolhe, entre 4 opções, o conjunto completo de palavras que preenche todas as lacunas corretamente.
${contexto}
Nível de dificuldade destes exercícios: ${dificuldade}.
${DEFINICAO_DIFICULDADE}
${regrasComuns}
- reading_text: a frase em ${idiomaAlvo}, com 1 a 3 lacunas marcadas como "______", SEM nenhuma instrução antes ou depois — só a frase com as lacunas
- audio_transcript: a MESMA frase, só que COMPLETA, sem lacunas, com as palavras certas já no lugar — é o texto que vira áudio
- correct_answer: as palavras certas que preenchem as lacunas, na ordem, separadas por vírgula (ex: se são 2 lacunas: "revisadas, protocolo")
- alternative_options: array com exatamente 4 conjuntos completos de resposta (strings no mesmo formato de correct_answer, separadas por vírgula), sendo UM deles idêntico ao correct_answer e os outros 3 combinações erradas mas plausíveis
Responda ESTRITAMENTE em um array JSON puro, sem markdown, no formato:
[{"reading_text": "Frase com ______ lacunas.", "audio_transcript": "Frase completa sem lacunas.", "correct_answer": "palavra1, palavra2", "alternative_options": ["palavra1, palavra2", "errada1, errada2", "errada3, errada4", "errada5, errada6"], "correct_feedback": "...", "incorrect_feedback": "...", "correct_incentive": "...", "incorrect_incentive": "..."}]`;
  }

  if (activityType === 11) {
    return `Você é uma especialista em criação de material didático para ensino de idiomas.
Crie ${quantidade} exercício(s) do tipo SPELLING BEE para uma unidade de curso de ${idiomaAlvo}, nível CEFR ${levelTag}.
Neste tipo, o aluno ouve uma palavra falada e precisa escrevê-la corretamente, letra por letra.
${contexto}
Nível de dificuldade destes exercícios: ${dificuldade}.
${DEFINICAO_DIFICULDADE}
${regrasComuns}
- reading_text: use EXATAMENTE este texto fixo em espanhol: "Escucha la palabra y escríbela correctamente."
- correct_answer: UMA ÚNICA PALAVRA em ${idiomaAlvo}, EM MAIÚSCULAS, relacionada ao tema da unidade, sem espaços
- audio_transcript: a mesma palavra de correct_answer, mas em minúsculas normais (não maiúsculas), é o texto que vira áudio
- alternative_options: sempre um array vazio []
Responda ESTRITAMENTE em um array JSON puro, sem markdown, no formato:
[{"reading_text": "Escucha la palabra y escríbela correctamente.", "correct_answer": "PALAVRA", "audio_transcript": "palavra", "alternative_options": [], "correct_feedback": "...", "incorrect_feedback": "...", "correct_incentive": "...", "incorrect_incentive": "..."}]`;
  }

  if (activityType === 5) {
    return `Você é uma especialista em criação de material didático para ensino de idiomas.
Crie ${quantidade} exercício(s) do tipo BLOCOS DE GRAMÁTICA para uma unidade de curso de ${idiomaAlvo}, nível CEFR ${levelTag}.
Neste tipo, o aluno vê blocos de palavras soltos e precisa clicar neles na ordem certa para formar uma frase correta.
${contexto}
Nível de dificuldade destes exercícios: ${dificuldade}.
${DEFINICAO_DIFICULDADE}
${regrasComuns}
- reading_text: sempre uma string vazia ""
- correct_answer: a frase completa e correta em ${idiomaAlvo}, com pontuação final
- alternative_options: array com cada palavra/bloco da frase separado (na ordem correta, o sistema embaralha na tela) — cada item do array é uma palavra ou bloco pontuado da frase
Responda ESTRITAMENTE em um array JSON puro, sem markdown, no formato:
[{"reading_text": "", "correct_answer": "O hotel é bom.", "alternative_options": ["O", "hotel", "é", "bom."], "correct_feedback": "...", "incorrect_feedback": "...", "correct_incentive": "...", "incorrect_incentive": "..."}]`;
  }

  if (activityType === 7) {
    return `Você é uma especialista em criação de material didático para ensino de idiomas.
Crie ${quantidade} exercício(s) do tipo ORDENAÇÃO DE FRASES para uma unidade de curso de ${idiomaAlvo}, nível CEFR ${levelTag}.
Neste tipo, o aluno ouve uma frase completa e precisa clicar em blocos de palavras na ordem certa para reconstruí-la.
${contexto}
Nível de dificuldade destes exercícios: ${dificuldade}.
${DEFINICAO_DIFICULDADE}
${regrasComuns}
- reading_text e audio_transcript: OS DOIS EXATAMENTE IGUAIS. A frase completa e correta em ${idiomaAlvo}, com pontuação final.
- correct_answer: EXATAMENTE IGUAL a reading_text e audio_transcript (a mesma frase completa)
- alternative_options: array com a frase dividida em 3 a 5 blocos/pedaços (não palavra por palavra necessariamente, pode ser grupos de 2-3 palavras), na ordem correta — o sistema embaralha na tela
Responda ESTRITAMENTE em um array JSON puro, sem markdown, no formato:
[{"reading_text": "O Brasil é muito grande.", "audio_transcript": "O Brasil é muito grande.", "correct_answer": "O Brasil é muito grande.", "alternative_options": ["O Brasil", "é muito", "grande."], "correct_feedback": "...", "incorrect_feedback": "...", "correct_incentive": "...", "incorrect_incentive": "..."}]`;
  }

  if (activityType === 12) {
    return `Você é uma especialista em criação de material didático para ensino de idiomas.
Crie ${quantidade} exercício(s) do tipo TRADUÇÃO INVERSA para uma unidade de curso de ${idiomaAlvo}, nível CEFR ${levelTag}.
Neste tipo, o aluno vê uma frase em ${idiomaNativo} e precisa escolher a tradução correta em ${idiomaAlvo}.
${contexto}
Nível de dificuldade destes exercícios: ${dificuldade}.
${DEFINICAO_DIFICULDADE}
IMPORTANTE — EXCEÇÃO À REGRA DE IDIOMA: neste tipo específico, reading_text deve estar em ${idiomaNativo} (não em ${idiomaAlvo}), porque é a frase original que o aluno vai traduzir.
- reading_text: uma frase natural em ${idiomaNativo}, sobre o tema da unidade
- correct_answer: a tradução correta e natural dessa frase em ${idiomaAlvo}
- alternative_options: array com 3 traduções erradas mas plausíveis em ${idiomaAlvo} — erros comuns de quem fala ${idiomaNativo} aprendendo ${idiomaAlvo} (interferência de idioma, palavra errada, ortografia errada)
- Os textos de feedback e incentivo devem estar 100% em ${idiomaNativo}
- correct_feedback: explica por que a tradução está certa (1-2 frases)
- incorrect_feedback: explica o erro comum (1-2 frases)
- Cada exercício deve ser DIFERENTE dos outros
Responda ESTRITAMENTE em um array JSON puro, sem markdown, no formato:
[{"reading_text": "El sol está fuerte.", "correct_answer": "O sol está forte.", "alternative_options": ["errada1","errada2","errada3"], "correct_feedback": "...", "incorrect_feedback": "...", "correct_incentive": "...", "incorrect_incentive": "..."}]`;
  }

  if (activityType === 8) {
    return `Você é uma especialista em criação de material didático para ensino de idiomas.
Crie ${quantidade} exercício(s) do tipo REORDENAÇÃO DE PARÁGRAFOS para uma unidade de curso de ${idiomaAlvo}, nível CEFR ${levelTag}.
Neste tipo, o aluno vê 4 frases embaralhadas de um parágrafo e precisa reordená-las na sequência lógica correta.
${contexto}
Nível de dificuldade destes exercícios: ${dificuldade}.
${DEFINICAO_DIFICULDADE}
${regrasComuns}
- reading_text: sempre uma string vazia ""
- correct_answer: sempre uma string vazia ""
- alternative_options: array com EXATAMENTE 4 frases em ${idiomaAlvo}, na ORDEM CORRETA (a primeira frase do array é a primeira do parágrafo, e assim por diante) — formando um parágrafo com coesão e coerência real sobre o tema da unidade, não frases soltas sem relação. Use conectores (então, depois, por isso, mas, etc.) quando fizer sentido para amarrar as frases logicamente.
Responda ESTRITAMENTE em um array JSON puro, sem markdown, no formato:
[{"reading_text": "", "correct_answer": "", "alternative_options": ["Primeira frase.", "Segunda frase.", "Terceira frase.", "Quarta frase."], "correct_feedback": "...", "incorrect_feedback": "...", "correct_incentive": "...", "incorrect_incentive": "..."}]`;
  }

  throw new Error(`Tipo de exercício ${activityType} ainda não implementado.`);
}

async function gerarLoteExercicios(activityType: number, unidade: any, levelTag: string, idiomaAlvo: string, idiomaNativo: string, dificuldade: string, quantidade: number, apiKey: string) {
  if (quantidade <= 0) return [];

  const prompt = montarPrompt(activityType, quantidade, unidade, levelTag, idiomaAlvo, idiomaNativo, dificuldade);

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

const NOMES_ATIVIDADE: Record<number, string> = {
  1: "MÚLTIPLA ESCOLHA",
  2: "CAÇA ERRO",
  3: "DESAFIO BLITZ",
  4: "PALAVRA OCULTA",
  9: "PRÁTICA DE CONVERSAÇÃO",
  10: "TREINO DE FALA",
  13: "MARCHAS DE ÁUDIO",
  11: "SPELLING BEE",
  5: "BLOCOS DE GRAMÁTICA",
  7: "ORDENAÇÃO DE FRASES",
  12: "TRADUÇÃO INVERSA",
  8: "REORDENAÇÃO DE PARÁGRAFOS",
};

let ultimaChamada = 0;
const INTERVALO_MINIMO_MS = 5000;

export async function POST(req: NextRequest) {
  try {
    const agora = Date.now();
    if (agora - ultimaChamada < INTERVALO_MINIMO_MS) {
      return NextResponse.json({ erro: "Aguarde alguns segundos antes de gerar novamente." }, { status: 429 });
    }
    ultimaChamada = agora;

    const { unitId, idiomaAlvo, idiomaNativo, metaEasy, metaMedium, metaHard, activityType } = await req.json();

    if (!unitId || !idiomaAlvo || !idiomaNativo || !activityType) {
      return NextResponse.json({ erro: "Parâmetros ausentes." }, { status: 400 });
    }

    const totalPedido = Number(metaEasy || 0) + Number(metaMedium || 0) + Number(metaHard || 0);
    if (totalPedido > 20) {
      return NextResponse.json({ erro: "Máximo de 20 exercícios por vez." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ erro: "Serviço de IA indisponível." }, { status: 503 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const { data: unidade, error: erroUnidade } = await supabase
      .from("units")
      .select("id, unit_number, unit_title, pedagogical_objective, situational_content, hidden_grammatical_structure, module_content_id, skill_label")
      .eq("id", unitId)
      .maybeSingle();

    if (erroUnidade || !unidade) {
      return NextResponse.json({ erro: "Unidade não encontrada." }, { status: 404 });
    }

    const { data: modulo } = await supabase
      .from("modules_content")
      .select("id, level_id, module_title")
      .eq("id", unidade.module_content_id)
      .maybeSingle();

    const { data: nivel } = await supabase
      .from("levels")
      .select("id, level_tag, course_id")
      .eq("id", modulo?.level_id)
      .maybeSingle();

    const levelTag = nivel?.level_tag || "A1";

    const todosExercicios = [];
    for (const [dif, qtd] of [["easy", metaEasy], ["medium", metaMedium], ["hard", metaHard]]) {
      if (Number(qtd) > 0) {
        const lote = await gerarLoteExercicios(activityType, unidade, levelTag, idiomaAlvo, idiomaNativo, dif as string, Number(qtd), apiKey);
        todosExercicios.push(...lote);
      }
    }

    const registrosRascunho = todosExercicios.map((ex: any) => ({
      unit_id: unitId,
      level_tag: levelTag,
      unit_number: unidade.unit_number,
      module: modulo?.module_title || null,
      course_id: nivel?.course_id || null,
      level_id: modulo?.level_id || null,
      module_id: unidade.module_content_id || null,
      skill_code: unidade.skill_label || null,
      texto_audio: ex.texto_audio || null,
      audio_transcript: ex.audio_transcript || null,
      activity_type: activityType,
      activity_name: NOMES_ATIVIDADE[activityType] || `TIPO ${activityType}`,
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

    return NextResponse.json({ exercicios: salvos });
  } catch (err: any) {
    console.error("Erro na rota de geração de exercício:", err);
    return NextResponse.json({ erro: err.message || "Erro interno ao gerar exercício." }, { status: 500 });
  }
}
