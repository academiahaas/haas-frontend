import re

path_dash = "src/app/portal-aluno/DashboardDesktop.tsx"

with open(path_dash, "r", encoding="utf-8") as f:
    c = f.read()

# 1. Remove qualquer barra invertida antes de aspas em todo o arquivo
c = re.sub(r'\\"', '"', c)

# 2. Corrige especificamente as linhas dos useState caso estejam corrompidas
c = c.replace('useState<string>("");', 'useState<string>("");')

with open(path_dash, "w", encoding="utf-8") as f:
    f.write(c)

print("✅ Arquivo DashboardDesktop.tsx limpo com sucesso!")
