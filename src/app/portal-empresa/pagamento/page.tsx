'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, Shield } from 'lucide-react';

const TEXTOS: any = {
  PT: {
    titulo: 'Confirmar Pagamento', voltar: 'Voltar ao simulador', resumo: 'Resumo do Pedido',
    plano: 'Plano', pessoas: 'Colaboradores', desconto: 'Desconto', subtotal: 'Subtotal', total: 'Total',
    escolha: 'Escolha a forma de pagamento',
    wompiTitulo: 'Transferência via Wompi / Nequi', gatewaySeguro: 'Gateway seguro Wompi / Nequi',
    base: 'Base', feePasarela: 'Taxa do gateway', pagarViaWompi: 'Pagar via Wompi / Nequi',
    notaWompi: 'Ao processar o valor exato indicado, o gateway ativa seu plano automaticamente. A taxa não é reembolsável em caso de cancelamento.',
    llaveBreB: 'Chave Bre-B (QR)', semTaxa: 'Sem taxa', comissao: 'Comissão', gratis: 'Grátis',
    aTransferir: 'A transferir', jaTransferi: 'Já transferi, notificar pagamento',
    atencao: 'ATENÇÃO', notaBreB: 'insira o valor exato indicado; isso permite a validação automática do seu pagamento.',
    processando: 'Carregando...',
  },
  EN: {
    titulo: 'Confirm Payment', voltar: 'Back to simulator', resumo: 'Order Summary',
    plano: 'Plan', pessoas: 'Employees', desconto: 'Discount', subtotal: 'Subtotal', total: 'Total',
    escolha: 'Choose payment method',
    wompiTitulo: 'Transfer via Wompi / Nequi', gatewaySeguro: 'Secure gateway Wompi / Nequi',
    base: 'Base', feePasarela: 'Gateway fee', pagarViaWompi: 'Pay via Wompi / Nequi',
    notaWompi: 'Processing the exact amount indicated automatically activates your plan. The fee is non-refundable in case of cancellation.',
    llaveBreB: 'Bre-B Key (QR)', semTaxa: 'No fee', comissao: 'Commission', gratis: 'Free',
    aTransferir: 'To transfer', jaTransferi: 'I already transferred, notify payment',
    atencao: 'ATTENTION', notaBreB: 'enter the exact value shown; this allows automatic validation of your payment.',
    processando: 'Loading...',
  },
  ES: {
    titulo: 'Confirmar Pago', voltar: 'Volver al simulador', resumo: 'Resumen del Pedido',
    plano: 'Plan', pessoas: 'Colaboradores', desconto: 'Descuento', subtotal: 'Subtotal', total: 'Total',
    escolha: 'Elige el método de pago',
    wompiTitulo: 'Transferencia vía Wompi / Nequi', gatewaySeguro: 'Pasarela segura Wompi / Nequi',
    base: 'Base', feePasarela: 'Fee pasarela', pagarViaWompi: 'Pagar vía Wompi / Nequi',
    notaWompi: 'Al procesar el valor exacto indicado, la pasarela activa tu plan automáticamente. La comisión no es reembolsable en caso de cancelación.',
    llaveBreB: 'Llave Bre-B (QR)', semTaxa: 'Sin comisión', comissao: 'Comisión', gratis: 'Gratis',
    aTransferir: 'A transferir', jaTransferi: 'Ya transferí, notificar pago',
    atencao: 'ATENCIÓN', notaBreB: 'ingresa el valor exacto indicado; esto permite la validación automática de tu pago.',
    processando: 'Cargando...',
  },
};

function PaginaPagamentoCorporativo() {
  const router = useRouter();
  const params = useSearchParams();

  const [idioma] = useState<'PT' | 'EN' | 'ES'>(() => {
    if (typeof window !== 'undefined') {
      const salvo = localStorage.getItem('haas_corporate_idioma');
      if (salvo && ['PT', 'EN', 'ES'].includes(salvo)) return salvo as 'PT' | 'EN' | 'ES';
    }
    return 'ES';
  });
  const t = TEXTOS[idioma];

  const [metodoEscolhido, setMetodoEscolhido] = useState<'wompi' | 'breb' | null>(null);
  const [pagoNotificado, setPagoNotificado] = useState(false);
  const [exibindoInternacional, setExibindoInternacional] = useState(false);
  const [taxaCop, setTaxaCop] = useState(4100);

  useEffect(() => {
    fetch('https://open.er-api.com/v6/latest/USD')
      .then((res) => res.json())
      .then((data) => { if (data?.rates?.COP) setTaxaCop(data.rates.COP); })
      .catch(() => {});
  }, []);

  const planKey = params.get('plan_key') || '';
  const pessoas = Number(params.get('pessoas') || '1');
  const groupId = params.get('group_id') || '';

  const [pessoasPagas, setPessoasPagas] = useState(0);

  useEffect(() => {
    const buscarPessoasPagas = async () => {
      if (!groupId) return;
      const { data } = await supabase.from('corporate_groups').select('pessoas_pagas').eq('id', groupId).maybeSingle();
      setPessoasPagas(data?.pessoas_pagas || 0);
    };
    buscarPessoasPagas();
  }, [groupId]);

  const [empresa, setEmpresa] = useState<any>(null);
  const [simPlano, setSimPlano] = useState<any>(null);
  const [descontoConfig, setDescontoConfig] = useState({ desconto_por_pessoa: 1.5, desconto_maximo: 25 });
  const [criandoCobranca, setCriandoCobranca] = useState(false);
  const [cobrancaMsg, setCobrancaMsg] = useState('');

  useEffect(() => {
    const carregar = async () => {
      const corporateId = typeof window !== 'undefined' ? localStorage.getItem('haas_corporate_id') : null;
      const corporateName = typeof window !== 'undefined' ? localStorage.getItem('haas_corporate_name') : null;
      if (!corporateId) return;

      setEmpresa({ id: corporateId, company_name: corporateName || 'Empresa' });

      const { data: planoData } = await supabase.from('corporate_plan_prices').select('plan_key, plan_label, price, tipo_horario').eq('plan_key', planKey).maybeSingle();
      if (planoData) setSimPlano(planoData);

      const { data: descontoData } = await supabase.from('corporate_discount_config').select('desconto_por_pessoa, desconto_maximo').limit(1).maybeSingle();
      if (descontoData) setDescontoConfig(descontoData);
    };
    carregar();
  }, [planKey]);

  const centavosUnicos = (email: string) => {
    let hash = 0;
    for (let i = 0; i < email.length; i++) hash += email.charCodeAt(i);
    return (hash % 95) + 1;
  };

  const pessoasNovas = Math.max(0, pessoas - pessoasPagas);
  const desconto = simPlano ? Math.min(descontoConfig.desconto_maximo, (pessoas - 1) * descontoConfig.desconto_por_pessoa) : 0;
  const subtotal = simPlano ? Number(simPlano.price) * pessoasNovas : 0;
  const total = subtotal * (1 - desconto / 100);
  const bossEmail = typeof window !== 'undefined' ? (localStorage.getItem('haas_corporate_email') || 'haas') : 'haas';
  const centavos = centavosUnicos(bossEmail);

  const valorComTaxa = Math.round(total * 1.05) - centavos;
  const valorDescontoBreve = Math.round(total) - centavos;

  const handlePagar = async (valorExacto: number, abrirWompi: boolean = true) => {
    if (!empresa) return;
    setCriandoCobranca(true);
    setCobrancaMsg('');
    try {
      const email = localStorage.getItem('haas_corporate_email') || '';
      const res = await fetch('/api/portal-empresa/criar-cobranca', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ corporate_account_id: empresa.id, boss_email: email, amount: valorExacto, group_id: groupId, quantidade_pessoas: pessoasNovas }),
      });
      const dados = await res.json();
      if (!res.ok) throw new Error(dados.error);
      if (abrirWompi) {
        setCobrancaMsg(idioma === 'PT' ? 'Cobrança registrada. Complete o pagamento na janela que abriu.' : idioma === 'EN' ? 'Charge registered. Complete payment in the window that opened.' : 'Cobranza registrada. Completa el pago en la ventana que se abrió.');
        window.open('https://checkout.nequi.wompi.co/l/Nhopn2', '_blank');
      } else {
        setCobrancaMsg(idioma === 'PT' ? 'Transferência registrada. O sistema validará seu pagamento automaticamente ao recebê-la.' : idioma === 'EN' ? 'Transfer registered. The system will automatically validate your payment upon receipt.' : 'Transferencia registrada. El sistema validará tu pago automáticamente al recibirla.');
      }
    } catch (e: any) {
      setCobrancaMsg('Error: ' + e.message);
    } finally {
      setCriandoCobranca(false);
    }
  };

  if (!simPlano) {
    return (
      <div className="min-h-screen w-full bg-[#0A0F1D] text-white flex items-center justify-center">
        <p className="text-slate-400 text-sm">{t.processando}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#0A0F1D] text-white">
      <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6">

        {/* COLUNA ESQUERDA — RESUMO FIXO */}
        <div className="lg:w-[340px] lg:sticky lg:top-6 lg:self-start flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <span className="text-[#8b5cf6] font-mono text-xs font-black uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              {t.titulo}
            </span>
            <button onClick={() => router.push('/portal-empresa/gestionar')} className="text-slate-500 hover:text-white">✕</button>
          </div>

          <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-5 flex flex-col gap-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.resumo}</span>
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">{t.plano}</span>
              <span className="font-bold text-white">{simPlano.plan_label}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">{t.pessoas}</span>
              <span className="font-bold text-white">{pessoas}</span>
            </div>
            {pessoasPagas > 0 && (
              <div className="flex justify-between text-[11px] text-emerald-400">
                <span>{idioma === 'PT' ? 'Já pagos anteriormente' : idioma === 'EN' ? 'Already paid before' : 'Ya pagados antes'}</span>
                <span>{pessoasPagas}</span>
              </div>
            )}
            <div className="flex justify-between text-[11px] text-cyan-400 font-bold">
              <span>{idioma === 'PT' ? 'A pagar agora' : idioma === 'EN' ? 'To pay now' : 'A pagar ahora'}</span>
              <span>{pessoasNovas}</span>
            </div>
            {desconto > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-emerald-400">{t.desconto}</span>
                <span className="font-bold text-emerald-400">-{desconto.toFixed(1)}%</span>
              </div>
            )}

            <div className="flex justify-between items-baseline pt-3 border-t border-white/10">
              <span className="text-xs font-bold text-slate-300">{t.subtotal}</span>
              <span className="text-lg font-black text-slate-300 font-mono">$ {Math.round(total).toLocaleString('es-CO')}</span>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex flex-col gap-1">
              <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                {idioma === 'PT' ? 'Valor exato via Bre-B (sem taxa):' : idioma === 'EN' ? 'Exact value via Bre-B (no fee):' : 'Valor exacto vía Bre-B (sin fee):'}
              </span>
              <span className="text-2xl font-black text-emerald-400 font-mono">$ {valorDescontoBreve.toLocaleString('es-CO')}</span>
            </div>

            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-3 flex flex-col gap-1">
              <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">
                {idioma === 'PT' ? 'Valor exato via Wompi/Nequi (+5%):' : idioma === 'EN' ? 'Exact value via Wompi/Nequi (+5%):' : 'Valor exacto vía Wompi/Nequi (+5%):'}
              </span>
              <span className="text-2xl font-black text-cyan-400 font-mono">$ {valorComTaxa.toLocaleString('es-CO')}</span>
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/10 p-2.5 rounded-xl flex justify-between items-center text-[10px]">
            <span className="text-slate-400 font-bold tracking-wider">{idioma === 'PT' ? 'LOCALIZAÇÃO' : idioma === 'EN' ? 'LOCATION' : 'UBICACIÓN'}</span>
            <button onClick={() => setExibindoInternacional(!exibindoInternacional)} className="text-cyan-400 font-black hover:underline tracking-wider uppercase transition-all">
              {exibindoInternacional ? '🇨🇴 Colombia' : (idioma === 'PT' ? 'Fora da Colômbia' : idioma === 'EN' ? 'Outside Colombia' : 'Fuera de Colombia')}
            </button>
          </div>

          <button onClick={() => router.push('/portal-empresa/gestionar')} className="text-slate-500 hover:text-white font-medium flex items-center gap-1 text-xs">
            <ChevronLeft className="inline-block w-4 h-4 mr-1 mb-0.5" />{t.voltar}
          </button>
        </div>

        {/* COLUNA DIREITA — MÉTODO DE PAGAMENTO */}
        <div className="flex-1 flex flex-col gap-4">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.escolha}</span>

          {exibindoInternacional ? (
          <div className="bg-slate-950/60 border border-slate-800 p-5 rounded-2xl flex flex-col gap-4">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {idioma === 'PT' ? 'Para transferências ou cartões do exterior, processe o pagamento diretamente pelo nosso gateway global.' : idioma === 'EN' ? 'For international transfers or cards, process the payment directly through our global gateway.' : 'Para transferencias o tarjetas desde el exterior, procese el pago directamente a través de nuestra pasarela global.'}
            </p>
            <div className="flex flex-col gap-1 text-[11px] bg-slate-900/40 p-3 rounded-xl border border-slate-800/60 font-mono">
              <div className="flex justify-between text-slate-400"><span>{t.base}:</span><span>$ {Math.round(total).toLocaleString('es-CO')} COP</span></div>
              <div className="flex justify-between text-rose-400"><span>Fee (5%):</span><span>+ $ {Math.round(total * 0.05).toLocaleString('es-CO')} COP</span></div>
              <div className="border-t border-slate-800/80 my-1"></div>
              <div className="flex justify-between font-black text-emerald-400 text-sm"><span>Total COP:</span><span>$ {valorComTaxa.toLocaleString('es-CO')}</span></div>
              <div className="flex justify-between text-slate-500 text-[10px]"><span>≈ USD</span><span>$ {(valorComTaxa / taxaCop).toFixed(2)}</span></div>
            </div>
            <button
              onClick={() => handlePagar(valorComTaxa)}
              disabled={criandoCobranca}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 font-black py-3 rounded-xl text-xs uppercase tracking-wider hover:brightness-110 transition-all cursor-pointer shadow-md disabled:opacity-50"
            >
              {idioma === 'PT' ? 'Ir para o Gateway de Pagamento' : idioma === 'EN' ? 'Go to Payment Gateway' : 'Ir a la Pasarela de Pago'}
            </button>
          </div>
          ) : (
          <div className="flex flex-col gap-3">
            {/* OPÇÃO WOMPI/NEQUI */}
            <button
              onClick={() => setMetodoEscolhido(metodoEscolhido === 'wompi' ? null : 'wompi')}
              className={`text-left rounded-2xl border p-5 transition-all ${metodoEscolhido === 'wompi' ? 'border-cyan-500/50 bg-cyan-400/5' : 'border-white/10 bg-slate-950/60 hover:border-white/20'}`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${metodoEscolhido === 'wompi' ? 'border-cyan-400' : 'border-slate-600'}`}>
                    {metodoEscolhido === 'wompi' && <span className="w-2 h-2 rounded-full bg-cyan-400" />}
                  </span>
                  <span className="text-sm font-black text-white">{t.wompiTitulo}</span>
                </div>
                <span className="text-[9px] font-mono text-rose-400 uppercase tracking-wider">+5%</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 pl-6">{t.gatewaySeguro}</p>

              {metodoEscolhido === 'wompi' && (
                <div className="mt-4 pl-6 flex flex-col gap-3">
                  <div className="flex flex-col gap-1 text-[11px] bg-slate-900/40 p-3 rounded-xl border border-slate-800/60 font-mono">
                    <div className="flex justify-between text-slate-400"><span>{t.base}:</span><span>$ {Math.round(total).toLocaleString('es-CO')}</span></div>
                    <div className="flex justify-between text-rose-400"><span>{t.feePasarela}:</span><span>+ $ {Math.round(total * 0.05).toLocaleString('es-CO')}</span></div>
                    <div className="border-t border-slate-800/80 my-0.5"></div>
                    <div className="flex justify-between font-black text-white text-sm"><span>{t.total}:</span><span>$ {valorComTaxa.toLocaleString('es-CO')}</span></div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handlePagar(valorComTaxa); }}
                    disabled={criandoCobranca}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black py-2.5 rounded-xl text-[11px] uppercase tracking-wider hover:brightness-110 transition-all cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {t.pagarViaWompi}
                  </button>
                  <p className="text-[9px] text-slate-500 leading-relaxed">
                    <Shield className="inline-block w-3 h-3 mr-1 mb-0.5 text-slate-500" />{t.notaWompi}
                  </p>
                </div>
              )}
            </button>

            {/* OPÇÃO QR BRE-B */}
            <button
              onClick={() => setMetodoEscolhido(metodoEscolhido === 'breb' ? null : 'breb')}
              className={`text-left rounded-2xl border p-5 transition-all relative overflow-hidden ${metodoEscolhido === 'breb' ? 'border-cyan-500/50 bg-cyan-400/5' : 'border-white/10 bg-slate-950/60 hover:border-white/20'}`}
            >
              <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 text-[8px] font-black px-2.5 py-1 rounded-bl-xl uppercase tracking-widest">
                {t.semTaxa}
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${metodoEscolhido === 'breb' ? 'border-cyan-400' : 'border-slate-600'}`}>
                  {metodoEscolhido === 'breb' && <span className="w-2 h-2 rounded-full bg-cyan-400" />}
                </span>
                <span className="text-sm font-black text-white">{t.llaveBreB}</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 pl-6">
                {idioma === 'PT' ? 'Transferência direta pelo app do seu banco, sem comissão' : idioma === 'EN' ? 'Direct transfer via your bank app, no commission' : 'Transferencia directa desde tu app bancaria, sin comisión'}
              </p>

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
                      <div className="flex justify-between text-slate-400"><span>{t.base}:</span><span>$ {Math.round(total).toLocaleString('es-CO')}</span></div>
                      <div className="flex justify-between text-emerald-400 font-bold"><span>{t.comissao}:</span><span>$0 ({t.gratis})</span></div>
                      <div className="border-t border-slate-800/80 my-0.5"></div>
                      <div className="flex justify-between font-black text-cyan-400 text-sm"><span>{t.aTransferir}:</span><span>$ {valorDescontoBreve.toLocaleString('es-CO')}</span></div>
                    </div>
                  </div>
                  <p className="text-[9px] text-slate-500 leading-relaxed">
                    ⚠️ <span className="font-bold text-cyan-400">{t.atencao}:</span> {t.notaBreB}
                  </p>
                </div>
              )}
            </button>
          </div>
          )}

          {cobrancaMsg && <p className="text-[11px] text-slate-400 text-center pt-2">{cobrancaMsg}</p>}

          <button
            onClick={() => setPagoNotificado(true)}
            className="w-full font-bold text-slate-400 hover:text-white hover:bg-white/5 py-3 rounded-xl text-[11px] uppercase tracking-widest transition-all cursor-pointer text-center border border-white/10 mt-2"
          >
            {idioma === 'PT' ? 'Já paguei' : idioma === 'EN' ? 'I already paid' : 'Ya pagué'}
          </button>

        </div>
      </div>

      {pagoNotificado && (
        <div className="fixed inset-0 z-[110] bg-[#0A0F1D] flex flex-col justify-center items-center p-6 text-center font-mono">
          <div className="max-w-md bg-slate-950/60 border border-cyan-500/20 p-6 rounded-2xl flex flex-col gap-4 shadow-2xl">
            <h3 className="text-sm font-black text-cyan-400 uppercase tracking-wider">
              {idioma === 'PT' ? 'Pagamento em verificação' : idioma === 'EN' ? 'Payment being verified' : 'Pago en verificación'}
            </h3>
            <p className="text-[11px] text-slate-300 leading-relaxed text-left bg-slate-900/40 p-3 rounded-xl border border-slate-800/60">
              {idioma === 'PT' ? 'Registramos seu aviso. O sistema verificará o valor recebido e ativará o plano automaticamente assim que confirmado.' : idioma === 'EN' ? 'We have registered your notice. The system will verify the amount received and activate the plan automatically once confirmed.' : 'Hemos registrado tu aviso. El sistema verificará el valor recibido y activará el plan automáticamente una vez confirmado.'}
            </p>
            <button
              onClick={() => router.push('/portal-empresa/gestionar')}
              className="w-full font-black text-slate-950 bg-cyan-400 hover:bg-cyan-300 py-2.5 rounded-xl text-[11px] uppercase tracking-widest shadow-md transition-all cursor-pointer text-center font-mono"
            >
              {idioma === 'PT' ? 'Voltar ao portal' : idioma === 'EN' ? 'Back to portal' : 'Volver al portal'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PaginaPagamentoCorporativoWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0F1D]" />}>
      <PaginaPagamentoCorporativo />
    </Suspense>
  );
}
