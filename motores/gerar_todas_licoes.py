import json
import subprocess
import time
import urllib.request

SUPABASE_URL = "https://jdppxfokfhqjudwfwckd.supabase.co"
SERVICE_KEY = "sb_secret__WlrywaYeIcg2xnvFTGyyw_xbys1jtK"
HEADERS = {"apikey": SERVICE_KEY, "Authorization": f"Bearer {SERVICE_KEY}"}

def sb_get(path):
    req = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/{path}", headers=HEADERS)
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode())

def main():
    todas_units = sb_get("units?select=id,unit_number&order=unit_number")
    ja_tem_licao = sb_get("reading_lesson?select=unit_id")
    ids_prontos = set(r["unit_id"] for r in ja_tem_licao if r["unit_id"])

    pendentes = [u for u in todas_units if u["id"] not in ids_prontos]
    print(f"Total de units: {len(todas_units)} | Ja com licao: {len(ids_prontos)} | Faltam: {len(pendentes)}\n")

    sucesso = 0
    falhas = []
    for i, u in enumerate(pendentes):
        print(f"[{i+1}/{len(pendentes)}] Unidade {u['unit_number']} ({u['id']})")
        try:
            resultado = subprocess.run(
                ["python3", "motores/motor_licoes.py", u["id"], "--gravar"],
                cwd="/var/www/haas-frontend-desk-mobile-oficial",
                capture_output=True, text=True, timeout=180
            )
            if resultado.returncode != 0:
                print(f"  ERRO: {resultado.stderr[-500:]}")
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
        time.sleep(2)

    print(f"\n=== CONCLUIDO: {sucesso} licoes gravadas, {len(falhas)} falhas ===")
    if falhas:
        print(f"Units que falharam: {falhas}")

if __name__ == "__main__":
    main()
