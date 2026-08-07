import re

path_dash = "src/app/portal-aluno/DashboardDesktop.tsx"

with open(path_dash, "r", encoding="utf-8") as f:
    c = f.read()

# 1. Garante a importação do buscarProgressoAlunoCentral
if "buscarProgressoAlunoCentral" not in c:
    c = "import { buscarProgressoAlunoCentral } from \"../../services/centralService\";\n" + c

# 2. Injeta os estados no inicio da função do componente
if "moduloUserCentral" not in c:
    c = re.sub(
        r"(export default function DashboardDesktop[^{]*\{)",
        r"\1\n  const [moduloUserCentral, setModuloUserCentral] = useState('');\n  const [nivelUserCentral, setNivelUserCentral] = useState('');",
        c
    )

# 3. Injeta a busca do banco de dados na Central Service
if "carregarModuloNivelUser" not in c:
    hook = """
  useEffect(() => {
    async function carregarModuloNivelUser() {
      try {
        const uid = (typeof window !== "undefined" && (window as any).activeUserId) || "b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1";
        const dados = await buscarProgressoAlunoCentral(uid);
        if (dados) {
          if (dados.modulo_atual) setModuloUserCentral(String(dados.modulo_atual).padStart(2, '0'));
          if (dados.nivel_atual || dados.current_level) setNivelUserCentral(String(dados.nivel_atual || dados.current_level));
        }
      } catch (e) {}
    }
    carregarModuloNivelUser();
  }, []);
"""
    c = re.sub(r"(return\s*\(|\n\s*return\s*<)", hook + "\n  return (", c, count=1)

# 4. Substituição CIRÚRGICA nas linhas 720 e 723 (substitui o listaUnidades[0] pelo valor do banco)
c = c.replace(
    "String(listaUnidades[0]?.module_number || 1).padStart(2, '0')",
    "moduloUserCentral || String(listaUnidades[0]?.module_number || 1).padStart(2, '0')"
)

c = c.replace(
    "listaUnidades[0]?.level || 'A1'",
    "nivelUserCentral || listaUnidades[0]?.level || 'A1'"
)

with open(path_dash, "w", encoding="utf-8") as f:
    f.write(c)

print("✅ Linhas 720 e 723 conectadas à Central Service!")
