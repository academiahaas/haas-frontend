// @ts-nocheck
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jdppxfokfhqjudwfwckd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcHB4Zm9rZmhxanVkd2Z3Y2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5Mjk2NzgsImV4cCI6MjA5NTUwNTY3OH0.1zkCP7WUv1QJvWu35jQSRByFp-CSxD-Zfj6yKJysGIU';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ""; 

export async function POST(request: Request) {
  try {
    // 🔍 1. CONSULTA VIVA: Traemos el último curso activo registrado en Supabase
    const { data: cursoBanco, error: errSupabase } = await supabase
      .from('cursos')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Valores de contingencia por si la tabla está vacía temporalmente
    let temaCurso = "If Clauses (CEFR B2)";
    let nivel = "B2";
    let alunoNome = "Alvo Teste";

    if (cursoBanco) {
      // Mapeamos los datos reales que inyectó el administrador en la base de datos
      temaCurso = cursoBanco.titulo || temaCurso;
      nivel = cursoBanco.nivel || nivel;
      alunoNome = cursoBanco.id_estudiante || alunoNome; 
    }

    // 🧠 2. PROMPT PEDAGÓGICO: Gemini refina el título para la interfaz arcade del alumno
    const promptPedagogico = `Actúa como el Director Académico de Haas Idiomas. Optimiza el título de la siguiente misión para que quepa en un botón UI de un juego educativo: "${temaCurso}". Alumno: ${alunoNome}, Nivel: ${nivel}. Devuelve únicamente un objeto JSON con la propiedad "temaOptimizado" (un título de máximo 4 palabras). No agregues texto extra ni markdown, solo el JSON puro.`;

    let temaFinal = temaCurso;

    if (GEMINI_API_KEY) {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
      const resGemini = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptPedagogico }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });
      
      const dataGemini = await resGemini.json();
      const textRaw = dataGemini?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (textRaw) {
        const parsed = JSON.parse(textRaw);
        if (parsed.temaOptimizado) temaFinal = parsed.temaOptimizado;
      }
    }

    // 🚀 3. PAYLOAD REAL: Enviamos los datos dinámicos sincronizados al Portal del Alumno
    return NextResponse.json({
      success: true,
      data: {
        moduloAtual: 3,
        temaCurso: `${temaFinal} (${nivel})`,
        ultimoTreino: "há 3 dias"
      }
    });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
