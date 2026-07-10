"use client";

import { supabase } from "@/lib/supabase";

import React, { useState, useRef, useEffect } from "react";
import { Calendar, Clock, RefreshCw, ChevronLeft, ChevronRight, Ticket, X, ChevronDown } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  idioma: "PT" | "EN" | "ES";
  userId: string; // ID dinâmico vindo do pai
}

interface Aula {
  id: string;
  data: string; 
  horario: string; 
  tipo: "regular" | "reposicao";
  status: "agendada" | "realizada" | "cancelada";
}

export default function ModalAgendaAluno({ isOpen, onClose, idioma, userId }: Props) {
  const [activeTab, setActiveTab] = useState<"lista" | "agendar">("lista");
  const [isLembreteOpen, setIsLembreteOpen] = useState(false);
  const [mensagemCancelamento, setMensagemCancelamento] = useState<string | null>(null);
  const [tipoErroCancelamento, setTipoErroCancelamento] = useState<"bloqueio" | "sucesso" | null>(null);

  React.useEffect(() => {
    if (isOpen && activeTab === "agendar") {
      if (typeof window !== "undefined") {
      const jaViuLembrete = sessionStorage.getItem("haas_lembrete_visto_aba");
      if (!jaViuLembrete) {
        sessionStorage.setItem("haas_lembrete_visto_aba", "true");
        setIsLembreteOpen(true);
      } else {
        setIsLembreteOpen(false);
      }
    };
    }
  }, [isOpen, activeTab]);
  const [modoAgendamento, setModoAgendamento] = useState("clase");
  const [planoAluno, setPlanoAluno] = useState({ nome: "Pack VIP Std", slug: "pack_vip_std", validade: "2026-07-15", creditosAulas: 0, creditosReposicao: 0 });

  useEffect(() => {
    if (!isOpen || !userId) return;

    async function carregarInscricao() {
      try {
        const { data, error } = await supabase
          .from("user_subscriptions")
          .select("plan_category, expiration_date, class_credits_available, replacement_credits")
          .eq("user_id", userId)
          .limit(1)
          .maybeSingle();

        console.log("DADO RETORNADO DO BANCO:", data, "USER_ID USADO:", userId);
        if (error) throw error;

        if (data) {
          setPlanoAluno({
            nome: data.plan_category || "Pack VIP Std",
            slug: (data.plan_category || "pack_vip_std").toLowerCase().replace(/ /g, "_"),
            validade: data.expiration_date ? data.expiration_date.split("T")[0] : "2026-07-15", creditosAulas: data.class_credits_available || 0, creditosReposicao: data.replacement_credits || 0
          });
        }
      } catch (err) {
        console.error("Erro ao buscar assinatura real:", err);
      }
    }

    carregarInscricao();
  }, [isOpen, userId]);
  const [isAvisoOpen, setIsAvisoOpen] = useState(false);
  const [slotsBloqueados, setSlotsBloqueados] = useState<{ data_bloqueada: string, horario_bloqueado: string | null }[]>([]);

  useEffect(() => {
    if (isOpen) {
      supabase
        .from("vw_datas_e_horarios_bloqueados")
        .select("data_bloqueada, horario_bloqueado")
        .then(({ data, error }) => {
          if (!error && data) {
            setSlotsBloqueados(data);
          }
        });
    }
  }, [isOpen]);
  const [tipoAviso, setTipoAviso] = useState("marketing");
  const [mensagem, setMensagem] = useState<{ tipo: "sucesso" | "erro", texto: string } | null>(null);

  const [tipoAula, setTipoAula] = useState<"regular" | "reposicao">("regular");
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedHorario, setSelectedHorario] = useState("08:00");

  const [isTipoDropdownOpen, setIsTipoDropdownOpen] = useState(false);
  const [isHorarioDropdownOpen, setIsHorarioDropdownOpen] = useState(false);

  const tipoRef = useRef<HTMLDivElement>(null);
  const horarioRef = useRef<HTMLDivElement>(null);

  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [currentNavDate, setCurrentNavDate] = useState(new Date());

    const [creditosAulas, setCreditosAulas] = useState(8); 
  const [creditosReposicao, setCreditosReposicao] = useState(1); 
  const [aulaSelecionadaId, setAulaSelecionadaId] = useState<string | null>(null);

    // Carregando agendamentos reais do Supabase ao abrir
  useEffect(() => {
    if (isOpen && userId) {
      console.log("🎯 DEBUG AGENDA - BUSCANDO AULAS PARA O USER_ID:", userId);
      supabase.from("user_agenda_appointments")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "agendada")
        .then(({ data, error }) => {
          console.log("🔍 INVESTIGAÇÃO AULAS DO BANCO RETORNO:", data, "ERRO:", error);
          if (data && !error) {
            const mapeadas = data.map(a => {
              const parts = a.appointment_date ? a.appointment_date.replace(' ', 'T').split('T') : [];
              const dataPart = parts[0] || '';
              const tempoPart = parts[1] || '00:00';
              const horarioFormatado = tempoPart.substring(0, 5);
              
              return {
                id: String(a.id),
                data: dataPart,
                horario: horarioFormatado,
                tipo: (a.appointment_type === "reposicao" ? "reposicao" : "regular") as "regular" | "reposicao",
                status: a.canceled_at ? "cancelada" : a.status
              };
            });

            if (mapeadas && mapeadas.length > 0) {
              setAulas(mapeadas);
            }
          }
        });
    }
  }, [isOpen, userId]);

  
  const [aulas, setAulas] = useState<Aula[]>([
    { id: "1", data: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], horario: "10:00", tipo: "regular", status: "agendada" },
    { id: "2", data: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0], horario: "15:30", tipo: "reposicao", status: "agendada" },
    { id: "test_bloqueio", data: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().split('T')[0], horario: new Date(Date.now() + 2 * 60 * 60 * 1000).toTimeString().split(' ')[0].substring(0, 5), tipo: "regular", status: "agendada" }
  ]);

  const listaHorarios = [
    "08:00", "09:00", "10:00", "11:00", "12:00", 
    "14:00", "15:00", "16:00", "17:00", "18:00", 
    "19:00", "20:00", "21:00"
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (tipoRef.current && !tipoRef.current.contains(event.target as Node)) {
        setIsTipoDropdownOpen(false);
      }
      if (horarioRef.current && !horarioRef.current.contains(event.target as Node)) {
        setIsHorarioDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isOpen) return null;

    const t = {
    PT: {
      title: "AGENDA DE AULAS", tab1: "Minhas Aulas", tab2: "Novo Agendamento", cancel: "Cancelar",
      close: "FECHAR", qDate: "DATA DA AULA", selectDateBtn: "Selecionar Data",
      mainCredits: "Créditos de Aula Disponíveis", repCredits: "Créditos de Reposição",
      noCreditsError: "Você não possui Créditos de Aula disponíveis.", calTitle: "SELECIONE A DATA", noClasses: "Nenhuma aula agendada.",
      lblClassType: "Tipo de Aula", lblTime: "Horário", btnConfirm: "Confirmar Agendamento",
      optRegular: "Classe Regular", optReposicion: "Aula de Reposição",
      tagRegular: "CLASSE REGULAR", tagReposicion: "REPOSIÇÃO", successMsg: "Agendado com sucesso!",
      optGrupo: "Group", optVipStd: "VIP Standard", optVipPro: "VIP Pro", optPackGrupo: "Pack Group", optPackVipStd: "Pack VIP Std", optFlex: "VIP Pro",
      avisoDuplicadoTitulo: "HORÁRIO INDISPONÍVEL", avisoDuplicadoTexto: "Você já possui uma aula agendada exatamente para este dia e horário. Por favor, selecione outro horário.",
      avisoMarketingTitulo: "AVISO DE AGENDAMENTO", avisoMarketingTexto: "Esta modalidade não faz parte do seu combo contratado ou seus créditos expiraram nesta data. Quer adquirir este pacote agora?",
      btnEntendido: "Entendido", avisoReposicaoTitulo: "CRÉDITOS DE REPOSIÇÃO", avisoReposicaoTexto: "Seus créditos de reposição chegaram ao fim. Não deixe seu planejamento parar! Que tal adquirir novas aulas agora para continuar evoluindo?", btnQueroAulas: "Sim, quero mais aulas", btnSim: "Sim", btnNao: "Não"
    },
    EN: {
      title: "CLASS SCHEDULE", tab1: "My Classes", tab2: "Book a Class", cancel: "Cancel",
      close: "CLOSE", qDate: "CLASS DATE", selectDateBtn: "Select Date",
      mainCredits: "Available Class Credits", repCredits: "Reschedule Credits",
      noCreditsError: "No Class Credits available.", calTitle: "SELECT DATE", noClasses: "No scheduled classes.",
      lblClassType: "Class Type", lblTime: "Time Slot", btnConfirm: "Confirm Booking",
      optRegular: "Regular Class", optReposicion: "Makeup Class",
      tagRegular: "REGULAR CLASS", tagReposicion: "MAKEUP CLASS", successMsg: "Successfully booked!",
      optGrupo: "Group", optVipStd: "VIP Standard", optVipPro: "VIP Pro", optPackGrupo: "Pack Group", optPackVipStd: "Pack VIP Std", optFlex: "VIP Pro",
      avisoDuplicadoTitulo: "SLOT UNAVAILABLE", avisoDuplicadoTexto: "You already have a class booked for this date and time. Please select another time slot.",
      avisoMarketingTitulo: "BOOKING NOTICE", avisoMarketingTexto: "This modality is not part of your contracted combo or your credits have expired. Would you like to purchase this package now?",
      btnEntendido: "Got it", btnSim: "Yes", btnNao: "No", avisoReposicaoTitulo: "MAKEUP CREDITS", avisoReposicaoTexto: "Your makeup credits have run out. Don't let your learning stop! How about getting more classes now to keep growing?", btnQueroAulas: "Yes, I want more classes"
    },
    ES: {
      title: "AGENDA DE CLASES", tab1: "Mis Clases", tab2: "Agendar Clase", cancel: "Cancelar",
      close: "CERRAR", qDate: "FECHA DE LA CLASE", selectDateBtn: "Seleccionar Fecha",
      mainCredits: "Créditos de Clase", repCredits: "Créditos de Reposición",
      noCreditsError: "No tienes Créditos de Clase.", calTitle: "SELECCIONE FECHA", noClasses: "Ninguna clase programada.",
      lblClassType: "Tipo de Clase", lblTime: "Horario", btnConfirm: "Confirmar Reserva",
      optRegular: "Clase Regular", optReposicion: "Clase de Reposición",
      tagRegular: "CLASE REGULAR", tagReposicion: "CLASE DE REPOSICIÓN", successMsg: "¡Reservado con éxito!",
      optGrupo: "Group", optVipStd: "VIP Standard", optVipPro: "VIP Pro", optPackGrupo: "Pack Group", optPackVipStd: "Pack VIP Std", optFlex: "VIP Pro",
      avisoDuplicadoTitulo: "HORARIO NO DISPONIBLE", avisoDuplicadoTexto: "Ya tienes una clase programada exactamente para este día y horario. Por favor, selecciona otro horario.",
      avisoMarketingTitulo: "AVISO DE RESERVA", avisoMarketingTexto: "Esta modalidad no forma parte de tu combo contratado o te quedaste sin créditos en esta fecha. ¿Quieres adquirir este paquete ahora?",
      btnEntendido: "Entendido", btnSim: "Sí", btnNao: "No", avisoReposicaoTitulo: "CRÉDITOS DE REPOSICIÓN", avisoReposicaoTexto: "Tus créditos de reposición se han agotado. ¡No dejes que tu planificación se detenga! ¿Qué tal adquirir más clases ahora para seguir evolucionando?", btnQueroAulas: "Sí, quiero más clases"
    }
  }[idioma];

  const i18nCalendar = {
    PT: { weekDays: ["D", "S", "T", "Q", "Q", "S", "S"], months: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"] },
    EN: { weekDays: ["S", "M", "T", "W", "T", "F", "S"], months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"] },
    ES: { weekDays: ["D", "L", "M", "X", "J", "V", "S"], months: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"] }
  }[idioma];

  const year = currentNavDate.getFullYear();
  const month = currentNavDate.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const blanks = Array(firstDayIndex).fill(null);
  const daysInMonth = Array.from({ length: totalDays }, (_, i) => i + 1);
  const gridCells = [...blanks, ...daysInMonth];

  function formatDisplayDate(dateStr: string) {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    return idioma === "EN" ? `${m}/${d}/${y}` : `${d}/${m}/${y}`;
  }

  function handleSelectDay(day: number) {
    const formattedMonth = String(month + 1).padStart(2, "0");
    const formattedDay = String(day).padStart(2, "0");
    setSelectedDate(`${year}-${formattedMonth}-${formattedDay}`);
    setIsCalendarModalOpen(false);
  }

  function getNomeModalidade(slug: string) {
    if (slug === "grupo") return t.optGrupo;
    if (slug === "vip_std") return t.optVipStd;
    if (slug === "vip_pro") return t.optVipPro;
    if (slug === "pack_grupo") return t.optPackGrupo;
    if (slug === "pack_vip_std") return t.optPackVipStd;
    if (slug === "reposicao") return t.optReposicion;
    return t.optFlex;
  }

    // Função para salvar o cancelamento real no Supabase
    // Função para salvar o cancelamento real no Supabase contornando restrições
  async function executarCancelamentoBanco() {
    if (!aulaSelecionadaId) return;
    try {
      console.log("⏳ SALVANDO CANCELAMENTO NO SUPABASE ID:", aulaSelecionadaId);
      
      const { error } = await supabase
        .from("user_agenda_appointments")
        .update({
          canceled_at: new Date().toISOString()
        })
        .eq("id", aulaSelecionadaId);

      if (error) throw error;
      console.log("✅ Cancelamento persistido com sucesso!");

      // REGRA DE NEGÓCIO: Cancelamento vira SEMPRE crédito de reposição
      const novoValorReposicao = planoAluno.creditosReposicao + 1;

      // Salva no Supabase direto na coluna de créditos de reposição
      await supabase.from("user_subscriptions")
        .update({ replacement_credits: novoValorReposicao })
        .eq("user_id", userId);

      // Atualiza visualmente na tela na mesma hora (Sem F5)
      setPlanoAluno(prev => ({
        ...prev,
        creditosReposicao: novoValorReposicao
      }));

      setAulas(prev => prev.map(a => a.id === aulaSelecionadaId ? { ...a, status: "cancelada" } : a));
    } catch (err) {
      console.error("❌ Erro ao salvar cancelamento:", err.message);
      alert("Erro ao salvar o cancelamento: " + err.message);
    } finally {
      setMensagemCancelamento(null);
      setTipoErroCancelamento(null);
    }
  }

  function handleTentativaCancelamento(aula: any) {
    setAulaSelecionadaId(aula.id);
    const agora = new Date();
    
    // Suporta formatos DD/MM/YYYY ou YYYY-MM-DD com segurança
    const partesData = aula.data.includes("-") ? aula.data.split("-") : aula.data.split("/");
    const [ano, mes, dia] = aula.data.includes("-") ? [partesData[0], partesData[1], partesData[2]] : [partesData[2], partesData[1], partesData[0]];
    const [hora, minuto] = aula.horario.split(":");
    const dataAula = new Date(Number(ano), Number(mes) - 1, Number(dia), Number(hora), Number(minuto));
    
    const diferencaHoras = (dataAula.getTime() - agora.getTime()) / (1000 * 60 * 60);

    if (diferencaHoras < 12) {
      setTipoErroCancelamento("bloqueio");
      if (idioma === "EN") {
        setMensagemCancelamento("It is not possible to cancel this class. Cancellations must be made at least 12 hours in advance.");
      } else if (idioma === "ES") {
        setMensagemCancelamento("No es posible cancelar esta clase. Las cancelaciones deben hacerse con al menos 12 horas de anticipación.");
      } else {
        setMensagemCancelamento("Não é possível cancelar esta aula agora. Os cancelamentos devem ser feitos com pelo menos 12 horas de antecedência.");
      }
    } else {
      setTipoErroCancelamento("sucesso");
      // Força a atualização do status do objeto em tempo real para o botão apagar na tela
      aula.status = "cancelada";
      
      if (aula.tipo === "reposicao") {
        // Lógica estrita: A reposição já consome um prazo estipulado anteriormente.
        // Simulamos o prazo real restante baseado na regra de dias naturais do cancelamento inicial.
        const dataVencimentoOriginal = new Date(dataAula);
        dataVencimentoOriginal.setDate(dataVencimentoOriginal.getDate() + 1); // Exemplo: restam poucas horas/dias naturais
        
        const d = String(dataVencimentoOriginal.getDate()).padStart(2, "0");
        const m = String(dataVencimentoOriginal.getMonth() + 1).padStart(2, "0");
        const y = dataVencimentoOriginal.getFullYear();
        const dataFormatada = idioma === "EN" ? m + "/" + d + "/" + y : d + "/" + m + "/" + y;

        if (idioma === "EN") {
          setMensagemCancelamento("This class is a makeup lesson linked to a previous cancellation. You only have until " + dataFormatada + " to reschedule it, or it will be lost. Proceed?");
        } else if (idioma === "ES") {
          setMensagemCancelamento("Esta clase es una reposición vinculada a una cancelación previa. Solo tienes hasta el " + dataFormatada + " para reprogramarla, de lo contrario se perderá. ¿Proceder?");
        } else {
          setMensagemCancelamento("Esta aula é uma reposição vinculada a um cancelamento anterior. Você só tem até " + dataFormatada + " para reagendá-la, caso contrário ela será perdida definitivamente. Deseja prosseguir?");
        }
      } else {
        // Fluxo normal de aula regular (ganha 5 dias naturais inteiros)
        const dataVencimento = new Date(dataAula);
        dataVencimento.setDate(dataVencimento.getDate() + 10);
        
        const d = String(dataVencimento.getDate()).padStart(2, "0");
        const m = String(dataVencimento.getMonth() + 1).padStart(2, "0");
        const y = dataVencimento.getFullYear();
        const dataFormatada = idioma === "EN" ? m + "/" + d + "/" + y : d + "/" + m + "/" + y;

        if (idioma === "EN") {
          setMensagemCancelamento("No worries! You can cancel this class. To protect your learning momentum and help you stay on track, your makeup credits will be ready for you to reschedule within a 10-calendar-day window (you have until " + dataFormatada + "). Shall we proceed?");
        } else if (idioma === "ES") {
          setMensagemCancelamento("¡No te preocupes! Puedes cancelar esta clase sin problema. Para cuidar tu ritmo de aprendizaje y ayudarte a mantener la constancia, tus créditos de reposición estarán listos para que programes tu clase dentro de una ventana de 10 días corridos (tienes hasta el " + dataFormatada + "). ¿Avanzamos con la cancelación?");
        } else {
          setMensagemCancelamento("Não se preocupe! Você pode cancelar esta aula sem problemas. Para cuidarmos do seu ritmo de aprendizado e te ajudar a manter a constância, seus créditos de reposição já ficarão disponíveis para você agendar uma nova aula dentro de uma janela de 10 dias corridos (você tem até " + dataFormatada + "). Vamos prosseguir com o cancelamento?");
        }
      }
    }
  }

        async function validarAntesDeAgendar() {
    try {
      console.log("🔍 [Trava 4 Pilares] Iniciando varredura inteligente...");
      let idFinal = userId;
      if (!idFinal) {
        const { data: sessionData } = await supabase.auth.getSession();
        idFinal = sessionData?.session?.user?.id || "";
      }

      if (!idFinal) return executarAgendamento();

      // PILAR 1: Verificação de Concorrência de Horário (Mesmo dia e horário)
      const timestampCombinadoBusca = `${selectedDate}T${selectedHorario}:00.000Z`;
      const { data: agendamentosExistentes, error: errorDuplicado } = await supabase
        .from("user_agenda_appointments")
        .select("id")
        .eq("user_id", idFinal)
        .eq("appointment_date", timestampCombinadoBusca)
        .eq("status", "agendada")
        .limit(1);

      if (!errorDuplicado && agendamentosExistentes && agendamentosExistentes.length > 0) {
        console.log("⚠️ Trava: Aluno já possui aula agendada neste dia e horário.");
        setTipoAviso("duplicado");
        setIsAvisoOpen(true);
        return;
      }

      // PILAR 2, 3 e 4: Busca em tempo real da Categoria do Plano e Vencimento
      const { data: subData, error: subError } = await supabase
        .from("user_subscriptions")
        .select("plan_category, expiration_date, class_credits_available, replacement_credits")
        .eq("user_id", idFinal)
        .limit(1)
        .maybeSingle();

      if (subError || !subData) {
        console.error("Erro ao buscar plano, prosseguindo por segurança:", subError);
        return executarAgendamento();
      }

      const planCategory = (subData.plan_category || "").toLowerCase().trim();
      const selectedMod = (tipoAula || "").toLowerCase().trim();
      const tipoOriginal = (modoAgendamento === "reposicion" || modoAgendamento === "reposicao" || selectedMod === "reposicao") ? "reposicao" : "regular";

      // Validação de correspondência de Categoria do Plano (PILAR 3 vs PILAR 2)
      let planoValido = false;
      if (planCategory.includes("grupo") || planCategory.includes("group")) {
        if (selectedMod.includes("grupo") || selectedMod.includes("group")) planoValido = true;
      } else if (planCategory.includes("vip standard") || planCategory.includes("vip_std")) {
        if (selectedMod.includes("vip_std") || selectedMod.includes("standard")) planoValido = true;
      } else if (planCategory.includes("vip pro") || planCategory.includes("vip_pro") || planCategory.includes("flex")) {
        if (selectedMod.includes("vip_pro") || selectedMod.includes("flex")) planoValido = true;
      } else if (planCategory.includes("pack")) {
        if (selectedMod.includes("pack")) planoValido = true;
      }

      // Bloqueia caso o plano escolhido no seletor não combine com o plano contratado
      if (!planoValido && tipoOriginal !== "reposicao") {
        console.log("⚠️ Trava: Plano selecionado (" + tipoAula + ") diverge do plano contratado (" + subData.plan_category + ")");
        setTipoAviso("marketing");
        setIsAvisoOpen(true);
        return;
      }

      // PILAR 4: Validação da Data de Vencimento do Pacote
      const dataFimPlano = new Date((subData.expiration_date ? subData.expiration_date.split("T")[0] : "2026-12-31") + "T23:59:59");
      const dataEscolhida = new Date(selectedDate + "T" + selectedHorario + ":00");

      if (dataEscolhida > dataFimPlano) {
        console.log("⚠️ Trava: Data da aula ultrapassa a validade do pacote.");
        setTipoAviso("marketing");
        setIsAvisoOpen(true);
        return;
      }

      // Validação Extra: Saldo de créditos corrente
      if (tipoOriginal === "reposicao") {
        if ((subData.replacement_credits || 0) <= 0) {
          setTipoAviso("reposicion_zerada");
          setIsAvisoOpen(true);
          return;
        }
      } else {
        if ((subData.class_credits_available || 0) <= 0) {
          setTipoAviso("marketing");
          setIsAvisoOpen(true);
          return;
        }
      }

      // Se passou em todas as checagens com sucesso, agenda a aula
      executarAgendamento();

    } catch (err) {
      console.error("Erro interno no motor de travas:", err);
      executarAgendamento();
    }
  }

  async function executarAgendamento() {
    setMensagem(null);
    
    const tipoOriginal = (modoAgendamento === "reposicion" || modoAgendamento === "reposicao" || tipoAula === "reposicao") ? "reposicao" : "regular";
    
    const nova: Aula = { 
      id: String(Date.now()), 
      data: selectedDate, 
      horario: selectedHorario, 
      tipo: tipoOriginal, 
      status: "agendada" 
    };

    const tipoBanco = tipoOriginal === "reposicao" ? "reposicao" : "regular";
    const timestampCombinado = `${selectedDate}T${selectedHorario}:00.000Z`;

    // Resgata o ID dinâmico direto da propriedade enviada pelo pai
    // Se por um acaso o pai passar vazio, tenta buscar o fallback da sessão local
    let idFinal = userId;
    
    if (!idFinal) {
      const { data: sessionData } = await supabase.auth.getSession();
      idFinal = sessionData?.session?.user?.id || "";
    }

    supabase.from("user_agenda_appointments").insert([
      {
        user_id: idFinal || null,
        appointment_date: timestampCombinado,
        appointment_type: tipoBanco,
        status: "agendada"
      }
    ]).select("id").single().then(({ data, error }) => {
      if (error) {
        console.error("❌ Erro ao gravar no Supabase:", error.message);
        alert("Erro ao salvar no banco: " + error.message);
      } else {
        console.log("✅ Agendamento salvo com sucesso no Supabase!");
        
        if (data && data.id) {
          nova.id = data.id;
        }

        const campoCredito = tipoBanco === "reposicao" ? "replacement_credits" : "class_credits_available";
        const valorAtual = tipoBanco === "reposicao" ? planoAluno.creditosReposicao : planoAluno.creditosAulas;
        const novoValor = Math.max(0, valorAtual - 1);

        supabase.from("user_subscriptions")
          .update({ [campoCredito]: novoValor })
          .eq("user_id", idFinal)
          .then(({ error: updateErr }) => {
            if (updateErr) {
              console.error("❌ Erro ao atualizar créditos no Supabase:", updateErr.message);
            } else {
              console.log("🪙 Crédito gravado e reduzido diretamente no Supabase!");
              setPlanoAluno(prev => ({
                ...prev,
                creditosAulas: campoCredito === "class_credits_available" ? novoValor : prev.creditosAulas,
                creditosReposicao: campoCredito === "replacement_credits" ? novoValor : prev.creditosReposicao
              }));
            }
          });

        setAulas(prev => [nova, ...prev]);
        setMensagem({ tipo: "sucesso", texto: t.successMsg });
        setActiveTab("lista");
      }
    });
  }

  return (
    <>
      <div className={`fixed inset-0 z-50 transition-all duration-300 flex items-center justify-center p-4 ${isOpen ? 'visible' : 'invisible'}`}>
        <div onClick={onClose} className={`absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} />
        
        <div className={`relative w-full max-w-md h-full max-h-[85vh] sm:max-h-[640px] h-auto bg-[#030914] overflow-hidden overflow-hidden border border-white/[0.06] rounded-[24px] p-4 sm:p-6 flex flex-col justify-between shadow-2xl transition-all duration-300 transform ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
          
          {/* Topo Fixo */}
          <div className="flex items-center justify-between border-b border-white/5 pb-3 shrink-0">
            <div className="flex flex-col gap-0.5">
              <h2 className="text-xs font-black tracking-widest text-white uppercase flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                {t.title}
              </h2>
              <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                                {idioma === "ES" ? `Plan: ${planoAluno.nome} | Vence: ${planoAluno.validade.split("-").reverse().join("/")}` : idioma === "EN" ? `Plan: ${planoAluno.nome} | Expires: ${planoAluno.validade.split("-").reverse().join("/")}` : `Plano: ${planoAluno.nome} | Vence: ${planoAluno.validade.split("-").reverse().join("/")}`}
              </span>
            </div>
            <button type="button" onClick={onClose} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[9px] font-black font-mono border-none cursor-pointer">
              {t.close}
            </button>
          </div>

          {/* Cards de Créditos */}
          <div className="grid grid-cols-2 gap-2 mt-3 shrink-0">
            <div 
              onClick={() => setModoAgendamento("clase")}
              className={`border rounded-xl p-2.5 flex flex-col gap-1 cursor-pointer transition-all ${modoAgendamento === "clase" ? "bg-white/[0.06] border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.1)]" : "bg-white/[0.01] border-white/5 opacity-50"}`}>
              <span className="text-[clamp(10px,2.8vw,12px)] font-mono font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Ticket size={10} className="text-amber-500" />
                {t.mainCredits}
              </span>
              <span className="text-[clamp(13px,3.8vw,16px)] font-mono font-black text-white">{planoAluno.creditosAulas}</span>
            </div>
            
            <div 
              onClick={() => setModoAgendamento("reposicion")}
              className={`border rounded-xl p-2.5 flex flex-col gap-1 cursor-pointer transition-all ${modoAgendamento === "reposicion" ? "bg-white/[0.06] border-cyan-500/80 shadow-[0_0_15px_rgba(6,182,212,0.1)]" : "bg-white/[0.01] border-white/5 opacity-50"}`}>
              <span className="text-[clamp(10px,2.8vw,12px)] font-mono font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <RefreshCw size={10} className="text-cyan-400" />
                {t.repCredits} {idioma === "EN" ? "AVAILABLE" : idioma === "ES" ? "DISPONIBLES" : "DISPONÍVEIS"}
              </span>
              <span className="text-[clamp(13px,3.8vw,16px)] font-mono font-black text-cyan-400">{planoAluno.creditosReposicao}</span>
            </div>
          </div>

          {/* Abas */}
          <div className="flex bg-white/5 rounded-xl p-1 gap-1 mt-3 shrink-0">
            <button type="button" onClick={() => { setActiveTab("lista"); setMensagem(null); }} className={`flex-1 py-1.5 rounded-lg text-[clamp(11px,3vw,13px)] font-mono font-black uppercase tracking-wider transition-all border-none cursor-pointer ${activeTab === "lista" ? "bg-[#1c2735] text-white border border-white/10" : "text-slate-400 hover:text-slate-200"}`}>{t.tab1}</button>
            <button type="button" onClick={() => { setActiveTab("agendar"); setMensagem(null); }} className={`flex-1 py-1.5 rounded-lg text-[clamp(11px,3vw,13px)] font-mono font-black uppercase tracking-wider transition-all border-none cursor-pointer ${activeTab === "agendar" ? "bg-[#1c2735] text-white border border-white/10" : "text-slate-400 hover:text-slate-200"}`}>{t.tab2}</button>
          </div>

          {/* Área de Conteúdo */}
          <div className="flex-1 mt-4 flex flex-col justify-start relative">
            
            {mensagem && (
              <div className="p-2.5 mb-2 rounded-xl border text-[clamp(11px,3.2vw,13px)] font-mono font-bold bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shrink-0 leading-relaxed">
                {mensagem.texto}
              </div>
            )}

            {/* ABA LISTA */}
            {activeTab === "lista" && (
              <div 
                className="space-y-2 overflow-y-auto pr-2 flex-1 max-h-[clamp(180px,56vh,460px)]"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "rgba(255,255,255,0.15) transparent"
                }}
              >
                {aulas.length === 0 ? (
                  <div className="text-center py-8 text-[10px] font-mono text-slate-500">{t.noClasses}</div>
                ) : (
                  aulas.map((aula) => (
                    <div key={aula.id} className="p-3 rounded-xl border border-white/[0.06] bg-white/5 flex justify-between items-center shrink-0">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-200">
                          <Calendar size={13} className="text-amber-500" />
                          <span>{aula.data.split("-").reverse().join("/")}</span>
                          <span className="text-slate-600">•</span>
                          <Clock size={13} className="text-amber-500" />
                          <span>{aula.horario}</span>
                        </div>
                        <span className="text-[9px] font-mono font-black uppercase tracking-widest text-slate-400">
                          {aula.tipo === "reposicao" ? t.tagReposicion : t.tagRegular}
                        </span>
                      </div>
                      {(() => {
                        const [dia, mes, ano] = aula.data.split("/");
                        const [horas, minutos] = aula.horario.split(":");
                        const dataAulaObj = new Date(Number(ano), Number(mes) - 1, Number(dia), Number(horas), Number(minutos));
                        
                        const agoraObj = new Date();
                        const diferencaEmMilissegundos = dataAulaObj.getTime() - agoraObj.getTime();
                        const diferencaEmHoras = diferencaEmMilissegundos / (1000 * 60 * 60);

                        const naoPodeCancelar = diferencaEmHoras < 12;

                        return (
                          <div className="flex flex-col items-end gap-1">
                            <button  
                              type="button"  
                              disabled={naoPodeCancelar}
                              onClick={() => !naoPodeCancelar && handleTentativaCancelamento(aula)}
                              className={`py-1 px-3 text-[10px] font-black font-mono uppercase rounded-lg transition-all border-none ${
                                naoPodeCancelar
                                  ? "bg-slate-800 text-slate-500 opacity-30 cursor-not-allowed line-through"
                                  : aula.status === "cancelada" ? "bg-slate-900 text-slate-700 cursor-not-allowed opacity-50" : "bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white cursor-pointer"
                              }`}
                            >
                              {aula.status === "cancelada" ? (idioma === "EN" ? "CANCELED" : "CANCELADA") : (idioma === "EN" ? "Cancel" : "Cancelar")}
                            </button>
                            {naoPodeCancelar && (
                              <span className="text-[9px] text-amber-500/80 font-mono mt-1 block text-right max-w-[150px] leading-tight">
                                {idioma === "EN" ? "* Cannot cancel. Less than 12h." : idioma === "ES" ? "* No puedes cancelar. Menos de 12h." : "* Não pode cancelar. Menos de 12h."}
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ABA AGENDAR */}
            {activeTab === "agendar" && (
              <div className="space-y-3 flex flex-col justify-between flex-1 pb-1">
                <div className="space-y-3">
                  
                  {/* DROPDOWN CUSTOMIZADO: TIPO DE AULA (Sem os números duplicados) */}
                  {/* DROPDOWN DINÂMICO INTELIGENTE COM 6 MODALIDADES */}
                  <div className="space-y-1 relative" ref={tipoRef}>
                    <label className="text-[10px] font-black text-slate-400 uppercase font-mono tracking-wider">{t.lblClassType}</label>
                    
                    {modoAgendamento === "reposicion" ? (
                      <div className="w-full bg-white/[0.02] border border-cyan-500/30 rounded-xl px-3 py-2 text-xs font-mono text-cyan-400 flex justify-between items-center opacity-80">
                        <span className="font-black">{t.optReposicion}</span>
                        <RefreshCw size={12} className="text-cyan-400 animate-spin-slow" />
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => { setIsTipoDropdownOpen(!isTipoDropdownOpen); setIsHorarioDropdownOpen(false); }}
                          className="w-full bg-white/5 border border-amber-500/40 hover:border-amber-500 rounded-xl px-3 py-2 text-xs font-mono text-amber-500 flex justify-between items-center cursor-pointer transition-all focus:outline-none"
                        >
                          <span className="font-black text-amber-500">{getNomeModalidade(tipoAula)}</span>
                          <ChevronDown size={14} className="text-amber-500" />
                        </button>
                        
                        {isTipoDropdownOpen && (
                          <div className="absolute left-0 right-0 mt-1 bg-[#030914] border border-amber-500/40 rounded-xl overflow-hidden z-50 shadow-2xl">
                            {["grupo", "vip_std", "vip_pro", "pack_grupo", "pack_vip_std", "flex"].map((m) => (
                              <div
                                key={m}
                                onClick={() => { setTipoAula(m as any); setIsTipoDropdownOpen(false); }}
                                className={`px-3 py-2 text-xs font-mono cursor-pointer transition-all ${tipoAula === m ? "bg-amber-500 text-[#030914] font-black" : "text-amber-500 hover:bg-amber-500 hover:text-[#030914]"}`}
                              >
                                {getNomeModalidade(m)}
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* SELETOR DE DATA */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase font-mono tracking-wider flex items-center gap-1.5">
                      <Calendar size={12} className="text-amber-500" />
                      {t.qDate}
                    </label>
                    <button
                      type="button"
                      onClick={() => { setIsCalendarModalOpen(true); setIsTipoDropdownOpen(false); setIsHorarioDropdownOpen(false); }}
                      className="w-full bg-white/5 border border-white/[0.08] hover:border-amber-500/50 rounded-xl px-4 py-2 text-xs font-mono font-bold text-slate-200 flex justify-between items-center cursor-pointer transition-all focus:outline-none"
                    >
                      <span className="text-amber-400 font-black">{formatDisplayDate(selectedDate)}</span>
                      <span className="text-[9px] bg-white/5 px-2 py-0.5 rounded border border-white/10 text-slate-400">{t.selectDateBtn}</span>
                    </button>
                  </div>

                  {/* DROPDOWN CUSTOMIZADO: HORÁRIOS DISPONÍVEIS */}
                  <div className="space-y-1 relative" ref={horarioRef}>
                    <label className="text-[10px] font-black text-slate-400 uppercase font-mono tracking-wider">{t.lblTime}</label>
                    <button
                      type="button"
                      onClick={() => { setIsHorarioDropdownOpen(!isHorarioDropdownOpen); setIsTipoDropdownOpen(false); }}
                      className="w-full bg-white/5 border border-amber-500/40 hover:border-amber-500 rounded-xl px-3 py-2 text-xs font-mono text-amber-500 flex justify-between items-center cursor-pointer transition-all focus:outline-none"
                    >
                      <span className="text-amber-500 font-black">{selectedHorario}</span>
                      <ChevronDown size={14} className="text-amber-500" />
                    </button>
                    
                    {isHorarioDropdownOpen && (
                      <div className="absolute left-0 right-0 mt-1 bg-[#030914] border border-amber-500/40 rounded-xl overflow-y-auto max-h-[130px] z-50 shadow-2xl custom-scrollbar">
                        {listaHorarios.map((h) => {
                          const isSelected = selectedHorario === h;
                          return (
                            <div
                              key={h}
                              onClick={() => { setSelectedHorario(h); setIsHorarioDropdownOpen(false); }}
                              className={`px-3 py-1.5 text-xs font-mono cursor-pointer transition-all ${isSelected ? "bg-amber-500 text-[#030914] font-black" : "text-amber-500/90 hover:bg-amber-500 hover:text-[#030914]"}`}
                            >
                              {h}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <button type="button" onClick={validarAntesDeAgendar} className="w-full py-2 mt-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase font-mono tracking-wider transition-all shadow-md cursor-pointer shrink-0">
                  {t.btnConfirm}
                </button>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* CAMADA DO CALENDÁRIO INDEPENDENTE */}
      <div className={`fixed inset-0 z-[60] transition-all duration-300 flex items-center justify-center p-4 ${isCalendarModalOpen ? 'visible' : 'invisible'}`}>
        <div onClick={() => setIsCalendarModalOpen(false)} className={`absolute inset-0 bg-black/85 backdrop-blur-sm transition-opacity duration-300 ${isCalendarModalOpen ? 'opacity-100' : 'opacity-0'}`} />
        
        <div className={`relative w-full max-w-sm bg-[#050c18] border border-white/[0.1] rounded-[20px] p-5 flex flex-col gap-4 shadow-2xl transition-all duration-300 transform ${isCalendarModalOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
          
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Calendar size={12} className="text-amber-500" />
              {t.calTitle}
            </span>
            <button type="button" onClick={() => setIsCalendarModalOpen(false)} className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border-none cursor-pointer">
              <X size={14} />
            </button>
          </div>

          <div className="flex items-center justify-between bg-white/[0.02] p-2 rounded-xl border border-white/5">
            <button type="button" onClick={() => setCurrentNavDate(new Date(year, month - 1, 1))} className="p-1 rounded-lg bg-white/5 text-slate-400 border-none cursor-pointer"><ChevronLeft size={16} /></button>
            <span className="text-xs font-mono font-black text-slate-200 uppercase tracking-wide">{i18nCalendar.months[month]} {year}</span>
            <button type="button" onClick={() => setCurrentNavDate(new Date(year, month + 1, 1))} className="p-1 rounded-lg bg-white/5 text-slate-400 border-none cursor-pointer"><ChevronRight size={16} /></button>
          </div>

          <div className="grid grid-cols-7 text-center text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
            {i18nCalendar.weekDays.map((wd, i) => <div key={i}>{wd}</div>)}
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {gridCells.map((day, index) => {
              if (day === null) return <div key={index} />;
              const currentLoopStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const isSelected = selectedDate === currentLoopStr;

              // Verifica se o dia inteiro está trancado no banco (horario_bloqueado é nulo ou string vazia)
              const diaEstaTrancadoNoBanco = slotsBloqueados.some(
                slot => slot.data_bloqueada === currentLoopStr && (!slot.horario_bloqueado || slot.horario_bloqueado.trim() === "" || slot.horario_bloqueado.startsWith("00:00"))
              );

              const hojeLimite = new Date();
              hojeLimite.setHours(0,0,0,0);
              const dataDoLoop = new Date(year, month, day);
              
              // Pegamos o momento atual e adicionamos 24 horas de antecedência exigida
              const agoraMais24h = new Date();
              agoraMais24h.setHours(agoraMais24h.getHours() + 24);

              // Para desabilitar o dia inteiro no calendário:
              // Se o fim daquele dia (23:59) for menor que o momento mínimo exigido (agora + 24h),
              // significa que o aluno não tem mais como agendar nenhuma aula válida naquele dia.
              const fimDoDiaDoLoop = new Date(year, month, day, 23, 59, 59);
              
              const isDesabilitado = fimDoDiaDoLoop < agoraMais24h || diaEstaTrancadoNoBanco;

              return (
                <button
                  key={index}
                  type="button"
                  disabled={isDesabilitado}
                  onClick={() => !isDesabilitado && handleSelectDay(day)}
                  className={`py-2 rounded-xl text-xs font-mono font-bold border-none transition-all ${
                    isDesabilitado 
                      ? "text-slate-600 bg-white/[0.02] opacity-20 cursor-not-allowed line-through" 
                      : isSelected 
                        ? "bg-amber-500 text-black shadow-md font-black scale-105 cursor-pointer" 
                        : "text-slate-300 bg-white/[0.01] hover:bg-amber-500/20 hover:text-amber-400 cursor-pointer"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      </div>      {/* NOVA TELA FLUTUANTE DE MARKETING E AVISOS COM BLUR */}
      {isAvisoOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div onClick={() => setIsAvisoOpen(false)} className="absolute inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity" />
          
          <div className="relative w-full max-w-sm bg-[#030914] border border-white/[0.06] rounded-[24px] p-6 shadow-2xl text-center flex flex-col gap-4 z-10">
            <h3 className="text-white text-xs font-black tracking-widest uppercase font-mono flex items-center justify-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${tipoAviso === 'duplicado' ? 'bg-rose-500' : 'bg-amber-500'} animate-pulse`} />
              {tipoAviso === "duplicado" ? t.avisoDuplicadoTitulo : tipoAviso === "reposicion_zerada" ? t.avisoReposicaoTitulo : t.avisoMarketingTitulo}
            </h3>

            <p className="text-slate-400 text-xs font-mono leading-relaxed px-2">
              {tipoAviso === "duplicado" ? t.avisoDuplicadoTexto : tipoAviso === "reposicion_zerada" ? t.avisoReposicaoTexto : t.avisoMarketingTexto}
            </p>

            {tipoAviso === "duplicado" ? (
              <button 
                type="button" 
                onClick={() => setIsAvisoOpen(false)} 
                className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white text-[11px] font-black uppercase rounded-xl font-mono transition-all cursor-pointer border border-white/10"
              >
                {t.btnEntendido}
              </button>
            ) : (
              <div className="flex gap-3 mt-1">
                <button 
                  type="button" 
                  onClick={() => setIsAvisoOpen(false)} 
                  className="flex-1 py-2.5 border border-white/[0.06] hover:bg-white/[0.02] text-white text-[11px] font-bold uppercase rounded-xl font-mono transition-all cursor-pointer"
                >{t.btnNao}</button>
                <button 
                  type="button" 
                  onClick={() => {
                    setIsAvisoOpen(false); // Apenas esconde o aviso preto
                    // Engrenagem idêntica do DashboardDesktop.tsx (Linha 653)
                    (window as any).setIsPagamentoOpen ? (window as any).setIsPagamentoOpen(true) : alert("System Loading...");
                  }} 
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-black text-[11px] font-black uppercase rounded-xl font-mono transition-all cursor-pointer shadow-lg"
                >{tipoAviso === "fora_combo" || tipoAviso === "zerado" || tipoAviso === "reposicao" ? (idioma === "EN" ? "BUY NOW" : idioma === "ES" ? "ADQUIRIR" : "COMPRAR AGORA") : t.btnSim}</button>
              </div>
            )}
          </div>
        </div>
      )}
                {/* POP-UP DE RETORNO DO CANCELAMENTO PREMIUM */}
      {mensagemCancelamento && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all duration-300">
          <div className="bg-[#111923] border border-white/[0.08] w-full max-w-sm rounded-2xl p-6 text-center shadow-2xl flex flex-col gap-4">
            <div className={"w-12 h-12 rounded-full flex items-center justify-center mx-auto border " + (tipoErroCancelamento === "bloqueio" ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-amber-500/10 border-amber-500/20 text-amber-500")}>
              <span className="font-mono text-xl font-black">!</span>
            </div>
            
            <h3 className="text-white text-sm font-black font-mono tracking-widest uppercase">
              {tipoErroCancelamento === "bloqueio" 
                ? (idioma === "EN" ? "CANCELLATION BLOCKED" : idioma === "ES" ? "CANCELACIÓN BLOQUEADA" : "CANCELAMENTO BLOQUEADO")
                : (idioma === "EN" ? "CONFIRM CANCELLATION" : idioma === "ES" ? "CONFIRMAR CANCELACIÓN" : "CONFIRMAR CANCELAMENTO")}
            </h3>
            
            <p className="text-slate-400 text-xs font-mono leading-relaxed px-2">
              {mensagemCancelamento}
            </p>

            {tipoErroCancelamento === "bloqueio" ? (
              <button 
                type="button" 
                onClick={() => { setMensagemCancelamento(null); setTipoErroCancelamento(null); }} 
                className="w-full py-2.5 text-[11px] font-black uppercase rounded-xl font-mono transition-all cursor-pointer shadow-lg border-none bg-slate-700 hover:bg-slate-600 text-white"
              >
                {idioma === "EN" ? "Understand" : idioma === "ES" ? "Entendido" : "Entendido"}
              </button>
            ) : (
              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => { setMensagemCancelamento(null); setTipoErroCancelamento(null); }} 
                  className="flex-1 py-2.5 border border-white/[0.06] bg-transparent text-white text-[11px] font-bold uppercase rounded-xl font-mono transition-all cursor-pointer"
                >
                  {idioma === "EN" ? "Go Back" : idioma === "ES" ? "Volver" : "Voltar"}
                </button>
                <button 
                  type="button" onClick={executarCancelamentoBanco} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-[11px] font-black uppercase rounded-xl font-mono transition-all cursor-pointer shadow-lg border-none"
                >
                  {idioma === "EN" ? "Yes, cancel" : idioma === "ES" ? "Sí, cancelar" : "Sim, cancelar"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* POP-UP DE LEMBRETE ISOLADO E INDEPENDENTE */}
      {isLembreteOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md transition-all duration-300">
          <div className="bg-[#111923] border border-white/[0.08] w-full max-w-sm rounded-2xl p-6 text-center shadow-2xl relative overflow-hidden flex flex-col gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto border border-amber-500/20">
              <span className="text-amber-500 font-mono text-xl font-black">!</span>
            </div>
            
            <h3 className="text-white text-sm font-black font-mono tracking-widest uppercase">
              {idioma === "EN" ? "BOOKING REMINDER" : idioma === "ES" ? "RECORDATORIO DE RESERVA" : "LEMBRETE DE AGENDAMENTO"}
            </h3>
            
            <p className="text-slate-400 text-xs font-mono leading-relaxed px-2">
              {idioma === "EN" 
                ? "To plan your studies successfully, please remember: classes must be booked at least 24 hours in advance. If you need to cancel a class, your makeup credits will expire within 5 calendar days, counting from the original date of the canceled class. Shall we book?" 
                : idioma === "ES"
                ? "Para planificar tus estudios con éxito, recuerda: las clases deben reservarse con al menos 24 horas de anticipación. Si necesitas cancelar una clase, tus créditos de reposición vencerán dentro de los 5 días naturales, contados a partir de la fecha original de la clase cancelada. ¿Vamos a reservar?"
                : "Para planejar seus estudos com sucesso, lembre-se: as aulas devem ser agendadas com pelo menos 24 horas de antecedência. Caso precise cancelar uma aula, seus créditos de reposição expiram em até 5 dias corridos, contados a partir da data original da aula que foi cancelada. Vamos agendar?"}
            </p>

            <div className="flex gap-3 mt-2">
              <button 
                type="button" 
                onClick={() => { setIsLembreteOpen(false); setActiveTab("lista"); }} 
                className="flex-1 py-2.5 border border-white/[0.06] bg-transparent text-white text-[11px] font-bold uppercase rounded-xl font-mono transition-all cursor-pointer"
              >
                {idioma === "EN" ? "Not now" : idioma === "ES" ? "Ahora no" : "Agora não"}
              </button>
              <button 
                type="button" 
                onClick={() => setIsLembreteOpen(false)} 
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-black text-[11px] font-black uppercase rounded-xl font-mono transition-all cursor-pointer shadow-lg border-none"
              >
                {idioma === "EN" ? "Yes, let's go" : idioma === "ES" ? "Sí, vamos" : "Sim, vamos lá"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
