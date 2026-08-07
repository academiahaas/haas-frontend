import os

filepath = "src/app/portal-aluno/page.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    lines = f.readlines()

# Filtra o arquivo removendo a linha secundária exata de import do ArenaQuiz
new_lines = []
found_first = False

for line in lines:
    if "import ArenaQuiz from './components/ArenaQuiz';" in line:
        if not found_first:
            new_lines.append(line)
            found_first = True
        else:
            # Pula a segunda ocorrência para eliminar a duplicação
            continue
    else:
        new_lines.append(line)

with open(filepath, "w", encoding="utf-8") as f:
    f.writelines(new_lines)

print("Duplicação eliminada com sucesso!")
