import re

# 1. Corrige MioloCacaErro.tsx
path_caca = "src/app/portal-aluno/components/exercise-types/MioloCacaErro.tsx"
with open(path_caca, "r", encoding="utf-8") as f:
    c = f.read()

c = c.replace(
    '((typeof window !== "undefined" && (window as any).__dadosBanco?.current_unit_id) || unidadeId || "")',
    '((typeof window !== "undefined" && (window as any).__dadosBanco?.current_unit_id) || (typeof unidadeAtiva !== "undefined" ? String(unidadeAtiva) : ""))'
)
c = c.replace(
    "((typeof window !== 'undefined' && (window as any).__dadosBanco?.current_unit_id) || unidadeId || '')",
    "((typeof window !== 'undefined' && (window as any).__dadosBanco?.current_unit_id) || (typeof unidadeAtiva !== 'undefined' ? String(unidadeAtiva) : ''))"
)
with open(path_caca, "w", encoding="utf-8") as f:
    f.write(c)

# 2. Corrige MioloMultiplaEscolha.tsx
path_multi = "src/app/portal-aluno/components/exercise-types/MioloMultiplaEscolha.tsx"
with open(path_multi, "r", encoding="utf-8") as f:
    c = f.read()

c = re.sub(r'\|\|\s*unidadeId\s*\|\|', '|| (typeof unidadeAtiva !== "undefined" ? String(unidadeAtiva) : "") ||', c)
with open(path_multi, "w", encoding="utf-8") as f:
    f.write(c)

# 3. Corrige MioloReordenacaoParagrafos.tsx
path_reord = "src/app/portal-aluno/components/exercise-types/MioloReordenacaoParagrafos.tsx"
with open(path_reord, "r", encoding="utf-8") as f:
    c = f.read()

c = re.sub(r'\|\|\s*unidadeId\s*\|\|', '|| (typeof unidadeAtiva !== "undefined" ? String(unidadeAtiva) : "") ||', c)
with open(path_reord, "w", encoding="utf-8") as f:
    f.write(c)

print("✅ Tipagem dos miolos corrigida com sucesso!")
