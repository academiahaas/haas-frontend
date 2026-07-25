path = "src/app/portal-aluno/components/PortalMobile.tsx"

with open(path, "r", encoding="utf-8") as f:
    lines = f.readlines()

novo_conteudo = []
substituido = False

for line in lines:
    novo_conteudo.append(line)
    if "{/* CRITÉRIO DE TRAVA DINÂMICA FINANCEIRA NO BOTÃO AVANÇAR */}" in line and not substituido:
        # Substitui o bloco da trava
        pass

