'use client';
import React, { useState, useEffect } from 'react';
import { Tag, Plus, Loader2 } from 'lucide-react';

export function CuponesTab() {
  const [codigo, setCodigo] = useState('');
  const [desconto, setDesconto] = useState('10');
  const [validade, setValidade] = useState('');
  const [criando, setCriando] = useState(false);
  const [msg, setMsg] = useState('');
  const [lista, setLista] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregarCodigos = async () => {
    setCarregando(true);
    try {
      const res = await fetch('/api/admin/criar-codigo-desconto');
      const dados = await res.json();
      setLista(dados.codigos || []);
    } catch (e) {
      console.error(e);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarCodigos();
  }, []);

  const handleCriar = async () => {
    if (!codigo.trim() || !desconto || !validade) {
      setMsg('Preencha código, desconto e validade.');
      return;
    }
    setCriando(true);
    setMsg('');
    try {
      const res = await fetch('/api/admin/criar-codigo-desconto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codigo, discount_percent: Number(desconto), valid_until: validade })
      });
      const dados = await res.json();
      if (!res.ok) throw new Error(dados.error);
      setMsg(`Código ${dados.codigo.code} criado com sucesso.`);
      setCodigo('');
      setValidade('');
      carregarCodigos();
    } catch (e: any) {
      setMsg('Erro: ' + e.message);
    } finally {
      setCriando(false);
    }
  };

  return (
    <div className="p-6 flex flex-col gap-6 h-full overflow-y-auto">
      <div>
        <h1 className="text-xl font-black text-white flex items-center gap-2">
          <Tag size={20} className="text-purple-400" /> Cupones de descuento
        </h1>
        <p className="text-sm text-slate-400 mt-1">Crea códigos manuales para promociones (no vinculados a un alumno específico).</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
      <div className="bg-[#0a1424] border border-white/10 rounded-xl p-5 flex flex-col gap-3 h-fit">
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase">Código</label>
          <input
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.toUpperCase())}
            placeholder="BLACKFRIDAY2026"
            className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white uppercase"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase">Descuento (%)</label>
            <input
              type="number"
              value={desconto}
              onChange={(e) => setDesconto(e.target.value)}
              className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase">Válido hasta</label>
            <input
              type="date"
              value={validade}
              onChange={(e) => setValidade(e.target.value)}
              className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
            />
          </div>
        </div>
        <button
          onClick={handleCriar}
          disabled={criando}
          className="mt-2 bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:brightness-110 disabled:opacity-50 text-white font-black py-2.5 rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2"
        >
          {criando ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          {criando ? 'Creando...' : 'Crear código'}
        </button>
        {msg && <p className="text-xs text-slate-300">{msg}</p>}
      </div>

      <div className="bg-[#0a1424] border border-white/10 rounded-xl p-5 min-h-0 flex flex-col">
        <h2 className="text-sm font-bold text-slate-200 mb-3">Códigos recientes</h2>
        {carregando ? (
          <div className="flex items-center justify-center py-10 text-slate-500">
            <Loader2 size={20} className="animate-spin" />
          </div>
        ) : lista.length === 0 ? (
          <p className="text-xs text-slate-500">Ningún código creado todavía.</p>
        ) : (
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-slate-500 uppercase text-[10px] border-b border-white/10">
                  <th className="pb-2 pr-4">Código</th>
                  <th className="pb-2 pr-4">Descuento</th>
                  <th className="pb-2 pr-4">Tipo</th>
                  <th className="pb-2 pr-4">Válido hasta</th>
                  <th className="pb-2">Usado</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((c) => (
                  <tr key={c.id} className="border-b border-white/5">
                    <td className="py-2 pr-4 font-mono font-bold text-purple-300">{c.code}</td>
                    <td className="py-2 pr-4 text-slate-300">{c.discount_percent}%</td>
                    <td className="py-2 pr-4 text-slate-400">{c.is_manual ? 'Manual' : 'Automático'}</td>
                    <td className="py-2 pr-4 text-slate-400">{c.valid_until}</td>
                    <td className="py-2">
                      {c.used ? (
                        <span className="text-emerald-400 font-bold">Sí</span>
                      ) : (
                        <span className="text-slate-500">No</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
