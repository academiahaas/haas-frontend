/* =========================================================================
  COMPONENTE: SELETOR DE IDIOMAS AUXILIARES (HAAS GLOBAL COMPLIANCE)
  =========================================================================
*/

'use client';

import React, { useState, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';

interface Language {
  code: string;
  label: string;
  flag: string;
}

export function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('PT');

  const idiomas: Language[] = [
    { code: 'PT', label: 'Português', flag: '🇧🇷' },
    { code: 'ES', label: 'Español', flag: '🇪🇸' },
    { code: 'FR', label: 'Français', flag: '🇫🇷' },
    { code: 'DE', label: 'Deutsch', flag: '🇩🇪' },
  ];

  useEffect(() => {
    const salvo = localStorage.getItem('haas_idioma_auxiliar');
    if (salvo) setCurrentLang(salvo);
  }, []);

  const selecionarIdioma = (code: string) => {
    setCurrentLang(code);
    setIsOpen(false);
    localStorage.setItem('haas_idioma_auxiliar', code);
  };

  return (
    <div className="relative z-[100]">
      {/* Botão de ativação do Dropdown */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 bg-[#142334] border border-slate-700/50 hover:border-cyan-500/50 px-2.5 py-1.5 rounded-xl shadow-md transition-all h-[34px] group"
      >
        <Globe size={13} className="text-cyan-400 group-hover:rotate-12 transition-transform" />
        <span className="text-[10px] font-mono font-black text-slate-300 group-hover:text-white uppercase tracking-wider">
          AUX: {currentLang}
        </span>
      </button>

      {/* Menu flutuante de bandeiras */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          
          <div className="absolute right-0 mt-1.5 w-36 bg-[#101f30]/95 border border-slate-800 rounded-xl p-1 shadow-2xl backdrop-blur-md z-20">
            <div className="px-2 py-1 text-[8px] font-mono font-black text-slate-500 uppercase tracking-widest border-b border-slate-800/60 mb-1">
              Idioma de Suporte
            </div>
            {idiomas.map((lang) => (
              <button
                key={lang.code}
                onClick={() => selecionarIdioma(lang.code)}
                className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                  currentLang === lang.code
                    ? 'bg-cyan-500/10 text-cyan-400'
                    : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{lang.flag}</span>
                  <span>{lang.label}</span>
                </div>
                {currentLang === lang.code && <Check size={10} strokeWidth={3} />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}