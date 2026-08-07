import re

path_dash = "src/app/portal-aluno/DashboardDesktop.tsx"

with open(path_dash, "r", encoding="utf-8") as f:
    c = f.read()

# 1. Limpa todas as declaracoes e useEffects incompletos injetados anteriormente fora de escopo
c = re.sub(r'const \[moduloUserCentral, setModuloUserCentral\].*?\n', '', c)
c = re.sub(r'const \[nivelUserCentral, setNivelUserCentral\].*?\n', '', c)
c = re.sub(r'useEffect\(\(\) => \{\s*async function carregarModuloNivelUser\(\).*?\n  \}, \[\]\);', '', c, flags=re.DOTALL)

# 2. Assegura 'use client' na linha 1
c = c.replace('"use client";', "'use client';")
if not c.startswith("'use client';"):
    c = c.replace("'use client';", "")
    c = "'use client';\n" + c

# 3. Garante o import da centralService no topo
if "buscarProgressoAlunoCentral" not in c:
    c = c.replace("'use client';", "'use client';\nimport { buscarProgressoAlunoCentral } from \"../../services/centralService\";")

# 4. Injeta os estados e o useEffect DENTRO da funcao do componente (logo apos a abertura do bloco)
bloco_escopo_correto = """
  const [moduloUserCentral, setModuloUserCentral] = useState('');
  const [nivelUserCentral, setNivelUserCentral] = useState('');

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

# Procura a abertura do export default function e injeta o bloco no escopo local correto
c = re.sub(
    r"(export default function DashboardDesktop[^{]*\{)",
    r"\1\n" + bloco_escopo_correto,
    c
)

with open(path_dash, "w", encoding="utf-8") as f:
    f.write(c)

print("✅ Estados e Hooks reposicionados dentro do escopo do componente!")
