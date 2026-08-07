import re

path_dash = "src/app/portal-aluno/DashboardDesktop.tsx"

with open(path_dash, "r", encoding="utf-8") as f:
    c = f.read()

# Substitui o setModuloDinamico pelo setModuloUserCentral e setNivelDinamico pelo setNivelUserCentral
c = c.replace("setModuloDinamico(", "setModuloUserCentral(")
c = c.replace("setNivelDinamico(", "setNivelUserCentral(")

# Garante que os estados moduloUserCentral e nivelUserCentral estejam declarados no topo do componente
if "const [moduloUserCentral" not in c:
    c = re.sub(
        r"(export default function DashboardDesktop[^{]*\{)",
        r"\1\n  const [moduloUserCentral, setModuloUserCentral] = useState('');\n  const [nivelUserCentral, setNivelUserCentral] = useState('');",
        c
    )

with open(path_dash, "w", encoding="utf-8") as f:
    f.write(c)

print("✅ Nomes dos setters ajustados para moduloUserCentral / nivelUserCentral!")
