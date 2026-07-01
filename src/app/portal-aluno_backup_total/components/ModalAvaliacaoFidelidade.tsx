"use client";

import React, { useState, useRef, useEffect } from "react";
import { ShieldCheck, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  idioma: "PT" | "EN" | "ES";
}

export default function ModalAvaliacaoFidelidade({ isOpen, onClose, idioma }: Props) {
  const [classDate, setClassDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [teacherScore, setTeacherScore] = useState(5);
  const [materialScore, setMaterialScore] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  // Estados para o mini calendário controlado
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentNavDate, setCurrentNavDate] = useState(new Date());
  const calendarRef = useRef<HTMLDivElement>(null);

  // Fecha o calendário se clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const t = {
    PT: { title: "AVALIAÇÃO DO PROFESSOR", desc: "Este formulário é 100% anônimo para proteger sua privacidade.", qDate: "DATA DA AULA", q1: "1. Desempenho do Professor", q2: "2. Alinhamento do Material", comment: "Comentários ou Sugestões", btn: "Submeter Avaliação", success: "✓ Obrigado pelo Feedback!", close: "FECHAR" },
    EN: { title: "TEACHER EVALUATION", desc: "This form is 100% anonymous to protect your privacy.", qDate: "CLASS DATE", q1: "1. Teacher Performance", q2: "2. Material Alignment", comment: "Comments or Suggestions", btn: "Submit Evaluation", success: "✓ Thank you for your feedback!", close: "CLOSE" },
    ES: { title: "EVALUACIÓN DEL PROFESOR", desc: "Este formulario es 100% anónimo para proteger su privacidad.", qDate: "FECHA DE LA CLASE", q1: "1. Desempeño del Profesor", q2: "2. Alineación del Material", comment: "Comentarios o Sugerencias", btn: "Enviar Evaluación", success: "✓ ¡Recibido con éxito!", close: "CERRAR" }
  }[idioma] || { title: "AVALIAÇÃO DO PROFESSOR", desc: "Este formulário é 100% anônimo para proteger sua privacidade.", qDate: "DATA DA AULA", q1: "1. Desempenho do Professor", q2: "2. Alinhamento do Material", comment: "Comentários ou Sugestões", btn: "Enviar Avaliação", success: "✓ Obrigado pelo seu feedback!" };

  // Dicionários locais de localização para o Calendário Controlado
  const i18nCalendar = {
    PT: {
      weekDays: ["D", "S", "T", "Q", "Q", "S", "S"],
      months: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]
    },
    EN: {
      weekDays: ["S", "M", "T", "W", "T", "F", "S"],
      months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    },
    ES: {
      weekDays: ["D", "L", "M", "X", "J", "V", "S"],
      months: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
    }
  }[idioma];

  // Auxiliares para geração dos dias do mês
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
    if (idioma === "EN") return `${m}/${d}/${y}`;
    return `${d}/${m}/${y}`;
  }

  function handleSelectDay(day: number) {
    const formattedMonth = String(month + 1).padStart(2, "0");
    const formattedDay = String(day).padStart(2, "0");
    setClassDate(`${year}-${formattedMonth}-${formattedDay}`);
    setShowCalendar(false);
  }

  async function salvarFeedback() {
    setLoading(true);
    try {
      await supabase.from("student_feedbacks").insert({
        class_date: classDate,
        teacher_score: teacherScore,
        material_score: materialScore,
        platform_score: 5,
        written_comment: comment || null
      });
      setSucesso(true);
      setTimeout(() => {
        setSucesso(false);
        setComment("");
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`fixed inset-0 z-50 transition-all duration-300 flex items-center justify-center p-4 ${isOpen ? 'visible' : 'invisible'}`}>
      <div onClick={onClose} className={`absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} />
      
      <div className={`relative w-full max-w-md bg-[#030914] border border-white/[0.06] rounded-[24px] p-6 flex flex-col gap-4 shadow-2xl transition-all duration-300 transform ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <h2 className="text-xs font-black tracking-widest text-white uppercase flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            {t.title}
          </h2>
          <button type="button" onClick={onClose} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[9px] font-black font-mono border-none cursor-pointer">
            {idioma === 'PT' ? 'FECHAR' : idioma === 'ES' ? 'CERRAR' : 'CLOSE'}
          </button>
        </div>

        {sucesso ? (
          <div className="text-center py-8 text-emerald-400 font-mono text-xs font-bold animate-pulse">{t.success}</div>
        ) : (
          <div className="space-y-4">
            <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3 flex gap-2 items-center">
              <ShieldCheck size={14} className="text-amber-500 shrink-0" />
              <span className="text-[10px] text-slate-400 font-medium leading-tight">{t.desc}</span>
            </div>

            {/* SELETOR DE DATA INTERNACIONALIZADO CONTROLADO */}
            <div className="space-y-1.5 relative" ref={calendarRef}>
              <label className="text-[10px] font-black text-slate-400 uppercase font-mono tracking-wider flex items-center gap-1.5">
                <Calendar size={12} className="text-amber-500" />
                {t.qDate}
              </label>
              
              <div 
                onClick={() => setShowCalendar(!showCalendar)}
                className="w-full bg-white/5 border border-white/[0.08] hover:border-white/20 rounded-xl px-4 py-3 text-xs font-mono font-bold text-slate-200 flex justify-between items-center cursor-pointer transition-all"
              >
                <span>{formatDisplayDate(classDate)}</span>
                <Calendar size={14} className="text-amber-500/80" />
              </div>

              {/* POPUP DO CALENDÁRIO FLUTUANTE PREMIUM MULTILÍNGUE */}
              {showCalendar && (
                <div className="absolute top-[105%] left-0 w-full bg-[#070e1e] border border-white/[0.08] rounded-2xl p-4 shadow-2xl z-50 flex flex-col gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <button 
                      type="button" 
                      onClick={() => setCurrentNavDate(new Date(year, month - 1, 1))}
                      className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer border-none"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-xs font-mono font-black text-slate-200 uppercase tracking-wide">
                      {i18nCalendar.months[month]} {year}
                    </span>
                    <button 
                      type="button" 
                      onClick={() => setCurrentNavDate(new Date(year, month + 1, 1))}
                      className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer border-none"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  {/* Dias da semana em PT/EN/ES */}
                  <div className="grid grid-cols-7 text-center text-[10px] font-mono font-bold text-slate-500 uppercase">
                    {i18nCalendar.weekDays.map((wd, index) => (
                      <div key={index}>{wd}</div>
                    ))}
                  </div>

                  {/* Grid de dias dinâmicos */}
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {gridCells.map((day, index) => {
                      if (day === null) return <div key={index} />;
                      const formattedM = String(month + 1).padStart(2, "0");
                      const formattedD = String(day).padStart(2, "0");
                      const currentLoopStr = `${year}-${formattedM}-${formattedD}`;
                      const isSelected = classDate === currentLoopStr;

                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSelectDay(day)}
                          className={`py-1.5 rounded-lg text-xs font-mono font-bold transition-all border-none cursor-pointer ${
                            isSelected 
                              ? "bg-amber-500 text-black shadow-md" 
                              : "text-slate-300 bg-white/[0.02] hover:bg-amber-500/15 hover:text-amber-400"
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase font-mono tracking-wider">{t.q1}</label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button key={num} type="button" onClick={() => setTeacherScore(num)} className={`flex-1 py-2 rounded-xl border font-mono text-xs font-bold transition-all ${teacherScore === num ? "bg-amber-500 text-black border-amber-400" : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"}`}>{num} ★</button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase font-mono tracking-wider">{t.q2}</label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button key={num} type="button" onClick={() => setMaterialScore(num)} className={`flex-1 py-2 rounded-xl border font-mono text-xs font-bold transition-all ${materialScore === num ? "bg-amber-500 text-black border-amber-400" : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"}`}>{num} ★</button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase font-mono tracking-wider">{t.comment}</label>
              <textarea 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="..."
                rows={3}
                className="w-full bg-white/5 border border-white/5 rounded-xl p-3 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-amber-500/40 focus:bg-white/10 transition-all resize-none"
              />
            </div>

            <button 
              type="button" 
              onClick={salvarFeedback}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/40 text-black text-xs font-black uppercase font-mono tracking-wider transition-all shadow-md transform active:scale-[0.98] cursor-pointer mt-2"
            >
              {loading ? "..." : t.btn}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
