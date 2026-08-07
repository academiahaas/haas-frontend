import os
import re

# 1. Varre todo o diretório src/app/portal-aluno para erradicar o UUID hardcoded
pasta_aluno = "src/app/portal-aluno"
uuid_antigo = "09adf4ff-71ed-4b2b-982e-07c22fcd2cf0"

arquivos_modificados = []

for root, dirs, files in os.walk(pasta_aluno):
    for file in files:
        if file.endswith(".tsx") or file.endswith(".ts"):
            filepath = os.path.join(root, file)
            with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                conteudo = f.read()
            
            if uuid_antigo in conteudo:
                # Substitui a referencia ao UUID fixo pela variavel/prop dinamica da unidade
                novo_conteudo = conteudo.replace(
                    f'"{uuid_antigo}"', 
                    '((typeof window !== "undefined" && (window as any).__dadosBanco?.current_unit_id) || unidadeId || "")'
                )
                novo_conteudo = novo_conteudo.replace(
                    f"'{uuid_antigo}'", 
                    "((typeof window !== 'undefined' && (window as any).__dadosBanco?.current_unit_id) || unidadeId || '')"
                )
                
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(novo_conteudo)
                arquivos_modificados.append(filepath)

print(f"✅ Faxina de UUIDs concluída! Arquivos descorrompidos: {len(arquivos_modificados)}")
for a in arquivos_modificados:
    print(f"  - {a}")

# 2. Revisa e padroniza a passagem de props para os subcomponentes no ArenaQuiz.tsx
arena_path = "src/app/portal-aluno/components/ArenaQuiz.tsx"
if os.path.exists(arena_path):
    with open(arena_path, "r", encoding="utf-8") as f:
        c_arena = f.read()
    
    # Injeta no contexto global a unidade ativa dinamicamente
    injecao_window = """if (progresso && progresso.current_unit_id) {
              if (typeof window !== 'undefined') (window as any).__dadosBanco = { ...(window as any).__dadosBanco, current_unit_id: progresso.current_unit_id };
            }"""
    
    if "__dadosBanco" not in c_arena:
        c_arena = c_arena.replace("setUnidadesConcluidas(", injecao_window + "\n            setUnidadesConcluidas(")
        with open(arena_path, "w", encoding="utf-8") as f:
            f.write(c_arena)
        print("✅ ArenaQuiz atualizado para expor o current_unit_id globalmente aos miolos!")

