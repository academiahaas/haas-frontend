import os
from motor_voz import gerar_voz_exercicio

# Seus exercícios reais da Haas Academy
atividades = {
    "exercicio_1.mp3": "Bem-vindo ao exercício um. Selecione a alternativa correta de acordo com o texto.",
    "exercicio_2.mp3": "Exercício dois. Ouça a frase com atenção e complete a lacuna que falta.",
    "exercicio_3.mp3": "Parabéns por chegar ao exercício três. Esta é a sua última atividade desta etapa."
}

print("="*60)
print("GERANDO ÁUDIOS DOS EXERCÍCIOS COM A SUA VOZ REAL...")
print("="*60)

for nome_arquivo, texto in atividades.items():
    print(f"\n→ Processando: {nome_arquivo}")
    link = gerar_voz_exercicio(texto, nome_arquivo)
    if link:
        print(f"✓ Disponível em: {link}")

print("\n" + "="*60)
print("✓ TODOS OS ÁUDIOS FORAM CRIADOS NA PASTA PÚBLICA!")
print("="*60)
