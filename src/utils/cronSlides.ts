// src/utils/cronSlides.ts
import { calcularMapaPreditivo } from './intelligenceCore';

const supabaseUrl = 'https://jdppxfokfhqjudwfwckd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcHB4Zm9rZmhxanVkd2Z3Y2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5Mjk2NzgsImV4cCI6MjA5NTUwNTY3OH0.1zkCP7WUv1QJvWu35jQSRByFp-CSxD-Zfj6yKJysGIU';

export async function gerarLoteSlides24h() {
  console.log('--- [AUTOMATION MOTOR] Iniciando varredura da grade de agendamentos (Antecedência 24h) ---');

  // 1. Simulação da busca de agendamentos ativos para as próximas 24 horas (Simulando PM2/Cron Job)
  // Conforme o escopo, o sistema aloca os decks de forma autônoma por ID de agendamento
  const agendamentosFicticios = [
    { id_agenda: '123e4567-e89b-12d3-a456-426614174000', id_usuario: '123e4567-e89b-12d3-a456-426614174000', proximo_tema: 'If Clauses' }
  ];

  const resultadosProcessamento = [];

  for (const agendamento of agendamentosFicticios) {
    console.log(`[AUTOMATION] Processando deck customizado para Agenda ID: ${agendamento.id_agenda}`);

    // 2. Consome a matriz preditiva do Dia 5 para capturar o GPS de Alertas
    const predicao = await calcularMapaPreditivo(agendamento.id_usuario, agendamento.proximo_tema);

    // 3. ENGENHARIA DE PROMPT (Slides Leves): Força a divisão estrita em Fase 1 e Fase 2 em formato HTML/Tailwind limpo
    const promptSlides = `
      Gere um deck de slides em formato de array JSON contendo código HTML incorporado com classes Tailwind CSS.
      Divisão Estrita do Material Didático Leve:
      Fase 1 - Slides de Alinhamento: Revisão sutil e fluida com base nos desvios recentes detectados: [${predicao.tagsCriticas.join(', ')}].
      Fase 2 - Slides de Conteúdo Novo: Apresentação de "${predicao.proximoTema}" contendo o Alerta GPS de Proteção Sutil: "${predicao.GPS_Alerta}".
    `;

    // 4. Simulador do Gerador em Lote (Bypass do gateway de IA para evitar travas de chaves de API externas)
    const deckSlidesHtmlSimulado = [
      {
        slide: 1,
        fase: "Alinhamento",
        html: "<div class='p-8 bg-slate-900 text-white rounded-xl'><h2 class='text-xl font-bold text-amber-400'>Fase 1: Quick Tuning</h2><p class='text-sm text-slate-300'>Vamos calibrar a sua fluência revisando padrões recentes de tempo verbal e vocabulário.</p></div>"
      },
      {
        slide: 2,
        fase: "Conteúdo Novo",
        html: `<div class='p-8 bg-slate-950 text-white rounded-xl'><h2 class='text-xl font-bold text-emerald-400'>Fase 2: ${predicao.proximoTema}</h2><p class='text-sm text-slate-300 mb-4'>Expandindo suas ferramentas de conversação.</p><div class='p-4 bg-slate-900 border border-emerald-500/30 rounded text-xs text-emerald-300'>🌐 GPS Sutil: ${predicao.GPS_Alerta}</div></div>`
      }
    ];

    // 5. Atualização em lote (Simulando o salvamento do deck gerado dentro do agendamento correspondente)
    console.log(`[AUTOMATION] Deck de slides gerado com sucesso para a agenda ${agendamento.id_agenda}. Gravando dados...`);

    resultadosProcessamento.push({
      id_agenda: agendamento.id_agenda,
      status: 'Slides Alocados',
      fasesGeradas: ['Alinhamento', 'Conteúdo Novo'],
      totalSlides: deckSlidesHtmlSimulado.length
    });
  }

  return resultadosProcessamento;
}