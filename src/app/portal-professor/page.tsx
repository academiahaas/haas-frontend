"use client";

export const dynamic = 'force-dynamic';
import React, { useState, useEffect } from "react";
import { DollarSign, Calendar, Clock, Users, User, ShieldCheck, Loader2, ExternalLink, ZoomIn, ZoomOut, RotateCw, Hand, PenLine, Type, Eraser, X, Menu } from "lucide-react";
import { supabase } from "../lib/supabase";

interface Material {
  id: string;
  photo_url: string;
  nome_aluno: string;
  created_at: string;
}

interface PendenteAvaliacao {
  aula_id: string;
  user_id: string;
  nome_aluno: string;
  data_aula: string;
}

interface Avaliacao {
  rating_stars: number;
  comment: string | null;
  class_date: string;
}

interface AulaSlot {
  id: string;
  data_hora_inicio: string;
  data_hora_fim: string;
  tipo_aula: string;
  vagas_maximas: number;
  vagas_ocupadas: number;
  status: string;
  idioma: string;
  slides_status: string | null;
  slides_pdf_path: string | null;
  slides_pptx_path: string | null;
}

interface DadosProfessor {
  id: string;
  name: string;
  email: string;
  monthly_rate: number | null;
  rate_per_class: number | null;
  meeting_link: string | null;
  payment_status: string | null;
  payment_method: string | null;
  bank_name: string | null;
  account_type: string | null;
  account_number: string | null;
  account_holder_name: string | null;
  document_number: string | null;
  nequi_phone: string | null;
  punctuality_score: number | null;
  pedagogical_score: number | null;
}

type IdiomaInterface = "es" | "en" | "pt";

const TRADUCAO_IDIOMA_AULA: Record<IdiomaInterface, Record<string, string>> = {
  es: { portugues: "Portugués", ingles: "Inglés", espanol: "Español", frances: "Francés" },
  en: { portugues: "Portuguese", ingles: "English", espanol: "Spanish", frances: "French" },
  pt: { portugues: "Português", ingles: "Inglês", espanol: "Espanhol", frances: "Francês" }
};

const TRADUCAO_TIPO_AULA: Record<IdiomaInterface, Record<string, string>> = {
  es: { GRUPO: "Grupo", PARTICULAR: "Particular" },
  en: { GRUPO: "Group", PARTICULAR: "Private" },
  pt: { GRUPO: "Grupo", PARTICULAR: "Particular" }
};

const TEXTOS: Record<IdiomaInterface, Record<string, string>> = {
  es: {
    subtitulo: "Panel del Profesor",
    misClases: "Mis clases",
    datosPago: "Mi cuenta",
    prepClase: "Preparación de clase",
    sesionActiva: "Sesión segura activa",
    conexionActiva: "Conexión segura activa",
    tarifaClase: "Tarifa por clase",
    acumuladoMes: "Acumulado este mes",
    clasesProgramadas: "Clases programadas",
    pagado: "Pagado",
    pendiente: "Pendiente",
    tusClases: "Tus clases",
    horarioReal: "Horario real desde el calendario",
    sinClases: "No hay clases programadas todavía.",
    alumnos: "alumnos",
    entrarClase: "Entrar a la clase",
    cargando: "Cargando tu panel...",
    pesos: "pesos colombianos",
    soporte: "Soporte",
    cerrarSesion: "Cerrar sesión",
    accederDiapositivas: "Acceder a las diapositivas",
    calificacionProm: "Calificacion promedio",
    sinDatos: "Sin datos",
    resena: "resena",
    resenas: "resenas",
    comentariosAlumnos: "Comentarios de tus alumnos",
    puntualidad: "Puntualidad",
    evalPedagogica: "Evaluacion pedagogica"
  },
  en: {
    subtitulo: "Teacher Panel",
    misClases: "My classes",
    datosPago: "My account",
    prepClase: "Class preparation",
    sesionActiva: "Secure session active",
    conexionActiva: "Secure connection active",
    tarifaClase: "Rate per class",
    acumuladoMes: "Accrued this month",
    clasesProgramadas: "Scheduled classes",
    pagado: "Paid",
    pendiente: "Pending",
    tusClases: "Your classes",
    horarioReal: "Real schedule from calendar",
    sinClases: "No classes scheduled yet.",
    alumnos: "students",
    entrarClase: "Join class",
    cargando: "Loading your panel...",
    pesos: "Colombian pesos",
    soporte: "Support",
    cerrarSesion: "Log out",
    accederDiapositivas: "Access the slides",
    calificacionProm: "Average rating",
    sinDatos: "No data",
    resena: "review",
    resenas: "reviews",
    comentariosAlumnos: "Comments from your students",
    puntualidad: "Punctuality",
    evalPedagogica: "Pedagogical evaluation"
  },
  pt: {
    subtitulo: "Painel do Professor",
    misClases: "Minhas aulas",
    datosPago: "Minha conta",
    prepClase: "Preparação de aula",
    sesionActiva: "Sessão segura ativa",
    conexionActiva: "Conexão segura ativa",
    tarifaClase: "Tarifa por aula",
    acumuladoMes: "Acumulado este mês",
    clasesProgramadas: "Aulas programadas",
    pagado: "Pago",
    pendiente: "Pendente",
    tusClases: "Suas aulas",
    horarioReal: "Horário real do calendário",
    sinClases: "Nenhuma aula programada ainda.",
    alumnos: "alunos",
    entrarClase: "Entrar na aula",
    cargando: "Carregando seu painel...",
    pesos: "pesos colombianos",
    soporte: "Suporte",
    cerrarSesion: "Sair",
    accederDiapositivas: "Acessar os slides",
    calificacionProm: "Avaliacao media",
    sinDatos: "Sem dados",
    resena: "avaliacao",
    resenas: "avaliacoes",
    comentariosAlumnos: "Comentarios dos seus alunos",
    puntualidad: "Pontualidade",
    evalPedagogica: "Avaliacao pedagogica"
  }
};

const INSTRUCCIONES: Record<IdiomaInterface, { titulo: string; texto: string }[]> = {
  es: [
    { titulo: "1. Inicia sesión correctamente", texto: "Usa una ventana de incógnito en tu navegador para entrar al Google Meet con el correo de la empresa: docentes.haas@academiahaas.com / contraseña: MeetHaas*2026. Así evitas conflictos con tu cuenta personal de Gmail." },
    { titulo: "2. Las clases quedan grabadas", texto: "Esto no es para vigilar tu trabajo. Los alumnos piden las grabaciones con frecuencia para repasar la clase, por eso siempre se graba." },
    { titulo: "3. Ten 4 ventanas abiertas", texto: "Se recomienda trabajar con cuatro ventanas: (1) la ventana de diapositivas que compartes con el alumno, (2) tu propia ventana de diapositivas donde editas en privado, (3) la ventana de Meet, que puede quedar suelta de fondo, y (4) la ventana de Materiales, para cuando necesites corregir un trabajo escrito con el alumno." },
    { titulo: "4. Comparte solo la ventana correcta", texto: "En Google Meet, al compartir pantalla elige 'Una ventana' y selecciona SOLO la ventana (1), la que el alumno debe ver. Nunca compartas toda tu pantalla ni tu ventana de edición privada." },
    { titulo: "5. Cuidado al cambiar de diapositiva", texto: "Si editas o cambias de diapositiva en tu ventana privada (2), el alumno NO ve el cambio automáticamente. Debes hacer el mismo cambio en la ventana compartida (1) para que el alumno lo vea." },
    { titulo: "6. Cómo dividir la pantalla (vista dividida)", texto: "Haz clic en la barra superior de una ventana, mantenla presionada y arrástrala hacia el borde izquierdo o derecho de la pantalla hasta que se pegue. Suelta el clic y elige la otra ventana para el lado restante. En Windows también puedes mantener presionado el botón de maximizar para ver más opciones, incluyendo división en tres partes." },
    { titulo: "7. Corrige el material escrito de tus alumnos", texto: "En la pestaña 'Materiales' encontrarás las fotos que tus alumnos enviaron de sus trabajos escritos. Haz clic en una foto para abrirla: puedes hacer zoom, mover y rotar la imagen. Con la herramienta de marcar puedes subrayar en rojo, y con la herramienta de texto puedes escribir notas al lado de la imagen. Recomendamos compartir esta ventana con el alumno (usa el botón gris de compartir que aparece arriba) para hacer la corrección juntos y resolver dudas en el momento. Al cerrar la foto, desaparece de tu lista después de 3 minutos." },
    { titulo: "8. Si no tienes PowerPoint instalado", texto: "El archivo de diapositivas es un PowerPoint. Si tu computadora no tiene el programa instalado, puedes usar Google Slides: entra a Google Drive de la escuela, sube el archivo descargado, y ábrelo con Google Slides (clic derecho, Abrir con, Google Slides). Desde ahí puedes editar y presentar tu clase normalmente." },
    { titulo: "9. Abre las diapositivas antes de la clase", texto: "El botón para abrir las diapositivas de tu clase estará disponible aquí mismo, antes de que empiece la clase." }
  ],
  en: [
    { titulo: "1. Log in correctly", texto: "Use an incognito window in your browser to join Google Meet with the company email: docentes.haas@academiahaas.com / password: MeetHaas*2026. This avoids conflicts with your personal Gmail account." },
    { titulo: "2. Classes are recorded", texto: "This is not to monitor your work. Students frequently request recordings to review the class, so every class is recorded." },
    { titulo: "3. Keep 4 windows open", texto: "It is recommended to work with four windows: (1) the slides window you share with the student, (2) your own private slides window where you edit, (3) the Meet window, which can stay loose in the background, and (4) the Materials window, for when you need to correct written work with the student." },
    { titulo: "4. Share only the right window", texto: "In Google Meet, when sharing your screen choose 'A window' and select ONLY window (1), the one the student should see. Never share your whole screen or your private editing window." },
    { titulo: "5. Be careful when changing slides", texto: "If you edit or change slides in your private window (2), the student does NOT see the change automatically. You must make the same change in the shared window (1) so the student sees it." },
    { titulo: "6. How to split your screen", texto: "Click and hold the title bar of a window, then drag it to the left or right edge of the screen until it snaps. Release, then pick the other window for the remaining side. On Windows you can also hold the maximize button to see more options, including 3-way splits." },
    { titulo: "7. Correct your students' written material", texto: "In the 'Materials' tab you'll find photos your students sent of their written work. Click a photo to open it: you can zoom, pan, and rotate the image. Use the mark tool to underline in red, and the text tool to write notes next to the image. We recommend sharing this window with the student (use the gray share button that appears at the top) to do the correction together and answer questions live. Once you close the photo, it disappears from your list after 3 minutes." },
    { titulo: "8. If you don't have PowerPoint installed", texto: "The slides file is a PowerPoint file. If your computer doesn't have the program installed, you can use Google Slides: go to the school's Google Drive, upload the downloaded file, and open it with Google Slides (right-click, Open with, Google Slides). From there you can edit and present your class normally." },
    { titulo: "9. Open the slides before class", texto: "The button to open your class slides will be available right here, before class starts." }
  ],
  pt: [
    { titulo: "1. Faça login corretamente", texto: "Use uma janela anônima no seu navegador para entrar no Google Meet com o e-mail da empresa: docentes.haas@academiahaas.com / senha: MeetHaas*2026. Assim você evita conflitos com sua conta pessoal do Gmail." },
    { titulo: "2. As aulas ficam gravadas", texto: "Isso não é para vigiar seu trabalho. Os alunos pedem as gravações com frequência para revisar a aula, por isso sempre gravamos." },
    { titulo: "3. Mantenha 4 janelas abertas", texto: "O recomendado é trabalhar com quatro janelas: (1) a janela de slides que você compartilha com o aluno, (2) sua própria janela de slides onde você edita em privado, (3) a janela do Meet, que pode ficar solta ao fundo, e (4) a janela de Materiais, para quando você precisar corrigir um trabalho escrito com o aluno." },
    { titulo: "4. Compartilhe só a janela certa", texto: "No Google Meet, ao compartilhar tela escolha 'Uma janela' e selecione SÓ a janela (1), a que o aluno deve ver. Nunca compartilhe a tela inteira nem sua janela de edição privada." },
    { titulo: "5. Cuidado ao trocar de slide", texto: "Se você editar ou trocar de slide na sua janela privada (2), o aluno NÃO vê a mudança automaticamente. Você precisa fazer a mesma mudança na janela compartilhada (1) para que o aluno veja." },
    { titulo: "6. Como dividir a tela", texto: "Clique e segure na barra superior de uma janela, e arraste até a borda esquerda ou direita da tela até ela grudar. Solte o clique e escolha a outra janela para o lado restante. No Windows você também pode segurar o botão de maximizar para ver mais opções, incluindo divisão em três partes." },
    { titulo: "7. Corrija o material escrito dos seus alunos", texto: "Na aba 'Materiais' você encontra as fotos que os alunos enviaram dos trabalhos escritos. Clique numa foto para abrir: dá para dar zoom, mover e girar a imagem. Use a ferramenta de marcar para sublinhar em vermelho, e a ferramenta de texto para escrever notas ao lado da imagem. Recomendamos compartilhar essa janela com o aluno (use o botãozinho cinza de compartilhar que aparece em cima) para fazer a correção junto e tirar dúvidas na hora. Ao fechar a foto, ela some da sua lista depois de 3 minutos." },
    { titulo: "8. Se você não tiver o PowerPoint instalado", texto: "O arquivo dos slides é um PowerPoint. Se seu computador não tem o programa instalado, você pode usar o Google Slides: entra no Google Drive da escola, sobe o arquivo baixado, e abre com o Google Slides (clique com o botão direito, Abrir com, Google Slides). Dali você já consegue editar e apresentar sua aula normalmente." },
    { titulo: "9. Abra os slides antes da aula", texto: "O botão para abrir os slides da sua aula vai estar disponível aqui mesmo, antes de a aula começar." }
  ]
};

function EstrelasInput({ valor, onChange }: { valor: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)} className="text-xl leading-none transition-transform hover:scale-110">
          <span className={n <= valor ? "text-amber-400" : "text-slate-700"}>{"\u2605"}</span>
        </button>
      ))}
    </div>
  );
}

function TarjetaEvaluacionPequena({ pendente, professorId, idioma, onCompletado }: any) {
  const [notas, setNotas] = useState({ fala: 0, escuta: 0, leitura: 0, escrita: 0, gramatica: 0, comment: "" });
  const [saliendo, setSaliendo] = useState(false);
  const timerRef = React.useRef<any>(null);

  const enviar = async () => {
    setSaliendo(true);
    await supabase.from("class_evaluations").upsert([{
      aula_id: pendente.aula_id,
      user_id: pendente.user_id,
      teacher_id: professorId,
      score_fala: notas.fala,
      score_escuta: notas.escuta,
      score_leitura: notas.leitura,
      score_escrita: notas.escrita,
      score_gramatica: notas.gramatica,
      comment: notas.comment
    }], { onConflict: "aula_id,user_id" });

    await supabase.from("users").update({
      score_fala: notas.fala * 20,
      score_escuta: notas.escuta * 20,
      score_leitura: notas.leitura * 20,
      score_escrita: notas.escrita * 20,
      score_gramatica: notas.gramatica * 20
    }).eq("id", pendente.user_id);

    setTimeout(() => {
      onCompletado(pendente.aula_id, pendente.user_id);
    }, 450);
  };

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const ok = notas.fala > 0 && notas.escuta > 0 && notas.gramatica > 0;
    if (ok && !saliendo) {
      timerRef.current = setTimeout(() => { enviar(); }, 5000);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [notas]);

  return (
    <div className={`bg-[#0a1424] border border-cyan-500/20 rounded-lg p-3 flex flex-col gap-2 transition-all duration-500 ${saliendo ? "opacity-0 scale-75 -rotate-6" : "opacity-100 scale-100"}`}>
      <div className="flex flex-col mb-1">
        <span className="text-xs font-bold text-slate-200 truncate">{pendente.nome_aluno}</span>
        <span className="text-[9px] text-slate-500">{new Date(pendente.data_aula).toLocaleDateString(idioma === "en" ? "en-US" : "es-CO")}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-slate-400">{idioma === "es" ? "Habla" : idioma === "en" ? "Speak" : "Fala"}</span>
        <EstrelasInput valor={notas.fala} onChange={(v) => setNotas({ ...notas, fala: v })} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-slate-400">{idioma === "es" ? "Escucha" : idioma === "en" ? "Listen" : "Escuta"}</span>
        <EstrelasInput valor={notas.escuta} onChange={(v) => setNotas({ ...notas, escuta: v })} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-slate-400">{idioma === "es" ? "Gramática" : idioma === "en" ? "Grammar" : "Gramática"}</span>
        <EstrelasInput valor={notas.gramatica} onChange={(v) => setNotas({ ...notas, gramatica: v })} />
      </div>
      <div className="flex items-center justify-between opacity-70">
        <span className="text-[10px] text-slate-500">{idioma === "es" ? "Lectura*" : idioma === "en" ? "Read*" : "Leitura*"}</span>
        <EstrelasInput valor={notas.leitura} onChange={(v) => setNotas({ ...notas, leitura: v })} />
      </div>
      <div className="flex items-center justify-between opacity-70">
        <span className="text-[10px] text-slate-500">{idioma === "es" ? "Escritura*" : idioma === "en" ? "Write*" : "Escrita*"}</span>
        <EstrelasInput valor={notas.escrita} onChange={(v) => setNotas({ ...notas, escrita: v })} />
      </div>
      <p className="text-[8px] text-slate-600">*{idioma === "es" ? "solo si se trabajo en clase" : idioma === "en" ? "only if practiced in class" : "so se foi trabalhado na aula"}</p>
    </div>
  );
}

function VisorMaterial({ material, idioma, onCerrar }: any) {
  const [zoom, setZoom] = useState(1);
  const [rotacao, setRotacao] = useState(0);
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  const [modo, setModo] = useState<"mover" | "dibujo" | "texto">("mover");
  const [arrastrando, setArrastrando] = useState(false);
  const [textoInput, setTextoInput] = useState<{ x: number; y: number; valor: string; telaX: number; telaY: number } | null>(null);
  const [anotacoesTexto, setAnotacoesTexto] = useState<{ telaX: number; telaY: number; valor: string }[]>([]);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const ultimoPontoRef = React.useRef<{ x: number; y: number } | null>(null);

  const coordenadasCanvas = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    const escalaX = canvas.width / rect.width;
    const escalaY = canvas.height / rect.height;
    return { x: (clientX - rect.left) * escalaX, y: (clientY - rect.top) * escalaY };
  };

  const iniciarArrastre = (e: any) => {
    if (modo === "dibujo") {
      ultimoPontoRef.current = coordenadasCanvas(e);
      setArrastrando(true);
      return;
    }
    if (modo === "texto") {
      const pos = coordenadasCanvas(e);
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      const containerRect = containerRef.current?.getBoundingClientRect();
      setTextoInput({
        x: pos.x,
        y: pos.y,
        valor: "",
        telaX: containerRect ? clientX - containerRect.left : 0,
        telaY: containerRect ? clientY - containerRect.top : 0
      });
      return;
    }
    setArrastrando(true);
    ultimoPontoRef.current = { x: e.clientX || e.touches[0].clientX, y: e.clientY || e.touches[0].clientY };
  };

  const moverArrastre = (e: any) => {
    if (!arrastrando) return;
    if (modo === "dibujo") {
      const canvas = canvasRef.current;
      if (!canvas || !ultimoPontoRef.current) return;
      const pos = coordenadasCanvas(e);
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(ultimoPontoRef.current.x, ultimoPontoRef.current.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      }
      ultimoPontoRef.current = pos;
    } else if (modo === "mover") {
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      if (!ultimoPontoRef.current) return;
      const dx = clientX - ultimoPontoRef.current.x;
      const dy = clientY - ultimoPontoRef.current.y;
      setPosX((p) => p + dx);
      setPosY((p) => p + dy);
      ultimoPontoRef.current = { x: clientX, y: clientY };
    }
  };

  const pararArrastre = () => {
    setArrastrando(false);
    ultimoPontoRef.current = null;
  };

  const confirmarTexto = () => {
    if (!textoInput || !textoInput.valor.trim()) { setTextoInput(null); return; }
    setAnotacoesTexto((prev) => [...prev, { telaX: textoInput.telaX, telaY: textoInput.telaY, valor: textoInput.valor }]);
    setTextoInput(null);
  };

  const limparDibujo = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col" onClick={(e) => { if (e.target === e.currentTarget) onCerrar(); }}>
      <div className="flex items-center justify-between p-3 bg-[#0a1424] border-b border-white/10 shrink-0">
        <span className="text-xs text-slate-300 font-semibold">{material.nome_aluno}</span>
        <div className="flex items-center gap-2">
          <button onClick={() => setZoom((z) => Math.min(z + 0.25, 3))} className="bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-400 text-slate-300 border border-white/10 p-2 rounded-lg transition-all"><ZoomIn size={16} /></button>
          <button onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))} className="bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-400 text-slate-300 border border-white/10 p-2 rounded-lg transition-all"><ZoomOut size={16} /></button>
          <button onClick={() => setRotacao((r) => r + 90)} className="bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-400 text-slate-300 border border-white/10 p-2 rounded-lg transition-all"><RotateCw size={16} /></button>
          <button onClick={() => setModo("mover")} className={`p-2 rounded-lg border transition-all ${modo === "mover" ? "bg-cyan-500 text-slate-950 border-cyan-500" : "bg-white/5 text-slate-300 border-white/10 hover:bg-cyan-500/20 hover:text-cyan-400"}`}>
            <Hand size={16} />
          </button>
          <button onClick={() => setModo("dibujo")} className={`p-2 rounded-lg border transition-all ${modo === "dibujo" ? "bg-cyan-500 text-slate-950 border-cyan-500" : "bg-white/5 text-slate-300 border-white/10 hover:bg-cyan-500/20 hover:text-cyan-400"}`}>
            <PenLine size={16} />
          </button>
          <button onClick={() => setModo("texto")} className={`p-2 rounded-lg border transition-all ${modo === "texto" ? "bg-cyan-500 text-slate-950 border-cyan-500" : "bg-white/5 text-slate-300 border-white/10 hover:bg-cyan-500/20 hover:text-cyan-400"}`}>
            <Type size={16} />
          </button>
          <button onClick={limparDibujo} className="bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-400 text-slate-300 border border-white/10 p-2 rounded-lg transition-all"><Eraser size={16} /></button>
          <button onClick={onCerrar} className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 p-2 rounded-lg transition-all"><X size={16} /></button>
        </div>
      </div>
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden relative flex items-center justify-center touch-none"
        onMouseDown={iniciarArrastre}
        onMouseMove={moverArrastre}
        onMouseUp={pararArrastre}
        onMouseLeave={pararArrastre}
        onTouchStart={iniciarArrastre}
        onTouchMove={moverArrastre}
        onTouchEnd={pararArrastre}
      >
        <div
          className="relative"
          style={{ transform: `translate(${posX}px, ${posY}px) scale(${zoom}) rotate(${rotacao}deg)`, cursor: modo === "dibujo" || modo === "texto" ? "crosshair" : "grab" }}
        >
          <img src={material.photo_url} alt="material" className="max-w-none select-none pointer-events-none" style={{ maxHeight: "70vh" }} draggable={false} />
          <canvas ref={canvasRef} width={1000} height={1000} className="absolute inset-0 w-full h-full" />
        </div>
        {anotacoesTexto.map((a, i) => (
          <div key={i} className="absolute z-10 bg-white text-black text-sm font-semibold px-2.5 py-1.5 rounded shadow-lg max-w-[300px]" style={{ left: a.telaX, top: a.telaY }}>
            {a.valor}
          </div>
        ))}
        {textoInput && (
          <div
            className="absolute z-10 flex gap-1"
            style={{ left: textoInput.telaX, top: textoInput.telaY }}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <textarea
              autoFocus
              rows={2}
              value={textoInput.valor}
              onChange={(e) => setTextoInput({ ...textoInput, valor: e.target.value })}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); confirmarTexto(); } }}
              className="bg-white text-black text-base px-3 py-2 rounded w-72 sm:w-96 resize-none"
              placeholder={idioma === "es" ? "Escribe aqui..." : idioma === "en" ? "Type here..." : "Escreva aqui..."}
            />
            <button onClick={confirmarTexto} className="bg-cyan-500 text-slate-950 text-xs font-bold px-3 rounded self-start">OK</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PortalProfessor() {
  const [professor, setProfessor] = useState<DadosProfessor | null>(null);
  const [aulas, setAulas] = useState<AulaSlot[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [pendentesAvaliacao, setPendentesAvaliacao] = useState<PendenteAvaliacao[]>([]);
  const [indiceCartaAtual, setIndiceCartaAtual] = useState(0);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [fuso, setFuso] = useState<"colombia" | "brasilia">("colombia");
  const [idioma, setIdioma] = useState<IdiomaInterface>("es");

  useEffect(() => {
    const fusoSalvo = localStorage.getItem("haas_professor_fuso");
    const idiomaSalvo = localStorage.getItem("haas_professor_idioma");
    if (fusoSalvo === "colombia" || fusoSalvo === "brasilia") setFuso(fusoSalvo);
    if (idiomaSalvo === "es" || idiomaSalvo === "en" || idiomaSalvo === "pt") setIdioma(idiomaSalvo);
  }, []);

  useEffect(() => {
    localStorage.setItem("haas_professor_fuso", fuso);
  }, [fuso]);

  useEffect(() => {
    localStorage.setItem("haas_professor_idioma", idioma);
  }, [idioma]);

  const [vistaAtiva, setVistaAtiva] = useState<"aulas" | "pago" | "prep" | "evaluar" | "materiales">("aulas");
  const [materiales, setMateriales] = useState<Material[]>([]);
  const [materialAbierto, setMaterialAbierto] = useState<Material | null>(null);
  const [gavetaSlidesAberta, setGavetaSlidesAberta] = useState<string | null>(null);
  const [pagoAberto, setPagoAberto] = useState(false);
  const [aulaReporte, setAulaReporte] = useState("");
  const [comentarioReporte, setComentarioReporte] = useState("");
  const [imagemReporte, setImagemReporte] = useState<File | null>(null);
  const [enviandoReporte, setEnviandoReporte] = useState(false);
  const [reporteMsg, setReporteMsg] = useState("");

  const abrirMaterial = (material: Material) => {
    setMaterialAbierto(material);
  };

  const cerrarMaterial = () => {
    const idMaterial = materialAbierto?.id;
    setMaterialAbierto(null);
    if (idMaterial) {
      setTimeout(async () => {
        setMateriales((prev) => prev.filter((m) => m.id !== idMaterial));
        await supabase.from("assignments_submissions").delete().eq("id", idMaterial);
      }, 180000);
    }
  };

  const marcarComoCompletada = (aulaId: string, userId: string) => {
    setPendentesAvaliacao((prev) => prev.filter((p) => !(p.aula_id === aulaId && p.user_id === userId)));
  };

  const enviarReporte = async () => {
    if (!professor || !aulaReporte) return;
    setEnviandoReporte(true);
    setReporteMsg("");
    try {
      let imageUrl = null;
      if (imagemReporte) {
        const nomeArquivo = `reporte_${Date.now()}_${imagemReporte.name}`;
        const { error: erroUpload } = await supabase.storage
          .from("reportes_profesor")
          .upload(nomeArquivo, imagemReporte);
        if (!erroUpload) {
          const { data: urlData } = supabase.storage.from("reportes_profesor").getPublicUrl(nomeArquivo);
          imageUrl = urlData.publicUrl;
        }
      }

      const { error } = await supabase.from("teacher_class_reports").insert([{
        teacher_id: professor.id,
        aula_id: aulaReporte,
        comment: comentarioReporte,
        image_url: imageUrl
      }]);

      setReporteMsg(error ? "error" : "ok");
      if (!error) {
        setAulaReporte("");
        setComentarioReporte("");
        setImagemReporte(null);
      }
    } catch (err) {
      setReporteMsg("error");
    } finally {
      setEnviandoReporte(false);
    }
  };
  const [metodoPago, setMetodoPago] = useState<"banco" | "nequi">("banco");
  const [formPago, setFormPago] = useState({
    bank_name: "", account_type: "Ahorros", account_number: "", account_holder_name: "", document_number: "", nequi_phone: ""
  });
  const [salvandoPago, setSalvandoPago] = useState(false);
  const [pagoSalvoMsg, setPagoSalvoMsg] = useState("");

  useEffect(() => {
    if (professor) {
      setMetodoPago((professor.payment_method as "banco" | "nequi") || "banco");
      setFormPago({
        bank_name: professor.bank_name || "",
        account_type: professor.account_type || "Ahorros",
        account_number: professor.account_number || "",
        account_holder_name: professor.account_holder_name || "",
        document_number: professor.document_number || "",
        nequi_phone: professor.nequi_phone || ""
      });
    }
  }, [professor]);

  const salvarDadosPago = async () => {
    if (!professor) return;
    setSalvandoPago(true);
    setPagoSalvoMsg("");
    const { error } = await supabase
      .from("teachers")
      .update({
        payment_method: metodoPago,
        bank_name: formPago.bank_name,
        account_type: formPago.account_type,
        account_number: formPago.account_number,
        account_holder_name: formPago.account_holder_name,
        document_number: formPago.document_number,
        nequi_phone: formPago.nequi_phone
      })
      .eq("id", professor.id);
    setSalvandoPago(false);
    setPagoSalvoMsg(error ? "error" : "ok");
    if (!error) {
      setProfessor({
        ...professor,
        payment_method: metodoPago,
        bank_name: formPago.bank_name,
        account_type: formPago.account_type,
        account_number: formPago.account_number,
        account_holder_name: formPago.account_holder_name,
        document_number: formPago.document_number,
        nequi_phone: formPago.nequi_phone
      });
      setPagoAberto(false);
    }
  };
  const [perfilAberto, setPerfilAberto] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("haas_teacher_id");
    localStorage.removeItem("haas_teacher_email");
    localStorage.removeItem("haas_teacher_name");
    window.location.href = "/login";
  };

  const t = TEXTOS[idioma];

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const teacherId = localStorage.getItem("haas_teacher_id");
        if (!teacherId) {
          setErro("Sesión no encontrada. Por favor inicia sesión de nuevo.");
          setLoading(false);
          return;
        }

        const { data: dadosProfessor, error: erroProfessor } = await supabase
          .from("teachers")
          .select("id, name, email, monthly_rate, rate_per_class, meeting_link, payment_status, payment_method, bank_name, account_type, account_number, account_holder_name, document_number, nequi_phone, punctuality_score, pedagogical_score")
          .eq("id", teacherId)
          .maybeSingle();

        if (erroProfessor || !dadosProfessor) {
          setErro("No se pudo cargar tu información. Contacta a soporte.");
          setLoading(false);
          return;
        }

        setProfessor(dadosProfessor);

        const { data: aulasReais, error: erroAulas } = await supabase
          .from("aulas_disponiveis")
          .select("id, data_hora_inicio, data_hora_fim, tipo_aula, vagas_maximas, vagas_ocupadas, status, idioma, slides_status, slides_pdf_path, slides_pptx_path")
          .eq("teacher_id", teacherId)
          .order("data_hora_inicio", { ascending: true });

        if (!erroAulas && aulasReais) {
          setAulas(aulasReais);
        }

        const { data: avaliacoesReais } = await supabase
          .from("teacher_reviews")
          .select("rating_stars, comment, class_date")
          .eq("teacher_name", dadosProfessor.name)
          .order("class_date", { ascending: false });

        if (avaliacoesReais) {
          setAvaliacoes(avaliacoesReais);
        }

        const { data: matriculas } = await supabase
          .from("aula_matriculas")
          .select("aula_id, user_id, aulas_disponiveis!inner(data_hora_fim, teacher_id), users!inner(name)")
          .eq("aulas_disponiveis.teacher_id", teacherId)
          .lt("aulas_disponiveis.data_hora_fim", new Date().toISOString());

        const { data: jaAvaliadas } = await supabase
          .from("class_evaluations")
          .select("aula_id, user_id")
          .eq("teacher_id", teacherId);

        if (matriculas) {
          const avaliadasSet = new Set((jaAvaliadas || []).map((a: any) => `${a.aula_id}_${a.user_id}`));
          const pendentes = matriculas
            .filter((m: any) => !avaliadasSet.has(`${m.aula_id}_${m.user_id}`))
            .map((m: any) => ({
              aula_id: m.aula_id,
              user_id: m.user_id,
              nome_aluno: m.users?.name || "Alumno",
              data_aula: m.aulas_disponiveis?.data_hora_fim || ""
            }));
          setPendentesAvaliacao(pendentes);
        }

        const { data: alunosDoProfessor } = await supabase
          .from("aula_matriculas")
          .select("user_id, aulas_disponiveis!inner(teacher_id)")
          .eq("aulas_disponiveis.teacher_id", teacherId);

        const idsAlunos = Array.from(new Set((alunosDoProfessor || []).map((a: any) => a.user_id)));

        if (idsAlunos.length > 0) {
          const { data: materiaisReais } = await supabase
            .from("assignments_submissions")
            .select("id, photo_url, created_at, user_id, users!inner(name)")
            .in("user_id", idsAlunos)
            .is("teacher_feedback", null)
            .order("created_at", { ascending: false });

          if (materiaisReais) {
            setMateriales(materiaisReais.map((m: any) => ({
              id: m.id,
              photo_url: m.photo_url,
              nome_aluno: m.users?.name || "Alumno",
              created_at: m.created_at
            })));
          }
        }
      } catch (err) {
        console.error("Error al cargar datos del profesor:", err);
        setErro("Ocurrió un error inesperado.");
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, []);

  const formatarMoeda = (valor: number | null) => {
    if (valor === null || valor === undefined) return "N/D";
    const formatado = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(valor);
    return `${formatado} ${t.pesos}`;
  };

  const formatarHorario = (iso: string) => {
    const zona = fuso === "colombia" ? "America/Bogota" : "America/Sao_Paulo";
    const etiqueta = fuso === "colombia" ? "Bogotá" : "Brasilia";
    return new Date(iso).toLocaleString("es-CO", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: zona }) + ` (${etiqueta})`;
  };

  const notaMedia = avaliacoes.length > 0
    ? (avaliacoes.reduce((soma, a) => soma + a.rating_stars, 0) / avaliacoes.length).toFixed(1)
    : null;

  const agora = new Date();
  const acumuladoMes = aulas
    .filter(a => {
      const dataFim = new Date(a.data_hora_fim);
      const jaAconteceu = dataFim < agora;
      const mesmoMes = dataFim.getMonth() === agora.getMonth() && dataFim.getFullYear() === agora.getFullYear();
      const naoCancelada = a.status !== "CANCELADO";
      return jaAconteceu && mesmoMes && naoCancelada;
    })
    .reduce((total) => total + (professor?.rate_per_class || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030914] flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="animate-spin text-cyan-400" size={32} />
        <p className="text-sm font-medium">{t.cargando}</p>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="min-h-screen bg-[#030914] flex flex-col items-center justify-center gap-3 text-slate-400 p-6 text-center">
        <p className="text-sm font-medium text-rose-400">{erro}</p>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-[#030914] text-slate-100 flex flex-col md:flex-row">
      <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`}</style>

      {menuAbierto && (
        <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setMenuAbierto(false)} />
      )}

      <aside className={`fixed left-0 top-0 h-full w-64 bg-[#0a1424] border-r border-white/10 p-6 flex flex-col justify-between gap-8 z-50 transition-transform duration-300 ${menuAbierto ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-gradient-to-tr from-cyan-500 to-purple-500 rounded-lg flex items-center justify-center font-black text-slate-950 text-lg">
                P
              </div>
              <div>
                <h1 className="font-bold text-base tracking-tight text-slate-100">Haas Docente</h1>
                <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">{t.subtitulo}</span>
              </div>
            </div>
            <button onClick={() => setMenuAbierto(false)} className="text-slate-500 hover:text-slate-300">
              <X size={18} />
            </button>
          </div>

          <nav className="flex flex-col gap-1.5">
            <button onClick={() => { setVistaAtiva("aulas"); setPerfilAberto(false); setMenuAbierto(false); }} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all text-left ${vistaAtiva === "aulas" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"}`}>
              <Calendar size={18} />
              <span>{t.misClases}</span>
            </button>
            <button onClick={() => { setVistaAtiva("pago"); setPerfilAberto(false); setMenuAbierto(false); }} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all text-left ${vistaAtiva === "pago" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"}`}>
              <DollarSign size={18} />
              <span>{t.datosPago}</span>
            </button>
            <button onClick={() => { setVistaAtiva("prep"); setPerfilAberto(false); setMenuAbierto(false); }} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all text-left ${vistaAtiva === "prep" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"}`}>
              <ExternalLink size={18} />
              <span>{t.prepClase}</span>
            </button>
            <button onClick={() => { setVistaAtiva("evaluar"); setPerfilAberto(false); setMenuAbierto(false); }} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all text-left ${vistaAtiva === "evaluar" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"}`}>
              <Users size={18} />
              <span>{idioma === "es" ? "Evaluar" : idioma === "en" ? "Evaluate" : "Avaliar"}</span>
              {pendentesAvaliacao.length > 0 && (
                <span className="ml-auto bg-cyan-500 text-slate-950 text-[10px] font-black rounded-full h-5 w-5 flex items-center justify-center">{pendentesAvaliacao.length}</span>
              )}
            </button>
            <button onClick={() => { setVistaAtiva("materiales"); setPerfilAberto(false); setMenuAbierto(false); }} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all text-left ${vistaAtiva === "materiales" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"}`}>
              <ShieldCheck size={18} />
              <span>{idioma === "es" ? "Materiales" : idioma === "en" ? "Materials" : "Materiais"}</span>
              {materiales.length > 0 && (
                <span className="ml-auto bg-cyan-500 text-slate-950 text-[10px] font-black rounded-full h-5 w-5 flex items-center justify-center">{materiales.length}</span>
              )}
            </button>
          </nav>
        </div>

        <div className="border-t border-white/10 pt-4 flex flex-col gap-2 relative">
          <button onClick={() => setPerfilAberto(!perfilAberto)} className="flex items-center gap-3 text-left w-full">
            <div className="h-10 w-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
              <User size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-200 truncate max-w-[120px]">{professor?.name || "Profesor"}</span>
              <span className="text-[10px] text-slate-500">{t.sesionActiva}</span>
            </div>
          </button>
          {perfilAberto && (
            <div className="flex flex-col gap-1.5 bg-white/5 border border-white/10 rounded-lg p-2">
              <button onClick={() => setPerfilAberto(false)} className="self-end text-slate-500 hover:text-slate-300 text-xs px-1 pb-1">
                {"\u2715"}
              </button>
              <a href="https://api.whatsapp.com/send/?phone=5491168809228&text&type=phone_number&app_absent=0" target="_blank"
                rel="noreferrer"
                className="text-xs text-slate-300 hover:text-cyan-400 px-2 py-1.5 rounded transition-colors text-left"
              >
                {t.soporte}
              </a>
              <button
                onClick={handleLogout}
                className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1.5 rounded transition-colors text-left"
              >
                {t.cerrarSesion}
              </button>
            </div>
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">

        <header className="h-16 border-b border-white/10 bg-[#030914]/80 backdrop-blur-md px-6 md:px-10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setMenuAbierto(true)} className="text-slate-400 hover:text-cyan-400 transition-colors">
              <Menu size={20} />
            </button>
            <div className="h-7 w-7 bg-gradient-to-tr from-cyan-500 to-purple-500 rounded-md flex items-center justify-center font-black text-slate-950 text-xs shrink-0">
              P
            </div>
            <span className="text-sm font-bold text-slate-100 truncate">Haas Docente</span>
            <span className="text-xs text-slate-500 truncate hidden sm:inline">{professor?.name}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIdioma(idioma === "es" ? "en" : idioma === "en" ? "pt" : "es")}
              className="text-xs bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 px-3 py-1.5 rounded-lg font-semibold transition-all"
            >
              {idioma === "es" ? "Español" : idioma === "en" ? "English" : "Português"}            </button>
            <button
              onClick={() => setFuso(fuso === "colombia" ? "brasilia" : "colombia")}
              className="text-xs bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 px-3 py-1.5 rounded-lg font-semibold transition-all"
            >
              {fuso === "colombia" ? "Bogotá" : "Brasilia"}
            </button>
          </div>
        </header>

        <main className="p-6 md:p-10 flex flex-col gap-8 flex-1 overflow-hidden max-w-6xl w-full mx-auto">

          {vistaAtiva === "aulas" && (
            <>
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#0a1424] border border-cyan-500/20 rounded-xl p-5 flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-400">
                    <Calendar size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t.clasesProgramadas}</span>
                    <span className="text-xl font-extrabold text-slate-100">{aulas.length}</span>
                  </div>
                </div>

                <div className="bg-[#0a1424] border border-amber-500/20 rounded-xl p-5 flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-amber-500/10 text-amber-400">
                    <Users size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t.calificacionProm}</span>
                    <span className="text-xl font-extrabold text-slate-100">{notaMedia ? `${notaMedia} / 5` : t.sinDatos}</span>
                    <span className="text-[10px] text-slate-500 mt-0.5">{avaliacoes.length} {avaliacoes.length === 1 ? t.resena : t.resenas}</span>
                  </div>
                </div>

                <div className="bg-[#0a1424] border border-emerald-500/20 rounded-xl p-5 flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Clock size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t.puntualidad}</span>
                    <span className="text-xl font-extrabold text-slate-100">{professor?.punctuality_score !== null && professor?.punctuality_score !== undefined ? `${professor.punctuality_score}%` : t.sinDatos}</span>
                  </div>
                </div>

                <div className="bg-[#0a1424] border border-purple-500/20 rounded-xl p-5 flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400">
                    <ShieldCheck size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t.evalPedagogica}</span>
                    <span className="text-xl font-extrabold text-slate-100">{professor?.pedagogical_score !== null && professor?.pedagogical_score !== undefined ? `${professor.pedagogical_score} / 10` : t.sinDatos}</span>
                  </div>
                </div>
              </section>

              <section className="bg-[#0a1424] border border-white/10 rounded-xl p-6 flex flex-col flex-1 min-h-0">
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4 shrink-0">
                  <div>
                    <h2 className="font-bold text-base text-slate-200">{t.tusClases}</h2>
                    <p className="text-xs text-slate-500 mt-0.5">{t.horarioReal}</p>
                  </div>
                </div>

                {aulas.length === 0 ? (
                  <div className="text-center py-12 text-sm text-slate-500 border border-dashed border-white/10 rounded-xl">
                    {t.sinClases}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 flex-1 min-h-0 overflow-y-auto pr-1 scrollbar-hide">
                    {aulas.map((aula) => (
                      <div key={aula.id} className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-lg p-4 hover:bg-white/[0.04] transition-colors">
                        <div className="flex items-center gap-3">
                          <Users size={16} className="text-cyan-400" />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-slate-200">{TRADUCAO_TIPO_AULA[idioma][aula.tipo_aula] || aula.tipo_aula} - {TRADUCAO_IDIOMA_AULA[idioma][aula.idioma] || aula.idioma}</span>
                            <span className="text-xs text-slate-500 font-mono">{formatarHorario(aula.data_hora_inicio)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-400">{aula.vagas_ocupadas}/{aula.vagas_maximas} {t.alumnos}</span>
                          <div className="relative">
                            <button onClick={() => setGavetaSlidesAberta(gavetaSlidesAberta === aula.id ? null : aula.id)} className="inline-flex items-center gap-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 text-xs font-bold py-1.5 px-3 rounded-lg transition-all">
                              {t.accederDiapositivas}
                            </button>
                            {gavetaSlidesAberta === aula.id && (
                              <div className="absolute right-0 top-full mt-1 z-20 bg-[#0a1424] border border-white/10 rounded-lg p-2 flex flex-col gap-1.5 min-w-[140px] shadow-xl">
                                {aula.slides_status !== "pronto" ? (
                                  <span className="text-[10px] text-slate-500 px-2 py-1">
                                    {idioma === "es" ? "Generando..." : idioma === "en" ? "Generating..." : "Gerando..."}
                                  </span>
                                ) : (
                                  <>
                                    {aula.slides_pdf_path && (
                                      <a href={`/api/ai/baixar-slides?path=${encodeURIComponent(aula.slides_pdf_path)}`} className="text-xs text-slate-300 hover:text-rose-400 px-2 py-1.5 rounded transition-colors text-left">
                                        PDF
                                      </a>
                                    )}
                                    {aula.slides_pptx_path && (
                                      <a href={`/api/ai/baixar-slides?path=${encodeURIComponent(aula.slides_pptx_path)}`} className="text-xs text-slate-300 hover:text-orange-400 px-2 py-1.5 rounded transition-colors text-left">
                                        PowerPoint
                                      </a>
                                    )}
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                          {professor?.meeting_link && (
                            <a href={professor.meeting_link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold py-1.5 px-3 rounded-lg transition-all">
                              {t.entrarClase} <ExternalLink size={11} />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}

          {vistaAtiva === "pago" && (
            <>
              <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#0a1424] border border-emerald-500/20 rounded-xl p-5 flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <DollarSign size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t.tarifaClase}</span>
                    <span className="text-xl font-extrabold text-slate-100">{formatarMoeda(professor?.rate_per_class ?? null)}</span>
                  </div>
                </div>

                <div className="bg-[#0a1424] border border-purple-500/20 rounded-xl p-5 flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400">
                    <DollarSign size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t.acumuladoMes}</span>
                    <span className="text-xl font-extrabold text-slate-100">{formatarMoeda(acumuladoMes)}</span>
                    <span className={`text-[10px] font-semibold mt-0.5 ${professor?.payment_status === "pagado" ? "text-emerald-400" : "text-amber-400"}`}>
                      {professor?.payment_status === "pagado" ? t.pagado : t.pendiente}
                    </span>
                  </div>
                </div>
              </section>

              <section className="bg-[#0a1424] border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                  <div>
                    <h2 className="font-bold text-base text-slate-200">{idioma === "es" ? "Datos de pago" : idioma === "en" ? "Payment details" : "Dados de pagamento"}</h2>
                    <p className="text-xs text-slate-500 mt-0.5">{idioma === "es" ? "Completa tus datos para recibir el pago sin tener que contactarnos." : idioma === "en" ? "Complete your information to receive payment without having to contact us." : "Preencha seus dados para receber o pagamento sem precisar entrar em contato conosco."}</p>
                  </div>
                  <button onClick={() => setPagoAberto(!pagoAberto)} className="text-xs bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 px-3 py-1.5 rounded-lg font-semibold transition-all">
                    {pagoAberto ? (idioma === "es" ? "Ocultar" : idioma === "en" ? "Hide" : "Ocultar") : (professor?.payment_method ? (idioma === "es" ? "Editar" : idioma === "en" ? "Edit" : "Editar") : (idioma === "es" ? "Completar" : idioma === "en" ? "Complete" : "Completar"))}
                  </button>
                </div>

                {professor?.payment_method && !pagoAberto && (
                  <div className="text-xs text-slate-400 bg-white/[0.02] border border-white/5 rounded-lg p-3">
                    {professor.payment_method === "banco" ? `Cuenta bancaria: ${professor.bank_name || ""} - ${professor.account_number || ""}` : `Nequi: ${professor.nequi_phone || ""}`}
                  </div>
                )}

                {pagoAberto && (
                  <div className="flex flex-col gap-4">
                    <div className="flex gap-2">
                      <button onClick={() => setMetodoPago("banco")} className={`flex-1 text-xs py-2 rounded-lg font-semibold border transition-all ${metodoPago === "banco" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30" : "bg-white/5 text-slate-400 border-white/10"}`}>
                        Cuenta bancaria
                      </button>
                      <button onClick={() => setMetodoPago("nequi")} className={`flex-1 text-xs py-2 rounded-lg font-semibold border transition-all ${metodoPago === "nequi" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30" : "bg-white/5 text-slate-400 border-white/10"}`}>
                        Nequi
                      </button>
                    </div>

                    {metodoPago === "banco" ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input value={formPago.bank_name} onChange={(e) => setFormPago({ ...formPago, bank_name: e.target.value })} placeholder="Nombre del banco" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-500/50" />
                        <select value={formPago.account_type} onChange={(e) => setFormPago({ ...formPago, account_type: e.target.value })} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-500/50">
                          <option value="Ahorros">Cuenta de ahorros</option>
                          <option value="Corriente">Cuenta corriente</option>
                        </select>
                        <input value={formPago.account_number} onChange={(e) => setFormPago({ ...formPago, account_number: e.target.value })} placeholder="Numero de cuenta" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-500/50" />
                        <input value={formPago.account_holder_name} onChange={(e) => setFormPago({ ...formPago, account_holder_name: e.target.value })} placeholder="Nombre del titular" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-500/50" />
                        <input value={formPago.document_number} onChange={(e) => setFormPago({ ...formPago, document_number: e.target.value })} placeholder="Numero de cedula" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-500/50 sm:col-span-2" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input value={formPago.nequi_phone} onChange={(e) => setFormPago({ ...formPago, nequi_phone: e.target.value })} placeholder="Numero de celular con Nequi" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-500/50" />
                        <input value={formPago.account_holder_name} onChange={(e) => setFormPago({ ...formPago, account_holder_name: e.target.value })} placeholder="Nombre del titular" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-500/50" />
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <button onClick={salvarDadosPago} disabled={salvandoPago} className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 text-xs font-bold py-2 px-4 rounded-lg transition-all">
                        {salvandoPago ? "Guardando..." : "Guardar datos"}
                      </button>
                      {pagoSalvoMsg === "ok" && <span className="text-xs text-emerald-400 font-semibold">Guardado correctamente</span>}
                      {pagoSalvoMsg === "error" && <span className="text-xs text-rose-400 font-semibold">Error al guardar, intenta de nuevo</span>}
                    </div>
                  </div>
                )}
              </section>
            </>
          )}

          {vistaAtiva === "prep" && (
            <div className="flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto scrollbar-hide">
              <section className="bg-[#0a1424] border border-white/10 rounded-xl p-6">
                <h2 className="font-bold text-base text-slate-200 mb-4">
                  {idioma === "es" ? "Cómo dar tu clase" : idioma === "en" ? "How to run your class" : "Como dar sua aula"}
                </h2>
                <div className="flex flex-col gap-3">
                  {INSTRUCCIONES[idioma].map((item, i) => (
                    <div key={i} className="bg-white/[0.02] border border-white/5 rounded-lg p-4">
                      <p className="text-sm font-semibold text-cyan-400 mb-1">{item.titulo}</p>
                      <p className="text-xs text-slate-400 leading-relaxed">{item.texto}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-[#0a1424] border border-white/10 rounded-xl p-6">
                <h2 className="font-bold text-base text-slate-200 mb-1">
                  {idioma === "es" ? "Evaluar clase" : idioma === "en" ? "Evaluate class" : "Avaliar aula"}
                </h2>
                <p className="text-xs text-slate-500 mb-4">
                  {idioma === "es" ? "Al terminar la clase, califica brevemente cómo te fue." : idioma === "en" ? "After class, briefly rate how it went." : "Ao terminar a aula, avalie brevemente como foi."}
                </p>
                <div className="flex flex-col gap-3">
                  <select value={aulaReporte} onChange={(e) => setAulaReporte(e.target.value)} className="bg-[#0a1424] border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-500/50">
                    <option value="" className="bg-[#0a1424] text-slate-200">{idioma === "es" ? "Selecciona la clase" : idioma === "en" ? "Select the class" : "Selecione a aula"}</option>
                    {aulas.map((aula) => (
                      <option key={aula.id} value={aula.id} className="bg-[#0a1424] text-slate-200">{formatarHorario(aula.data_hora_inicio)}</option>
                    ))}
                  </select>
                  <textarea value={comentarioReporte} onChange={(e) => setComentarioReporte(e.target.value)} placeholder={idioma === "es" ? "Comentarios sobre la clase (opcional)" : idioma === "en" ? "Comments about the class (optional)" : "Comentarios sobre a aula (opcional)"} rows={3} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-500/50 resize-none" />
                  <input type="file" accept="image/*" onChange={(e) => setImagemReporte(e.target.files ? e.target.files[0] : null)} className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-white/10 file:text-slate-300 file:text-xs" />
                  <div className="flex items-center gap-3">
                    <button onClick={enviarReporte} disabled={enviandoReporte || !aulaReporte} className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 text-xs font-bold py-2 px-4 rounded-lg transition-all">
                      {enviandoReporte ? (idioma === "es" ? "Guardando..." : idioma === "en" ? "Saving..." : "Salvando...") : (idioma === "es" ? "Guardar" : idioma === "en" ? "Save" : "Salvar")}
                    </button>
                    {reporteMsg === "ok" && <span className="text-xs text-emerald-400 font-semibold">{idioma === "es" ? "Guardado" : idioma === "en" ? "Saved" : "Salvo"}</span>}
                    {reporteMsg === "error" && <span className="text-xs text-rose-400 font-semibold">{idioma === "es" ? "Error al guardar" : idioma === "en" ? "Error saving" : "Erro ao salvar"}</span>}
                  </div>
                </div>
              </section>
            </div>
          )}

          {vistaAtiva === "evaluar" && (
            <section className="bg-[#0a1424] border border-white/10 rounded-xl p-6 flex-1 min-h-0 overflow-y-auto scrollbar-hide">
              <h2 className="font-bold text-base text-slate-200 mb-1">
                {idioma === "es" ? "Evaluar alumnos" : idioma === "en" ? "Evaluate students" : "Avaliar alunos"}
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                {idioma === "es" ? "Se guarda solo con habla, escucha y gramática completos" : idioma === "en" ? "Saves once speaking, listening and grammar are filled" : "Salva assim que fala, escuta e gramática forem preenchidos"}
              </p>
              {pendentesAvaliacao.length === 0 ? (
                <div className="text-center py-12 text-sm text-slate-500 border border-dashed border-white/10 rounded-xl">
                  {idioma === "es" ? "No hay evaluaciones pendientes" : idioma === "en" ? "No pending evaluations" : "Nenhuma avaliacao pendente"}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {pendentesAvaliacao.slice(0, 6).map((p) => (
                    <TarjetaEvaluacionPequena key={`${p.aula_id}_${p.user_id}`} pendente={p} professorId={professor?.id} idioma={idioma} onCompletado={marcarComoCompletada} />
                  ))}
                </div>
              )}
            </section>
          )}

          {vistaAtiva === "materiales" && (
            <section className="bg-[#0a1424] border border-white/10 rounded-xl p-6 flex-1 min-h-0 overflow-y-auto scrollbar-hide">
              <h2 className="font-bold text-base text-slate-200 mb-4">
                {idioma === "es" ? "Materiales para corregir" : idioma === "en" ? "Materials to review" : "Materiais para corrigir"}
              </h2>
              {materiales.length === 0 ? (
                <div className="text-center py-12 text-sm text-slate-500 border border-dashed border-white/10 rounded-xl">
                  {idioma === "es" ? "No hay materiales pendientes" : idioma === "en" ? "No pending materials" : "Nenhum material pendente"}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {materiales.map((m) => (
                    <button key={m.id} onClick={() => abrirMaterial(m)} className="bg-white/[0.02] border border-white/5 hover:border-cyan-500/30 rounded-lg overflow-hidden text-left transition-all">
                      <img src={m.photo_url} alt={m.nome_aluno} className="w-full h-24 object-cover" />
                      <div className="p-2">
                        <p className="text-[10px] font-semibold text-slate-200 truncate">{m.nome_aluno}</p>
                        <p className="text-[9px] text-slate-500">{new Date(m.created_at).toLocaleDateString(idioma === "en" ? "en-US" : "es-CO")}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </section>
          )}

          {materialAbierto && (
            <VisorMaterial material={materialAbierto} idioma={idioma} onCerrar={cerrarMaterial} />
          )}

        </main>      </div>
    </div>
  );
}
