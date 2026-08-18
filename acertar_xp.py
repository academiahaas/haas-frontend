import urllib.request
import json
import os
import sys
from collections import defaultdict

SUPABASE_URL = "https://jdppxfokfhqjudwfwckd.supabase.co"


def fetch_all(path, key):
    todos = []
    offset = 0
    limite = 1000
    while True:
        req = urllib.request.Request(
            f"{SUPABASE_URL}/rest/v1/{path}",
            headers={"apikey": key, "Authorization": f"Bearer {key}",
                     "Range": f"{offset}-{offset+limite-1}"}
        )
        pedaco = json.loads(urllib.request.urlopen(req).read())
        todos.extend(pedaco)
        if len(pedaco) < limite:
            break
        offset += limite
    return todos


def patch(path_com_filtro, key, body):
    req = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/{path_com_filtro}",
        data=json.dumps(body).encode(),
        method="PATCH",
        headers={
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal",
        },
    )
    urllib.request.urlopen(req).read()


def get_key():
    KEY = os.environ.get("SUPABASE_KEY")
    if not KEY:
        with open("/var/www/haas-frontend-desk-mobile-oficial/.env") as f:
            for linha in f:
                if linha.startswith("SUPABASE_SERVICE_ROLE_KEY="):
                    KEY = linha.strip().split("=", 1)[1]
                    break
    return KEY


if __name__ == "__main__":
    APLICAR = "--aplicar" in sys.argv
    KEY = get_key()

    # 0) achar o curso BoraFalar e restringir tudo a ele
    courses = fetch_all("courses?select=id,title", KEY)
    borafalar = next((c for c in courses if c["title"] == "BoraFalar"), None)
    if not borafalar:
        print("ERRO: não achei curso 'BoraFalar'.")
        raise SystemExit(1)
    course_id = borafalar["id"]

    levels = fetch_all("levels?select=id,course_id,required_xp,level_tag,level_name", KEY)
    levels_bf = [l for l in levels if l["course_id"] == course_id]
    level_ids_bf = {l["id"] for l in levels_bf}

    modules = fetch_all("modules_content?select=id,level_id,required_xp,module_number,level_tag", KEY)
    modules_bf = [m for m in modules if m["level_id"] in level_ids_bf]
    module_ids_bf = {m["id"] for m in modules_bf}

    units = fetch_all("units?select=id,module_id,required_xp", KEY)
    units_bf = [u for u in units if u["module_id"] in module_ids_bf]

    print(f"Curso: BoraFalar ({course_id})")
    print(f"Níveis: {len(levels_bf)}  Módulos: {len(modules_bf)}  Units: {len(units_bf)}\n")

    # 1) somar XP das units -> corrigir módulos (só BoraFalar)
    soma_mod_xp = defaultdict(int)
    for u in units_bf:
        soma_mod_xp[u["module_id"]] += u.get("required_xp") or 0

    print("=== 1) ACERTO DO XP DOS MÓDULOS (BoraFalar, a partir das units) ===")
    modulos_alterados = 0
    for m in modules_bf:
        novo_xp = soma_mod_xp.get(m["id"], 0)
        if novo_xp != (m.get("required_xp") or 0):
            modulos_alterados += 1
            print(f"  {m['level_tag']} mod {m['module_number']}: xp {m.get('required_xp')} -> {novo_xp}")
            if APLICAR:
                patch(f"modules_content?id=eq.{m['id']}", KEY, {"required_xp": novo_xp})
    print(f"  Total de módulos a corrigir: {modulos_alterados}\n")

    # 2) somar XP dos módulos já corrigidos -> corrigir níveis (só BoraFalar)
    soma_niv_xp = defaultdict(int)
    for m in modules_bf:
        soma_niv_xp[m["level_id"]] += soma_mod_xp.get(m["id"], 0)

    print("=== 2) ACERTO DO XP DOS NÍVEIS (BoraFalar, a partir dos módulos corrigidos) ===")
    niveis_alterados = 0
    for l in levels_bf:
        novo_xp = soma_niv_xp.get(l["id"], 0)
        if novo_xp != (l.get("required_xp") or 0):
            niveis_alterados += 1
            print(f"  {l['level_tag']} {l['level_name']}: xp {l.get('required_xp')} -> {novo_xp}")
            if APLICAR:
                patch(f"levels?id=eq.{l['id']}", KEY, {"required_xp": novo_xp})
    print(f"  Total de níveis a corrigir: {niveis_alterados}\n")

    if not APLICAR:
        print(">>> Isso foi só simulação. Rode com --aplicar para gravar no banco.")
    else:
        print(">>> Alterações gravadas no banco.")
