import re

path_central = "src/services/centralService.ts"

with open(path_central, "r", encoding="utf-8") as f:
    c = f.read()

# Substitui qualquer select bagunçado ou duplicado pela lista oficial e limpa de colunas do banco
c = re.sub(
    r"select=[^\"]+",
    "select=exercicios_concluidos,meta_exercicios,total_unidades_modulo,current_unit_id,modulo_atual,current_level",
    c
)

with open(path_central, "w", encoding="utf-8") as f:
    f.write(c)

print("✅ Query do centralService.ts totalmente higienizada!")
