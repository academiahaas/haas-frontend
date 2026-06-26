// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { GameLayout } from '@/app/components/GameLayout';

const SUPABASE_URL = 'https://jdppxfokfhqjudwfwckd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcHB4Zm9rZmhxanVkd2Z3Y2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5Mjk2NzgsImV4cCI6MjA5NTUwNTY3OH0.1zkCP7WUv1QJvWu35jQSRByFp-CSxD-Zfj6yKJysGIU';

export default function ArenaQuiz() {
  const { tag } = useParams();
  const router = useRouter();
  
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [sendingBatch, setSendingBatch] = useState(false);

  useEffect(() => {
    async function fetchQuizFromDB() {
      try {
        setLoading(true);
        const response = await axios.get(
          `${SUPABASE_URL}/rest/v1/tabela_quizzes?tema_tag=eq.${tag}&limit=1`,
          {
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
          }
        );

        if (response.data && response.data.length > 0) {
          setQuiz(response.data[0]);
        } else {
          setQuiz({
            tema_tag: tag,
            enunciado: `Review session for dynamic tag: "${tag}". Choose the grammatically precise alternative.`,
            opcoes: ['Option A', 'Option B', 'Option C', 'Option D'],
            opcao_correta: 'Option A',
            feedback_gps: 'Módulo de Contingência: Revise a estrutura mecânica formal da tag para evitar hibridismos.'
          });
        }
      } catch (err: any) {
        console.error('Erro ao conectar com tabela_quizzes:', err.message);
      } finally {
        setLoading(false);
      }
    }

    if (tag) fetchQuizFromDB();
  }, [tag]);

  const handleValidation = () => {
    if (!selectedOption) return;
    setIsCorrect(selectedOption === quiz.opcao_correta);
    setSubmitted(true);
  };

  const handleFinalize = async () => {
    setSendingBatch(true);
    try {
      await axios.post('/api/performance/ingest', {
        id_aluno: '123e4567-e89b-12d3-a456-426614174000',
        tag_erro: quiz.tema_tag,
        detalhe_desvio: isCorrect 
          ? `Sucesso na fixação assíncrona da tag ${quiz.tema_tag}.` 
          : `O aluno falhou no quiz selecionando "${selectedOption}" em vez de "${quiz.opcao_correta}".`,
        evidencia_contexto: `Arena Gamificada - Rota /quiz/${tag}`
      });
    } catch (err) {
      console.error('Erro ao transmitir telemetria:', err);
    } finally {
      setSendingBatch(false);
      router.refresh(); 
      router.push('/portal-aluno');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1724] flex flex-col items-center justify-center text-slate-400 font-sans gap-3">
        <Loader2 className="animate-spin text-orange-400 h-8 w-8" />
        <span className="text-xs font-mono uppercase">Cargando Misión Arena...</span>
      </div>
    );
  }

  return (
    <GameLayout tituloEjercicio={`Evaluación Dinámica de Enfo`} tipoTipo={String(tag).toUpperCase()}>
      
      <div className="max-w-2xl w-full mx-auto flex-1 flex flex-col justify-center gap-6 p-4">
        <div className="space-y-3">
          <span className="text-[10px] font-mono font-black tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20 uppercase inline-block">
            Target Activo: {quiz.tema_tag}
          </span>
          <h2 className="text-lg md:text-xl font-black text-white tracking-tight leading-relaxed uppercase">
            {quiz.enunciado}
          </h2>
        </div>

        <div className="grid gap-3">
          {quiz.opcoes.map((opcao: string) => {
            const isSelected = selectedOption === opcao;
            let btnStyle = 'bg-[#122538]/60 border-[#233744]/70 text-slate-300 hover:border-[#334e63]';
            
            if (isSelected) btnStyle = 'bg-[#1a3652] border-orange-500 text-orange-400 shadow-md';
            
            if (submitted) {
              if (opcao === quiz.opcao_correta) {
                btnStyle = '!border-emerald-500 bg-emerald-950/30 !text-emerald-400 shadow-lg';
              } else if (isSelected) {
                btnStyle = '!border-rose-500/60 bg-rose-950/30 !text-rose-400';
              }
            }

            return (
              <button
                key={opcao}
                disabled={submitted}
                onClick={() => setSelectedOption(opcao)}
                className={`w-full text-left p-4 rounded-xl border text-xs font-black uppercase transition-all duration-150 relative cursor-pointer ${btnStyle}`}
              >
                {opcao}
              </button>
            );
          })}
        </div>

        {!submitted && (
          <button
            disabled={!selectedOption}
            onClick={handleValidation}
            className={`w-full py-4 rounded-xl font-black text-xs tracking-widest uppercase transition-all shadow-xl cursor-pointer ${
              selectedOption 
                ? 'bg-orange-500 text-white border-b-4 border-orange-700' 
                : 'bg-[#122538] text-slate-500 cursor-not-allowed'
            }`}
          >
            Validar Respuesta en Sistema
          </button>
        )}
      </div>

      {submitted && (
        <div className={`fixed bottom-0 left-0 right-0 border-t p-6 z-50 ${
          isCorrect ? 'bg-[#0a241b] border-emerald-500/30 text-emerald-400' : 'bg-[#291118] border-rose-500/30 text-rose-400'
        }`}>
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider">
                {isCorrect ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}
                <span>{isCorrect ? 'Estructura Validada Exitosamente' : 'Desvío Lingüístico Detectado'}</span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
                {isCorrect ? 'Tu respuesta se alinea perfectamente con los parámetros de precisión del Marco Europeo.' : quiz.feedback_gps}
              </p>
            </div>

            <button
              disabled={sendingBatch}
              onClick={handleFinalize}
              className={`px-5 py-3 rounded-xl font-black text-xs tracking-wider uppercase flex items-center justify-center min-w-[140px] shrink-0 text-white border-b-4 ${
                isCorrect ? 'bg-emerald-600 border-emerald-800' : 'bg-rose-600 border-rose-800'
              }`}
            >
              {sendingBatch ? <Loader2 className="animate-spin h-3 w-3" /> : 'Finalizar Misión'}
            </button>
          </div>
        </div>
      )}

    </GameLayout>
  );
}
