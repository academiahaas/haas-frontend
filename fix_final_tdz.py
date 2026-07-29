import os
import re

pasta = "src/app/portal-aluno/components/exercise-types"
for file in os.listdir(pasta):
    if not file.endswith(".tsx"): continue
    path = os.path.join(pasta, file)
    
    with open(path, "r", encoding="utf-8") as f:
        c = f.read()
        
    # 1. Remove qualquer bloco if (!unitParaBusca) inserido anteriormente
    c = re.sub(r'if \(!unitParaBusca\) \{\s*console\.warn\([^}]+\s*setTimeout[^}]+\s*return;\s*\}', '', c)
    
    # 2. Remove declarações duplicadas vazias que causaram o erro
    c = re.sub(r'const unitParaBusca = \(typeof window !== "undefined" \? \(window as any\)\.__dadosBanco\?\.current_unit_id : null\);', '', c)
    
    # 3. Adiciona uma trava segura 100% independente que não interfere nas outras variáveis
    safe_check = """
          const _uuidCheck = (typeof window !== "undefined" && (window as any).__dadosBanco?.current_unit_id) ? (window as any).__dadosBanco.current_unit_id : null;
          if (!_uuidCheck || String(_uuidCheck).length < 20) {
              console.warn("⏳ [HAAS MOTOR] Aguardando UUID real para carregar a prova do banco...");
              setTimeout(() => { if (typeof window !== "undefined") window.dispatchEvent(new Event("retry_uuid")); }, 400);
              return;
          }"""
          
    if "const _uuidCheck =" not in c:
        c = c.replace('setCarregando(true);', 'setCarregando(true);' + safe_check)

    with open(path, "w", encoding="utf-8") as f:
        f.write(c)

print("✅ Conflito resolvido! A trava agora é totalmente independente em todos os miolos.")
