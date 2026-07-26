"use client";

import React, { useEffect, useState } from "react";
import { fetchCentralPortalData } from "@/services/centralService";

export default function DashboardDesktop() {
  const [loading, setLoading] = useState(true);
  const [userIdBanco, setUserIdBanco] = useState("");
  const [aluno1, setAluno1] = useState("Carregando...");
  const [apelido, setApelido] = useState("");
  const [nivelAtual, setNivelAtual] = useState("INICIANTE");
  const [tipoAluno, setTipoAluno] = useState("padrao");
  const [precisaoClinica, setPrecisaoClinica] = useState(0);
  const [imersaoTotal, setImersaoTotal] = useState("0h");
  const [vocabularioAtivo, setVocabularioAtivo] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const [totalXp, setTotalXp] = useState(0);
  const [moduloAtual, setModuloAtual] = useState("Módulo 1");
  const [errorLogs, setErrorLogs] = useState([]);
  const [competencias, setCompetencias] = useState({ habla: 0, escucha: 0, lectura: 0, escritura: 0 });

  useEffect(() => {
    let isMounted = true;

    async function carregarDadosDashboard() {
      try {
        const dadosPortal = await fetchCentralPortalData();
        if (!isMounted || !dadosPortal) return;

        const dbUser = dadosPortal.user || dadosPortal;
        
        if (dbUser && dbUser.id) setUserIdBanco(dbUser.id);
        if (dbUser.name) setAluno1(dbUser.name);
        if (dbUser.nickname) setApelido(dbUser.nickname);
        if (dbUser.current_level) setNivelAtual(String(dbUser.current_level).toUpperCase());
        if (dbUser.student_type) setTipoAluno(String(dbUser.student_type).toLowerCase());
        if (dbUser.clinical_precision !== undefined) setPrecisaoClinica(dbUser.clinical_precision);
        if (dbUser.total_immersion_es !== undefined) setImersaoTotal(String(dbUser.total_immersion_es) + "h");
        if (dbUser.active_vocabulary !== undefined) setVocabularioAtivo(dbUser.active_vocabulary);
        if (dbUser.streak_days !== undefined) setStreakDays(dbUser.streak_days);
        if (dbUser.total_xp !== undefined) setTotalXp(dbUser.total_xp);
        
        const mod = dbUser.current_module || dbUser.modulo_actual || "Módulo 1";
        setModuloAtual(mod);

        if (dadosPortal.error_logs) setErrorLogs(dadosPortal.error_logs);
        if (dadosPortal.competencias) setCompetencias(dadosPortal.competencias);

        console.log("✅ Dashboard carregado com sucesso para:", dbUser.name, "| Módulo:", mod);
      } catch (err) {
        console.error("❌ Erro ao carregar Dashboard:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    carregarDadosDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="p-8 space-y-6 text-white bg-slate-900 min-h-screen">
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
        <h1 className="text-2xl font-bold text-blue-400">Painel do Aluno</h1>
        <p className="text-slate-400 mt-1">Bem-vindo(a), <span className="text-white font-semibold">{aluno1}</span> ({apelido})</p>
        <p className="text-xs text-slate-500 mt-1">ID Banco: {userIdBanco}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
          <p className="text-xs text-slate-400 uppercase">Ofensiva (Streak)</p>
          <p className="text-2xl font-bold text-orange-400">{streakDays} dias 🔥</p>
        </div>
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
          <p className="text-xs text-slate-400 uppercase">XP Total</p>
          <p className="text-2xl font-bold text-yellow-400">{totalXp} XP ⚡</p>
        </div>
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
          <p className="text-xs text-slate-400 uppercase">Nível Atual</p>
          <p className="text-2xl font-bold text-green-400">{nivelAtual}</p>
        </div>
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
          <p className="text-xs text-slate-400 uppercase">Módulo Atual</p>
          <p className="text-2xl font-bold text-purple-400">{moduloAtual}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
          <p className="text-xs text-slate-400 uppercase">Precisão Clínica</p>
          <p className="text-xl font-semibold text-blue-300">{precisaoClinica}%</p>
        </div>
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
          <p className="text-xs text-slate-400 uppercase">Vocabulário Ativo</p>
          <p className="text-xl font-semibold text-teal-300">{vocabularioAtivo} palavras</p>
        </div>
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
          <p className="text-xs text-slate-400 uppercase">Imersão Total</p>
          <p className="text-xl font-semibold text-indigo-300">{imersaoTotal}</p>
        </div>
      </div>
    </div>
  );
}
