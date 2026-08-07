import re

path_dash = "src/app/portal-aluno/DashboardDesktop.tsx"

with open(path_dash, "r", encoding="utf-8") as f:
    c = f.read()

# 1. Remove qualquer declaracao antiga do hook/estados que ficou fora de lugar
c = re.sub(r'const \[moduloDinamico, setModuloDinamico\].*?\n', '', c)
c = re.sub(r'const \[nivelDinamico, setNivelDinamico\].*?\n', '', c)
c = re.sub(r'useEffect\(\(\) => \{\s*async function carregarModuloNivelCentral\(\).*?\n  \}, \[\]\);', '', c, flags=re.DOTALL)

# 2. Injeta OS ESTADOS E O EFFECT no topo absoluto da funcao do componente
bloco_correto = """
  const [moduloDinamico, setModuloDinamico] = useState<string>('01');
  const [nivelDinamico, setNivelDinamico] = useState<string>('A1');

  useEffect(() => {
    async function carregarModuloNivelCentral() {
      try {
        const uid = (typeof window !== "undefined" && (window as any).activeUserId) || "b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1";
        const dados = await buscarProgressoAlunoCentral(uid);
        if (dados) {
          if (dados.modulo_atual) setModuloDinamico(String(dados.modulo_atual).padStart(2, '0'));
          if (dados.nivel_atual || dados.current_level) setNivelDinamico(String(dados.nivel_atual || dados.current_level));
        }
      } catch (e) {
        console.error("Erro ao carregar dados central:", e);
      }
    }
    carregarModuloNivelCentral();
  }, []);
"""

# Procura o inicio exato do export default function e injeta no escopo correto
c = re.sub(
    r"(export default function DashboardDesktop[^{]*\{)",
    r"\1\n" + bloco_correto,
    c
)

with open(path_dash, "w", encoding="utf-8") as f:
    f.write(c)

print("✅ Estados e hooks reposicionados no escopo correto!")
