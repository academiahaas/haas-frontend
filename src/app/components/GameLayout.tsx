'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Target, Flame } from 'lucide-react';
export function GameLayout({ children, tituloEjercicio, tipoTipo, xpActual = 320 }) {
  const router = useRouter();
  return (
    <div className='fixed inset-0 w-screen h-screen bg-[#0b1724] text-slate-100 flex flex-col overflow-hidden select-none'>
      <header className='h-[10%] w-full bg-[#0b1c2c] border-b border-[#233744]/40 px-6 flex items-center justify-between shadow-md shrink-0'>
        <div className='flex items-center gap-4'>
          <button type='button' onClick={() => { if(confirm('¿Salir?')) router.push('/portal-aluno'); }} className='p-2 bg-[#1a2d42] border border-[#2d4356] rounded-xl text-slate-400 cursor-pointer'><ChevronLeft size={16} /></button>
          <div>
            <span className='text-[9px] bg-indigo-900/60 text-indigo-300 border border-indigo-700/50 px-2 py-0.5 rounded-full font-black uppercase font-mono'>Misión: {tipoTipo}</span>
            <h1 className='text-xs font-black text-white uppercase tracking-wide mt-0.5'>{tituloEjercicio}</h1>
          </div>
        </div>
        <div className='flex items-center gap-3'>
          <div className='bg-[#0f1d2c] border border-[#233744]/40 px-3 py-1.5 rounded-xl flex items-center gap-2'>
            <Target size={13} className='text-[#3CD070]' />
            <span className='text-[10px] text-slate-300 font-bold font-mono'>SCORE: <span className='text-white font-black'>{xpActual} XP</span></span>
          </div>
        </div>
      </header>
      <main className='flex-1 w-full bg-gradient-to-b from-[#0b1724] to-[#122538] relative overflow-y-auto p-6 flex flex-col items-center justify-center'>{children}</main>
    </div>
  );
}
