import re

path_dash = "src/app/portal-aluno/DashboardDesktop.tsx"

with open(path_dash, "r", encoding="utf-8") as f:
    c = f.read()

# Substitui a prioridade para usar puramente o current_level retornado pela Central Service
antigo = "if (dados.nivel_atual || dados.current_level) setNivelUserCentral(String(dados.nivel_atual || dados.current_level));"
novo = "if (dados.current_level) setNivelUserCentral(String(dados.current_level));"

if antigo in c:
    c = c.replace(antigo, novo)
else:
    # Se houver variação de formatação, aplica regex
    c = re.sub(
        r"if\s*\([^)]*nivel_atual[^)]*\)\s*setNivelUserCentral\([^)]*\);",
        "if (dados.current_level) setNivelUserCentral(String(dados.current_level));",
        c
    )

with open(path_dash, "w", encoding="utf-8") as f:
    f.write(c)

print("✅ Mapeamento ajustado para usar oficialmente a coluna 'current_level'!")
