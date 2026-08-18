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

    units = fetch_all("units?select=id,unit_number,unit_title,module_id,estimated_hours,required_xp", KEY)
    modules = fetch_all("modules_content?select=id,module_number,module_title,level_id,level_tag,estimated_hours,required_xp", KEY)
    levels = fetch_all("levels?select=id,level_tag,level_name,course_id,total_hours,required_xp", KEY)
    courses = fetch_all("courses?select=id,title,estimated_hours", KEY)

    print(f"units={len(units)}  modules_content={len(modules)}  levels={len(levels)}  courses={len(courses)}\n")

    soma_por_modulo_horas = defaultdict(int)
    soma_por_modulo_xp = defaultdict(int)
    for u in units:
        mid = u.get("module_id")
        if mid:
            soma_por_modulo_horas[mid] += u.get("estimated_hours") or 0
            soma_por_modulo_xp[mid] += u.get("required_xp") or 0

    print("=== 1) UNITS -> MODULES_CONTENT ===")
    problemas_modulo = 0
    for m in modules:
        mid = m["id"]
        soma_h = soma_por_modulo_horas.get(mid, 0)
        soma_xp = soma_por_modulo_xp.get(mid, 0)
        mod_h = m.get("estimated_hours") or 0
        mod_xp = m.get("required_xp") or 0
        if soma_h != mod_h or soma_xp != mod_xp:
            problemas_modulo += 1
            print(f"  [DIVERGE] {m['level_tag']} módulo {m['module_number']} - {m['module_title']}")
            if soma_h != mod_h:
                print(f"      horas: soma das units={soma_h}  vs  módulo={mod_h}")
            if soma_xp != mod_xp:
                print(f"      xp:    soma das units={soma_xp}  vs  módulo={mod_xp}")
    if problemas_modulo == 0:
        print("  OK: todos os módulos batem com a soma das units.")
    else:
        print(f"  Total de módulos divergentes: {problemas_modulo}/{len(modules)}")

    soma_por_nivel_horas = defaultdict(int)
    soma_por_nivel_xp = defaultdict(int)
    for m in modules:
        lid = m.get("level_id")
        if lid:
            soma_por_nivel_horas[lid] += m.get("estimated_hours") or 0
            soma_por_nivel_xp[lid] += m.get("required_xp") or 0

    print("\n=== 2) MODULES_CONTENT -> LEVELS ===")
    problemas_nivel = 0
    for l in levels:
        lid = l["id"]
        soma_h = soma_por_nivel_horas.get(lid, 0)
        soma_xp = soma_por_nivel_xp.get(lid, 0)
        lvl_h = l.get("total_hours") or 0
        lvl_xp = l.get("required_xp") or 0
        if soma_h != lvl_h or soma_xp != lvl_xp:
            problemas_nivel += 1
            print(f"  [DIVERGE] {l['level_tag']} - {l['level_name']}")
            if soma_h != lvl_h:
                print(f"      horas: soma dos módulos={soma_h}  vs  nível={lvl_h}")
            if soma_xp != lvl_xp:
                print(f"      xp:    soma dos módulos={soma_xp}  vs  nível={lvl_xp}")
    if problemas_nivel == 0:
        print("  OK: todos os níveis batem com a soma dos módulos.")
    else:
        print(f"  Total de níveis divergentes: {problemas_nivel}/{len(levels)}")

    soma_por_curso_horas = defaultdict(int)
    for l in levels:
        cid = l.get("course_id")
        if cid:
            soma_por_curso_horas[cid] += l.get("total_hours") or 0

    print("\n=== 3) LEVELS -> COURSES ===")
    problemas_curso = 0
    for c in courses:
        cid = c["id"]
        soma_h = soma_por_curso_horas.get(cid, 0)
        curso_h = c.get("estimated_hours") or 0
        if soma_h != curso_h:
            problemas_curso += 1
            print(f"  [DIVERGE] {c['title']}")
            print(f"      horas: soma dos niveles={soma_h}  vs  curso={curso_h}")
    if problemas_curso == 0:
        print("  OK: todos os cursos batem com a soma dos níveis.")
    else:
        print(f"  Total de cursos divergentes: {problemas_curso}/{len(courses)}")

    print(f"\n=== RESUMO ===")
    print(f"Módulos divergentes: {problemas_modulo}")
    print(f"Níveis divergentes:  {problemas_nivel}")
    print(f"Cursos divergentes:  {problemas_curso}")
