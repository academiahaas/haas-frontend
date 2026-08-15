import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export const runtime = "nodejs";

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const CINCO_DIAS_MS = 5 * 24 * 60 * 60 * 1000;

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    if (!text) {
      return NextResponse.json({ error: "Texto não fornecido" }, { status: 400 });
    }

    const hash = crypto.createHash("sha256").update(text.trim()).digest("hex");

    // 1. Tenta achar no cache
    try {
      const { data: cacheHit } = await supabase
        .from("mentor_audio_cache")
        .select("audio_url, created_at")
        .eq("texto_hash", hash)
        .maybeSingle();

      if (cacheHit && (Date.now() - new Date(cacheHit.created_at).getTime()) < CINCO_DIAS_MS) {
        const audioResp = await fetch(cacheHit.audio_url);
        if (audioResp.ok && audioResp.body) {
          return new Response(audioResp.body, {
            headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-cache" },
          });
        }
      }
    } catch (erroCache) {
      console.error("Erro ao consultar cache de audio:", erroCache);
    }

    // 2. Nao achou (ou expirou): gera novo via OpenAI
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Chave OpenAI não configurada" }, { status: 500 });
    }

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1",
        input: text,
        voice: "nova",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `Erro OpenAI: ${errorText}` }, { status: response.status });
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());

    // 3. Salva no storage e no cache, em segundo plano (nao trava a resposta)
    (async () => {
      try {
        const caminho = `mentor-audio/${hash}.mp3`;
        await supabase.storage.from("haas-academy").upload(caminho, audioBuffer, {
          contentType: "audio/mpeg",
          upsert: true,
        });
        const { data: urlData } = supabase.storage.from("haas-academy").getPublicUrl(caminho);
        await supabase.from("mentor_audio_cache").upsert(
          { texto_hash: hash, audio_url: urlData.publicUrl, created_at: new Date().toISOString() },
          { onConflict: "texto_hash" }
        );
      } catch (erroSalvar) {
        console.error("Erro ao salvar audio no cache:", erroSalvar);
      }
    })();

    return new Response(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
