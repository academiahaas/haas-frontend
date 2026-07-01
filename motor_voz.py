import os
from elevenlabs.client import ElevenLabs

# Lê da variável de sistema ou do arquivo de ambiente
API_KEY = os.getenv("ELEVENLABS_API_KEY", "sk_8689c1295270e171090862f89f6a31d0c0053a6f361d85e8")
VOICE_ID = "316seTHdsJUJ9ttjQN2d"
MODEL_ID = "eleven_turbo_v2_5"

client = ElevenLabs(api_key=API_KEY)

def gerar_voz_exercicio(texto, nome_arquivo_saida="audio_exercicio.mp3"):
    try:
        pasta_destino = "/var/www/haas-frontend"
        caminho_final = os.path.join(pasta_destino, nome_arquivo_saida)
        
        audio_generator = client.text_to_speech.convert(
            text=texto,
            voice_id=VOICE_ID,
            model_id=MODEL_ID
        )
        
        with open(caminho_final, "wb") as f:
            for chunk in audio_generator:
                f.write(chunk)
                
        return f"http://109.123.246.96:8080/{nome_arquivo_saida}"
    except Exception as e:
        return None
