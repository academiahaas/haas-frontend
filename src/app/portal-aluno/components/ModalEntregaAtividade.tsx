"use client";

import React, { useState, useRef } from "react";
import { Upload, X, Camera, FileText, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  idioma: "PT" | "EN" | "ES";
  entregas?: any[];
}

interface FileObject {
  id: string;
  file: File;
  preview: string;
  isImage: boolean;
}

export default function ModalEntregaAtividade({ isOpen, onClose, idioma, entregas = [] }: Props) {
  const [files, setFiles] = useState<FileObject[]>([]);
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const t = {
    PT: { title: "ENTREGA DE ATIVIDADES", desc: "Envie fotos ou arquivos da atividade. O professor dará o feedback.", labelBtn: "Selecionar Arquivo", submit: "Enviar Atividade", success: "✓ Entrega realizada com sucesso!", maxError: "⚠️ Limite máximo de 3 arquivos.", close: "FECHAR" },
    EN: { title: "SUBMIT TASK", desc: "Upload photos or files. The teacher will provide feedback.", labelBtn: "Select File", submit: "Submit Task", success: "✓ Task submitted successfully!", maxError: "⚠️ Max 3 files.", close: "CLOSE" },
    ES: { title: "ENTREGA DE ACTIVIDADES", desc: "Envíe fotos o archivos. El profesor dará el feedback.", labelBtn: "Seleccionar Archivo", submit: "Enviar Actividad", success: "✓ ¡Entrega realizada con éxito!", maxError: "⚠️ Máximo 3 archivos.", close: "CERRAR" }
  }[idioma] || { title: "ENTREGA DE ATIVIDADES", desc: "Envie seus arquivos.", labelBtn: "Selecionar Arquivo", submit: "Enviar Atividade", success: "✓ Sucesso!", maxError: "⚠️ Limite atingido.", close: "FECHAR" };

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const chosenFiles = Array.from(e.target.files);
    if (files.length + chosenFiles.length > 3) {
      alert(t.maxError);
      return;
    }
    const mapped: FileObject[] = chosenFiles.map(file => {
      const isImage = file.type.startsWith("image/");
      return {
        id: Math.random().toString(36).substring(2),
        file,
        preview: isImage ? URL.createObjectURL(file) : "",
        isImage
      };
    });
    setFiles(prev => [...prev, ...mapped]);
  }

  async function enviarArquivos() {
    if (files.length === 0) return;
    setLoading(true);

    try {
      // 1. Obter ID do usuário logado na sessão ativa
      const { data: { user } } = await supabase.auth.getUser();
      
      let userIdFinal = user?.id;
      if (!userIdFinal || userIdFinal === "aluno_demo_123") {
        const { data: userData } = await supabase.from("users").select("id").limit(1).maybeSingle();
        userIdFinal = userData?.id || null;
      }

      // 1.5 Buscar um ID de unidade válido (UUID) para evitar falhas de validação no banco
      const { data: unitData } = await supabase.from("units").select("id").limit(1).maybeSingle();
      const unitIdValido = unitData?.id || null;

      for (const item of files) {
        const fileExt = item.file.name.split('.').pop();
        const fileName = `${Math.random()}_${Date.now()}.${fileExt}`;
        const filePath = `tasks/${fileName}`;

        // 2. Sobe fisicamente o arquivo para o Storage
        const { error: uploadError } = await supabase.storage
          .from("student_tasks")
          .upload(filePath, item.file);

        if (uploadError) throw uploadError;

        // 3. Pega a URL pública gerada
        const { data: urlData } = supabase.storage
          .from("student_tasks")
          .getPublicUrl(filePath);

        // 4. Injeta a linha correspondente na tabela assignments_submissions
        const { error: dbError } = await supabase
          .from("assignments_submissions")
          .insert([
            {
              user_id: userIdFinal,
              unit_id: unitIdValido,
              photo_url: urlData.publicUrl,
              status: "pending"
            }
          ]);

        if (dbError) throw dbError;
      }

      setSucesso(true);
      setTimeout(() => {
        setSucesso(false);
        setFiles([]);
        onClose();
      }, 1800);
    } catch (err) {
      console.error("Erro completo na operação de entrega:", err);
      alert("Erro ao salvar dados no Supabase. Verifique a conexão.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`fixed inset-0 z-50 transition-all duration-300 flex items-center justify-center p-4 ${isOpen ? 'visible' : 'invisible'}`}>
      <div onClick={onClose} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" />
      <div className="relative w-full max-w-md bg-[#030914] border border-white/[0.06] rounded-[24px] p-6 flex flex-col gap-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <h2 className="text-xs font-black tracking-widest text-white uppercase flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            {t.title}
          </h2>
          <button type="button" onClick={onClose} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[9px] font-black font-mono border-none cursor-pointer">
            {t.close}
          </button>
        </div>

        {sucesso ? (
          <div className="text-center py-8 text-emerald-400 font-mono text-xs font-bold flex flex-col items-center gap-2">
            <CheckCircle2 size={24} className="text-emerald-500" />
            {t.success}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3 flex gap-2 items-center">
              <Upload size={14} className="text-amber-500 shrink-0" />
              <span className="text-[10px] text-slate-400 font-medium leading-tight">{t.desc}</span>
            </div>

            {files.length < 3 && (
              <div onClick={() => fileInputRef.current?.click()} className="w-full border border-dashed border-white/10 hover:border-amber-500/40 rounded-xl p-6 flex flex-col items-center justify-center gap-2 bg-white/[0.02] hover:bg-white/[0.05] transition-all cursor-pointer">
                <Camera size={18} className="text-slate-400" />
                <span className="text-[10px] text-slate-400 font-bold">{t.labelBtn}</span>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />
              </div>
            )}

            {files.length > 0 && (
              <div className="space-y-2 max-h-[120px] overflow-y-auto">
                {files.map(f => (
                  <div key={f.id} className="flex justify-between items-center p-2 bg-white/5 rounded-lg border border-white/5 text-[10px]">
                    <span className="truncate max-w-[200px] text-slate-300">{f.file.name}</span>
                    <button onClick={() => setFiles(prev => prev.filter(x => x.id !== f.id))} className="text-rose-400 hover:text-rose-500 bg-transparent border-none cursor-pointer">remover</button>
                  </div>
                ))}
              </div>
            )}

            <button onClick={enviarArquivos} disabled={loading || files.length === 0} className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-30 disabled:hover:bg-amber-500 text-slate-950 font-mono font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer">
              {loading ? "..." : t.submit}
            </button>
          </div>
        )}

        {/* HISTÓRICO DE ENTREGAS COMPLETO DA CENTRAL */}
        {entregas && entregas.length > 0 && (
          <div className="border-t border-white/5 pt-3 mt-1">
            <h3 className="text-[10px] font-black tracking-wider text-slate-400 uppercase mb-2">
              {idioma === "PT" ? "Suas Entregas" : idioma === "EN" ? "Your Submissions" : "Tus Entregas"} ({entregas.length})
            </h3>
            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
              {entregas.map((ent, idx) => {
                const statusTexto = ent.status === "approved" || ent.status === "corrigida" ? (idioma === "PT" ? "Corrigida" : idioma === "EN" ? "Reviewed" : "Corregida") : (idioma === "PT" ? "Pendente" : idioma === "EN" ? "Pending" : "Pendiente");
                const statusCor = ent.status === "approved" || ent.status === "corrigida" ? "text-emerald-400 bg-emerald-500/5 border-emerald-500/10" : "text-amber-400 bg-amber-500/5 border-amber-500/10";

                return (
                  <div key={ent.id || idx} className="p-2.5 bg-white/[0.02] border border-white/5 rounded-xl flex items-start gap-2.5 text-[10px]">
                    {ent.photo_url && (
                      <a href={ent.photo_url} target="_blank" rel="noreferrer" className="shrink-0 w-10 h-10 bg-slate-900 border border-white/10 rounded-lg overflow-hidden flex items-center justify-center group relative">
                        <img src={ent.photo_url} alt="Task" className="w-full h-full object-cover group-hover:opacity-60 transition-all" />
                        <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white opacity-0 group-hover:opacity-100 bg-black/40">VER</span>
                      </a>
                    )}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[9px] text-slate-500">#{String(ent.id).substring(0, 6)}</span>
                        <span className={`px-1.5 py-0.5 border rounded-md font-bold uppercase tracking-wider text-[8px] ${statusCor}`}>
                          {statusTexto}
                        </span>
                      </div>
                      {ent.grade !== undefined && ent.grade !== null && (
                        <div className="text-slate-300 font-bold">
                          {idioma === "PT" ? "Nota:" : idioma === "EN" ? "Grade:" : "Nota:"} <span className="text-amber-400 font-mono">{ent.grade}</span>
                        </div>
                      )}
                      {ent.teacher_feedback && (
                        <p className="text-slate-400 leading-normal italic bg-white/[0.01] p-1.5 rounded border border-white/[0.02]">
                          "{ent.teacher_feedback}"
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
