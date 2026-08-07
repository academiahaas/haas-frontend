import os

filepath = "src/app/portal-aluno/page.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Corrige estritamente a linha 7 corrompida
old_line = "import React, { useState }, { useState, useEffect } from 'react';"
new_line = "import React, { useState, useEffect } from 'react';\nimport ArenaQuiz from './components/ArenaQuiz';"

if old_line in content:
    content = content.replace(old_line, new_line)
    print("Linha de import corrigida!")
else:
    # Caso o script anterior já tenha alterado levemente, força a higienização do topo
    if "import ArenaQuiz" not in content:
        content = content.replace(
            "import React from 'react';",
            "import React, { useState, useEffect } from 'react';\nimport ArenaQuiz from './components/ArenaQuiz';"
        )

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Processo concluído com sucesso!")
