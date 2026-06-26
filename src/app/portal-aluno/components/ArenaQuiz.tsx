"use client";
import React, { useState, useEffect, useRef } from 'react';
import { translations } from '../idiomas';
import { Mic, ArrowUp, Flame, Target, Award, Zap, Bot, Video, BookOpen, X, AlertCircle, Star, Trophy, CheckCircle2, TrendingUp, Gift, Sparkles } from 'lucide-react';

import MioloMultiplaEscolha from './exercise-types/MioloMultiplaEscolha';
import MioloCacaErro from './exercise-types/MioloCacaErro';
import MioloBlitzChallenge from './exercise-types/MioloBlitzChallenge';
import DitadoLacunas from './exercise-types/DitadoLacunas';
import MioloBlocos from './exercise-types/MioloBlocos';
import MioloLeituraRapida from './exercise-types/MioloLeituraRapida';
import MioloOrdenacao from './exercise-types/MioloOrdenacao';
import MioloReordenacaoParagrafos from './exercise-types/MioloReordenacaoParagrafos';
import MioloRoleplay from './exercise-types/MioloRoleplay';
import MioloShadowing from './exercise-types/MioloShadowing';
import MioloSpellingBee from './exercise-types/MioloSpellingBee';
import MioloTraducaoInversa from './exercise-types/MioloTraducaoInversa';
import MioloVelocidadeProgressiva from './exercise-types/MioloVelocidadeProgressiva';

interface ArenaProps {
  isOpen?: boolean;
  onClose?: () => void;
  userId?: string;
  idiomaAtivo?: string;
}

export default function ArenaQuiz({ isOpen, onClose, userId, idiomaAtivo, onAbrirPedagogo }: ArenaProps & { onAbrirPedagogo?: (tipo: "TEXTO" | "VIDEO") => void }) {
  // Lê prioritariamente o idioma passado pelo pai, senão busca o padrão de segurança
  const currentLang = (idiomaAtivo || (typeof window !== 'undefined' ? localStorage.getItem('language') || localStorage.getItem('lang') || 'PT' : 'PT')).toUpperCase();


    const arenaDict = {
    PT: {
      mentorName: "⚛︎ MENTORA HAAS",

      precisionLabel: "PRECISÃO",
      mentorFire: "Seu cérebro está em chamas! Você ativou um multiplicador de sequência. Mantenha o foco absoluto!",
      chatPlaceholder: "Tire suas dúvidas aqui...",
      unit: "UNIDADE",
      stage: "ETAPA",
      of: "DE",
      close: "✕ ENCERRAR SESSÃO",
      skip: "IGNORAR ETAPA ➔",
      validate: "SUBMETER",
      next: "PROSSEGUIR",
      ask: "Perguntar",
      guide: "Diretrizes Textuais",
      media: "Conteúdo Audiovisual"
    },
    EN: {
      mentorName: "⚛︎ HAAS MENTOR",

      precisionLabel: "PRECISION",
      mentorFire: "Your brain is on fire! You activated a streak multiplier. Keep absolute focus!",
      chatPlaceholder: "Ask your questions here...",
      unit: "UNIT",
      stage: "STAGE",
      of: "OF",
      close: "✕ CLOSE ARENA",
      skip: "SKIP STEP ➔",
      validate: "SUBMIT",
      next: "PROCEED",
      ask: "Ask",
      guide: "Textual Rules Guide"
    },
    ES: {
      mentorName: "⚛︎ MENTORA HAAS",

      precisionLabel: "PRECISIÓN",
      mentorFire: "¡Tu cerebro está en llamas! Activaste un multiplicador de racha. ¡Mantén el enfoque absoluto!",
      chatPlaceholder: "Resuelva sus dudas aquí...",
      unit: "UNIDAD",
      stage: "ETAPA",
      of: "DE",
      close: "✕ CERRAR ARENA",
      skip: "SALTAR ETAPA ➔",
      validate: "SUBMETER",
      next: "PRÓXIMA MISIÓN ➔",
      ask: "Preguntar",
      guide: "Guía de Norma Textual",
      media: "Contenido Audiovisual"
    }
  };

  const tArena = arenaDict[currentLang] || arenaDict.PT;

  const [jogoSelecionado, setJogoSelecionado] = useState('paragrafos');
  const [menuDevAberto, setMenuDevAberto] = useState(false);
  
  const [streak, setStreak] = useState(3);
  const [precision, setPrecision] = useState(94);
  const [xpAcumulado, setXpAcumulado] = useState(150);

      // 🎵 Feedback Sonoro Sintetizado Nativo (Sem arquivos externos, estável e elegante)
  // @ts-ignore
  const tocarSom = (tipo) => { if (typeof window !== 'undefined' && (window).tocarSomNativoPremium) { (window).tocarSomNativoPremium(tipo); } };
  const [gameStatus, setGameStatus] = useState<'IDLE' | 'CORRECT' | 'WRONG'>('IDLE');
  const [isCollectingReward, setIsCollectingReward] = useState(false);
  const [comboQuebrado, setComboQuebrado] = useState(false);
  const [caixaAberta, setCaixaAberta] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const silenceTimeoutRef = useRef<any>(null);
  const [audioChunksRef] = [useRef<Blob[]>([])]; // marcador existente

  const toggleVoiceRecording = async () => {
    if (isRecording) {
      stopVoiceRecording();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (audioBlob.size < 1000) return;
        
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result?.toString().split(',')[1];
          if (!base64Audio) return;
          perguntarAoMentor(null, base64Audio);
        };
        stream.getTracks().forEach(track => track.stop());
      };

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const checkSilence = () => {
        if (!mediaRecorderRef.current || mediaRecorder.state !== 'recording') return;
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
        const average = sum / bufferLength;

        if (average < 10) {
          if (!silenceTimeoutRef.current) {
            silenceTimeoutRef.current = setTimeout(() => {
              stopVoiceRecording();
            }, 1500);
          }
        } else {
          if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
            silenceTimeoutRef.current = null;
          }
        }
        if (mediaRecorder.state === 'recording') {
          requestAnimationFrame(checkSilence);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      requestAnimationFrame(checkSilence);
    } catch (err) {
      console.error("Erro ao acessar microfone", err);
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    setIsRecording(false);
  };
  const [respostaIA, setRespostaIA] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingTime, setThinkingTime] = useState(0);
  const [msgEscritaAleatoria, setMsgEscritaAleatoria] = useState("");
  const [tipoEnvio, setTipoEnvio] = useState("");
  useEffect(() => {
    let interval;
    if (isThinking) {
      setThinkingTime(0);
      const frasesEscrita = [
        "Analisando sua mensagem...",
        "Processando o texto enviado...",
        "Buscando a melhor resposta pedagógica...",
        "Ajustando os tópicos da explicação...",
        "Validando a estrutura da sua dúvida..."
      ];
      
      // Primeiro sorteio imediato para não começar vazio
      const inicial = Math.floor(Math.random() * frasesEscrita.length);
      setMsgEscritaAleatoria(frasesEscrita[inicial]);
      
      interval = setInterval(() => {
        setThinkingTime(prev => {
          const nextTime = prev + 1;
          // A cada 3 segundos, rotaciona e sorteia uma nova frase escrita da lista
          if (nextTime % 3 === 0) {
            const novoIndice = Math.floor(Math.random() * frasesEscrita.length);
            setMsgEscritaAleatoria(frasesEscrita[novoIndice]);
          }
          return nextTime;
        });
      }, 1000);
    } else {
      setThinkingTime(0);
    }
    return () => clearInterval(interval);
  }, [isThinking]);

  const getThinkingMessage = () => {
    // Listas organizadas por blocos de 2 segundos (20 frases neutras cada)
    const blocos = [
      [
        "Arquivo de voz recebido com sucesso, iniciando análise.",
        "Áudio carregado, a começar o processamento da mensagem.",
        "Registo de voz identificado, a abrir os canais de transcrição.",
        "Sinal de áudio estável, a iniciar a interpretação do conteúdo.",
        "Mensagem de voz recebida, a começar o mapeamento linguístico.",
        "Leitura do arquivo de áudio iniciada pela central pedagógica.",
        "Áudio capturado com precisão, a iniciar a fase de escuta.",
        "Registo sonoro validado, a preparar a interpretação textual.",
        "Arquivo de voz integrado ao sistema, a abrir os descritores.",
        "Input de áudio detetado, a inicializar os motores de escuta.",
        "Dados fonéticos recebidos, a iniciar o diagnóstico do áudio.",
        "Áudio processado com sucesso, a abrir a esteira de análise.",
        "Mensagem falada em processamento na fila de interpretação.",
        "Ficheiro de voz carregado para a central de inteligência.",
        "Captura de voz concluída, a iniciar a leitura sintática.",
        "Recepção de áudio confirmada, a abrir os módulos de resposta.",
        "Ficheiro de áudio lido com sucesso, a iniciar o escaneamento.",
        "Sinal acústico validado, a avançar para a triagem lógica.",
        "Mensagem de áudio recebida, a estabelecer conexão de dados.",
        "Transmissão de voz concluída, a dar início ao processamento."
      ],
      [
        "Convertendo as frequências sonoras in dados de texto puro.",
        "Transcrevendo a mensagem falada para análise de contexto.",
        "Transformando as ondas de voz em caracteres linguísticos.",
        "Mapeando os fonemas para reconstrução textual da dúvida.",
        "Executando a transcrição automática do conteúdo recebido.",
        "Descodificando os sinais de áudio em frases estruturadas.",
        "Traduzindo a locução recebida para a interface de leitura.",
        "Processando o motor de reconhecimento de voz para texto.",
        "Transcrevendo os segmentos falados com foco pedagógico.",
        "Alinhando o áudio capturado com o dicionário de dados.",
        "Analisando as curvas de voz para identificação de termos.",
        "Conversão fonética em andamento na base de dados.",
        "Extraindo o texto contido no arquivo de voz enviado.",
        "Reconstruindo a estrutura da fala em formato escrito.",
        "Interpretando os padrões de voz para extração textual.",
        "Processamento de fala para texto iniciado com segurança.",
        "Mapeando a acentuação e entonação da mensagem falada.",
        "Convertendo o fluxo vocal em blocos de leitura lógica.",
        "Transcrição avançada ativa para mapear o conteúdo.",
        "Finalizando a conversão dos dados de áudio em texto."
      ],
      [
        "Analisando as regras gramaticais aplicadas na dúvida.",
        "Avaliando a estrutura sintática da mensagem enviada.",
        "Verificando a concordância e a regência do conteúdo.",
        "Mapeando os conectores lógicos e tempos verbais utilizados.",
        "Examinando a construção das orações no texto transcrito.",
        "Validando a coherence gramatical da estrutura linguística.",
        "Escaneando o vocabulário técnico utilizado no exercício.",
        "Analisando a coesão textual da mensagem enviada.",
        "Verificando a aplicação prática das regras do idioma.",
        "Mapeando os elementos estruturais da frase avaliada.",
        "Avaliando os padrões morfológicos da dúvida enviada.",
        "Conferindo os parâmetros sintáticos essenciais do módulo.",
        "Analisando a colocação pronominal e regência verbal.",
        "Estudando a articulação das palavras na frase falada.",
        "Verificando o alinhamento com a norma culta do idioma.",
        "Avaliando o encadeamento lógico das ideias apresentadas.",
        "Processando os filtros de validação sintática da língua.",
        "Analisando as variantes estruturais aplicadas no áudio.",
        "Examinando a microestrutura e precisão do vocabulário.",
        "Concluindo a auditoria gramatical do texto gerado."
      ],
      [
        "Buscando referências na base de dados pedagógica.",
        "Localizando os melhores exemplos didáticos para o caso.",
        "Consultando os manuais estruturais de ensino do idioma.",
        "Procurando analogias práticas para facilitar a explicação.",
        "Cruzando dados com as diretrizes de aprendizagem ativa.",
        "Identificando os principais pontos de atenção pedagógica.",
        "Buscando exceções e regras complementares na biblioteca.",
        "Acedendo ao repositório de soluções estruturais do curso.",
        "Mapeando exemplos do quotidiano para enriquecer a resposta.",
        "Selecionando materiais de apoio teórico para a dúvida.",
        "Consultando o histórico de padrões de aprendizagem.",
        "Filtrando as melhores abordagens de ensino para o nível.",
        "Resgatando notas explicativas na central de gramática.",
        "Buscando fundamentação teórica para a resposta final.",
        "Cruzando a dúvida com os tópicos da unidade atual.",
        "Localizando dados complementares na matriz curricular.",
        "Procurando a forma mais clara e direta de explicar a regra.",
        "Extraindo modelos de aplicação prática do banco de dados.",
        "Analisando respostas padrão para otimização do conteúdo.",
        "Reunindo todas as referências de ensino necessárias."
      ],
      [
        "Estruturando a explicação lógica passo a passo.",
        "Organizando os tópicos de correção de forma didática.",
        "Formatando o texto de resposta para facilitar a leitura.",
        "Alinhando a devolutiva com foco no progresso contínuo.",
        "Redigindo os apontamentos teóricos sobre o exercício.",
        "Construindo o raciocínio central da resposta explicativa.",
        "Ajustando a clareza e a objetividade dos parágrafos.",
        "Montando o esquema de correção para exibição em tela.",
        "Ordenando os argumentos pedagógicos para a resposta.",
        "Sintetizando as regras explicadas de forma simplificada.",
        "Desenvolvendo os comentários sobre os acertos e desvios.",
        "Estruturando as orientações de estudo para esta unidade.",
        "Formatando o feedback com base na metodologia de ensino.",
        "Ajustando a linguagem para manter o foco na evolução.",
        "Consolidando os blocos de texto da resposta principal.",
        "Preparando o resumo prático das regras que foram vistas.",
        "Organizando a sequência de leitura para o perfil.",
        "Refinando os detalhes textuais da correção pedagógica.",
        "Agrupando as dicas de fixação do conteúdo na resposta.",
        "Finalizando a redação da análise de texto no sistema."
      ],
      [
        "Iniciando o desenvolvimento do parecer linguístico detalhado.",
        "Detalhando as nuances da pronúncia e entonação observadas.",
        "Mapeando correlações avançadas entre os tempos verbais.",
        "Compilando observações práticas sobre a fluidez da fala.",
        "Analisando os marcadores de discurso presentes na locução.",
        "Verificando a aplicação de expressões idiomáticas no áudio.",
        "Cruzando dados linguísticos para uma correção aprofundada.",
        "Avaliando a construção do pensamento crítico no idioma.",
        "Formatando exemplos extras para consolidar o aprendizado.",
        "Isolando os pontos que necessitam de maior fixação teórica.",
        "Refinando os conceitos de semântica aplicados no exercício.",
        "Elaborando um roteiro personalizado para esclarecimento rápido.",
        "Analisando a flexibilidade do vocabulário dentro da temática.",
        "Construindo pontes conceituais para simplificar a regra.",
        "Revisando a densidade da resposta técnica elaborada.",
        "Mapeando tendências de desempenho nos pontos gramaticais.",
        "Preparando anotações sobre a estrutura das frases complexas.",
        "Verificando o nível de precisão vocabular na resposta.",
        "Ajustando o nível de complexidade da resposta ao módulo.",
        "Salvando as diretrizes de progresso na ficha de desempenho."
      ],
      [
        "Iniciando a revisão final da resposta gerada pelo sistema.",
        "Verificando se a explicação atende aos critérios de clareza.",
        "Auditando o conteúdo técnico para garantir total precisão.",
        "Validando se todos os pontos da dúvida foram respondidos.",
        "Checando a consistência metodológica do feedback criado.",
        "Garantindo que a linguagem permaneça focada no aprendizado.",
        "Correlacionando os desvios com os materiais de apoio.",
        "Verificando a fluidez textual dos parágrafos explicativos.",
        "Confirmando a exatidão das regras gramaticais citadas.",
        "Refinando a abordagem didática para evitar ambiguidades.",
        "Assegurando que a explicação seja o mais direta possível.",
        "Cruzando a resposta com possíveis dúvidas secundárias.",
        "Conferindo os parâmetros de qualidade do retorno pedagógico.",
        "Analisando o equilíbrio entre teoria e exemplos práticos.",
        "Validando as notas de rodapé e referências de consulta.",
        "Monitorando a coesão gramatical de ponta a ponta na tela.",
        "Ajustando os termos técnicos para uma leitura intuitiva.",
        "Revisando o roteiro de dicas essenciais para a unidade.",
        "Homologando o conteúdo final com base nas metas do curso.",
        "Concluindo a verificação de integridade do feedback."
      ],
      [
        "Renderizando a resposta sintetizada em formato de áudio.",
        "Convertendo as notas textuais em ondas sonoras nativas.",
        "Ajustando os parâmetros de modulação de voz da mentora.",
        "Sincronizando a inflexão vocal com a intenção didática.",
        "Processando os arquivos de som para reprodução imediata.",
        "Otimizando a acústica da resposta falada pelo sistema.",
        "Ajustando a velocidade da locução para facilitar a escuta.",
        "Gerando a trilha de voz com base nos tópicos corrigidos.",
        "Compilando os blocos de áudio para execução sequencial.",
        "Validando a clareza da pronúncia do motor de voz.",
        "Alinhando os tempos de pausa para uma escuta natural.",
        "Codificando o arquivo sonoro final para transmissão estável.",
        "Carregando os dados de áudio na esteira de reprodução.",
        "Processando la síntese de fala com alta frequência técnica.",
        "Equalizando as frequências da voz para o balão do chat.",
        "Verificando a integridade do arquivo de áudio gerado.",
        "Preparando o gatilho de execução automática do player.",
        "Ajustando o bitrate para carregamento rápido no dispositivo.",
        "Conectando o player de áudio à interface do usuário.",
        "Finalizando os preparativos do arquivo de resposta falada."
      ],
      [
        "Empacotando os dados de texto e áudio para envio seguro.",
        "Estabelecendo conexão prioritária com o servidor local.",
        "Alocando largura de banda para transferência do arquivo.",
        "Verificando a estabilidade da transmissão de dados na rede.",
        "Sincronizando o fluxo do backend com a tela do usuário.",
        "Validando os pacotes de informação recebidos na fila.",
        "Monitorando o tempo de resposta para otimizar o envio.",
        "Autenticando os tokens de resposta da inteligência artificial.",
        "Preparando a renderização do balão de texto em tempo real.",
        "Ajustando as prioridades da esteira de dados do exercício.",
        "Iniciando o descarregamento seguro do pacote pedagógico.",
        "Alinhando os scripts de animação para a entrada do texto.",
        "Verificando latência da rede para evitar falhas de clique.",
        "Atualizando os logs de processamento interno da mentoria.",
        "Certificando a segurança da transferência da informação.",
        "Preparando o painel visual para a exibição dos resultados.",
        "Agrupando as variáveis de estado para a transição de tela.,",
        "Monitorando a fila de requisições ativas do sistema.",
        "Abrindo o canal de recepção final da resposta em tela.",
        "Concluindo o alinhamento de rede para entrega imediata."
      ],
      [
        "Dúvida com alta densidade teórica, aprofundando a pesquisa.",
        "Analisando múltiplas ramificações das regras gramaticais.",
        "Cruzando informações estruturais para um retorno completo.",
        "Refinando a base de conhecimento para dúvidas avançadas.",
        "Processando variáveis linguísticas de alta complexidade.",
        "Expandindo o escopo de busca para explicações detalhadas.",
        "Estruturando resposta minuciosa para o cenário apresentado.",
        "Computando dados complementares para esclarecimento total.",
        "Solucionando conexões complexas de sintaxe no exercício.",
        "Mantendo o canal ativo para processamento de alto nível.",
        "Finalizando a compilação de dados para tópicos avançados.",
        "Organizando o volume denso de informações pedagógicas.",
        "Validando exceções da regra que se aplicam a este caso.",
        "Concluindo o processamento de dados estruturais complexos.",
        "Otimizando a entrega de conteúdo pedagógico aprofundado.",
        "Resposta em fase final de consolidação de alto nível.",
        "Garantindo precisão absoluta para a análise solicitada.",
        "Finalizando o fechamento dos blocos de dados avançados.",
        "Preparando a exibição da solução detalhada na interface.",
        "Conexão estendida ativa, liberando o conteúdo em instantes."
      ]
    ];

    // Identificar o índice do bloco de acordo com os segundos passados
    let indiceBloco = Math.floor(thinkingTime / 2);
    if (indiceBloco > 9) indiceBloco = 9; // Trava no último bloco caso passe de 18 segundos

    // Usar uma semente determinística simples ou somar o time para rodar frases estáveis por segundo
    const blocoAtual = blocos[indiceBloco];
    const hash = (thinkingTime + 7) % blocoAtual.length;
    return blocoAtual[hash];
  };
  const [isSpeaking, setIsSpeaking] = useState(false);
  const currentAudioRef = typeof window !== 'undefined' ? (globalThis as any).currentAudioRef || { current: null } : { current: null };
  if (typeof window !== 'undefined') { (globalThis as any).currentAudioRef = currentAudioRef; }

    const interromperMentora = () => {
    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      } catch (e) {}
    }
    setIsSpeaking(false);
    setIsThinking(false);
  };

  const perguntarAoMentor = async (e, audioBase64 = null) => {
    if (e) e.preventDefault();
    
    const textoParaEnviar = chatInput ? chatInput.trim() : "";
    if (!audioBase64 && !textoParaEnviar) return;

    setChatInput('');
    
    setTipoEnvio(audioBase64 ? "audio" : "texto");
    setIsThinking(true);
    setRespostaIA('');

    try {
      const response = await fetch('/api/mascote-ia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: audioBase64 ? "" : textoParaEnviar,
          audio: audioBase64,
          locale: typeof currentLang !== 'undefined' ? currentLang.toLowerCase() : 'es'
        })
      });
      
      const data = await response.json();
      const textoFinal = data.response || data.reply || data.text || "";
      
      setRespostaIA(textoFinal);

      if (data.audioResponse) {
        if (currentAudioRef.current) currentAudioRef.current.pause();
        const audioUrl = `data:audio/mp3;base64,${data.audioResponse}`;
        const audioPlay = new Audio(audioUrl);
        currentAudioRef.current = audioPlay;
        setIsSpeaking(true);
        audioPlay.onended = () => setIsSpeaking(false);
        audioPlay.play().catch(err => {
          console.error("Erro ao tocar áudio:", err);
          setIsSpeaking(false);
        });
      }
    } catch (err) {
      console.error("Erro ao conectar com a IA do Core:", err);
      setRespostaIA("Desculpe. Tive um problema de conexão. Pode tentar novamente?");
    } finally {
      setIsThinking(false);
    }
  };
  const [modalPedagogo, setModalPedagogo] = useState<{ aberto: boolean; tipo: 'VIDEO' | 'TEXTO' | null }>({
    aberto: false,
    tipo: null
  });

  // Trava desativada para efeito Fade-in Web

  // CÁLCULO DINÂMICO DE MULTIPLICADOR ESTILO COMBO STREAK
  const getMultiplicador = () => {
    if (streak >= 10) return 2.0;
    if (streak >= 5) return 1.5;
    if (streak >= 3) return 1.2;
    return 1.0;
  };

  const handleNextMission = () => {
    setGameStatus('IDLE');
    setComboQuebrado(false);
    setCaixaAberta(false);
    const atual = jogoSelecionado;
    setJogoSelecionado('');
    setTimeout(() => setJogoSelecionado(atual), 10);
  };

  const handleValidationResult = (isCorrect: boolean) => {
    if (isCorrect) {
      setGameStatus('CORRECT'); tocarSom('success');
      setStreak(prev => prev + 1);
      // PONTUAÇÃO MULTIPLICADA DINAMICAMENTE PELO SEU COMBO
      const baseXP = 25;
      const xpGanho = Math.round(baseXP * getMultiplicador());
      setXpAcumulado(prev => prev + xpGanho);
      setIsCollectingReward(true);
    } else {
      setGameStatus('WRONG'); tocarSom('error');
      setPrecision(prev => Math.max(prev - 4, 60));
      if (streak > 0) {
        setComboQuebrado(true);
        setStreak(0);
      }
    }
  };

  const todosOsJogos = [
    { id: 'escolha', label: 'MÚLTIPLA ESCOLHA', title: 'SELEÇÃO CONTEXTUAL', component: <MioloMultiplaEscolha /> },
    { id: 'caca_erro', label: 'CAÇA ERRO', title: 'CORREÇÃO SINTÁTICA', component: <MioloCacaErro /> },
    { id: 'blitz', label: 'DESAFIO BLITZ', title: 'RECONHECIMENTO RÁPIDO', component: <MioloBlitzChallenge /> },
    { id: 'ditado', label: 'DITADO PRÁTICO', title: 'FIXAÇÃO ACÚSTICA', component: <DitadoLacunas /> },
    { id: 'blocos', label: 'BLOCOS DE GRAMÁTICA', title: 'CONSTRUÇÃO ESTRUTURAL', component: <MioloBlocos /> },
    { id: 'leitura', label: 'LEITURA VELOZ', title: 'SPRINT FLUIDEZ', component: <MioloLeituraRapida /> },
    { id: 'ordenacao', label: 'ORDENAÇÃO DE FRASES', title: 'SINTAXE DE ALTO PADRÃO', component: <MioloOrdenacao /> },
    { id: 'paragrafos', label: 'REORDENAÇÃO DE PARÁGRAFOS', title: 'COESÃO TEXTUAL AVANÇADA', component: <MioloReordenacaoParagrafos /> },
    { id: 'roleplay', label: 'CONVERSAÇÃO IA', title: 'ROLEPLAY COGNITIVO', component: <MioloRoleplay /> },
    { id: 'shadowing', label: 'LABORATÓRIO DE PRONÚNCIA', title: 'SHADOWING EM TEMPO REAL', component: <MioloShadowing /> },
    { id: 'spelling', label: 'SPELLING BEE', title: 'SOLETRANDO VOCABULÁRIO', component: <MioloSpellingBee /> },
    { id: 'traducao', label: 'TRADUÇÃO INVERSA', title: 'ENGENHARIA REVERSA', component: <MioloTraducaoInversa /> },
    { id: 'velocidade', label: 'LEITURA PROGRESSIVA', title: 'SPRINT DE COMPREENSÃO', component: <MioloVelocidadeProgressiva /> }
  ];

  const jogoAtual = todosOsJogos.find(j => j.id === jogoSelecionado) || todosOsJogos[7];

  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) { e.stopPropagation(); onClose(); } }} className={`fixed inset-0 z-[9999] bg-[#060e1a]/85 backdrop-blur-[12px] flex flex-col justify-between h-screen md:h-screen w-screen overflow-y-auto md:overflow-hidden cursor-default select-none text-white transition-opacity duration-300 ease-in-out ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'} ${
      gameStatus === 'WRONG' ? 'animate-shake-global' : ''
    }`}>
      
      <div className="absolute top-4 left-4 z-[10001]">
        <button 
          onClick={() => setMenuDevAberto(!menuDevAberto)}
          className="bg-[#1D2D44] border border-[#48627D]/40 text-[#94A3B8] text-[9px] font-black font-mono px-3 py-1.5 rounded-xl  hover:text-white transition-colors"
        >
          {menuDevAberto ? '👉 CLOSE HUD' : '👈 AUDIT GAMES'}
        </button>
        {menuDevAberto && (
          <div className="bg-[#162235] border border-[#48627D]/40 p-3 rounded-bl-2xl w-56 shadow-2xl flex flex-col gap-1 max-h-[60vh] overflow-y-auto">
            {todosOsJogos.map((j) => (
              <button
                key={j.id}
                onClick={() => { tocarSom('click'); setJogoSelecionado(j.id); setGameStatus('IDLE'); setComboQuebrado(false); }}
                className={`w-full text-left text-[9px] font-bold font-mono px-3 py-1.5 rounded-lg border-none cursor-pointer transition-all ${
                  jogoSelecionado === j.id ? 'bg-[#F97316] text-white font-black' : 'bg-[#1D2D44]/40 text-[#94A3B8] hover:bg-[#243B55]'
                }`}
              >
                {j.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-full px-8 py-4 flex justify-between items-center border-b border-amber-500/15 bg-[#0B1528] shadow-2xl flex-shrink-0 mt-0">
        <div className="flex items-center gap-6 text-[11px] font-bold text-[#94A3B8] tracking-wider">
          <span className={`flex items-center gap-1 font-black transition-all duration-200 ${
            comboQuebrado ? 'text-red-500 line-through opacity-60 scale-95' : 'text-[#FF8A2B]'
          } ${streak >= 3 ? 'text-amber-500 font-black' : ''}`}>
            <Flame size={13} fill="currentColor" /> 
            {comboQuebrado ? "COMBO QUEBRADO" : `${streak}X STREAK ${streak >= 3 ? `(x${getMultiplicador()})` : ''}`}
          </span>
          <span className="flex items-center gap-1 text-[#38BDF8]"><Target size={13} /> {precision}% {tArena.precisionLabel}</span>
          <span className="flex items-center gap-1 text-[#22C55E]"><Award size={13} /> {xpAcumulado} PTS TOTAL</span>
        </div>
        
        <div className="absolute left-1/2 transform -translate-x-1/2 text-center hidden lg:block">
          <span className="text-[12px] font-black text-[#38BDF8] tracking-widest font-mono uppercase bg-[#38BDF8]/10 px-5 py-1.5 rounded-full border border-[#38BDF8]/20 shadow-[0_0_15px_rgba(56,189,248,0.1)]">
            {jogoAtual.title}
          </span>
        </div>

        {onClose && (
          <button onClick={() => { tocarSom('click'); onClose(); }} className="text-[9.5px] font-black font-mono tracking-widest px-3 py-1.5 bg-transparent text-[#f59e0b] rounded-xl border border-[#f59e0b]/40 cursor-pointer hover:text-white hover:bg-[#f59e0b]/10 transition-all hover:border-[#f59e0b]/70">
            {tArena.close}
          </button>
        )}
      </div>

      <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} className="w-full max-w-[94vw] flex-1 flex flex-col md:flex-row gap-6 text-left justify-center items-center mx-auto my-auto py-2 cursor-default">
        
        <div className="w-full md:w-[60%] h-[66vh] min-h-[480px] max-h-[600px] bg-[#0B1528] border border-white/[0.04] rounded-[24px] p-5 flex flex-col justify-between backdrop-blur-md relative overflow-hidden shadow-2xl">
          <div className="w-full flex justify-between items-center select-none pb-3 border-b border-white/[0.03]">
            <div className="flex flex-col">
              <span className="text-[10px] font-black tracking-widest text-[#94A3B8] uppercase">{tArena.unit} 12 • {tArena.stage} 5 {tArena.of} 8</span>
              <h2 className="text-sm font-bold text-white tracking-tight mt-0.5">{jogoAtual.label}</h2>
            </div>
            {gameStatus === 'CORRECT' && (
              <span className="text-[10px] font-black text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/20 px-3 py-1 rounded-full flex items-center gap-1">
                <Sparkles size={11} className="animate-spin" /> {currentLang === 'PT' ? 'PERFORMANCE COMPROVADA' : currentLang === 'ES' ? 'RENDIMIENTO COMPROBADO' : 'PERFORMANCE VERIFIED'}
              </span>
            )}
          </div>

          <div className="flex-1 w-full overflow-y-auto scrollbar-none py-4 flex flex-col justify-center min-h-0">
            {gameStatus === 'CORRECT' ? (
              /* 🎁 EXPERIÊNCIA DE RECOMPENSA COMPORTAMENTAL: ABRE CAIXA DE LOOT */
              <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 animate-fade-in gap-4 select-none">
                {!caixaAberta ? (
                  <div 
                    onClick={() => { tocarSom('level_complete'); setCaixaAberta(true); }}
                    className="silenciar-som group cursor-pointer flex flex-col items-center justify-center gap-3 bg-[#1E2E48]/40 p-6 rounded-2xl border border-[#38BDF8]/20 hover:border-[#22C55E]/40 transition-all hover:scale-105 animate-bounce-gentle shadow-[0_0_30px_rgba(56,189,248,0.05)]"
                  >
                    <Gift size={50} className="text-[#FF8A2B] group-hover:text-[#22C55E] transition-colors duration-300 drop-shadow-[0_0_15px_rgba(249,115,22,0.3)]" />
                    <span className="text-xs font-black tracking-widest text-[#38BDF8] uppercase group-hover:text-white">{currentLang === 'PT' ? 'MÉTRICAS ATUALIZADAS. CLIQUE PARA REVISAR.' : currentLang === 'ES' ? 'MÉTRICAS ACTUALIZADAS. CLIC PARA REVISAR.' : 'METRICS UPDATED. CLICK TO REVIEW.'}</span>
                  </div>
                ) : (
                  <div className="animate-scale-up flex flex-col items-center justify-center gap-3">
                    <div className="w-14 h-14 bg-[#22C55E]/20 rounded-full flex items-center justify-center text-[#22C55E] border border-[#22C55E]/30 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                      <CheckCircle2 size={30} />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <h3 className="text-base font-black text-white uppercase tracking-tight">{currentLang === 'PT' ? 'AUDITORIA CONCLUÍDA!' : currentLang === 'ES' ? '¡AUDITORÍA CONCLUIDA!' : 'AUDIT COMPLETED!'}</h3>
                      <p className="text-[11px] text-[#94A3B8]">{currentLang === 'PT' ? 'Mais uma etapa vencida. Você está construindo a sua melhor versão no idioma.' : currentLang === 'ES' ? 'Una etapa más superada. Estás construyendo tu mejor versión en el idioma.' : 'Another stage cleared. You are building your best version in the language.'}</p>
                    </div>
                    <div className="flex gap-2 w-full justify-center mt-2 font-mono text-[10px] font-black">
                      
                      <span className="bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] px-3 py-1.5 rounded-xl font-mono">+25 PTS</span>
                      <span className="bg-[#38BDF8]/10 border border-[#38BDF8]/20 text-[#38BDF8] px-3 py-1.5 rounded-xl font-mono">+3 UT</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              jogoAtual.component
            )}
          </div>

          <div className="w-full pt-4 border-t border-white/[0.03] flex justify-between items-center gap-4">
            <button 
              onClick={() => { tocarSom('click'); handleNextMission(); }}
              className="px-5 py-2.5 bg-[#070d19] hover:bg-[#0B1528] text-slate-500 border border-[#0B1528] text-[10.5px] font-black tracking-wider rounded-xl cursor-pointer transition-all shadow-md uppercase"
            >
              {tArena.skip}
            </button>
            <button 
              onClick={() => {
                if (gameStatus === 'CORRECT') {
                  handleNextMission();
                } else {
                  handleValidationResult(true);
                }
              }}
              className={`flex-1 py-2.5 text-[11px] font-black tracking-widest rounded-xl cursor-pointer transition-all hover:-translate-y-0.5 border-none uppercase text-center ${
                gameStatus === 'CORRECT' 
                  ? 'silenciar-som bg-gradient-to-r from-[#22C55E] to-[#16a34a] text-white shadow-[0_4px_20px_rgba(34,197,94,0.25)]'
                  : 'bg-gradient-to-r from-[#FF8A2B] to-[#F97316] text-white shadow-[0_4px_20px_rgba(249,115,22,0.25)]'
              }`}
            >
              {gameStatus === 'CORRECT' ? tArena.next : tArena.validate}
            </button>
          </div>
        </div>

        <div className="flex w-full md:w-[40%] h-auto md:h-[66vh] min-h-0 md:min-h-[480px] max-h-none md:max-h-[600px] bg-[#0B1528] border border-white/[0.03] rounded-[24px] backdrop-blur-md shadow-2xl p-5 flex flex-col justify-between relative overflow-hidden mt-4 md:mt-0">
          
          {/* FAIXA HORIZONTAL COMPACTA DE MÉTRICAS */}
          <div className="w-full bg-[#070d19] border border-[#38BDF8]/20 py-2 px-4 rounded-xl flex items-center justify-between font-mono text-[11px] font-black tracking-wider text-slate-200 shadow-lg shrink-0">
            <span className="flex items-center gap-1"><Target size={12} className="text-[#38BDF8]" /> {precision}%</span>
            <span className="text-white/10">|</span>
            <span className="flex items-center gap-1"><Flame size={12} className={`text-[#FF8A2B] ${streak >= 3 ? 'text-amber-500 font-black' : ''}`} fill="currentColor" /> {streak}</span>
            <span className="text-white/10">|</span>
            <span className="flex items-center gap-1"><Star size={12} className="text-[#22C55E]" /> 5/8</span>
            <span className="text-white/10">|</span>
            <span className="flex items-center gap-1"><TrendingUp size={12} className="text-[#A855F7]" /> 62%</span>
            <span className="text-white/10">|</span>
            <span className="flex items-center gap-1 text-[#22C55E]"><Trophy size={12} /> +25 PTS</span>
          </div>

          {/* ÁREA CENTRAL EXPANDIDA DO MENTOR HAAS CONECTADA AO MOTOR DE RECOMPENSAS */}
          <div className="flex-1 w-full flex flex-col items-center justify-center gap-4 py-4 min-h-0 relative">
            
            {/* 🌌 FLUXO DE MICRO-PARTÍCULAS REATIVAS (GATILHO DE DOPAMINA NO ACERTO) */}
            {gameStatus === 'CORRECT' && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-[#22C55E] rounded-full animate-particle-1 opacity-70" />
                <div className="absolute top-1/3 left-1/2 w-1.5 h-1.5 bg-[#38BDF8] rounded-full animate-particle-2 opacity-60" />
                <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-amber-400 rounded-full animate-particle-3 opacity-80" />
              </div>
            )}

            {/* ÍCONE GRANDE DO PERSONAGEM EM COMBAT-READY */}
            <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 relative shrink-0 shadow-lg border z-10 ${
              gameStatus === 'CORRECT' ? 'bg-[#22C55E]/20 text-[#22C55E] border-[#22C55E]/30 shadow-[0_0_20px_rgba(34,197,94,0.3)] scale-110' :
              gameStatus === 'WRONG' ? 'bg-red-500/20 text-red-500 border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.3)] animate-shake' :
              streak >= 3 ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.25)] scale-105' :
              'bg-[#38BDF8]/20 text-[#00D4FF] border-[#00D4FF]/40 shadow-[0_0_20px_rgba(0,212,255,0.35)]'
            }`}>
              <Bot size={32} className="" />
              {streak >= 3 && (
                <span className="absolute -top-1 -right-2 bg-[#F97316] text-white border border-orange-400/30 font-mono font-black text-[8px] px-1.5 py-0.5 rounded-md shadow-[0_0_10px_rgba(249,115,22,0.4)]">
                  COMBO
                </span>
              )}
            </div>

            {/* BALÃO DE DIÁLOGO */}
            <div className="w-full flex-1 bg-[#070d19] border border-white/[0.04] p-4 rounded-2xl relative text-left shadow-xl flex flex-col justify-between z-10 overflow-hidden">
              
              {/* CABEÇALHO FIXO - NUNCA ROLLA PARA FORA DA TELA */}
              <span className="w-full text-[9px] font-black text-[#38BDF8] tracking-widest uppercase block border-b border-white/5 pb-1 select-none shrink-0 mb-2">{tArena.mentorName}</span>
              
              {/* ÁREA DE ROLAGEM EXCLUSIVA PARA OS TEXTOS */}
              <div className="flex flex-col flex-1 overflow-y-auto scrollbar-none mb-3 pr-1 max-h-[320px]">
                <div className="text-[13px] font-sans font-medium leading-relaxed text-slate-100 mt-1">
                  {/* Se a IA já respondeu algo ao aluno, exibe a resposta dela. Se não, exibe o feedback nativo do jogo */}
                  {(isThinking && tipoEnvio === "audio") ? (
                    <div className="animate-fade-in text-cyan-400 font-sans italic animate-pulse text-xs leading-relaxed">
                      {getThinkingMessage()}
                    </div>
                  ) : respostaIA ? (
                    <div className="animate-fade-in text-slate-200 text-xs leading-relaxed whitespace-pre-wrap break-words">
                      {respostaIA}
                    </div>
                  ) : (
                    <p>
                      {(isThinking && tipoEnvio === "texto") ? (
                        <span className="text-cyan-400 font-sans italic animate-pulse">{msgEscritaAleatoria || "Mentora Haas está digitando..."}</span>
                      ) : (
                        <>
                          {gameStatus === 'CORRECT' && "Incrível! O loot da missão foi liberado. Clique na caixa de suprimentos para resgatar seus bônus de PTS multiplicados!"}
                          {gameStatus === 'WRONG' && "Atenção à ordem das orações subordinadas, Bruna. Ajuste a posição dos conectores e valide novamente."}
                          {gameStatus === 'IDLE' && streak >= 3 && tArena.mentorFire.replace("multiplicador", "multiplicador x" + getMultiplicador())}
                          {gameStatus === 'IDLE' && streak < 3 && "Excelente progresso estrutural nesta unidade, Bruna. Mantenha os olhos fixos nos conectores lógicos antes de submeter a resposta final!"}
                        </>
                      )}
                    </p>
                  )}
                </div>
              </div>

              {/* Input Fixo e Discreto na base do Balão */}
              <form onSubmit={perguntarAoMentor} className="flex items-center bg-[#0c192e] border border-white/5 focus-within:border-cyan-500/40 rounded-xl px-3 py-1.5 mt-auto transition-all w-full relative">
                <input 
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={tArena.chatPlaceholder}
                  className="flex-1 bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none font-mono pr-16"
                  disabled={isRecording}
                />
                <div className="absolute right-2 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={toggleVoiceRecording}
                    className={`p-1.5 rounded-full transition-all cursor-pointer ${isRecording ? 'text-cyan-400 bg-cyan-500/10 animate-pulse scale-105' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    <Mic size={15} />
                  </button>
                  {isThinking || isSpeaking ? (
                    <button 
                      type="button"
                      onClick={interromperMentora}
                      className="p-1.5 bg-transparent text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/10 rounded-full transition-all active:scale-95 cursor-pointer flex items-center justify-center"
                      title="Interromper Mentora"
                    >
                      <span className="w-2.5 h-2.5 bg-cyan-400 rounded-sm block" />
                    </button>
                  ) : (
                    <button 
                      type="submit"
                      disabled={!chatInput.trim()}
                      className="p-1.5 bg-cyan-500 text-[#0b1528] rounded-full transition-all active:scale-95 cursor-pointer disabled:opacity-20 disabled:bg-transparent disabled:text-slate-600"
                    >
                      <ArrowUp size={14} strokeWidth={3} />
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* BOTÕES DE SUPORTE INFERIORES: GÊMEOS E ABSOLUTAMENTE SIMÉTRICOS */}
          <div className="w-full shrink-0">
            <div className="grid grid-cols-2 gap-3 w-full">
              {/* Botão Esquerdo (50%) - Texto */}
              <button 
                type="button"
                onClick={() => onAbrirPedagogo ? onAbrirPedagogo('TEXTO') : setModalPedagogo({ aberto: true, tipo: 'TEXTO' })}
                className="w-full py-2.5 px-3 bg-[#162235] hover:bg-[#1D2D44] text-white border border-white/10 bg-[#0c1624] text-[10px] font-black rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all hover:-translate-y-0.5 shadow-md uppercase tracking-wider"
              >
                <BookOpen size={11} className="text-[#00D4FF]" />
                <span>{tArena.guide}</span>
              </button>

              {/* Botão Direito (50%) - Audiovisual / Vídeo do Avatar (Idêntico ao da esquerda) */}
              <button 
                type="button"
                onClick={() => onAbrirPedagogo ? onAbrirPedagogo('VIDEO') : setModalPedagogo({ aberto: true, tipo: 'VIDEO' })}
                className="w-full py-2.5 px-3 bg-[#162235] hover:bg-[#1D2D44] text-white border border-white/10 bg-[#0c1624] text-[10px] font-black rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all hover:-translate-y-0.5 shadow-md uppercase tracking-wider"
              >
                <Video size={11} className="text-[#00D4FF]" />
                <span>{tArena.media || (idiomaAtivo === 'EN' ? 'Audiovisual Content' : 'Conteúdo Audiovisual')}</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      <div className="hidden fixed bottom-0 inset-x-0 w-full px-8 py-3.5 justify-between items-center z-[10000] border-t border-amber-500/15 bg-[#0B1528] backdrop-blur-md select-none text-[#94A3B8]/35 font-mono text-[9px] font-bold tracking-widest uppercase shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
          <span>HAAS ENGINE v2.5.0 • SECURE REWARD SYSTEM GAMEPLAY</span>
        </div>
        <div>
          <span>© 2026 HAAS LANGUAGE ACADEMY • PREMIUM GAMIFIED PLATFORM</span>
        </div>
      </div>

      {false && modalPedagogo.aberto && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setModalPedagogo({ aberto: false, tipo: null }); }} className="fixed inset-0 z-[100000] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in cursor-default">
          <div className="bg-[#162235] border border-[#48627D]/40 rounded-2xl w-full max-w-xl p-6 relative shadow-2xl text-left">
            <button 
              onClick={() => setModalPedagogo({ aberto: false, tipo: null })}
              className="absolute top-4 right-4 text-slate-400 hover:text-white bg-[#1D2D44] p-1.5 rounded-full border border-white/5 cursor-pointer"
            >
              <X size={14} />
            </button>
            
            {modalPedagogo.tipo === 'VIDEO' ? (
              <div className="w-full flex flex-col gap-3">
                
                <h3 className="text-base font-bold text-white font-sans">Data Schema & Production Integrity</h3>
                <div className="w-full aspect-video bg-[#0B1528] rounded-xl border border-white/5 flex flex-col items-center justify-center text-slate-500 text-xs font-mono">
                  {currentLang === 'EN' ? '[ HAAS VIDEO PLAYER ]' : currentLang === 'ES' ? '[ REPRODUCTOR DE VÍDEO HAAS ]' : '[ PLAYER DE VÍDEO HAAS ]'}
                </div>
              </div>
            ) : (
              <div className="w-full flex flex-col gap-3">
                <span className="text-[10px] font-black text-[#FF8A2B] tracking-widest uppercase flex items-center gap-1.5">
                  <BookOpen size={12} /> CONTEÚDO ESCRITO DE FIXAÇÃO
                </span>
                <h3 className="text-base font-bold text-white font-sans">A Regra dos Clusters de Réplica</h3>
                <p className="text-xs text-slate-300 leading-relaxed font-sans select-text">
                  Em arquiteturas de banco de dados, as alterações de esquema estrutural (schema migrations) devem ser executadas com validações prévias nos clusters secundários (réplicas) antes de impactarem a tabela master de produção.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      
      {/* 🚀 RODAPÉ INTEGRADO DA ARENA QUIZ PARA EQUILÍBRIO GEOMÉTRICO */}
      <div className="w-full px-8 py-3 flex justify-between items-center border-t border-amber-500/15 bg-[#0B1528] text-[10px] font-mono text-slate-500 flex-shrink-0 select-none">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-[#22C55E] rounded-full animate-pulse" />
          <span>HAAS ENGINE V2.5.0 • SECURE REWARD SYSTEM GAMEPLAY</span>
        </div>
        <span>© 2026 HAAS LANGUAGE ACADEMY • PREMIUM GAMIFIED PLATFORM</span>
      </div>

      {/* 🚀 ESTILOS EM CSS GLOBAL INTERNO PARA ANIMAÇÕES DE COMPORTAMENTO VICIANTE */}
      <style jsx global>{`
        .animate-fade-in { animation: fadeIn 200ms cubic-bezier(.2,.9,.2,1) forwards; }
        .animate-scale-up { animation: scaleUp 250ms cubic-bezier(.34,1.56,.64,1) forwards; }
        .animate-bounce-gentle { animation: bounceGentle 2s infinite ease-in-out; }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
        
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleUp { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
        @keyframes bounceGentle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        
        /* ANIMAÇÃO DE FLUXO DE DOPAMINA (PARTÍCULAS) */
        .animate-particle-1 { animation: p1 1.2s infinite ease-out; }
        .animate-particle-2 { animation: p2 1s infinite ease-out; }
        .animate-particle-3 { animation: p3 1.4s infinite ease-out; }
        
        @keyframes p1 { 0% { transform: translate(0,0) scale(1); opacity: 1; } 100% { transform: translate(-30px, -40px) scale(0); opacity: 0; } }
        @keyframes p2 { 0% { transform: translate(0,0) scale(1); opacity: 1; } 100% { transform: translate(40px, -50px) scale(0); opacity: 0; } }
        @keyframes p3 { 0% { transform: translate(0,0) scale(1); opacity: 1; } 100% { transform: translate(-10px, -60px) scale(0); opacity: 0; } }
      `}</style>

    </div>
  );
}
