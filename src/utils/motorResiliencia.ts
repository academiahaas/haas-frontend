import { chamarGeminiInteligente } from '../app/portal-aluno/components/exercise-types/geminiService';

export async function resilienciaTextoCompleto(textoAtual: string, contexto: string): Promise<string> {
  try {
    const prompt = `Gere um texto curto, claro e imponente em português nativo para um exercício do tipo: ${contexto}. Não use formatações complexas ou markdown.`;
    const textoIA = await chamarGeminiInteligente(prompt);
    return textoIA || "Pronto para o próximo desafio estrutural.";
  } catch (e) {
    console.error("Erro na contingência de texto:", e);
    return "Pronto para o próximo desafio estrutural.";
  }
}

export async function resilienciaOpcoes(correta: string, erradas: string[], contexto: string): Promise<string[]> {
  let lista = Array.from(new Set(correta ? [correta, ...erradas] : erradas)).filter(Boolean);
  if (lista.length === 2) return lista;
  const alvo = (lista.length === 0 || lista.length === 3) ? 4 : lista.length;

  if (lista.length < alvo) {
    try {
      const prompt = `Com base na resposta correta "${correta}", gere ${alvo - lista.length} alternativas incorretas plausíveis para o contexto "${contexto}". Retorne apenas as palavras separadas por vírgula, sem numeração ou markdown.`;
      const textoIA = await chamarGeminiInteligente(prompt);
      const geradas = textoIA.split(',').map((s: string) => s.trim()).filter(Boolean);
      geradas.forEach(g => { if (lista.length < alvo && !lista.includes(g)) lista.push(g); });
    } catch (e) {
      console.error("Erro na contingência de opções:", e);
    }
  }
  while (lista.length < alvo) {
    lista.push(`Opção Alternativa ${lista.length + 1}`);
  }
  return lista.slice(0, alvo).sort(() => Math.random() - 0.5);
}

export async function resilienciaLacunas(texto: string, resposta: string, unidade: string) {
  if (texto && texto.includes("___") && resposta) return { texto, resposta };
  return {
    texto: "Eu ______ ao escritório cedo para organizar a pauta.",
    resposta: "fui"
  };
}

interface LogFeedbackParams {
  userId: string;
  enunciado: string;
  respostaCorreta: string;
  respostaAluno: string;
  idiomaNativoAluno: string;
}

export async function registrarFeedbackEErro({
  userId,
  enunciado,
  respostaCorreta,
  respostaAluno,
  idiomaNativoAluno
}: LogFeedbackParams): Promise<{ acertou: boolean; feedback: string }> {
  
  const acertouLocal = respostaAluno.trim().toLowerCase() === respostaCorreta.trim().toLowerCase();
  let feedbackFinal = acertouLocal ? "Excelente! Resposta correta." : `Ajuste necessário. O esperado era: ${respostaCorreta}`;
  let conteudoErroDetectado = "";

  try {
    const prompt = `Você é um avaliador Haas. O aluno fez um exercício de português.
    Enunciado/Contexto: "${enunciado}"
    Gabarito Correto: "${respostaCorreta}"
    O que o aluno respondeu/montou: "${respostaAluno}"
    
    Regras estritas de resposta:
    1. Retorne obrigatoriamente um JSON limpo com duas propriedades:
       "feedback": Uma explicação corta (mínimo 12 palavras) sobre o acerto ou o desvio ortográfico/sintático/escuta cometido pelo aluno. Escreva na língua nativa do aluno: ${idiomaNativoAluno}.
       "conteudo_erro": Se o aluno errou, identifique em apenas 2 ou 3 palavras qual foi o tópico do erro (Ex: "Verbo ser", "Preposições", "Ortografia Ç", "Vocabulário"). Se ele acertou, deixe essa propriedade vazia "".
    
    Retorne apenas o JSON puro, sem markdown ou blocos de código.`;

    const textoIA = await chamarGeminiInteligente(prompt);
    try {
      const jsonLimpo = textoIA.replace(/\`\`\`json/g, "").replace(/\`\`\`/g, "").trim();
      const resultado = JSON.parse(jsonLimpo);
      if (resultado.feedback) feedbackFinal = resultado.feedback;
      if (resultado.conteudo_erro) conteudoErroDetectado = resultado.conteudo_erro;
    } catch (parseErr) {
      console.warn("⚠️ Falha ao parsear JSON da IA, usando texto puro como feedback.");
      feedbackFinal = textoIA.trim();
    }
  } catch (errIA) {
    console.warn("Falha no feedback da IA, usando padrão.", errIA);
  }

  const S_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcHB4Zm9rZmhxanVkd2Z3Y2tkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTkyOTY3OCwiZXhwIjoyMDk1NTA1Njc4fQ.G5o3SANhFRmsvi_RSdoIkXvaVwfxFUHc-OVxBPtnMt4";
  const BASE_SUPABASE_URL = "https://jdppxfokfhqjudwfwckd.supabase.co/rest/v1";

  if (acertouLocal) {
    try {
      await fetch(`${BASE_SUPABASE_URL}/user_progress`, {
        method: "POST",
        headers: {
          "apikey": S_KEY,
          "Authorization": `Bearer ${S_KEY}`,
          "Content-Type": "application/json",
          "Prefer": "return=minimal"
        },
        body: JSON.stringify({
          user_id: userId,
          unit_name: enunciado.length > 50 ? enunciado.substring(0, 47) + "..." : enunciado,
          activity_type: enunciado.toLowerCase().includes("fala") || enunciado.toLowerCase().includes("shadowing") ? 10 : 3,
          points_earned: 10
        })
      });
    } catch (progressErr) {
      console.error("❌ Erro ao registrar progresso:", progressErr);
    }
  } else {
    const topicoErro = conteudoErroDetectado || "Gramática";
    const REST_URL = `${BASE_SUPABASE_URL}/user_error_logs`;
    
    try {
      const checkRes = await fetch(`${REST_URL}?user_id=eq.${userId}&conteudo=eq.${encodeURIComponent(topicoErro)}`, {
        method: "GET",
        headers: {
          "apikey": S_KEY,
          "Authorization": `Bearer ${S_KEY}`,
          "Content-Type": "application/json"
        }
      });
      
      const logsExistentes = checkRes.ok ? await checkRes.json() : [];
      
      if (logsExistentes && logsExistentes.length > 0) {
        const log = logsExistentes[0];
        await fetch(`${REST_URL}?id=eq.${log.id}`, {
          method: "PATCH",
          headers: {
            "apikey": S_KEY,
            "Authorization": `Bearer ${S_KEY}`,
            "Content-Type": "application/json",
            "Prefer": "return=minimal"
          },
          body: JSON.stringify({ frequencia: Number(log.frequencia || 1) + 1 })
        });
      } else {
        await fetch(REST_URL, {
          method: "POST",
          headers: {
            "apikey": S_KEY,
            "Authorization": `Bearer ${S_KEY}`,
            "Content-Type": "application/json",
            "Prefer": "return=minimal"
          },
          body: JSON.stringify({ user_id: userId, conteudo: topicoErro, frequencia: 1 })
        });
      }
    } catch (dbErr) {
      console.error("❌ Falha ao persistir log de erro:", dbErr);
    }
  }

  return { acertou: acertouLocal, feedback: feedbackFinal };
}
