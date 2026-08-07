path = '/var/www/haas-frontend-desk-mobile-oficial/src/app/portal-aluno/components/ArenaQuiz.tsx'

with open(path, 'r', encoding='utf-8') as f:
    code = f.read()

# Garante que o estado de exibição pule o clique do baú e vá direto para a tela de análise macro
code = code.replace("!caixaAberta ?", "false ?")

with open(path, 'w', encoding='utf-8') as f:
    f.write(code)

print("ARQUITETURA DE ESCALA GLOBAL APLICADA NO MOTOR CENTRAL.")
