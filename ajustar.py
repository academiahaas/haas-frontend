import os, re

# 1. Atualizar a Central Service com as novas colunas
path_central = "src/services/centralService.ts"
if os.path.exists(path_central):
    with open(path_central, "r", encoding="utf-8") as f:
        c_cent = f.read()
    c_cent = c_cent.replace(
        "select=exercicios_concluidos,meta_exercicios,total_unidades_modulo,current_unit_id",
        "select=exercicios_concluidos,meta_exercicios,total_unidades_modulo,current_unit_id,modulo_atual,nivel_atual,current_level"
    )
    with open(path_central, "w", encoding="utf-8") as f:
        f.write(c_cent)
    print("✅ centralService.ts configurado!")

# 2. Restaurar e conectar o DashboardDesktop.tsx
path_dash = "src/app/portal-aluno/DashboardDesktop.tsx"
if os.path.exists(path_dash):
    with open(path_dash, "r", encoding="utf-8") as f:
        c_dash = f.read()

    # Limpeza de escapes antigos
    c_dash = c_dash.replace('\"\"', '""').replace('\"', '"')

    # Injeta a busca do centralService se ainda nao existir
    if "buscarProgressoAlunoCentral" not in c_dash:
        c_dash = "import { buscarProgressoAlunoCentral } from \"../../services/centralService\";\n" + c_dash

    # Injeta os estados
    if "moduloDinamico" not in c_dash:
        c_dash = re.sub(
            r"(export default function DashboardDesktop[^{]*\{)",
            r"\1\n  const [moduloDinamico, setModuloDinamico] = useState<string>('');\n  const [nivelDinamico, setNivelDinamico] = useState<string>('');",
            c_dash
        )

    # Injeta o efeito
    if "carregarDadosCentral" not in c_dash:
        hook = """
  useEffect(() => {
    async function carregarDadosCentral() {
      try {
        const dados = await buscarProgressoAlunoCentral("b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1");
        if (dados) {
          if (dados.modulo_atual) setModuloDinamico(String(dados.modulo_atual));
          if (dados.nivel_atual || dados.current_level) setNivelDinamico(String(dados.nivel_atual || dados.current_level));
        }
      } catch (e) {}
    }
    carregarDadosCentral();
  }, []);
"""
        c_dash = re.sub(r"(return\s*\(|\n\s*return\s*<)", hook + "\n  return (", c_dash, count=1)

    # Troca o texto estático pelos estados dinâmicos
    c_dash = re.sub(r"MÓDULO\s+\d+", "MÓDULO {moduloDinamico || '01'}", c_dash)
    c_dash = re.sub(r"NÍVEL\s+[A-C][1-2]", "NÍVEL {nivelDinamico || 'A1'}", c_dash)

    with open(path_dash, "w", encoding="utf-8") as f:
        f.write(c_dash)
    print("✅ DashboardDesktop.tsx corrigido com sucesso!")
