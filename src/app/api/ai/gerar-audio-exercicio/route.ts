import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://jdppxfokfhqjudwfwckd.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export async function POST(req: NextRequest) {
  try {
    const { texto, exerciseId } = await req.json();
    if (!texto || !exerciseId) {
      return NextResponse.json({ erro: "Parâmetros ausentes." }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ erro: "Chave OpenAI não configurada." }, { status: 500 });
    }

    const resp = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1",
        input: texto,
        voice: "fable",
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error("Erro OpenAI TTS:", errText);
      return NextResponse.json({ erro: "Falha ao gerar áudio." }, { status: 500 });
    }

    const audioBuffer = Buffer.from(await resp.arrayBuffer());
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const fileName = `exercicio_${exerciseId}.mp3`;
    const { error: erroUpload } = await supabase.storage
      .from("audios_curso")
      .upload(fileName, audioBuffer, {
        contentType: "audio/mpeg",
        upsert: true,
        cacheControl: "0",
      });

    if (erroUpload) {
      console.error("Erro ao salvar áudio no Storage:", erroUpload);
      return NextResponse.json({ erro: "Falha ao salvar áudio." }, { status: 500 });
    }

    const audioUrl = `${SUPABASE_URL}/storage/v1/object/public/audios_curso/${fileName}`;

    return NextResponse.json({ audio_url: audioUrl });
  } catch (err: any) {
    console.error("Erro na rota de geração de áudio:", err);
    return NextResponse.json({ erro: err.message || "Erro interno ao gerar áudio." }, { status: 500 });
  }
}
