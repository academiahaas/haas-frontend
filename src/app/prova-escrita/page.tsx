"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { CheckCircle2, XCircle, Loader2, ArrowRight, Calendar } from 'lucide-react';

type LangKey = 'pt' | 'es' | 'en';
type Fase = 'CARREGANDO' | 'GRAMATICA' | 'LEITURA' | 'REDACAO' | 'ENVIANDO' | 'RESULTADO' | 'INDISPONIVEL';

function pick(dict: { pt: string; es: string; en: string }, l: LangKey) {
  return dict[l];
}

const T = {
  titulo: (l: LangKey) => pick({ pt: 'Prova Escrita Oficial', es: 'Prueba Escrita Oficial', en: 'Official Written Exam' }, l),
  carregando: (l: LangKey) => pick({ pt: 'Preparando sua prova...', es: 'Preparando tu prueba...', en: 'Preparing your exam...' }, l),
  indisponivel: (l: LangKey) => pick({ pt: 'Nenhuma prova disponível no momento.', es: 'Ninguna prueba disponible en este momento.', en: 'No exam available at the moment.' }, l),
  secaoGramatica: (l: LangKey) => pick({ pt: 'Gramática', es: 'Gramática', en: 'Grammar' }, l),
  secaoLeitura: (l: LangKey) => pick({ pt: 'Compreensão de Leitura', es: 'Comprensión de Lectura', en: 'Reading Comprehension' }, l),
  secaoRedacao: (l: LangKey) => pick({ pt: 'Produção Escrita', es: 'Producción Escrita', en: 'Writing' }, l),
  continuar: (l: LangKey) => pick({ pt: 'Continuar', es: 'Continuar', en: 'Continue' }, l),
  enviarProva: (l: LangKey) => pick({ pt: 'Enviar Prova', es: 'Enviar Prueba', en: 'Submit Exam' }, l),
  palavras: (l: LangKey) => pick({ pt: 'palavras', es: 'palabras', en: 'words' }, l),
  minimoPalavras: (l: LangKey, n: number) => pick({ pt: `Escreva no mínimo ${n} palavras.`, es: `Escribe un mínimo de ${n} palabras.`, en: `Write at least ${n} words.` }, l),
  respondaTodas: (l: LangKey) => pick({ pt: 'Responda todas as questões antes de continuar.', es: 'Responde todas las preguntas antes de continuar.', en: 'Answer all questions before continuing.' }, l),
  corrigindo: (l: LangKey) => pick({ pt: 'Corrigindo sua prova...', es: 'Corrigiendo tu prueba...', en: 'Grading your exam...' }, l),

  aprovadoTitulo: (l: LangKey) => pick({ pt: 'Parabéns! Você foi aprovado!', es: '¡Felicidades! ¡Has sido aprobado!', en: 'Congratulations! You passed!' }, l),
  aprovadoTexto: (l: LangKey) => pick({
    pt: 'Você está apto para a prova oral. Um horário foi liberado na sua agenda para você marcar. Para agendar, clique em "Agendar", depois em "Agendar Aula", escolha o tipo de aula "Prova Oral", e selecione a data e o horário.',
    es: 'Estás apto para la prueba oral. Se ha habilitado un horario en tu agenda para que lo reserves. Para agendar, haz clic en "Agendar", luego en "Agendar Clase", elige el tipo de clase "Prueba Oral", y selecciona la fecha y la hora.',
    en: 'You are eligible for the oral exam. A time slot has been made available in your schedule. To book it, click "Schedule", then "Schedule Class", choose "Oral Exam" as the class type, and select the date and time.'
  }, l),
  reprovadoTitulo: (l: LangKey) => pick({ pt: 'Continue praticando!', es: '¡Sigue practicando!', en: 'Keep practicing!' }, l),
  reprovadoTexto: (l: LangKey) => pick({
    pt: 'Você ainda não atingiu a pontuação necessária. Recomendamos revisar os vídeos e materiais de leitura, e continuar praticando com os exercícios e aulas antes de tentar novamente.',
    es: 'Aún no has alcanzado la puntuación necesaria. Te recomendamos repasar los videos y materiales de lectura, y seguir practicando con los ejercicios y clases antes de intentarlo de nuevo.',
    en: 'You have not yet reached the required score. We recommend reviewing the videos and reading materials, and continuing to practice with exercises and classes before trying again.'
  }, l),
  suaNota: (l: LangKey) => pick({ pt: 'Sua nota final', es: 'Tu nota final', en: 'Your final score' }, l),
  voltarPortal: (l: LangKey) => pick({ pt: 'Voltar ao Portal', es: 'Volver al Portal', en: 'Back to Portal' }, l),
  verdadeiro: (l: LangKey) => pick({ pt: 'Verdadeiro', es: 'Verdadero', en: 'True' }, l),
  falso: (l: LangKey) => pick({ pt: 'Falso', es: 'Falso', en: 'False' }, l),
  digiteResposta: (l: LangKey) => pick({ pt: 'Digite sua resposta...', es: 'Escribe tu respuesta...', en: 'Type your answer...' }, l),
};

function useIdioma(): LangKey {
  const [lang, setLang] = useState<LangKey>('es');
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const salvo = (localStorage.getItem('haas_idioma') || '').toUpperCase();
    if (salvo === 'PT') setLang('pt');
    else if (salvo === 'EN') setLang('en');
    else setLang('es');
  }, []);
  return lang;
}

export default function ProvaEscritaPage() {
  const lang = useIdioma();
  const [fase, setFase] = useState<Fase>('CARREGANDO');
  const [prova, setProva] = useState<any>(null);
  const [respostasGram, setRespostasGram] = useState<Record<string, string>>({});
  const [respostasLeit, setRespostasLeit] = useState<Record<string, string>>({});
  const [textosRedacao, setTextosRedacao] = useState<Record<string, string>>({});
  const [resultado, setResultado] = useState<any>(null);
  const [erroValidacao, setErroValidacao] = useState('');

  useEffect(() => {
    async function carregar() {
      try {
        const urlParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
        const uidDaUrl = urlParams?.get("uid");
        const uid = uidDaUrl || (typeof window !== "undefined" && (localStorage.getItem("haas_user_id") || (window as any).activeUserId)) || undefined;
        if (!uid) { setFase('INDISPONIVEL'); return; }
        if (typeof window !== "undefined" && uidDaUrl) { localStorage.setItem("haas_user_id", uidDaUrl); }

        const { data: userRow } = await supabase
          .from('users')
          .select('exame_disponivel')
          .eq('id', uid)
          .maybeSingle();

        if (!userRow?.exame_disponivel) {
          setFase('INDISPONIVEL');
          return;
        }

        const { data, error } = await supabase.rpc('gerar_prova_escrita', { p_user_id: uid });
        if (error || !data || (!data.gramatica?.length && !data.leitura?.length)) {
          setFase('INDISPONIVEL');
          return;
        }
        setProva(data);
        setFase('GRAMATICA');
      } catch (e) {
        console.error('Erro ao carregar prova:', e);
        setFase('INDISPONIVEL');
      }
    }
    carregar();
  }, []);

  const avancarGramatica = () => {
    const todasRespondidas = prova.gramatica.every((q: any) => respostasGram[q.id]);
    if (!todasRespondidas) { setErroValidacao(T.respondaTodas(lang)); return; }
    setErroValidacao('');
    setFase('LEITURA');
  };

  const avancarLeitura = () => {
    const todasRespondidas = prova.leitura.every((q: any) => respostasLeit[q.id]);
    if (!todasRespondidas) { setErroValidacao(T.respondaTodas(lang)); return; }
    setErroValidacao('');
    setFase('REDACAO');
  };

  const contarPalavras = (txt: string) => txt.trim().split(/\s+/).filter(Boolean).length;

  const enviarProva = async () => {
    for (const r of (prova.redacoes || [])) {
      const texto = textosRedacao[r.id] || '';
      if (contarPalavras(texto) < r.min_words) {
        setErroValidacao(T.minimoPalavras(lang, r.min_words));
        return;
      }
    }
    setErroValidacao('');
    setFase('ENVIANDO');

    try {
      const uid = (typeof window !== "undefined" && (localStorage.getItem("haas_user_id") || (window as any).activeUserId)) || undefined;
      const arrayTextos = (prova.redacoes || []).map((r: any) => ({
        task_type: r.task_type,
        texto: textosRedacao[r.id] || '',
      }));
      const { data, error } = await supabase.rpc('corrigir_prova_escrita', {
        p_user_id: uid,
        p_respostas_gramatica: respostasGram,
        p_respostas_leitura: respostasLeit,
        p_textos_redacao: arrayTextos,
      });
      if (error) throw error;
      setResultado(data);
      setFase('RESULTADO');
    } catch (e) {
      console.error('Erro ao enviar prova:', e);
      setErroValidacao('Erro ao enviar. Tente novamente.');
      setFase('REDACAO');
    }
  };

  // ---------- RENDER ----------

  if (fase === 'CARREGANDO') {
    return (
      <div className="min-h-screen bg-[#030914] flex items-center justify-center gap-3 text-cyan-400">
        <Loader2 className="animate-spin" size={24} />
        <span className="font-mono text-sm">{T.carregando(lang)}</span>
      </div>
    );
  }

  if (fase === 'INDISPONIVEL') {
    return (
      <div className="min-h-screen bg-[#030914] flex flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-500">
          <CheckCircle2 size={28} />
        </div>
        <p className="text-slate-300 font-mono text-sm max-w-md">{T.indisponivel(lang)}</p>
        <a href="/portal-aluno" className="mt-4 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-mono font-black uppercase tracking-widest transition-all">
          {T.voltarPortal(lang)}
        </a>
      </div>
    );
  }

  if (fase === 'ENVIANDO') {
    return (
      <div className="min-h-screen bg-[#030914] flex items-center justify-center gap-3 text-violet-400">
        <Loader2 className="animate-spin" size={24} />
        <span className="font-mono text-sm">{T.corrigindo(lang)}</span>
      </div>
    );
  }

  if (fase === 'RESULTADO') {
    const aprovado = resultado?.status === 'aprovado';
    return (
      <div className="min-h-screen bg-[#030914] flex items-center justify-center p-4">
        <div className={`w-full max-w-xl bg-[#080C16]/90 border rounded-[24px] p-8 flex flex-col items-center text-center gap-5 shadow-2xl ${aprovado ? 'border-emerald-500/30' : 'border-slate-700'}`}>
          {aprovado ? (
            <CheckCircle2 size={48} className="text-emerald-400" />
          ) : (
            <XCircle size={48} className="text-amber-400" />
          )}
          <h1 className="text-xl font-black text-white uppercase tracking-wide">
            {aprovado ? T.aprovadoTitulo(lang) : T.reprovadoTitulo(lang)}
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            {aprovado ? T.aprovadoTexto(lang) : T.reprovadoTexto(lang)}
          </p>
          <div className="flex flex-col gap-1 bg-slate-900/60 border border-white/10 rounded-xl px-6 py-3">
            <span className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">{T.suaNota(lang)}</span>
            <span className={`text-3xl font-black ${aprovado ? 'text-emerald-400' : 'text-amber-400'}`}>
              {resultado?.nota_final_parcial}/10
            </span>
          </div>
          {aprovado && (
            <div className="flex items-center gap-2 text-violet-300 text-xs font-mono bg-violet-500/10 border border-violet-500/20 rounded-lg px-4 py-2">
              <Calendar size={14} />
              <span>{lang === 'pt' ? 'Verifique sua agenda!' : lang === 'en' ? 'Check your schedule!' : '¡Revisa tu agenda!'}</span>
            </div>
          )}
          <a href="/portal-aluno" className="mt-2 w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 text-white text-xs font-mono font-black uppercase tracking-widest transition-all text-center">
            {T.voltarPortal(lang)}
          </a>
        </div>
      </div>
    );
  }

  const fases: Fase[] = ['GRAMATICA', 'LEITURA', 'REDACAO'];
  const passoAtual = fases.indexOf(fase) + 1;

  return (
    <div className="min-h-screen bg-[#030914] py-8 px-4">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h1 className="text-white font-black text-lg">{T.titulo(lang)}</h1>
            <span className="text-[10px] font-mono text-slate-500">{passoAtual}/3</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-violet-500 to-cyan-400 h-full transition-all duration-500" style={{ width: `${(passoAtual / 3) * 100}%` }} />
          </div>
        </div>

        {fase === 'GRAMATICA' && (
          <div className="flex flex-col gap-4">
            <h2 className="text-cyan-400 font-mono text-xs font-bold uppercase tracking-widest">{T.secaoGramatica(lang)}</h2>
            {prova.gramatica.map((q: any, idx: number) => (
              <div key={q.id} className="bg-[#0a1424] border border-white/10 rounded-2xl p-5 flex flex-col gap-3">
                <p className="text-white text-sm font-medium">{idx + 1}. {q.question_text}</p>
                {q.question_type === 'lacuna' ? (
                  <input
                    type="text"
                    value={respostasGram[q.id] || ''}
                    onChange={(e) => setRespostasGram(prev => ({ ...prev, [q.id]: e.target.value }))}
                    placeholder={T.digiteResposta(lang)}
                    className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-cyan-400"
                  />
                ) : q.question_type === 'verdadeiro_falso' ? (
                  <div className="flex gap-2">
                    {[T.verdadeiro(lang), T.falso(lang)].map((opt, i) => {
                      const valor = i === 0 ? 'verdadeiro' : 'falso';
                      return (
                        <button
                          key={valor}
                          onClick={() => setRespostasGram(prev => ({ ...prev, [q.id]: valor }))}
                          className={`flex-1 px-4 py-2.5 rounded-xl border text-sm transition-all ${
                            respostasGram[q.id] === valor
                              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                              : 'bg-slate-900/50 border-white/10 text-slate-300 hover:border-white/30'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {q.options.map((opt: string) => (
                      <button
                        key={opt}
                        onClick={() => setRespostasGram(prev => ({ ...prev, [q.id]: opt }))}
                        className={`text-left px-4 py-2.5 rounded-xl border text-sm transition-all ${
                          respostasGram[q.id] === opt
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                            : 'bg-slate-900/50 border-white/10 text-slate-300 hover:border-white/30'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {erroValidacao && <p className="text-rose-400 text-xs font-mono">{erroValidacao}</p>}
            <button onClick={avancarGramatica} className="mt-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-mono font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
              {T.continuar(lang)} <ArrowRight size={14} />
            </button>
          </div>
        )}

        {fase === 'LEITURA' && (
          <div className="flex flex-col gap-4">
            <h2 className="text-cyan-400 font-mono text-xs font-bold uppercase tracking-widest">{T.secaoLeitura(lang)}</h2>
            {prova.leitura[0]?.reading_passage && (
              <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5">
                <p className="text-slate-200 text-sm leading-relaxed italic">"{prova.leitura[0].reading_passage}"</p>
              </div>
            )}
            {prova.leitura.map((q: any, idx: number) => (
              <div key={q.id} className="bg-[#0a1424] border border-white/10 rounded-2xl p-5 flex flex-col gap-3">
                <p className="text-white text-sm font-medium">{idx + 1}. {q.question_text}</p>
                {q.question_type === 'lacuna' ? (
                  <input
                    type="text"
                    value={respostasLeit[q.id] || ''}
                    onChange={(e) => setRespostasLeit(prev => ({ ...prev, [q.id]: e.target.value }))}
                    placeholder={T.digiteResposta(lang)}
                    className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-cyan-400"
                  />
                ) : q.question_type === 'verdadeiro_falso' ? (
                  <div className="flex gap-2">
                    {[T.verdadeiro(lang), T.falso(lang)].map((opt, i) => {
                      const valor = i === 0 ? 'verdadeiro' : 'falso';
                      return (
                        <button
                          key={valor}
                          onClick={() => setRespostasLeit(prev => ({ ...prev, [q.id]: valor }))}
                          className={`flex-1 px-4 py-2.5 rounded-xl border text-sm transition-all ${
                            respostasLeit[q.id] === valor
                              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                              : 'bg-slate-900/50 border-white/10 text-slate-300 hover:border-white/30'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {q.options.map((opt: string) => (
                      <button
                        key={opt}
                        onClick={() => setRespostasLeit(prev => ({ ...prev, [q.id]: opt }))}
                        className={`text-left px-4 py-2.5 rounded-xl border text-sm transition-all ${
                          respostasLeit[q.id] === opt
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                            : 'bg-slate-900/50 border-white/10 text-slate-300 hover:border-white/30'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {erroValidacao && <p className="text-rose-400 text-xs font-mono">{erroValidacao}</p>}
            <button onClick={avancarLeitura} className="mt-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-mono font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
              {T.continuar(lang)} <ArrowRight size={14} />
            </button>
          </div>
        )}

        {fase === 'REDACAO' && prova.redacoes && prova.redacoes.length > 0 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-cyan-400 font-mono text-xs font-bold uppercase tracking-widest">{T.secaoRedacao(lang)}</h2>
            {prova.redacoes.map((r: any, idx: number) => (
              <div key={r.id} className="bg-[#0a1424] border border-white/10 rounded-2xl p-5 flex flex-col gap-4">
                <p className="text-white text-sm font-medium">{idx + 1}. {r.prompt_text}</p>
                <textarea
                  value={textosRedacao[r.id] || ''}
                  onChange={(e) => setTextosRedacao(prev => ({ ...prev, [r.id]: e.target.value }))}
                  rows={r.task_type === 'curta' ? 5 : 10}
                  className="w-full bg-slate-900/60 border border-white/10 rounded-xl p-4 text-slate-100 text-sm resize-none focus:outline-none focus:border-violet-400"
                  placeholder="..."
                />
                <div className="flex justify-between text-[11px] font-mono text-slate-500">
                  <span>{contarPalavras(textosRedacao[r.id] || '')} / {r.min_words}-{r.max_words} {T.palavras(lang)}</span>
                </div>
              </div>
            ))}
            {erroValidacao && <p className="text-rose-400 text-xs font-mono">{erroValidacao}</p>}
            <button onClick={enviarProva} className="mt-2 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 text-white text-xs font-mono font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
              {T.enviarProva(lang)} <ArrowRight size={14} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
