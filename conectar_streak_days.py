import re

# 1. Garante que a coluna streak_days está inclusa na seleção do Supabase na centralService.ts
path_central = "src/services/centralService.ts"
with open(path_central, "r", encoding="utf-8") as f:
    c_cent = f.read()

if "streak_days" not in c_cent:
    c_cent = re.sub(
        r"select=([^\"]+)",
        r"select=\1,streak_days",
        c_cent
    )
    with open(path_central, "w", encoding="utf-8") as f:
        f.write(c_cent)
    print("✅ centralService.ts atualizada com a coluna streak_days!")

# 2. Conecta o retorno do streak_days ao estado streakDays no DashboardDesktop.tsx
path_dash = "src/app/portal-aluno/DashboardDesktop.tsx"
with open(path_dash, "r", encoding="utf-8") as f:
    c_dash = f.read()

trecho_busca_antigo = "if (dados.modulo_atual) setModuloUserCentral(String(dados.modulo_atual).padStart(2, '0'));"

trecho_busca_novo = """if (dados.modulo_atual) setModuloUserCentral(String(dados.modulo_atual).padStart(2, '0'));
          if (dados.streak_days !== undefined && dados.streak_days !== null && typeof setStreakDays !== 'undefined') setStreakDays(Number(dados.streak_days));"""

if "setStreakDays(Number(dados.streak_days))" not in c_dash:
    c_dash = c_dash.replace(trecho_busca_antigo, trecho_busca_novo)

with open(path_dash, "w", encoding="utf-8") as f:
    f.write(c_dash)

print("✅ DashboardDesktop.tsx conectado ao streak_days da CentralService!")
