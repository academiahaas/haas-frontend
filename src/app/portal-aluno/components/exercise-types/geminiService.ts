export async function chamarGeminiInteligente(...args: any[]) {
  return { status: "ok", feedback: "Resposta registrada com sucesso!", acertou: true };
}

export async function registrarFeedbackEErro(...args: any[]) {
  return { status: "ok", feedback: "Resposta registrada com sucesso!", acertou: true };
}

export async function consultarGemini(...args: any[]) {
  return { status: "ok", feedback: "Resposta registrada com sucesso!" };
}

export default {
  chamarGeminiInteligente,
  registrarFeedbackEErro,
  consultarGemini
};
