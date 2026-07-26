import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // ID do Vinicius Andrade que estamos usando
  const userId = req.nextUrl?.searchParams?.get('userId') || ''; 

  const { data, error } = await supabase
    .from('users')
    .select('id, name, trained_days, streak_days')
    .eq('id', userId)
    .maybeSingle();

  return NextResponse.json({ 
    sucesso: !error,
    dados_recebidos: data,
    tipo_de_trained_days: typeof data?.trained_days,
    eh_array: Array.isArray(data?.trained_days),
    erro_supabase: error 
  });
}
