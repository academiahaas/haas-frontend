// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { Check, Edit3, Trash2 } from 'lucide-react';

export function FinancasTab() {
  const [ingresos, setIngresos] = useState([
    { id: 1, descricao: 'Contrato Mensal Amazon B2B', valor: 15000000, recurrencia: 'Mensual Recurrente' },
    { id: 2, descricao: 'Contrato Mensal Ecopetrol B2B', valor: 10400000, recurrencia: 'Mensual Recurrente' }
  ]);
  const [gastos, setGastos] = useState([
    { id: 1, descricao: 'Servidor VPS Premium', valor: 180000, recurrencia: 'Mensual Recurrente' },
    { id: 2, descricao: 'Consumo API Google Gemini', valor: 350000, recurrencia: 'Mensual Recurrente' }
  ]);
  
  const [novoItemFin, setNovoItemFin] = useState({ tipo: 'ingreso', descricao: '', valor: '', recurrencia: 'Mensual Recurrente' });
  const [editandoFin, setEditandoFin] = useState(null);

  const handleAddFinanca = (e) => {
    e.preventDefault();
    if (!novoItemFin.descricao || !novoItemFin.valor) return;
    const novo = { id: Date.now(), descricao: novoItemFin.descricao, valor: Number(novoItemFin.valor), recurrencia: novoItemFin.recurrencia };
    if (novoItemFin.tipo === 'ingreso') setIngresos([...ingresos, novo]);
    else setGastos([...gastos, novo]);
    setNovoItemFin({ tipo: 'ingreso', descricao: '', valor: '', recurrencia: 'Mensual Recurrente' });
  };

  const faturamentoBrutoCOP = ingresos.reduce((acc, item) => acc + item.valor, 0);
  const totalGastosCOP = gastos.reduce((acc, item) => acc + item.valor, 0);
  const lucroLiquidoCOP = faturamentoBrutoCOP - totalGastosCOP;

  const formatarCOP = (val) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border p-5 rounded-2xl shadow-sm border-b-4 border-b-blue-500"><span className="text-xs font-bold text-slate-400 uppercase block">Ingresos Brutos</span><span className="text-xl font-black text-slate-900 font-mono">{formatarCOP(faturamentoBrutoCOP)}</span></div>
        <div className="bg-white border p-5 rounded-2xl shadow-sm border-b-4 border-b-red-500"><span className="text-xs font-bold text-slate-400 uppercase block">Costos Operacionales</span><span className="text-xl font-black text-red-600 font-mono">{formatarCOP(totalGastosCOP)}</span></div>
        <div className="bg-white border p-5 rounded-2xl shadow-sm border-b-4 border-b-emerald-500"><span className="text-xs font-bold text-emerald-600 uppercase block">Utilidad Haas</span><span className="text-xl font-black text-emerald-700 font-mono">{formatarCOP(lucroLiquidoCOP)}</span></div>
      </div>

      <form onSubmit={handleAddFinanca} className="bg-white border p-4 rounded-2xl flex flex-wrap gap-3 items-center text-xs">
        <span className="font-black uppercase">Movimiento:</span>
        <select value={novoItemFin.tipo} onChange={e => setNovoItemFin({...novoItemFin, tipo: e.target.value})} className="px-2 py-1.5 bg-slate-100 rounded-lg border font-bold"><option value="ingreso">🟢 Ingreso</option><option value="gasto">🔴 Costo</option></select>
        <input type="text" placeholder="Descripción..." value={novoItemFin.descricao} onChange={e => setNovoItemFin({...novoItemFin, descricao: e.target.value})} className="flex-1 min-w-[150px] px-3 py-1.5 bg-slate-50 border rounded-lg outline-none"/>
        <input type="number" placeholder="Valor COP..." value={novoItemFin.valor} onChange={e => setNovoItemFin({...novoItemFin, valor: e.target.value})} className="w-32 px-3 py-1.5 bg-slate-50 border rounded-lg font-mono font-bold outline-none"/>
        <button type="submit" className="px-4 py-1.5 bg-slate-900 text-white font-black uppercase rounded-lg hover:bg-slate-800 cursor-pointer">Inyectar</button>
      </form>
    </div>
  );
}
