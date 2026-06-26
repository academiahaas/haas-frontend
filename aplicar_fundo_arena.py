import os

filepath = "src/app/portal-aluno/components/ArenaQuiz.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Ajusta o contêiner mestre para usar a imagem de fundo oficial da Haas e isolar o topo (z-[9999])
old_container = 'className="fixed inset-0 z-50 bg-[#060F14]/98 flex flex-col justify-between text-white font-sans overflow-hidden animate-in fade-in zoom-in-95 duration-300"'
new_container = 'className="fixed inset-0 z-[9999] bg-cover bg-center bg-no-repeat flex flex-col justify-between text-white font-sans overflow-hidden animate-in fade-in duration-200" style={{ backgroundImage: "url(\'https://qeiinzggtrzckvcqpygs.supabase.co/storage/v1/object/public/assets/pastas/fundos/Gemini_Generated_Image_9x0pzn9x0pzn9x0p.png\')" }}'

if old_container in content:
    content = content.replace(old_container, new_container)
else:
    # Ajuste via substituição direta caso tenha variações
    content = content.replace('z-50', 'z-[9999]')
    content = content.replace('bg-[#060F14]/98', '')
    content = content.replace('fixed inset-0', 'fixed inset-0 bg-cover bg-center bg-no-repeat style={{ backgroundImage: "url(\'https://qeiinzggtrzckvcqpygs.supabase.co/storage/v1/object/public/assets/pastas/fundos/Gemini_Generated_Image_9x0pzn9x0pzn9x0p.png\')" }}')

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Imagem de fundo e isolamento de tela aplicados com sucesso!")
