with open("src/app/portal-aluno/page.tsx", "r", encoding="utf-8") as f:
    conteudo = f.read()

# 1. Corrigimos o dicionário ES adicionando as traduções que faltavam para a Lupa ler nativamente
dicionario_es_antigo = "trilhaCompetencias: 'RUTA DE COMPETENCIAS',"
dicionario_es_novo = "trilhaCompetencias: 'RUTA DE COMPETENCIAS', dominioAtual: 'Dominio actual', ultimoTreino: 'Último entrenamiento: --. Vértice: --%',"

if dicionario_es_antigo in conteudo:
    conteudo = conteudo.replace(dicionario_es_antigo, dicionario_es_novo)
    print("Dicionário ES atualizado com sucesso!")
else:
    # Busca alternativa caso o texto de RUTA DE COMPETENCIAS esteja ligeiramente diferente
    import re
    conteudo = re.sub(
        r"trilhaCompetencias:\s*['\"]RUTA DE COMPETENCIAS['\"],?",
        "trilhaCompetencias: 'RUTA DE COMPETENCIAS', dominioAtual: 'Dominio actual', ultimoTreino: 'Último entrenamiento: --. Vértice: --%',",
        conteudo
    )
    print("Dicionário ES atualizado via padrão flexível!")

# 2. Por garantia absoluta, vamos fazer a Lupa usar as variáveis oficiais {t.dominioAtual} e {t.ultimoTreino}
# se houver algum span fixo sobrando que criamos nos testes anteriores.
conteudo = re.sub(
    r'<span>\s*⚠️\s*Current mastery[\s\S]*?<\/span>',
    '<span>⚠️ {t.dominioAtual}: --% • {t.ultimoTreino}</span>',
    conteudo
)
conteudo = re.sub(
    r'<span>\s*\{textoDominio\}\s*<\/span>',
    '<span>⚠️ {t.dominioAtual}: --% • {t.ultimoTreino}</span>',
    conteudo
)

with open("src/app/portal-aluno/page.tsx", "w", encoding="utf-8") as f:
    f.write(conteudo)

print("Sincronização completa aplicada!")
