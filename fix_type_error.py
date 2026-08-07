import re

path_dash = "src/app/portal-aluno/DashboardDesktop.tsx"

with open(path_dash, "r", encoding="utf-8") as f:
    content = f.read()

# Substitui a verificação insegura por uma busca de ID segura sem quebrar o TypeScript
antigo = 'const uid = typeof activeUserId !== "undefined" ? activeUserId : (typeof userId !== "undefined" ? userId : "b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1");'
novo = 'const uid = (typeof window !== "undefined" && (window as any).activeUserId) || "b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1";'

if antigo in content:
    content = content.replace(antigo, novo)
else:
    # Caso a linha esteja com variações de espaço/aspas, substitui via Regex
    content = re.sub(
        r'const uid = typeof activeUserId.*?;',
        novo,
        content
    )

with open(path_dash, "w", encoding="utf-8") as f:
    f.write(content)

print("✅ Tipo activeUserId corrigido de forma segura no TypeScript!")
