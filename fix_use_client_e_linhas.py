import re

path_dash = "src/app/portal-aluno/DashboardDesktop.tsx"

with open(path_dash, "r", encoding="utf-8") as f:
    c = f.read()

# 1. Corrige o posicionamento do 'use client' no topo absoluto do arquivo
c = c.replace('import { buscarProgressoAlunoCentral } from "../../services/centralService";\n\'use client\';', '\'use client\';\nimport { buscarProgressoAlunoCentral } from "../../services/centralService";')
c = c.replace('import { buscarProgressoAlunoCentral } from "../../services/centralService";\n"use client";', '"use client";\nimport { buscarProgressoAlunoCentral } from "../../services/centralService";')

# Garante que 'use client' esteja sempre na linha 1
if not c.startswith("'use client'") and not c.startswith('"use client"'):
    c = c.replace("import { buscarProgressoAlunoCentral } from \"../../services/centralService\";", "")
    c = "'use client';\nimport { buscarProgressoAlunoCentral } from \"../../services/centralService\";\n" + c

# 2. Garante os estados de módulo e nível
if "moduloUserCentral" not in c:
    c = re.sub(
        r"(export default function DashboardDesktop[^{]*\{)",
        r"\1\n  const [moduloUserCentral, setModuloUserCentral] = useState('');\n  const [nivelUserCentral, setNivelUserCentral] = useState('');",
        c
    )

# 3. Garante o hook do useEffect
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

# 4. Assegura a troca nas linhas de renderização
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

print("✅ 'use client' corrigido na linha 1 e arquivo conectado com sucesso!")
