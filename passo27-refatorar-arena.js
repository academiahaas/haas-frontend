const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/portal-aluno/components/ArenaQuiz.tsx');

const codigoNovoArena = `"use client";
import React, { useState, useEffect } from 'react';

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
  gameType?: string; // Prop dinâmico recebido do portal do aluno
}

export default function ArenaQuiz({ isOpen, onClose, userId, gameType }: ArenaProps) {
  const [modoDevAtivo, setModoDevAtivo] = useState(false);
  const [jogoSelecionado, setJogoSelecionado] = useState('multipla');

  // Sincronizar o tipo de jogo sempre que o portal disparar um botão diferente
  useEffect(() => {
    if (gameType) {
      setJogoSelecionado(gameType);
    }
  }, [gameType]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('dev') === 'true') {
        setModoDevAtivo(true);
      }
    }
  }, []);

  if (!isOpen) return null;

  const todosOsJogos = [
    { id: 'multipla', label: '🎯 MÚLTIPLA', title: 'Multiple Choice Challenge', component: <MioloMultiplaEscolha /> },
    { id: 'erro', label: '🔍 CAÇA ERRO', title: 'Find the Syntax Error', component: <MioloCacaErro /> },
    { id: 'blitz', label: '⚡ BLITZ', title: 'Blitz Speed Challenge', component: <MioloBlitzChallenge /> },
    { id: 'ditado', label: '✍️ DITADO', title: 'Listening Dictation', component: <DitadoLacunas /> },
    { id: 'blocos', label: '📦 BLOCOS', title: 'Block Building Grammar', component: <MioloBlocos /> },
    { id: 'leitura', label: '📖 LEITURA RÁPIDA', title: 'Speed Reading Exercise', component: <MioloLeituraRapida /> },
    { id: 'ordenacao', label: '🔢 ORDENAÇÃO', title: 'Sentence Structure Ordering', component: <MioloOrdenacao /> },
    { id: 'paragrafos', label: '📄 PARÁGRAFOS', title: 'Paragraph Reordering', component: <MioloReordenacaoParagrafos /> },
    { id: 'roleplay', label: '🎭 ROLEPLAY', title: 'AI Conversational Roleplay', component: <MioloRoleplay /> },
    { id: 'shadowing', label: '🗣️ SHADOWING', title: 'Pronunciation Shadowing Lab', component: <MioloShadowing /> },
    { id: 'spelling', label: '🐝 SPELLING BEE', title: 'Technical Spelling Bee', component: <MioloSpellingBee /> },
    { id: 'traducao', label: '🔄 REVERSO', title: 'Inverse Translation Challenge', component: <MioloTraducaoInversa /> },
    { id: 'velocidade', label: '📈 VELOCIDADE', title: 'Progressive Reading Sprint', component: <MioloVelocidadeProgressiva /> }
  ];

  const jogoAtual = todosOsJogos.find((j) => j.id === jogoSelecionado) || todosOsJogos[0];

  return (
    <div className="fixed inset-0 bg-[#0C1A24]/98 z-[99999] overflow-y-auto p-6 flex flex-col items-center justify-start backdrop-blur-md">
      
      {/* Barra de Controle de Saída */}
      <div className="w-full max-w-4xl flex justify-between items-center border-b border-cyan-500/10 pb-4 mb-6">
        <div>
          <span className="text-[10px] font-black text-cyan-400 font-mono tracking-widest uppercase">Haas Arena Game</span>
          <h1 className="text-xl font-black text-white font-sans tracking-tight mt-0.5">{jogoAtual.title}</h1>
        </div>
        {onClose && (
          <button 
            onClick={onClose} 
            className="text-[10px] font-black font-mono tracking-wider px-4 py-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white rounded-xl transition-all shadow-lg"
          >
            ❌ CLOSE ARENA
          </button>
        )}
      </div>

      {/* Seletor Secreto em Modo Developer (?dev=true) */}
      {modoDevAtivo && (
        <div className="bg-[#132836] p-4 rounded-2xl border border-cyan-500/20 w-full max-w-4xl mb-6 shadow-inner">
          <p className="text-[10px] font-black color-[#00f0ff] mb-3 text-center tracking-wider text-cyan-400">
            🛰️ DEVELOPER LAB: SELECT METHOD TO LIVE EDIT CSS
          </p>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {todosOsJogos.map((j) => (
              <button
                key={j.id}
                onClick={() => setJogoSelecionado(j.id)}
                className={`text-[9px] font-black px-3 py-1.5 rounded-lg transition-all ${
                  jogoSelecionado === j.id ? 'bg-cyan-400 text-slate-900 shadow-md' : 'bg-[#1C3B50] text-[#8ab4cd] hover:bg-[#234963]'
                }`}
              >
                {j.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chassi do Jogo Ajustado com Layout Limpo sem Colapso de Altura */}
      <div className="w-full max-w-2xl bg-[#04111C]/60 border border-cyan-500/20 rounded-[32px] p-6 shadow-2xl min-h-[380px] flex flex-col justify-center">
        {jogoAtual.component}
      </div>

    </div>
  );
}`;

fs.writeFileSync(filePath, codigoNovoArena, 'utf8');
console.log('🎉 Chassi central da Arena reestruturado e com suporte dinâmico!');
