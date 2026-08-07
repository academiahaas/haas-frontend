/* =========================================================================
  HOOK CUSTOMIZADO: MOTOR DE VOLATILIDADE (USE VOLATILITY STORE)
  HAAS ACADEMY - CENTRALIZAÇÃO DA LÓGICA DE AVERSÃO À PERDA E TIMESTAMPS
  =========================================================================
*/

'use client';

import { useState, useEffect } from 'react';

export function useVolatilityStore(META_MOEDAS_B2: number) {
  const [moedasAcumuladas, setMoedasAcumuladas] = useState(545);
  const [totalChamas, setTotalChamas] = useState(12);
  const [diasInativoSimulados, setDiasInativoSimulados] = useState(0);
  const [mostrouAvisoPerda, setMostrouAvisoPerda] = useState(false);

  // Verifica inatividade cronológica real no carregamento da lição
  useEffect(() => {
    const ultimoAcesso = localStorage.getItem('haas_ultimo_acesso');
    if (ultimoAcesso) {
      const dataAtual = new Date().getTime();
      const diferencaTempo = dataAtual - parseInt(ultimoAcesso);
      const diferencaDias = Math.floor(diferencaTempo / (1000 * 60 * 60 * 24));

      if (diferencaDias >= 1) {
        const perdaPorDia = 15;
        const totalPerdido = diferencaDias * perdaPorDia;
        setMoedasAcumuladas(prev => Math.max(300, prev - totalPerdido));
        setDiasInativoSimulados(diferencaDias);
        setMostrouAvisoPerda(true);
        setTotalChamas(prev => Math.max(0, prev - diferencaDias));
      }
    }
    localStorage.setItem('haas_ultimo_acesso', new Date().getTime().toString());
  }, []);

  // Injeta moedas com segurança renovando o acesso diário
  const adicionarMoedas = (quantidade: number) => {
    setMoedasAcumuladas(prev => prev + quantidade);
    localStorage.setItem('haas_ultimo_acesso', new Date().getTime().toString());
  };

  // Disparador de simulação tática de testes
  const simularInatividadeGamer = (dias: number) => {
    const perdaPorDia = 15;
    const totalPerdido = dias * perdaPorDia;
    setDiasInativoSimulados(dias);
    setMostrouAvisoPerda(true);
    setMoedasAcumuladas(prev => Math.max(300, prev - totalPerdido));
    setTotalChamas(prev => Math.max(0, prev - dias));
  };

  return {
    moedasAcumuladas,
    totalChamas,
    diasInativoSimulados,
    mostrouAvisoPerda,
    setMostrouAvisoPerda,
    adicionarMoedas,
    simularInatividadeGamer
  };
}