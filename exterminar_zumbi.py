import os
import re

pasta = "src/app/portal-aluno/components/exercise-types"
for file in os.listdir(pasta):
    if not file.endswith(".tsx"): continue
    path = os.path.join(pasta, file)
    
    with open(path, "r", encoding="utf-8") as f:
        c = f.read()
        
    # Mata implacavelmente qualquer bloco if (!unitParaBusca) { ... } que tenha sobrado
    c = re.sub(r'if\s*\(\!unitParaBusca\)\s*\{\s*console\.warn\("⏳ \[HAAS MOTOR\] Aguardando UUID[^\}]+\}\s*,\s*400\);\s*return;\s*\}', '', c)
    
    with open(path, "w", encoding="utf-8") as f:
        f.write(c)

print("✅ Blocos fantasmas exterminados!")
