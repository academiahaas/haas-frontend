import re

# 1. Atualiza centralService.ts para incluir pedagogical_objective na query da tabela units
path_central = "src/services/centralService.ts"
with open(path_central, "r", encoding="utf-8") as f:
    c_cent = f.read()

# Garante que a coluna pedagogical_objective esta na selecao do Supabase
c_cent = c_cent.replace(
    '.select("id, unit_number, unit_title, estimated_hours, level, module_number")',
    '.select("id, unit_number, unit_title, estimated_hours, level, module_number, pedagogical_objective")'
)

with open(path_central, "w", encoding="utf-8") as f:
    f.write(c_cent)

print("✅ centralService.ts atualizada com a coluna pedagogical_objective!")

# 2. Atualiza no DashboardDesktop.tsx o fallback de rendering da gaveta da unidade
path_dash = "src/app/portal-aluno/DashboardDesktop.tsx"
with open(path_dash, "r", encoding="utf-8") as f:
    c_dash = f.read()

# Garante que onde renderiza o texto da gaveta utilize a coluna pedagogical_objective
c_dash = c_dash.replace(
    'unidade.pedagogical_objective || unidade.objetivo || "Objetivos no mapeados"',
    'unidade.pedagogical_objective || unidade.objetivo || "Objetivos em estruturação"'
)

# Caso no JSX esteja mapeado apenas como item.objetivo ou algo similar
c_dash = re.sub(
    r'(\w+)\.objetivo\b(?!\s*\|\|)',
    r'(\1.pedagogical_objective || \1.objetivo)',
    c_dash
)

with open(path_dash, "w", encoding="utf-8") as f:
    f.write(c_dash)

print("✅ DashboardDesktop.tsx conectado a pedagogical_objective!")
