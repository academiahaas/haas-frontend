import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const traduzirIdioma = (sigla: string): string => {
  if (!sigla) return "Português";
  const s = sigla.toLowerCase().trim();
  if (s === 'es' || s === 'espanhol' || s === 'español') return "Espanhol";
  if (s === 'pt' || s === 'portugues' || s === 'português') return "Português";
  if (s === 'en' || s === 'ingles' || s === 'inglês' || s === 'english') return "Inglês";
  return sigla;
};

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const prompt = body?.prompt;
    const userId = body?.userId;
    const chatHistory = body?.chatHistory;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""; 

    if (!userId) return NextResponse.json({ success: false, error: "Falta o userId" }, { status: 400 });

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: userData } = await supabase.from('users').select('name, native_language, course_language').eq('id', userId).single();
    const { data: snapshot } = await supabase.from('user_ai_pedagogic_snapshot').select('foco_erros_recentes').eq('user_id', userId).single();

    const IDIOMA_NATIVO = traduzirIdioma(userData?.native_language);
    const IDIOMA_ALVO = traduzirIdioma(userData?.course_language);
    
    let focoErrosTexto = "";
    if (snapshot?.foco_erros_recentes) {
      if (typeof snapshot.foco_erros_recentes === 'object' && !Array.isArray(snapshot.foco_erros_recentes)) {
        focoErrosTexto = Object.keys(snapshot.foco_erros_recentes).slice(0, 2).join(" e ");
      } else if (Array.isArray(snapshot.foco_erros_recentes)) {
        focoErrosTexto = snapshot.foco_erros_recentes.slice(0, 2).join(" e ");
      } else if (typeof snapshot.foco_erros_recentes === 'string') {
        focoErrosTexto = snapshot.foco_erros_recentes;
      }
    }
    const DEBILIDADES_SEMANA = focoErrosTexto.trim() || "Revisão geral de estruturas de conversação";

    const textoPrompt = prompt ? prompt.toString() : "";
    const temHistorico = Array.isArray(chatHistory) && chatHistory.length > 0;

    const instrucaoSistema = `
Você é a Mentora Haas. O idioma nativo do seu aluno é ${IDIOMA_NATIVO} e ele está aprendendo ${IDIOMA_ALVO}. Fraquezas da semana: ${DEBILIDADES_SEMANA}.

[REGRA DE OURO - HISTÓRICO VAZIO]
Se o histórico estiver vazio (primeira mensagem do chat), saude o aluno cordialmente em ${IDIOMA_NATIVO}, apresente-se como Mentora Haas e mencione que hoje focarão em: "${DEBILIDADES_SEMANA}". Não adicione mais nada.

[REGRA DE IDIOMA NAS INTERAÇÕES SEGUINTES]
Se o histórico já possuir mensagens anteriores, você deve analisar o "Último mensagem recebido" do aluno e responder OBRIGATORIAMENTE no MESMO IDIOMA em que ele se comunicou com você nessa última frase.

[REGRAS CRÍTICAS DE SAÍDA - SEJA ESTRITO]
Sua resposta na tela deve conter única e exclusivamente dois parágrafos limpos, sem qualquer tipo de tag markdown ou saudações, separados por uma linha em branco. Cada parágrafo DEVE iniciar obrigatoriamente com a sigla do idioma correspondente entre colchetes ([pt-BR], [es-ES] ou [en-US]), pois o sistema precisa disso para calibrar a voz.

PARÁGRAFO 1:
- Inicie obrigatoriamente com a tag do idioma em que o aluno falou (ex: [pt-BR]). Comente de forma muito fluida sobre o que ele disse, ou corrija apenas erros reais de vocabulário e concordância. Despreze totalmente a falta de pontos, vírgulas ou interrogações na fala dele. Proibido usar saudações se o histórico já tiver mensagens.

PARÁGRAFO 2:
- Inicie obrigatoriamente com a tag do idioma alvo (ex: [es-ES] ou [en-US]). Faça uma única pergunta direta, curta e natural formulada estritamente no idioma alvo (${IDIOMA_ALVO}) para manter o aluno praticando o curso. Proibido repetir saudações ou frases introdutórias.
`;

    let stringHistorico = "";
    if (temHistorico) {
      stringHistorico = "\n\n[HISTÓRICO RECENTE DO CHAT]\n" + chatHistory.slice(-5).map((h: any) => {
        const remitente = h.tipo === 'user' ? 'Aluno' : 'Mentora Haas';
        return `${remitente}: ${h.texto || h.content || ""}`;
      }).join("\n");
    } else {
      stringHistorico = "\n\n[HISTÓRICO RECENTE DO CHAT]\n(Histórico vazio. Primeira interação do aluno).";
    }

    const apiKeyGemini = process.env.GEMINI_API_KEY || "";
    const urlGemini = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKeyGemini}`;

    const resGemini = await fetch(urlGemini, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: `${instrucaoSistema}\n\n${stringHistorico}\n\nÚltimo mensagem recebido: "${textoPrompt}"\n\nGerar resposta seguindo rigidamente os 2 parágrafos:` }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          topP: 0.8,
          maxOutputTokens: 800
        }
      })
    });

    if (!resGemini.ok) {
      const errTexto = await resGemini.text();
      return new Response(`Erro na API do Gemini: ${errTexto}`, { status: 500 });
    }

    const resultadoJson = await resGemini.json();
    let textoResposta = resultadoJson?.candidates?.[0]?.content?.parts?.[0]?.text || "Desculpe, tive um problema ao gerar a resposta.";

    // Remove as tags de idioma que confundem o leitor de voz do navegador
    textoResposta = textoResposta.replace(/\[pt-BR\]/gi, '').replace(/\[es-ES\]/gi, '').replace(/\[en-US\]/gi, '').trim();

    return new Response(textoResposta, {
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });

  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  }
}
