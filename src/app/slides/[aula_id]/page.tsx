'use client';

import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const CORES = {
  roxo: '#4F35E2',
  azul: '#1E3A8A',
  turquesa: '#14C8B0',
  slate: '#334155',
  fundoCard: '#F8FAFC',
  borda: '#CBD5E1',
  roxoClaro: '#EDE9FE',
};

const LOGO_COMPLETO = 'https://jdppxfokfhqjudwfwckd.supabase.co/storage/v1/object/public/haas-academy/assignments/Melhorar%20Logo%20(4).png';
const FAVICON = 'https://jdppxfokfhqjudwfwckd.supabase.co/storage/v1/object/public/haas-academy/assignments/Melhorar%20Logo%20(3).png';

export default function SlidesAula() {
  const params = useParams();
  const aulaId = params?.aula_id as string;

  const [aula, setAula] = useState<any>(null);
  const [slides, setSlides] = useState<any[]>([]);
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  // Ferramentas de anotação
  const [modoDesenho, setModoDesenho] = useState(false);
  const [respostasAluno, setRespostasAluno] = useState<{ [key: number]: string }>({});
  const [resultados, setResultados] = useState<{ [key: number]: boolean }>({});
  const [caixasTexto, setCaixasTexto] = useState<{ [slideIdx: number]: { id: string; x: number; y: number; texto: string }[] }>({});
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const conteudoRef = useRef<HTMLDivElement>(null);
  const [escala, setEscala] = useState(1);
  const desenhandoRef = useRef(false);

  useEffect(() => {
    const carregar = async () => {
      const { data, error } = await supabase
        .from('aulas_disponiveis')
        .select('id, slides_conteudo, slides_expira_em, slides_status')
        .eq('id', aulaId)
        .maybeSingle();

      if (error || !data) {
        setErro('Aula não encontrada.');
        setCarregando(false);
        return;
      }

      if (data.slides_expira_em && new Date(data.slides_expira_em) < new Date()) {
        setErro('Este link de slides expirou.');
        setCarregando(false);
        return;
      }

      if (data.slides_status !== 'pronto' || !data.slides_conteudo) {
        setErro('Os slides desta aula ainda não foram gerados.');
        setCarregando(false);
        return;
      }

      setAula(data);
      setSlides(data.slides_conteudo.slides || []);
      setCarregando(false);
    };
    if (aulaId) carregar();
  }, [aulaId]);

  useLayoutEffect(() => {
    setEscala(1);

    const medirEAjustar = () => {
      if (!containerRef.current || !conteudoRef.current) return;
      const alturaDisponivel = containerRef.current.clientHeight;
      // Mede a altura NATURAL do conteúdo, sem nenhuma escala aplicada
      conteudoRef.current.style.transform = 'scale(1)';
      const alturaConteudoNatural = conteudoRef.current.scrollHeight;
      if (alturaConteudoNatural > alturaDisponivel && alturaDisponivel > 0) {
        const novaEscala = Math.max(0.4, (alturaDisponivel / alturaConteudoNatural) * 0.97);
        setEscala(novaEscala);
      } else {
        setEscala(1);
      }
    };

    // Espera 2 frames de animação (garante que o navegador já pintou o conteúdo real)
    let frame1: number, frame2: number;
    frame1 = requestAnimationFrame(() => {
      frame2 = requestAnimationFrame(medirEAjustar);
    });

    // Observador contínuo: se o tamanho da janela mudar, recalcula
    const observer = new ResizeObserver(() => {
      requestAnimationFrame(medirEAjustar);
    });
    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      cancelAnimationFrame(frame1);
      if (frame2) cancelAnimationFrame(frame2);
      observer.disconnect();
    };
  }, [indiceAtual, slides]);

  const irProximo = () => setIndiceAtual((i) => Math.min(slides.length - 1, i + 1));
  const irAnterior = () => setIndiceAtual((i) => Math.max(0, i - 1));

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') irProximo();
      if (e.key === 'ArrowLeft') irAnterior();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [slides.length]);

  const adicionarCaixaTexto = () => {
    const novaCaixa = { id: Date.now().toString(), x: 100, y: 100, texto: '' };
    setCaixasTexto((prev) => ({
      ...prev,
      [indiceAtual]: [...(prev[indiceAtual] || []), novaCaixa],
    }));
  };

  const removerCaixaTexto = (id: string) => {
    setCaixasTexto((prev) => ({
      ...prev,
      [indiceAtual]: (prev[indiceAtual] || []).filter((c) => c.id !== id),
    }));
  };

  const atualizarTextoCaixa = (id: string, texto: string) => {
    setCaixasTexto((prev) => ({
      ...prev,
      [indiceAtual]: (prev[indiceAtual] || []).map((c) => (c.id === id ? { ...c, texto } : c)),
    }));
  };

  const iniciarDesenho = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!modoDesenho) return;
    desenhandoRef.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx?.beginPath();
    ctx?.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const desenhar = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!modoDesenho || !desenhandoRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    if (ctx) {
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      ctx.stroke();
    }
  };

  const pararDesenho = () => {
    desenhandoRef.current = false;
  };

  const limparDesenho = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      limparDesenho();
    }
  }, [indiceAtual]);

  if (carregando) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFFFFF' }}>
        <p style={{ color: CORES.slate, fontFamily: 'sans-serif' }}>Carregando...</p>
      </div>
    );
  }

  if (erro) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FFFFFF', gap: 16 }}>
        <img src={FAVICON} alt="Haas" style={{ height: 48 }} />
        <p style={{ color: CORES.slate, fontFamily: 'sans-serif', fontSize: 16 }}>{erro}</p>
      </div>
    );
  }

  const slide = slides[indiceAtual];
  const ehPrimeiro = indiceAtual === 0;
  const ehUltimo = indiceAtual === slides.length - 1;

  const renderizarConteudoSlide = () => {
    switch (slide.tipo) {
      case 'capa':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, minHeight: '70vh', gap: 24, animation: 'fadeInUp 0.6s ease-out' }}>
            <img src={LOGO_COMPLETO} alt="Haas Language" style={{ height: 80 }} />
            <h1 style={{ fontSize: 42, fontWeight: 800, color: CORES.roxo, textAlign: 'center', margin: 0 }}>{slide.titulo}</h1>
            {slide.subtitulo && <p style={{ fontSize: 20, color: CORES.azul, fontWeight: 600, textAlign: 'center' }}>{slide.subtitulo}</p>}
          </div>
        );

      case 'presenca':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '40px 60px' }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: CORES.roxo }}>{slide.titulo}</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              {(slide.alunos || []).map((nome: string, i: number) => (
                <div key={i} style={{ background: CORES.roxoClaro, borderRadius: 12, padding: '12px 24px', fontSize: 18, fontWeight: 600, color: CORES.azul, animation: `fadeInUp 0.4s ease-out ${i * 0.08}s both` }}>
                  {nome}
                </div>
              ))}
            </div>
          </div>
        );

      case 'objetivos': {
        const listaObjetivos = slide.objetivos || slide.objetivos_lista || slide.conteudo || slide.lista_objetivos;
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '40px 60px' }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: CORES.roxo }}>{slide.titulo}</h2>
            {Array.isArray(listaObjetivos) ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {listaObjetivos.map((item: any, i: number) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, background: CORES.fundoCard, borderRadius: 14, padding: '14px 18px', animation: `fadeInUp 0.4s ease-out ${i * 0.1}s both` }}>
                    <span style={{ background: CORES.turquesa, color: '#FFFFFF', borderRadius: '50%', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: 17, color: CORES.slate }}>{typeof item === 'string' ? item : item.texto}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 18, color: CORES.slate, lineHeight: 1.6 }}>{listaObjetivos}</p>
            )}
          </div>
        );
      }

      case 'metodologia':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '40px 60px' }}>
            <h2 style={{ fontSize: 30, fontWeight: 800, color: CORES.roxo }}>{slide.titulo}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(slide.etapas || []).map((etapa: any, i: number) => (
                <div key={i} style={{ display: 'flex', gap: 14, background: CORES.fundoCard, border: `1px solid ${CORES.borda}`, borderRadius: 14, padding: 16, animation: `fadeInUp 0.4s ease-out ${i * 0.1}s both` }}>
                  <span style={{ background: CORES.roxo, color: '#FFFFFF', borderRadius: '50%', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, flexShrink: 0 }}>{i + 1}</span>
                  <div>
                    <p style={{ fontWeight: 800, color: CORES.roxo, fontSize: 16, margin: '0 0 4px 0' }}>{etapa.nome}</p>
                    <p style={{ fontSize: 14, color: CORES.slate, margin: 0, lineHeight: 1.5 }}>{etapa.descricao}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'exposicao':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '40px 60px' }}>
            <h2 style={{ fontSize: 30, fontWeight: 800, color: CORES.roxo }}>{slide.titulo}</h2>

            {typeof slide.conteudo === 'string' && (
              <p style={{ fontSize: 17, color: CORES.slate, lineHeight: 1.6 }}>{slide.conteudo}</p>
            )}

            {Array.isArray(slide.conteudo) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {slide.conteudo.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', background: CORES.fundoCard, borderRadius: 14, padding: '14px 18px', animation: `fadeInUp 0.4s ease-out ${i * 0.08}s both` }}>
                    <span style={{ background: `linear-gradient(135deg, ${CORES.roxo}, ${CORES.turquesa})`, color: '#FFFFFF', fontWeight: 800, borderRadius: 10, padding: '6px 12px', fontSize: 15, whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {typeof item === 'string' ? item : (item.frase || item.texto)}
                    </span>
                    {typeof item === 'object' && item.explicacao && (
                      <span style={{ fontSize: 15, color: CORES.slate, paddingTop: 4 }}>{item.explicacao}</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {Array.isArray(slide.exemplos) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                {slide.exemplos.map((ex, i) => (
                  <div key={i} style={{ background: CORES.roxoClaro, borderRadius: 10, padding: 12, fontSize: 15, color: CORES.azul, fontStyle: 'italic', animation: `fadeInUp 0.4s ease-out ${i * 0.1}s both` }}>
                    "{ex}"
                  </div>
                ))}
              </div>
            )}

            {slide.dica_pronuncia && (
              <div style={{ background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)', borderRadius: 12, padding: '12px 18px', fontSize: 14, color: '#92400E', fontWeight: 600 }}>
                🗣️ {slide.dica_pronuncia}
              </div>
            )}
          </div>
        );

      case 'sintese':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '40px 60px' }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: CORES.roxo }}>{slide.titulo}</h2>
            <p style={{ fontSize: 18, color: CORES.slate, lineHeight: 1.6 }}>{slide.conteudo}</p>
            {slide.sugestao_cultural && (
              <div style={{ background: CORES.roxoClaro, borderRadius: 12, padding: 16, fontSize: 15, color: CORES.azul, animation: 'fadeInUp 0.5s ease-out 0.2s both' }}>
                🎵 {slide.sugestao_cultural}
              </div>
            )}
          </div>
        );

      case 'encerramento':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '40px 60px', alignItems: 'center', textAlign: 'center' }}>
            <img src={LOGO_COMPLETO} alt="Haas Language" style={{ height: 60 }} />
            <h2 style={{ fontSize: 30, fontWeight: 800, color: CORES.roxo }}>{slide.titulo}</h2>
            {slide.resumo_aula && (
              <div style={{ background: CORES.fundoCard, border: `1px solid ${CORES.borda}`, borderRadius: 12, padding: 20, fontSize: 16, color: CORES.slate, maxWidth: 700, textAlign: 'left' }}>
                {slide.resumo_aula}
              </div>
            )}
            {slide.tarefa && <p style={{ fontSize: 15, color: CORES.azul, fontWeight: 600 }}>Tarefa: {slide.tarefa}</p>}
            {(slide.sugestao_musica || slide.sugestao_livro) && (
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
                {slide.sugestao_musica && (
                  <div style={{ background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)', borderRadius: 14, padding: '12px 20px', fontSize: 13, color: '#92400E', fontWeight: 700 }}>
                    🎵 {slide.sugestao_musica}
                  </div>
                )}
                {slide.sugestao_livro && (
                  <div style={{ background: 'linear-gradient(135deg, #DBEAFE, #BFDBFE)', borderRadius: 14, padding: '12px 20px', fontSize: 13, color: '#1E3A8A', fontWeight: 700 }}>
                    📖 {slide.sugestao_livro}
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'pratica': {
        const jaRespondeu = resultados[indiceAtual] !== undefined;
        const corretoAgora = resultados[indiceAtual];
        const verificarResposta = () => {
          const resp = (respostasAluno[indiceAtual] || '').trim().toLowerCase();
          const certa = (slide.resposta || '').trim().toLowerCase();
          setResultados((prev) => ({ ...prev, [indiceAtual]: resp === certa }));
        };
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '40px 60px', height: '100%', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ background: `linear-gradient(135deg, ${CORES.roxo}, ${CORES.turquesa})`, color: '#FFFFFF', borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 800, textTransform: 'uppercase' }}>{slide.tipo_exercicio || 'Exercício'}</span>
              {slide.nivel && <span style={{ fontSize: 12, fontWeight: 700, color: CORES.turquesa }}>{slide.nivel}</span>}
            </div>
            <div style={{ background: `linear-gradient(135deg, ${CORES.roxoClaro}, #FFFFFF)`, border: `2px solid ${CORES.roxo}22`, borderRadius: 20, padding: 32, animation: 'fadeInUp 0.5s ease-out', boxShadow: '0 8px 24px rgba(79,53,226,0.08)' }}>
              <p style={{ fontSize: 24, color: CORES.azul, fontWeight: 700, margin: 0, lineHeight: 1.5 }}>{slide.enunciado}</p>
              {Array.isArray(slide.opcoes) && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 20 }}>
                  {slide.opcoes.map((op: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => setRespostasAluno((prev) => ({ ...prev, [indiceAtual]: op }))}
                      style={{
                        padding: '10px 20px', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer',
                        border: `2px solid ${respostasAluno[indiceAtual] === op ? CORES.roxo : CORES.borda}`,
                        background: respostasAluno[indiceAtual] === op ? CORES.roxo : '#FFFFFF',
                        color: respostasAluno[indiceAtual] === op ? '#FFFFFF' : CORES.slate,
                      }}
                    >
                      {op}
                    </button>
                  ))}
                </div>
              )}
              {!Array.isArray(slide.opcoes) && slide.tipo_exercicio !== 'pronuncia' && (
                <input
                  type="text"
                  value={respostasAluno[indiceAtual] || ''}
                  onChange={(e) => setRespostasAluno((prev) => ({ ...prev, [indiceAtual]: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === 'Enter') verificarResposta(); }}
                  placeholder="Digite sua resposta e aperte Enter..."
                  style={{ marginTop: 20, width: '100%', padding: '12px 16px', fontSize: 18, borderRadius: 12, border: `2px solid ${CORES.borda}`, outline: 'none', color: CORES.slate }}
                />
              )}
              {slide.dica && (
                <p style={{ marginTop: 14, fontSize: 13, color: CORES.roxo, fontStyle: 'italic' }}>💡 Dica: {slide.dica}</p>
              )}
            </div>
            {slide.tipo_exercicio !== 'pronuncia' && !jaRespondeu && (
              <button
                onClick={verificarResposta}
                style={{
                  alignSelf: 'center', background: `linear-gradient(135deg, ${CORES.turquesa}, #0EA5A0)`, color: '#FFFFFF', border: 'none',
                  borderRadius: 999, padding: '16px 48px', fontSize: 17, fontWeight: 800, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 0.5,
                  boxShadow: '0 6px 0 #0A7A76, 0 8px 16px rgba(0,0,0,0.15)', transition: 'transform 0.1s',
                }}
                onMouseDown={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 0 #0A7A76'; }}
                onMouseUp={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 0 #0A7A76, 0 8px 16px rgba(0,0,0,0.15)'; }}
              >
                Validar Resposta
              </button>
            )}
            {slide.tipo_exercicio === 'pronuncia' && !jaRespondeu && (
              <button
                onClick={() => setResultados((prev) => ({ ...prev, [indiceAtual]: true }))}
                style={{ alignSelf: 'center', background: `linear-gradient(135deg, ${CORES.roxo}, #3B27B8)`, color: '#FFFFFF', border: 'none', borderRadius: 999, padding: '16px 48px', fontSize: 17, fontWeight: 800, cursor: 'pointer', boxShadow: '0 6px 0 #2E1F8C, 0 8px 16px rgba(0,0,0,0.15)' }}
              >
                ✓ Já Praticamos
              </button>
            )}
          </div>
        );
      }

      case 'fala':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '40px 60px', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ background: `linear-gradient(135deg, ${CORES.roxo}, #8B5CF6)`, color: '#FFFFFF', borderRadius: 20, padding: '4px 16px', fontSize: 12, fontWeight: 800, textTransform: 'uppercase' }}>💬 Fala</span>
            </div>
            <div style={{ background: `linear-gradient(135deg, ${CORES.roxo}, #6D28D9)`, borderRadius: 24, padding: 36, animation: 'fadeInUp 0.5s ease-out', boxShadow: '0 12px 32px rgba(79,53,226,0.25)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
              <p style={{ fontSize: 26, color: '#FFFFFF', fontWeight: 800, margin: 0, lineHeight: 1.4 }}>{slide.pergunta}</p>
              {(() => {
                const dicas = Array.isArray(slide.subprompts) ? slide.subprompts : (slide.dica_conversa ? [slide.dica_conversa] : (slide.contexto ? [slide.contexto] : []));
                return dicas.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
                    {dicas.map((sp: string, i: number) => (
                      <div key={i} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: '8px 14px' }}>
                        <span style={{ fontSize: 14, color: '#FFFFFF' }}>{sp}</span>
                      </div>
                    ))}
                  </div>
                ) : null;
              })()}
            </div>
            {/* Espaço fixo de correção/anotação */}
            <div style={{ flex: 1, border: `2px dashed ${CORES.borda}`, borderRadius: 12, padding: 16, minHeight: 140, position: 'relative' }}>
              <span style={{ position: 'absolute', top: 8, left: 12, fontSize: 10, color: CORES.borda, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Espaço de anotação</span>
              <textarea
                placeholder="Anote aqui a resposta do aluno..."
                style={{ width: '100%', height: '100%', border: 'none', outline: 'none', resize: 'none', fontSize: 15, color: CORES.slate, background: 'transparent', paddingTop: 18, fontFamily: 'inherit' }}
              />
            </div>
          </div>
        );

      case 'escrita':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '40px 60px', height: '100%' }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: CORES.roxo }}>{slide.titulo}</h2>
            {slide.atividade_escrita && (
              <div style={{ background: `linear-gradient(135deg, ${CORES.roxoClaro}, #FFFFFF)`, border: `2px solid ${CORES.roxo}33`, borderRadius: 16, padding: 20 }}>
                <p style={{ fontWeight: 800, color: CORES.azul, fontSize: 18, margin: '0 0 8px 0' }}>✍️ Atividade:</p>
                <p style={{ fontSize: 16, color: CORES.slate, margin: 0 }}>{slide.atividade_escrita}</p>
              </div>
            )}
            <p style={{ fontSize: 15, color: CORES.slate }}>{slide.conteudo}</p>
            {/* Espaço fixo de correção/anotação */}
            <div style={{ flex: 1, border: `2px dashed ${CORES.borda}`, borderRadius: 12, padding: 16, minHeight: 160, position: 'relative' }}>
              <span style={{ position: 'absolute', top: 8, left: 12, fontSize: 10, color: CORES.borda, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Espaço de correção</span>
              <textarea
                placeholder="Escreva aqui a correção..."
                style={{ width: '100%', height: '100%', border: 'none', outline: 'none', resize: 'none', fontSize: 15, color: CORES.slate, background: 'transparent', paddingTop: 18, fontFamily: 'inherit' }}
              />
            </div>
            <div style={{ background: CORES.roxoClaro, borderRadius: 10, padding: '10px 16px', fontSize: 13, color: CORES.roxo, fontWeight: 700 }}>
              📝 Recomendado para esta aula: Prática de Escrita.
            </div>
            {slide.texto_explicativo && <p style={{ fontSize: 12, color: CORES.slate, fontStyle: 'italic' }}>{slide.texto_explicativo}</p>}
          </div>
        );

      case 'recapitulacao':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '40px 60px' }}>
            <h2 style={{ fontSize: 30, fontWeight: 800, color: CORES.roxo }}>{slide.titulo}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {(slide.cards || []).map((c: any, i: number) => (
                <div key={i} style={{ background: `linear-gradient(135deg, ${CORES.roxoClaro}, #FFFFFF)`, border: `2px solid ${CORES.turquesa}33`, borderRadius: 16, padding: 18, animation: `fadeInUp 0.4s ease-out ${i * 0.1}s both` }}>
                  <p style={{ fontWeight: 800, color: CORES.azul, fontSize: 16, margin: '0 0 8px 0' }}>{c.regra}</p>
                  <p style={{ fontSize: 14, color: CORES.slate, fontStyle: 'italic', margin: 0 }}>"{c.exemplo}"</p>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div style={{ padding: 40 }}>
            <h2 style={{ color: CORES.roxo }}>{slide.titulo}</h2>
            <p style={{ color: CORES.slate }}>{JSON.stringify(slide, null, 2)}</p>
          </div>
        );
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #F5F3FF 0%, #ECFEFF 100%)', fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>

      {/* Barra lateral roxa */}
      <div style={{ position: 'fixed', left: 0, top: 0, bottom: 0, width: 6, background: CORES.roxo }} />

      {/* Logo pequeno / favicon no topo, exceto na capa (que já tem logo grande) e no encerramento */}
      {!ehPrimeiro && !ehUltimo && (
        <img src={FAVICON} alt="Haas" style={{ position: 'absolute', top: 20, left: 30, height: 32 }} />
      )}

      {/* Círculo decorativo turquesa */}
      <div style={{ position: 'absolute', top: 24, right: 30, width: 16, height: 16, borderRadius: '50%', background: CORES.turquesa }} />

      {/* Conteúdo do slide — encolhe automaticamente pra sempre caber, sem barra de rolagem */}
      <div ref={containerRef} style={{ flex: 1, overflow: 'hidden', paddingTop: 60, paddingBottom: 70, position: 'relative', maxHeight: 'calc(100vh - 40px)' }}>
        <div
          key={indiceAtual}
          ref={conteudoRef}
          style={{ display: 'flex', flexDirection: 'column', transform: `scale(${escala})`, transformOrigin: 'top center', width: `${100 / escala}%`, position: 'absolute', left: '50%', marginLeft: `-${50 / escala}%` }}
        >
          {renderizarConteudoSlide()}
        </div>
      </div>

      {/* Faixa de feedback estilo Duolingo, sobrepõe o rodapé quando ativa */}
      {slide?.tipo === 'pratica' && resultados[indiceAtual] !== undefined && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, minHeight: 90, zIndex: 30,
          background: resultados[indiceAtual] ? 'linear-gradient(180deg, #ECFDF5, #A7F3D0)' : 'linear-gradient(180deg, #FEF2F2, #FECACA)',
          borderTop: `3px solid ${resultados[indiceAtual] ? '#22C55E' : '#EF4444'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 40px',
          animation: 'slideUp 0.3s ease-out',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 32 }}>{resultados[indiceAtual] ? '✅' : '❌'}</span>
            <div>
              <p style={{ margin: 0, fontWeight: 800, fontSize: 17, color: resultados[indiceAtual] ? '#166534' : '#991B1B' }}>
                {resultados[indiceAtual] ? 'Muito bem!' : 'Quase lá!'}
              </p>
              <p style={{ margin: 0, fontSize: 14, color: resultados[indiceAtual] ? '#166534' : '#991B1B' }}>
                {resultados[indiceAtual] ? (slide.explicacao || 'Resposta correta.') : `Resposta certa: "${slide.resposta}". ${slide.explicacao || ''}`}
              </p>
            </div>
          </div>
          <button
            onClick={() => { setResultados((prev) => { const novo = { ...prev }; delete novo[indiceAtual]; return novo; }); irProximo(); }}
            style={{
              background: resultados[indiceAtual] ? '#22C55E' : '#EF4444', color: '#FFFFFF', border: 'none', borderRadius: 12,
              padding: '12px 32px', fontSize: 15, fontWeight: 800, cursor: 'pointer', textTransform: 'uppercase',
            }}
          >
            Continuar
          </button>
        </div>
      )}

      {/* Rodapé roxo com contador */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 40, background: CORES.roxo, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', zIndex: 5 }}>
        <span style={{ color: '#FFFFFF', fontSize: 12, letterSpacing: 0.5 }}>HAAS LANGUAGE <span style={{ opacity: 0.7 }}>• HIGH-LEVEL EDUCATION</span></span>
        <span style={{ color: '#FFFFFF', fontSize: 12, fontWeight: 700 }}>{indiceAtual + 1} / {slides.length}</span>
      </div>

      {/* Navegação */}
      <button onClick={irAnterior} disabled={ehPrimeiro} style={{ position: 'fixed', left: 20, top: '50%', transform: 'translateY(-50%)', background: '#FFFFFF', border: `1px solid ${CORES.borda}`, borderRadius: '50%', width: 44, height: 44, cursor: 'pointer', opacity: ehPrimeiro ? 0.3 : 1, fontSize: 18, color: CORES.roxo, zIndex: 10 }}>
        ◀
      </button>
      <button onClick={irProximo} disabled={ehUltimo} style={{ position: 'fixed', right: 20, top: '50%', transform: 'translateY(-50%)', background: '#FFFFFF', border: `1px solid ${CORES.borda}`, borderRadius: '50%', width: 44, height: 44, cursor: 'pointer', opacity: ehUltimo ? 0.3 : 1, fontSize: 18, color: CORES.roxo, zIndex: 10 }}>
        ▶
      </button>

      {/* Canvas de desenho (lápis) — por cima de tudo, mas só captura clique quando ativo */}
      <canvas
        ref={canvasRef}
        onMouseDown={iniciarDesenho}
        onMouseMove={desenhar}
        onMouseUp={pararDesenho}
        onMouseLeave={pararDesenho}
        style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: modoDesenho ? 20 : -1, pointerEvents: modoDesenho ? 'auto' : 'none', cursor: modoDesenho ? 'crosshair' : 'default' }}
      />

      {/* Caixas de texto livres */}
      {(caixasTexto[indiceAtual] || []).map((caixa) => (
        <div key={caixa.id} style={{ position: 'fixed', left: caixa.x, top: caixa.y, zIndex: 15, background: '#FFFDE7', border: '1px solid #FBC02D', borderRadius: 8, padding: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', minWidth: 160 }}>
          <button onClick={() => removerCaixaTexto(caixa.id)} style={{ position: 'absolute', top: -8, right: -8, background: '#EF4444', color: '#FFFFFF', border: 'none', borderRadius: '50%', width: 18, height: 18, fontSize: 10, cursor: 'pointer', lineHeight: 1 }}>✕</button>
          <textarea
            value={caixa.texto}
            onChange={(e) => atualizarTextoCaixa(caixa.id, e.target.value)}
            placeholder="Escreva aqui..."
            style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: '#78350F', resize: 'both', minWidth: 140, minHeight: 50, fontFamily: 'inherit' }}
          />
        </div>
      ))}

      {/* Barra de ferramentas flutuante */}
      <div style={{ position: 'fixed', top: 20, right: 60, display: 'flex', gap: 8, zIndex: 25 }}>
        <button
          onClick={() => setModoDesenho((v) => !v)}
          title="Lápis para marcar"
          style={{ width: 40, height: 40, borderRadius: '50%', border: `2px solid ${modoDesenho ? CORES.roxo : CORES.borda}`, background: modoDesenho ? CORES.roxo : '#FFFFFF', color: modoDesenho ? '#FFFFFF' : CORES.slate, fontSize: 16, cursor: 'pointer' }}
        >
          ✏️
        </button>
        {modoDesenho && (
          <button onClick={limparDesenho} title="Limpar marcações" style={{ width: 40, height: 40, borderRadius: '50%', border: `2px solid ${CORES.borda}`, background: '#FFFFFF', color: CORES.slate, fontSize: 14, cursor: 'pointer' }}>
            🧹
          </button>
        )}
        <button
          onClick={adicionarCaixaTexto}
          title="Adicionar caixa de texto"
          style={{ width: 40, height: 40, borderRadius: '50%', border: `2px solid ${CORES.borda}`, background: '#FFFFFF', color: CORES.slate, fontSize: 16, cursor: 'pointer' }}
        >
          🗒️
        </button>
      </div>
    </div>
  );
}
