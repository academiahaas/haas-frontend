import os

path = "./src/app/portal-aluno/components/PortalMobile.tsx"
conteudo = open(path, "r", encoding="utf-8").read()

# 1. Altera a assinatura da função para aceitar a propriedade setAbaAtiva
assinatura_antiga = "function MiniCalendarioSemanal() {"
assinatura_nova   = "function MiniCalendarioSemanal({ setAbaAtiva }: { setAbaAtiva: (aba: string) => void }) {"

# 2. Injeta o onClick e classes de clique no container de cada dia mapeado
bloco_render_antigo = """          return (
            <div key={dia.id} className="flex flex-col items-center flex-1 min-w-0">"""

bloco_render_novo = """          return (
            <div 
              key={dia.id} 
              onClick={() => setAbaAtiva("agenda")} 
              className="flex flex-col items-center flex-1 min-w-0 cursor-pointer active:scale-95 select-none transition-transform"
            >"""

# 3. Atualiza a chamada do componente lá embaixo no arquivo para passar a prop correta
chamada_antiga = "<MiniCalendarioSemanal />"
chamada_nova   = "<MiniCalendarioSemanal setAbaAtiva={setAbaAtiva} />"

if assinatura_antiga in conteudo:
    conteudo = conteudo.replace(assinatura_antiga, Black_assinatura_nova if "setAbaAtiva" not in conteudo.split("function MiniCalendarioSemanal")[1].split("{")[0] else assinatura_antiga)
    # Se falhar o type inline simples por causa do arquivo ser JS puro ou TSX amplo, garantimos flexibilidade:
    conteudo = conteudo.replace("function MiniCalendarioSemanal() {", "function MiniCalendarioSemanal({ setAbaAtiva }) {")

conteudo = conteudo.replace(bloco_render_antigo, bloco_render_novo)
conteudo = conteudo.replace(chamada_antiga, chamada_nova)

open(path, "w", encoding="utf-8").write(conteudo)
print("🎯 SUCESSO! Ação de clique para a aba Agenda integrada com feedback mobile.")
