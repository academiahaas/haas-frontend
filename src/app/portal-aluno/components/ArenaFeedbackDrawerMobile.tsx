"use client";

import React from "react";
import { CheckCircle2, XCircle, ArrowRight, Lightbulb, ChevronUp, ChevronDown } from "lucide-react";

interface ArenaFeedbackDrawerMobileProps {
  isOpen: boolean;
  isCorreto?: boolean;
  respostaCorreta?: string;
  feedbackPedagogico?: string;
  onAvancar?: () => void;
}

export default function ArenaFeedbackDrawerMobile({
  isOpen,
  isCorreto = true,
  respostaCorreta,
  feedbackPedagogico,
  onAvancar
}: ArenaFeedbackDrawerMobileProps) {
  const [expandido, setExpandido] = React.useState(false);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-[9999] transition-all duration-300 ease-out border-t shadow-[0_-10px_30px_rgba(0,0,0,0.8)] backdrop-blur-2xl ${
        isCorreto
          ? "bg-[#061e14]/95 border-emerald-500/40"
          : "bg-[#21090e]/95 border-rose-500/40"
      }`}
    >
      <div className="flex justify-center pt-1.5">
        <button
          onClick={() => setExpandido(!expandido)}
          className="text-slate-400 hover:text-white p-1 rounded-full bg-slate-900/60"
        >
          {expandido ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
        </button>
      </div>

      <div className="p-4 sm:p-5 pt-1 flex flex-col gap-3 font-sans max-w-lg mx-auto">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {isCorreto ? (
              <CheckCircle2 size={24} className="text-emerald-400 shrink-0" />
            ) : (
              <XCircle size={24} className="text-rose-400 shrink-0" />
            )}
            <div>
              <h4 className={`font-black text-sm sm:text-base ${isCorreto ? "text-emerald-400" : "text-rose-400"}`}>
                {isCorreto ? "¡Excelente! Respuesta Correcta" : "Respuesta Incorrecta"}
              </h4>
              {!isCorreto && respostaCorreta && (
                <p className="text-xs text-slate-300 font-medium">
                  Respuesta correcta: <span className="font-bold text-emerald-300">{respostaCorreta}</span>
                </p>
              )}
            </div>
          </div>

          {onAvancar && (
            <button
              onClick={onAvancar}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-lg active:scale-95 transition-all shrink-0 ${
                isCorreto
                  ? "bg-emerald-500 hover:bg-emerald-400 text-black font-black"
                  : "bg-rose-500 hover:bg-rose-400 text-white font-black"
              }`}
            >
              <span>Continuar</span>
              <ArrowRight size={16} />
            </button>
          )}
        </div>

        {(feedbackPedagogico || expandido) && (
          <div className="mt-1 p-3 rounded-xl bg-slate-950/60 border border-white/5 text-xs text-slate-200 flex items-start gap-2.5">
            <Lightbulb size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {feedbackPedagogico || "Sigue practicando para consolidar tu aprendizaje en esta unidad."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
