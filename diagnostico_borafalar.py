import urllib.request
import json
import os
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
    KEY = get_key()

    courses = fetch_all("courses?select=id,title,estimated_hours", KEY)
    borafalar = next((c for c in courses if c["title"] == "BoraFalar"), None)
    if not borafalar:
        print("ERRO: não achei curso com title='BoraFalar'. Cursos existentes:")
        for c in courses:
            print(f"  {c['id']}  {c['title']}")
        raise SystemExit(1)

    course_id = borafalar["id"]
    print(f"Curso BoraFalar: id={course_id}  estimated_hours(atual)={borafalar['estimated_hours']}\n")

    levels = fetch_all("levels?select=id,level_tag,level_name,course_id,total_hours,required_xp", KEY)
    levels_bf = [l for l in levels if l["course_id"] == course_id]
    print(f"Níveis do BoraFalar: {len(levels_bf)}")
    level_ids_bf = {l["id"] for l in levels_bf}

    modules = fetch_all("modules_content?select=id,module_number,module_title,level_id,level_tag,estimated_hours,required_xp", KEY)
    modules_bf = [m for m in modules if m["level_id"] in level_ids_bf]
    print(f"Módulos do BoraFalar: {len(modules_bf)}")
    module_ids_bf = {m["id"] for m in modules_bf}

    units = fetch_all("units?select=id,unit_number,unit_title,module_id,estimated_hours,required_xp", KEY)
    units_bf = [u for u in units if u["module_id"] in module_ids_bf]
    print(f"Units do BoraFalar: {len(units_bf)}\n")

    soma_modulo_h = defaultdict(int)
    soma_modulo_xp = defaultdict(int)
    for u in units_bf:
        soma_modulo_h[u["module_id"]] += u.get("estimated_hours") or 0
        soma_modulo_xp[u["module_id"]] += u.get("required_xp") or 0

    print("=== MÓDULOS (BoraFalar) — valor atual vs soma real das units ===")
    for m in sorted(modules_bf, key=lambda x: (x["level_tag"], x["module_number"])):
        real_h = soma_modulo_h.get(m["id"], 0)
        real_xp = soma_modulo_xp.get(m["id"], 0)
        marca = "" if (real_h == (m.get("estimated_hours") or 0) and real_xp == (m.get("required_xp") or 0)) else "  <-- DIVERGE"
        print(f"  [{m['id']}] {m['level_tag']} mod {m['module_number']} {m['module_title'][:40]:40s} "
              f"horas: {m.get('estimated_hours')} -> {real_h}   xp: {m.get('required_xp')} -> {real_xp}{marca}")

    soma_nivel_h = defaultdict(int)
    soma_nivel_xp = defaultdict(int)
    for m in modules_bf:
        soma_nivel_h[m["level_id"]] += soma_modulo_h.get(m["id"], 0)
        soma_nivel_xp[m["level_id"]] += soma_modulo_xp.get(m["id"], 0)

    print("\n=== NÍVEIS (BoraFalar) — valor atual vs soma real (via units) ===")
    for l in sorted(levels_bf, key=lambda x: x["level_tag"]):
        real_h = soma_nivel_h.get(l["id"], 0)
        real_xp = soma_nivel_xp.get(l["id"], 0)
        marca = "" if (real_h == (l.get("total_hours") or 0) and real_xp == (l.get("required_xp") or 0)) else "  <-- DIVERGE"
        print(f"  [{l['id']}] {l['level_tag']} {l['level_name']:15s} "
              f"horas: {l.get('total_hours')} -> {real_h}   xp: {l.get('required_xp')} -> {real_xp}{marca}")

    total_curso_h = sum(soma_nivel_h.values())
    print(f"\n=== CURSO BoraFalar — valor atual vs soma real (via units) ===")
    marca = "" if total_curso_h == (borafalar.get("estimated_hours") or 0) else "  <-- DIVERGE"
    print(f"  [{course_id}] horas: {borafalar.get('estimated_hours')} -> {total_curso_h}{marca}")
