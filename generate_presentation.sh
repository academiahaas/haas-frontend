#!/bin/bash

TOPICO_AULA="$1"
IDIOMA_AULA="$2"

if [ -z "$TOPICO_AULA" ] || [ -z "$IDIOMA_AULA" ]; then
  echo "Uso correto: ./generate_presentation.sh \"<Tópico da Aula>\" \"<Idioma>\""
  echo "Exemplo: ./generate_presentation.sh \"Passado Composto\" \"Espanhol\""
  exit 1
fi

echo "🚀 Gerando apresentação Haas Academy para o tópico: $TOPICO_AULA ($IDIOMA_AULA)..."

# Comando de execução via CLI do Presenton
presenton generate \
  --system-prompt-file="./haas_system_prompt.txt" \
  --theme-css="./haas-theme.css" \
  --prompt "Crie uma aula completa de $IDIOMA_AULA sobre $TOPICO_AULA seguindo rigorosamente a estrutura de 18 slides." \
  --output "./aula_${TOPICO_AULA// /_}.pdf"

echo "✅ Apresentação gerada com sucesso em: ./aula_${TOPICO_AULA// /_}.pdf"
