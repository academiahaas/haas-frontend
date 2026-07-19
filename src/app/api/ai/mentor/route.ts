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
Se o histórico já possuir mensagens anteriores, você deve analisar o "Último mensagem recebido" do aluno e responder OBRIGATORIAMENTE no MESMO IDIOMA em que ele se comunicou com você nessa última frase (se ele falar em português, responda em português; se ele falar em inglês, responda em inglês). 

[REGRAS CRÍTICAS DE SAÍDA - SEJA ESTRITO]
Sua resposta na tela deve conter única e exclusivamente dois parágrafos limpos, sem qualquer tipo de tag, separados por uma linha em branco:

PARÁGRAFO 1:
- Comente de forma muito fluida sobre o que o aluno acabou de dizer, ou corrija de forma simples eventuais erros de gramática. Lembre-se de usar o mesmo idioma que o aluno usou para falar com você. Proibido saudar ou dar boas-vindas se o histórico já tiver mensagens.

PARÁGRAFO 2:
- Faça uma única pergunta direta, curta e natural formulada no idioma alvo (${IDIOMA_ALVO}) para manter o aluno praticando o curso.
- PROIBIDO repetir saudações ou frases introdutórias neste segundo parágrafo. Vá direto para a pergunta.
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
    const textoResposta = resultadoJson?.candidates?.[0]?.content?.parts?.[0]?.text || "Desculpe, tive um problema ao gerar a resposta.";

    return new Response(textoResposta, {
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });

  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  }
}
