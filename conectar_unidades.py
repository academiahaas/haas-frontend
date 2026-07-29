import re

# 1. Atualiza a centralService.ts com a busca oficial de unidades
path_central = "src/services/centralService.ts"
with open(path_central, "r", encoding="utf-8") as f:
    c_cent = f.read()

if "buscarUnidadesModuloCentral" not in c_cent:
    funcao_unidades = """
export async function buscarUnidadesModuloCentral(levelTag: string, moduleNumber: number | string) {
  try {
    const num = intVal(moduleNumber) || 1;
    const { data, error } = await supabase
      .from("units")
      .select("id, unit_number, unit_title, estimated_hours, level, module_number")
      .eq("level", levelTag)
      .eq("module_number", num)
      .order("unit_number", { ascending: true });

    if (error) {
      console.error("Erro na busca de units:", error);
      return [];
    }
    return data || [];
  } catch (e) {
    console.error("Exceção ao buscar units:", e);
    return [];
  }
}
"""
    c_cent += "\n" + funcao_unidades
    with open(path_central, "w", encoding="utf-8") as f:
        f.write(c_cent)
    print("✅ centralService.ts atualizada com buscarUnidadesModuloCentral!")

# 2. Conecta a busca de Unidades no DashboardDesktop.tsx
path_dash = "src/app/portal-aluno/DashboardDesktop.tsx"
with open(path_dash, "r", encoding="utf-8") as f:
    c_dash = f.read()

# Garante importação da nova função
if "buscarUnidadesModuloCentral" not in c_dash:
    c_dash = c_dash.replace("buscarInfoModuloContent", "buscarInfoModuloContent, buscarUnidadesModuloCentral")

# Injeta a chamada para carregar as unidades e atualizar a listaUnidades/setListaUnidades
trecho_busca_antigo = """const infoModulo = await buscarInfoModuloContent(lvl, modNum);
          if (infoModulo && infoModulo.module_title) {
            setNomeModulo(infoModulo.module_title);
          } else {
            setNomeModulo("Módulo " + String(modNum).padStart(2, '0'));
          }"""

trecho_busca_novo = """const infoModulo = await buscarInfoModuloContent(lvl, modNum);
          if (infoModulo && infoModulo.module_title) {
            setNomeModulo(infoModulo.module_title);
          } else {
            setNomeModulo("Módulo " + String(modNum).padStart(2, '0'));
          }

          // Busca unidades reais da tabela units
          const unidadesBanco = await buscarUnidadesModuloCentral(lvl, modNum);
          if (unidadesBanco && unidadesBanco.length > 0 && typeof setListaUnidades !== 'undefined') {
            setListaUnidades(unidadesBanco);
          }"""

if "buscarUnidadesModuloCentral" not in c_dash:
    c_dash = c_dash.replace(trecho_busca_antigo, trecho_busca_novo)

with open(path_dash, "w", encoding="utf-8") as f:
    f.write(c_dash)

print("✅ DashboardDesktop.tsx conectado à tabela units!")
