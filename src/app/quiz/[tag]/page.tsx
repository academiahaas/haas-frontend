'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import axios from 'axios';

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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // MANHÃ DO DIA 3: Substituição de Mocks por Query Real no Supabase
  useEffect(() => {
    async function fetchQuizFromDB() {
      try {
        setLoading(true);
        // Busca um quiz correspondente à tag atual na tabela_quizzes
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
          // Fallback pedagógico caso a IA ainda não tenha gerado perguntas para essa tag específica
          setQuiz({
            tema_tag: tag,
            enunciado: `Review session for dynamic tag: "${tag}". Choose the grammatically precise alternative.`,
            opcoes: ['Option A', 'Option B', 'Option C', 'Option D'],
            opcao_correta: 'Option A',
            feedback_gps: 'Módulo de Contingência: Revise a estrutura mecânica formal da tag para evitar hibridismos com o portunhol corporativo.'
          });
        }
      } catch (err: any) {
        console.error('Erro ao conectar com tabela_quizzes:', err.message);
        setErrorMsg('Falha ao sincronizar com o banco de dados.');
      } finally {
        setLoading(false);
      }
    }

    if (tag) fetchQuizFromDB();
  }, [tag]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 font-sans gap-3">
        <Loader2 className="animate-spin text-emerald-400 h-8 w-8" />
        <span className="text-xs font-mono tracking-widest text-slate-500 uppercase">Sincronizando com a VPS Contabo...</span>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-rose-400 p-6 text-center">
        <AlertTriangle size={32} className="mb-2" />
        <p className="font-bold text-sm">{errorMsg}</p>
        <button onClick={() => router.push('/dashboard/learn')} className="mt-4 px-4 py-2 bg-slate-900 border border-slate-800 text-xs rounded-xl text-slate-300">Voltar para a Trilha</button>
      </div>
    );
  }

  const handleValidation = () => {
    if (!selectedOption) return;
    setIsCorrect(selectedOption === quiz.opcao_correta);
    setSubmitted(true);
  };

  // TARDE DO DIA 3: O Disparo Invisível em Background (POST)
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
      
      console.log('Métrica registrada na tabela de performance 360 (Peso 0.8).');
    } catch (err) {
      console.error('Erro ao transmitir telemetria em lote:', err);
    } finally {
      setSendingBatch(false);
      // Força a revalidação da árvore de nós ao retornar
      router.refresh(); 
      router.push('/dashboard/learn');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans antialiased">
      {/* Barra de progresso */}
      <header className="max-w-4xl w-full mx-auto px-6 pt-6 flex items-center gap-4 shrink-0">
        <button onClick={() => router.push('/dashboard/learn')} className="p-2 text-slate-500 hover:text-white rounded-xl bg-slate-900 border border-slate-800 transition">
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1 h-2 bg-slate-900 border border-slate-800/80 rounded-full overflow-hidden">
          <div className="w-4/5 h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500" />
        </div>
      </header>

      {/* Uma pergunta por tela */}
      <main className="max-w-2xl w-full mx-auto px-6 py-12 flex-1 flex flex-col justify-center gap-8 animate-fadeIn">
        <div className="space-y-2">
          <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
            Foco Ativo: {quiz.tema_tag}
          </span>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-relaxed">
            {quiz.enunciado}
          </h2>
        </div>

        {/* Botões com validação imediata */}
        <div className="grid gap-3">
          {quiz.opcoes.map((opcao: string) => {
            const isSelected = selectedOption === opcao;
            let btnStyle = 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700';
            
            if (isSelected) btnStyle = 'bg-slate-900 border-emerald-500 text-emerald-400 shadow-md shadow-emerald-500/5';
            
            if (submitted) {
              if (opcao === quiz.opcao_correta) {
                btnStyle = '!border-emerald-500 bg-emerald-950/20 !text-emerald-400 shadow-lg shadow-emerald-500/10';
              } else if (isSelected) {
                btnStyle = '!border-rose-500/60 bg-rose-950/20 !text-rose-400';
              }
            }

            return (
              <button
                key={opcao}
                disabled={submitted}
                onClick={() => setSelectedOption(opcao)}
                className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition duration-150 relative active:scale-[0.99] ${btnStyle}`}
              >
                {opcao}
                {isSelected && !submitted && <div className="absolute right-4 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-emerald-400" />}
              </button>
            );
          })}
        </div>

        {!submitted && (
          <button
            disabled={!selectedOption}
            onClick={handleValidation}
            className={`w-full py-4 rounded-xl font-black text-xs tracking-widest uppercase transition-all shadow-xl ${
              selectedOption 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-emerald-500/10 hover:scale-[1.01]' 
                : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
            }`}
          >
            VALIDAR RESPOSTA
          </button>
        )}
      </main>

      {/* Componente FeedbackGPS deslizante */}
      {submitted && (
        <div className={`w-full border-t p-6 md:p-8 log-panel animate-slideUp shrink-0 ${
          isCorrect ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400' : 'bg-rose-950/30 border-rose-500/30 text-rose-400'
        }`}>
          <div className="max-w-2xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2 text-sm font-black uppercase tracking-wider">
                {isCorrect ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                <span>{isCorrect ? 'Domínio Estrutural Confirmado' : 'Alerta de Portunhol Identificado'}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isCorrect ? 'Excelente precisão mecânica. O algoritmo de retenção recalibrou este nó para estável.' : quiz.feedback_gps}
              </p>
            </div>

            <button
              disabled={sendingBatch}
              onClick={handleFinalize}
              className={`px-6 py-3 rounded-xl font-bold text-xs tracking-wider uppercase flex items-center justify-center min-w-[140px] shrink-0 text-white border border-white/10 hover:bg-white/5 transition ${
                isCorrect ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'
              }`}
            >
              {sendingBatch ? <Loader2 className="animate-spin h-3 w-3" /> : 'Finalizar Treino'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}