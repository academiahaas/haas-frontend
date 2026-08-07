import re

path_dash = "src/app/portal-aluno/DashboardDesktop.tsx"

with open(path_dash, "r", encoding="utf-8") as f:
    c = f.read()

# 1. Corrige qualquer chamada de função corrompida pela substituição anterior
c = c.replace("buscarInfoModuloContent, buscarUnidadesModuloCentral(", "buscarInfoModuloContent(")

# 2. Assegura a linha de importação limpa no topo
c = re.sub(
    r'import\s+\{([^}]+)\}\s+from\s+["\']\.\./\.\./services/centralService["\'];',
    'import { buscarProgressoAlunoCentral, buscarInfoModuloContent, buscarUnidadesModuloCentral } from "../../services/centralService";',
    c
)

# 3. Substituição limpa dentro da função do useEffect
busca_antiga = """const infoModulo = await buscarInfoModuloContent(lvl, modNum);
          if (infoModulo && infoModulo.module_title) {
            setNomeModulo(infoModulo.module_title);
          } else {
            setNomeModulo("Módulo " + String(modNum).padStart(2, '0'));
          }"""

busca_nova = """const infoModulo = await buscarInfoModuloContent(lvl, modNum);
          if (infoModulo && infoModulo.module_title) {
            setNomeModulo(infoModulo.module_title);
          } else {
            setNomeModulo("Módulo " + String(modNum).padStart(2, '0'));
          }

          // Carrega as unidades oficiais da tabela units
          try {
            const unidadesBanco = await buscarUnidadesModuloCentral(lvl, modNum);
            if (unidadesBanco && unidadesBanco.length > 0 && typeof setListaUnidades !== 'undefined') {
              setListaUnidades(unidadesBanco);
            }
          } catch (errUnidades) {
            console.error("Erro ao carregar lista de unidades:", errUnidades);
          }"""

if "buscarUnidadesModuloCentral(lvl, modNum)" not in c:
    c = c.replace(busca_antiga, busca_nova)

with open(path_dash, "w", encoding="utf-8") as f:
    f.write(c)

print("✅ DashboardDesktop.tsx corrigido e conectado com segurança!")
