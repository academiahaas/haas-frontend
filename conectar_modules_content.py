import re

# 1. Adiciona a função de buscar título do módulo na centralService.ts
path_central = "src/services/centralService.ts"
with open(path_central, "r", encoding="utf-8") as f:
    c_cent = f.read()

if "buscarInfoModuloContent" not in c_cent:
    funcao_modulo = """
export async function buscarInfoModuloContent(levelTag: string, moduleNumber: number | string) {
  try {
    const num = intVal(moduleNumber) || 1;
    const { data, error } = await supabase
      .from("modules_content")
      .select("module_title, pedagogical_objective, thematic_content")
      .eq("level_tag", levelTag)
      .eq("module_number", num)
      .maybeSingle();

    if (error) {
      console.error("Erro na busca de modules_content:", error);
      return null;
    }
    return data;
  } catch (e) {
    console.error("Exceção ao buscar modules_content:", e);
    return null;
  }
}
"""
    # Função auxiliar intVal para conversão segura
    if "function intVal" not in c_cent:
        funcao_modulo = "\nfunction intVal(v: any): number { const n = parseInt(v, 10); return isNaN(n) ? 0 : n; }\n" + funcao_modulo

    c_cent += "\n" + funcao_modulo
    with open(path_central, "w", encoding="utf-8") as f:
        f.write(c_cent)
    print("✅ centralService.ts atualizada com buscarInfoModuloContent!")

# 2. Conecta no DashboardDesktop.tsx
path_dash = "src/app/portal-aluno/DashboardDesktop.tsx"
with open(path_dash, "r", encoding="utf-8") as f:
    c_dash = f.read()

# Garante importação da nova função
if "buscarInfoModuloContent" not in c_dash:
    c_dash = c_dash.replace("buscarProgressoAlunoCentral", "buscarProgressoAlunoCentral, buscarInfoModuloContent")

# Atualiza o hook para carregar o nome do módulo a partir de modules_content
trecho_antigo = """if (dados.modulo_atual) setModuloDinamico(String(dados.modulo_atual).padStart(2, '0'));
          if (dados.nivel_atual || dados.current_level) setNivelDinamico(String(dados.nivel_atual || dados.current_level));"""

trecho_novo = """const lvl = String(dados.nivel_atual || dados.current_level || 'A1');
          const modNum = dados.modulo_atual || 1;
          setModuloDinamico(String(modNum).padStart(2, '0'));
          setNivelDinamico(lvl);

          // Busca o título oficial na tabela modules_content
          const infoModulo = await buscarInfoModuloContent(lvl, modNum);
          if (infoModulo && infoModulo.module_title) {
            setNomeModulo(infoModulo.module_title);
          } else {
            setNomeModulo("Módulo " + String(modNum).padStart(2, '0'));
          }"""

if "buscarInfoModuloContent" not in c_dash or trecho_antigo in c_dash:
    c_dash = c_dash.replace(trecho_antigo, trecho_novo)

with open(path_dash, "w", encoding="utf-8") as f:
    f.write(c_dash)

print("✅ DashboardDesktop.tsx conectado à tabela modules_content!")
