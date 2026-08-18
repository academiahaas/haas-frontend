import urllib.request
import json
import os
import sys
import math

SUPABASE_URL = "https://jdppxfokfhqjudwfwckd.supabase.co"
XP_POR_HORA = 220
META_HORAS_CURSO = 250


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

    courses = fetch_all("courses?select=id,title", KEY)
    borafalar = next((c for c in courses if c["title"] == "BoraFalar"), None)
    course_id = borafalar["id"]

    levels = fetch_all("levels?select=id,course_id", KEY)
    level_ids_bf = {l["id"] for l in levels if l["course_id"] == course_id}

    modules = fetch_all("modules_content?select=id,level_id", KEY)
    module_ids_bf = {m["id"] for m in modules if m["level_id"] in level_ids_bf}

    units = fetch_all("units?select=id,module_id,unit_number,unit_title,estimated_hours,required_xp", KEY)
    units_bf = [u for u in units if u["module_id"] in module_ids_bf]

    total_atual = sum(u.get("estimated_hours") or 0 for u in units_bf)
    fator = META_HORAS_CURSO / total_atual

    print(f"Units do BoraFalar: {len(units_bf)}")
    print(f"Total de horas atual: {total_atual}  ->  meta: {META_HORAS_CURSO}  (fator {fator:.4f})\n")

    # método do maior resto: garante que a soma final bate EXATAMENTE na meta
    brutos = []
    for u in units_bf:
        h_atual = u.get("estimated_hours") or 0
        raw = h_atual * fator
        piso = math.floor(raw)
        resto = raw - piso
        brutos.append((u, piso, resto))

    soma_piso = sum(b[1] for b in brutos)
    faltam = META_HORAS_CURSO - soma_piso  # quantas units ainda precisam +1 hora

    brutos.sort(key=lambda b: b[2], reverse=True)
    horas_novas = {}
    for i, (u, piso, resto) in enumerate(brutos):
        horas_novas[u["id"]] = piso + (1 if i < faltam else 0)

    zeradas = [u for u in units_bf if horas_novas[u["id"]] == 0 and (u.get("estimated_hours") or 0) > 0]
    if zeradas:
        print(f"AVISO: {len(zeradas)} unit(s) ficariam com 0 hora — confira antes de aplicar:")
        for u in zeradas:
            print(f"  [{u['id']}] unit {u['unit_number']} - {u['unit_title'][:50]}  (horas atuais: {u.get('estimated_hours')})")
        print()

    alteradas = 0
    for u in units_bf:
        novo_h = horas_novas[u["id"]]
        novo_xp = novo_h * XP_POR_HORA
        if novo_h != (u.get("estimated_hours") or 0) or novo_xp != (u.get("required_xp") or 0):
            alteradas += 1
            if APLICAR:
                patch(f"units?id=eq.{u['id']}", KEY, {"estimated_hours": novo_h, "required_xp": novo_xp})

    print(f"Units alteradas: {alteradas} de {len(units_bf)}")
    print(f"Nova soma de horas: {sum(horas_novas.values())}  (deve ser {META_HORAS_CURSO})")
    print(f"Novo total de xp: {sum(horas_novas.values()) * XP_POR_HORA}\n")

    if not APLICAR:
        print(">>> Isso foi só simulação. Rode com --aplicar para gravar no banco.")
    else:
        print(">>> Alterações gravadas nas UNITS. Agora rode acertar_horas.py --aplicar e acertar_xp.py --aplicar pra propagar pra módulos/níveis/curso.")
