import json
import subprocess
import sys
import time
import urllib.request

SUPABASE_URL = "https://jdppxfokfhqjudwfwckd.supabase.co"
SERVICE_KEY = "sb_secret__WlrywaYeIcg2xnvFTGyyw_xbys1jtK"
HEADERS = {"apikey": SERVICE_KEY, "Authorization": f"Bearer {SERVICE_KEY}"}


def sb_get(path):
    req = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/{path}", headers=HEADERS)
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode())


def units_do_curso(curso_id):
    niveis = sb_get(f"levels?select=id&course_id=eq.{curso_id}")
    ids_niveis = [n["id"] for n in niveis]
    if not ids_niveis:
        return []
    lista_niveis = ",".join(ids_niveis)
    modulos = sb_get(f"modules_content?select=id&level_id=in.({lista_niveis})")
    ids_modulos = [m["id"] for m in modulos]
    if not ids_modulos:
        return []
    lista_modulos = ",".join(ids_modulos)
    return sb_get(f"units?select=id,unit_number,video_status&module_id=in.({lista_modulos})&order=unit_number")


def main():
    if len(sys.argv) < 2:
        print("Uso: python3 motores/gerar_videos_por_curso.py <curso_id>")
        sys.exit(1)

    curso_id = sys.argv[1]
    todas_units = units_do_curso(curso_id)
    pendentes = [u for u in todas_units if u["video_status"] != "pronto"]
    print(f"Curso {curso_id} | Total de units: {len(todas_units)} | Ja com video: {len(todas_units) - len(pendentes)} | Faltam: {len(pendentes)}\n")

    sucesso = 0
    falhas = []
    for i, u in enumerate(pendentes):
        print(f"[{i+1}/{len(pendentes)}] Unidade {u['unit_number']} ({u['id']})")
        try:
            r1 = subprocess.run(
                ["python3", "motores/motor_videos.py", u["id"], f"--curso={curso_id}"],
                cwd="/var/www/haas-frontend-desk-mobile-oficial",
                capture_output=True, text=True, timeout=600
            )
            if r1.returncode != 0:
                print(f"  ERRO (roteiro): {r1.stderr[-500:]}")
                falhas.append(u["unit_number"])
                continue

            r2 = subprocess.run(
                ["python3", "motores/motor_videos.py", u["id"], "--continuar", f"--curso={curso_id}"],
                cwd="/var/www/haas-frontend-desk-mobile-oficial",
                capture_output=True, text=True, timeout=3600
            )
            if r2.returncode != 0:
                print(f"  ERRO (video): {r2.stderr[-500:]}")
                falhas.append(u["unit_number"])
            else:
                sucesso += 1
                print(f"  OK")
        except subprocess.TimeoutExpired:
            print(f"  TIMEOUT")
            falhas.append(u["unit_number"])
        except Exception as e:
            print(f"  ERRO INESPERADO: {e}")
            falhas.append(u["unit_number"])
        time.sleep(3)

    print(f"\n=== CONCLUIDO: {sucesso} videos gerados, {len(falhas)} falhas ===")
    if falhas:
        print(f"Units que falharam: {falhas}")


if __name__ == "__main__":
    main()
