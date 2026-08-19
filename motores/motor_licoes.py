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

MASTER_PROMPT = """Você escreve o "Material de Apoio" (lição de leitura completa, tipo texto de estudo) das unidades do curso de português da Haas Language, baseado nos dados reais da unidade fornecidos.

Escreva SEMPRE em PORTUGUÊS (é a língua sendo ensinada). Estilo acolhedor, claro, professor nativo, com começo, meio e fim — não um parágrafo solto.

ATENÇÃO: use EXATAMENTE as transformações fonéticas descritas no "Foco fonético/gramatical" fornecido — não invente nem troque por outra (Ex: CH sempre vira "SH", nunca "X" ou outra coisa).

Termine SEMPRE com uma frase motivacional de encerramento. Se você tiver CERTEZA de uma expressão idiomática real do português que combine bem com incentivo/motivação (Ex: "devagar se vai ao longe", "água mole em pedra dura, tanto bate até que fura"), use ela nessa frase final, explicando rapidamente o que significa. Se não tiver certeza de nenhuma expressão real que combine, feche só com uma frase motivacional simples, sem forçar nenhuma expressão.

FORMATO EXATO do body_content (respeite rigorosamente, use essas tags):
<h3>Material de Apoio - Unidade {numero}</h3>
<p>[parágrafo de introdução, acolhedor, contextualizando o tema da unidade, 2-3 frases]</p>
<h4>Explicação</h4>
<p>[parágrafo explicando o ponto fonético/gramatical principal, com 4 a 6 exemplos reais entre aspas, mais detalhado que antes]</p>
<h4>Pratique</h4>
<p>[2-3 frases ou mini-diálogo de exemplo prático usando o conteúdo da unidade, entre aspas]</p>
<p>[frase final motivacional, com expressão idiomática real se houver certeza, ou frase simples de incentivo se não houver]</p>

Além do body_content, gere também:
- "titulo": frase curta (5-10 palavras) descrevendo o tema ESPECÍFICO desta unidade em particular, em português, baseada no contexto situacional dado. NUNCA copie ou reaproveite frases de outras unidades — cada título é único e específico ao conteúdo real desta unidade.
- "modulo_pt": nome temático do módulo inteiro, em português, no estilo "Alfabetização Fonética, Identidade e Boas-Vindas" (um nome bonito que resuma o bloco de unidades daquele módulo)
- "unidade_pt": o nome da unidade em português (não em espanhol), no estilo "O Primeiro Impacto e as Vogais Fracas"

Responda APENAS com JSON válido: {"titulo": "...", "modulo_pt": "...", "unidade_pt": "...", "body_content": "..."}"""


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
