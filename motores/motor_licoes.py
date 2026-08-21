import json
import sys
import uuid
import urllib.request
sys.path.insert(0, '/tmp')
from revisor import revisar_e_corrigir

SUPABASE_URL = "https://jdppxfokfhqjudwfwckd.supabase.co"
SERVICE_KEY = "sb_secret_PngpeWMeQNFg1OcKpl0xOw_ZVZ8PMVz"
DEEPSEEK_KEY = "sk-e426fa20f2c64907bb550d7eccf1261f"

HEADERS = {"apikey": SERVICE_KEY, "Authorization": f"Bearer {SERVICE_KEY}", "Content-Type": "application/json"}

MASTER_PROMPT = """Escribes el "Material de Apoyo" (lección de lectura completa, tipo texto de estudio) de las unidades del curso de INGLÉS de Haas Language para hispanohablantes, basado en los datos reales de la unidad proporcionados.

Escribe SIEMPRE en ESPAÑOL (es el idioma auxiliar del estudiante) — el idioma que se está enseñando es el INGLÉS. Los ejemplos y frases prácticas van en inglés, pero toda la explicación, contexto e instrucciones deben estar en español.

ATENCIÓN: usa EXACTAMENTE las transformaciones fonéticas/gramaticales descritas en el "Foco fonético/gramatical" proporcionado — no inventes ni cambies por otra.

Termina SIEMPRE con una frase motivacional de cierre, en español. Si tienes CERTEZA de una expresión idiomática real en español que combine con incentivo/motivación (Ej: "quien la sigue la consigue", "no hay mal que por bien no venga"), úsala explicando rápidamente qué significa. Si no tienes certeza de ninguna expresión real que combine, cierra solo con una frase motivacional simple, sin forzar ninguna expresión.

FORMATO EXACTO del body_content (respeta rigurosamente, usa esas etiquetas):
<h3>Material de Apoyo - Unidad {numero}</h3>
<p>[párrafo de introducción, acogedor, contextualizando el tema de la unidad, 2-3 frases, en español]</p>
<h4>Explicación</h4>
<p>[párrafo explicando el punto gramatical/fonético principal EN INGLÉS, con 4 a 6 ejemplos reales en inglés entre comillas, explicación en español]</p>
<h4>Practica</h4>
<p>[2-3 frases o mini-diálogo de ejemplo práctico en inglés usando el contenido de la unidad, entre comillas]</p>
<p>[frase final motivacional en español, con expresión idiomática real si hay certeza, o frase simple de incentivo si no la hay]</p>

Además del body_content, genera también:
- "titulo": frase corta (5-10 palabras) describiendo el tema ESPECÍFICO de esta unidad, en español, basada en el contexto situacional dado. NUNCA copies frases de otras unidades.
- "modulo_pt": nombre temático del módulo entero, en español, estilo "Alfabetización Fonética, Identidad y Bienvenida".
- "unidade_pt": el nombre de la unidad en español, estilo "El Primer Impacto y las Vocales Débiles".

Responde SOLO con JSON válido: {"titulo": "...", "modulo_pt": "...", "unidade_pt": "...", "body_content": "..."}"""


def sb_get(path):
    req = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/{path}", headers=HEADERS)
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode())


def sb_post(table, dados):
    req = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/{table}", data=json.dumps(dados).encode(), headers=HEADERS, method="POST")
    with urllib.request.urlopen(req, timeout=30) as r:
        texto = r.read().decode()
        return json.loads(texto) if texto else None


def deepseek(sistema, usuario):
    payload = json.dumps({
        "model": "deepseek-v4-flash",
        "messages": [{"role": "system", "content": sistema}, {"role": "user", "content": usuario}],
        "response_format": {"type": "json_object"},
        "max_tokens": 2000,
        "thinking": {"type": "disabled"},
    }).encode("utf-8")
    req = urllib.request.Request("https://api.deepseek.com/chat/completions", data=payload, headers={"Authorization": f"Bearer {DEEPSEEK_KEY}", "Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(req, timeout=180) as r:
        resp = json.loads(r.read().decode("utf-8"))
    return json.loads(resp["choices"][0]["message"]["content"])


def gerar_licao(unit_id, gravar=False):
    unidade = sb_get(f"units?id=eq.{unit_id}&select=id,unit_number,unit_title,level,module_content_id,pedagogical_objective,practical_phonetic_focus,situational_content,hidden_grammatical_structure")[0]

    usuario = f"""Unidade número: {unidade['unit_number']}
Título (espanhol, só referência): {unidade['unit_title']}
Objetivo pedagógico: {unidade['pedagogical_objective']}
Foco fonético/gramatical: {unidade['practical_phonetic_focus'] or 'não especificado'}
Contexto situacional: {unidade['situational_content'] or 'não especificado'}
Estrutura gramatical: {unidade['hidden_grammatical_structure'] or 'não especificado'}"""

    MINIMO_CARACTERES = 900
    resultado = deepseek(MASTER_PROMPT, usuario)
    for tentativa in range(3):
        if len(resultado["body_content"]) >= MINIMO_CARACTERES:
            break
        print(f"  Conteúdo curto ({len(resultado['body_content'])} caracteres), tentando de novo...")
        resultado = deepseek(MASTER_PROMPT, usuario + "\n\nIMPORTANTE: o conteúdo anterior ficou curto demais. Escreva de forma mais completa e detalhada, com mais exemplos.")

    print("  Revisando conteúdo...")
    resultado["body_content"] = revisar_e_corrigir(resultado["body_content"])

    print(f"\n--- Unidade {unidade['unit_number']} ({len(resultado['body_content'])} caracteres) ---")
    print(f"Título: {resultado['titulo']}")
    print(f"Módulo (PT): {resultado['modulo_pt']}")
    print(f"Unidade (PT): {resultado['unidade_pt']}")
    print(f"Conteúdo: {resultado['body_content']}")

    if gravar:
        linha = {
            "id": str(uuid.uuid4()),
            "module_id": unidade["module_content_id"],
            "title": resultado["titulo"],
            "lesson_number": unidade["unit_number"],
            "order_index": 2,
            "body_content": resultado["body_content"],
            "level": unidade["level"],
            "module": resultado["modulo_pt"],
            "unit": resultado["unidade_pt"],
            "unit_id": unit_id,
        }
        sb_post("reading_lesson", linha)
        print(">>> GRAVADO no banco <<<")
    else:
        print(">>> Só teste, NÃO gravado. Rode com --gravar pra salvar de verdade <<<")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python3 motor_licoes.py <unit_id> [--gravar]")
        sys.exit(1)
    gerar_licao(sys.argv[1], gravar="--gravar" in sys.argv)
