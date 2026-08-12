type Lang = "pt" | "es" | "en";

function pick(dict: { pt: string; es: string; en: string }, l: Lang): string {
  return dict[l];
}

export function normalizarIdioma(idioma?: string): Lang {
  const l = (idioma || "").toLowerCase();
  if (l.includes("pt") || l.includes("por")) return "pt";
  if (l.includes("en") || l.includes("ing")) return "en";
  return "es";
}

function envelope(titulo: string, corpo: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #1a1a2e;">${titulo}</h2>
      <div style="color: #333; font-size: 15px; line-height: 1.6;">${corpo}</div>
      <hr style="margin-top: 32px; border: none; border-top: 1px solid #eee;" />
      <p style="color: #999; font-size: 11px;">Academia Haas</p>
    </div>
  `;
}

export const templatesEmail = {
  boasVindas: (nome: string, l: Lang) => ({
    assunto: pick({ pt: "Bem-vindo(a) à Academia Haas!", es: "¡Bienvenido(a) a Academia Haas!", en: "Welcome to Academia Haas!" }, l),
    corpoHtml: envelope(
      pick({ pt: `Olá, ${nome}!`, es: `¡Hola, ${nome}!`, en: `Hello, ${nome}!` }, l),
      pick(
        { pt: "Seja bem-vindo(a) à Academia Haas! Estamos muito felizes em ter você conosco. Acesse o portal e comece sua jornada de aprendizado agora mesmo.",
          es: "¡Bienvenido(a) a Academia Haas! Estamos muy felices de tenerte con nosotros. Accede al portal y comienza tu viaje de aprendizaje ahora mismo.",
          en: "Welcome to Academia Haas! We're thrilled to have you with us. Log in to the portal and start your learning journey right away." },
        l
      )
    ),
  }),

  aulaAgendada: (nome: string, data: string, hora: string, l: Lang) => ({
    assunto: pick({ pt: "Sua aula foi agendada!", es: "¡Tu clase fue agendada!", en: "Your class has been scheduled!" }, l),
    corpoHtml: envelope(
      pick({ pt: "Aula Agendada", es: "Clase Agendada", en: "Class Scheduled" }, l),
      pick(
        { pt: `Olá, ${nome}! Sua aula foi agendada para ${data} às ${hora}. Não se esqueça de entrar no portal alguns minutos antes.`,
          es: `¡Hola, ${nome}! Tu clase fue agendada para el ${data} a las ${hora}. No olvides ingresar al portal unos minutos antes.`,
          en: `Hello, ${nome}! Your class has been scheduled for ${data} at ${hora}. Don't forget to log into the portal a few minutes early.` },
        l
      )
    ),
  }),

  aulaCancelada: (nome: string, data: string, hora: string, l: Lang) => ({
    assunto: pick({ pt: "Aula cancelada", es: "Clase cancelada", en: "Class cancelled" }, l),
    corpoHtml: envelope(
      pick({ pt: "Aula Cancelada", es: "Clase Cancelada", en: "Class Cancelled" }, l),
      pick(
        { pt: `Olá, ${nome}. Confirmamos o cancelamento da sua aula de ${data} às ${hora}. Você pode agendar uma nova aula quando quiser pelo portal.`,
          es: `Hola, ${nome}. Confirmamos la cancelación de tu clase del ${data} a las ${hora}. Puedes agendar una nueva clase cuando quieras desde el portal.`,
          en: `Hello, ${nome}. We confirm the cancellation of your class on ${data} at ${hora}. You can schedule a new class anytime through the portal.` },
        l
      )
    ),
  }),

  lembreteAula: (nome: string, hora: string, l: Lang) => ({
    assunto: pick({ pt: "Sua aula começa em breve!", es: "¡Tu clase comienza pronto!", en: "Your class starts soon!" }, l),
    corpoHtml: envelope(
      pick({ pt: "Lembrete de Aula", es: "Recordatorio de Clase", en: "Class Reminder" }, l),
      pick(
        { pt: `Olá, ${nome}! Sua aula começa às ${hora}. Entre no portal e não perca!`,
          es: `¡Hola, ${nome}! Tu clase comienza a las ${hora}. ¡Ingresa al portal y no te la pierdas!`,
          en: `Hello, ${nome}! Your class starts at ${hora}. Log in to the portal and don't miss it!` },
        l
      )
    ),
  }),

  planoVencendo: (nome: string, diasRestantes: number, l: Lang) => ({
    assunto: pick({ pt: "Seu plano está vencendo", es: "Tu plan está por vencer", en: "Your plan is expiring soon" }, l),
    corpoHtml: envelope(
      pick({ pt: "Renovação Necessária", es: "Renovación Necesaria", en: "Renewal Needed" }, l),
      pick(
        { pt: `Olá, ${nome}! Seu plano vence em ${diasRestantes} dia(s). Renove agora pelo portal para não perder o acesso.`,
          es: `¡Hola, ${nome}! Tu plan vence en ${diasRestantes} día(s). Renueva ahora desde el portal para no perder el acceso.`,
          en: `Hello, ${nome}! Your plan expires in ${diasRestantes} day(s). Renew now through the portal to keep your access.` },
        l
      )
    ),
  }),

  reengajamento: (nome: string, l: Lang) => ({
    assunto: pick({ pt: "Sentimos sua falta!", es: "¡Te extrañamos!", en: "We miss you!" }, l),
    corpoHtml: envelope(
      pick({ pt: "Vamos voltar a estudar?", es: "¿Volvemos a estudiar?", en: "Ready to get back to studying?" }, l),
      pick(
        { pt: `Olá, ${nome}! Notamos que você não estuda há alguns dias. Que tal voltar hoje e manter seu progresso?`,
          es: `¡Hola, ${nome}! Notamos que no has estudiado en algunos días. ¿Qué tal volver hoy y mantener tu progreso?`,
          en: `Hello, ${nome}! We noticed you haven't studied in a few days. How about coming back today and keeping up your progress?` },
        l
      )
    ),
  }),

  alunoInativo: (nome: string, l: Lang) => ({
    assunto: pick({ pt: "Volte quando quiser!", es: "¡Vuelve cuando quieras!", en: "Come back anytime!" }, l),
    corpoHtml: envelope(
      pick({ pt: "Estamos aqui quando você voltar", es: "Estamos aquí cuando regreses", en: "We're here when you return" }, l),
      pick(
        { pt: `Olá, ${nome}. Seu plano venceu e notamos que você ainda não renovou. Estamos aqui pra te ajudar a continuar sua jornada quando estiver pronto(a).`,
          es: `Hola, ${nome}. Tu plan venció y notamos que aún no lo has renovado. Estamos aquí para ayudarte a continuar tu viaje cuando estés listo(a).`,
          en: `Hello, ${nome}. Your plan expired and we noticed you haven't renewed yet. We're here to help you continue your journey whenever you're ready.` },
        l
      )
    ),
  }),

  relatorioMensalCorporativo: (nomeEmpresa: string, resumoHtml: string, l: Lang) => ({
    assunto: pick({ pt: `Relatório Mensal - ${nomeEmpresa}`, es: `Informe Mensual - ${nomeEmpresa}`, en: `Monthly Report - ${nomeEmpresa}` }, l),
    corpoHtml: envelope(
      pick({ pt: "Relatório Mensal de Colaboradores", es: "Informe Mensual de Colaboradores", en: "Monthly Employee Report" }, l),
      resumoHtml
    ),
  }),

  pagamentoConfirmado: (nome: string, plano: string, l: Lang) => ({
    assunto: pick({ pt: "Pagamento confirmado!", es: "¡Pago confirmado!", en: "Payment confirmed!" }, l),
    corpoHtml: envelope(
      pick({ pt: "Pagamento Aprovado", es: "Pago Aprobado", en: "Payment Approved" }, l),
      pick(
        { pt: `Olá, ${nome}! Seu pagamento foi confirmado e seu plano ${plano} já está ativo. Bons estudos!`,
          es: `¡Hola, ${nome}! Tu pago fue confirmado y tu plan ${plano} ya está activo. ¡Buenos estudios!`,
          en: `Hello, ${nome}! Your payment has been confirmed and your ${plano} plan is now active. Happy studying!` },
        l
      )
    ),
  }),
};
