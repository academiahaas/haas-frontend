path = "src/app/portal-aluno/components/exercise-types/DitadoLacunas.tsx"
with open(path, "r", encoding="utf-8") as f:
    c = f.read()

c = c.replace('if (!unitParaBusca)', 'const unitParaBusca = (typeof window !== "undefined" ? (window as any).__dadosBanco?.current_unit_id : null);\n           if (!unitParaBusca)')

with open(path, "w", encoding="utf-8") as f:
    f.write(c)

print("✅ Ajustado DitadoLacunas.tsx!")
