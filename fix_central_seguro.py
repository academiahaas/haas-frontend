import re

path_central = "src/services/centralService.ts"

with open(path_central, "r", encoding="utf-8") as f:
    c = f.read()

# Substitui APENAS os nomes das colunas, sem mexer na estrutura do código, aspas ou crases
c = re.sub(
    r"exercicios_concluidos[a-zA-Z0-9_,]+",
    "exercicios_concluidos,meta_exercicios,total_unidades_modulo,current_unit_id,modulo_atual,current_level",
    c
)

with open(path_central, "w", encoding="utf-8") as f:
    f.write(c)

print("✅ Query do centralService.ts totalmente higienizada com segurança!")
