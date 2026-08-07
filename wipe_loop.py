import os
import re

pasta = "src/app/portal-aluno/components/exercise-types"
for file in os.listdir(pasta):
    if not file.endswith(".tsx"): continue
    path = os.path.join(pasta, file)
    
    with open(path, "r", encoding="utf-8") as f:
        c = f.read()
        
    # Extermina o bloco de validação do UUID (usando DOTALL para ignorar quebras de linha)
    c = re.sub(r'const _uuidCheck.*?return;\s*\}', '', c, flags=re.DOTALL)
    
    # Extermina o Hook que força a tela a piscar
    c = re.sub(r'const \[, _setForceUpdate\].*?\}, \[\]\);', '', c, flags=re.DOTALL)
    
    # Limpeza extra caso tenha sobrado algum setTimeout solto
    c = re.sub(r'console\.warn\("⏳ \[HAAS MOTOR\] Aguardando UUID[^;]+;', '', c)
    c = re.sub(r'setTimeout\(\(\) => \{ if \(typeof window !== "undefined"\) window\.dispatchEvent\(new Event\("retry_uuid"\)\); \}, 400\);', '', c)
    
    with open(path, "w", encoding="utf-8") as f:
        f.write(c)

print("✅ MODO FORÇA BRUTA: Loop Infinito erradicado com sucesso!")
