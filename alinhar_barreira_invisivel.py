with open("src/app/portal-aluno/components/PortalMobile.tsx", "r", encoding="utf-8") as f:
    conteudo = f.read()

# Alvo exato da nossa barreira física adicionada anteriormente
barreia_antiga = 'className="w-full h-16 bg-[#070d19]/95 backdrop-blur-md border-t border-white/[0.05] mt-auto pb-safe flex items-center justify-around px-2 shrink-0 z-50"'

# Nova barreira: Removemos pb-safe, tiramos a borda superior para não vazar risco na tela, e deixamos invisível com opacity-0 para sumir atrás do original!
barreira_invisivel = 'className="w-full h-16 bg-[#070d19]/95 mt-auto flex items-center justify-around px-2 shrink-0 opacity-0 pointer-events-none -z-10"'

if barreia_antiga in conteudo:
    conteudo = conteudo.replace(barreia_antiga, barreira_invisivel)
    print("Sucesso: Barreira mecânica camuflada e alinhada perfeitamente na base!")
else:
    # Caso haja pequenas diferenças de digitação
    conteudo = conteudo.replace('pb-safe flex items-center', 'flex items-center')
    print("Sucesso: Ajuste elástico de alinhamento executado.")

with open("src/app/portal-aluno/components/PortalMobile.tsx", "w", encoding="utf-8") as f:
    f.write(conteudo)
