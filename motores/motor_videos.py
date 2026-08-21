import json
import re
import sys
import os
import shutil
import subprocess
import urllib.request
import urllib.parse
sys.path.insert(0, '/tmp')
from revisor import revisar_e_corrigir
from datetime import datetime, timezone

SUPABASE_URL = "https://jdppxfokfhqjudwfwckd.supabase.co"
SERVICE_KEY = "sb_secret__WlrywaYeIcg2xnvFTGyyw_xbys1jtK"
DEEPSEEK_KEY = "sk-e426fa20f2c64907bb550d7eccf1261f"
VOZ_PADRAO = "pt-BR-FranciscaNeural"  # fallback, uso real e por curso agora
TAXA_VELOCIDADE = "-15%"
BUCKET = "haas-academy"
REMOTION_DIR = "/var/www/remotion-videos"
FRONTEND_DOWNLOADS = "/var/www/haas-frontend-desk-mobile-oficial/public/downloads"

HEADERS = {"apikey": SERVICE_KEY, "Authorization": f"Bearer {SERVICE_KEY}", "Content-Type": "application/json"}

def tem_acento_forte(silaba):
    return bool(re.search(r'[áíóúâêô]', silaba))

def converter_fonetica(palavra):
    baixa = palavra.lower()
    baixa = re.sub(r'ão\b', 'ãu', baixa)
    baixa = re.sub(r'ãe\b', 'ãi', baixa)
    baixa = re.sub(r'[eé]m\b', 'eim', baixa)
    ultima_silaba_acentuada = tem_acento_forte(baixa[-3:]) if len(baixa) >= 2 else False
    marcador_chi = "@CH@"
    if not ultima_silaba_acentuada:
        baixa = re.sub(r'de\b', 'yi', baixa)
        baixa = re.sub(r'di\b', 'yi', baixa)
        baixa = re.sub(r'te\b', marcador_chi + 'i', baixa)
        baixa = re.sub(r'ti\b', marcador_chi + 'i', baixa)
        baixa = re.sub(r'os\b', 'us', baixa)
        baixa = re.sub(r'o\b', 'u', baixa)
        baixa = re.sub(r'es\b', 'is', baixa)
        baixa = re.sub(r'e\b', 'i', baixa)
    baixa = re.sub(r'l\b', 'u', baixa)
    baixa = re.sub(r'ge', 'Ye', baixa)
    baixa = re.sub(r'gi', 'Yi', baixa)
    baixa = baixa.replace('j', 'Y')
    baixa = re.sub(r'^r', 'J', baixa)
    baixa = re.sub(r'rr', 'J', baixa)
    baixa = baixa.replace('ch', 'sh')
    baixa = baixa.replace('ç', 'ss')
    baixa = baixa.replace('nh', 'ñ')
    baixa = baixa.replace('lh', 'li')
    baixa = baixa.replace(marcador_chi, 'ch')
    return baixa.upper()


PROMPT_PORTUGUES = """Você é o roteirista oficial dos vídeos da Haas Language. Gera roteiros de vídeo em PORTUGUÊS (idioma sendo ensinado), narrado inteiramente em português normal, natural, pedagógico — como um professor nativo falando devagar com um aluno iniciante hispanofalante.

REGRA CRÍTICA 0: a "narracion" NUNCA pode ter lacunas, sublinhados, underscores ou espaços em branco pra completar (tipo "Eu ____ do Brasil"). Isso é formato de exercício escrito, não de vídeo narrado. Toda frase falada tem que estar 100% completa e natural, sem nenhum "buraco".

REGRA CRÍTICA 0.5: só explique a fonética de uma palavra quando ela REALMENTE seguir uma das regras do foco fonético da unidade. NUNCA force uma explicação em palavra que não se encaixa na regra, e NUNCA "pense em voz alta" ou faça perguntas retóricas incertas tipo "então fica algo como...? Na verdade..." — isso confunde o aluno. Se a palavra de vocabulário (tipo uma saudação) não seguir nenhuma regra fonética ensinada na unidade, apresente ela normalmente, sem tentar explicar nada, só como vocabulário pra praticar.

REGRA CRÍTICA 1: toda frase de narração deve ser COMPLETA e realmente FALAR a palavra/frase em destaque. NUNCA deixe uma frase pendurada tipo "Escute esta palavra:" sem falar a palavra. Exemplo CERTO: "Escute esta palavra: rio. Esse R tem um som forte." Exemplo ERRADO: "Escute esta palavra:" (não fala a palavra).

REGRA CRÍTICA 2: toda cena precisa de "legendaPt" (o texto EXATO de tudo que foi falado nessa cena, em português) e "legendaEs" (a tradução completa e fiel desse mesmo texto pro espanhol, com qualquer palavra em português dentro da legenda espanhola entre aspas). As legendas não podem ser resumos genéricos — têm que corresponder ao que foi realmente dito.

REGRA CRÍTICA 3: toda cena precisa de "titulo" — um título curto e chamativo (3-6 palavras, maiúsculas ou estilo chamada) que resume o assunto daquela cena especificamente, pra chamar atenção do aluno (Ex: "O SOM FORTE DO R!", "VERBO SER").

DURAÇÃO: o vídeo completo deve ficar perto de 4 minutos. Gere entre 12 e 16 cenas, objetivas e diretas, sem repetição excessiva. O vídeo deve durar entre 2 e 3 minutos no total.

FORMATO DE SAÍDA: JSON com lista "cenas". Cada cena tem "tipo" ("conceito" ou "practica"), "titulo", "narracion" (fala completa em português), "legendaPt", "legendaEs".
Cenas "conceito" também têm "texto_tela" (resumo bem curto, tipo 2-4 palavras, pro texto grande central).
Cenas "practica" também têm "palabra" (a palavra/frase em destaque, grafia normal, maiúscula) e "traduccion" (tradução curta da palavra, pra tela).

Responda APENAS com JSON válido, sem markdown."""

CURSOS_INGLES = {"8f73b9e1-2c4d-4a1b-9f8e-d7a6c5b4e3f2", "6669de72-d64c-4a2d-b360-2cc7c478ae83"}
VOZ_INGLES = "en-US-AvaMultilingualNeural"
VOZ_ESPANHOL_NARRACAO = "es-MX-DaliaNeural"
VOZ_PORTUGUES = "pt-BR-FranciscaNeural"

PROMPT_INGLES = """Eres el guionista oficial de los videos de Haas Language para el curso de INGLÉS dirigido a hispanohablantes. Genera guiones de video narrados en ESPAÑOL (idioma auxiliar del estudiante) para toda la explicación, pero las palabras y frases en inglés que se están enseñando deben decirse EXACTAMENTE en inglés dentro de la narración — como un profesor hispanohablante que explica en español y modela la pronunciación correcta en inglés.

REGLA CRÍTICA 0: la "narracion" NUNCA puede tener espacios en blanco, guiones bajos o huecos para completar (tipo "Yo ____ de Brasil"). Eso es formato de ejercicio escrito, no de video narrado. Toda frase hablada debe estar 100% completa y natural, sin ningún "hueco".

REGLA CRÍTICA 0.5: solo explica la fonética/pronunciación de una palabra en inglés cuando realmente siga una de las reglas del foco fonético de la unidad. NUNCA fuerces una explicación en una palabra que no encaja en la regla, y NUNCA "pienses en voz alta" ni hagas preguntas retóricas inciertas tipo "¿entonces sería algo como...? En realidad...". Si la palabra de vocabulario no sigue ninguna regla fonética enseñada en la unidad, preséntala normalmente, sin intentar explicar nada, solo como vocabulario para practicar.

REGLA CRÍTICA 1: toda frase de narración debe estar COMPLETA y realmente DECIR la palabra/frase en inglés que está en foco. NUNCA dejes una frase colgada tipo "Escucha esta palabra:" sin decir la palabra. Ejemplo CORRECTO: "Escucha esta palabra: work. Se pronuncia con el sonido..." Ejemplo INCORRECTO: "Escucha esta palabra:" (no dice la palabra).

REGLA CRÍTICA 2: toda escena necesita "legendaPt" (la transcripción EXACTA de todo lo que se dijo en esa escena, tal cual se narró, con la mezcla de español e inglés) y "legendaEs" (una versión íntegra en español de ese mismo contenido, con cualquier palabra en inglés entre comillas). Las leyendas no pueden ser resúmenes genéricos — deben corresponder a lo que realmente se dijo.

REGLA CRÍTICA 3: toda escena necesita "titulo" — un título corto y llamativo (3-6 palabras, en mayúsculas o estilo titular) que resuma el tema específico de esa escena, para captar la atención del estudiante (Ej: "EL VERBO TO BE", "PRESENTE SIMPLE").

REGLA CRÍTICA 4: dentro de "narracion", envuelve CADA palabra o frase en inglés que deba pronunciarse en inglés con las etiquetas <en> y </en> (ej: "Escucha esta palabra: <en>work</en>. Se pronuncia..."). Todo el resto del texto (en español) queda fuera de esas etiquetas. Esto es OBLIGATORIO, sin excepción, para cada fragmento en inglés.

DURACIÓN: el video completo debe durar cerca de 4 minutos. Genera entre 22 y 30 escenas, con explicaciones completas y ritmo pausado (no frases demasiado cortas).

FORMATO DE SALIDA: JSON con lista "cenas". Cada escena tiene "tipo" ("conceito" o "practica"), "titulo", "narracion" (habla completa, español con las palabras/frases en inglés incluidas tal cual se dicen), "legendaPt", "legendaEs".
Escenas "conceito" también tienen "texto_tela" (resumen muy corto, tipo 2-4 palabras, para el texto grande central, en español).
Escenas "practica" también tienen "palabra" (la palabra/frase en inglés en foco, grafía normal, mayúscula) y "traduccion" (traducción corta de la palabra al español, para la pantalla).

Responda SOLO con JSON válido, sin markdown."""



def sb_get(path):
    req = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/{path}", headers=HEADERS)
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode())


def sb_patch(table, filtro, dados):
    req = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/{table}?{filtro}", data=json.dumps(dados).encode(), headers=HEADERS, method="PATCH")
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode()


def sb_post(table, dados):
    req = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/{table}", data=json.dumps(dados).encode(), headers=HEADERS, method="POST")
    with urllib.request.urlopen(req, timeout=30) as r:
        texto = r.read().decode()
        return json.loads(texto) if texto else None


def storage_upload(caminho, arquivo_local, content_type):
    with open(arquivo_local, "rb") as f:
        conteudo = f.read()
    req = urllib.request.Request(
        f"{SUPABASE_URL}/storage/v1/object/{BUCKET}/{urllib.parse.quote(caminho)}",
        data=conteudo,
        headers={"apikey": SERVICE_KEY, "Authorization": f"Bearer {SERVICE_KEY}", "Content-Type": content_type, "x-upsert": "true"},
        method="POST",
    )
    urllib.request.urlopen(req, timeout=120)
    return f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET}/{urllib.parse.quote(caminho)}"


def deepseek(sistema, usuario):
    payload = json.dumps({
        "model": "deepseek-v4-flash",
        "messages": [{"role": "system", "content": sistema}, {"role": "user", "content": usuario}],
        "response_format": {"type": "json_object"},
        "max_tokens": 16000,
        "thinking": {"type": "disabled"},
    }).encode("utf-8")
    req = urllib.request.Request("https://api.deepseek.com/chat/completions", data=payload, headers={"Authorization": f"Bearer {DEEPSEEK_KEY}", "Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(req, timeout=180) as r:
        resp = json.loads(r.read().decode("utf-8"))
    return json.loads(resp["choices"][0]["message"]["content"])


def gerar_apenas_roteiro(unit_id, curso_id=None):
    print(f"=== Gerando roteiro NOVO (curto, max 3min) pra unidade {unit_id} ===")
    unidade = sb_get(f"units?id=eq.{unit_id}&select=id,unit_number,unit_title,level,pedagogical_objective,practical_phonetic_focus,situational_content,hidden_grammatical_structure")[0]

    usuario = f"""Unidade: {unidade['unit_title']} (nível {unidade['level']})
Objetivo pedagógico: {unidade['pedagogical_objective']}
Foco fonético/gramatical: {unidade['practical_phonetic_focus'] or 'não especificado'}
Contexto situacional: {unidade['situational_content'] or 'não especificado'}
Estrutura gramatical: {unidade['hidden_grammatical_structure'] or 'não especificado'}"""

    ingles = curso_id in CURSOS_INGLES
    prompt_escolhido = PROMPT_INGLES if ingles else PROMPT_PORTUGUES
    voz_escolhida = VOZ_INGLES if ingles else VOZ_PORTUGUES
    idioma_label = "Inglés" if ingles else "Portugués"
    resultado = deepseek(prompt_escolhido, usuario)
    cenas = resultado["cenas"]

    print("  Revisando roteiro...")
    cenas_texto = json.dumps(cenas, ensure_ascii=False)
    cenas_texto_revisado = revisar_e_corrigir(cenas_texto)
    try:
        cenas = json.loads(cenas_texto_revisado)
    except json.JSONDecodeError:
        print("  AVISO: revisão quebrou o formato JSON, usando versão original sem revisão.")

    unidade_label = f"Unidad {unidade['unit_number']}: {unidade['unit_title']}"
    nivel_label = f"{idioma_label} {unidade['level']}"

    roteiro_path = f"/tmp/roteiro_{unit_id[:8]}.json"
    with open(roteiro_path, "w") as f:
        json.dump({"unit_id": unit_id, "unidade_label": unidade_label, "nivel_label": nivel_label, "voz": voz_escolhida, "cenas": cenas}, f, ensure_ascii=False, indent=2)

    sb_post("roteiros_revisao", {"unit_id": unit_id, "unidade_label": unidade_label, "nivel_label": nivel_label, "cenas": cenas, "status": "pendente"})  # voz fica so no json local, tabela nao tem essa coluna

    print(f"\n{len(cenas)} cenas geradas. Salvo em: {roteiro_path} e enviado para revisao no Supabase (tabela roteiros_revisao)\n")
    print("=" * 60)
    for i, cena in enumerate(cenas):
        print(f"\n--- Cena {i} ({cena['tipo']}) — {cena.get('titulo','')} ---")
        print(f"Narração: {cena['narracion']}")
        print(f"Legenda PT: {cena.get('legendaPt','')}")
        print(f"Legenda ES: {cena.get('legendaEs','')}")
        if cena["tipo"] == "practica":
            print(f"Palavra: {cena.get('palabra','')} | Tradução: {cena.get('traduccion','')}")
    print("\n" + "=" * 60)
    print(f"\n>>> Revise/edite: nano {roteiro_path} <<<")
    print(f">>> Continuar: python3 /tmp/motor_videos.py {unit_id} --continuar <<<")



def dividir_segmentos_idioma(texto):
    PALAVRAS_INGLES = {"the","is","are","you","i","am","a","an","to","do","does","what","how","old","years","year",
        "teacher","doctor","engineer","student","nurse","lawyer","scientist","architect","and","for","with","this",
        "that","my","your","his","her","its","our","their","he","she","it","we","they","was","were","be","been",
        "have","has","had","will","would","can","could","should","not","no","yes","of","in","on","at","from","by",
        "as","but","or","if","when","where","who","why","which","me","him","us","them","good","very","name","work"}
    PALAVRAS_ESPANHOL = {"de","la","el","en","y","a","que","es","un","una","para","con","los","las","se","su","por",
        "como","este","esta","del","al","lo","muy","pero","si","no","tu","tus","sus","esto","eso","aquí","ahora",
        "vamos","escucha","repite","bien","cómo","qué","cuál","cuáles","quien","quién","también","más","voy",
        "vas","va","yo","tú","él","ella","nosotros","practica","practiquemos","hola","gracias","bienvenido",
        "recuerda","presta","atención","aprender","aprendimos","escuchamos","escuchar","decir","dice","dices"}

    frases = re.split(r'(?<=[.!?:])\s+', texto)
    segmentos = []
    for frase in frases:
        if not frase.strip():
            continue
        palavras = re.findall(r"[a-záéíóúñü']+", frase.lower())
        pontos_en = sum(1 for p in palavras if p in PALAVRAS_INGLES)
        pontos_es = sum(1 for p in palavras if p in PALAVRAS_ESPANHOL)
        idioma = "en" if pontos_en > pontos_es else "es"
        if segmentos and segmentos[-1][1] == idioma:
            segmentos[-1] = (segmentos[-1][0] + " " + frase.strip(), idioma)
        else:
            segmentos.append((frase.strip(), idioma))
    return segmentos





def gerar_audio_cena(texto, ingles, arquivo):
    if not ingles:
        voz = VOZ_PORTUGUES
        for tentativa in range(3):
            try:
                subprocess.run(["edge-tts", "--voice", voz, f"--rate={TAXA_VELOCIDADE}", "--text", texto, "--write-media", arquivo], check=True, capture_output=True, timeout=30)
                return
            except (subprocess.TimeoutExpired, subprocess.CalledProcessError):
                if tentativa == 2:
                    raise
        return

    segmentos = dividir_segmentos_idioma(texto)
    arquivos_parciais = []
    for i, (trecho, idioma) in enumerate(segmentos):
        voz = VOZ_INGLES if idioma == "en" else VOZ_ESPANHOL_NARRACAO
        parcial = f"{arquivo}.parte{i}.mp3"
        for tentativa in range(3):
            try:
                subprocess.run(["edge-tts", "--voice", voz, f"--rate={TAXA_VELOCIDADE}", "--text", trecho, "--write-media", parcial], check=True, capture_output=True, timeout=30)
                break
            except (subprocess.TimeoutExpired, subprocess.CalledProcessError):
                if tentativa == 2:
                    raise
        arquivos_parciais.append(parcial)

    lista_concat = f"{arquivo}.lista.txt"
    with open(lista_concat, "w") as f2:
        for p in arquivos_parciais:
            f2.write(f"file '{__import__('os').path.abspath(p)}'\n")
    subprocess.run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", lista_concat, "-c", "copy", arquivo], check=True, capture_output=True)
    for p in arquivos_parciais:
        __import__('os').remove(p)
    __import__('os').remove(lista_concat)


def gerar_video_unidade(unit_id):
    print(f"=== Gerando vídeo pra unidade {unit_id} ===")
    roteiro_path = f"/tmp/roteiro_{unit_id[:8]}.json"
    if not os.path.exists(roteiro_path):
        print(f"ERRO: não achei {roteiro_path}.")
        sys.exit(1)

    with open(roteiro_path) as f:
        dados_roteiro = json.load(f)

    unidade_label = dados_roteiro["unidade_label"]
    nivel_label = dados_roteiro["nivel_label"]
    cenas_brutas = dados_roteiro["cenas"]
    voz_usada = dados_roteiro.get("voz", VOZ_PADRAO)

    print("Gerando áudios (mais devagar, só narração em português)...")
    pasta_audio = f"audio_{unit_id[:8]}"
    pasta_audio_local = f"{REMOTION_DIR}/public/{pasta_audio}"
    os.makedirs(pasta_audio_local, exist_ok=True)

    cenas_finais = []
    for i, cena in enumerate(cenas_brutas):
        print(f"  Gerando áudio {i+1}/{len(cenas_brutas)}...")
        codigo = f"c{i:02d}"
        arquivo = f"{pasta_audio_local}/{codigo}.mp3"
        gerar_audio_cena(cena["narracion"], voz_usada == VOZ_INGLES, arquivo)
        r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "json", arquivo], capture_output=True, text=True)
        duracao = float(json.loads(r.stdout)["format"]["duration"])

        base = {
            "codigo": codigo, "titulo": cena.get("titulo", ""),
            "legendaPt": cena.get("legendaPt", ""), "legendaEs": cena.get("legendaEs", ""),
            "duracaoSeg": round(duracao, 2),
        }
        if cena["tipo"] == "practica":
            pronuncia_visual = converter_fonetica(cena["palabra"])
            cenas_finais.append({
                **base, "tipo": "practica", "unidade": unidade_label, "nivel": nivel_label,
                "traducao": cena["traduccion"], "palavra": cena["palabra"].upper(), "pronuncia": pronuncia_visual,
            })
        else:
            cenas_finais.append({**base, "tipo": "conceito", "textoTela": cena["texto_tela"]})

    print(f"{len(cenas_finais)} áudios gerados")

    props = {"cenas": cenas_finais, "pastaAudio": pasta_audio}
    props_path = f"/tmp/props_{unit_id[:8]}.json"
    with open(props_path, "w") as f:
        json.dump(props, f, ensure_ascii=False)

    print("Renderizando vídeo...")
    saida_local = f"/tmp/video_{unit_id[:8]}.mp4"
    subprocess.run(
        ["npx", "remotion", "render", "src/index.ts", "VideoGenerico", saida_local, f"--props={props_path}", "--timeout=120000", "--concurrency=4", "--crf=28", "--preset=fast"],
        cwd=REMOTION_DIR, check=True,
    )

    print("Subindo e registrando...")
    url_video = storage_upload(f"aulas_geradas/unidade_{unit_id}.mp4", saida_local, "video/mp4")
    shutil.copy(saida_local, f"{FRONTEND_DOWNLOADS}/unidade_{unit_id}.mp4")
    url_site = f"https://campus.academiahaas.com/downloads/unidade_{unit_id}.mp4"

    sb_patch("units", f"id=eq.{unit_id}", {"video_status": "pronto", "video_url": url_site, "video_generated_at": datetime.now(timezone.utc).isoformat()})
    print(f"\n✅ CONCLUÍDO: {url_site}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python3 motor_videos.py <unit_id> [--continuar] [--curso=<curso_id>]")
        sys.exit(1)
    unit_id = sys.argv[1]
    curso_id_arg = None
    for arg in sys.argv[2:]:
        if arg.startswith("--curso="):
            curso_id_arg = arg.split("=", 1)[1]
    if "--continuar" in sys.argv:
        gerar_video_unidade(unit_id)
    else:
        gerar_apenas_roteiro(unit_id, curso_id_arg)
