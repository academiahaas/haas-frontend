// Dicionário compartilhado de textos de feedback (fallback) para os miolos de exercício.
// Usado quando o exercício não tem feedback_correct/feedback_incorrect/incentive cadastrado no banco.
// Sempre respeita o idioma nativo do aluno (idiomaNativoAluno).

export function obterLangKeyCompartilhado(idiomaNativoAluno?: string): "en" | "pt" | "es" {
  const lang = idiomaNativoAluno?.toLowerCase() || "";
  if (lang.includes("eng") || lang.includes("ing")) return "en";
  if (lang.includes("por") || lang.includes("bra")) return "pt";
  return "es";
}

type LangDict = { pt: string; es: string; en: string };

function pick(dict: LangDict, langKey: "en" | "pt" | "es"): string {
  return dict[langKey];
}

export const feedbackTraducoes = {
  ditadoLacunas: {
    incentivoCorreto: (l: "en" | "pt" | "es") => pick({ pt: "Excelente preenchimento!", es: "¡Excelente respuesta!", en: "Excellent fill-in!" }, l),
    incentivoIncorreto: (l: "en" | "pt" | "es") => pick({ pt: "Atenção à grafia e ao contexto.", es: "Presta atención a la ortografía y al contexto.", en: "Pay attention to spelling and context." }, l),
    incentivoIncorretoQuase: (l: "en" | "pt" | "es") => pick({ pt: "Quase lá! Confira a palavra novamente.", es: "¡Casi! Revisa la palabra de nuevo.", en: "Almost there! Check the word again." }, l),
    feedbackCorreto: (l: "en" | "pt" | "es") => pick({ pt: "Excelente!", es: "¡Excelente!", en: "Excellent!" }, l),
    feedbackIncorreto: (l: "en" | "pt" | "es", palavra: string) => pick({ pt: `Desvio ortográfico detectado. O esperado era: ${palavra}`, es: `Se detectó un error ortográfico. Lo esperado era: ${palavra}`, en: `Spelling deviation detected. The expected answer was: ${palavra}` }, l),
  },
  blocos: {
    incentivoCorreto: (l: "en" | "pt" | "es") => pick({ pt: "Excelente montagem de sentença!", es: "¡Excelente construcción de la oración!", en: "Excellent sentence construction!" }, l),
    incentivoIncorreto: (l: "en" | "pt" | "es") => pick({ pt: "Atenção à ordem sintática dos blocos.", es: "Presta atención al orden sintáctico de los bloques.", en: "Pay attention to the syntactic order of the blocks." }, l),
    feedbackCorreto: (l: "en" | "pt" | "es") => pick({ pt: "Excelente ordenação de sintaxe!", es: "¡Excelente orden sintáctico!", en: "Excellent syntax ordering!" }, l),
    feedbackIncorreto: (l: "en" | "pt" | "es") => pick({ pt: "A estrutura dos blocos possui desvios de ordem sintática.", es: "La estructura de los bloques presenta errores de orden sintáctico.", en: "The block structure has syntactic ordering errors." }, l),
  },
  cacaErro: {
    incentivoCorreto: (l: "en" | "pt" | "es") => pick({ pt: "Excelente visão! Erro identificado.", es: "¡Excelente ojo! Error identificado.", en: "Excellent eye! Error identified." }, l),
    incentivoIncorreto: (l: "en" | "pt" | "es") => pick({ pt: "Atenção à estrutura da frase.", es: "Presta atención a la estructura de la frase.", en: "Pay attention to the sentence structure." }, l),
    incentivoIncorretoQuase: (l: "en" | "pt" | "es") => pick({ pt: "Quase lá! Analise os trechos com cuidado.", es: "¡Casi! Analiza los fragmentos con cuidado.", en: "Almost there! Analyze the passages carefully." }, l),
    feedbackCorreto: (l: "en" | "pt" | "es") => pick({ pt: "Excelente escolha!", es: "¡Excelente elección!", en: "Excellent choice!" }, l),
    feedbackIncorreto: (l: "en" | "pt" | "es") => pick({ pt: "Esta opção contém um desvio estrutural.", es: "Esta opción contiene un error estructural.", en: "This option contains a structural error." }, l),
  },
  leituraRapida: {
    incentivoCorreto: (l: "en" | "pt" | "es") => pick({ pt: "Excelente velocidade e retenção de leitura!", es: "¡Excelente velocidad y retención de lectura!", en: "Excellent reading speed and retention!" }, l),
    incentivoIncorreto: (l: "en" | "pt" | "es") => pick({ pt: "Atenção ao ritmo de leitura e compreensão do texto.", es: "Presta atención al ritmo de lectura y a la comprensión del texto.", en: "Pay attention to reading pace and text comprehension." }, l),
    feedbackCorreto: (l: "en" | "pt" | "es") => pick({ pt: "Fidelidade e retenção textual validadas!", es: "¡Fidelidad y retención textual validadas!", en: "Textual fidelity and retention validated!" }, l),
    feedbackIncorreto: (l: "en" | "pt" | "es") => pick({ pt: "Texto incompleto ou distante do conteúdo original.", es: "Texto incompleto o alejado del contenido original.", en: "Text incomplete or far from the original content." }, l),
  },
  multiplaEscolha: {
    incentivoCorreto: (l: "en" | "pt" | "es") => pick({ pt: "Excelente! Opção correta.", es: "¡Excelente! Opción correcta.", en: "Excellent! Correct option." }, l),
    incentivoIncorreto: (l: "en" | "pt" | "es") => pick({ pt: "Atenção aos detalhes da pergunta.", es: "Presta atención a los detalles de la pregunta.", en: "Pay attention to the question details." }, l),
    incentivoIncorretoQuase: (l: "en" | "pt" | "es") => pick({ pt: "Quase lá! Revise as opções com atenção.", es: "¡Casi! Revisa las opciones con atención.", en: "Almost there! Review the options carefully." }, l),
    feedbackCorreto: (l: "en" | "pt" | "es") => pick({ pt: "Excelente!", es: "¡Excelente!", en: "Excellent!" }, l),
    feedbackIncorreto: (l: "en" | "pt" | "es") => pick({ pt: "Incorreto.", es: "Incorrecto.", en: "Incorrect." }, l),
  },
  ordenacao: {
    incentivoCorreto: (l: "en" | "pt" | "es") => pick({ pt: "Excelente ordenação de sentença!", es: "¡Excelente orden de la oración!", en: "Excellent sentence ordering!" }, l),
    incentivoIncorreto: (l: "en" | "pt" | "es") => pick({ pt: "Atenção à ordem sintática dos elementos.", es: "Presta atención al orden sintáctico de los elementos.", en: "Pay attention to the syntactic order of the elements." }, l),
    feedbackCorreto: (l: "en" | "pt" | "es") => pick({ pt: "Excelente ordenação sintática!", es: "¡Excelente orden sintáctico!", en: "Excellent syntactic ordering!" }, l),
    feedbackIncorreto: (l: "en" | "pt" | "es") => pick({ pt: "A ordem dos blocos possui desvios de concordância.", es: "El orden de los bloques presenta errores de concordancia.", en: "The order of the blocks has agreement errors." }, l),
  },
  velocidadeProgressiva: {
    incentivoCorreto: (l: "en" | "pt" | "es") => pick({ pt: "Excelente! Ótima escuta.", es: "¡Excelente! Muy buena escucha.", en: "Excellent! Great listening." }, l),
    incentivoIncorreto: (l: "en" | "pt" | "es") => pick({ pt: "Atenção aos detalhes do áudio.", es: "Presta atención a los detalles del audio.", en: "Pay attention to the audio details." }, l),
    incentivoIncorretoQuase: (l: "en" | "pt" | "es") => pick({ pt: "Quase lá! Ouça com atenção novamente.", es: "¡Casi! Escucha con atención nuevamente.", en: "Almost there! Listen carefully again." }, l),
    feedbackCorreto: (l: "en" | "pt" | "es") => pick({ pt: "Excelente!", es: "¡Excelente!", en: "Excellent!" }, l),
    feedbackIncorreto: (l: "en" | "pt" | "es") => pick({ pt: "Incorreto.", es: "Incorrecto.", en: "Incorrect." }, l),
  },
  spellingBee: {
    feedbackCorreto: (l: "en" | "pt" | "es") => pick({ pt: "Excelente soletração! Você organizou todas as letras na ordem ortográfica correta perfeitamente.", es: "¡Excelente deletreo! Has organizado todas las letras en el orden ortográfico correcto de manera perfecta.", en: "Excellent spelling! You organized all the letters in the correct order perfectly." }, l),
    feedbackIncorreto: (l: "en" | "pt" | "es") => pick({ pt: "A ordem das letras possui um erro ortográfico. Revise a estrutura e sequência da palavra.", es: "El orden de las letras tiene un error ortográfico. Revisa la estructura y secuencia de la palabra.", en: "The order of the letters has a spelling error. Review the word's structure and sequence." }, l),
  },
  shadowing: {
    naoOuvi: (l: "en" | "pt" | "es") => pick({ pt: "Não consegui ouvir suas palavras com clareza. Você poderia pressionar o botão e repetir a frase?", es: "No pude escuchar tus palabras con claridad. ¿Podrías presionar el botón y repetir la frase?", en: "I couldn't hear any words clearly. Could you please click the button and repeat the sentence?" }, l),
  },
  traducaoInversa: {
    feedbackCorreto: (l: "en" | "pt" | "es") => pick({ pt: "Excelente! Tradução perfeita.", es: "¡Excelente! Traducción perfecta.", en: "Excellent! Perfect translation." }, l),
    incentivoIncorreto: (l: "en" | "pt" | "es") => pick({ pt: "Quase lá! Atenção aos detalhes na tradução.", es: "¡Casi! Presta atención a los detalles en la traducción.", en: "Almost there! Pay attention to the translation details." }, l),
    feedbackIncorreto: (l: "en" | "pt" | "es", esperado: string) => pick({ pt: `Quase lá! A tradução esperada é: "${esperado}"`, es: `¡Casi! La traducción esperada es: "${esperado}"`, en: `Almost there! The expected translation is: "${esperado}"` }, l),
  },
  generico: {
    acerto: (l: "en" | "pt" | "es") => pick({ pt: "Excelente! Resposta correta.", es: "¡Excelente! Respuesta correcta.", en: "Excellent! Correct answer." }, l),
    erro: (l: "en" | "pt" | "es", esperado: string) => pick({ pt: `Ajuste necessário. O esperado era: ${esperado}`, es: `Ajuste necesario. Lo esperado era: ${esperado}`, en: `Adjustment needed. The expected answer was: ${esperado}` }, l),
  },
  titulos: {
    ditadoCorreto: (l: "en" | "pt" | "es") => pick({ pt: "Escrita Correta!", es: "¡Escritura Correcta!", en: "Correct Spelling!" }, l),
    ditadoIncorreto: (l: "en" | "pt" | "es") => pick({ pt: "Análise de Escrita", es: "Análisis de Escritura", en: "Writing Analysis" }, l),
    blocosCorreto: (l: "en" | "pt" | "es") => pick({ pt: "Gramática Correta!", es: "¡Gramática Correcta!", en: "Correct Grammar!" }, l),
    blocosIncorreto: (l: "en" | "pt" | "es") => pick({ pt: "Análise de Sintaxe", es: "Análisis de Sintaxis", en: "Syntax Analysis" }, l),
    cacaErroCorreto: (l: "en" | "pt" | "es") => pick({ pt: "Excelente!", es: "¡Excelente!", en: "Excellent!" }, l),
    cacaErroIncorreto: (l: "en" | "pt" | "es") => pick({ pt: "Ajuste necessário", es: "Ajuste necesario", en: "Adjustment needed" }, l),
    leituraCorreto: (l: "en" | "pt" | "es") => pick({ pt: "Excelente Retenção!", es: "¡Excelente Retención!", en: "Excellent Retention!" }, l),
    leituraIncorreto: (l: "en" | "pt" | "es") => pick({ pt: "Análise de Leitura", es: "Análisis de Lectura", en: "Reading Analysis" }, l),
    multiplaEscolhaCorreto: (l: "en" | "pt" | "es") => pick({ pt: "Excelente! Opção Correta", es: "¡Excelente! Opción Correcta", en: "Excellent! Correct Option" }, l),
    multiplaEscolhaIncorreto: (l: "en" | "pt" | "es") => pick({ pt: "Ajuste Necessário", es: "Ajuste Necesario", en: "Adjustment Needed" }, l),
    ordenacaoCorreto: (l: "en" | "pt" | "es") => pick({ pt: "Sintaxe Correta!", es: "¡Sintaxis Correcta!", en: "Correct Syntax!" }, l),
    ordenacaoIncorreto: (l: "en" | "pt" | "es") => pick({ pt: "Análise de Estrutura", es: "Análisis de Estructura", en: "Structure Analysis" }, l),
    paragrafosIncorreto: (l: "en" | "pt" | "es") => pick({ pt: "Análise de Coesão", es: "Análisis de Cohesión", en: "Cohesion Analysis" }, l),
    paragrafosCorreto: (l: "en" | "pt" | "es") => pick({ pt: "Coerência Textual Perfeita!", es: "¡Coherencia Textual Perfecta!", en: "Perfect Textual Coherence!" }, l),
    spellingBeeIncorreto: (l: "en" | "pt" | "es") => pick({ pt: "Análise de Soletração", es: "Análisis de Deletreo", en: "Spelling Analysis" }, l),
    spellingBeeCorreto: (l: "en" | "pt" | "es") => pick({ pt: "Soletração Perfeita!", es: "¡Deletreo Perfecto!", en: "Perfect Spelling!" }, l),
    traducaoCorreto: (l: "en" | "pt" | "es") => pick({ pt: "Estrutura Correta!", es: "¡Estructura Correcta!", en: "Correct Structure!" }, l),
    traducaoIncorreto: (l: "en" | "pt" | "es") => pick({ pt: "Análise de Tradução", es: "Análisis de Traducción", en: "Translation Analysis" }, l),
    velocidadeCorreto: (l: "en" | "pt" | "es") => pick({ pt: "Excelente! Resposta Correta", es: "¡Excelente! Respuesta Correcta", en: "Excellent! Correct Answer" }, l),
    velocidadeIncorreto: (l: "en" | "pt" | "es") => pick({ pt: "Ajuste Necessário", es: "Ajuste Necesario", en: "Adjustment Needed" }, l),
  },
  roleplay: {
    curtaOuRepetida: (l: "en" | "pt" | "es") => pick({ pt: "Sua resposta parece muito curta ou contém palavras repetidas sem sentido.", es: "Tu respuesta parece muy corta o contiene palabras repetidas sin sentido.", en: "Your answer seems too short or contains repeated meaningless words." }, l),
    curtaOuRepetidaSugestao: (l: "en" | "pt" | "es") => pick({ pt: "Tente responder de forma simples e natural.", es: "Intenta responder de forma simple y natural.", en: "Try to answer in a simple and natural way." }, l),
    repeticao: (l: "en" | "pt" | "es") => pick({ pt: "Detectei repetição de palavras ou termos sem sentido na sua resposta.", es: "Detecté repetición de palabras o términos sin sentido en tu respuesta.", en: "I detected repeated or meaningless words in your answer." }, l),
    repeticaoSugestao: (l: "en" | "pt" | "es") => pick({ pt: "Construa uma frase contínua para que eu possa avaliar sua fluidez.", es: "Construye una frase continua para que pueda evaluar tu fluidez.", en: "Build a continuous sentence so I can evaluate your fluency." }, l),
    semPalavraChave: (l: "en" | "pt" | "es") => pick({ pt: "Sua resposta não parece conter as palavras fundamentais necessárias para este contexto.", es: "Tu respuesta no parece contener las palabras fundamentales necesarias para este contexto.", en: "Your answer doesn't seem to contain the essential words needed for this context." }, l),
    semPalavraChaveSugestao: (l: "en" | "pt" | "es") => pick({ pt: "Preste atenção na pergunta da mentora e responda ao assunto solicitado.", es: "Presta atención a la pregunta de la mentora y responde al tema solicitado.", en: "Pay attention to the mentor's question and answer the requested topic." }, l),
    semLogica: (l: "en" | "pt" | "es") => pick({ pt: "Sua resposta não responde de forma lógica à pergunta da mentora.", es: "Tu respuesta no responde de forma lógica a la pregunta de la mentora.", en: "Your answer doesn't logically respond to the mentor's question." }, l),
    semLogicaSugestao: (l: "en" | "pt" | "es") => pick({ pt: "Tente estruturar uma frase simples com uma ação (verbo) e um contexto ou lugar.", es: "Intenta estructurar una frase simple con una acción (verbo) y un contexto o lugar.", en: "Try to structure a simple sentence with an action (verb) and a context or place." }, l),
    excelente: (l: "en" | "pt" | "es") => pick({ pt: "Excelente resposta! Você conseguiu formular uma resposta completa e muito coerente.", es: "¡Excelente respuesta! Lograste formular una respuesta completa y muy coherente.", en: "Excellent answer! You managed to formulate a complete and very coherent response." }, l),
    excelenteSugestao: (l: "en" | "pt" | "es") => pick({ pt: "Ótima fluidez! Continue estruturando suas ideias com esse nível de detalhe.", es: "¡Gran fluidez! Sigue estructurando tus ideas con este nivel de detalle.", en: "Great fluency! Keep structuring your ideas with this level of detail." }, l),
    bomIntento: (l: "en" | "pt" | "es") => pick({ pt: "Boa tentativa! Sua resposta é compreensível e responde logicamente à pergunta.", es: "¡Buen intento! Tu respuesta es comprensible y responde lógicamente a la pregunta.", en: "Good attempt! Your answer is understandable and logically answers the question." }, l),
    bomIntentoSugestao: (l: "en" | "pt" | "es") => pick({ pt: "Para obter a pontuação máxima, tente adicionar mais detalhes sobre suas atividades.", es: "Para obtener la puntuación máxima, intenta añadir un poco más de detalle sobre tus actividades.", en: "To get the maximum score, try adding a bit more detail about your activities." }, l),
  },
  paragrafos: {
    acerto: (l: "en" | "pt" | "es") => pick({ pt: "Ordem lógica validada com sucesso!", es: "¡Orden lógico validado con éxito!", en: "Logical order successfully validated!" }, l),
    erro: (l: "en" | "pt" | "es") => pick({ pt: "A sequência lógica possui detalhes de coesão a corrigir.", es: "La secuencia lógica posee detalles de cohesión por corregir.", en: "The logical sequence has cohesion details to fix." }, l),
  },
  telas: {
    desafioConcluido: (l: "en" | "pt" | "es") => pick({ pt: "Desafio Concluído", es: "Desafío Concluido", en: "Challenge Completed" }, l),
    performanceCalculada: (l: "en" | "pt" | "es") => pick({ pt: "Performance calculada com sucesso", es: "Rendimiento calculado con éxito", en: "Performance successfully calculated" }, l),
    leituraVeloz: (l: "en" | "pt" | "es") => pick({ pt: "Leitura Veloz", es: "Lectura Veloz", en: "Speed Reading" }, l),
    toqueParaIniciar: (l: "en" | "pt" | "es") => pick({ pt: "Toque em qualquer lugar para iniciar", es: "Toca en cualquier lugar para iniciar", en: "Tap anywhere to start" }, l),
    nota: (l: "en" | "pt" | "es") => pick({ pt: "NOTA", es: "NOTA", en: "SCORE" }, l),
  },
};
