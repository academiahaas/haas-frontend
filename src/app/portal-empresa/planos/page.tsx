'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, Users, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const gerarBeneficios = (iaLimite: number | null): any => ({
  fijo: {
    PT: [
      'Aulas 100% individuais, com foco total no mundo corporativo',
      'E-mails, reuniões, negociações, apresentações — o idioma que a carreira do seu time exige',
      'Acesso aos 13 jogos interativos do sistema',
      'Conversação por voz com a IA — o colaborador manda áudio, ela responde em áudio' + (iaLimite ? ` (até ${iaLimite} consultas/mês)` : ''),
      'Tire dúvidas com a IA a qualquer momento' + (iaLimite ? ` (dentro do limite de ${iaLimite} consultas/mês)` : ''),
      'Sistema de feedback automático — identifica os erros do colaborador e devolve a correção na hora',
      'Horário de aula fixo, definido na contratação',
      'Certificado alinhado ao Marco Comum Europeu (CEFR)',
    ],
    EN: [
      '100% individual classes, fully focused on the corporate world',
      'Emails, meetings, negotiations, presentations — the language your team\'s career demands',
      'Access to all 13 interactive games in the system',
      'Voice conversation with AI — the employee sends audio, it replies with audio' + (iaLimite ? ` (up to ${iaLimite} queries/month)` : ''),
      'Ask AI questions anytime' + (iaLimite ? ` (within the ${iaLimite} queries/month limit)` : ''),
      'Automatic feedback system — identifies the employee\'s mistakes and returns the correction instantly',
      'Fixed class schedule, set at contracting',
      'Certificate aligned with the Common European Framework (CEFR)',
    ],
    ES: [
      'Clases 100% individuales, totalmente enfocadas en el mundo corporativo',
      'Correos, reuniones, negociaciones, presentaciones — el idioma que la carrera de tu equipo exige',
      'Acceso a los 13 juegos interactivos del sistema',
      'Conversación por voz con la IA — el colaborador envía audio, ella responde con audio' + (iaLimite ? ` (hasta ${iaLimite} consultas/mes)` : ''),
      'Resuelve dudas con la IA en cualquier momento' + (iaLimite ? ` (dentro del límite de ${iaLimite} consultas/mes)` : ''),
      'Sistema de feedback automático — identifica los errores del colaborador y devuelve la corrección al instante',
      'Horario de clase fijo, definido en la contratación',
      'Certificado alineado al Marco Común Europeo (MCER)',
    ],
  },
  flexible: {
    PT: [
      'Aulas 100% individuais, com foco total no mundo corporativo',
      'E-mails, reuniões, negociações, apresentações — o idioma que a carreira do seu time exige',
      'Acesso aos 13 jogos interativos do sistema',
      'Conversação por voz com a IA — o colaborador manda áudio, ela responde em áudio, sem limite',
      'Tire dúvidas com a IA a qualquer momento, sem limite',
      'Sistema de feedback automático — identifica os erros do colaborador e devolve a correção na hora',
      'Cada colaborador escolhe o horário da aula, sem dia fixo',
      'Certificado alinhado ao Marco Comum Europeu (CEFR)',
    ],
    EN: [
      '100% individual classes, fully focused on the corporate world',
      'Emails, meetings, negotiations, presentations — the language your team\'s career demands',
      'Access to all 13 interactive games in the system',
      'Voice conversation with AI — the employee sends audio, it replies with audio, no limit',
      'Ask AI questions anytime, no limit',
      'Automatic feedback system — identifies the employee\'s mistakes and returns the correction instantly',
      'Each employee chooses their class schedule, no fixed day',
      'Certificate aligned with the Common European Framework (CEFR)',
    ],
    ES: [
      'Clases 100% individuales, totalmente enfocadas en el mundo corporativo',
      'Correos, reuniones, negociaciones, presentaciones — el idioma que la carrera de tu equipo exige',
      'Acceso a los 13 juegos interactivos del sistema',
      'Conversación por voz con la IA — el colaborador envía audio, ella responde con audio, sin límite',
      'Resuelve dudas con la IA en cualquier momento, sin límite',
      'Sistema de feedback automático — identifica los errores del colaborador y devuelve la corrección al instante',
      'Cada colaborador elige el horario de su clase, sin día fijo',
      'Certificado alineado al Marco Común Europeo (MCER)',
    ],
  },
});

const TEXTOS: any = {
  PT: { titulo: 'Detalhes do Plano', voltar: 'Voltar ao simulador', fixo: 'Horário Fixo', flex: 'Horário Livre (Agenda)', escolherFixo: 'Ver Horário Fixo', escolherFlex: 'Ver Horário Livre', pagar: 'Contratar este plano' },
  EN: { titulo: 'Plan Details', voltar: 'Back to simulator', fixo: 'Fixed Schedule', flex: 'Flexible Schedule (Agenda)', escolherFixo: 'View Fixed Schedule', escolherFlex: 'View Flexible Schedule', pagar: 'Hire this plan' },
  ES: { titulo: 'Detalles del Plan', voltar: 'Volver al simulador', fixo: 'Horario Fijo', flex: 'Horario Libre (Agenda)', escolherFixo: 'Ver Horario Fijo', escolherFlex: 'Ver Horario Libre', pagar: 'Contratar este plan' },
};

function PaginaDetalhesCorporativo() {
  const router = useRouter();
  const params = useSearchParams();
  const planKeyInicial = params.get('plan_key') || '';
  const pessoas = params.get('pessoas') || '1';

  const planKeyEfetivo = (tipo: 'fijo' | 'flexible') => {
    const base = planKeyInicial.replace('_flex', '');
    return tipo === 'flexible' ? `${base}_flex` : base;
  };

  const [idioma] = useState<'PT' | 'EN' | 'ES'>(() => {
    if (typeof window !== 'undefined') {
      const salvo = localStorage.getItem('haas_corporate_idioma');
      if (salvo && ['PT', 'EN', 'ES'].includes(salvo)) return salvo as 'PT' | 'EN' | 'ES';
    }
    return 'ES';
  });
  const t = TEXTOS[idioma];

  const [tipoAtivo, setTipoAtivo] = useState<'fijo' | 'flexible'>(
    planKeyInicial.includes('flex') ? 'flexible' : 'fijo'
  );

  const [iaLimite, setIaLimite] = useState<number | null>(null);

  React.useEffect(() => {
    const buscarLimite = async () => {
      const base = planKeyInicial.replace('_flex', '');
      const chave = tipoAtivo === 'flexible' ? `${base}_flex` : base;
      const { data } = await supabase.from('corporate_plan_prices').select('ia_consultas_mes').eq('plan_key', chave).maybeSingle();
      setIaLimite(data?.ia_consultas_mes ?? null);
    };
    if (planKeyInicial) buscarLimite();
  }, [tipoAtivo, planKeyInicial]);

  const BENEFICIOS = gerarBeneficios(iaLimite);

  return (
    <div className="min-h-screen w-full bg-[#0A0F1D] text-white">
      <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">

        <div className="flex justify-between items-center border-b border-white/10 pb-4">
          <span className="text-[#8b5cf6] font-mono text-xs font-black uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            {t.titulo}
          </span>
          <button onClick={() => router.push('/portal-empresa/gestionar')} className="text-slate-500 hover:text-white">✕</button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setTipoAtivo('fijo')}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${tipoAtivo === 'fijo' ? 'border-cyan-500/50 bg-cyan-400/5' : 'border-white/10 bg-slate-950/40 hover:border-white/20'}`}
          >
            <Users className={`w-6 h-6 ${tipoAtivo === 'fijo' ? 'text-cyan-400' : 'text-slate-400'}`} />
            <span className={`text-sm font-black ${tipoAtivo === 'fijo' ? 'text-cyan-400' : 'text-white'}`}>{t.fixo}</span>
          </button>
          <button
            onClick={() => setTipoAtivo('flexible')}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${tipoAtivo === 'flexible' ? 'border-cyan-500/50 bg-cyan-400/5' : 'border-white/10 bg-slate-950/40 hover:border-white/20'}`}
          >
            <Calendar className={`w-6 h-6 ${tipoAtivo === 'flexible' ? 'text-cyan-400' : 'text-slate-400'}`} />
            <span className={`text-sm font-black ${tipoAtivo === 'flexible' ? 'text-cyan-400' : 'text-white'}`}>{t.flex}</span>
          </button>
        </div>

        <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-5">
          <ul className="flex flex-col gap-3">
            {(BENEFICIOS[tipoAtivo]?.[idioma] || []).map((beneficio: string, i: number) => (
              <li key={i} className="text-[13px] text-slate-300 leading-snug flex gap-2.5">
                <span className="text-cyan-400 shrink-0 mt-0.5">•</span>
                <span>{beneficio}</span>
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={() => router.push(`/portal-empresa/gestionar?plan_key=${planKeyEfetivo(tipoAtivo)}`)}
          className="w-full bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:brightness-110 text-white font-black py-4 rounded-lg text-xs uppercase tracking-wider transition-all"
        >
          {t.pagar}
        </button>

        <button onClick={() => router.push('/portal-empresa/gestionar')} className="text-slate-500 hover:text-white font-medium flex items-center gap-1 text-xs">
          <ChevronLeft className="inline-block w-4 h-4 mr-1 mb-0.5" />{t.voltar}
        </button>
      </div>
    </div>
  );
}

export default function PaginaDetalhesCorporativoWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0F1D]" />}>
      <PaginaDetalhesCorporativo />
    </Suspense>
  );
}
