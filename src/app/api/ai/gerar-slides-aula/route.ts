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

export async function POST(req: NextRequest) {
  try {
    const { aula_id } = await req.json();
    if (!aula_id) {
      return NextResponse.json({ error: "aula_id obrigatorio" }, { status: 400 });
    }

    const { data: aula, error: erroAula } = await supabase
      .from("aulas_disponiveis")
      .select("id, teacher_id, tipo_aula, idioma, data_hora_inicio")
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
        .select("name, current_level, score_fala, score_escuta, score_leitura, score_escrita, score_gramatica, topico_deficitario")
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
      portugues: "Portuguese",
      ingles: "English",
      espanol: "Spanish",
      frances: "French"
    };
    const idiomaAula = mapaIdiomas[aula.idioma] || "Portuguese";

    const conteudoPrompt = `Aula de idioma, nivel ${nivelPredominante}. ` +
      `Foque especialmente em reforcar: ${areasReforco}. ` +
      `Inclua exemplos praticos e um exercicio curto de pratica no final.`;

    const templateEscolhido = "modelo27";

    const gerarFormato = async (formato: string) => {
      const resposta = await fetch("http://localhost:3009/api/v1/ppt/presentation/generate", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${(process.env.PRESENTON_API_KEY || "").replace(/"/g, "")}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          content: conteudoPrompt,
          n_slides: 6,
          language: idiomaAula,
          template: templateEscolhido,
          theme: "haas",
          export_as: formato,
          include_title_slide: true
        })
      });
      if (!resposta.ok) {
        const erroTexto = await resposta.text();
        throw new Error(`Erro ao gerar ${formato}: ${erroTexto}`);
      }
      const dados = await resposta.json();
      return dados.path;
    };

    let caminhoPdf: string | null = null;
    let caminhoPptx: string | null = null;

    try {
      caminhoPdf = await gerarFormato("pdf");
    } catch (e) {
      console.error(e);
    }

    try {
      caminhoPptx = await gerarFormato("pptx");
    } catch (e) {
      console.error(e);
    }

    if (!caminhoPdf && !caminhoPptx) {
      return NextResponse.json({ error: "Erro ao gerar nos dois formatos" }, { status: 500 });
    }

    await supabase
      .from("aulas_disponiveis")
      .update({
        slides_status: "pronto",
        slides_pdf_path: caminhoPdf,
        slides_pptx_path: caminhoPptx,
        slides_generated_at: new Date().toISOString()
      })
      .eq("id", aula_id);

    return NextResponse.json({ sucesso: true, pdf: caminhoPdf, pptx: caminhoPptx });
  } catch (err: any) {
    console.error("Erro ao gerar slides da aula:", err);
    return NextResponse.json({ error: "Erro inesperado", detalhe: err.message }, { status: 500 });
  }
}
