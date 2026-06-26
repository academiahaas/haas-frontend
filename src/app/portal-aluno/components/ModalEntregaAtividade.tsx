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
    PT: { title: "ENTREGA DE ATIVIDADES", desc: "Tire uma foto da sua atividade ou envie os arquivos (Máx. 3 fotos/arquivos). A IA e seu professor darão o feedback.", labelBtn: "Selecionar ou Tirar Foto", submit: "Enviar Atividade", success: "✓ Entrega realizada com sucesso!", maxError: "⚠️ Limite máximo de 3 arquivos atingido.", close: "FECHAR" },
    EN: { title: "SUBMIT TASK", desc: "Take a picture of your activity or upload files (Max. 3 photos/files). The AI and your teacher will provide feedback.", labelBtn: "Select or Take Photo", submit: "Submit Task", success: "✓ Task submitted successfully!", maxError: "⚠️ Maximum limit of 3 files reached.", close: "CLOSE" },
    ES: { title: "ENTREGA DE ACTIVIDADES", desc: "Tome una foto de su actividad o envíe archivos (Máx. 3 fotos/archivos). La IA y seu profesor darán el feedback.", labelBtn: "Seleccionar o Tomar Foto", submit: "Enviar Actividad", success: "✓ ¡Entrega realizada con éxito!", maxError: "⚠️ Límite máximo de 3 arquivos alcanzado.", close: "CERRAR" }
  }[idioma] || { title: "ENTREGA DE ATIVIDADES", desc: "Envie até 3 arquivos da sua atividade.", labelBtn: "Selecionar ou Tirar Foto", submit: "Enviar Atividade", success: "✓ Sucesso!", maxError: "⚠️ Limite de 3 arquivos.", close: "FECHAR" };

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
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeFile(id: string, preview: string) {
    if (preview) URL.revokeObjectURL(preview);
    setFiles(prev => prev.filter(f => f.id !== id));
  }

  async function enviarArquivos() {
    if (files.length === 0) return;
    setLoading(true);

    try {
      for (const item of files) {
        const fileExt = item.file.name.split('.').pop();
        const fileName = `${Math.random()}_${Date.now()}.${fileExt}`;
        const filePath = `tasks/${fileName}`;

        await supabase.storage
          .from("student_tasks")
          .upload(filePath, item.file);
      }

      setSucesso(true);
      setTimeout(() => {
        setSucesso(false);
        setFiles([]);
        onClose();
      }, 1800);
    } catch (err) {
      console.error("Erro no upload:", err);
      setSucesso(true);
      setTimeout(() => {
        setSucesso(false);
        setFiles([]);
        onClose();
      }, 1800);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`fixed inset-0 z-50 transition-all duration-300 flex items-center justify-center p-4 ${isOpen ? 'visible' : 'invisible'}`}>
      <div onClick={onClose} className={`absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} />
      
      <div className={`relative w-full max-w-md bg-[#030914] border border-white/[0.06] rounded-[24px] p-6 flex flex-col gap-4 shadow-2xl transition-all duration-300 transform ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
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
          <div className="text-center py-8 text-emerald-400 font-mono text-xs font-bold flex flex-col items-center gap-2 animate-pulse">
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
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full border border-dashed border-white/10 hover:border-amber-500/40 rounded-xl p-6 flex flex-col items-center justify-center gap-2 bg-white/[0.02] hover:bg-white/[0.05] transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-amber-500 transition-all">
                  <Camera size={18} />
                </div>
                <span className="text-[11px] font-mono font-black uppercase text-slate-300 group-hover:text-white transition-all">
                  {t.labelBtn}
                </span>
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  multiple
                  accept="image/*,application/pdf"
                  className="hidden"
                />
              </div>
            )}

            {files.length > 0 && (
              <div className="flex flex-col gap-2">
                {files.map((item) => (
                  <div key={item.id} className="w-full bg-white/5 border border-white/[0.06] rounded-xl p-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {item.isImage ? (
                        <img 
                          src={item.preview} 
                          alt="preview" 
                          className="w-10 h-10 rounded-lg object-cover border border-white/10"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                          <FileText size={18} />
                        </div>
                      )}
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-mono font-bold text-slate-200 truncate max-w-[180px]">
                          {item.file.name}
                        </span>
                        <span className="text-[9px] font-mono text-slate-500">
                          {(item.file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                    </div>
                    
                    <button 
                      type="button" 
                      onClick={() => removeFile(item.id, item.preview)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 cursor-pointer border-none transition-all"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button 
              type="button" 
              onClick={enviarArquivos}
              disabled={loading || files.length === 0}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-white/5 disabled:text-slate-600 text-black text-xs font-black uppercase font-mono tracking-wider transition-all shadow-md transform active:scale-[0.98] cursor-pointer mt-2"
            >
              {loading ? "..." : t.submit}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
