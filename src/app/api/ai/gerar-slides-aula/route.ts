import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function traduzirTopico(codigo: string | null): string {
  if (!codigo) return "";
  return codigo.replace(/_/g, " ").toLowerCase();
}

const REGRAS_GERAIS = `REGRAS DE IDIOMA (MUITO IMPORTANTE):
- O prompt do usuario vai dizer qual e o IDIOMA NATIVO dos alunos e qual e o IDIOMA SENDO ENSINADO.
- Se IDIOMA NATIVO e IDIOMA SENDO ENSINADO forem o MESMO: escreva tudo (titulos, explicacoes, instrucoes, perguntas, exemplos) nesse idioma.
- Se forem DIFERENTES: escreva titulos, explicacoes e instrucoes no IDIOMA NATIVO do aluno. As frases de EXEMPLO e os EXERCICIOS ficam no IDIOMA SENDO ENSINADO, mas a explicacao AO REDOR delas fica sempre no idioma nativo do aluno.

REGRAS OBRIGATORIAS:
- Este link e COMPARTILHADO entre professor e aluno na mesma tela. NUNCA gere campos ocultos tipo "nota_pedagogica" - tudo e visto por todos.
- Professores sao fluentes e conduzem tudo ao vivo. PROIBIDO exercicios de escuta/audio.
- Proibido usar A1/A2/B1/B2/C1/C2. Use: Inicial, Basico, Intermediario, Independente, Avancado.
- Cada campo de texto explicativo ("descricao", "conteudo", "explicacao", "contexto") deve ter 3 a 5 frases REAIS, especificas sobre o tema desta aula. NUNCA deixe um campo vazio ou so com um exemplo solto sem explicacao da regra.
- Responda APENAS com JSON valido, sem markdown, sem comentarios.`;

async function chamarIA(promptSistema: string, promptUsuario: string, maxTokens: number) {
  const resposta = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: promptSistema },
        { role: "user", content: promptUsuario },
      ],
      response_format: { type: "json_object" },
      max_tokens: maxTokens,
    }),
  });
  if (!resposta.ok) {
    const erroTexto = await resposta.text();
    throw new Error(`Erro DeepSeek: ${erroTexto}`);
  }
  const dados = await resposta.json();
  return JSON.parse(dados.choices[0].message.content);
}

// ============ CHAMADA 1: CONEXAO + EXPOSICAO (slides 1-9) ============
async function gerarBloco1(promptBase: string) {
  const sistema = `${REGRAS_GERAIS}

Voce gera APENAS os slides 1 a 9 de uma aula (blocos Conexao e Exposicao). Formato de saida: {"slides": [...]} com exatamente 9 objetos.

slide 1 tipo "capa": {"tipo":"capa","numero":1,"titulo":"...","subtitulo":"..."}
slide 2 tipo "presenca": {"tipo":"presenca","numero":2,"titulo":"Presenca","subtitulo":"..."} (NUNCA inclua nomes de aluno)
slide 3 tipo "fala": {"tipo":"fala","numero":3,"titulo":"Aquecimento","pergunta":"...","subprompts":["dica 1","dica 2"]} (subprompts SEMPRE lista com 2 itens, nunca outro nome de campo)
slide 4 tipo "objetivos": {"tipo":"objetivos","numero":4,"titulo":"...","objetivos":["objetivo 1","objetivo 2","objetivo 3"]} (campo se chama EXATAMENTE "objetivos", nunca "objetivos_lista")
slide 5 tipo "metodologia": {"tipo":"metodologia","numero":5,"titulo":"...","etapas":[{"nome":"Fala Ativa Primeiro","descricao":"4-5 frases reais e especificas sobre como conduzir isso NESTA aula"}, ...mais 4 etapas: Exposicao do Conteudo, Leitura Complementar, Pratica Guiada com Pronuncia, Conversacao]}
slides 6-8 tipo "exposicao": {"tipo":"exposicao","numero":N,"titulo":"...","conteudo":"TEXTO CORRIDO de 5-7 frases EXPLICANDO A REGRA GRAMATICAL EM DETALHE, com o PORQUE e o COMO, nao apenas exemplos soltos","exemplos":["exemplo 1","exemplo 2","exemplo 3","exemplo 4","exemplo 5"],"dica_pronuncia":"dica de pronuncia especifica"}
IMPORTANTE: o campo "conteudo" da exposicao NUNCA pode ser so uma lista de frases sem explicacao. Tem que ser um paragrafo explicando a regra como um professor explicaria no quadro, com comparacoes e o motivo da regra existir.
slide 9 tipo "recapitulacao": {"tipo":"recapitulacao","numero":9,"titulo":"Resumo Rapido","cards":[{"regra":"...","exemplo":"..."}, ...4 a 6 cards]}`;

  return await chamarIA(sistema, promptBase, 6000);
}

// ============ CHAMADA 2: PRATICA GUIADA (slides 10-19) ============
async function gerarBloco2(promptBase: string) {
  const sistema = `${REGRAS_GERAIS}

Voce gera APENAS 10 slides de pratica guiada (slides 10 a 19), um exercicio por slide. Formato: {"slides": [...]} com exatamente 10 objetos.

Cada slide: {"tipo":"pratica","numero":N,"titulo":"Exercicio X","tipo_exercicio":"lacuna|multipla_escolha|transformacao|correcao_erro|reordenar|pronuncia","contexto":"1-2 frases explicando o PORQUE desse exercicio importar, uma curiosidade gramatical ou cultural relacionada","enunciado":"o exercicio em si, SEM a resposta escrita nele","resposta":"a resposta certa (nao incluir se for pronuncia)","opcoes":["op1","op2","op3"] (APENAS se tipo_exercicio for multipla_escolha),"nivel":"Inicial|Basico|Intermediario|Independente|Avancado","dica":"dica curta pro aluno tentar sozinho","explicacao":"2-3 frases explicando por que a resposta certa esta certa, para o professor usar apos a correcao (nao incluir se for pronuncia)"}

OBRIGATORIO: TODOS os 10 slides devem ter os campos "contexto" e "explicacao" preenchidos (exceto pronuncia, que dispensa "explicacao" e "resposta"). Isso e inegociavel - sem excecao, sem pular nenhum exercicio.
Progressao: exercicios 1-4 Inicial/Basico, 5-7 Intermediario, 8-10 Independente/Avancado. Variar os tipos_exercicio ao longo dos 10.`;

  return await chamarIA(sistema, promptBase, 8000);
}

// ============ CHAMADA 3: CONVERSACAO + ENCERRAMENTO (slides 20-29) ============
async function gerarBloco3(promptBase: string) {
  const sistema = `${REGRAS_GERAIS}

Voce gera os slides 20 a 29 de uma aula (blocos Conversacao e Encerramento). Formato: {"slides": [...]} com exatamente 10 objetos.

slides 20-27 (8 slides) tipo "fala": {"tipo":"fala","numero":N,"titulo":"Conversacao","pergunta":"1 pergunta nova, nunca repita as anteriores","subprompts":["dica de apoio 1","dica de apoio 2"]} (subprompts SEMPRE lista de 2 itens). As perguntas evoluem em complexidade ao longo dos 8 slides: comecam simples (nome, rotina) e terminam em opiniao, comparacao, hipotese ou storytelling, relacionadas ao tema da aula.

slide 28 tipo "escrita": {"tipo":"escrita","numero":28,"titulo":"Hora de Escrever","atividade_escrita":"atividade especifica e concreta de escrita relacionada ao tema desta aula","conteudo":"instrucao de como fazer","texto_explicativo":"por que escrever ajuda a fixar o conteudo desta aula especifica"}

slide 29 tipo "encerramento": {"tipo":"encerramento","numero":29,"titulo":"Encerramento","resumo_aula":"resumo real de 2-4 frases do que foi ensinado nesta aula especifica","tarefa":"tarefa de casa concreta","sugestao_musica":"nome de uma musica REAL e CONHECIDA (de qualquer epoca, nao precisa ser recente) que tenha alguma conexao tematica ou linguistica com o assunto da aula - sempre sugira alguma, mesmo que a conexao seja simples","sugestao_livro":"titulo de um livro REAL e CONHECIDO adequado ao nivel do aluno para praticar o idioma - sempre sugira algum, mesmo generico como um classico adequado ao nivel"}
IMPORTANTE: "sugestao_musica" e "sugestao_livro" sao OBRIGATORIOS, sempre preencha os dois com algo real e conhecido, nunca deixe em branco.`;

  return await chamarIA(sistema, promptBase, 4000);
}

export async function POST(req: NextRequest) {
  try {
    const { aula_id } = await req.json();
    if (!aula_id) {
      return NextResponse.json({ error: "aula_id obrigatorio" }, { status: 400 });
    }

    const { data: aula, error: erroAula } = await supabase
      .from("aulas_disponiveis")
      .select("id, teacher_id, tipo_aula, idioma, data_hora_inicio, data_hora_fim")
      .eq("id", aula_id)
      .single();

    if (erroAula || !aula) {
      return NextResponse.json({ error: "Aula nao encontrada" }, { status: 404 });
    }

    const { data: matriculas } = await supabase
      .from("aula_matriculas")
      .select("user_id")
      .eq("aula_id", aula_id);

    const idsAlunos = (matriculas || []).map((m) => m.user_id);

    let alunosInfo: any[] = [];
    if (idsAlunos.length > 0) {
      const { data: alunos } = await supabase
        .from("users")
        .select("name, current_level, course_id, score_fala, score_escuta, score_leitura, score_escrita, score_gramatica, topico_deficitario")
        .in("id", idsAlunos);
      alunosInfo = alunos || [];
    }

    let nivelPredominante = "A1";
    if (alunosInfo.length > 0 && alunosInfo[0].current_level) {
      nivelPredominante = alunosInfo[0].current_level;
    }

    const topicosParaReforcar = new Set<string>();
    alunosInfo.forEach((a) => {
      const notas = [
        { area: "fala", valor: a.score_fala },
        { area: "escuta", valor: a.score_escuta },
        { area: "leitura", valor: a.score_leitura },
        { area: "escrita", valor: a.score_escrita },
        { area: "gramatica", valor: a.score_gramatica }
      ].filter((n) => n.valor !== null && n.valor !== undefined);

      if (notas.length > 0) {
        const pior = notas.reduce((min, atual) => (atual.valor < min.valor ? atual : min));
        topicosParaReforcar.add(pior.area);
      }
      if (a.topico_deficitario) {
        topicosParaReforcar.add(traduzirTopico(a.topico_deficitario));
      }
    });

    const areasReforco = Array.from(topicosParaReforcar).join(", ") || "conteudo geral do nivel";

    const mapaIdiomas: Record<string, string> = {
      portugues: "Portugues",
      ingles: "Ingles",
      espanol: "Espanhol",
      frances: "Frances"
    };
    const idiomaEnsinado = mapaIdiomas[aula.idioma] || "Portugues";

    // Cursos de ingles cujo idioma auxiliar/institucional e Espanhol (mesma lista usada no motor de videos)
    const CURSOS_INGLES = new Set(["6669de72-d64c-4a2d-b360-2cc7c478ae83", "8f73b9e1-2c4d-4a1b-9f8e-d7a6c5b4e3f2"]);
    const courseIdAluno = alunosInfo.length > 0 ? alunosInfo[0].course_id : null;
    const idiomaNativo = courseIdAluno && CURSOS_INGLES.has(courseIdAluno) ? "Espanhol" : "Portugues";

    const promptBase = `Idioma nativo dos alunos: ${idiomaNativo}. Idioma sendo ensinado: ${idiomaEnsinado}. Nivel: ${nivelPredominante}. ` +
      `Foque especialmente em reforcar: ${areasReforco}.`;

    // Chama as 3 partes em paralelo (mais rapido que sequencial)
    const [parte1, parte2, parte3] = await Promise.all([
      gerarBloco1(promptBase),
      gerarBloco2(promptBase),
      gerarBloco3(promptBase),
    ]);

    const todosOsSlides = [
      ...(parte1.slides || []),
      ...(parte2.slides || []),
      ...(parte3.slides || []),
    ];

    const nomesReais = alunosInfo.map((a: any) => a.name || "Aluno");
    const slidePresenca = todosOsSlides.find((s: any) => s.tipo === "presenca");
    if (slidePresenca) {
      slidePresenca.alunos = nomesReais.length > 0 ? nomesReais : ["Turma sem alunos matriculados"];
    }

    const conteudoGerado = { slides: todosOsSlides };

    const dataFimAula = aula.data_hora_fim ? new Date(aula.data_hora_fim) : new Date();
    const expiraEm = new Date(dataFimAula.getTime() + 60 * 60 * 1000);

    await supabase
      .from("aulas_disponiveis")
      .update({
        slides_status: "pronto",
        slides_conteudo: conteudoGerado,
        slides_expira_em: expiraEm.toISOString(),
        slides_generated_at: new Date().toISOString()
      })
      .eq("id", aula_id);

    return NextResponse.json({ sucesso: true, link: `https://campus.academiahaas.com/slides/${aula_id}`, total_slides: todosOsSlides.length });
  } catch (err: any) {
    console.error("Erro ao gerar slides da aula:", err);
    return NextResponse.json({ error: "Erro inesperado", detalhe: err.message }, { status: 500 });
  }
}
