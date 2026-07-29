import os
import re

# 1. BLINDA A ARENA QUIZ CONTRA REQUISIÇÕES VAZIAS (Elimina Erro 400)
arena = "src/app/portal-aluno/components/ArenaQuiz.tsx"
with open(arena, "r", encoding="utf-8") as f:
    ca = f.read()

ca = re.sub(
    r'const targetUnitId = [^\n]+',
    'const targetUnitId = (typeof window !== "undefined" && (window as any).__dadosBanco?.current_unit_id) || "";\n        if (!targetUnitId || targetUnitId.length < 20) return;',
    ca
)
with open(arena, "w", encoding="utf-8") as f:
    f.write(ca)

# 2. INJETA ESPERA REATIVA EM TODOS OS 13 MIOLOS DE EXERCÍCIOS
pasta = "src/app/portal-aluno/components/exercise-types"
for file in os.listdir(pasta):
    if not file.endswith(".tsx"): continue
    path = os.path.join(pasta, file)
    
    with open(path, "r", encoding="utf-8") as f:
        cm = f.read()
        
    # Limpa as atribuições que pegavam o '0' como ID
    cm = re.sub(
        r'let unitParaBusca = [^;]+;',
        'let unitParaBusca = (typeof window !== "undefined" ? (window as any).__dadosBanco?.current_unit_id : null);\n          if (!unitParaBusca || unitParaBusca.length < 20) unitParaBusca = null;',
        cm
    )
    
    # Injeta a lógica de esperar a UUID real sem quebrar a tela
    retry_logic = """
          if (!unitParaBusca) {
              console.warn("⏳ [HAAS MOTOR] Aguardando UUID real para carregar a prova do banco...");
              setTimeout(() => { if (typeof window !== "undefined") window.dispatchEvent(new Event("retry_uuid")); }, 400);
              return;
          }"""
    
    if "Aguardando UUID real" not in cm:
        cm = cm.replace('setCarregando(true);', 'setCarregando(true);\n' + retry_logic)
        
    # Força a tela a re-renderizar instantaneamente assim que a UUID chegar
    if "retry_uuid" not in cm.split("useEffect")[0]:
        hook = """
  const [, _setForceUpdate] = useState(0);
  useEffect(() => {
    const handle = () => _setForceUpdate(x => x + 1);
    if (typeof window !== "undefined") window.addEventListener("retry_uuid", handle);
    return () => { if (typeof window !== "undefined") window.removeEventListener("retry_uuid", handle); };
  }, []);
"""
        cm = re.sub(r'(export default function [^)]+\)\s*\{)', r'\1\n' + hook, cm)

    with open(path, "w", encoding="utf-8") as f:
        f.write(cm)

print("✅ Trava de segurança ativada: O jogo agora OBRIGA o uso do UUID oficial do banco!")
