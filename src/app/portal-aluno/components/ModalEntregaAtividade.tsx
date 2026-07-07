"use client";

import React, { useState, useRef } from "react";
import { Upload, X, Camera, FileText, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  idioma: "PT" | "EN" | "ES";
}

interface FileObject {
  id: string;
  file: File;
  preview: string;
  isImage: boolean;
}

export default function ModalEntregaAtividade({ isOpen, onClose, idioma }: Props) {
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
      const userIdFinal = user?.id || "aluno_demo_123";

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
              unit_id: "unidade_atual_id",
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
      </div>
    </div>
  );
}
