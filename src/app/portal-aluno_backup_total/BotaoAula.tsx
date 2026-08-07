'use client';
import React, { useState, useEffect } from 'react';

const textosIdiomas = {
  PT: {
    titulo: 'ACESSO À AULA',
    proxima: 'A sua próxima aula é em: ',
    entrar: '🚀 ENTRAR NA AULA AGORA',
    atrasado: '⚠️ SUA AULA JÁ COMEÇOU!',
    msgEspera: 'A entrada será feita por ali mesmo. O botão de ingresso será liberado 10 minutos antes.',
    msgLiberado: 'Clique para abrir a sala e participar.',
    msgAtrasado: 'Você está atrasado. Acesse agora para não perder o resto da aula!',
    faltam: 'Faltam',
    tempoAtrasado: 'Atrasado',
    carregando: 'Carregando informações da aula...'
  },
  ES: {
    titulo: 'ACCESO A LA CLASE',
    proxima: 'Tu próxima clase es el: ',
    entrar: '🚀 ENTRAR A LA CLASE AHORA',
    atrasado: '⚠️ ¡TU CLASE YA EMPEZÓ!',
    msgEspera: 'El ingreso se realizará por aquí mismo. El botón se liberará 10 minutos antes.',
    msgLiberado: 'Haz clic para abrir a sala y participar.',
    msgAtrasado: 'Llegas tarde. ¡Accede ahora para no perderte el resto de la clase!',
    faltam: 'Faltan',
    tempoAtrasado: 'Atrasado',
    carregando: 'Cargando información de la clase...'
  },
  EN: {
    titulo: 'CLASS ACCESS',
    proxima: 'Your next class is on: ',
    entrar: '🚀 JOIN THE CLASS NOW',
    atrasado: '⚠️ YOUR CLASS HAS ALREADY STARTED!',
    msgEspera: 'Entry will be through here. The button will be unlocked 10 minutes before.',
    msgLiberado: 'Click to open the room and participate.',
    msgAtrasado: "You are late. Access now so you don't miss the rest of the class!",
    faltam: 'Remaining',
    tempoAtrasado: 'Late',
    carregando: 'Loading class information...'
  }
};

export default function BotaoAula({ dataAulaIso = '', linkMeet = '', idiomaAtivo = '' }) {
  const [idioma, setIdioma] = useState('PT');
  const [tempoRestante, setTempoRestante] = useState(null);
  const [estado, setEstado] = useState('espera');

  useEffect(() => {
    const checarIdioma = () => {
      const salvo = localStorage.getItem('haas_idioma_auxiliar');
      if (salvo === 'PT' || salvo === 'ES' || salvo === 'EN') {
        setIdioma(salvo);
      }
    };
    checarIdioma();
    const interval = setInterval(checarIdioma, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!dataAulaIso) return;
    const DATA_AULA = new Date(dataAulaIso).getTime();
    
    const atualizarTimer = () => {
      const agora = new Date().getTime();
      const diferenca = DATA_AULA - agora;
      
      if (diferenca > 10 * 60 * 1000) {
        setEstado('espera');
        setTempoRestante(diferenca);
      } else if (diferenca <= 10 * 60 * 1000 && diferenca >= -30 * 60 * 1000) {
        setEstado('liberado');
        setTempoRestante(Math.abs(diferenca));
      } else {
        setEstado('atrasado');
        setTempoRestante(agora - DATA_AULA);
      }
    };
    
    atualizarTimer();
    const intervalTimer = setInterval(atualizarTimer, 1000);
    return () => clearInterval(intervalTimer);
  }, [dataAulaIso]);

  const formatarCronometro = (ms) => {
    if (ms === null) return '--:--:--';
    const segs = Math.floor(ms / 1000);
    const h = Math.floor(segs / 3600);
    const m = Math.floor((segs % 3600) / 60);
    const s = segs % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return h > 0 ? pad(h) + ':' + pad(m) + ':' + pad(s) : pad(m) + ':' + pad(s);
  };

  const formatarDataExibicao = (iso) => {
    if (!iso) return '--/-- --:--';
    try {
      const d = new Date(iso);
      const pad = (n) => String(n).padStart(2, '0');
      const dataFormatada = pad(d.getDate()) + '/' + pad(d.getMonth() + 1);
      const horaFormatada = pad(d.getHours()) + ':' + pad(d.getMinutes());
      return idiomaFinal === 'EN' ? pad(d.getMonth() + 1) + '/' + pad(d.getDate()) + ' at ' + horaFormatada : dataFormatada + ' às ' + horaFormatada;
    } catch (e) {
      return '--/-- --:--';
    }
  };

  const idiomaFinal = idiomaAtivo || idioma;
  const t = textosIdiomas[idiomaFinal];

  // ESTADO DE CARREGAMENTO INICIAL (Enquanto data do Supabase não chega)
  if (!dataAulaIso) {
    return (
      <div className="flex flex-col justify-center items-center w-full select-none">
        <button disabled className="w-full bg-[#04101e] border border-white/5 rounded-xl py-3.5 px-4 text-slate-400 font-mono text-[10px] font-black uppercase tracking-wider cursor-not-allowed text-center">
          {t.carregando}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center w-full select-none">
      
      {estado === 'espera' && (
        <>
          <button disabled className="w-full bg-[#04101e] border border-white/5 rounded-xl py-3.5 px-4 text-slate-400 font-mono text-[10px] font-black uppercase tracking-wider cursor-not-allowed text-center">
            {t.proxima}{formatarDataExibicao(dataAulaIso)}
          </button>
          <p className="text-[9px] text-slate-500 font-medium px-2 leading-relaxed text-left">{t.msgEspera}</p>
        </>
      )}

      {estado === 'liberado' && (
        <>
          <a href={linkMeet || '#'} target="_blank" rel="noopener noreferrer" className="w-full bg-emerald-500 text-slate-950 font-black text-xs rounded-xl py-3 px-4 shadow-[0_0_20px_rgba(16,185,129,0.4)] text-center block animate-pulse">
            {t.entrar} ({t.faltam} {formatarCronometro(tempoRestante)})
          </a>
          <p className="text-[9px] text-emerald-400/80 font-semibold px-2 leading-relaxed text-left">{t.msgLiberado}</p>
        </>
      )}

      {estado === 'atrasado' && (
        <>
          <a href={linkMeet || '#'} target="_blank" rel="noopener noreferrer" className="w-full bg-rose-600 text-white font-black text-xs rounded-xl py-3 px-4 shadow-[0_0_15px_rgba(225,29,72,0.3)] text-center block">
            {t.atrasado} ({t.tempoAtrasado}: {formatarCronometro(tempoRestante)})
          </a>
          <p className="text-[9px] text-rose-400/80 font-semibold px-2 leading-relaxed text-left">{t.msgAtrasado}</p>
        </>
      )}
    </div>
  );
}
