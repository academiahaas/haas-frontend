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
      <p style="color: #999; font-size: 11px;">Haas Language</p>
    </div>
  `;
}

function envelopeComSticker(titulo: string, subtitulo: string, sticker: string, corpo: string, textoBotao?: string, linkBotao?: string): string {
  const botao = (textoBotao && linkBotao) ? `
    <tr>
      <td style="padding:8px 32px 40px 32px; text-align:center;">
        <a href="${linkBotao}" style="background:linear-gradient(135deg,#8b5cf6,#6d28d9); color:#fff; padding:16px 40px; border-radius:10px; text-decoration:none; font-weight:800; font-size:15px; display:inline-block; box-shadow:0 4px 14px rgba(139,92,246,0.35);">${textoBotao} →</a>
      </td>
    </tr>` : '';
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef1f6; padding:40px 16px; font-family: Arial, Helvetica, sans-serif;">
      <tr>
        <td align="center">
          <table role="presentation" width="580" cellpadding="0" cellspacing="0" style="max-width:580px; background:#ffffff; border-radius:20px; overflow:hidden; box-shadow:0 8px 32px rgba(11,21,40,0.12);">
            <tr>
              <td style="background:linear-gradient(135deg,#0b1528,#0f2647); padding:40px 32px 32px 32px; text-align:center;">
                <img src="https://jdppxfokfhqjudwfwckd.supabase.co/storage/v1/object/public/haas-academy/assignments/Melhorar%20Logo%20(3).png" alt="Haas Academy" style="height:36px; margin-bottom:20px;" />
                <div style="font-size:38px; line-height:1; margin-bottom:12px;">${sticker}</div>
                <h1 style="color:#ffffff; font-size:22px; margin:0; font-weight:800;">${titulo}</h1>
                <p style="color:#9fb3d1; font-size:13px; margin:10px 0 0 0;">${subtitulo}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:36px 32px 8px 32px;">
                <div style="color:#333; font-size:15px; line-height:1.6;">${corpo}</div>
              </td>
            </tr>
            ${botao}
            <tr>
              <td style="background:#f5f8fc; padding:28px 32px 24px 32px;">
                <p style="color:#8a93a3; font-size:11px; line-height:1.6; margin:0; text-align:center;">Haas Language<br/>Instagram: <a href="https://www.instagram.com/haasidiomas/" style="color:#8b5cf6; text-decoration:none; font-weight:bold;">@haasidiomas</a></p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
}

export const templatesEmail = {
  boasVindas: (nome: string, l: Lang) => ({
    assunto: pick({ pt: "Bem-vindo(a) à Academia Haas!", es: "¡Bienvenido(a) a Academia Haas!", en: "Welcome to Academia Haas!" }, l),
    corpoHtml: envelopeComSticker(
      pick({ pt: `Olá, ${nome}!`, es: `¡Hola, ${nome}!`, en: `Hello, ${nome}!` }, l),
      pick({ pt: "Seu acesso já está liberado", es: "Tu acceso ya está habilitado", en: "Your access is already unlocked" }, l),
      "🎉",
      pick(
        { pt: "Seja bem-vindo(a) à Academia Haas! Estamos muito felizes em ter você conosco. Acesse o portal e comece sua jornada de aprendizado agora mesmo.",
          es: "¡Bienvenido(a) a Academia Haas! Estamos muy felices de tenerte con nosotros. Accede al portal y comienza tu viaje de aprendizaje ahora mismo.",
          en: "Welcome to Academia Haas! We're thrilled to have you with us. Log in to the portal and start your learning journey right away." },
        l
      ),
      pick({ pt: "Acessar Portal", es: "Acceder al Portal", en: "Go to Portal" }, l),
      "https://campus.academiahaas.com/portal-aluno"
    ),
  }),

  aulaAgendada: (nome: string, data: string, hora: string, l: Lang) => ({
    assunto: pick({ pt: "Sua aula foi agendada!", es: "¡Tu clase fue agendada!", en: "Your class has been scheduled!" }, l),
    corpoHtml: envelopeComSticker(
      pick({ pt: "Aula Agendada", es: "Clase Agendada", en: "Class Scheduled" }, l),
      pick({ pt: "Confira os detalhes do seu próximo encontro", es: "Revisa los detalles de tu próximo encuentro", en: "Here are the details of your upcoming class" }, l),
      "📅",
      pick(
        { pt: `Olá, ${nome}! Sua aula foi agendada para o dia <strong>${data}</strong>, às <strong>${hora}</strong>. Não se esqueça de entrar no portal alguns minutos antes do início.`,
          es: `¡Hola, ${nome}! Tu clase quedó agendada para el día <strong>${data}</strong>, a las <strong>${hora}</strong>. No olvides ingresar al portal unos minutos antes de que comience.`,
          en: `Hello, ${nome}! Your class has been scheduled for <strong>${data}</strong> at <strong>${hora}</strong>. Don't forget to log into the portal a few minutes before it starts.` },
        l
      ),
      pick({ pt: "Acessar Portal", es: "Acceder al Portal", en: "Go to Portal" }, l),
      "https://campus.academiahaas.com/portal-aluno"
    ),
  }),

  aulaCancelada: (nome: string, data: string, hora: string, l: Lang) => ({
    assunto: pick({ pt: "Aula cancelada", es: "Clase cancelada", en: "Class cancelled" }, l),
    corpoHtml: envelopeComSticker(
      pick({ pt: "Aula Cancelada", es: "Clase Cancelada", en: "Class Cancelled" }, l),
      pick({ pt: "Sem problemas, você pode reagendar quando quiser", es: "Sin problema, puedes reagendar cuando quieras", en: "No worries, you can reschedule anytime" }, l),
      "🗓️",
      pick(
        { pt: `Olá, ${nome}. Confirmamos o cancelamento da sua aula do dia <strong>${data}</strong>, às <strong>${hora}</strong>. Você pode agendar uma nova aula quando quiser, direto pelo portal.`,
          es: `Hola, ${nome}. Confirmamos la cancelación de tu clase del día <strong>${data}</strong>, a las <strong>${hora}</strong>. Puedes agendar una nueva clase cuando quieras desde el portal.`,
          en: `Hello, ${nome}. We confirm the cancellation of your class on <strong>${data}</strong> at <strong>${hora}</strong>. You can schedule a new class anytime through the portal.` },
        l
      ),
      pick({ pt: "Ver Agenda", es: "Ver Agenda", en: "View Schedule" }, l),
      "https://campus.academiahaas.com/portal-aluno"
    ),
  }),

  lembreteAula: (nome: string, hora: string, l: Lang) => ({
    assunto: pick({ pt: "Sua aula começa em breve!", es: "¡Tu clase comienza pronto!", en: "Your class starts soon!" }, l),
    corpoHtml: envelopeComSticker(
      pick({ pt: "Lembrete de Aula", es: "Recordatorio de Clase", en: "Class Reminder" }, l),
      pick({ pt: "É quase hora de praticar", es: "Ya casi es hora de practicar", en: "It's almost time to practice" }, l),
      "⏰",
      pick(
        { pt: `Olá, ${nome}! Sua aula começa às <strong>${hora}</strong>. Entre no portal e não perca!`,
          es: `¡Hola, ${nome}! Tu clase comienza a las <strong>${hora}</strong>. ¡Ingresa al portal y no te la pierdas!`,
          en: `Hello, ${nome}! Your class starts at <strong>${hora}</strong>. Log in to the portal and don't miss it!` },
        l
      ),
      pick({ pt: "Acessar Portal", es: "Acceder al Portal", en: "Go to Portal" }, l),
      "https://campus.academiahaas.com/portal-aluno"
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
    corpoHtml: envelopeComSticker(
      pick({ pt: "Pagamento Aprovado", es: "Pago Aprobado", en: "Payment Approved" }, l),
      pick({ pt: "Seu acesso já está liberado", es: "Tu acceso ya está habilitado", en: "Your access is already unlocked" }, l),
      "🧾",
      pick(
        { pt: `Olá, ${nome}! Seu pagamento foi confirmado e seu plano <strong>${plano}</strong> já está ativo. Bons estudos!`,
          es: `¡Hola, ${nome}! Tu pago fue confirmado y tu plan <strong>${plano}</strong> ya está activo. ¡Buenos estudios!`,
          en: `Hello, ${nome}! Your payment has been confirmed and your <strong>${plano}</strong> plan is now active. Happy studying!` },
        l
      ),
      pick({ pt: "Acessar Portal", es: "Acceder al Portal", en: "Go to Portal" }, l),
      "https://campus.academiahaas.com/portal-aluno"
    ),
  }),
};
