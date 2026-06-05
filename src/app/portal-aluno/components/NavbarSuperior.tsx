'use client';
import React from 'react';
import { Home, MapPin, Gift, BookOpen, Trophy, Shield, Box, Sparkles, GraduationCap, Swords } from 'lucide-react';

export function NavbarSuperior({ t }) {
  return (
    <div className="bg-[#0A131C] border border-[#1C2C39] rounded-2xl p-3 flex justify-between items-center shadow-2xl">
      <nav className="flex gap-5 text-[10px] font-black uppercase tracking-wider font-sans items-center pl-1">
        <button className="flex flex-col items-center justify-center gap-0.5 text-orange-400 font-black border-b-2 border-orange-400 pb-0.5 transition-all">
          <Home size={15} className="text-orange-400 fill-orange-400/20" /> <span>{t.inicio}</span>
        </button>
        <button className="flex flex-col items-center justify-center gap-0.5 text-[#3CD070] hover:text-white font-bold transition-all">
          <MapPin size={15} className="text-[#3CD070]" /> <span>{t.trilha}</span>
        </button>
        <button className="flex flex-col items-center justify-center gap-0.5 text-rose-400 hover:text-white font-bold transition-all">
          <Gift size={15} className="text-rose-400" /> <span>{t.recompensas}</span>
        </button>
        <button className="flex flex-col items-center justify-center gap-0.5 text-purple-400 hover:text-white font-bold transition-all">
          <BookOpen size={15} className="text-purple-400" /> <span>{t.recursos}</span>
        </button>
        <button className="flex flex-col items-center justify-center gap-0.5 text-amber-400 hover:text-white font-bold transition-all">
          <Trophy size={15} className="text-amber-400" /> <span>{t.desafios}</span>
        </button>
        <button className="flex flex-col items-center justify-center gap-0.5 text-blue-400 hover:text-white font-bold transition-all">
          <Shield size={15} className="text-blue-400" /> <span>{t.ligas}</span>
        </button>
        <button className="flex flex-col items-center justify-center gap-0.5 text-amber-600 hover:text-white font-bold transition-all">
          <Box size={15} className="text-amber-600" /> <span>{t.bau}</span>
        </button>
        <button className="flex flex-col items-center justify-center gap-0.5 text-cyan-400 hover:text-white font-bold transition-all">
          <Sparkles size={15} className="text-cyan-400" /> <span>Online</span>
        </button>
        <button className="flex flex-col items-center justify-center gap-0.5 text-emerald-400 hover:text-white font-bold transition-all">
          <GraduationCap size={15} className="text-emerald-400" /> <span>Classroom</span>
        </button>
        <button className="flex flex-col items-center justify-center gap-0.5 text-indigo-400 hover:text-white font-bold transition-all">
          <Swords size={15} className="text-indigo-400" /> <span>Praticar</span>
        </button>
      </nav>
      
      <div className="flex items-center gap-3 pr-1">
        <div className="flex items-center bg-[#101D28] border border-[#1C2C39] px-3 py-1.5 rounded-xl shadow-md font-mono text-[10px] font-black text-white">
          <span className="text-[#3CD070] mr-1">🎯</span>
          <span className="text-slate-400 mr-1">{t.objetivo}:</span>
          <span>--- XP</span>
        </div>
        
        <div className="flex items-center gap-2.5 bg-[#101D28] border border-cyan-500/40 rounded-xl px-4 py-1.5 shadow-xl font-mono">
          <div className="text-right">
            <div className="text-[8px] text-slate-400 font-bold uppercase leading-none">{t.proximaConquista}</div>
            <div className="text-sm font-black text-[#00E5FF] tracking-wide mt-0.5 filter drop-shadow-[0_0_6px_rgba(0,229,255,0.6)]">
              Recorde: -- dias
            </div>
          </div>
          <Trophy size={16} className="text-[#00E5FF] filter drop-shadow-[0_0_8px_rgba(6,182,212,0.6)] animate-pulse" />
        </div>
      </div>
    </div>
  );
}
