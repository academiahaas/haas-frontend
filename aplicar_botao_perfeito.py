import re;
caminho = "src/app/portal-aluno/page.tsx"
with open(caminho, "r", encoding="utf-8") as f:
    conteudo = f.read()
logica_cronometro = """
  // LOGICA DO CROpOMETRO