import re

path_dash = "src/app/portal-aluno/DashboardDesktop.tsx"

with open(path_dash, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Garante que os estados e o hook existem no topo do arquivo
if "moduloDinamico" not in content:
    content = re.sub(
        r"(export default function DashboardDesktop[^{]*\{)",
        r"\1\n  const [moduloDinamico, setModuloDinamico] = useState('01');\n  const [nivelDinamico, setNivelDinamico] = useState('A1');",
        content
    )

if "carregarModuloNivelCentral" not in content:
    hook_code = """
  useEffect(() => {
    async function carregarModuloNivelCentral() {
      try {
        const uid = typeof activeUserId !== "undefined" ? activeUserId : (typeof userId !== "undefined" ? userId : "b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1");
        const dados = await buscarProgressoAlunoCentral(uid);
        if (dados) {
          if (dados.modulo_atual) setModuloDinamico(String(dados.modulo_atual).padStart(2, '0'));
          if (dados.nivel_atual || dados.current_level) setNivelDinamico(String(dados.nivel_atual || dados.current_level));
        }
      } catch (e) {
        console.error("Erro ao carregar modulo/nivel:", e);
      }
    }
    carregarModuloNivelCentral();
  }, []);
"""
    content = re.sub(r"(return\s*\(|\n\s*return\s*<)", hook_code + "\n  return (", content, count=1)

# 2. Substitui cirurgicamente o trecho do Módulo e Nível no JSX
# Busca padrões como "MÓDULO 01" ou "MÓDULO {..." e substitui dinamicamente
content = re.sub(r"MÓDULO\s+\d+", "MÓDULO {moduloDinamico}", content)
content = re.sub(r"MODULO\s+\d+", "MODULO {moduloDinamico}", content)
content = re.sub(r"NÍVEL\s+[A-C][1-2]", "NÍVEL {nivelDinamico}", content)
content = re.sub(r"NIVEL\s+[A-C][1-2]", "NIVEL {nivelDinamico}", content)

with open(path_dash, "w", encoding="utf-8") as f:
    f.write(content)

print("✅ Módulo e Nível conectados cirurgicamente!")
