export async function chamarGeminiInteligente(prompt: string): Promise<string> {
  const chavesEnv = process.env.NEXT_PUBLIC_GEMINI_API_KEYS || process.env.GEMINI_API_KEYS || "AQ.Ab8RN6ITzzZzIrF1-0SiE8bEnlIj172vgUHCJWaQdwmNSNcbug";
  const listaChaves = chavesEnv.split(",").map(key => key.trim()).filter(Boolean);

  const frasesMotivacionais = [
    "Muito bem! Continue praticando para aperfeiçoar ainda mais seu aprendizado.",
    "Excelente esforço! Cada exercício te deixa mais próximo da fluência.",
    "Boa tentativa! Analise a estrutura com carinho e continue evoluindo.",
    "Parabéns pelo empenho! O progresso vem com a consistência do treino diário."
  ];

  for (const chave of listaChaves) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${chave}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      if (response.ok) {
        const json = await response.json();
        const textoIA = json?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (textoIA) return textoIA.trim();
      }
      
      if (response.status === 429) {
        continue;
      }
    } catch (error) {
      console.error("Erro pool:", error);
    }
  }
  return frasesMotivacionais[Math.floor(Math.random() * frasesMotivacionais.length)];
}
