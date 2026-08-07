import os

path = "./haas-frontend/src/app/portal-aluno/components/PortalMobile.tsx"
if not os.path.exists(path):
    print("❌ Arquivo PortalMobile.tsx não encontrado no caminho esperado!")
    exit()

content = open(path, "r", encoding="utf-8").read()

# Faz uma cópia de segurança antes de tocar no código
open(path + ".bak_final", "w", encoding="utf-8").write(content)

# Substituições cirúrgicas usando os padrões reais que o seu grep mostrou:
# 1. Ajusta o Grid central de 2 colunas para desgrudar das bordas laterais
modified = content.replace('className="grid grid-cols-2 gap-2"', 'className="grid grid-cols-2 gap-2 px-4"')

# 2. Se o container pai de toda a renderização do Perfil for p-4 ou space-y, adicionamos o recuo nativo nele
modified = modified.replace('className="p-4 space-y-4"', 'className="p-4 space-y-4 px-4"')
modified = modified.replace('className="space-y-4"', 'className="space-y-4 px-4"')
modified = modified.replace('className="space-y-6"', 'className="space-y-6 px-4"')

if modified != content:
    open(path, "w", encoding="utf-8").write(modified)
    print("✅ SUCESSO ABSOLUTO! O padding lateral (px-4) foi aplicado nativamente.")
else:
    # Se ainda assim não mudar, envelopamos o bloco de stats injetando um container com padding
    if "/* 2. BLOCO CENTRAL: STATS" in content:
        forced = content.replace(
            '{/* 2. BLOCO CENTRAL: STATS (XP, HORAS, DIAS, SEQUÊNCIA) */}',
            '{/* 2. BLOCO CENTRAL: STATS */}\n<div className="px-4 flex flex-col gap-4 w-full">'
        )
        # Vamos fechar a div após o bloco injetado para forçar o layout ideal
        forced = forced.replace(
            '{/* 3. INSÍGNIAS E CONQUISTAS */}',
            '</div>\n{/* 3. INSÍGNIAS E CONQUISTAS */}\n<div className="px-4 w-full">'
        )
        open(path, "w", encoding="utf-8").write(forced)
        print("✅ CORREÇÃO FORÇADA APLICADA! O conteúdo do perfil agora está envelopado com margens nativas.")
    else:
        print("⚠️ Os padrões não bateram perfeitamente, mas o arquivo está intacto.")

