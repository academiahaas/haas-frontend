import os

filepath = "src/app/portal-aluno/page.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Injetar o Import do ArenaQuiz se não existir
if "import ArenaQuiz" not in content:
    # Coloca o import logo abaixo do primeiro import de React
    content = content.replace(
        "import React",
        "import React, { useState }", # Garante que temos o useState disponível
        1
    ).replace(
        "import React,",
        "import React,",
        1
    )
    
    # Adiciona o import da Arena antes do componente principal
    content = content.replace(
        "export default function",
        "import ArenaQuiz from './components/ArenaQuiz';\n\nexport default function",
        1
    )

# 2. Injetar o estado de controle dentro do Componente Principal (logo após a declaração da função)
state_code = "\n  const [isArenaOpen, setIsArenaOpen] = useState(false);\n"
if "isArenaOpen" not in content:
    # Injeta logo após a abertura da função do componente
    content = content.replace(
        "export default function PortalAluno() {",
        "export default function PortalAluno() {" + state_code,
        1
    )

# 3. Adicionar o gatilho onClick no botão da linha 253
# Vamos procurar a linha do botão baseada no mapeamento do grep
old_button_trigger = 'idioma === "PT" ? "TREINAR/ REATIVAR AGORA"'
new_button_trigger = 'onClick={() => setIsArenaOpen(true)} className="w-full text-center py-4 bg-[#FF6D00] text-black font-black uppercase rounded-xl hover:bg-[#E65C00] transition duration-150 cursor-pointer shadow-[0_4px_25px_rgba(255,109,0,0.25)] active:scale-[0.99]" style={{ display: "block" }}'

# Ajustando para injetar o onClick de forma limpa mantendo o texto internacionalizado
content = content.replace(
    'TREINAR/ REATIVAR AGORA" : idioma=== "ES" ? "ENTRENAR / REACTIVAR AHORA" : "TRAIN / REACTIVATE NOW"',
    'TREINAR/ REATIVAR AGORA" : idioma=== "ES" ? "ENTRENAR / REACTIVAR AHORA" : "TRAIN / REACTIVATE NOW"'
)

# Para garantir a substituição exata do botão, vamos envelopar o botão atual com o gatilho.
# Como o botão atual já usa uma div/button laranja, vamos capturar o bloco e aplicar o onClick:
if "setIsArenaOpen(true)" not in content:
    content = content.replace(
        'TREINAR/ REATIVAR AGORA" : idioma=== "ES" ? "ENTRENAR / REACTIVAR AHORA" : "TRAIN / REACTIVATE NOW"}',
        'TREINAR/ REATIVAR AGORA" : idioma=== "ES" ? "ENTRENAR / REACTIVAR AHORA" : "TRAIN / REACTIVATE NOW"}\n          </button>\n          <ArenaQuiz isOpen={isArenaOpen} onClose={() => setIsArenaOpen(false)} userId="user_demo_123" />\n          <button className="hidden"'
    )
    # Adiciona o onClick no botão que envolve o texto
    content = content.replace(
        '<button\n            className="w-full bg-[#FF6D00]',
        '<button onClick={() => setIsArenaOpen(true)} className="w-full bg-[#FF6D00]'
    )
    # Fallback genérico caso a classe seja ligeiramente diferente
    content = content.replace(
        'TREINAR/ REATIVAR AGORA"',
        'TREINAR/ REATIVAR AGORA" onClick={() => setIsArenaOpen(true)}'
    )

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Patch aplicado com sucesso!")
