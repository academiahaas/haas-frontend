import os

filepath = "src/app/portal-aluno/page.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Substitui a linha do botão adicionando o evento onClick original do estado
target_button = '<button className="w-full bg-orange-500 hover:bg-orange-600 text-black font-black py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-md transition-all">'
click_button = '<button onClick={() => setIsArenaOpen(true)} className="w-full bg-orange-500 hover:bg-orange-600 text-black font-black py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-md transition-all">'

if target_button in content:
    content = content.replace(target_button, click_button)
    print("Gatilho onClick injetado no botão de Missão!")
else:
    print("ERRO: Tag do botão não encontrada. Verifique espaços.")

# 2. Injeta o componente ArenaQuiz exatamente antes do fechamento da árvore do componente (última div)
# Vamos buscar o fechamento do arquivo: \n    </div>\n  );\n}
target_footer = "    </div>\n  );\n}"
new_footer = "      <ArenaQuiz isOpen={isArenaOpen} onClose={() => setIsArenaOpen(false)} userId=\"user_demo_123\" />\n    </div>\n  );\n}"

if target_footer in content:
    content = content.replace(target_footer, new_footer)
    print("Componente ArenaQuiz acoplado ao fim do arquivo!")
else:
    print("ERRO: Fechamento do arquivo não identificado.")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Processo concluído.")
