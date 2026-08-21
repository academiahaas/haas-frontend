'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  Shield, Box, Globe, AlertTriangle, Calendar, ChevronLeft,
  Hourglass, Users, User, Briefcase, TrendingUp, Ticket,
} from 'lucide-react';

export default function PlanosPage() {
  const router = useRouter();

  // Lê o idioma do mesmo local compartilhado usado em todo o portal
  // (mesma lógica de DashboardDesktop.tsx, padrão 'ES' quando não há nada salvo)
  const [idioma, setIdioma] = useState<'PT' | 'EN' | 'ES'>(() => {
    if (typeof window !== 'undefined') {
      const salvo = localStorage.getItem('haas_idioma');
      if (salvo && ['PT', 'EN', 'ES'].includes(salvo)) return salvo as 'PT' | 'EN' | 'ES';
    }
    return 'ES';
  });

  const [passo, setPasso] = useState(1);
  const [modalidade, setModalidade] = useState<string | null>(null);
  const [creditosMensais, setCreditosMensais] = useState<number | null>(null);
  const [qtdAvulsas, setQtdAvulsas] = useState(0);
  const [masterPlans, setMasterPlans] = useState<any[]>([]);

  useEffect(() => {
    const carregarBanco = async () => {
      const { data } = await supabase.from('master_plans').select('*');
      if (data) setMasterPlans(data);
    };
    carregarBanco();
  }, []);

  const voltarPortal = () => router.push('/portal-aluno');

  const calcularPrecoGrupo = (aulas: number) => {
    if (aulas >= 20) return 650000;
    if (aulas >= 12) return 420000;
    if (aulas >= 8) return 300000;
    if (aulas >= 5) return 180000;
    if (aulas >= 1) return aulas * 40000;
    return 0;
  };

  let valorTotal = 0;
  let descricaoItem = '';

  if (modalidade === 'grupo' && creditosMensais) {
    const planoGrupo = masterPlans.find((p) => p.plan_category === 'Group');
    const matriz = planoGrupo
      ? typeof planoGrupo.pricing_matrix === 'string'
        ? JSON.parse(planoGrupo.pricing_matrix)
        : planoGrupo.pricing_matrix
      : {};
    valorTotal = matriz[String(creditosMensais)] || 0;

    if (creditosMensais === 8) descricaoItem = idioma === 'PT' ? 'Plano Coletivo: 8 Créditos Mensais' : idioma === 'EN' ? 'Group Plan: 8 Monthly Credits' : 'Plan Colectivo: 8 Créditos Mensuales';
    if (creditosMensais === 12) descricaoItem = idioma === 'PT' ? 'Plano Coletivo: 12 Créditos Mensais' : idioma === 'EN' ? 'Group Plan: 12 Monthly Credits' : 'Plan Colectivo: 12 Créditos Mensuales';
    if (creditosMensais === 20) descricaoItem = idioma === 'PT' ? 'Plano Coletivo: 20 Créditos Mensais (Imersão)' : idioma === 'EN' ? 'Group Plan: 20 Monthly Credits (Immersion)' : 'Plan Colectivo: 20 Créditos Mensuales (Inmersión)';
  } else if (modalidade === 'vip_std' && creditosMensais) {
    const planoVipStd = masterPlans.find((p) => p.plan_category === 'VIP Standard');
    const matrizVipStd = planoVipStd
      ? typeof planoVipStd.pricing_matrix === 'string'
        ? JSON.parse(planoVipStd.pricing_matrix)
        : planoVipStd.pricing_matrix
      : {};
    valorTotal = matrizVipStd[String(creditosMensais)] || 0;

    if (creditosMensais === 8) descricaoItem = idioma === 'PT' ? 'VIP Standard: 8 Aulas Mensais' : idioma === 'EN' ? 'VIP Standard: 8 Monthly Classes' : 'VIP Standard: 8 Clases Mensuales';
    if (creditosMensais === 12) descricaoItem = idioma === 'PT' ? 'VIP Standard: 12 Aulas Mensais' : idioma === 'EN' ? 'VIP Standard: 12 Monthly Classes' : 'VIP Standard: 12 Clases Mensuales';
    if (creditosMensais === 20) descricaoItem = idioma === 'PT' ? 'VIP Standard: 20 Aulas Mensais' : idioma === 'EN' ? 'VIP Standard: 20 Monthly Classes' : 'VIP Standard: 20 Clases Mensuales';
  } else if (modalidade === 'vip_pro' && creditosMensais) {
    const planoVipPro = masterPlans.find((p) => p.plan_category === 'VIP Pro');
    const matrizVipPro = planoVipPro
      ? typeof planoVipPro.pricing_matrix === 'string'
        ? JSON.parse(planoVipPro.pricing_matrix)
        : planoVipPro.pricing_matrix
      : {};
    valorTotal = matrizVipPro[String(creditosMensais)] || 0;

    if (creditosMensais === 8) descricaoItem = idioma === 'PT' ? 'VIP Pro Corporativo: 8 Aulas Mensais' : idioma === 'EN' ? 'VIP Pro Corporativo: 8 Monthly Classes' : 'VIP Pro Corporativo: 8 Clases Mensuales';
    if (creditosMensais === 12) descricaoItem = idioma === 'PT' ? 'VIP Pro Corporativo: 12 Aulas Mensais' : idioma === 'EN' ? 'VIP Pro Corporativo: 12 Monthly Classes' : 'VIP Pro Corporativo: 12 Clases Mensuales';
    if (creditosMensais === 20) descricaoItem = idioma === 'PT' ? 'VIP Pro Corporativo: 20 Aulas Mensais' : idioma === 'EN' ? 'VIP Pro Corporativo: 20 Monthly Classes' : 'VIP Pro Corporativo: 20 Clases Mensuales';
  } else if (modalidade === 'avulsa') {
    const planoPackPro = masterPlans.find((p) => p.plan_category === 'Pack VIP Pro');
    const matrizPackPro = planoPackPro
      ? typeof planoPackPro.pricing_matrix === 'string'
        ? JSON.parse(planoPackPro.pricing_matrix)
        : planoPackPro.pricing_matrix
      : {};
    valorTotal = matrizPackPro[String(qtdAvulsas)] || 0;
    descricaoItem = idioma === 'PT' ? `Pack VIP Pro: ${qtdAvulsas} Créditos` : idioma === 'EN' ? `VIP Pro Pack: ${qtdAvulsas} Credits` : `Pack VIP Pro: ${qtdAvulsas} Créditos`;
  } else if (modalidade === 'acumulador_grupo') {
    const planoPackGrupo = masterPlans.find((p) => p.plan_category === 'Pack Group');
    const matrizPackGrupo = planoPackGrupo
      ? typeof planoPackGrupo.pricing_matrix === 'string'
        ? JSON.parse(planoPackGrupo.pricing_matrix)
        : planoPackGrupo.pricing_matrix
      : {};
    valorTotal = matrizPackGrupo[String(qtdAvulsas)] || 0;
    descricaoItem = idioma === 'PT' ? `Pack Acumulativo: ${qtdAvulsas} Aulas em Grupo` : idioma === 'EN' ? `Accumulative Pack: ${qtdAvulsas} Group Classes` : `Pack Acumulativo: ${qtdAvulsas} Aulas en Grupo`;
  } else if (modalidade === 'acumulador_vip_std') {
    const planoPackStd = masterPlans.find((p) => p.plan_category === 'Pack VIP Std');
    const matrizPackStd = planoPackStd
      ? typeof planoPackStd.pricing_matrix === 'string'
        ? JSON.parse(planoPackStd.pricing_matrix)
        : planoPackStd.pricing_matrix
      : {};
    valorTotal = matrizPackStd[String(qtdAvulsas)] || 0;
    descricaoItem = idioma === 'PT' ? `Pack VIP Standard Acumulativo: ${qtdAvulsas} Aulas` : idioma === 'EN' ? `Accumulative VIP Standard Pack: ${qtdAvulsas} Classes` : `Pack VIP Standard Acumulativo: ${qtdAvulsas} Clases`;
  }

  return (
    <div className="min-h-screen w-full bg-[#0A0F1D] text-white">
      <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-6">
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
          <span className="text-[#8b5cf6] font-mono text-xs font-black uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full font-bold text-cyan-400 animate-pulse" />
            {passo === 1
              ? idioma === 'PT' ? 'CENTRAL DE CRÉDITOS & MATRÍCULAS' : idioma === 'EN' ? 'CREDITS & ENROLLMENT CENTER' : 'CENTRAL DE CRÉDITOS & MATRÍCULAS'
              : idioma === 'PT' ? 'VERIFICAÇÃO DE SEGURANÇA' : idioma === 'EN' ? 'SECURITY VERIFICATION' : 'VERIFICACIÓN DE SEGURIDAD'}
          </span>
          <button onClick={voltarPortal} className="text-slate-500 hover:text-white">✕</button>
        </div>

        {typeof window !== 'undefined' && (window as any)._simulaMatriculado && !(window as any)._simulaVencido && passo === 1 && (
          <div
            onClick={() => { setModalidade('grupo'); setCreditosMensais(8); setPasso(2); }}
            className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-2xl text-left relative overflow-hidden animate-fadeIn cursor-pointer hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all group"
            title="Clique para pagar"
          >
            <div className="text-[11px] font-black text-emerald-400 uppercase tracking-wider">🟢 {idioma === 'PT' ? 'Seu Plano está Ativo' : idioma === 'EN' ? 'Your Plan is Active' : 'Tu Plan está Activo'}</div>
            <div className="text-[10px] text-slate-300 mt-0.5">
              {idioma === 'PT' ? 'Mensalidade Atual: ' : idioma === 'EN' ? 'Current Fee: ' : 'Mensualidad Actual: '}
              <span className="text-white font-bold font-mono">$ 300.000 COP</span>.{' '}
              {idioma === 'PT' ? 'Próxima renovação automática: 05/Próx Mes. Clique aqui para pagar' : idioma === 'EN' ? 'Next automatic renewal: 05/Next Month. Click here to pay' : 'Próxima renovación automática: 05/Próx Mes. Clique aquí para pagar'}
            </div>
          </div>
        )}

        {typeof window !== 'undefined' && (window as any)._simulaMatriculado && (window as any)._simulaVencido && passo === 1 && (
          <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-2xl text-left relative overflow-hidden animate-fadeIn select-none">
            <div className="text-[11px] font-black text-rose-400 uppercase tracking-wider">⚠️ {idioma === 'PT' ? 'Sua data de renovação expirou' : idioma === 'EN' ? 'Your renewal date has expired' : 'Tu fecha de renovación expiró'}</div>
            <div className="text-[10px] text-rose-300 mt-0.5">
              {idioma === 'PT' ? (
                <>Conforme os termos da plataforma, as condições anteriores e descontos de fidelidade foram desativados automaticamente. <strong className="text-white">Selecione um plano abaixo para reativar seu acesso.</strong></>
              ) : idioma === 'EN' ? (
                <>In accordance with platform terms, previous conditions and loyalty discounts have been automatically deactivated. <strong className="text-white">Select a new plan below to reactivate your access.</strong></>
              ) : (
                <>Conforme a los términos de la plataforma, las condiciones anteriores y descuentos de fidelidad se han desactivado automáticamente. <strong className="text-white">Selecciona un plan abajo para reactivar tu acceso.</strong></>
              )}
            </div>
          </div>
        )}

        {passo === 1 ? (
          <PassoUmSelecaoPlanos
            idioma={idioma}
            masterPlans={masterPlans}
            modalidade={modalidade}
            setModalidade={setModalidade}
            creditosMensais={creditosMensais}
            setCreditosMensais={setCreditosMensais}
            qtdAvulsas={qtdAvulsas}
            setQtdAvulsas={setQtdAvulsas}
            valorTotal={valorTotal}
            descricaoItem={descricaoItem}
            setPasso={setPasso}
          />
        ) : (
          <PassoDoisCheckout
            idioma={idioma}
            modalidade={modalidade}
            valorTotal={valorTotal}
            setPasso={setPasso}
            setModalidade={setModalidade}
            voltarPortal={voltarPortal}
          />
        )}
      </div>
    </div>
  );
}

const BENEFICIOS_PLANOS: any = {
  grupo: {
    PT: [
      'Turmas de até 8 alunos — aprenda e pratique em comunidade',
      'Acesso aos 13 jogos interativos do sistema',
      'Sistema adaptativo: os desafios evoluem conforme seu desempenho',
      'Slides de aula compartilhados com a turma',
      'IA como parceira de conversação — pratique livremente, tire dúvidas, converse sobre qualquer assunto',
      'Certificado alinhado ao Marco Comum Europeu (CEFR)',
    ],
    EN: [
      'Classes of up to 8 students — learn and practice as a community',
      'Access to all 13 interactive games in the system',
      'Adaptive system: challenges evolve with your performance',
      'Class slides shared with the group',
      'AI as a conversation partner — practice freely, ask questions, chat about anything',
      'Certificate aligned with the Common European Framework (CEFR)',
    ],
    ES: [
      'Grupos de hasta 8 estudiantes — aprende y practica en comunidad',
      'Acceso a los 13 juegos interactivos del sistema',
      'Sistema adaptativo: los desafíos evolucionan según tu desempeño',
      'Diapositivas de clase compartidas con el grupo',
      'IA como compañera de conversación — practica libremente, resuelve dudas, conversa de cualquier tema',
      'Certificado alineado al Marco Común Europeo (MCER)',
    ],
  },
  vip_std: {
    PT: [
      'Aulas 100% individuais e personalizadas',
      'Conversação para o dia a dia, viagens, cultura e estudos — vocabulário acadêmico e conhecimentos gerais para faculdade ou qualquer conversa séria',
      'Acesso aos 13 jogos interativos do sistema',
      'Sistema adaptativo: os desafios evoluem conforme seu desempenho',
      'IA como parceira de conversação — pratique livremente, tire dúvidas, converse sobre qualquer assunto',
      'Certificado alinhado ao Marco Comum Europeu (CEFR)',
    ],
    EN: [
      '100% individual, personalized classes',
      'Conversation for everyday life, travel, culture and studies — academic vocabulary and general knowledge for college or any serious conversation',
      'Access to all 13 interactive games in the system',
      'Adaptive system: challenges evolve with your performance',
      'AI as a conversation partner — practice freely, ask questions, chat about anything',
      'Certificate aligned with the Common European Framework (CEFR)',
    ],
    ES: [
      'Clases 100% individuales y personalizadas',
      'Conversación para el día a día, viajes, cultura y estudios — vocabulario académico y conocimientos generales para la universidad o cualquier conversación seria',
      'Acceso a los 13 juegos interactivos del sistema',
      'Sistema adaptativo: los desafíos evolucionan según tu desempeño',
      'IA como compañera de conversación — practica libremente, resuelve dudas, conversa de cualquier tema',
      'Certificado alineado al Marco Común Europeo (MCER)',
    ],
  },
  vip_pro: {
    PT: [
      'Aulas 100% individuais, com foco total no mundo corporativo',
      'E-mails, reuniões, negociações, apresentações — o idioma que sua carreira exige',
      'Acesso aos 13 jogos interativos do sistema',
      'Sistema adaptativo: os desafios evoluem conforme seu desempenho',
      'IA como parceira de conversação — pratique livremente, tire dúvidas, converse sobre qualquer assunto',
      'Certificado alinhado ao Marco Comum Europeu (CEFR)',
    ],
    EN: [
      '100% individual classes, fully focused on the corporate world',
      'Emails, meetings, negotiations, presentations — the language your career demands',
      'Access to all 13 interactive games in the system',
      'Adaptive system: challenges evolve with your performance',
      'AI as a conversation partner — practice freely, ask questions, chat about anything',
      'Certificate aligned with the Common European Framework (CEFR)',
    ],
    ES: [
      'Clases 100% individuales, totalmente enfocadas en el mundo corporativo',
      'Correos, reuniones, negociaciones, presentaciones — el idioma que tu carrera exige',
      'Acceso a los 13 juegos interactivos del sistema',
      'Sistema adaptativo: los desafíos evolucionan según tu desempeño',
      'IA como compañera de conversación — practica libremente, resuelve dudas, conversa de cualquier tema',
      'Certificado alineado al Marco Común Europeo (MCER)',
    ],
  },
  acumulador_grupo: {
    PT: [
      'Mesma dinâmica de turma do Plano Grupo, sob demanda',
      'Acesso aos 13 jogos interativos do sistema',
      'IA de apoio nos exercícios (foco na prática guiada)',
      'Ideal para reforçar pontos específicos ou testar a metodologia antes de assinar o mês completo',
    ],
    EN: [
      'Same group class dynamic as the Group Plan, on demand',
      'Access to all 13 interactive games in the system',
      'AI support in exercises (guided practice focus)',
      'Ideal for reinforcing specific points or testing the methodology before subscribing to the full month',
    ],
    ES: [
      'Misma dinámica de grupo del Plan Grupal, bajo demanda',
      'Acceso a los 13 juegos interactivos del sistema',
      'IA de apoyo en los ejercicios (enfoque en práctica guiada)',
      'Ideal para reforzar puntos específicos o probar la metodología antes de suscribirte al mes completo',
    ],
  },
  acumulador_vip_std: {
    PT: [
      'Aulas individuais, mesmo foco do VIP Standard (dia a dia, viagem e estudo)',
      'Acesso aos 13 jogos interativos do sistema',
      'IA de apoio nos exercícios (foco na prática guiada)',
      'Ideal para reforçar pontos específicos ou testar a metodologia antes de assinar o mês completo',
    ],
    EN: [
      'Individual classes, same focus as VIP Standard (daily life, travel and study)',
      'Access to all 13 interactive games in the system',
      'AI support in exercises (guided practice focus)',
      'Ideal for reinforcing specific points or testing the methodology before subscribing to the full month',
    ],
    ES: [
      'Clases individuales, mismo enfoque que VIP Standard (día a día, viaje y estudio)',
      'Acceso a los 13 juegos interactivos del sistema',
      'IA de apoyo en los ejercicios (enfoque en práctica guiada)',
      'Ideal para reforzar puntos específicos o probar la metodología antes de suscribirte al mes completo',
    ],
  },
  avulsa: {
    PT: [
      'Aulas individuais, mesmo foco do VIP Pro (100% corporativo)',
      'Acesso aos 13 jogos interativos do sistema',
      'IA de apoio nos exercícios (foco na prática guiada)',
      'Ideal para reforçar pontos específicos ou testar a metodologia antes de assinar o mês completo',
    ],
    EN: [
      'Individual classes, same focus as VIP Pro (100% corporate)',
      'Access to all 13 interactive games in the system',
      'AI support in exercises (guided practice focus)',
      'Ideal for reinforcing specific points or testing the methodology before subscribing to the full month',
    ],
    ES: [
      'Clases individuales, mismo enfoque que VIP Pro (100% corporativo)',
      'Acceso a los 13 juegos interactivos del sistema',
      'IA de apoyo en los ejercicios (enfoque en práctica guiada)',
      'Ideal para reforzar puntos específicos o probar la metodología antes de suscribirte al mes completo',
    ],
  },
};

function PassoUmSelecaoPlanos({
  idioma, masterPlans, modalidade, setModalidade,
  creditosMensais, setCreditosMensais, qtdAvulsas, setQtdAvulsas,
  valorTotal, descricaoItem, setPasso,
}: any) {
  const getAiStatus = (categoria: string, fallback: string) =>
    masterPlans?.find((p: any) => p.plan_category === categoria)?.ai_status || fallback;

  const [expandido, setExpandido] = useState<string | null>(null);

  const TituloVerMais: any = { PT: 'Ver mais', EN: 'See more', ES: 'Ver más' };
  const TituloVerMenos: any = { PT: 'Ver menos', EN: 'See less', ES: 'Ver menos' };

  const CARDS_ASSINATURA = [
    { id: 'grupo', categoria: 'Group', nome: { PT: 'Grupo', EN: 'Group', ES: 'Grupo' }, Icon: Users, altura: 'pb-4', destaque: false },
    { id: 'vip_std', categoria: 'VIP Standard', nome: { PT: 'VIP Standard', EN: 'VIP Standard', ES: 'VIP Standard' }, Icon: User, altura: 'pb-8', destaque: false },
    { id: 'vip_pro', categoria: 'VIP Pro', nome: { PT: 'VIP Pro', EN: 'VIP Pro', ES: 'VIP Pro' }, Icon: Briefcase, altura: 'pb-12', destaque: true },
  ];

  const CARDS_PACK = [
    { id: 'acumulador_grupo', categoria: 'Pack Group', nome: { PT: 'Pack Grupo', EN: 'Group Pack', ES: 'Pack Grupo' }, Icon: TrendingUp, altura: 'pb-4' },
    { id: 'acumulador_vip_std', categoria: 'Pack VIP Std', nome: { PT: 'Pack VIP Std', EN: 'VIP Std Pack', ES: 'Pack VIP Std' }, Icon: Box, altura: 'pb-8' },
    { id: 'avulsa', categoria: 'Pack VIP Pro', nome: { PT: 'Pack VIP Pro', EN: 'VIP Pro Pack', ES: 'Pack VIP Pro' }, Icon: Ticket, altura: 'pb-12' },
  ];

  const cardBase = (ativo: boolean, destaque: boolean) =>
    `relative rounded-2xl border p-4 flex flex-col gap-3 transition-all ${
      ativo
        ? destaque
          ? 'border-purple-400/60 bg-gradient-to-b from-purple-500/10 to-cyan-400/5 shadow-[0_0_24px_rgba(139,92,246,0.15)]'
          : 'border-cyan-500/40 bg-cyan-400/5'
        : 'border-white/10 bg-slate-950/40 hover:border-white/20'
    }`;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
          {idioma === 'PT' ? 'Assinatura Mensal — 30 Dias' : idioma === 'EN' ? 'Monthly Subscription — 30 Days' : 'Suscripción Mensual — 30 Días'}
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {CARDS_ASSINATURA.map(({ id, categoria, nome, Icon, altura, destaque }) => {
            const ativo = modalidade === id;
            return (
              <div key={id} className={`${cardBase(ativo, destaque)} ${altura}`}>
                {destaque && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-cyan-400 text-[9px] font-black uppercase tracking-widest text-slate-950 px-3 py-1 rounded-full whitespace-nowrap">
                    {idioma === 'PT' ? 'Mais Completo' : idioma === 'EN' ? 'Most Complete' : 'Más Completo'}
                  </span>
                )}
                <button
                  onClick={() => { setModalidade(id); if (!creditosMensais) setCreditosMensais(8); }}
                  className="flex flex-col items-center gap-1 text-center"
                >
                  <Icon className={`w-6 h-6 ${ativo ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span className={`text-sm font-black ${ativo ? 'text-cyan-400' : 'text-white'}`}>{nome[idioma]}</span>
                  <span className="text-[9px] text-slate-500 font-mono">{getAiStatus(categoria, 'IA Ilimitada')}</span>
                </button>

                {ativo && (
                  <div className="flex gap-1.5 mt-1">
                    {[8, 12, 20].map((num) => (
                      <button
                        key={num}
                        onClick={() => setCreditosMensais(num)}
                        className={`flex-1 py-2 rounded-lg text-[10px] font-mono font-bold border transition-all ${
                          creditosMensais === num ? 'bg-cyan-400 text-slate-950 border-cyan-500/40' : 'bg-slate-900 border-white/10 text-slate-300 hover:border-white/30'
                        }`}
                      >
                        {num}
                      </button>

                    ))}
                  </div>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); setExpandido(expandido === id ? null : id); }}
                  className="text-[9px] text-slate-500 hover:text-cyan-400 font-bold uppercase tracking-wider transition-all mt-1"
                >
                  {expandido === id ? TituloVerMenos[idioma] : TituloVerMais[idioma]}
                </button>

                {expandido === id && (
                  <ul className="flex flex-col gap-1.5 mt-1 pt-2 border-t border-white/10 text-left">
                    {(BENEFICIOS_PLANOS[id]?.[idioma] || []).map((beneficio: string, i: number) => (
                      <li key={i} className="text-[9.5px] text-slate-300 leading-snug flex gap-1.5">
                        <span className="text-cyan-400 shrink-0">&#8226;</span>
                        <span>{beneficio}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
          {idioma === 'PT' ? 'Pacotes Avulsos — Créditos Progressivos' : idioma === 'EN' ? 'Single Packs — Progressive Credits' : 'Paquetes Sueltos — Créditos Progresivos'}
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {CARDS_PACK.map(({ id, categoria, nome, Icon, altura }) => {
            const ativo = modalidade === id;
            return (
              <div key={id} className={`${cardBase(ativo, false)} ${altura}`}>
                <button
                  onClick={() => { setModalidade(id); setQtdAvulsas(1); }}
                  className="flex flex-col items-center gap-1 text-center"
                >
                  <Icon className={`w-6 h-6 ${ativo ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span className={`text-sm font-black ${ativo ? 'text-cyan-400' : 'text-white'}`}>{nome[idioma]}</span>
                  <span className="text-[9px] text-slate-500 font-mono">
                    {(idioma === 'PT' ? '+7d Acesso | ' : idioma === 'EN' ? '+7d Access | ' : '+7d Acceso | ') + getAiStatus(categoria, '+10 IA /cr')}
                  </span>
                </button>

                {ativo && (
                  <div className="flex items-center gap-3 justify-center py-1">
                    <button onClick={() => setQtdAvulsas(Math.max(1, qtdAvulsas - 1))} className="w-8 h-8 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center font-bold hover:bg-slate-800">-</button>
                    <span className="text-base font-mono font-black text-cyan-400 w-6 text-center">{qtdAvulsas}</span>
                    <button onClick={() => setQtdAvulsas(Math.min(20, qtdAvulsas + 1))} className="w-8 h-8 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center font-bold hover:bg-slate-800">+</button>
                  </div>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); setExpandido(expandido === id ? null : id); }}
                  className="text-[9px] text-slate-500 hover:text-cyan-400 font-bold uppercase tracking-wider transition-all mt-1"
                >
                  {expandido === id ? TituloVerMenos[idioma] : TituloVerMais[idioma]}
                </button>

                {expandido === id && (
                  <ul className="flex flex-col gap-1.5 mt-1 pt-2 border-t border-white/10 text-left">
                    {(BENEFICIOS_PLANOS[id]?.[idioma] || []).map((beneficio: string, i: number) => (
                      <li key={i} className="text-[9.5px] text-slate-300 leading-snug flex gap-1.5">
                        <span className="text-cyan-400 shrink-0">&#8226;</span>
                        <span>{beneficio}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {valorTotal > 0 && (
        <div className="sticky bottom-4 flex flex-col gap-3 bg-[#0A0F1D]/95 backdrop-blur-md pt-2">
          <div className="font-bold border border-cyan-500/20 rounded-2xl p-4 text-center flex flex-col items-center justify-center bg-slate-950/60">
            <span className="text-3xl font-black text-cyan-400 font-mono">$ {valorTotal.toLocaleString('es-CO')} COP</span>
            <div className="text-[10px] font-medium text-center text-slate-400 border-t border-white/[0.05] w-full pt-2 mt-2 leading-relaxed">
              {descricaoItem}
            </div>
          </div>

          <button
            onClick={() => {
              if (typeof window !== 'undefined' && (window as any)._simulaMatriculado) {
                (window as any)._showPopUpHAAS = true;
                (window as any).dispatchEvent(new Event('resize'));
              } else {
                setPasso(2);
              }
            }}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-600 text-black font-black py-3 rounded-xl text-xs uppercase tracking-widest shadow-md hover:brightness-110 transition-all cursor-pointer text-center"
          >
            {idioma === 'PT' ? 'CONTINUAR PARA O PAGAMENTO' : idioma === 'EN' ? 'PROCEED TO PAYMENT' : 'CONTINUAR AL PAGO'}
          </button>
        </div>
      )}


      <div className="text-center text-[9px] text-slate-500 leading-relaxed pt-2 border-t border-white/5">
        {idioma === 'PT' ? 'Escola formalmente registrada, com NIT ativo. Nota fiscal disponivel mediante solicitacao.' : idioma === 'EN' ? 'Formally registered school, with active NIT. Invoice available upon request.' : 'Escuela formalmente registrada, con NIT activo. Factura disponible bajo solicitud.'}
      </div>
      {typeof window !== 'undefined' && (window as any)._showPopUpHAAS && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm bg-[#0A0F1D] border border-white/10 hover:border-purple-500/30 rounded-[28px] p-6 text-center flex flex-col gap-4 shadow-2xl text-white">
            {['grupo', 'vip_std', 'vip_pro'].includes(modalidade) ? (
              <>
                <div className="flex justify-center"><Calendar className="w-8 h-8 text-cyan-400" /></div>
                <div>
                  <h4 className="text-sm font-black text-cyan-400 uppercase tracking-wider">{idioma === 'PT' ? 'Assegurar Próximo Ciclo?' : idioma === 'EN' ? 'Secure Next Cycle?' : '¿Asegurar Próximo Ciclo?'}</h4>
                  <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                    {idioma === 'PT' ? 'Detectamos que você já possui um plano ativo de horários fixos. Esta compra irá congelar a sua tarifa para o próximo mês. Os créditos serão carregados automaticamente ao iniciar o seu novo período.' : idioma === 'EN' ? 'We detected that you already have an active fixed schedule plan. This purchase will freeze your rate for the next month. Credits will be automatically loaded at the start of your new period.' : 'Detectamos que ya tienes un plan activo de horarios fijos. Esta compra congelará tu tarifa para el próximo mes. Los créditos se cargarán automáticamente al iniciar tu nuevo periodo.'}
                  </p>
                </div>
                <div className="flex flex-col gap-2 mt-2">
                  <button onClick={() => { (window as any)._showPopUpHAAS = false; setPasso(2); (window as any).dispatchEvent(new Event('resize')); }} className="w-full bg-emerald-500 text-slate-950 font-black py-2.5 rounded-xl text-[10px] uppercase tracking-wider hover:brightness-110 transition-all font-mono">
                    ✔ {idioma === 'PT' ? 'Sim, pagar adiantado' : idioma === 'EN' ? 'Yes, pay in advance' : 'Sí, pagar por adelantado'}
                  </button>
                  <button onClick={() => { (window as any)._showPopUpHAAS = false; setModalidade(null); (window as any).dispatchEvent(new Event('resize')); }} className="w-full bg-slate-900 border border-white/10 text-slate-400 font-bold py-2.5 rounded-xl text-[10px] uppercase tracking-wider hover:text-white transition-all font-mono">
                    {idioma === 'PT' ? 'Cancelar' : idioma === 'EN' ? 'Cancel' : 'Cancelar'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-center"><AlertTriangle className="w-8 h-8 text-rose-500" /></div>
                <div>
                  <h4 className="text-sm font-black text-rose-400 uppercase tracking-wider">{idioma === 'PT' ? 'Regras de Agendamento' : idioma === 'EN' ? 'Scheduling Rules' : 'Reglas de Agendamiento'}</h4>
                  <div className="text-[11px] text-slate-300 text-left leading-relaxed bg-slate-950/50 p-3 rounded-xl border border-white/10 mt-3 flex flex-col gap-1.5">
                    <div>{idioma === 'PT' ? '• Todo agendamento requer um mínimo de 24 horas de antecedência.' : idioma === 'EN' ? '• All scheduling requires a minimum of 24 hours notice.' : '• Todo agendamiento requiere un mínimo de 24 horas de anticipación.'}</div>
                    <div>{idioma === 'PT' ? '• Cancelamentos permitidos até 12 horas antes (caso contrário o crédito será descontado).' : idioma === 'EN' ? '• Cancellations allowed up to 12 hours before (otherwise the credit will be deducted).' : '• Cancelaciones permitidas hasta 12 horas antes (de lo contrario el crédito se descontará).'}</div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 mt-2">
                  <button onClick={() => { (window as any)._showPopUpHAAS = false; setPasso(2); (window as any).dispatchEvent(new Event('resize')); }} className="w-full bg-gradient-to-r from-purple-600 to-purple-600 text-black font-black py-2.5 rounded-xl text-[10px] uppercase tracking-wider hover:brightness-110 transition-all font-mono">
                    {idioma === 'PT' ? 'Aceito Regras e Continuar' : idioma === 'EN' ? 'Accept Rules & Proceed' : 'Acepto Reglas y Continuar'}
                  </button>
                  <button onClick={() => { (window as any)._showPopUpHAAS = false; setModalidade(null); (window as any).dispatchEvent(new Event('resize')); }} className="w-full bg-slate-900 border border-white/10 text-slate-400 font-bold py-2.5 rounded-xl text-[10px] uppercase tracking-wider hover:text-white transition-all font-mono">
                    {idioma === 'PT' ? 'Cancelar' : idioma === 'EN' ? 'Cancel' : 'Cancelar'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PassoDoisCheckout({ idioma, modalidade, valorTotal, setPasso, setModalidade, voltarPortal }: any) {
  const [metodoEscolhido, setMetodoEscolhido] = useState<'wompi' | 'breb' | null>(null);
  const [exibindoInternacional, setExibindoInternacional] = useState<boolean>(
    typeof window !== 'undefined' ? (window as any)._verInternacional || false : false
  );

  const taxaPercentual = valorTotal * 0.05;
  const taxaFixa = 0;

  const userSeed = typeof window !== 'undefined' ? localStorage.getItem('user_email') || 'haas' : 'haas';
  let hashMod = 0;
  for (let i = 0; i < userSeed.length; i++) { hashMod += userSeed.charCodeAt(i); }
  const diferencaCentavos = (hashMod % 95) + 1;

  if (typeof window !== 'undefined') {
    const valorFinalParaRegistro = valorTotal - diferencaCentavos;
    const chaveRegistro = modalidade + '_' + valorFinalParaRegistro;
    if ((window as any)._ultimaChaveRegistro !== chaveRegistro) {
      (window as any)._ultimaChaveRegistro = chaveRegistro;
      supabase.auth.getUser().then(({ data: { user: authUserAtual } }) => {
        const emailReal = authUserAtual?.email || userSeed;
        fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/gerar_pagamento_pendente`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`,
          },
          body: JSON.stringify({
            p_user_email: emailReal,
            p_plan_category: modalidade,
            p_valor_base: valorFinalParaRegistro,
          }),
        }).catch((err) => console.warn('Erro ao registrar pagamento pendente:', err));
      }).catch((err) => console.warn('Erro ao buscar usuario autenticado:', err));
    }
  }

  const cupomPercentAtivo = (window as any)._cupomAplicado ? Number((window as any)._cupomDesconto || 0) : 0;
  const valorTotalComCupom = cupomPercentAtivo > 0 ? valorTotal * (1 - cupomPercentAtivo / 100) : valorTotal;

  const valorComTaxa = Math.round(valorTotalComCupom + taxaPercentual) - diferencaCentavos;
  const valorDescontoBreve = valorTotalComCupom - diferencaCentavos;

  const [cotacaoDolar, setCotacaoDolar] = typeof window !== 'undefined' ? (window as any).React?.useState(4100) || [4100, () => {}] : [4100, () => {}];
  if (typeof window !== 'undefined' && !(window as any)._buscouCambio) {
    (window as any)._buscouCambio = true;
    fetch('https://open.er-api.com/v6/latest/USD')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.rates && data.rates.COP) {
          (window as any)._taxaCop = data.rates.COP;
          if (typeof window !== 'undefined') (window as any).dispatchEvent(new Event('resize'));
        }
      }).catch(() => {});
  }
  const taxaAtual = (window as any)._taxaCop || 4100;

  const valorCopComTaxa = Math.round(valorTotalComCupom * 1.05);
  const valorCopFinalComDescontoRobo = valorCopComTaxa - diferencaCentavos;
  const valorEmDolarFinal = valorCopFinalComDescontoRobo / taxaAtual;

  const nomePlanoLabel = (() => {
    const mapa: any = {
      grupo: { PT: 'Grupo', EN: 'Group', ES: 'Grupo' },
      vip_std: { PT: 'VIP Standard', EN: 'VIP Standard', ES: 'VIP Standard' },
      vip_pro: { PT: 'VIP Pro', EN: 'VIP Pro', ES: 'VIP Pro' },
      avulsa: { PT: 'Pack VIP Pro', EN: 'VIP Pro Pack', ES: 'Pack VIP Pro' },
      acumulador_grupo: { PT: 'Pack Grupo', EN: 'Group Pack', ES: 'Pack Grupo' },
      acumulador_vip_std: { PT: 'Pack VIP Std', EN: 'VIP Std Pack', ES: 'Pack VIP Std' },
    };
    return mapa[modalidade]?.[idioma] || modalidade;
  })();

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full animate-fadeIn">

      {/* COLUNA ESQUERDA — RESUMO DO PEDIDO (fixo) */}
      <div className="lg:w-[340px] lg:sticky lg:top-6 lg:self-start flex flex-col gap-4">
        <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-5 flex flex-col gap-4">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {idioma === 'PT' ? 'Resumo do Pedido' : idioma === 'EN' ? 'Order Summary' : 'Resumen del Pedido'}
          </span>

          <div className="flex justify-between items-center pb-3 border-b border-white/10">
            <span className="text-sm font-bold text-white">{nomePlanoLabel}</span>
            <span className="text-[10px] text-cyan-400 font-mono">{idioma === 'PT' ? '30 dias' : idioma === 'EN' ? '30 days' : '30 días'}</span>
          </div>

          <div className="flex flex-col gap-1.5 text-[11px] font-mono">
            <div className="flex justify-between text-slate-400">
              <span>{idioma === 'PT' ? 'Subtotal' : idioma === 'EN' ? 'Subtotal' : 'Subtotal'}</span>
              <span>$ {valorTotal.toLocaleString('es-CO')} COP</span>
            </div>
            {cupomPercentAtivo > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>{idioma === 'PT' ? `Cupom (${cupomPercentAtivo}%)` : idioma === 'EN' ? `Coupon (${cupomPercentAtivo}%)` : `Cupón (${cupomPercentAtivo}%)`}</span>
                <span>- $ {Math.round(valorTotal * (cupomPercentAtivo / 100)).toLocaleString('es-CO')} COP</span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-baseline pt-3 border-t border-white/10">
            <span className="text-xs font-bold text-slate-300">{idioma === 'PT' ? 'Subtotal' : idioma === 'EN' ? 'Subtotal' : 'Subtotal'}</span>
            <span className="text-lg font-black text-slate-300 font-mono">$ {valorTotalComCupom.toLocaleString('es-CO')}</span>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex flex-col gap-1">
            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">
              {idioma === 'PT' ? 'Valor exato a transferir (Bre-B, sem taxa):' : idioma === 'EN' ? 'Exact value to transfer (Bre-B, no fee):' : 'Valor exacto a transferir (Bre-B, sin fee):'}
            </span>
            <span className="text-2xl font-black text-emerald-400 font-mono">$ {valorDescontoBreve.toLocaleString('es-CO')}</span>
          </div>

          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-3 flex flex-col gap-1">
            <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">
              {idioma === 'PT' ? 'Valor exato via Wompi / Nequi (+5%):' : idioma === 'EN' ? 'Exact value via Wompi / Nequi (+5%):' : 'Valor exacto vía Wompi / Nequi (+5%):'}
            </span>
            <span className="text-2xl font-black text-cyan-400 font-mono">$ {valorComTaxa.toLocaleString('es-CO')}</span>
          </div>

          <div className="bg-white/[0.02] border border-white/10 p-2.5 rounded-xl flex justify-between items-center text-[10px]">
            <span className="text-slate-400 font-bold tracking-wider">{idioma === 'PT' ? 'LOCALIZAÇÃO' : idioma === 'EN' ? 'LOCATION' : 'UBICACIÓN'}</span>
            <button
              onClick={() => { const novoValor = !exibindoInternacional; (window as any)._verInternacional = novoValor; setExibindoInternacional(novoValor); }}
              className="text-cyan-400 font-black hover:underline tracking-wider uppercase transition-all"
            >
              {exibindoInternacional
                ? idioma === 'PT' ? '🇨🇴 Colômbia' : idioma === 'EN' ? '🇨🇴 Colombia' : '🇨🇴 Colombia'
                : idioma === 'PT' ? 'Fora da Colômbia' : idioma === 'EN' ? 'Outside Colombia' : 'Fuera de Colombia'}
            </button>
          </div>
        </div>

        <div className="w-full bg-[#0a1324] border border-white/[0.05] p-3.5 rounded-xl flex flex-col gap-2 shadow-inner text-left">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">
            {idioma === 'PT' ? 'Cupom de desconto' : idioma === 'EN' ? 'Discount coupon' : 'Cupón de descuento'}
          </span>
          <div className="flex gap-2 w-full">
            <input
              type="text"
              placeholder="HAAS10"
              defaultValue={(window as any)._cupomTexto || ''}
              onChange={(e) => { (window as any)._cupomTexto = e.target.value; }}
              className="flex-1 bg-[#060c16] border border-white/10 rounded-lg px-3 py-2 text-xs text-white uppercase font-mono tracking-wider focus:outline-none focus:border-purple-500/50 transition-all"
            />
            <button
              onClick={async () => {
                const codigo = (window as any)._cupomTexto || '';
                if (!codigo.trim()) return;
                (window as any)._cupomErro = '';
                try {
                  const res = await fetch('/api/portal-aluno/validar-cupom', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code: codigo, user_id: (typeof window !== 'undefined' && (localStorage.getItem('haas_user_id') || (window as any).activeUserId)) || undefined }),
                  });
                  const dados = await res.json();
                  if (dados.valido) {
                    (window as any)._cupomAplicado = true;
                    (window as any)._cupomDesconto = dados.discount_percent;
                    (window as any)._cupomCodigoId = dados.codigo_id;
                    (window as any)._cupomErro = '';
                  } else {
                    (window as any)._cupomAplicado = false;
                    (window as any)._cupomErro = dados.erro || 'Codigo invalido';
                  }
                } catch (e) {
                  (window as any)._cupomErro = 'Erro ao validar codigo';
                }
                (window as any).dispatchEvent(new Event('resize'));
              }}
              className="bg-gradient-to-r from-purple-500/10 to-transparent border border-white/10 hover:border-purple-500/30 text-cyan-400 hover:text-white px-5 py-2 rounded-lg text-[10px] font-mono uppercase font-bold tracking-wider cursor-pointer active:scale-95 transition-all"
            >
              {idioma === 'PT' ? 'Aplicar' : idioma === 'EN' ? 'Apply' : 'Aplicar'}
            </button>
          </div>
          {(window as any)._cupomAplicado && (
            <p className="text-[10px] text-emerald-400 font-bold">
              {idioma === 'PT' ? `Cupom aplicado: ${(window as any)._cupomDesconto}% de desconto` : idioma === 'EN' ? `Coupon applied: ${(window as any)._cupomDesconto}% off` : `Cupón aplicado: ${(window as any)._cupomDesconto}% de descuento`}
            </p>
          )}
          {(window as any)._cupomErro && <p className="text-[10px] text-rose-400 font-bold">{(window as any)._cupomErro}</p>}
        </div>

        <button onClick={() => { setPasso(1); (window as any).dispatchEvent(new Event('resize')); }} className="text-slate-500 hover:text-white font-medium flex items-center gap-1 text-xs">
          <ChevronLeft className="inline-block w-4 h-4 mr-1 mb-0.5" />{idioma === 'PT' ? 'Voltar aos planos' : idioma === 'EN' ? 'Back to plans' : 'Volver a planes'}
        </button>
      </div>

      {/* COLUNA DIREITA — MÉTODO DE PAGAMENTO */}
      <div className="flex-1 flex flex-col gap-4">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {idioma === 'PT' ? 'Escolha a forma de pagamento' : idioma === 'EN' ? 'Choose payment method' : 'Elige el método de pago'}
        </span>

        {exibindoInternacional ? (
          <div className="bg-slate-950/60 border border-slate-800 p-5 rounded-2xl flex flex-col gap-4">
            <div className="flex items-center gap-1.5 text-[11px] font-black text-cyan-400 uppercase tracking-wider">
              <Globe className="w-4 h-4 text-cyan-400" />
              {idioma === 'PT' ? 'Pagamentos Internacionais' : idioma === 'EN' ? 'International Payments' : 'Pagos Internacionales'}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {idioma === 'PT' ? 'Para transferências ou cartões do exterior, processe sua matrícula diretamente através do nosso módulo global integrado de alta segurança.' : idioma === 'EN' ? 'For international bank transfers or cards, process your enrollment directly through our highly secure integrated global module.' : 'Para transferencias o tarjetas desde el exterior, procese su matrícula de manera directa a través de nuestro módulo global integrado de alta seguridad.'}
            </p>
            {(() => {
              const tAtual = (window as any)._taxaCop || 4100;
              const usdBaseOriginal = Math.round(valorTotal / tAtual);
              const usdFeeInternacional = Math.round(usdBaseOriginal * 0.05);
              return (
                <div className="flex flex-col gap-1 text-[11px] bg-slate-900/40 p-3 rounded-xl border border-slate-800/60 font-mono">
                  <div className="flex justify-between text-slate-400"><span>{idioma === 'PT' ? 'Base:' : idioma === 'EN' ? 'Base:' : 'Base:'}</span><span>$ {valorTotal.toLocaleString('es-CO')} COP</span></div>
                  <div className="flex justify-between text-rose-400"><span>{idioma === 'PT' ? 'Taxa (5%):' : idioma === 'EN' ? 'Fee (5%):' : 'Fee (5%):'}</span><span>+ $ {Math.round(valorTotal * 0.05).toLocaleString('es-CO')} COP</span></div>
                  <div className="border-t border-slate-800/80 my-1"></div>
                  <div className="flex justify-between font-black text-emerald-400 text-sm"><span>Total COP:</span><span>$ {(Math.round(valorTotal * 1.05) - diferencaCentavos).toLocaleString('es-CO')}</span></div>
                  <div className="flex justify-between text-slate-500 text-[10px]"><span>≈ USD</span><span>$ {((Math.round(valorTotal * 1.05) - diferencaCentavos) / taxaAtual).toFixed(2)}</span></div>
                </div>
              );
            })()}
            <button
              onClick={() => { if (typeof window !== 'undefined') window.open('https://checkout.nequi.wompi.co/l/Nhopn2', '_blank'); }}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 font-black py-3 rounded-xl text-xs uppercase tracking-wider hover:brightness-110 transition-all cursor-pointer shadow-md"
            >
              {idioma === 'PT' ? 'Ir para o Gateway de Pagamento' : idioma === 'EN' ? 'Go to Payment Gateway' : 'Ir a la Pasarela de Pago'}
            </button>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              ⚠️ {idioma === 'PT' ? 'A taxa bancária de processamento global não é reembolsável em caso de cancelamento.' : idioma === 'EN' ? 'The global processing bank fee is non-refundable in case of cancellation.' : 'La comisión bancaria de procesamiento global no es reembolsable en caso de cancelación.'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">

            {/* OPÇÃO 1 — WOMPI/NEQUI */}
            <button
              onClick={() => setMetodoEscolhido(metodoEscolhido === 'wompi' ? null : 'wompi')}
              className={`text-left rounded-2xl border p-5 transition-all ${metodoEscolhido === 'wompi' ? 'border-cyan-500/50 bg-cyan-400/5' : 'border-white/10 bg-slate-950/60 hover:border-white/20'}`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${metodoEscolhido === 'wompi' ? 'border-cyan-400' : 'border-slate-600'}`}>
                    {metodoEscolhido === 'wompi' && <span className="w-2 h-2 rounded-full bg-cyan-400" />}
                  </span>
                  <span className="text-sm font-black text-white">{idioma === 'PT' ? 'Transferência via Wompi / Nequi' : idioma === 'EN' ? 'Transfer via Wompi / Nequi' : 'Transferencia vía Wompi / Nequi'}</span>
                </div>
                <span className="text-[9px] font-mono text-rose-400 uppercase tracking-wider">+5%</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 pl-6">{idioma === 'PT' ? 'Link de pagamento seguro, ativação automática' : idioma === 'EN' ? 'Secure payment link, automatic activation' : 'Link de pago seguro, activación automática'}</p>

              {metodoEscolhido === 'wompi' && (
                <div className="mt-4 pl-6 flex flex-col gap-3">
                  <div className="flex flex-col gap-1 text-[11px] bg-slate-900/40 p-3 rounded-xl border border-slate-800/60 font-mono">
                    <div className="flex justify-between text-slate-400"><span>Base:</span><span>$ {valorTotal.toLocaleString('es-CO')}</span></div>
                    <div className="flex justify-between text-rose-400"><span>{idioma === 'PT' ? 'Taxa do gateway:' : idioma === 'EN' ? 'Gateway fee:' : 'Fee pasarela:'}</span><span>+ $ {Math.round(taxaPercentual + taxaFixa).toLocaleString('es-CO')}</span></div>
                    <div className="border-t border-slate-800/80 my-0.5"></div>
                    <div className="flex justify-between font-black text-white text-sm"><span>Total:</span><span>$ {valorComTaxa.toLocaleString('es-CO')}</span></div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); if (typeof window !== 'undefined') window.open('https://checkout.nequi.wompi.co/l/Nhopn2', '_blank'); }}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black py-2.5 rounded-xl text-[11px] uppercase tracking-wider hover:brightness-110 transition-all cursor-pointer shadow-md"
                  >
                    {idioma === 'PT' ? 'Pagar via Wompi / Nequi' : idioma === 'EN' ? 'Pay via Wompi / Nequi' : 'Pagar vía Wompi / Nequi'}
                  </button>
                  <p className="text-[9px] text-slate-500 leading-relaxed">
                    <Shield className="inline-block w-3 h-3 mr-1 mb-0.5 text-slate-500" />
                    {idioma === 'PT' ? 'Ao processar o valor exato indicado, o gateway ativa sua assinatura automaticamente. A taxa não é reembolsável em caso de cancelamento.' : idioma === 'EN' ? 'Processing the exact amount indicated activates your subscription automatically. The fee is non-refundable in case of cancellation.' : 'Al procesar el valor exacto indicado, la pasarela activa tu suscripción automáticamente. La comisión no es reembolsable en caso de cancelación.'}
                  </p>
                </div>
              )}
            </button>

            {/* OPÇÃO 2 — QR BRE-B */}
            <button
              onClick={() => setMetodoEscolhido(metodoEscolhido === 'breb' ? null : 'breb')}
              className={`text-left rounded-2xl border p-5 transition-all relative overflow-hidden ${metodoEscolhido === 'breb' ? 'border-cyan-500/50 bg-cyan-400/5' : 'border-white/10 bg-slate-950/60 hover:border-white/20'}`}
            >
              <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 text-[8px] font-black px-2.5 py-1 rounded-bl-xl uppercase tracking-widest">
                {idioma === 'PT' ? 'Sem taxa' : idioma === 'EN' ? 'No fee' : 'Sin comisión'}
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${metodoEscolhido === 'breb' ? 'border-cyan-400' : 'border-slate-600'}`}>
                  {metodoEscolhido === 'breb' && <span className="w-2 h-2 rounded-full bg-cyan-400" />}
                </span>
                <span className="text-sm font-black text-white">{idioma === 'PT' ? 'Chave Bre-B (QR)' : idioma === 'EN' ? 'Bre-B Key (QR)' : 'Llave Bre-B (QR)'}</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 pl-6">{idioma === 'PT' ? 'Transferência direta pelo app do seu banco, sem comissão' : idioma === 'EN' ? 'Direct transfer via your bank app, no commission' : 'Transferencia directa desde tu app bancaria, sin comisión'}</p>

              {metodoEscolhido === 'breb' && (
                <div className="mt-4 pl-6 flex flex-col gap-3">
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 bg-white p-1 rounded-xl flex items-center justify-center border border-cyan-500/20 shadow-lg shrink-0">
                      <img
                        src="https://jdppxfokfhqjudwfwckd.supabase.co/storage/v1/object/public/haas-academy/Untitled%20folder/WhatsApp%20Image%202026-06-28%20at%2012.18.16.jpeg"
                        alt="QR Code Oficial Llave Bre-B"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex flex-col gap-1 text-[11px] bg-slate-900/40 p-3 rounded-xl border border-slate-800/60 font-mono flex-1">
                      <div className="flex justify-between text-slate-400"><span>Base:</span><span>$ {valorTotal.toLocaleString('es-CO')}</span></div>
                      <div className="flex justify-between text-emerald-400 font-bold"><span>{idioma === 'PT' ? 'Comissão:' : idioma === 'EN' ? 'Commission:' : 'Comisión:'}</span><span>$0</span></div>
                      <div className="border-t border-slate-800/80 my-0.5"></div>
                      <div className="flex justify-between font-black text-cyan-400 text-sm"><span>{idioma === 'PT' ? 'A transferir:' : idioma === 'EN' ? 'To transfer:' : 'A transferir:'}</span><span>$ {valorDescontoBreve.toLocaleString('es-CO')}</span></div>
                    </div>
                  </div>
                  <p className="text-[9px] text-slate-500 leading-relaxed">
                    ⚠️ {idioma === 'PT' ? 'Insira o valor exato indicado; isso permite a validação e ativação automática do seu plano.' : idioma === 'EN' ? 'Enter the exact value shown; this allows automatic validation and activation of your plan.' : 'Ingresa el valor exacto indicado; esto permite la validación y activación automática de tu plan.'}
                  </p>
                </div>
              )}
            </button>
          </div>
        )}

        <div className="flex flex-col gap-2.5 border-t border-white/10 pt-4 mt-1">
          {(() => {
            const [, forceUpdate] = typeof window !== 'undefined' ? (window as any).React?.useState(0) || [0, () => {}] : [0, () => {}];
            const estadoNotificado = typeof window !== 'undefined' ? (window as any)._pagoNotificado || false : false;
            if (estadoNotificado) {
              return (
                <div className="fixed inset-0 z-[110] bg-[#0A0F1D] flex flex-col justify-center items-center p-6 text-center font-mono animate-fadeIn">
                  <div className="max-w-md bg-slate-950/60 border border-cyan-500/20 p-6 rounded-2xl flex flex-col gap-4 shadow-2xl">
                    <div className="flex justify-center my-2"><Hourglass className="w-8 h-8 text-cyan-400 animate-pulse" /></div>
                    <h3 className="text-sm font-black text-cyan-400 uppercase tracking-wider">
                      <Hourglass className="inline-block w-4 h-4 mr-1 mb-0.5 text-cyan-400 animate-pulse" />
                      {idioma === 'PT' ? 'NOTIFICAÇÃO DE PAGAMENTO ENVIADA' : idioma === 'EN' ? 'PAYMENT NOTIFICATION SENT' : 'NOTIFICACIÓN DE PAGO ENVIADA'}
                    </h3>
                    <p className="text-[10px] text-slate-300 leading-relaxed text-left bg-slate-900/40 p-3 rounded-xl border border-slate-800/60">
                      {idioma === 'PT' ? 'Registramos o seu aviso de pagamento. O sistema iniciará a verificação dos valores com o desconto de identificação aplicado para validar a transação com o seu registro.' : idioma === 'EN' ? 'We have registered your payment notice. The system will begin verifying the values with the identification discount applied to validate the transaction with your registration.' : 'Hemos registrado tu aviso de pago. El sistema iniciará la verificación de los valores con el descuento de identificación aplicado para validar la transacción con tu registro.'}
                    </p>
                    <div className="text-[9px] text-slate-400 text-left flex flex-col gap-2 bg-slate-900/20 p-3 rounded-xl border border-slate-800/40">
                      <p>• <b className="text-white">{idioma === 'PT' ? 'O que acontece agora?' : idioma === 'EN' ? 'What happens now?' : '¿Qué pasa ahora?'}</b> {idioma === 'PT' ? 'Assim que o sistema validar o recebimento do valor, procederemos com a ativação automática da sua matrícula.' : idioma === 'EN' ? 'Once the system validates the receipt of the amount, it will proceed with the automatic activation of your enrollment.' : 'Una vez que el sistema valide el ingreso del valor, se procederá con la activación automática de tu matrícula.'}</p>
                      <p>• <b className="text-white">{idioma === 'PT' ? 'Acesso Completo:' : idioma === 'EN' ? 'Full Access:' : 'Acceso Completo:'}</b> {idioma === 'PT' ? 'Após a confirmação bem-sucedida, você receberá um e-mail de notificação e seu acesso será liberado.' : idioma === 'EN' ? 'Upon successful confirmation, you will receive a notification email and your access will be enabled.' : 'Tras la confirmación exitosa, recibirás un e-mail de notificación y se habilitará tu acceso a la plataforma.'}</p>
                    </div>
                    <button
                      onClick={() => {
                        (window as any)._pagoNotificado = false;
                        if (typeof forceUpdate === 'function') forceUpdate(Math.random());
                        setPasso(1);
                        setModalidade(null);
                        voltarPortal();
                      }}
                      className="w-full mt-2 font-bold text-cyan-400 hover:bg-purple-600 text-slate-950 font-black py-2.5 rounded-xl text-[11px] uppercase tracking-widest shadow-md transition-all cursor-pointer text-center font-mono"
                    >
                      {idioma === 'PT' ? 'ENTENDIDO' : idioma === 'EN' ? 'UNDERSTOOD' : 'ENTENDIDO'}
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') (window as any)._showPopUpHAAS = false;

                  const containerAviso = document.createElement('div');
                  containerAviso.id = 'modal-notificacion-pago';
                  containerAviso.className = 'fixed inset-0 z-[99999] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn text-white font-mono';

                  containerAviso.innerHTML = `
                    <div class="w-full max-w-sm bg-[#0A0F1D] border border-white/10 hover:border-purple-500/30 rounded-[28px] p-6 text-center flex flex-col gap-4 shadow-2xl">
                      <h4 class="text-sm font-black text-cyan-400 uppercase tracking-wider">${idioma === 'PT' ? 'NOTIFICAÇÃO DE PAGAMENTO ENVIADA' : idioma === 'EN' ? 'PAYMENT NOTIFICATION SENT' : 'NOTIFICACIÓN DE PAGO ENVIADA'}</h4>
                      <p class="text-[10px] text-slate-300 text-left bg-slate-950/50 p-3 rounded-xl border border-white/10" style="line-height: 1.5rem;">
                        ${idioma === 'PT' ? 'Registramos o seu aviso de pagamento. O sistema iniciará a verificação dos valores com o desconto de identificação aplicado para validar a transação com o seu registro.' : idioma === 'EN' ? 'We have registered your payment notice. The system will begin verifying the values with the identification discount applied to validate the transaction with your registration.' : 'Hemos registrado tu aviso de pago. El sistema iniciará la verificación de los valores con el descuento de identificación aplicado para validar la transacción con tu registro.'}
                      </p>
                      <div class="text-[9px] text-slate-400 text-left flex flex-col gap-1.5 bg-slate-950/20 p-3 rounded-xl border border-white/10">
                        <p>• <b class="text-white">${idioma === 'PT' ? 'O que acontece agora?' : idioma === 'EN' ? 'What happens now?' : '¿Qué pasa ahora?'}</b> ${idioma === 'PT' ? 'Assim que o sistema validar o recebimento do valor, procederemos com a ativação automática da sua matrícula.' : idioma === 'EN' ? 'Once the system validates the receipt of the amount, it will proceed with the automatic activation of your enrollment.' : 'Una vez que el sistema valide el ingreso del valor, se procederá con la activación automática de tu matrícula.'}</p>
                        <p>• <b class="text-white">${idioma === 'PT' ? 'Acesso Completo:' : idioma === 'EN' ? 'Full Access:' : 'Acceso Completo:'}</b> ${idioma === 'PT' ? 'Após a confirmação bem-sucedida, você receberá um e-mail de notificação e seu acesso será liberado.' : idioma === 'EN' ? 'Upon successful confirmation, you will receive a notification email and your access will be enabled.' : 'Tras la confirmación exitosa, recibirás un e-mail de notificación y se habilitará tu acceso a la plataforma.'}</p>
                      </div>
                      <button id="btn-entendido-aviso" class="w-full font-bold text-cyan-400 hover:bg-purple-600 text-slate-950 font-black py-2.5 rounded-xl text-[11px] uppercase tracking-widest shadow-md transition-all cursor-pointer text-center font-mono">
                        ${idioma === 'PT' ? 'ENTENDIDO' : idioma === 'EN' ? 'UNDERSTOOD' : 'ENTENDIDO'}
                      </button>
                    </div>
                  `;
                  document.body.appendChild(containerAviso);

                  document.getElementById('btn-entendido-aviso')?.addEventListener('click', () => {
                    containerAviso.remove();
                    setPasso(1);
                    setModalidade(null);
                    voltarPortal();
                  });
                }}
                className="w-full font-bold text-slate-400 hover:text-white hover:bg-white/10 py-2.5 rounded-xl text-[11px] uppercase tracking-widest transition-all cursor-pointer text-center font-mono"
              >
                {idioma === 'PT' ? 'Já realizei o pagamento, voltar ao portal' : idioma === 'EN' ? 'I already paid, return to portal' : 'Ya realicé el pago, volver al portal'}
              </button>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
