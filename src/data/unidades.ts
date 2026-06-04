/* =========================================================================
  BANCO DE DADOS DE UNIDADES E MAPEAMENTO DE PROGRESSÃO - HAAS ACADEMY
  =========================================================================
*/

export interface Opcao {
  id: string;
  texto: string;
}

export interface Unidade {
  id: number;
  nome: string;
  pergunta: string;
  opcoes: Opcao[];
  respostaCorreta: string;
  explicacaoSucesso: string; // 🧠 Suporte para o Modo Mentor do Robô
  explicacaoErro: string;    // 🧠 Suporte para o Modo Auditor do Robô
  fimDoModulo?: boolean;
  fimDoNivel?: boolean;
}

export const BANCO_UNIDADES: Unidade[] = [
  {
    id: 1,
    nome: "Conditionals intermediate-advanced (B2)",
    pergunta: "If they ________ higher budgets, the marketing campaign would have reached more leads.",
    respostaCorreta: "B",
    opcoes: [
      { id: "A", texto: "have secured" },
      { id: "B", texto: "had secured" },
      { id: "C", texto: "would secure" },
      { id: "D", texto: "secured" }
    ],
    // 🟢 Texto que o Robô vai digitar se você ACERTAR:
    explicacaoSucesso: "Fantástico, Bruna! Como a oração principal usa 'would have reached' (Third Conditional), a regra exige o Past Perfect ('had secured') para mapear um cenário hipotético no passado de alta performance.",
    // 🔴 Texto que o Robô vai digitar se você ERRAR:
    explicacaoErro: "Alerta de relatório! Você caiu na rasteira do 'Simple Past'. Como o resultado final está no passado remoto ('would have reached'), precisamos obrigatoriamente usar o passado perfeito ('had secured') na condição."
  },
  {
    id: 2,
    nome: "Mixed Conditionals & Corporate Strategy",
    pergunta: "Had the CEO signed the merger earlier, we ________ market leaders today.",
    respostaCorreta: "A",
    opcoes: [
      { id: "A", texto: "would be" },
      { id: "B", texto: "will be" },
      { id: "C", texto: "would have been" },
      { id: "D", texto: "were" }
    ],
    explicacaoSucesso: "Análise perfeita! Esta é uma condicional mista (Mixed Conditional). Uma ação no passado ('Had signed') gerando um impacto direto no presente corporativo atual ('would be today').",
    explicacaoErro: "Revisão tática necessária! Você escolheu uma estrutura que joga o resultado para o passado. O marcador 'today' no fim da pergunta exige o presente ('would be') para conectar com a condição passada.",
    fimDoModulo: true 
  },
  {
    id: 3,
    nome: "Advanced Vocabulary & Decision Making",
    pergunta: "The board members decided to ________ the proposal until further analysis could be conducted.",
    respostaCorreta: "C",
    opcoes: [
      { id: "A", texto: "cancel" },
      { id: "B", texto: "accept" },
      { id: "C", texto: "defer" },
      { id: "D", texto: "dismiss" }
    ],
    explicacaoSucesso: "Terminologia executiva impecável! Na linguagem corporativa e jurídica, 'defer' significa adiar ou postergar uma decisão estrategicamente para coletar mais dados.",
    explicacaoErro: "Atenção ao contexto técnico! A frase menciona que a proposta aguarda por 'uma análise mais aprofundada'. Portanto, eles não cancelaram ('cancel'), eles apenas adiaram a pauta, ou seja, aplicaram o termo 'defer'.",
    fimDoNivel: true 
  }
];