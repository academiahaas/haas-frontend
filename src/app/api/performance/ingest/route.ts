// @ts-nocheck
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jdppxfokfhqjudwfwckd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcHB4Zm9rZmhxanVkd2Z3Y2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5Mjk2NzgsImV4cCI6MjA5NTUwNTY3OH0.1zkCP7WUv1QJvWu35jQSRByFp-CSxD-Zfj6yKJysGIU';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function POST(request: Request) {
  try {
    const { alunoNome, competencia, nota } = await request.json();

    if (!alunoNome || !competencia) {
      return NextResponse.json({ success: false, error: "Datos incompletos" }, { status: 400 });
    }

    // Guardamos la calificación del quiz en la tabla de rendimiento del alumno
    const { data, error } = await supabase
      .from('rendimiento_estudiantes')
      .insert([
        { 
          id_estudiante: alunoNome, 
          habilidad: competencia, // 'Fala', 'Escuta', 'Gramática', etc.
          calificacion: Number(nota),
          created_at: new Date().toISOString()
        }
      ]);

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Nota guardada con éxito en Supabase" });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
