import re

path_dash = "src/app/portal-aluno/DashboardDesktop.tsx"

with open(path_dash, "r", encoding="utf-8") as f:
    c = f.read()

# 1. Corrige chamadas acidentais com vírgula no await
c = c.replace(
    "await buscarProgressoAlunoCentral, buscarInfoModuloContent(uid);",
    "await buscarProgressoAlunoCentral(uid);"
)

# 2. Assegura importação limpa no topo
c = re.sub(
    r'import\s+\{([^}]+)\}\s+from\s+["\']\.\./\.\./services/centralService["\'];',
    'import { buscarProgressoAlunoCentral, buscarInfoModuloContent } from "../../services/centralService";',
    c
)

# 3. Reescreve a função de carregamento para ser 100% segura e limpa
funcao_correta = """
  useEffect(() => {
    async function carregarDadosCentral() {
      try {
        const uid = (typeof window !== "undefined" && (window as any).activeUserId) || "b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1";
        const dados = await buscarProgressoAlunoCentral(uid);
        if (dados) {
          const lvl = String(dados.current_level || 'A1');
          const modNum = dados.modulo_atual || 1;
          
          setModuloDinamico(String(modNum).padStart(2, '0'));
          setNivelDinamico(lvl);

          // Busca título oficial em modules_content
          const infoModulo = await buscarInfoModuloContent(lvl, modNum);
          if (infoModulo && infoModulo.module_title) {
            setNomeModulo(infoModulo.module_title);
          } else {
            setNomeModulo("Módulo " + String(modNum).padStart(2, '0'));
          }
        }
      } catch (e) {
        console.error("Erro ao carregar dados da central:", e);
      }
    }
    carregarDadosCentral();
  }, []);
"""

# Substitui o bloco antigo de carregamento pelo correto
c = re.sub(
    r'useEffect\(\(\) => \{\s*async function carregarModulo.*?\}, \[\]\);',
    funcao_correta.strip(),
    c,
    flags=re.DOTALL
)

with open(path_dash, "w", encoding="utf-8") as f:
    f.write(c)

print("✅ DashboardDesktop.tsx limpo e reconstruído com sucesso!")
