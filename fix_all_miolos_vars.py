import os

pasta = "src/app/portal-aluno/components/exercise-types"
for file in os.listdir(pasta):
    if not file.endswith(".tsx"): continue
    path = os.path.join(pasta, file)
    
    with open(path, "r", encoding="utf-8") as f:
        c = f.read()
        
    if "if (!unitParaBusca)" in c and "const unitParaBusca =" not in c and "let unitParaBusca =" not in c:
        c = c.replace(
            "if (!unitParaBusca)", 
            "const unitParaBusca = (typeof window !== \"undefined\" ? (window as any).__dadosBanco?.current_unit_id : null);\n          if (!unitParaBusca)"
        )
        with open(path, "w", encoding="utf-8") as f:
            f.write(c)
        print(f"✅ Ajustado: {file}")

print("✅ Varredura concluída!")
